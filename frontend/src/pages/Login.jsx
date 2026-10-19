import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoIcono from "../assets/logo-icono.png";
import { iniciarSesion as iniciarSesionApi } from "../services/authService";
import "../styles/Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [error, setError] = useState("");

  async function iniciarSesion(e) {
    e.preventDefault();

    if (cargando) return;

    setError("");
    setCargando(true);

    try {
      await iniciarSesionApi(correo.trim(), contrasena);
      navigate("/app");
    } catch (err) {
      setError(
        err?.mensaje ||
          err?.response?.data?.mensaje ||
          err?.response?.data?.message ||
          err?.message ||
          "No fue posible iniciar sesión. Verifica tus datos e inténtalo nuevamente."
      );
    } finally {
      setCargando(false);
    }
  }

  function volverAlInicio() {
    navigate("/");
  }

  return (
    <main className="inicio-sesion">
      <div className="inicio-sesion-contenedor">
        <section
          className="inicio-sesion-formulario"
          aria-label="Formulario de inicio de sesión"
        >
          <div className="formulario-contenido">
            <button
              type="button"
              className="boton-volver-inicio"
              onClick={volverAlInicio}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
              Volver al inicio
            </button>

            <div className="logo-movil">
              <img src={logoIcono} alt="Símbolo de DATAVIDA" />
              <span>DATAVIDA</span>
            </div>

            <header className="login-encabezado">
              <p className="login-etiqueta">
                PLATAFORMA DE DATOS TERRITORIALES
              </p>

              <h1>Inicia sesión</h1>

              <p className="login-descripcion">
                Ingresa tus datos para continuar.
              </p>
            </header>

            <form className="tarjeta-login" onSubmit={iniciarSesion}>
              <div className="formulario-campos">
                <div className="campo-login">
                  <label htmlFor="correo">Correo electrónico</label>

                  <div className="input-con-icono">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                    </svg>

                    <input
                      id="correo"
                      name="correo"
                      type="email"
                      placeholder="correo@datavida.co"
                      autoComplete="username"
                      value={correo}
                      onChange={(e) => {
                        setCorreo(e.target.value);
                        setError("");
                      }}
                      required
                      disabled={cargando}
                    />
                  </div>
                </div>

                <div className="campo-login">
                  <label htmlFor="contrasena">Contraseña</label>

                  <div className="input-con-icono">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="4" y="10" width="16" height="11" rx="2" />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>

                    <input
                      id="contrasena"
                      name="contrasena"
                      type={mostrarContrasena ? "text" : "password"}
                      placeholder="Ingresa tu contraseña"
                      autoComplete="current-password"
                      value={contrasena}
                      onChange={(e) => {
                        setContrasena(e.target.value);
                        setError("");
                      }}
                      required
                      disabled={cargando}
                    />

                    <button
                      type="button"
                      className="boton-mostrar-contrasena"
                      onClick={() =>
                        setMostrarContrasena((valor) => !valor)
                      }
                      aria-label={
                        mostrarContrasena
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                      aria-pressed={mostrarContrasena}
                      disabled={cargando}
                    >
                      {mostrarContrasena ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M3 3l18 18" />
                          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                          <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.5 0 9 7 9 7a15 15 0 0 1-3.1 3.8" />
                          <path d="M6.2 6.2C3.9 7.8 3 12 3 12s3.5 7 9 7a9.6 9.6 0 0 0 3-.5" />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="recuperar-contrasena">
                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        "La recuperación de contraseña estará disponible cuando se conecte el módulo correspondiente."
                      )
                    }
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                {error && (
                  <div
                    className="mensaje-error-login"
                    role="alert"
                    aria-live="polite"
                  >
                    <span className="error-icono" aria-hidden="true">
                      !
                    </span>
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="boton-iniciar-sesion"
                disabled={cargando}
              >
                {cargando ? (
                  <span className="boton-cargando">
                    <span className="spinner" aria-hidden="true" />
                    Iniciando sesión...
                  </span>
                ) : (
                  <>
                    Iniciar sesión
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <p className="texto-final-login">
              DATAVIDA · Datos para comprender nuestro territorio
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
