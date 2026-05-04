import { useEffect, useState } from "react";
import { getPrendas, getFavoritos, getOutfits, crearOutfit } from "./api";
import PrendaCard from "./PrendaCard";
import Formulario from "./Formulario";
import "./App.css";

function App() {
  const [todasPrendas, setTodasPrendas] = useState([]);
  const [prendas, setPrendas] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [seleccion, setSeleccion] = useState([]);
  const [cajonActual, setCajonActual] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [modo, setModo] = useState("light");
  const [vista, setVista] = useState("armario");
  const [cajonesExtra, setCajonesExtra] = useState([]);
  const [filtro, setFiltro] = useState({ color: "", talla: "", marca: "" });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const tallas = ["XXS","XS","S","M","L","XL","XXL"];
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

  const cargarFavoritos = async () => {
    const data = await getFavoritos();
    setFavoritos(data);
  };

  const cargarOutfits = async () => {
    const data = await getOutfits();
    setOutfits(data);
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

  const toggleSeleccion = (id) => {
    setSeleccion(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const crearNuevoOutfit = async () => {
    const nombre = prompt("Nombre del outfit:");
    if (!nombre || seleccion.length === 0) return;
    await crearOutfit(nombre, seleccion);
    setSeleccion([]);
    cargarOutfits();
  };

  const filtrar = (p) => {
    return (
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
      p.color.toLowerCase().includes(filtro.color.toLowerCase()) &&
      p.talla.toLowerCase().includes(filtro.talla.toLowerCase()) &&
      p.marca.toLowerCase().includes(filtro.marca.toLowerCase())
    );
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

      <div className="center-buttons">
        <button onClick={() => {
          setVista("armario");
          setCajonActual(null);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}>
          Armario
        </button>

        <button onClick={() => {
          setVista("favoritos");
          cargarFavoritos();
        }}>
          Favoritos ⭐
        </button>

        <button onClick={() => {
          setVista("outfits");
          cargarOutfits();
        }}>
          Outfits 👕
        </button>
      </div>

      {vista === "armario" && !cajonActual && (
        <>
          <div className="hero">
            <h2>Organiza tu armario fácilmente</h2>
          </div>

          <div className="cajones-mini">
            {cajones.map(c => {
              const cantidad = todasPrendas.filter(p => p.cajon === c).length;
              const esBase = cajonesBase.includes(c);

              return (
                <div
                  key={c}
                  className="cajon-chip"
                  onClick={() => setCajonActual(c)}
                >
                  {c}
                  <span>{cantidad}</span>

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

            <div className="cajon-chip add" onClick={crearCajon}>+</div>
          </div>

          <div className="center-buttons">
            <input
              placeholder="Buscar..."
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <button onClick={() => setMostrarFiltros(true)}>Filtros</button>
          </div>

          <div className="prenda-container">
            {todasPrendas.filter(filtrar).map(p => (
              <PrendaCard key={p.id} prenda={p} onDelete={cargarPrendas} onFav={cargarPrendas} />
            ))}
          </div>
        </>
      )}

      {vista === "armario" && cajonActual && (
        <div className="fade-in">
          <h2 style={{ textAlign: "center" }}>{cajonActual.toUpperCase()}</h2>

          <div className="center-buttons">
            <button onClick={() => {
              setCajonActual(null);
              setMostrarForm(false);
            }}>
              ⬅ Volver
            </button>

            <button onClick={() => setMostrarForm(true)}>
              Añadir prenda +
            </button>
          </div>

          <div className="center-buttons">
            <input
              placeholder="Buscar..."
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <button onClick={() => setMostrarFiltros(true)}>Filtros</button>
          </div>

          {mostrarForm && (
            <Formulario
              cajon={cajonActual}
              onAdd={async () => {
                await cargarPrendas();
                setMostrarForm(false);
              }}
            />
          )}

          <div className="prenda-container">
            {prendas.filter(filtrar).map(p => (
              <div key={p.id} onClick={() => toggleSeleccion(p.id)}>
                <PrendaCard prenda={p} onDelete={cargarPrendas} onFav={cargarPrendas} />
              </div>
            ))}
          </div>
        </div>
      )}

      {mostrarFiltros && (
        <div className="filtros-overlay">
          <div className="filtros-panel">
            <h3>Filtros</h3>

            <select onChange={(e) => setFiltro({ ...filtro, talla: e.target.value })}>
              <option value="">Talla</option>
              {tallas.map(t => <option key={t}>{t}</option>)}
            </select>

            <input placeholder="Color" onChange={(e) => setFiltro({ ...filtro, color: e.target.value })} />
            <input placeholder="Marca" onChange={(e) => setFiltro({ ...filtro, marca: e.target.value })} />

            <div className="filtros-actions">
              <button onClick={() => setFiltro({ color: "", talla: "", marca: "" })}>
                Limpiar
              </button>
              <button onClick={() => setMostrarFiltros(false)}>
                Hecho
              </button>
            </div>
          </div>
        </div>
      )}

      {vista === "favoritos" && (
        <div className="prenda-container">
          {favoritos.map(p => (
            <PrendaCard key={p.id} prenda={p} onDelete={cargarFavoritos} onFav={cargarFavoritos} />
          ))}
        </div>
      )}

      {vista === "outfits" && (
        <>
          <div className="center-buttons">
            <button onClick={crearNuevoOutfit}>Crear outfit</button>
          </div>

          {outfits.map(o => (
            <div key={o.id}>
              <h3 style={{ textAlign: "center" }}>{o.nombre}</h3>
              <div className="prenda-container">
                {o.prendas.map(p => (
                  <PrendaCard key={p.id} prenda={p} />
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default App;