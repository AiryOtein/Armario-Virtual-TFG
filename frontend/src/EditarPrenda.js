import { useState } from "react";
import { updatePrenda } from "./api";

const TALLAS_ROPA   = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];
const TALLAS_ZAPATO = Array.from({ length: 11 }, (_, i) => String(36 + i));
const TIPOS_ZAPATO  = ["zapatos", "zapatillas", "botas", "sandalias", "tacones", "deportivas"];
const CAJONES_BASE  = ["camisetas", "pantalones", "zapatos", "vestidos"];
const COLORES       = ["Negro","Blanco","Gris","Beige","Marrón","Rojo","Rosa","Naranja","Amarillo","Verde","Azul","Morado","Lila","Azul marino","Verde oliva"];
const TIPOS         = ["Camiseta","Sudadera","Chaqueta","Abrigo","Pantalón","Vaqueros","Falda","Vestido","Zapatos","Zapatillas","Botas","Sandalias","Tacones","Deportivas","Shorts","Mono"];
const MARCAS        = ["Zara","H&M","Mango","Pull&Bear","Bershka","Stradivarius","Nike","Adidas","New Balance","Puma","Vans","Converse","Levi's","COS","Otra Tienda"];

function EditarPrenda({ prenda, cajones = [], onGuardar, onCerrar }) {
  const [form, setForm] = useState({
    nombre: prenda.nombre || "",
    tipo:   prenda.tipo   || "",
    color:  prenda.color  || "",
    talla:  prenda.talla  || "",
    marca:  prenda.marca  || "",
    cajon:  prenda.cajon  || "",
  });
  const [nuevaImagen, setNuevaImagen] = useState(null);
  const [preview,     setPreview]     = useState(null);
  const [guardando,   setGuardando]   = useState(false);
  const [error,       setError]       = useState("");

  const esZapato = TIPOS_ZAPATO.includes(form.tipo?.toLowerCase()) || form.cajon === "zapatos";
  const tallas   = esZapato ? TALLAS_ZAPATO : TALLAS_ROPA;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value, ...(name === "tipo" ? { talla: "" } : {}) }));
  };

  const handleImagen = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNuevaImagen(file);
    setPreview(URL.createObjectURL(file));
  };

  const guardar = async () => {
    if (!form.color || !form.talla) { setError("Color y talla son obligatorios."); return; }
    setGuardando(true);
    setError("");

    await updatePrenda(prenda.id, { ...form, nombre: form.tipo || form.color });

    if (nuevaImagen) {
      const data = new FormData();
      data.append("imagen", nuevaImagen);
      const res = await fetch(`http://localhost/armario/backend/api.php?resource=prendas&id=${prenda.id}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("armario_token") || ""}` },
        body: data,
      });
      await res.json();
    }

    setGuardando(false);
    onGuardar(preview);
  };

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-panel fade-in" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <h3>Editar prenda</h3>
          <button className="modal-close" onClick={onCerrar}>✕</button>
        </div>

        <div className="modal-imagen">
          <img
            src={preview || `http://localhost/armario/uploads/${prenda.imagen}`}
            alt={prenda.nombre}
            onError={(e) => (e.target.style.display = "none")}
          />
          <label className="file-label file-label--small">
            Cambiar imagen
            <input type="file" accept="image/*,.heic,.heif,.webp,.avif" onChange={handleImagen} />
          </label>
        </div>

        <div className="modal-campos">
          <input name="color" placeholder="Color" value={form.color} onChange={handleChange} list="edit-colores" autoComplete="off" />
          <datalist id="edit-colores">{COLORES.map((c) => <option key={c} value={c} />)}</datalist>

          <select name="talla" value={form.talla} onChange={handleChange}>
            <option value="">{esZapato ? "Talla (36–46)" : "Talla (XXS–XXL)"}</option>
            {tallas.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>

          <input name="marca" placeholder="Marca" value={form.marca} onChange={handleChange} list="edit-marcas" autoComplete="off" />
          <datalist id="edit-marcas">{MARCAS.map((m) => <option key={m} value={m} />)}</datalist>

          <select name="cajon" value={form.cajon} onChange={handleChange}>
            <option value="">Sin cajón</option>
            {[...new Set([...CAJONES_BASE, ...cajones])].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {error && <p className="modal-error">{error}</p>}

        <div className="modal-actions">
          <button onClick={onCerrar} className="btn-secundario">Cancelar</button>
          <button onClick={guardar} disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditarPrenda;