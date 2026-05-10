import { useState } from "react";

const TALLAS_ROPA   = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];
const TALLAS_ZAPATO = Array.from({ length: 11 }, (_, i) => String(36 + i));
const CAJONES_BASE  = ["camisetas", "pantalones", "zapatos", "vestidos"];

const COLORES_DEFAULT = [
  "Negro","Blanco","Gris","Beige","Marrón","Rojo","Rosa",
  "Naranja","Amarillo","Verde","Azul","Morado","Lila","Azul marino","Verde oliva",
];

const MARCAS_DEFAULT = [
  "Zara","H&M","Mango","Pull&Bear","Bershka","Stradivarius",
  "Nike","Adidas","New Balance","Puma","Vans","Converse","Levi's","COS","Otra Tienda",
];

const MARCAS_KEY  = "armario_marcas_extra";
const COLORES_KEY = "armario_colores_extra";

const getExtra = (key) => { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } };
const guardarExtra = (key, valor) => {
  const lista = getExtra(key);
  if (!lista.map(x => x.toLowerCase()).includes(valor.toLowerCase())) {
    localStorage.setItem(key, JSON.stringify([...lista, valor]));
  }
};

function SelectorMarca({ value, onChange }) {
  const [abierto,     setAbierto]     = useState(false);
  const [busqueda,    setBusqueda]    = useState("");
  const [marcasExtra, setMarcasExtra] = useState(getExtra(MARCAS_KEY));

  const todas    = [...new Set([...MARCAS_DEFAULT, ...marcasExtra])].sort();
  const filtradas = todas.filter((m) => m.toLowerCase().includes(busqueda.toLowerCase()));
  const esNueva   = busqueda.trim() && !todas.map(m => m.toLowerCase()).includes(busqueda.trim().toLowerCase());

  const seleccionar = (marca) => { onChange(marca); setBusqueda(""); setAbierto(false); };

  const añadirNueva = () => {
    const nueva = busqueda.trim();
    guardarExtra(MARCAS_KEY, nueva);
    setMarcasExtra(getExtra(MARCAS_KEY));
    seleccionar(nueva);
  };

  return (
    <div className="selector-marca">
      <div className="selector-marca-input" onClick={() => { setAbierto(!abierto); setBusqueda(""); }}>
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
              <div key={m} className={`selector-marca-opcion ${value === m ? "activa" : ""}`} onClick={() => seleccionar(m)}>
                {m}
                {!MARCAS_DEFAULT.includes(m) && <span className="selector-marca-tag">tuya</span>}
              </div>
            ))}
            {esNueva && (
              <div className="selector-marca-nueva" onClick={añadirNueva}>
                Añadir "{busqueda.trim()}" como nueva marca
              </div>
            )}
            {filtradas.length === 0 && !esNueva && <div className="selector-marca-vacio">Sin resultados</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function SelectorColor({ value, onChange }) {
  const [abierto,      setAbierto]      = useState(false);
  const [busqueda,     setBusqueda]     = useState("");
  const [coloresExtra, setColoresExtra] = useState(getExtra(COLORES_KEY));

  const todos     = [...new Set([...COLORES_DEFAULT, ...coloresExtra])].sort();
  const filtrados = todos.filter((c) => c.toLowerCase().includes(busqueda.toLowerCase()));
  const esNuevo   = busqueda.trim() && !todos.map(c => c.toLowerCase()).includes(busqueda.trim().toLowerCase());

  const seleccionar = (color) => { onChange(color); setBusqueda(""); setAbierto(false); };

  const añadirNuevo = () => {
    const nuevo = busqueda.trim();
    guardarExtra(COLORES_KEY, nuevo);
    setColoresExtra(getExtra(COLORES_KEY));
    seleccionar(nuevo);
  };

  return (
    <div className="selector-marca">
      <div className="selector-marca-input" onClick={() => { setAbierto(!abierto); setBusqueda(""); }}>
        <span className={value ? "" : "placeholder"}>{value || "Color"}</span>
        <span className="selector-marca-arrow">{abierto ? "▲" : "▼"}</span>
      </div>
      {abierto && (
        <div className="selector-marca-panel">
          <input
            autoFocus
            className="selector-marca-busqueda"
            placeholder="Buscar o escribir color..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="selector-marca-lista">
            {filtrados.map((c) => (
              <div key={c} className={`selector-marca-opcion ${value === c ? "activa" : ""}`} onClick={() => seleccionar(c)}>
                {c}
                {!COLORES_DEFAULT.includes(c) && <span className="selector-marca-tag">tuyo</span>}
              </div>
            ))}
            {esNuevo && (
              <div className="selector-marca-nueva" onClick={añadirNuevo}>
                Añadir "{busqueda.trim()}" como nuevo color
              </div>
            )}
            {filtrados.length === 0 && !esNuevo && <div className="selector-marca-vacio">Sin resultados</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function Formulario({ onAdd, cajon, cajones = [], cajonesDB = [] }) {
  const [form, setForm] = useState({
    color: "",
    talla: "",
    marca: "",
    cajon: cajon || "",
  });

  const [imagen,  setImagen]  = useState(null);
  const [preview, setPreview] = useState(null);
  const [error,   setError]   = useState("");

  const cajonInfo  = cajonesDB.find((c) => c.nombre === form.cajon);
  const tipoTalla  = cajonInfo?.tipo_talla || (form.cajon === "zapatos" ? "numeros" : "letras");
  const tallas     = tipoTalla === "numeros" ? TALLAS_ZAPATO : TALLAS_ROPA;

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
    if (!form.cajon) { setError("Selecciona un cajón."); return; }

    const data = new FormData();
    data.append("nombre", form.color);
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

    if (!json.ok) { setError(json.error || "Error al guardar la prenda."); return; }

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

      <SelectorColor
        value={form.color}
        onChange={(c) => setForm((prev) => ({ ...prev, color: c }))}
      />

      <select name="talla" value={form.talla} onChange={handleChange}>
        <option value="">{tipoTalla === "numeros" ? "Talla (36–46)" : "Talla (XXS–XXL)"}</option>
        {tallas.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>

      <SelectorMarca
        value={form.marca}
        onChange={(m) => setForm((prev) => ({ ...prev, marca: m }))}
      />

      <label className="file-label">
        {imagen ? `${imagen.name}` : "Seleccionar imagen"}
        <input type="file" accept="image/*,.heic,.heif,.webp,.avif" onChange={handleImage} />
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