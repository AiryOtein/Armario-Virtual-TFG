<?php
header("Access-Control-Allow-Origin: *");

$conn = new mysqli("localhost", "root", "", "armario");

$id = intval($_GET['id']);

$conn->query("DELETE FROM prendas WHERE id=$id");

echo "ok";
?>