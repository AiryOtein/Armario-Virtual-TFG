<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$nombre = $data["nombre"];
$tipo = $data["tipo"];
$color = $data["color"];
$talla = $data["talla"];

$sql = "INSERT INTO prendas (nombre, tipo, color, talla)
        VALUES ('$nombre', '$tipo', '$color', '$talla')";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["status" => "ok"]);
} else {
    echo json_encode(["status" => "error"]);
}
?>