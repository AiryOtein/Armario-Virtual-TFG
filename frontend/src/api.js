const API  = "http://localhost/armario/backend/api.php";
const AUTH = "http://localhost/armario/backend/auth.php";

const getToken = () => localStorage.getItem("armario_token") || "";

const authHeaders = () => ({ "Authorization": `Bearer ${getToken()}`, "Content-Type": "application/json" });
const authHeadersFile = () => ({ "Authorization": `Bearer ${getToken()}` });

const get  = (url)        => fetch(url, { headers: authHeaders() }).then((r) => r.json());
const del  = (url)        => fetch(url, { method: "DELETE", headers: authHeaders() }).then((r) => r.json());
const post = (url, body)  => fetch(url, { method: "POST", headers: authHeaders(), body: JSON.stringify(body) }).then((r) => r.json());
const put  = (url, body)  => fetch(url, { method: "PUT",  headers: authHeaders(), body: JSON.stringify(body) }).then((r) => r.json());
const postFile = (url, formData) => fetch(url, { method: "POST", headers: authHeadersFile(), body: formData }).then((r) => r.json());

export const getSesion = () => get(`${AUTH}?action=sesion`);
export const login     = (form) => fetch(`${AUTH}?action=login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }).then((r) => r.json());
export const register  = (form) => fetch(`${AUTH}?action=register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }).then((r) => r.json());
export const logout    = () => fetch(`${AUTH}?action=logout`, { method: "POST", headers: authHeaders() }).then((r) => r.json());

export const getPrendas   = (filtros = {}) => get(`${API}?resource=prendas&${new URLSearchParams(filtros)}`);
export const getFavoritos = ()             => get(`${API}?resource=prendas&favoritos=1`);
export const addPrenda    = (formData)     => postFile(`${API}?resource=prendas`, formData);
export const updatePrenda = (id, campos)   => put(`${API}?resource=prendas&id=${id}`, campos);
export const deletePrenda = (id)           => del(`${API}?resource=prendas&id=${id}`);

export const getOutfits   = ()                    => get(`${API}?resource=outfits`);
export const crearOutfit  = (nombre, prendas)     => post(`${API}?resource=outfits`, { nombre, prendas });
export const updateOutfit = (id, nombre, prendas) => put(`${API}?resource=outfits&id=${id}`, { nombre, prendas });
export const deleteOutfit = (id)                  => del(`${API}?resource=outfits&id=${id}`);

export const getCajones  = ()       => get(`${API}?resource=cajones`);
export const crearCajon  = (nombre, tipo_talla = "letras") => post(`${API}?resource=cajones`, { nombre, tipo_talla });
export const deleteCajon = (cajon)  => del(`${API}?resource=cajones&cajon=${encodeURIComponent(cajon)}`);