import { useState } from "react";
import { addPrenda } from "./api";

function Formulario({ onAdd }) {
  const [form, setForm] = useState({
    nombre: "",
    tipo: "",
    color: "",
    talla: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addPrenda(form);
    onAdd();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="nombre" placeholder="Nombre" onChange={handleChange} />
      <input name="tipo" placeholder="Tipo" onChange={handleChange} />
      <input name="color" placeholder="Color" onChange={handleChange} />
      <input name="talla" placeholder="Talla" onChange={handleChange} />
      <button type="submit">Guardar</button>
    </form>
  );
}

export default Formulario;