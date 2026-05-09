import { useState } from "react";

const AUTH = "http://localhost/armario/backend/auth.php";

function Login({ onLogin }) {
  const [modo,     setModo]     = useState("login");
  const [form,     setForm]     = useState({ nombre: "", email: "", password: "" });
  const [error,    setError]    = useState("");
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setError("");
    setCargando(true);
    const action = modo === "login" ? "login" : "register";
    const body   = modo === "login"
      ? { email: form.email, password: form.password }
      : { nombre: form.nombre, email: form.email, password: form.password };

    const res  = await fetch(`${AUTH}?action=${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setCargando(false);
    if (data.error) { setError(data.error); return; }
    localStorage.setItem("armario_token", data.token);
    onLogin({ id: data.id, nombre: data.nombre });
  };

  return (
    <div className="login-fondo">
      <div className="login-panel fade-in">
        <h1 className="login-titulo">Tu armario virtual</h1>
        <p className="login-sub">
          {modo === "login" ? "Inicia sesión para acceder a tu armario." : "Crea tu cuenta para empezar."}
        </p>

        <div className="login-tabs">
          <button
            className={`login-tab ${modo === "login" ? "activo" : ""}`}
            onClick={() => { setModo("login"); setError(""); }}
          >
            Iniciar sesión
          </button>
          <button
            className={`login-tab ${modo === "register" ? "activo" : ""}`}
            onClick={() => { setModo("register"); setError(""); }}
          >
            Crear cuenta
          </button>
        </div>

        <div className="login-campos">
          {modo === "register" && (
            <input
              name="nombre"
              placeholder="Tu nombre"
              value={form.nombre}
              onChange={handleChange}
              autoComplete="name"
            />
          )}
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            autoComplete={modo === "login" ? "current-password" : "new-password"}
          />
        </div>

        {error && <p className="login-error">{error}</p>}

        <button className="login-btn" onClick={submit} disabled={cargando}>
          {cargando ? "Un momento..." : modo === "login" ? "Entrar" : "Crear cuenta"}
        </button>
      </div>
    </div>
  );
}

export default Login;