function PrendaCard({ prenda }) {
  return (
    <div className="prenda-card">
      <h3>{prenda.nombre}</h3>
      <p><strong>Tipo:</strong> {prenda.tipo}</p>
      <p><strong>Color:</strong> {prenda.color}</p>
      <p><strong>Talla:</strong> {prenda.talla}</p>
    </div>
  );
}

export default PrendaCard;