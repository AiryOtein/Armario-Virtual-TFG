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
        <>
          <div className="hero">
            <h2>Organiza tu armario fácilmente</h2>
            <p>Guarda tus prendas, clasifícalas y encuéntralas en segundos.</p>
          </div>

          <div className="cajones">
            {cajones.map(c => (
              <div key={c} className="cajon-card">

                <div
                  className="cajon-title"
                  onClick={() => setCajonActual(c)}
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </div>

                <button
                  className="delete-btn"
                  onClick={async (e) => {
                    e.stopPropagation();

                    if (window.confirm(`¿Borrar el cajón "${c}"?`)) {
                      await fetch(
                        `http://localhost/armario/backend/delete_cajon.php?cajon=${encodeURIComponent(c)}`
                      );

                      if (cajonActual === c) {
                        setCajonActual(null);
                      }

                      cargarPrendas();
                    }
                  }}
                >
                  🗑️
                </button>

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
        </>
      )}

      {cajonActual && (
        <div className="fade-in slide-in">
          <button onClick={() => setCajonActual(null)}>
            ⬅ Volver
          </button>

          <input
            placeholder="Buscar..."
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <button onClick={() => setMostrarForm(true)}>
            Añadir nueva prenda +
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

          {prendas.length === 0 && (
            <p style={{ textAlign: "center" }}>
              No hay prendas aún, ¡añade la primera!
            </p>
          )}

          <div className="prenda-container">
            {prendas
              .filter(p =>
                p.nombre.toLowerCase().includes(busqueda.toLowerCase())
              )
              .map(p => (
                <PrendaCard
                  key={p.id}
                  prenda={p}
                  onDelete={cargarPrendas}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;