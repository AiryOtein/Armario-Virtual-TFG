import { useState } from "react";

function Formulario({ onAdd }) {
  const [form, setForm] = useState({
    nombre: "",
    tipo: "",
    color: "",
    talla: "",
    marca: "",
  });

  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    setImagen(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("nombre", form.nombre);
    data.append("tipo", form.tipo);
    data.append("color", form.color);
    data.append("talla", form.talla);
    data.append("marca", form.marca);
    data.append("imagen", imagen);

    await fetch("http://localhost/armario/upload_prenda.php", {
      method: "POST",
      body: data,
    });

    onAdd();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="nombre" placeholder="Nombre" onChange={handleChange} />
      <input name="tipo" placeholder="Tipo" onChange={handleChange} />
      <input name="color" placeholder="Color" onChange={handleChange} />
      <input name="talla" placeholder="Talla" onChange={handleChange} />
      <input name="marca" placeholder="Marca" onChange={handleChange} />

      <input type="file" onChange={handleImage} />

      {preview && <img src={preview} width="100" />}

      <button type="submit">Guardar</button>
    </form>
  );
}

export default Formulario;