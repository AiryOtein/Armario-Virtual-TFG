<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "armario");

$id = $_GET['id'];
$fav = $_GET['fav'];

$conn->query("UPDATE prendas SET favorito=$fav WHERE id=$id");

echo json_encode(["ok" => true]);
?>