<?php
$conn = new mysqli("localhost", "root", "", "armario");

$id = $_GET['id'];

$conn->query("DELETE FROM prendas WHERE id=$id");

echo "ok";
?>