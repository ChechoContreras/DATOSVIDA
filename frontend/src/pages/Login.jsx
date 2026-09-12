import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  function manejarSubmit(e) {
    e.preventDefault();
    // El Microservicio de Autenticación (RF-01) aún no está implementado.
    // Por ahora, el prototipo deja pasar directo al dashboard.
    navigate("/app");
  }

  return (
    <div className="login">
      <form className="login__tarjeta" onSubmit={manejarSubmit}>
        <p className="login__marca">DATAVIDA</p>
        <h1>Iniciar sesión</h1>
        <p className="login__subtitulo">
          Ingresa con tu cuenta registrada en la plataforma.
        </p>

        <label htmlFor="correo">Correo electrónico</label>
        <input id="correo" type="email" placeholder="usuario@correo.com" required />

        <label htmlFor="contrasena">Contraseña</label>
        <input id="contrasena" type="password" placeholder="••••••••" required />

        <button type="submit">Ingresar</button>

        <p className="login__nota">
          El módulo de autenticación está en desarrollo (Microservicio de
          Autenticación). Por ahora, este formulario es solo una vista
          preliminar.
        </p>
      </form>
    </div>
  );
}
