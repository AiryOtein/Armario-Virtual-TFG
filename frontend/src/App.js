import { useEffect, useState } from "react";
import { getPrendas } from "./api";
import PrendaCard from "./PrendaCard";
import Formulario from "./Formulario";
import "./App.css";

function App() {
  const [prendas, setPrendas] = useState([]);

  const cargarPrendas = async () => {
    const data = await getPrendas();
    setPrendas(data);
  };

  useEffect(() => {
    cargarPrendas();
  }, []);

  return (
    <div>
      <h1>Armario Virtual 👕</h1>

      <Formulario onAdd={cargarPrendas} />

      <div className="prenda-container">
        {prendas.map((p) => (
          <PrendaCard key={p.id} prenda={p} />
        ))}
      </div>
    </div>
  );
}

export default App;