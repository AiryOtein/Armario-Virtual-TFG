<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "armario");

$result = $conn->query("SELECT * FROM prendas");

$prendas = [];

while ($row = $result->fetch_assoc()) {
    $prendas[] = $row;
}

echo json_encode($prendas);
?>