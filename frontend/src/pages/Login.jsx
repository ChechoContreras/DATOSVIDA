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
    setError("");
    setCargando(true);

    try {
      await iniciarSesionApi(correo, contrasena);
      navigate("/app");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  function volverAlInicio() {
    navigate("/");
  }

  return (
    <div className="inicio-sesion">
      <div className="inicio-sesion-contenedor">

        {/* =====================================================
            PANEL IZQUIERDO
        ===================================================== */}

        <section className="inicio-sesion-visual">

          <div className="decoracion decoracion-uno"></div>
          <div className="decoracion decoracion-dos"></div>
          <div className="decoracion decoracion-tres"></div>

          {/* LOGO */}
          <div className="inicio-sesion-logo">
            <img src={logoIcono} alt="DATAVIDA" />
            <span>DATAVIDA</span>
          </div>

          {/* CONTENIDO */}
          <div className="inicio-sesion-contenido">

            <p className="inicio-sesion-etiqueta">
              PLATAFORMA DE DATOS TERRITORIALES
            </p>

            <h1>
              Comprende los datos
              <br />
              <span>de nuestro territorio.</span>
            </h1>

            {/* GRÁFICA */}
            <div className="grafico-login">

              <div className="grafico-linea">
                <span className="punto punto-uno"></span>
                <span className="punto punto-dos"></span>
                <span className="punto punto-tres"></span>
                <span className="punto punto-cuatro"></span>
                <span className="punto punto-cinco"></span>
              </div>

              <div className="grafico-barras">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>

            </div>
          </div>

          {/* FOOTER */}
          <p className="inicio-sesion-footer">
            © 2026 DATAVIDA · Datos para comprender nuestro territorio
          </p>

        </section>

        {/* =====================================================
            PANEL DERECHO
        ===================================================== */}

        <section className="inicio-sesion-formulario">

          <div className="formulario-contenido">

            {/* LOGO MÓVIL */}
            <div className="logo-movil">
              <img src={logoIcono} alt="DATAVIDA" />
              <span>DATAVIDA</span>
            </div>

            {/* VOLVER AL INICIO */}
            <button
              type="button"
              className="boton-volver-inicio"
              onClick={volverAlInicio}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>

              Volver al inicio
            </button>

            {/* =================================================
                LOGIN
            ================================================= */}

            <form
              className="tarjeta-login"
              onSubmit={iniciarSesion}
            >

              {/* ENCABEZADO */}
              <div className="login-encabezado">

                <p className="login-etiqueta">
                  BIENVENIDO A DATAVIDA
                </p>

                <h2>
                  Inicia sesión
                </h2>

                {/* MENSAJE DE ERROR */}
                {error && <p className="mensaje-error-login">{error}</p>}

              </div>

              {/* =================================================
                  CAMPOS
              ================================================= */}

              <div className="formulario-campos">

                {/* USUARIO */}
                <div className="campo-login">

                  <label htmlFor="usuario">
                    Correo electrónico
                  </label>

                  <div className="input-con-icono">

                    {/* ICONO USUARIO */}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle
                        cx="12"
                        cy="8"
                        r="4"
                      />

                      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
                    </svg>

                    <input
                      id="usuario"
                      type="email"
                      placeholder="correo@datavida.gov.co"
                      autoComplete="off"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      required
                    />

                  </div>
                </div>

                {/* CONTRASEÑA */}
                <div className="campo-login">

                  <label htmlFor="contrasena">
                    Contraseña
                  </label>

                  <div className="input-con-icono">

                    {/* ICONO CANDADO */}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="4"
                        y="10"
                        width="16"
                        height="11"
                        rx="2"
                      />

                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>

                    <input
                      id="contrasena"
                      type={
                        mostrarContrasena
                          ? "text"
                          : "password"
                      }
                      placeholder="Ingresa tu contraseña"
                      autoComplete="new-password"
                      value={contrasena}
                      onChange={(e) => setContrasena(e.target.value)}
                      required
                    />

                    {/* MOSTRAR / OCULTAR CONTRASEÑA */}
                    <button
                      type="button"
                      className="boton-mostrar-contrasena"
                      onClick={() =>
                        setMostrarContrasena(
                          (valor) => !valor
                        )
                      }
                      aria-label={
                        mostrarContrasena
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                    >

                      {mostrarContrasena ? (

                        /* OJO CERRADO */
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 3l18 18" />

                          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />

                          <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5.2 0 8.8 4 10 8a11.7 11.7 0 0 1-3.1 5" />

                          <path d="M6.2 6.2C4.5 7.5 3.3 9.5 2 12c1.2 4 4.8 8 10 8 1.5 0 2.8-.3 4-.9" />
                        </svg>

                      ) : (

                        /* OJO ABIERTO */
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />

                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                          />
                        </svg>

                      )}

                    </button>

                  </div>
                </div>

                {/* RECUPERAR CONTRASEÑA */}
                <div className="recuperar-contrasena">

                  <button type="button">
                    ¿Olvidaste tu contraseña?
                  </button>

                </div>

              </div>

              {/* =================================================
                  BOTÓN INICIAR SESIÓN
              ================================================= */}

              <button
                type="submit"
                className="boton-iniciar-sesion"
                disabled={cargando}
              >

                {cargando ? (

                  <span className="boton-cargando">

                    <span className="spinner"></span>

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
                    >
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  </>

                )}

              </button>

              {/* =================================================
                  SEPARADOR
              ================================================= */}

              <div className="separador-login">

                <span></span>

                <p>o</p>

                <span></span>

              </div>

              {/* =================================================
                  REGISTRO
              ================================================= */}

              <div className="registro-login">

                <p>
                  ¿No tienes una cuenta?
                </p>

                <button type="button">
                  Registrarse
                </button>

              </div>

            </form>

            {/* FOOTER */}
            <p className="texto-final-login">
              DATAVIDA · Datos para comprender nuestro territorio
            </p>

          </div>

        </section>

      </div>
    </div>
  );
}