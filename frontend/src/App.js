import { useEffect, useState } from "react";
import { getPrendas } from "./api";
import PrendaCard from "./PrendaCard";
import Formulario from "./Formulario";

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
      <h1>Armario Virtual</h1>

      <Formulario onAdd={cargarPrendas} />

      {prendas.map((p) => (
        <PrendaCard key={p.id} prenda={p} />
      ))}
    </div>
  );
}

export default App;