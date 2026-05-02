<?php
$conn = new mysqli("localhost", "root", "", "armario");

$id = $_GET['id'];
$cajon = $_GET['cajon'];

$conn->query("UPDATE prendas SET cajon='$cajon' WHERE id=$id");

echo "ok";
?>