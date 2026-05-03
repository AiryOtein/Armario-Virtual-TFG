<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$conn = new mysqli("localhost", "root", "", "armario");

if ($conn->connect_error) {
    echo json_encode(["error" => "db"]);
    exit;
}

$nombre = $_POST['nombre'] ?? '';
$tipo = $_POST['tipo'] ?? '';
$color = $_POST['color'] ?? '';
$talla = $_POST['talla'] ?? '';
$marca = $_POST['marca'] ?? '';
$cajon = $_POST['cajon'] ?? '';

if (!$nombre || !$tipo || !$color || !$talla || !$cajon) {
    echo json_encode(["error" => "missing_fields"]);
    exit;
}

if (!isset($_FILES['imagen'])) {
    echo json_encode(["error" => "no_image"]);
    exit;
}

$imagen = time() . "_" . $_FILES['imagen']['name'];
$ruta = "../uploads/" . $imagen;

if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $ruta)) {
    echo json_encode(["error" => "upload_fail"]);
    exit;
}

$sql = "INSERT INTO prendas (nombre,tipo,color,talla,marca,cajon,imagen,favorito)
VALUES ('$nombre','$tipo','$color','$talla','$marca','$cajon','$imagen',0)";

if (!$conn->query($sql)) {
    echo json_encode(["error" => "sql", "detalle" => $conn->error]);
    exit;
}

echo json_encode(["ok" => true]);
$conn->close();
?>