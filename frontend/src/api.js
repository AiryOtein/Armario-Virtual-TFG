const URL = "http://localhost/armario";

export const getPrendas = async () => {
  const res = await fetch(`${URL}/get_prendas.php`);
  return res.json();
};

export const addPrenda = async (prenda) => {
  await fetch(`${URL}/add_prenda.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prenda),
  });
};