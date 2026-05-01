<?php
header("Access-Control-Allow-Origin: *");

include "db.php";

$cajon = $conn->real_escape_string($_GET['cajon']);

$conn->query("DELETE FROM prendas WHERE cajon='$cajon'");

echo "ok";
?>