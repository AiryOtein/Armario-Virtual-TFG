<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "armario");

$id = intval($_GET['id']);

$conn->query("DELETE FROM prendas WHERE id=$id");

echo json_encode(["ok" => true]);
?>