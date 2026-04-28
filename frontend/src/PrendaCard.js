function PrendaCard({ prenda }) {
  return (
    <div style={{ border: "1px solid black", margin: "10px", padding: "10px" }}>
      <h3>{prenda.nombre}</h3>
      <p>Tipo: {prenda.tipo}</p>
      <p>Color: {prenda.color}</p>
      <p>Talla: {prenda.talla}</p>
    </div>
  );
}

export default PrendaCard;