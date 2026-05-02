function PrendaCard({ prenda, onDelete, onFav }) {
  const borrar = async () => {
    await fetch(`http://localhost/armario/backend/delete_prenda.php?id=${prenda.id}`);
    onDelete();
  };

  const toggleFav = async () => {
    await fetch(`http://localhost/armario/backend/favorito.php?id=${prenda.id}&fav=${prenda.favorito ? 0 : 1}`);
    onFav();
  };

  return (
    <div className="prenda-card">
      <img src={`http://localhost/armario/uploads/${prenda.imagen}`} />

      <div className="prenda-info">
        <p>{prenda.color}</p>
        <p>{prenda.talla}</p>
        <p>{prenda.marca}</p>
      </div>

      <div className="prenda-actions">
        <button onClick={toggleFav}>
          {prenda.favorito ? "⭐" : "☆"}
        </button>

        <button onClick={borrar}>🗑️</button>
      </div>
    </div>
  );
}

export default PrendaCard;