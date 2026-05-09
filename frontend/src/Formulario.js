import { useState } from "react";

const TALLAS_ROPA   = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];
const TALLAS_ZAPATO = Array.from({ length: 11 }, (_, i) => String(36 + i)); // 36–46

const TIPOS_ZAPATO  = ["zapatos", "zapatillas", "botas", "sandalias", "tacones", "deportivas"];

const COLORES_SUGERIDOS = [
  "Negro", "Blanco", "Gris", "Beige", "Marrón",
  "Rojo", "Rosa", "Naranja", "Amarillo", "Verde",
  "Azul", "Morado", "Lila", "Azul marino", "Verde oliva",
];

const CAJONES_BASE  = ["camisetas", "pantalones", "zapatos", "vestidos"];

function Formulario({ onAdd, cajon, cajones = [] }) {
  const [form, setForm] = useState({
    tipo:  "",
    color: "",
    talla: "",
    marca: "",
    cajon: cajon || "",
  });

  const [imagen,  setImagen]  = useState(null);
  const [preview, setPreview] = useState(null);
  const [error,   setError]   = useState("");

  const esZapato = TIPOS_ZAPATO.includes(form.tipo.toLowerCase()) || form.cajon === "zapatos";
  const tallas   = esZapato ? TALLAS_ZAPATO : TALLAS_ROPA;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "tipo" ? { talla: "" } : {}),
    }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagen(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.tipo || !form.color || !form.talla || !imagen) {
      setError("Completa todos los campos y añade una imagen.");
      return;
    }

    if (!form.cajon) {
      setError("Selecciona un cajón.");
      return;
    }

    const data = new FormData();
    data.append("nombre", form.tipo);
    Object.keys(form).forEach((key) => data.append(key, form[key]));
    data.append("cajon",  form.cajon);
    data.append("imagen", imagen);

    const res  = await fetch("http://localhost/armario/backend/api.php?resource=prendas", {
      method: "POST",
      headers: { "Authorization": `Bearer ${localStorage.getItem("armario_token") || ""}` },
      body: data,
    });
    const json = await res.json();

    if (!json.ok) {
      setError(json.error || "Error al guardar la prenda.");
      return;
    }

    onAdd();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="formulario fade-in">

        {!cajon && (
          <select name="cajon" value={form.cajon} onChange={handleChange}>
            <option value="">Selecciona un cajón</option>
            {[...new Set([...CAJONES_BASE, ...cajones])].map((c) => (
              <option key={c} value={c}>{c.toUpperCase()}</option>
            ))}
          </select>
        )}

        <input
          name="tipo"
          placeholder="Tipo de prenda"
          value={form.tipo}
          onChange={handleChange}
          list="tipos-list"
          autoComplete="off"
        />
        <datalist id="tipos-list">
          {["Camiseta", "Sudadera", "Chaqueta", "Abrigo", "Pantalón", "Vaqueros",
            "Falda", "Vestido", "Zapatos", "Zapatillas", "Botas", "Sandalias",
            "Tacones", "Deportivas", "Shorts", "Mono"].map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>

        <input
          name="color"
          placeholder="Color"
          value={form.color}
          onChange={handleChange}
          list="colores-list"
          autoComplete="off"
        />
        <datalist id="colores-list">
          {COLORES_SUGERIDOS.map((c) => <option key={c} value={c} />)}
        </datalist>

        <select name="talla" value={form.talla} onChange={handleChange}>
          <option value="">
            {esZapato ? "Talla (36–46)" : "Talla (XXS–XXL)"}
          </option>
          {tallas.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <input
          name="marca"
          placeholder="Marca"
          value={form.marca}
          onChange={handleChange}
          list="marcas-list"
          autoComplete="off"
        />
        <datalist id="marcas-list">
          {["Zara", "H&M", "Mango", "Pull&Bear", "Bershka", "Stradivarius",
            "Nike", "Adidas", "New Balance", "Puma", "Vans", "Converse",
            "Levi's", "COS", "& Other Stories"].map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>

        <label className="file-label">
          {imagen ? `📷 ${imagen.name}` : "Seleccionar imagen"}
          <input type="file" accept="image/*" onChange={handleImage} />
        </label>
        {preview && (
          <img
            src={preview}
            alt="preview"
            className="preview"
            style={{ borderRadius: 10, marginTop: 6 }}
          />
        )}

        {error && (
          <p style={{ color: "#e53e3e", fontSize: 13, margin: "4px 0" }}>{error}</p>
        )}

        <button type="submit">Guardar</button>
      </form>
    </>
  );
}

export default Formulario;