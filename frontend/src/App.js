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

const cajonesBase = ["camisetas", "pantalones", "zapatos", "vestidos"];

const cajones = [
  ...new Set([
    ...cajonesBase,
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
        <div className="cajones">
          {cajones.map(c => (
            <div
              key={c}
              className="cajon-card"
              onClick={() => setCajonActual(c)}
            >
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </div>
          ))}

          <div
            className="cajon-card add"
            onClick={() => {
              const nuevo = prompt("Nombre del nuevo cajón:");
              if (nuevo) setCajonActual(nuevo.toLowerCase());
            }}
          >
            +
          </div>
        </div>
      )}

      {cajonActual && (
        <>
          <button onClick={() => setCajonActual(null)}>⬅ Volver</button>

          <input
            placeholder="Buscar..."
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <button onClick={() => setMostrarForm(true)}>
            Añadir prenda
          </button>

          {mostrarForm && (
            <Formulario
              cajon={cajonActual}
              onAdd={() => {
                cargarPrendas();
                setMostrarForm(false);
              }}
            />
          )}

          <div className="prenda-container">
            {prendas
              .filter(p =>
                p.nombre.toLowerCase().includes(busqueda.toLowerCase())
              )
              .map(p => (
                <PrendaCard key={p.id} prenda={p} />
              ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;