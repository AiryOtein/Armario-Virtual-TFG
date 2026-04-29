import { useEffect, useState } from "react";
import { getPrendas } from "./api";
import PrendaCard from "./PrendaCard";
import Formulario from "./Formulario";
import "./App.css";

function App() {
  const [prendas, setPrendas] = useState([]);
  const [modo, setModo] = useState("light");

  const cargarPrendas = async () => {
    const data = await getPrendas();
    setPrendas(data);
  };

  useEffect(() => {
    cargarPrendas();
  }, []);

  useEffect(() => {
    document.body.className = modo;
  }, [modo]);

  const toggleModo = () => {
    setModo(modo === "light" ? "dark" : "light");
  };

  return (
    <div>
      <h1>Armario Virtual</h1>

      <div className="toggle-container">
        <span>☀️</span>

        <label className="switch">
          <input
            type="checkbox"
            onChange={toggleModo}
            checked={modo === "dark"}
          />
          <span className="slider"></span>
        </label>

        <span>🌙</span>
      </div>

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