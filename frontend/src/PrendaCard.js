import { useState } from "react";
import { updatePrenda, deletePrenda } from "./api";
import EditarPrenda from "./EditarPrenda";
import { useDialogo } from "./Dialogo";

function PrendaCard({ prenda, onDelete, onUpdate, cajones = [] }) {
  const [editando,    setEditando]    = useState(false);
  const [imgOverride, setImgOverride] = useState(null);
  const { dialogo, confirmar }        = useDialogo();

  const borrar = async (e) => {
    e.stopPropagation();
    const ok = await confirmar("¿Borrar esta prenda?");
    if (!ok) return;
    await deletePrenda(prenda.id);
    onDelete && onDelete();
  };

  const toggleFav = async (e) => {
    e.stopPropagation();
    await updatePrenda(prenda.id, { favorito: prenda.favorito == 1 ? 0 : 1 });
    onUpdate && onUpdate();
  };

  const imgSrc = imgOverride || `http://localhost/armario/uploads/${prenda.imagen}`;

  return (
    <>
      <div className="prenda-card" onClick={(e) => e.stopPropagation()}>
        <img
          src={imgSrc}
          alt={prenda.nombre}
          onError={(e) => (e.target.style.display = "none")}
        />
        <div className="prenda-actions">
          <button onClick={toggleFav} title="Favorito">
            {prenda.favorito == 1 ? "⭐" : "☆"}
          </button>
          <button onClick={(e) => { e.stopPropagation(); setEditando(true); }} title="Editar">
            ✏️
          </button>
          <button onClick={borrar} title="Borrar">
            🗑️
          </button>
        </div>
        <div className="prenda-info">
          {prenda.color  && <span>{prenda.color}</span>}
          {prenda.talla  && <span>{prenda.talla}</span>}
          {prenda.marca  && <span>{prenda.marca}</span>}
          {prenda.cajon  && <span style={{ fontSize: 11, opacity: 0.6 }}>📦 {prenda.cajon}</span>}
        </div>
      </div>

      {editando && (
        <EditarPrenda
          prenda={prenda}
          cajones={cajones}
          onGuardar={(previewUrl) => {
            if (previewUrl) setImgOverride(previewUrl);
            setEditando(false);
            onUpdate && onUpdate();
          }}
          onCerrar={() => setEditando(false)}
        />
      )}

      {dialogo}
    </>
  );
}

export default PrendaCard;