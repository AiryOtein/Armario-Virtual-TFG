import { useEffect, useState } from "react";
import { getPrendas } from "./api";
import PrendaCard from "./PrendaCard";
import Formulario from "./Formulario";
import "./App.css";

function App() {
  const [todasPrendas, setTodasPrendas] = useState([]);
  const [prendas, setPrendas] = useState([]);
  const [cajonActual, setCajonActual] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [modo, setModo] = useState("light");
  const [cajonesExtra, setCajonesExtra] = useState([]);
  const [filtro, setFiltro] = useState({ color: "", talla: "", marca: "" });

  const cajonesBase = ["camisetas", "pantalones", "zapatos", "vestidos"];

  const cajones = [
    ...new Set([
      ...cajonesBase,
      ...cajonesExtra,
      ...todasPrendas.map(p => p.cajon)
    ])
  ];

  const cargarPrendas = async () => {
    const data = await getPrendas();
    setTodasPrendas(data);

    if (cajonActual) {
      setPrendas(data.filter(p => p.cajon === cajonActual));
    } else {
      setPrendas([]);
    }
  };

  useEffect(() => {
    cargarPrendas();
  }, [cajonActual]);

  useEffect(() => {
    document.body.className = modo;
  }, [modo]);

  const toggleModo = () => {
    setModo(modo === "light" ? "dark" : "light");
  };

  const crearCajon = () => {
    const nuevo = prompt("Nombre del nuevo cajón:");
    if (nuevo) setCajonesExtra(prev => [...prev, nuevo.toLowerCase()]);
  };

  const borrarCajon = async (c) => {
    if (window.confirm(`¿Borrar el cajón "${c}"?`)) {
      await fetch(`http://localhost/armario/backend/delete_cajon.php?cajon=${encodeURIComponent(c)}`);
      setCajonesExtra(prev => prev.filter(x => x !== c));
      if (cajonActual === c) setCajonActual(null);
      cargarPrendas();
    }
  };

  const toggleFavorito = async (id, favorito) => {
    await fetch(`http://localhost/armario/backend/favorito.php?id=${id}&fav=${favorito ? 0 : 1}`);
    cargarPrendas();
  };

  const moverPrenda = async (id, nuevoCajon) => {
    await fetch(`http://localhost/armario/backend/mover_prenda.php?id=${id}&cajon=${nuevoCajon}`);
    cargarPrendas();
  };

  return (
    <div>
      <div className="toggle-container">
        <span>☀️</span>
        <label className="switch">
          <input type="checkbox" onChange={toggleModo} />
          <span className="slider"></span>
        </label>
        <span>🌙</span>
      </div>

      <h1>Armario Virtual</h1>

      {!cajonActual && (
        <>
          <div className="hero">
            <h2>Organiza tu armario fácilmente</h2>
          </div>

          <div className="cajones">
            {cajones.map(c => {
              const cantidad = todasPrendas.filter(p => p.cajon === c).length;
              const esBase = cajonesBase.includes(c);

              return (
                <div
                  key={c}
                  className="cajon-card"
                  onClick={() => setCajonActual(c)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const id = e.dataTransfer.getData("id");
                    moverPrenda(id, c);
                  }}
                >
                  <div className="cajon-title">
                    {c}
                    <span className="contador">{cantidad}</span>
                  </div>

                  {!esBase && (
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        borrarCajon(c);
                      }}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              );
            })}

            <div className="cajon-card add" onClick={crearCajon}>+</div>
          </div>
        </>
      )}

      {cajonActual && (
        <div className="fade-in">
          <button onClick={() => setCajonActual(null)}>⬅ Volver</button>

          <input placeholder="Buscar..." onChange={(e) => setBusqueda(e.target.value)} />

          <div className="filtros">
            <input placeholder="Color" onChange={(e) => setFiltro({ ...filtro, color: e.target.value })} />
            <input placeholder="Talla" onChange={(e) => setFiltro({ ...filtro, talla: e.target.value })} />
            <input placeholder="Marca" onChange={(e) => setFiltro({ ...filtro, marca: e.target.value })} />
          </div>

          <button onClick={() => setMostrarForm(true)}>Añadir prenda +</button>

          {mostrarForm && (
            <Formulario cajon={cajonActual} onAdd={() => {
              cargarPrendas();
              setMostrarForm(false);
            }} />
          )}

          <div className="prenda-container">
            {prendas
              .filter(p =>
                p.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
                p.color.toLowerCase().includes(filtro.color.toLowerCase()) &&
                p.talla.toLowerCase().includes(filtro.talla.toLowerCase()) &&
                p.marca.toLowerCase().includes(filtro.marca.toLowerCase())
              )
              .map(p => (
                <PrendaCard
                  key={p.id}
                  prenda={p}
                  onDelete={cargarPrendas}
                  onFav={toggleFavorito}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;