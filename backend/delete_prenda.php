<?php
header("Access-Control-Allow-Origin: *");

include "db.php";

$id = intval($_GET['id']);

$conn->query("DELETE FROM prendas WHERE id=$id");

echo "ok";
?>