const URL = "http://localhost/armario/backend";

export const getPrendas = async () => {
  const res = await fetch(`${URL}/get_prendas.php`);
  return res.json();
};

export const getFavoritos = async () => {
  const res = await fetch(`${URL}/get_favoritos.php`);
  return res.json();
};

export const crearOutfit = async (nombre, prendas) => {
  const data = new FormData();
  data.append("nombre", nombre);
  prendas.forEach(p => data.append("prendas[]", p));

  await fetch(`${URL}/crear_outfit.php`, {
    method: "POST",
    body: data
  });
};

export const getOutfits = async () => {
  const res = await fetch(`${URL}/get_outfits.php`);
  return res.json();
};
