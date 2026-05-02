import { useState } from "react";

function Formulario({ onAdd, cajon }) {
  const [form, setForm] = useState({
    nombre: "",
    tipo: "",
    color: "",
    talla: "",
    marca: "",
  });

  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);

  const tallas = ["XXS","XS","S","M","L","XL","XXL"];

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

    if (!form.nombre || !form.tipo || !form.color || !form.talla || !imagen) {
      alert("Completa todos los campos");
      return;
    }

    const data = new FormData();
    Object.keys(form).forEach(key => data.append(key, form[key]));
    data.append("cajon", cajon);
    data.append("imagen", imagen);

    await fetch("http://localhost/armario/backend/upload_prenda.php", {
      method: "POST",
      body: data,
    });

    onAdd();
  };

  return (
    <form onSubmit={handleSubmit} className="formulario fade-in">
      <input name="nombre" placeholder="Nombre" onChange={handleChange} />
      <input name="tipo" placeholder="Tipo" onChange={handleChange} />
      <input name="color" placeholder="Color" onChange={handleChange} />

      <select name="talla" onChange={handleChange}>
        <option value="">Selecciona talla</option>
        {tallas.map(t => <option key={t}>{t}</option>)}
      </select>

      <input name="marca" placeholder="Marca" onChange={handleChange} />

      <input type="file" onChange={handleImage} />

      {preview && <img src={preview} className="preview" />}

      <button type="submit">Guardar</button>
    </form>
  );
}

export default Formulario;