import { useState } from "react";

const TALLAS_ROPA   = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];
const TALLAS_ZAPATO = Array.from({ length: 11 }, (_, i) => String(36 + i));
const CAJONES_BASE  = ["camisetas", "pantalones", "zapatos", "vestidos"];
const CAJONES_ZAPATO = ["zapatos"];

const COLORES_SUGERIDOS = [
  "Negro","Blanco","Gris","Beige","Marrón","Rojo","Rosa",
  "Naranja","Amarillo","Verde","Azul","Morado","Lila","Azul marino","Verde oliva",
];

const MARCAS_DEFAULT = [
  "Zara","H&M","Mango","Pull&Bear","Bershka","Stradivarius",
  "Nike","Adidas","New Balance","Puma","Vans","Converse","Levi's","COS","& Other Stories",
];

const MARCAS_KEY = "armario_marcas_extra";

const getMarcasGuardadas = () => {
  try { return JSON.parse(localStorage.getItem(MARCAS_KEY) || "[]"); } catch { return []; }
};

const guardarMarcaExtra = (marca) => {
  const extra = getMarcasGuardadas();
  if (!extra.includes(marca)) {
    localStorage.setItem(MARCAS_KEY, JSON.stringify([...extra, marca]));
  }
};

function SelectorMarca({ value, onChange }) {
  const [abierto,    setAbierto]    = useState(false);
  const [busqueda,   setBusqueda]   = useState("");
  const [marcasExtra, setMarcasExtra] = useState(getMarcasGuardadas());

  const todasMarcas = [...new Set([...MARCAS_DEFAULT, ...marcasExtra])].sort();
  const filtradas   = todasMarcas.filter((m) => m.toLowerCase().includes(busqueda.toLowerCase()));
  const esNueva     = busqueda.trim() && !todasMarcas.map(m => m.toLowerCase()).includes(busqueda.trim().toLowerCase());

  const seleccionar = (marca) => {
    onChange(marca);
    setBusqueda("");
    setAbierto(false);
  };

  const añadirNueva = () => {
    const nueva = busqueda.trim();
    guardarMarcaExtra(nueva);
    setMarcasExtra(getMarcasGuardadas());
    seleccionar(nueva);
  };

  return (
    <div className="selector-marca">
      <div
        className="selector-marca-input"
        onClick={() => { setAbierto(!abierto); setBusqueda(""); }}
      >
        <span className={value ? "" : "placeholder"}>{value || "Marca"}</span>
        <span className="selector-marca-arrow">{abierto ? "▲" : "▼"}</span>
      </div>

      {abierto && (
        <div className="selector-marca-panel">
          <input
            autoFocus
            className="selector-marca-busqueda"
            placeholder="Buscar o escribir marca..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="selector-marca-lista">
            {filtradas.map((m) => (
              <div
                key={m}
                className={`selector-marca-opcion ${value === m ? "activa" : ""}`}
                onClick={() => seleccionar(m)}
              >
                {m}
                {!MARCAS_DEFAULT.includes(m) && (
                  <span className="selector-marca-tag">tuya</span>
                )}
              </div>
            ))}
            {esNueva && (
              <div className="selector-marca-nueva" onClick={añadirNueva}>
                Añadir "{busqueda.trim()}" como nueva marca
              </div>
            )}
            {filtradas.length === 0 && !esNueva && (
              <div className="selector-marca-vacio">Sin resultados</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Formulario({ onAdd, cajon, cajones = [] }) {
  const [form, setForm] = useState({
    color: "",
    talla: "",
    marca: "",
    cajon: cajon || "",
  });

  const [imagen,  setImagen]  = useState(null);
  const [preview, setPreview] = useState(null);
  const [error,   setError]   = useState("");

  const esZapato = CAJONES_ZAPATO.includes(form.cajon) || form.cajon === "zapatos";
  const tallas   = esZapato ? TALLAS_ZAPATO : TALLAS_ROPA;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value, ...(name === "cajon" ? { talla: "" } : {}) }));
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

    if (!form.color || !form.talla || !form.marca || !imagen) {
      setError("Completa todos los campos y añade una imagen.");
      return;
    }

    if (!form.cajon) {
      setError("Selecciona un cajón.");
      return;
    }

    const data = new FormData();
    data.append("nombre", form.marca);
    data.append("tipo",   form.cajon);
    data.append("color",  form.color);
    data.append("talla",  form.talla);
    data.append("marca",  form.marca);
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
        <option value="">{esZapato ? "Talla (36–46)" : "Talla (XXS–XXL)"}</option>
        {tallas.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>

      <SelectorMarca
        value={form.marca}
        onChange={(m) => setForm((prev) => ({ ...prev, marca: m }))}
      />

      <label className="file-label">
        {imagen ? `${imagen.name}` : "Seleccionar imagen"}
        <input type="file" accept="image/*" onChange={handleImage} />
      </label>

      {preview && (
        <img src={preview} alt="preview" style={{ borderRadius: 10, marginTop: 6, width: "100%", objectFit: "contain", maxHeight: 200 }} />
      )}

      {error && <p style={{ color: "#e53e3e", fontSize: 13, margin: "4px 0" }}>{error}</p>}

      <button type="submit">Guardar</button>
    </form>
  );
}

export default Formulario;