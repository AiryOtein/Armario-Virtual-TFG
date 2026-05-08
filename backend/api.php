<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);
$conn = new mysqli("localhost", "root", "", "armario");
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión"]);
    exit;
}
$conn->set_charset("utf8mb4");
$method   = $_SERVER['REQUEST_METHOD'];
$resource = $_GET['resource'] ?? '';  
$id       = isset($_GET['id']) ? intval($_GET['id']) : null;

match ($resource) {
    'prendas' => handlePrendas($conn, $method, $id),
    'outfits' => handleOutfits($conn, $method, $id),
    'cajones' => handleCajones($conn, $method, $id),
    default   => jsonError(404, "Recurso no encontrado")
};

$conn->close();
function handlePrendas($conn, $method, $id) {

    if ($method === 'GET') {

        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM prendas WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result()->fetch_assoc();
            echo json_encode($result ?: []);
            return;
        }

        if (isset($_GET['favoritos'])) {
            $result = $conn->query("SELECT * FROM prendas WHERE favorito = 1 ORDER BY nombre");
            echo json_encode(fetchAll($result));
            return;
        }

        if (isset($_GET['cajon'])) {
            $cajon = $_GET['cajon'];
            $stmt  = $conn->prepare("SELECT * FROM prendas WHERE cajon = ? ORDER BY nombre");
            $stmt->bind_param("s", $cajon);
            $stmt->execute();
            echo json_encode(fetchAll($stmt->get_result()));
            return;
        }

        $where  = [];
        $params = [];
        $types  = "";

        if (!empty($_GET['color']))    { $where[] = "color LIKE ?";  $params[] = "%{$_GET['color']}%";   $types .= "s"; }
        if (!empty($_GET['talla']))    { $where[] = "talla = ?";      $params[] = $_GET['talla'];          $types .= "s"; }
        if (!empty($_GET['marca']))    { $where[] = "marca LIKE ?";   $params[] = "%{$_GET['marca']}%";   $types .= "s"; }
        if (!empty($_GET['busqueda'])) { $where[] = "nombre LIKE ?";  $params[] = "%{$_GET['busqueda']}%"; $types .= "s"; }

        $sql = "SELECT * FROM prendas";
        if ($where) $sql .= " WHERE " . implode(" AND ", $where);
        $sql .= " ORDER BY nombre";

        if ($params) {
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            echo json_encode(fetchAll($stmt->get_result()));
        } else {
            echo json_encode(fetchAll($conn->query($sql)));
        }
        return;
    }

    if ($method === 'POST') {
        $campos = ['nombre','tipo','color','talla','marca','cajon'];
        foreach ($campos as $c) {
            if (empty($_POST[$c])) { jsonError(400, "Falta el campo: $c"); return; }
        }
        if (empty($_FILES['imagen'])) { jsonError(400, "Falta la imagen"); return; }

        $imagen = time() . "_" . basename($_FILES['imagen']['name']);
        $ruta   = "../uploads/" . $imagen;

        if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $ruta)) {
            jsonError(500, "Error al subir la imagen"); return;
        }

        $stmt = $conn->prepare(
            "INSERT INTO prendas (nombre, tipo, color, talla, marca, cajon, imagen, favorito)
             VALUES (?, ?, ?, ?, ?, ?, ?, 0)"
        );
        $stmt->bind_param(
            "sssssss",
            $_POST['nombre'], $_POST['tipo'], $_POST['color'],
            $_POST['talla'],  $_POST['marca'], $_POST['cajon'], $imagen
        );

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
        if (!$body)  { jsonError(400, "Cuerpo inválido"); return; }

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
        $types   .= "i";

        $stmt = $conn->prepare("UPDATE prendas SET " . implode(", ", $sets) . " WHERE id = ?");
        $stmt->bind_param($types, ...$params);

        if ($stmt->execute()) {
            echo json_encode(["ok" => true]);
        } else {
            jsonError(500, "Error al actualizar");
        }
        return;
    }

    if ($method === 'DELETE') {
        if (!$id) { jsonError(400, "Falta el id"); return; }

        $stmt = $conn->prepare("SELECT imagen FROM prendas WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        if ($row && $row['imagen']) {
            $ruta = "../uploads/" . $row['imagen'];
            if (file_exists($ruta)) unlink($ruta);
        }

        $stmt = $conn->prepare("DELETE FROM prendas WHERE id = ?");
        $stmt->bind_param("i", $id);
        echo json_encode(["ok" => $stmt->execute()]);
        return;
    }

    jsonError(405, "Método no permitido");
}

