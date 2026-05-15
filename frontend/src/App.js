import { useEffect, useState } from "react";
import { getPrendas, getFavoritos, getOutfits, getCajones, deleteOutfit, deleteCajon, crearCajon, getSesion, logout } from "./api";
import PrendaCard from "./PrendaCard";
import Formulario from "./Formulario";
import CrearOutfit from "./CrearOutfit";
import EditarOutfit from "./EditarOutfit";
import Login from "./Login";
import { useDialogo } from "./Dialogo";
import "./App.css";

const CAJONES_BASE  = ["camisetas", "pantalones", "zapatos", "vestidos"];
const COLORES_LISTA = ["Negro","Blanco","Gris","Beige","Marrón","Rojo","Rosa","Naranja","Amarillo","Verde","Azul","Morado","Lila","Azul marino","Verde oliva"];
const MARCAS_LISTA  = ["Zara","H&M","Mango","Pull&Bear","Bershka","Stradivarius","Nike","Adidas","New Balance","Puma","Vans","Converse","Levi's","COS","Otra Tienda"];
const TALLAS_ROPA   = ["XXS","XS","S","M","L","XL","XXL"];
const TALLAS_ZAPATO = Array.from({ length: 11 }, (_, i) => String(36 + i));

function App() {
  const [usuario,      setUsuario]      = useState(null);
  const [cargandoSes,  setCargandoSes]  = useState(true);

  const [todasPrendas, setTodasPrendas] = useState([]);
  const [prendas,      setPrendas]      = useState([]);
  const [favoritos,    setFavoritos]    = useState([]);
  const [outfits,      setOutfits]      = useState([]);
  const [cajonesDB,    setCajonesDB]    = useState([]);

  const [cajonActual,        setCajonActual]        = useState(null);
  const [mostrarForm,        setMostrarForm]        = useState(false);
  const [mostrarFormGlobal,  setMostrarFormGlobal]  = useState(false);
  const [busqueda,           setBusqueda]           = useState("");
  const [filtro,             setFiltro]             = useState({ colores: [], tallas: [], marcas: [] });
  const [filtrosActivos,     setFiltrosActivos]     = useState({ colores: [], tallas: [], marcas: [] });
  const [mostrarFiltros,     setMostrarFiltros]     = useState(false);
  const [mostrarCrearOutfit, setMostrarCrearOutfit] = useState(false);
  const [editandoOutfit,     setEditandoOutfit]     = useState(null);
  const [modo,               setModo]               = useState("light");
  const [vista,              setVista]              = useState("armario");

  const { dialogo, confirmar, pedir, elegir } = useDialogo();

  const cajones = [...new Set([...CAJONES_BASE, ...cajonesDB.map((c) => c.nombre)])];

  useEffect(() => {
    getSesion().then((data) => {
      if (data.ok) setUsuario({ id: data.id, nombre: data.nombre });
      setCargandoSes(false);
    });
  }, []);

  useEffect(() => { document.body.className = modo; }, [modo]);

  useEffect(() => {
    if (usuario) { cargarPrendas(); cargarCajones(); }
  }, [usuario]);

  useEffect(() => {
    if (usuario) cargarPrendas();
  }, [cajonActual]);

  const cargarPrendas = async () => {
    const data = await getPrendas();
    const lista = Array.isArray(data) ? data : [];
    setTodasPrendas(lista);
    if (cajonActual) setPrendas(lista.filter((p) => p.cajon === cajonActual));
  };

  const cargarFavoritos = async () => {
    const data = await getFavoritos();
    setFavoritos(Array.isArray(data) ? data : []);
  };

  const cargarOutfits = async () => {
    const data = await getOutfits();
    setOutfits(Array.isArray(data) ? data : []);
  };

  const cargarCajones = async () => {
    const data = await getCajones();
    setCajonesDB(Array.isArray(data) ? data : []);
  };

  const crearCajonNuevo = async () => {
    const nuevo = await pedir("Nombre del nuevo cajón:", "ej: tacones");
    if (!nuevo) return;
    const tipoTalla = await elegir("¿Qué tipo de talla usa este cajón?", [
      { valor: "letras",  label: "Letras",  sub: "XXS, XS, S, M, L, XL, XXL" },
      { valor: "numeros", label: "Números", sub: "36, 37, 38 ... 46" },
    ]);
    if (!tipoTalla) return;
    await crearCajon(nuevo.toLowerCase(), tipoTalla);
    cargarCajones();
  };

  const borrarCajon = async (c) => {
    const ok = await confirmar(`¿Borrar el cajón "${c.toUpperCase()}"? Las prendas no se eliminarán.`);
    if (!ok) return;
    await deleteCajon(c);
    if (cajonActual === c) setCajonActual(null);
    cargarPrendas(); cargarCajones();
  };

  const borrarOutfit = async (id) => {
    const ok = await confirmar("¿Borrar este outfit?");
    if (!ok) return;
    await deleteOutfit(id);
    cargarOutfits();
  };

  const toggleFiltro = (tipo, valor) => {
    setFiltro((prev) => {
      const lista = prev[tipo];
      return { ...prev, [tipo]: lista.includes(valor) ? lista.filter(x => x !== valor) : [...lista, valor] };
    });
  };

  const aplicarFiltros = () => { setFiltrosActivos({ ...filtro }); setMostrarFiltros(false); };
  const cerrarFiltros  = () => { setFiltro({ ...filtrosActivos }); setMostrarFiltros(false); };
  const limpiarFiltros = () => {
    const vacio = { colores: [], tallas: [], marcas: [] };
    setFiltro(vacio); setFiltrosActivos(vacio);
  };
  const hayFiltrosActivos = filtrosActivos.colores.length || filtrosActivos.tallas.length || filtrosActivos.marcas.length;

  const filtrar = (p) => {
    const q = busqueda.toLowerCase();
    const coincideBusqueda = !q || (
      p.nombre?.toLowerCase().includes(q) || p.color?.toLowerCase().includes(q) ||
      p.marca?.toLowerCase().includes(q)  || p.tipo?.toLowerCase().includes(q)  ||
      p.talla?.toLowerCase().includes(q)  || p.cajon?.toLowerCase().includes(q)
    );
    const coincideColor = !filtrosActivos.colores.length || filtrosActivos.colores.some(c => p.color?.toLowerCase() === c.toLowerCase());
    const coincideTalla = !filtrosActivos.tallas.length  || filtrosActivos.tallas.some(t => p.talla?.toLowerCase() === t.toLowerCase());
    const coincideMarca = !filtrosActivos.marcas.length  || filtrosActivos.marcas.some(m => p.marca?.toLowerCase().includes(m.toLowerCase()));
    return coincideBusqueda && coincideColor && coincideTalla && coincideMarca;
  };

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("armario_token");
    setUsuario(null);
    setTodasPrendas([]); setPrendas([]); setFavoritos([]); setOutfits([]); setCajonesDB([]);
    setCajonActual(null); setVista("armario");
  };

  if (cargandoSes) return <div className="login-fondo"><p style={{ color: "#a67c52" }}>Cargando...</p></div>;
  if (!usuario)    return <Login onLogin={setUsuario} />;

  return (
    <div className="app-wrapper">

      <header className="app-header">
        <div className="app-header-logo">
          <span className="app-header-title">Tu armario virtual</span>
        </div>
        <nav className="app-nav">
          {[["armario","Armario"], ["favoritos","Favoritos"], ["outfits","Outfits"]].map(([v, label]) => (
            <button
              key={v}
              className={`nav-btn ${vista === v ? "nav-btn--activo" : ""}`}
              onClick={() => {
                setVista(v); setCajonActual(null);
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
          <span className="header-usuario">Hola, {usuario.nombre}</span>
          <div className="header-separador" />
          <button className="btn-logout" onClick={async () => {
            const ok = await confirmar("¿Cerrar sesión?", "Cerrar sesión");
            if (ok) handleLogout();
          }}>
            Cerrar sesión
          </button>
          <div className="header-separador" />
          <div className="toggle-container">
            <span>☀</span>
            <label className="switch">
              <input type="checkbox" onChange={() => setModo(modo === "light" ? "dark" : "light")} />
              <span className="slider"></span>
            </label>
            <span>☽</span>
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
              <input className="input-busqueda" placeholder="Buscar por nombre, color, marca..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
              <button className={`btn-filtros ${hayFiltrosActivos ? "btn-filtros--activo" : ""}`} onClick={() => setMostrarFiltros(true)}>
                Filtros {hayFiltrosActivos ? "●" : ""}
              </button>
              <button className="btn-añadir" onClick={() => setMostrarFormGlobal((prev) => !prev)}>
                {mostrarFormGlobal ? "✕ Cancelar" : "+ Añadir prenda"}
              </button>
            </div>

            {mostrarFormGlobal && (
              <Formulario cajon="" cajones={cajones} cajonesDB={cajonesDB} onAdd={async () => { await cargarPrendas(); setMostrarFormGlobal(false); }} />
            )}

            <div className="prenda-container">
              {todasPrendas.filter(filtrar).map((p) => (
                <PrendaCard key={p.id} prenda={p} cajones={cajones} onDelete={cargarPrendas} onUpdate={() => { setBusqueda(""); cargarPrendas(); }} />
              ))}
            </div>
          </>
        )}

        {vista === "armario" && cajonActual && (
          <div className="fade-in">
            <div className="cajon-header">
              <h2 className="cajon-titulo">{cajonActual.toUpperCase()}</h2>
              <div className="cajon-header-botones">
                <button className="btn-volver" onClick={() => { setCajonActual(null); setMostrarForm(false); }}>← Volver</button>
                <button className="btn-añadir" onClick={() => setMostrarForm((prev) => !prev)}>
                  {mostrarForm ? "✕ Cancelar" : "+ Añadir prenda"}
                </button>
              </div>
            </div>

            <div className="barra-acciones">
              <input className="input-busqueda" placeholder="Buscar por nombre, color, marca..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
              <button className={`btn-filtros ${hayFiltrosActivos ? "btn-filtros--activo" : ""}`} onClick={() => setMostrarFiltros(true)}>
                Filtros {hayFiltrosActivos ? "●" : ""}
              </button>
            </div>

            {mostrarForm && (
              <Formulario cajon={cajonActual} cajones={cajones} cajonesDB={cajonesDB} onAdd={async () => { await cargarPrendas(); setMostrarForm(false); }} />
            )}

            <div className="prenda-container">
              {prendas.filter(filtrar).map((p) => (
                <PrendaCard key={p.id} prenda={p} cajones={cajones} onDelete={cargarPrendas} onUpdate={() => { setBusqueda(""); cargarPrendas(); }} />
              ))}
            </div>
          </div>
        )}

        {mostrarFiltros && (
          <div className="filtros-overlay" onClick={cerrarFiltros}>
            <div className="filtros-panel" onClick={(e) => e.stopPropagation()}>
              <h3 style={{ margin: "0 0 4px" }}>Filtros</h3>

              <label>Color</label>
              <div className="filtro-chips">
                {COLORES_LISTA.map((c) => (
                  <div key={c} className={`filtro-chip ${filtro.colores.includes(c) ? "activo" : ""}`} onClick={() => toggleFiltro("colores", c)}>{c}</div>
                ))}
              </div>

              <label>Talla — Ropa</label>
              <div className="filtro-chips">
                {TALLAS_ROPA.map((t) => (
                  <div key={t} className={`filtro-chip ${filtro.tallas.includes(t) ? "activo" : ""}`} onClick={() => toggleFiltro("tallas", t)}>{t}</div>
                ))}
              </div>

              <label>Talla — Zapatos</label>
              <div className="filtro-chips">
                {TALLAS_ZAPATO.map((t) => (
                  <div key={t} className={`filtro-chip ${filtro.tallas.includes(t) ? "activo" : ""}`} onClick={() => toggleFiltro("tallas", t)}>{t}</div>
                ))}
              </div>

              <label>Marca</label>
              <div className="filtro-chips">
                {MARCAS_LISTA.map((m) => (
                  <div key={m} className={`filtro-chip ${filtro.marcas.includes(m) ? "activo" : ""}`} onClick={() => toggleFiltro("marcas", m)}>{m}</div>
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
          <div className="fade-in">
            <section className="vista-seccion">
              <h2 className="vista-titulo">Favoritos</h2>
              <p className="vista-sub">Las prendas que más te gustan, siempre a mano.</p>
            </section>
            {favoritos.length === 0
              ? <p className="vista-vacia">Todavía no tienes prendas marcadas como favoritas. Pulsa la estrella en cualquier prenda para añadirla aquí.</p>
              : <div className="prenda-container">
                  {favoritos.map((p) => (
                    <PrendaCard key={p.id} prenda={p} cajones={cajones} onDelete={() => { cargarPrendas(); cargarFavoritos(); }} onUpdate={() => { cargarPrendas(); cargarFavoritos(); }} />
                  ))}
                </div>
            }
          </div>
        )}

        {vista === "outfits" && (
          <div className="fade-in">
            <section className="vista-seccion">
              <h2 className="vista-titulo">Outfits</h2>
              <p className="vista-sub">Combina tus prendas y guarda tus looks favoritos.</p>
              <button className="btn-añadir" onClick={() => setMostrarCrearOutfit(true)}>+ Crear outfit</button>
            </section>

            {outfits.length === 0
              ? <p className="vista-vacia">Aún no has creado ningún outfit. Pulsa el botón de arriba para empezar a combinar prendas.</p>
              : outfits.map((o) => (
                <div key={o.id} className="outfit-bloque">
                  <div className="outfit-bloque-header">
                    <h3 className="outfit-bloque-nombre">{o.nombre}</h3>
                    <div className="outfit-bloque-acciones">
                      <button className="btn-secundario" onClick={() => setEditandoOutfit(o)}>Editar</button>
                      <button className="btn-peligro"    onClick={() => borrarOutfit(o.id)}>Eliminar</button>
                    </div>
                  </div>
                  <div className="outfit-prendas-grid">
                    {o.prendas.map((p) => (
                      <PrendaCard key={p.id} prenda={p} cajones={cajones} onDelete={() => { cargarPrendas(); cargarOutfits(); }} onUpdate={() => { cargarPrendas(); cargarOutfits(); }} />
                    ))}
                  </div>
                </div>
              ))
            }

            {mostrarCrearOutfit && (
              <CrearOutfit onCreado={() => { setMostrarCrearOutfit(false); cargarOutfits(); }} onCerrar={() => setMostrarCrearOutfit(false)} />
            )}

            {editandoOutfit && (
              <EditarOutfit
                outfit={editandoOutfit}
                onGuardar={() => { setEditandoOutfit(null); cargarOutfits(); }}
                onCerrar={() => setEditandoOutfit(null)}
              />
            )}
          </div>
        )}

        {dialogo}
      </main>
    </div>
  );
}

export default App;