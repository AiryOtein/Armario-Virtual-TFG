<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "armario");

$sql = "
SELECT o.id as outfit_id, o.nombre, p.*
FROM outfits o
JOIN outfit_prendas op ON o.id = op.outfit_id
JOIN prendas p ON p.id = op.prenda_id
ORDER BY o.id DESC
";

$result = $conn->query($sql);

$outfits = [];

while ($row = $result->fetch_assoc()) {
  $id = $row['outfit_id'];

  if (!isset($outfits[$id])) {
    $outfits[$id] = [
      "id" => $id,
      "nombre" => $row["nombre"],
      "prendas" => []
    ];
  }

  $outfits[$id]["prendas"][] = $row;
}

echo json_encode(array_values($outfits));
?>