function handleOutfits($conn, $method, $id) {

    if ($method === 'GET') {
        $sql = "
            SELECT o.id as outfit_id, o.nombre as outfit_nombre, p.*
            FROM outfits o
            JOIN outfit_prendas op ON o.id = op.outfit_id
            JOIN prendas p ON p.id = op.prenda_id
            ORDER BY o.id DESC
        ";
        $result  = $conn->query($sql);
        $outfits = [];

        while ($row = $result->fetch_assoc()) {
            $oid = $row['outfit_id'];
            if (!isset($outfits[$oid])) {
                $outfits[$oid] = [
                    "id"      => $oid,
                    "nombre"  => $row['outfit_nombre'],
                    "prendas" => []
                ];
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

        $stmt = $conn->prepare("INSERT INTO outfits (nombre) VALUES (?)");
        $stmt->bind_param("s", $body['nombre']);
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

    if ($method === 'DELETE') {
        if (!$id) { jsonError(400, "Falta el id"); return; }

        $conn->prepare("DELETE FROM outfit_prendas WHERE outfit_id = ?")->bind_param("i", $id) && true;
        $stmt = $conn->prepare("DELETE FROM outfit_prendas WHERE outfit_id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();

        $stmt2 = $conn->prepare("DELETE FROM outfits WHERE id = ?");
        $stmt2->bind_param("i", $id);
        echo json_encode(["ok" => $stmt2->execute()]);
        return;
    }

    jsonError(405, "Método no permitido");
}

function handleCajones($conn, $method, $id) {

    if ($method === 'GET') {
        $guardados = fetchAll($conn->query("SELECT nombre FROM cajones ORDER BY nombre"));
        $nombresGuardados = array_column($guardados, 'nombre');

        $conPrendas = fetchAll($conn->query(
            "SELECT cajon as nombre, COUNT(*) as cantidad FROM prendas
             WHERE cajon IS NOT NULL AND cajon != '' GROUP BY cajon"
        ));
        $conPrendasMap = array_column($conPrendas, 'cantidad', 'nombre');

        $todos = array_unique(array_merge($nombresGuardados, array_column($conPrendas, 'nombre')));
        sort($todos);

        $resultado = array_map(fn($n) => [
            'nombre'   => $n,
            'cantidad' => $conPrendasMap[$n] ?? 0
        ], $todos);

        echo json_encode($resultado);
        return;
    }

    if ($method === 'POST') {
        $body  = json_decode(file_get_contents("php://input"), true);
        $nombre = trim($body['nombre'] ?? '');
        if (!$nombre) { jsonError(400, "Falta el nombre"); return; }

        $stmt = $conn->prepare("INSERT IGNORE INTO cajones (nombre) VALUES (?)");
        $stmt->bind_param("s", $nombre);
        echo json_encode(["ok" => $stmt->execute()]);
        return;
    }

    if ($method === 'DELETE') {
        $cajon = $_GET['cajon'] ?? '';
        if (!$cajon) { jsonError(400, "Falta el nombre del cajón"); return; }

        $stmt = $conn->prepare("DELETE FROM cajones WHERE nombre = ?");
        $stmt->bind_param("s", $cajon);
        $stmt->execute();

        $stmt2 = $conn->prepare("UPDATE prendas SET cajon = NULL WHERE cajon = ?");
        $stmt2->bind_param("s", $cajon);
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