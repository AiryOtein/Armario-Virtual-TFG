function PrendaCard({ prenda }) {

  const borrar = async () => {
    await fetch(`http://localhost/armario/delete_prenda.php?id=${prenda.id}`);
    window.location.reload();
  };

  return (
    <div className="prenda-card">
      <img src={`http://localhost/armario/uploads/${prenda.imagen}`} />

      <h3>{prenda.nombre}</h3>
      <p>{prenda.tipo}</p>
      <p>{prenda.color}</p>
      <p>{prenda.talla}</p>

      <button onClick={borrar}>🗑️</button>
    </div>
  );
}

export default PrendaCard;