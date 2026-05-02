function PrendaCard({ prenda, onDelete }) {
  const borrar = async () => {
    const card = document.getElementById(`prenda-${prenda.id}`);
    if (card) {
      card.style.opacity = "0";
      card.style.transform = "scale(0.8)";
    }

    setTimeout(async () => {
      await fetch(`http://localhost/armario/backend/delete_prenda.php?id=${prenda.id}`);
      onDelete();
    }, 200);
  };

  return (
    <div className="prenda-card" id={`prenda-${prenda.id}`}>
      <img
        src={`http://localhost/armario/uploads/${prenda.imagen}`}
        alt={prenda.nombre}
        onError={(e) => (e.target.src = "https://via.placeholder.com/300")}
      />

      <h3>{prenda.nombre}</h3>
      <p>{prenda.tipo}</p>
      <p>{prenda.color}</p>
      <p>{prenda.talla}</p>

      <button onClick={borrar}>🗑️</button>
    </div>
  );
}

export default PrendaCard;