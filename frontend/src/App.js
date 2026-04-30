import { useEffect, useState } from "react";
import { getPrendas } from "./api";
import PrendaCard from "./PrendaCard";
import Formulario from "./Formulario";
import "./App.css";

function App() {
  const [prendas, setPrendas] = useState([]);
  const [cajonActual, setCajonActual] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const cargarPrendas = async () => {
    const data = await getPrendas();

    if (cajonActual) {
      setPrendas(data.filter(p => p.cajon === cajonActual));
    } else {
      setPrendas(data);
    }
  };

  useEffect(() => {
    cargarPrendas();
  }, [cajonActual]);

  return (
    <div>
      <h1>Armario Virtual</h1>

      {!cajonActual && (
        <div className="cajones">
          <button onClick={() => setCajonActual("camisetas")}>Camisetas</button>
          <button onClick={() => setCajonActual("pantalones")}>Pantalones</button>
          <button onClick={() => setCajonActual("zapatos")}>Zapatos</button>
          <button onClick={() => setCajonActual("chaquetas")}>Chaquetas</button>
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