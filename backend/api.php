<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$conn = new mysqli("localhost", "root", "", "armario");
if ($conn->connect_error) { http_response_code(500); echo json_encode(["error" => "Error de conexión"]); exit; }
$conn->set_charset("utf8mb4");

$headers = getallheaders();
$auth    = $headers['Authorization'] ?? $headers['authorization'] ?? '';
$token   = str_starts_with($auth, 'Bearer ') ? substr($auth, 7) : null;

if (!$token) { http_response_code(401); echo json_encode(["error" => "No autenticado"]); exit; }

$stmt = $conn->prepare("SELECT id FROM usuarios WHERE token = ?");
$stmt->bind_param("s", $token);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if (!$user) { http_response_code(401); echo json_encode(["error" => "Token inválido"]); exit; }

$uid      = (int) $user['id'];
$method   = $_SERVER['REQUEST_METHOD'];
$resource = $_GET['resource'] ?? '';
$id       = isset($_GET['id']) ? intval($_GET['id']) : null;

match ($resource) {
    'prendas' => handlePrendas($conn, $method, $id, $uid),
    'outfits' => handleOutfits($conn, $method, $id, $uid),
    'cajones' => handleCajones($conn, $method, $id, $uid),
    default   => jsonError(404, "Recurso no encontrado")
};

$conn->close();

function handlePrendas($conn, $method, $id, $uid) {

    if ($method === 'GET') {
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM prendas WHERE id = ? AND usuario_id = ?");
            $stmt->bind_param("ii", $id, $uid);
            $stmt->execute();
            echo json_encode($stmt->get_result()->fetch_assoc() ?: []);
            return;
        }

        if (isset($_GET['favoritos'])) {
            $stmt = $conn->prepare("SELECT * FROM prendas WHERE favorito = 1 AND usuario_id = ? ORDER BY nombre");
            $stmt->bind_param("i", $uid);
            $stmt->execute();
            echo json_encode(fetchAll($stmt->get_result()));
            return;
        }

        if (isset($_GET['cajon'])) {
            $cajon = $_GET['cajon'];
            $stmt  = $conn->prepare("SELECT * FROM prendas WHERE cajon = ? AND usuario_id = ? ORDER BY nombre");
            $stmt->bind_param("si", $cajon, $uid);
            $stmt->execute();
            echo json_encode(fetchAll($stmt->get_result()));
            return;
        }

        $where  = ["usuario_id = ?"];
        $params = [$uid];
        $types  = "i";

        if (!empty($_GET['color']))    { $where[] = "color LIKE ?";  $params[] = "%{$_GET['color']}%";    $types .= "s"; }
        if (!empty($_GET['talla']))    { $where[] = "talla = ?";      $params[] = $_GET['talla'];           $types .= "s"; }
        if (!empty($_GET['marca']))    { $where[] = "marca LIKE ?";   $params[] = "%{$_GET['marca']}%";    $types .= "s"; }
        if (!empty($_GET['busqueda'])) { $where[] = "nombre LIKE ?";  $params[] = "%{$_GET['busqueda']}%"; $types .= "s"; }

        $sql  = "SELECT * FROM prendas WHERE " . implode(" AND ", $where) . " ORDER BY nombre";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        echo json_encode(fetchAll($stmt->get_result()));
        return;
    }

    if ($method === 'POST') {
        $campos = ['nombre','tipo','color','talla','marca','cajon'];
        foreach ($campos as $c) {
            if (empty($_POST[$c])) { jsonError(400, "Falta el campo: $c"); return; }
        }
        if (empty($_FILES['imagen'])) { jsonError(400, "Falta la imagen"); return; }

        $uploadsBase = __DIR__ . "/../uploads/user_" . $uid;
        if (!is_dir($uploadsBase)) mkdir($uploadsBase, 0755, true);

        $imagen = time() . "_" . basename($_FILES['imagen']['name']);
        $ruta   = $uploadsBase . "/" . $imagen;
        $rutaDB = "user_" . $uid . "/" . $imagen;

        if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $ruta)) {
            jsonError(500, "Error al subir la imagen"); return;
        }

        $stmt = $conn->prepare(
            "INSERT INTO prendas (nombre, tipo, color, talla, marca, cajon, imagen, favorito, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)"
        );
        $stmt->bind_param("sssssssi", $_POST['nombre'], $_POST['tipo'], $_POST['color'], $_POST['talla'], $_POST['marca'], $_POST['cajon'], $rutaDB, $uid);

        if ($stmt->execute()) {
            echo json_encode(["ok" => true, "id" => $conn->insert_id]);
        } else {
            jsonError(500, "Error al guardar la prenda");
        }
        return;
    }

    if ($method === 'PUT') {
        if (!$id) { jsonError(400, "Falta el id"); return; }
        $body = json_decode(file_get_contents("php://input"), true);
        if (!$body) { jsonError(400, "Cuerpo inválido"); return; }

        $permitidos = ['nombre','tipo','color','talla','marca','cajon','favorito'];
        $sets = []; $params = []; $types = "";

        foreach ($permitidos as $campo) {
            if (array_key_exists($campo, $body)) {
                $sets[]   = "$campo = ?";
                $params[] = $body[$campo];
                $types   .= "s";
            }
        }

        if (!$sets) { jsonError(400, "No hay nada que actualizar"); return; }

        $params[] = $id;
        $params[] = $uid;
        $types   .= "ii";

        $stmt = $conn->prepare("UPDATE prendas SET " . implode(", ", $sets) . " WHERE id = ? AND usuario_id = ?");
        $stmt->bind_param($types, ...$params);
        echo json_encode(["ok" => $stmt->execute()]);
        return;
    }

    if ($method === 'DELETE') {
        if (!$id) { jsonError(400, "Falta el id"); return; }

        $stmt = $conn->prepare("SELECT imagen FROM prendas WHERE id = ? AND usuario_id = ?");
        $stmt->bind_param("ii", $id, $uid);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        if ($row && $row['imagen']) {
            $ruta = __DIR__ . "/../uploads/" . $row['imagen'];
            if (file_exists($ruta)) unlink($ruta);
        }

        $stmt = $conn->prepare("DELETE FROM prendas WHERE id = ? AND usuario_id = ?");
        $stmt->bind_param("ii", $id, $uid);
        echo json_encode(["ok" => $stmt->execute()]);
        return;
    }

    jsonError(405, "Método no permitido");
}

