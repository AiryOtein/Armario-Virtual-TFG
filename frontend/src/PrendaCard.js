function PrendaCard({ prenda }) {
  return (
    <div className="prenda-card">
      
      {prenda.imagen && (
        <img
          src={`http://localhost/armario/${prenda.imagen}`}
          alt={prenda.nombre}
          style={{ width: "100%", borderRadius: "8px", marginBottom: "10px" }}
        />
      )}

      <h3>{prenda.nombre}</h3>
      <p><strong>Tipo:</strong> {prenda.tipo}</p>
      <p><strong>Color:</strong> {prenda.color}</p>
      <p><strong>Talla:</strong> {prenda.talla}</p>
      <p><strong>Marca:</strong> {prenda.marca}</p>

    </div>
  );
}

export default PrendaCard;