<?php
$conn = new mysqli("localhost", "root", "", "armario");

$cajon = $_GET['cajon'];

$conn->query("DELETE FROM prendas WHERE cajon='$cajon'");

echo "ok";
?>