const API = "http://localhost/armario/backend/api.php";

export const getPrendas = async (filtros = {}) => {
  const params = new URLSearchParams({ resource: "prendas", ...filtros });
  const res = await fetch(`${API}?${params}`);
  return res.json();
};

export const getFavoritos = async () => {
  const res = await fetch(`${API}?resource=prendas&favoritos=1`);
  return res.json();
};

export const addPrenda = async (formData) => {
  const res = await fetch(`${API}?resource=prendas`, {
    method: "POST",
    body: formData,
  });
  return res.json();
};

/**
 * @param {number} id
 * @param {object} campos
 */

export const updatePrenda = async (id, campos) => {
  const res = await fetch(`${API}?resource=prendas&id=${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(campos),
  });
  return res.json();
};

export const deletePrenda = async (id) => {
  const res = await fetch(`${API}?resource=prendas&id=${id}`, { method: "DELETE" });
  return res.json();
};

export const getOutfits = async () => {
  const res = await fetch(`${API}?resource=outfits`);
  return res.json();
};

/**
 * @param {string} nombre
 * @param {number[]} prendas
 */

export const crearOutfit = async (nombre, prendas) => {
  const res = await fetch(`${API}?resource=outfits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, prendas }),
  });
  return res.json();
};

export const deleteOutfit = async (id) => {
  const res = await fetch(`${API}?resource=outfits&id=${id}`, { method: "DELETE" });
  return res.json();
};

export const getCajones = async () => {
  const res = await fetch(`${API}?resource=cajones`);
  return res.json();
};
export const crearCajon = async (nombre) => {
  const res = await fetch(`${API}?resource=cajones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre }),
  });
  return res.json();
};

export const deleteCajon = async (cajon) => {
  const params = new URLSearchParams({ resource: "cajones", cajon });
  const res = await fetch(`${API}?${params}`, { method: "DELETE" });
  return res.json();
};