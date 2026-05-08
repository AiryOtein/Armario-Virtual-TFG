import { useState } from "react";
import { updatePrenda } from "./api";

const TALLAS_ROPA   = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];
const TALLAS_ZAPATO = Array.from({ length: 11 }, (_, i) => String(36 + i));
const TIPOS_ZAPATO  = ["zapatos", "zapatillas", "botas", "sandalias", "tacones", "deportivas"];
const CAJONES_BASE  = ["camisetas", "pantalones", "zapatos", "vestidos"];
const COLORES       = ["Negro", "Blanco", "Gris", "Beige", "Marrón", "Rojo", "Rosa",
                       "Naranja", "Amarillo", "Verde", "Azul", "Morado", "Lila",
                       "Azul marino", "Verde oliva"];
const TIPOS         = ["Camiseta", "Sudadera", "Chaqueta", "Abrigo", "Pantalón", "Vaqueros",
                       "Falda", "Vestido", "Zapatos", "Zapatillas", "Botas", "Sandalias",
                       "Tacones", "Deportivas", "Shorts", "Mono"];
const MARCAS        = ["Zara", "H&M", "Mango", "Pull&Bear", "Bershka", "Stradivarius",
                       "Nike", "Adidas", "New Balance", "Puma", "Vans", "Converse",
                       "Levi's", "COS", "& Other Stories"];

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

  const esZapato = TIPOS_ZAPATO.includes(form.tipo?.toLowerCase());
  const tallas   = esZapato ? TALLAS_ZAPATO : TALLAS_ROPA;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "tipo" ? { talla: "" } : {}),
    }));
  };

  const handleImagen = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNuevaImagen(file);
    setPreview(URL.createObjectURL(file));
  };

  const guardar = async () => {
    if (!form.tipo || !form.color || !form.talla) {
      setError("Tipo, color y talla son obligatorios.");
      return;
    }
    setGuardando(true);
    setError("");

    if (nuevaImagen) {
      const data = new FormData();
      Object.keys(form).forEach((k) => data.append(k, form[k]));
      data.append("nombre", form.tipo);
      data.append("imagen", nuevaImagen);
      data.append("_method", "PUT");

      await fetch(`http://localhost/armario/backend/api.php?resource=prendas&id=${prenda.id}&_img=1`, {
        method: "POST",
        body: data,
      });
    } else {
      await updatePrenda(prenda.id, { ...form, nombre: form.tipo });
    }

    setGuardando(false);
    onGuardar && onGuardar();
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
            📷 Cambiar imagen
            <input type="file" accept="image/*" onChange={handleImagen} />
          </label>
        </div>

        <div className="modal-campos">
          <input
            name="tipo"
            placeholder="Tipo de prenda"
            value={form.tipo}
            onChange={handleChange}
            list="edit-tipos"
            autoComplete="off"
          />
          <datalist id="edit-tipos">
            {TIPOS.map((t) => <option key={t} value={t} />)}
          </datalist>

          <input
            name="color"
            placeholder="Color"
            value={form.color}
            onChange={handleChange}
            list="edit-colores"
            autoComplete="off"
          />
          <datalist id="edit-colores">
            {COLORES.map((c) => <option key={c} value={c} />)}
          </datalist>

          <select name="talla" value={form.talla} onChange={handleChange}>
            <option value="">{esZapato ? "Talla (36–46)" : "Talla (XXS–XXL)"}</option>
            {tallas.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>

          <input
            name="marca"
            placeholder="Marca"
            value={form.marca}
            onChange={handleChange}
            list="edit-marcas"
            autoComplete="off"
          />
          <datalist id="edit-marcas">
            {MARCAS.map((m) => <option key={m} value={m} />)}
          </datalist>

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