function handleOutfits($conn, $method, $id, $uid) {

    if ($method === 'GET') {
        $stmt = $conn->prepare("
            SELECT o.id as outfit_id, o.nombre as outfit_nombre, p.*
            FROM outfits o
            JOIN outfit_prendas op ON o.id = op.outfit_id
            JOIN prendas p ON p.id = op.prenda_id
            WHERE o.usuario_id = ?
            ORDER BY o.id DESC
        ");
        $stmt->bind_param("i", $uid);
        $stmt->execute();
        $result  = $stmt->get_result();
        $outfits = [];

        while ($row = $result->fetch_assoc()) {
            $oid = $row['outfit_id'];
            if (!isset($outfits[$oid])) {
                $outfits[$oid] = ["id" => $oid, "nombre" => $row['outfit_nombre'], "prendas" => []];
            }
            unset($row['outfit_id'], $row['outfit_nombre']);
            $outfits[$oid]['prendas'][] = $row;
        }

        echo json_encode(array_values($outfits));
        return;
    }

    if ($method === 'POST') {
        $body = json_decode(file_get_contents("php://input"), true);
        if (empty($body['nombre']))  { jsonError(400, "Falta el nombre"); return; }
        if (empty($body['prendas'])) { jsonError(400, "Selecciona al menos una prenda"); return; }

        $stmt = $conn->prepare("INSERT INTO outfits (nombre, usuario_id) VALUES (?, ?)");
        $stmt->bind_param("si", $body['nombre'], $uid);
        $stmt->execute();
        $outfit_id = $conn->insert_id;

        $stmt2 = $conn->prepare("INSERT INTO outfit_prendas (outfit_id, prenda_id) VALUES (?, ?)");
        foreach ($body['prendas'] as $pid) {
            $pid = intval($pid);
            $stmt2->bind_param("ii", $outfit_id, $pid);
            $stmt2->execute();
        }

        echo json_encode(["ok" => true, "id" => $outfit_id]);
        return;
    }

    if ($method === 'PUT') {
        if (!$id) { jsonError(400, "Falta el id"); return; }
        $body = json_decode(file_get_contents("php://input"), true);

        if (!empty($body['nombre'])) {
            $stmt = $conn->prepare("UPDATE outfits SET nombre = ? WHERE id = ? AND usuario_id = ?");
            $stmt->bind_param("sii", $body['nombre'], $id, $uid);
            $stmt->execute();
        }

        if (isset($body['prendas']) && is_array($body['prendas'])) {
            $del = $conn->prepare("DELETE FROM outfit_prendas WHERE outfit_id = ?");
            $del->bind_param("i", $id);
            $del->execute();

            $ins = $conn->prepare("INSERT INTO outfit_prendas (outfit_id, prenda_id) VALUES (?, ?)");
            foreach ($body['prendas'] as $pid) {
                $pid = intval($pid);
                $ins->bind_param("ii", $id, $pid);
                $ins->execute();
            }
        }

        echo json_encode(["ok" => true]);
        return;
    }

    if ($method === 'DELETE') {
        if (!$id) { jsonError(400, "Falta el id"); return; }

        $stmt = $conn->prepare("DELETE FROM outfit_prendas WHERE outfit_id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();

        $stmt2 = $conn->prepare("DELETE FROM outfits WHERE id = ? AND usuario_id = ?");
        $stmt2->bind_param("ii", $id, $uid);
        echo json_encode(["ok" => $stmt2->execute()]);
        return;
    }

    jsonError(405, "Método no permitido");
}

function handleCajones($conn, $method, $id, $uid) {

    if ($method === 'GET') {
        $stmt = $conn->prepare("SELECT nombre FROM cajones WHERE usuario_id = ? ORDER BY nombre");
        $stmt->bind_param("i", $uid);
        $stmt->execute();
        $guardados        = fetchAll($stmt->get_result());
        $nombresGuardados = array_column($guardados, 'nombre');

        $stmt2 = $conn->prepare("SELECT cajon as nombre, COUNT(*) as cantidad FROM prendas WHERE cajon IS NOT NULL AND cajon != '' AND usuario_id = ? GROUP BY cajon");
        $stmt2->bind_param("i", $uid);
        $stmt2->execute();
        $conPrendas    = fetchAll($stmt2->get_result());
        $conPrendasMap = array_column($conPrendas, 'cantidad', 'nombre');

        $todos = array_unique(array_merge($nombresGuardados, array_column($conPrendas, 'nombre')));
        sort($todos);

        echo json_encode(array_map(fn($n) => ['nombre' => $n, 'cantidad' => $conPrendasMap[$n] ?? 0], $todos));
        return;
    }

    if ($method === 'POST') {
        $body   = json_decode(file_get_contents("php://input"), true);
        $nombre = trim($body['nombre'] ?? '');
        if (!$nombre) { jsonError(400, "Falta el nombre"); return; }

        $stmt = $conn->prepare("INSERT IGNORE INTO cajones (nombre, usuario_id) VALUES (?, ?)");
        $stmt->bind_param("si", $nombre, $uid);
        echo json_encode(["ok" => $stmt->execute()]);
        return;
    }

    if ($method === 'DELETE') {
        $cajon = $_GET['cajon'] ?? '';
        if (!$cajon) { jsonError(400, "Falta el nombre del cajón"); return; }

        $stmt = $conn->prepare("DELETE FROM cajones WHERE nombre = ? AND usuario_id = ?");
        $stmt->bind_param("si", $cajon, $uid);
        $stmt->execute();

        $stmt2 = $conn->prepare("UPDATE prendas SET cajon = NULL WHERE cajon = ? AND usuario_id = ?");
        $stmt2->bind_param("si", $cajon, $uid);
        echo json_encode(["ok" => $stmt2->execute()]);
        return;
    }

    jsonError(405, "Método no permitido");
}

function fetchAll($result): array {
    $rows = [];
    while ($row = $result->fetch_assoc()) $rows[] = $row;
    return $rows;
}

function jsonError(int $code, string $msg): void {
    http_response_code($code);
    echo json_encode(["error" => $msg]);
}