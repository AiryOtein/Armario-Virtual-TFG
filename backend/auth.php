<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$conn = new mysqli("localhost", "root", "", "armario");
if ($conn->connect_error) { http_response_code(500); echo json_encode(["error" => "Error de conexión"]); exit; }
$conn->set_charset("utf8mb4");

$action = $_GET['action'] ?? '';

if ($action === 'register' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $body     = json_decode(file_get_contents("php://input"), true);
    $nombre   = trim($body['nombre']   ?? '');
    $email    = trim($body['email']    ?? '');
    $password = trim($body['password'] ?? '');

    if (!$nombre || !$email || !$password) { echo json_encode(["error" => "Todos los campos son obligatorios"]); exit; }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { echo json_encode(["error" => "Email no válido"]); exit; }
    if (strlen($password) < 6) { echo json_encode(["error" => "La contraseña debe tener al menos 6 caracteres"]); exit; }

    $stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) { echo json_encode(["error" => "Este email ya está registrado"]); exit; }

    $hash  = password_hash($password, PASSWORD_DEFAULT);
    $token = bin2hex(random_bytes(32));

    $stmt = $conn->prepare("INSERT INTO usuarios (nombre, email, password, token) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $nombre, $email, $hash, $token);
    $stmt->execute();

    echo json_encode(["ok" => true, "id" => $conn->insert_id, "nombre" => $nombre, "token" => $token]);
    exit;
}

if ($action === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $body     = json_decode(file_get_contents("php://input"), true);
    $email    = trim($body['email']    ?? '');
    $password = trim($body['password'] ?? '');

    if (!$email || !$password) { echo json_encode(["error" => "Completa todos los campos"]); exit; }

    $stmt = $conn->prepare("SELECT id, nombre, password FROM usuarios WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();

    if (!$user || !password_verify($password, $user['password'])) {
        echo json_encode(["error" => "Email o contraseña incorrectos"]); exit;
    }

    $token = bin2hex(random_bytes(32));
    $stmt  = $conn->prepare("UPDATE usuarios SET token = ? WHERE id = ?");
    $stmt->bind_param("si", $token, $user['id']);
    $stmt->execute();

    echo json_encode(["ok" => true, "id" => $user['id'], "nombre" => $user['nombre'], "token" => $token]);
    exit;
}

if ($action === 'logout' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = getBearerToken();
    if ($token) {
        $stmt = $conn->prepare("UPDATE usuarios SET token = NULL WHERE token = ?");
        $stmt->bind_param("s", $token);
        $stmt->execute();
    }
    echo json_encode(["ok" => true]);
    exit;
}

if ($action === 'sesion') {
    $token = getBearerToken();
    if (!$token) { echo json_encode(["ok" => false]); exit; }

    $stmt = $conn->prepare("SELECT id, nombre FROM usuarios WHERE token = ?");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();

    if ($user) {
        echo json_encode(["ok" => true, "id" => $user['id'], "nombre" => $user['nombre']]);
    } else {
        echo json_encode(["ok" => false]);
    }
    exit;
}

http_response_code(404);
echo json_encode(["error" => "Acción no encontrada"]);

function getBearerToken() {
    $headers = getallheaders();
    $auth    = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (str_starts_with($auth, 'Bearer ')) return substr($auth, 7);
    return null;
}