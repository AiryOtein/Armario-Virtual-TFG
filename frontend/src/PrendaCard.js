function PrendaCard({ prenda, onDelete, onFav }) {
  const borrar = async () => {
    await fetch(`http://localhost/armario/backend/delete_prenda.php?id=${prenda.id}`);
    onDelete();
  };

  return (
    <div
      className="prenda-card"
      draggable
      onDragStart={(e) => e.dataTransfer.setData("id", prenda.id)}
    >
      <img src={`http://localhost/armario/uploads/${prenda.imagen}`} />

      <h3>{prenda.nombre}</h3>
      <p>{prenda.tipo}</p>
      <p>{prenda.color}</p>
      <p>{prenda.talla}</p>

      <div className="acciones">
        <button onClick={() => onFav(prenda.id, prenda.favorito)}>
          {prenda.favorito ? "⭐" : "☆"}
        </button>
        <button onClick={borrar}>🗑️</button>
      </div>
    </div>
  );
}

export default PrendaCard;