function PrendaCard({ prenda, onDelete }) {

  const borrar = async () => {
    await fetch(`http://localhost/armario/backend/delete_prenda.php?id=${prenda.id}`);
    onDelete();
  };

  return (
    <div className="prenda-card">
      <img
        src={`http://localhost/armario/uploads/${prenda.imagen}`}
        alt={prenda.nombre}
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