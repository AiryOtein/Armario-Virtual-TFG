import { useEffect, useState } from "react";
import { getPrendas, updateOutfit } from "./api";

const MAX_PRENDAS = 8;
const MIN_PRENDAS = 3;

function EditarOutfit({ outfit, onGuardar, onCerrar }) {
  const [todasPrendas, setTodasPrendas] = useState([]);
  const [seleccion,    setSeleccion]    = useState(outfit.prendas.map((p) => p.id));
  const [nombre,       setNombre]       = useState(outfit.nombre);
  const [busqueda,     setBusqueda]     = useState("");
  const [filtroCajon,  setFiltroCajon]  = useState("");
  const [guardando,    setGuardando]    = useState(false);
  const [error,        setError]        = useState("");

  useEffect(() => { getPrendas().then(setTodasPrendas); }, []);

  const cajones = [...new Set(todasPrendas.map((p) => p.cajon).filter(Boolean))];

  const prendasFiltradas = todasPrendas.filter((p) => {
    const q = busqueda.toLowerCase();
    const coincide = !q || p.nombre?.toLowerCase().includes(q) || p.color?.toLowerCase().includes(q) || p.marca?.toLowerCase().includes(q);
    return coincide && (!filtroCajon || p.cajon === filtroCajon);
  });

  const toggle = (id) => {
    if (seleccion.includes(id)) {
      setSeleccion((prev) => prev.filter((x) => x !== id));
    } else {
      if (seleccion.length >= MAX_PRENDAS) {
        setError(`Máximo ${MAX_PRENDAS} prendas por outfit.`);
        setTimeout(() => setError(""), 2000);
        return;
      }
      setSeleccion((prev) => [...prev, id]);
    }
    setError("");
  };

  const guardar = async () => {
    if (!nombre.trim())                  { setError("El outfit necesita un nombre."); return; }
    if (seleccion.length < MIN_PRENDAS)  { setError(`Selecciona al menos ${MIN_PRENDAS} prendas.`); return; }
    setGuardando(true);
    const res = await updateOutfit(outfit.id, nombre.trim(), seleccion);
    setGuardando(false);
    if (res.ok) { onGuardar(); } else { setError("Error al guardar."); }
  };

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-panel modal-panel--grande fade-in" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <h3>Editar outfit</h3>
          <button className="modal-close" onClick={onCerrar}>✕</button>
        </div>

        <input
          placeholder="Nombre del outfit"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <div className="outfit-contador">
          <span>{seleccion.length} / {MAX_PRENDAS} prendas · mínimo {MIN_PRENDAS}</span>
          {seleccion.length > 0 && (
            <button className="btn-secundario" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => setSeleccion([])}>
              Limpiar
            </button>
          )}
        </div>

        {seleccion.length > 0 && (
          <div className="outfit-preview-tira">
            {seleccion.map((id) => {
              const p = todasPrendas.find((x) => x.id === parseInt(id));
              if (!p) return null;
              return (
                <div key={id} className="outfit-preview-item" onClick={() => toggle(p.id)}>
                  <img src={`http://localhost/armario/uploads/${p.imagen}`} alt={p.nombre} onError={(e) => (e.target.style.display = "none")} />
                  <span className="outfit-preview-remove">✕</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="outfit-filtros">
          <input placeholder="Buscar prenda..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          <select value={filtroCajon} onChange={(e) => setFiltroCajon(e.target.value)}>
            <option value="">Todos los cajones</option>
            {cajones.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="outfit-grid-selector">
          {prendasFiltradas.map((p) => {
            const seleccionada = seleccion.includes(p.id);
            const lleno = seleccion.length >= MAX_PRENDAS && !seleccionada;
            return (
              <div
                key={p.id}
                className={`outfit-prenda-item ${seleccionada ? "seleccionada" : ""} ${lleno ? "deshabilitada" : ""}`}
                onClick={() => !lleno && toggle(p.id)}
              >
                <img src={`http://localhost/armario/uploads/${p.imagen}`} alt={p.nombre} onError={(e) => (e.target.style.display = "none")} />
                {seleccionada && <div className="outfit-check">✓</div>}
                <div className="outfit-prenda-info">
                  <span>{p.tipo || p.nombre}</span>
                  <span style={{ opacity: 0.6, fontSize: 11 }}>{p.color} · {p.talla}</span>
                </div>
              </div>
            );
          })}
        </div>

        {error && <p className="modal-error">{error}</p>}

        <div className="modal-actions">
          <button onClick={onCerrar} className="btn-secundario">Cancelar</button>
          <button onClick={guardar} disabled={guardando || seleccion.length < MIN_PRENDAS}>
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditarOutfit;