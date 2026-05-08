import { useEffect, useState } from "react";
import {
  getPrendas,
  getFavoritos,
  getOutfits,
  getCajones,
  crearOutfit,
  deleteOutfit,
  deleteCajon,
  crearCajon,
  updatePrenda,
} from "./api";
import PrendaCard from "./PrendaCard";
import Formulario from "./Formulario";
import CrearOutfit from "./CrearOutfit";
import { useDialogo } from "./Dialogo";
import "./App.css";

const CAJONES_BASE = ["camisetas", "pantalones", "zapatos", "vestidos"];

function App() {
  const [todasPrendas, setTodasPrendas] = useState([]);
  const [prendas, setPrendas] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [cajonesDB, setCajonesDB] = useState([]);

  const [cajonActual, setCajonActual] = useState(null);
  const [seleccion, setSeleccion] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState({ color: "", talla: "", marca: "" });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarCrearOutfit, setMostrarCrearOutfit] = useState(false);
  const [modo, setModo] = useState("light");
  const [vista, setVista] = useState("armario");

  const { dialogo, confirmar, pedir } = useDialogo();

  const cajones = [
    ...new Set([
      ...CAJONES_BASE,
      ...cajonesDB.map((c) => c.nombre),
    ]),
  ];

  const cargarPrendas = async () => {
    const data = await getPrendas();
    setTodasPrendas(data);

    if (cajonActual) {
      setPrendas(data.filter((p) => p.cajon === cajonActual));
    }
  };

  const cargarFavoritos = async () => setFavoritos(await getFavoritos());
  const cargarOutfits = async () => setOutfits(await getOutfits());
  const cargarCajones = async () => setCajonesDB(await getCajones());

  useEffect(() => {
    cargarPrendas();
    cargarCajones();
  }, []);

  useEffect(() => {
    cargarPrendas();
  }, [cajonActual]);

  useEffect(() => {
    document.body.className = modo;
  }, [modo]);

  const crearCajonNuevo = async () => {
    const nuevo = await pedir("Nombre del nuevo cajón:", "ej: verano");

    if (nuevo) {
      await crearCajon(nuevo.toLowerCase());
      cargarCajones();
    }
  };

  const borrarCajon = async (c) => {
    const ok = await confirmar(`¿Borrar el cajón "${c}"? Las prendas no se eliminarán.`);

    if (!ok) return;

    await deleteCajon(c);

    if (cajonActual === c) setCajonActual(null);

    cargarPrendas();
    cargarCajones();
  };

  const toggleSeleccion = (id) => {
    setSeleccion((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const crearNuevoOutfit = async () => {
    if (seleccion.length === 0) {
      alert("Selecciona al menos una prenda del armario primero.");
      return;
    }

    const nombre = prompt("Nombre del outfit:");

    if (!nombre || !nombre.trim()) return;

    const res = await crearOutfit(nombre.trim(), seleccion);

    if (res.ok) {
      setSeleccion([]);
      cargarOutfits();
    } else {
      alert("Error al crear el outfit: " + (res.error || "desconocido"));
    }
  };

  const borrarOutfit = async (id) => {
    const ok = await confirmar("¿Borrar este outfit?");

    if (!ok) return;

    await deleteOutfit(id);
    cargarOutfits();
  };

  const toggleFav = async (prenda) => {
    await updatePrenda(prenda.id, {
      favorito: prenda.favorito == 1 ? 0 : 1,
    });

    cargarFavoritos();
  };

  const filtrar = (p) =>
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) &&
    p.color?.toLowerCase().includes(filtro.color.toLowerCase()) &&
    p.talla?.toLowerCase().includes(filtro.talla.toLowerCase()) &&
    p.marca?.toLowerCase().includes(filtro.marca.toLowerCase());

  return (
    <div>
      <div className="toggle-container">
        <span>☀️</span>

        <label className="switch">
          <input
            type="checkbox"
            onChange={() =>
              setModo(modo === "light" ? "dark" : "light")
            }
          />
          <span className="slider"></span>
        </label>

        <span>🌙</span>
      </div>

      <h1>Armario Virtual</h1>

      <div className="center-buttons">
        <button
          onClick={() => {
            setVista("armario");
            setCajonActual(null);

            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
        >
          Armario
        </button>

        <button
          onClick={() => {
            setVista("favoritos");
            cargarFavoritos();
          }}
        >
          Favoritos
        </button>

        <button
          onClick={() => {
            setVista("outfits");
            cargarOutfits();
          }}
        >
          Outfits
        </button>
      </div>

      {vista === "armario" && !cajonActual && (
        <>
          <div className="hero">
            <h2>Organiza tu armario fácilmente</h2>
          </div>

          <div className="cajones-mini">
            {cajones.map((c) => {
              const cantidad = todasPrendas.filter(
                (p) => p.cajon === c
              ).length;

              const esBase = CAJONES_BASE.includes(c);

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

            <div
              className="cajon-chip add"
              onClick={crearCajonNuevo}
            >
              +
            </div>
          </div>

          <div className="center-buttons">
            <input
              placeholder="Buscar..."
              onChange={(e) => setBusqueda(e.target.value)}
            />

            <button onClick={() => setMostrarFiltros(true)}>
              Filtros
            </button>
          </div>

          <div className="prenda-container">
            {todasPrendas.filter(filtrar).map((p) => (
              <PrendaCard
                key={p.id}
                prenda={p}
                cajones={cajones}
                onDelete={cargarPrendas}
                onUpdate={cargarPrendas}
              />
            ))}
          </div>
        </>
      )}

      {vista === "armario" && cajonActual && (
        <div className="fade-in">
          <h2 style={{ textAlign: "center" }}>
            {cajonActual.toUpperCase()}
          </h2>

          <div className="center-buttons">
            <button
              onClick={() => {
                setCajonActual(null);
                setMostrarForm(false);
              }}
            >
              ⬅ Volver
            </button>

            <button
              onClick={() =>
                setMostrarForm((prev) => !prev)
              }
            >
              Añadir prenda +
            </button>
          </div>

          <div className="center-buttons">
            <input
              placeholder="Buscar..."
              onChange={(e) => setBusqueda(e.target.value)}
            />

            <button onClick={() => setMostrarFiltros(true)}>
              Filtros
            </button>
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
            {prendas.filter(filtrar).map((p) => (
              <PrendaCard
                key={p.id}
                prenda={p}
                cajones={cajones}
                onDelete={cargarPrendas}
                onUpdate={cargarPrendas}
              />
            ))}
          </div>
        </div>
      )}

      {mostrarFiltros && (
        <div className="filtros-overlay">
          <div className="filtros-panel">
            <h3>Filtros</h3>

            <select
              onChange={(e) =>
                setFiltro({
                  ...filtro,
                  talla: e.target.value,
                })
              }
            >
              <option value="">Talla</option>

              <optgroup label="Ropa">
                {["XXS", "XS", "S", "M", "L", "XL", "XXL"].map(
                  (t) => (
                    <option key={t}>{t}</option>
                  )
                )}
              </optgroup>

              <optgroup label="Zapatos">
                {Array.from(
                  { length: 11 },
                  (_, i) => String(36 + i)
                ).map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </optgroup>
            </select>

            <input
              placeholder="Color"
              onChange={(e) =>
                setFiltro({
                  ...filtro,
                  color: e.target.value,
                })
              }
            />

            <input
              placeholder="Marca"
              onChange={(e) =>
                setFiltro({
                  ...filtro,
                  marca: e.target.value,
                })
              }
            />

            <div className="filtros-actions">
              <button
                onClick={() =>
                  setFiltro({
                    color: "",
                    talla: "",
                    marca: "",
                  })
                }
              >
                Limpiar
              </button>

              <button
                onClick={() => setMostrarFiltros(false)}
              >
                Hecho
              </button>
            </div>
          </div>
        </div>
      )}

      {vista === "favoritos" && (
        <>
          {favoritos.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                marginTop: 40,
              }}
            >
              No tienes prendas favoritas aún ⭐
            </p>
          ) : (
            <div className="prenda-container">
              {favoritos.map((p) => (
                <PrendaCard
                  key={p.id}
                  prenda={p}
                  cajones={cajones}
                  onDelete={cargarFavoritos}
                  onUpdate={cargarFavoritos}
                />
              ))}
            </div>
          )}
        </>
      )}

      {vista === "outfits" && (
        <>
          <div className="center-buttons">
            <button
              onClick={() =>
                setMostrarCrearOutfit(true)
              }
            >
              ✨ Crear outfit
            </button>
          </div>

          {outfits.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                marginTop: 40,
              }}
            >
              No hay outfits todavía 👗
            </p>
          ) : (
            outfits.map((o) => (
              <div key={o.id}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                  }}
                >
                  <h3 style={{ textAlign: "center" }}>
                    {o.nombre}
                  </h3>

                  <button
                    onClick={() => borrarOutfit(o.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 16,
                    }}
                  >
                    🗑️
                  </button>
                </div>

                <div className="prenda-container">
                  {o.prendas.map((p) => (
                    <PrendaCard
                      key={p.id}
                      prenda={p}
                    />
                  ))}
                </div>
              </div>
            ))
          )}


          {mostrarCrearOutfit && (
            <CrearOutfit
              onCreado={() => {
                setMostrarCrearOutfit(false);
                cargarOutfits();
              }}
              onCerrar={() =>
                setMostrarCrearOutfit(false)
              }
            />
          )}
        </>
      )}

      {dialogo}
    </div>
  );
}

export default App;