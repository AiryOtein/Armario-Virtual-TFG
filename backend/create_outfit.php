<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "armario");

$data = json_decode(file_get_contents("php://input"), true);

$nombre = $conn->real_escape_string($data['nombre']);
$prendas = $data['prendas'];

$conn->query("INSERT INTO outfits (nombre) VALUES ('$nombre')");
$outfit_id = $conn->insert_id;

foreach ($prendas as $p) {
  $pid = intval($p);
  $conn->query("INSERT INTO outfit_prendas (outfit_id, prenda_id) VALUES ($outfit_id, $pid)");
}

echo json_encode(["ok" => true]);
?>