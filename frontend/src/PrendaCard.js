function PrendaCard({ prenda, onDelete }) {

  const borrar = async () => {
fetch(`http://localhost/armario/backend/delete_prenda.php?id=${prenda.id}`);    onDelete(prenda.id);
  };

  return (
    <div className="prenda-card">
      <img
        src={`http://localhost/armario/uploads/${prenda.imagen}`}
        alt={prenda.nombre}
      />

      <h3>{prenda.nombre}</h3>
      <p><strong>Tipo:</strong> {prenda.tipo}</p>
      <p><strong>Color:</strong> {prenda.color}</p>
      <p><strong>Talla:</strong> {prenda.talla}</p>

      <button onClick={borrar}>🗑️</button>
    </div>
  );
}

export default PrendaCard;