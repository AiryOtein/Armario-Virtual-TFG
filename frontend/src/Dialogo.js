import { useState, useRef } from "react";

export function Confirm({ mensaje, textoAceptar = "Eliminar", onAceptar, onCancelar }) {
  return (
    <div className="dialogo-overlay" onClick={onCancelar}>
      <div className="dialogo-panel fade-in" onClick={(e) => e.stopPropagation()}>
        <p className="dialogo-mensaje">{mensaje}</p>
        <div className="dialogo-actions">
          <button className="btn-secundario" onClick={onCancelar}>Cancelar</button>
          <button className="btn-peligro" onClick={onAceptar}>{textoAceptar}</button>
        </div>
      </div>
    </div>
  );
}

export function Prompt({ mensaje, placeholder = "", onAceptar, onCancelar }) {
  const [valor, setValor] = useState("");
  const submit = () => { if (valor.trim()) onAceptar(valor.trim()); };
  return (
    <div className="dialogo-overlay" onClick={onCancelar}>
      <div className="dialogo-panel fade-in" onClick={(e) => e.stopPropagation()}>
        <p className="dialogo-mensaje">{mensaje}</p>
        <input
          autoFocus
          placeholder={placeholder}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") onCancelar(); }}
        />
        <div className="dialogo-actions">
          <button className="btn-secundario" onClick={onCancelar}>Cancelar</button>
          <button onClick={submit} disabled={!valor.trim()}>Aceptar</button>
        </div>
      </div>
    </div>
  );
}

export function Elegir({ mensaje, opciones, onElegir, onCancelar }) {
  return (
    <div className="dialogo-overlay" onClick={onCancelar}>
      <div className="dialogo-panel fade-in" onClick={(e) => e.stopPropagation()}>
        <p className="dialogo-mensaje">{mensaje}</p>
        <div className="dialogo-opciones">
          {opciones.map((op) => (
            <button key={op.valor} className="dialogo-opcion" onClick={() => onElegir(op.valor)}>
              <span className="dialogo-opcion-label">{op.label}</span>
              <span className="dialogo-opcion-sub">{op.sub}</span>
            </button>
          ))}
        </div>
        <div className="dialogo-actions">
          <button className="btn-secundario" onClick={onCancelar}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export function useDialogo() {
  const [tipo,         setTipo]         = useState(null);
  const [mensaje,      setMensaje]      = useState("");
  const [placeholder,  setPlaceholder]  = useState("");
  const [textoAceptar, setTextoAceptar] = useState("Eliminar");
  const [opciones,     setOpciones]     = useState([]);
  const resolveRef = useRef(null);

  const confirmar = (msg, textoBtn = "Eliminar") =>
    new Promise((resolve) => {
      resolveRef.current = resolve;
      setMensaje(msg);
      setTextoAceptar(textoBtn);
      setTipo("confirm");
    });

  const pedir = (msg, ph = "") =>
    new Promise((resolve) => {
      resolveRef.current = resolve;
      setMensaje(msg);
      setPlaceholder(ph);
      setTipo("prompt");
    });

  const elegir = (msg, ops) =>
    new Promise((resolve) => {
      resolveRef.current = resolve;
      setMensaje(msg);
      setOpciones(ops);
      setTipo("elegir");
    });

  const resolver = (valor) => {
    resolveRef.current?.(valor);
    resolveRef.current = null;
    setTipo(null);
  };

  const dialogo = tipo === "confirm" ? (
    <Confirm mensaje={mensaje} textoAceptar={textoAceptar} onAceptar={() => resolver(true)} onCancelar={() => resolver(false)} />
  ) : tipo === "prompt" ? (
    <Prompt mensaje={mensaje} placeholder={placeholder} onAceptar={(v) => resolver(v)} onCancelar={() => resolver(null)} />
  ) : tipo === "elegir" ? (
    <Elegir mensaje={mensaje} opciones={opciones} onElegir={(v) => resolver(v)} onCancelar={() => resolver(null)} />
  ) : null;

  return { dialogo, confirmar, pedir, elegir };
}