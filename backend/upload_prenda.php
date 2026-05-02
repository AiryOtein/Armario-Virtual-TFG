<?php
header("Access-Control-Allow-Origin: *");

$conn = new mysqli("localhost", "root", "", "armario");

$nombre = $_POST['nombre'];
$tipo = $_POST['tipo'];
$color = $_POST['color'];
$talla = $_POST['talla'];
$marca = $_POST['marca'];
$cajon = $_POST['cajon'];

$imagen = $_FILES['imagen']['name'];
$ruta = "../uploads/" . $imagen;

move_uploaded_file($_FILES['imagen']['tmp_name'], $ruta);

$conn->query("INSERT INTO prendas (nombre, tipo, color, talla, marca, cajon, imagen)
VALUES ('$nombre','$tipo','$color','$talla','$marca','$cajon','$imagen')");

echo "ok";
?>