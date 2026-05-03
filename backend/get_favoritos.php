<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "armario");

if ($conn->connect_error) {
  echo json_encode([]);
  exit;
}

$result = $conn->query("SELECT * FROM prendas WHERE favorito=1");

$data = [];

if ($result) {
  while ($row = $result->fetch_assoc()) {
    $data[] = $row;
  }
}

echo json_encode($data);
?>