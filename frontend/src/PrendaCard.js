function PrendaCard({ prenda, onDelete, onFav }) {

  const borrar = async (e) => {
    e.stopPropagation();
    await fetch(`http://localhost/armario/backend/delete_prenda.php?id=${prenda.id}`);
    onDelete && onDelete();
  };

  const toggleFav = async (e) => {
    e.stopPropagation();
    await fetch(`http://localhost/armario/backend/favorito.php?id=${prenda.id}&fav=${prenda.favorito == 1 ? 0 : 1}`);
    onFav && onFav();
  };

  return (
    <div className="prenda-card">
      <img
        src={`http://localhost/armario/uploads/${prenda.imagen}`}
        onError={(e) => e.target.style.display = "none"}
      />

      <div className="prenda-actions">
        <button onClick={toggleFav}>
          {prenda.favorito == 1 ? "⭐" : "☆"}
        </button>
        <button onClick={borrar}>🗑️</button>
      </div>

      <div className="prenda-info">
        <span>{prenda.color}</span>
        <span>{prenda.talla}</span>
        <span>{prenda.marca}</span>
      </div>
    </div>
  );
}

export default PrendaCard;