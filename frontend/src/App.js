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

const CAJONES_BASE  = ["camisetas", "pantalones", "zapatos", "vestidos"];
const COLORES_LISTA = ["Negro","Blanco","Gris","Beige","Marrón","Rojo","Rosa","Naranja","Amarillo","Verde","Azul","Morado","Lila"];
const MARCAS_LISTA  = ["Zara","H&M","Mango","Pull&Bear","Bershka","Stradivarius","Nike","Adidas","New Balance","Puma","Vans","Converse","Levi's","COS","& Otras Tiendas"];
const TALLAS_ROPA   = ["XXS","XS","S","M","L","XL","XXL"];
const TALLAS_ZAPATO = Array.from({ length: 11 }, (_, i) => String(36 + i));

function App() {
  const [todasPrendas, setTodasPrendas] = useState([]);
  const [prendas,      setPrendas]      = useState([]);
  const [favoritos,    setFavoritos]    = useState([]);
  const [outfits,      setOutfits]      = useState([]);
  const [cajonesDB,    setCajonesDB]    = useState([]);

  const [cajonActual,        setCajonActual]        = useState(null);
  const [mostrarForm,        setMostrarForm]        = useState(false);
  const [mostrarFormGlobal,  setMostrarFormGlobal]  = useState(false);
  const [busqueda,           setBusqueda]           = useState("");
  const [filtro,             setFiltro]             = useState({ color: "", talla: "", marca: "" });
  const [filtrosActivos,     setFiltrosActivos]     = useState({ color: "", talla: "", marca: "" });
  const [mostrarFiltros,     setMostrarFiltros]     = useState(false);
  const [mostrarCrearOutfit, setMostrarCrearOutfit] = useState(false);
  const [modo,               setModo]               = useState("light");
  const [vista,              setVista]              = useState("armario");

  const { dialogo, confirmar, pedir } = useDialogo();

  const cajones = [...new Set([...CAJONES_BASE, ...cajonesDB.map((c) => c.nombre)])];

  const cargarPrendas = async () => {
    const data = await getPrendas();
    setTodasPrendas(data);
    if (cajonActual) setPrendas(data.filter((p) => p.cajon === cajonActual));
  };

  const cargarFavoritos = async () => setFavoritos(await getFavoritos());
  const cargarOutfits   = async () => setOutfits(await getOutfits());
  const cargarCajones   = async () => setCajonesDB(await getCajones());

  useEffect(() => { cargarPrendas(); cargarCajones(); }, []);
  useEffect(() => { cargarPrendas(); }, [cajonActual]);
  useEffect(() => { document.body.className = modo; }, [modo]);

  const crearCajonNuevo = async () => {
    const nuevo = await pedir("Nombre del nuevo cajón:", "ej: verano");
    if (nuevo) { await crearCajon(nuevo.toLowerCase()); cargarCajones(); }
  };

  const borrarCajon = async (c) => {
    const ok = await confirmar(`¿Borrar el cajón "${c.toUpperCase()}"? Las prendas no se eliminarán.`);
    if (!ok) return;
    await deleteCajon(c);
    if (cajonActual === c) setCajonActual(null);
    cargarPrendas();
    cargarCajones();
  };

  const borrarOutfit = async (id) => {
    const ok = await confirmar("¿Borrar este outfit?");
    if (!ok) return;
    await deleteOutfit(id);
    cargarOutfits();
  };

  const aplicarFiltros = () => {
    setFiltrosActivos({ ...filtro });
    setMostrarFiltros(false);
  };

  const limpiarFiltros = () => {
    setFiltro({ color: "", talla: "", marca: "" });
    setFiltrosActivos({ color: "", talla: "", marca: "" });
  };

  const hayFiltrosActivos = filtrosActivos.color || filtrosActivos.talla || filtrosActivos.marca;

  const filtrar = (p) => {
    const q = busqueda.toLowerCase();
    const coincideBusqueda = !q || (
      p.nombre?.toLowerCase().includes(q) ||
      p.color?.toLowerCase().includes(q)  ||
      p.marca?.toLowerCase().includes(q)  ||
      p.tipo?.toLowerCase().includes(q)   ||
      p.talla?.toLowerCase().includes(q)  ||
      p.cajon?.toLowerCase().includes(q)
    );
    return (
      coincideBusqueda &&
      (!filtrosActivos.color || p.color?.toLowerCase() === filtrosActivos.color.toLowerCase()) &&
      (!filtrosActivos.talla || p.talla?.toLowerCase() === filtrosActivos.talla.toLowerCase()) &&
      (!filtrosActivos.marca || p.marca?.toLowerCase().includes(filtrosActivos.marca.toLowerCase()))
    );
  };

  return (
    <div className="app-wrapper">

      <header className="app-header">
        <div className="app-header-logo">
          <span className="app-header-title">Tu Armario Vitual</span>
        </div>
        <nav className="app-nav">
          {[["armario","Armario"], ["favoritos","Favoritos"], ["outfits","Outfits"]].map(([v, label]) => (
            <button
              key={v}
              className={`nav-btn ${vista === v ? "nav-btn--activo" : ""}`}
              onClick={() => {
                setVista(v);
                setCajonActual(null);
                if (v === "favoritos") cargarFavoritos();
                if (v === "outfits")   cargarOutfits();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="app-header-right">
          <div className="toggle-container">
            <span>☀️</span>
            <label className="switch">
              <input type="checkbox" onChange={() => setModo(modo === "light" ? "dark" : "light")} />
              <span className="slider"></span>
            </label>
            <span>🌙</span>
          </div>
        </div>
      </header>

      <main className="app-main">

      {vista === "armario" && !cajonActual && (
        <>
          <section className="hero">
            <h1 className="hero-title">Tu armario, organizado.</h1>
            <p className="hero-sub">{todasPrendas.length} prendas guardadas</p>
          </section>

          <div className="cajones-mini">
            {cajones.map((c) => {
              const cantidad = todasPrendas.filter((p) => p.cajon === c).length;
              const esBase   = CAJONES_BASE.includes(c);
              return (
                <div key={c} className={`cajon-chip${!esBase ? " cajon-chip--borrable" : ""}`} onClick={() => setCajonActual(c)}>
                  {c.toUpperCase()}
                  <span>{cantidad}</span>
                  {!esBase && (
                    <span className="cajon-chip-x" onClick={(e) => { e.stopPropagation(); borrarCajon(c); }}>✕</span>
                  )}
                </div>
              );
            })}
            <div className="cajon-chip add" onClick={crearCajonNuevo}>+</div>
          </div>

          <div className="barra-acciones">
            <input
              className="input-busqueda"
              placeholder="Buscar por nombre, color, marca..."
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <button
              className={`btn-filtros ${hayFiltrosActivos ? "btn-filtros--activo" : ""}`}
              onClick={() => setMostrarFiltros(true)}
            >
              ⚙ Filtros {hayFiltrosActivos ? "●" : ""}
            </button>
            <button className="btn-añadir" onClick={() => setMostrarFormGlobal((prev) => !prev)}>
              + Añadir prenda
            </button>
          </div>

          {mostrarFormGlobal && (
            <Formulario
              cajon=""
              cajones={cajones}
              onAdd={async () => { await cargarPrendas(); setMostrarFormGlobal(false); }}
            />
          )}

          <div className="prenda-container">
            {todasPrendas.filter(filtrar).map((p) => (
              <PrendaCard key={p.id} prenda={p} cajones={cajones} onDelete={cargarPrendas} onUpdate={cargarPrendas} />
            ))}
          </div>
        </>
      )}

      {vista === "armario" && cajonActual && (
        <div className="fade-in">
          <div className="cajon-header">
            <h2 className="cajon-titulo">{cajonActual.toUpperCase()}</h2>
            <div className="cajon-header-botones">
              <button className="btn-volver" onClick={() => { setCajonActual(null); setMostrarForm(false); }}>
                ← Volver
              </button>
              <button className="btn-añadir" onClick={() => setMostrarForm((prev) => !prev)}>
                + Añadir prenda
              </button>
            </div>
          </div>

          <div className="barra-acciones">
            <input
              className="input-busqueda"
              placeholder="Buscar por nombre, color, marca..."
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <button
              className={`btn-filtros ${hayFiltrosActivos ? "btn-filtros--activo" : ""}`}
              onClick={() => setMostrarFiltros(true)}
            >
              ⚙ Filtros {hayFiltrosActivos ? "●" : ""}
            </button>
          </div>

          {mostrarForm && (
            <Formulario
              cajon={cajonActual}
              cajones={cajones}
              onAdd={async () => { await cargarPrendas(); setMostrarForm(false); }}
            />
          )}

          <div className="prenda-container">
            {prendas.filter(filtrar).map((p) => (
              <PrendaCard key={p.id} prenda={p} cajones={cajones} onDelete={cargarPrendas} onUpdate={cargarPrendas} />
            ))}
          </div>
        </div>
      )}

      {mostrarFiltros && (
        <div className="filtros-overlay" onClick={() => setMostrarFiltros(false)}>
          <div className="filtros-panel" onClick={(e) => e.stopPropagation()}>
            <h3>Filtros</h3>

            <label>Color</label>
            <div className="filtro-chips">
              {COLORES_LISTA.map((c) => (
                <div
                  key={c}
                  className={`filtro-chip ${filtro.color === c ? "activo" : ""}`}
                  onClick={() => setFiltro({ ...filtro, color: filtro.color === c ? "" : c })}
                >
                  {c}
                </div>
              ))}
            </div>

            <label>Talla — Ropa</label>
            <div className="filtro-chips">
              {TALLAS_ROPA.map((t) => (
                <div
                  key={t}
                  className={`filtro-chip ${filtro.talla === t ? "activo" : ""}`}
                  onClick={() => setFiltro({ ...filtro, talla: filtro.talla === t ? "" : t })}
                >
                  {t}
                </div>
              ))}
            </div>

            <label>Talla — Zapatos</label>
            <div className="filtro-chips">
              {TALLAS_ZAPATO.map((t) => (
                <div
                  key={t}
                  className={`filtro-chip ${filtro.talla === t ? "activo" : ""}`}
                  onClick={() => setFiltro({ ...filtro, talla: filtro.talla === t ? "" : t })}
                >
                  {t}
                </div>
              ))}
            </div>

            <label>Marca</label>
            <div className="filtro-chips">
              {MARCAS_LISTA.map((m) => (
                <div
                  key={m}
                  className={`filtro-chip ${filtro.marca === m ? "activo" : ""}`}
                  onClick={() => setFiltro({ ...filtro, marca: filtro.marca === m ? "" : m })}
                >
                  {m}
                </div>
              ))}
            </div>

            <div className="filtros-actions">
              <button className="btn-secundario" onClick={limpiarFiltros}>Limpiar</button>
              <button onClick={aplicarFiltros}>Aplicar</button>
            </div>
          </div>
        </div>
      )}

      {vista === "favoritos" && (
        <>
          {favoritos.length === 0
            ? <p style={{ textAlign: "center", marginTop: 40 }}>No tienes prendas favoritas aún ⭐</p>
            : (
              <div className="prenda-container">
                {favoritos.map((p) => (
                  <PrendaCard key={p.id} prenda={p} cajones={cajones} onDelete={cargarFavoritos} onUpdate={cargarFavoritos} />
                ))}
              </div>
            )}
        </>
      )}

      {vista === "outfits" && (
        <>
          <div className="center-buttons">
            <button onClick={() => setMostrarCrearOutfit(true)}>Crear outfit</button>
          </div>

          {outfits.length === 0
            ? <p style={{ textAlign: "center", marginTop: 40 }}>No hay outfits todavía 👗</p>
            : outfits.map((o) => (
              <div key={o.id}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <h3 style={{ textAlign: "center" }}>{o.nombre}</h3>
                  <button onClick={() => borrarOutfit(o.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>
                    🗑️
                  </button>
                </div>
                <div className="prenda-container">
                  {o.prendas.map((p) => (
                    <PrendaCard key={p.id} prenda={p} />
                  ))}
                </div>
              </div>
            ))}

          {mostrarCrearOutfit && (
            <CrearOutfit
              onCreado={() => { setMostrarCrearOutfit(false); cargarOutfits(); }}
              onCerrar={() => setMostrarCrearOutfit(false)}
            />
          )}
        </>
      )}

      {dialogo}
      </main>
    </div>
  );
}

export default App;