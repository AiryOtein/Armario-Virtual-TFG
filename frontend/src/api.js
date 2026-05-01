const URL = "http://localhost/armario/backend";

export const getPrendas = async () => {
  const res = await fetch(`${URL}/get_prendas.php`);
  return res.json();
};

export const addPrenda = async (formData) => {
  await fetch(`${URL}/upload_prenda.php`, {
    method: "POST",
    body: formData,
  });
};

export const deletePrenda = async (id) => {
  await fetch(`${URL}/delete_prenda.php?id=${id}`);
};

export const deleteCajon = async (cajon) => {
  await fetch(`${URL}/delete_cajon.php?cajon=${encodeURIComponent(cajon)}`);
};