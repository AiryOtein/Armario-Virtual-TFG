<?php
error_reporting(0);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

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

$conn->query("INSERT INTO prendas (nombre,tipo,color,talla,marca,cajon,imagen)
VALUES ('$nombre','$tipo','$color','$talla','$marca','$cajon','$imagen')");

echo json_encode(["ok" => true]);