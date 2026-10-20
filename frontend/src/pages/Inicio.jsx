
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoDataVida from "../assets/logo-icono.png";
import { obtenerSesion } from "../utils/autenticacion";
import { tienePermiso } from "../utils/permisos";
import {
  obtenerMunicipios,
  obtenerSubregiones,
  obtenerCatalogoIndicadores,
  obtenerPeriodos,
} from "../services/indicadoresService";
import "../styles/Inicio.css";

/* =========================================
   OPCIONES DEL MENÚ
========================================= */

const opcionesMenu = [
  { nombre: "Inicio", descripcion: "Resumen territorial", ruta: "/app", icono: "⌂", permiso: null },
  { nombre: "Indicadores", descripcion: "Consulta de información", ruta: "/app/indicadores", icono: "▤", permiso: "indicadores" },
  { nombre: "Visualización", descripcion: "Exploración territorial", ruta: "/app/mapa", icono: "◫", permiso: "visualizacion" },
  { nombre: "Comparar", descripcion: "Comparación de territorios", ruta: "/app/comparar", icono: "⇄", permiso: "comparar" },
  { nombre: "Análisis estadístico", descripcion: "Relaciones y hallazgos", ruta: "/app/estadisticas", icono: "⌁", permiso: "estadisticas" },
  { nombre: "Predicciones IA", descripcion: "Proyecciones e inteligencia artificial", ruta: "/app/predicciones", icono: "✳", permiso: "predicciones" },
  { nombre: "Análisis de variables", descripcion: "Relaciones entre indicadores y variables", ruta: "/app/variables", icono: "⌁", permiso: "variables" },
  { nombre: "Recomendaciones", descripcion: "Orientación para el territorio", ruta: "/app/recomendaciones", icono: "◇", permiso: "recomendaciones" },
  { nombre: "Reportes", descripcion: "Síntesis de resultados", ruta: "/app/reportes", icono: "▧", permiso: "reportes" },
  { nombre: "Perfil", descripcion: "Mi cuenta", ruta: "/app/perfil", icono: "○", permiso: null },
  { nombre: "Gestión de usuarios", descripcion: "Administración de cuentas", ruta: "/app/usuarios", icono: "♙", permiso: "usuarios" },
];

/* =========================================
   RUTAS DE EXPLORACIÓN
========================================= */

const rutasExploracion = [
  {
    numero: "01",
    titulo: "Indicadores",
    descripcion: "Consulta las dimensiones del Índice de Pobreza Multidimensional del territorio seleccionado.",
    ruta: "/app/indicadores",
    permiso: "indicadores",
  },
  {
    numero: "02",
    titulo: "Visualización",
    descripcion: "Explora la información territorial y comprende las condiciones de cada municipio.",
    ruta: "/app/mapa",
    permiso: "visualizacion",
  },
  {
    numero: "03",
    titulo: "Análisis estadístico",
    descripcion: "Explora relaciones entre dimensiones, periodos y territorios.",
    ruta: "/app/estadisticas",
    permiso: "estadisticas",
  },
  {
    numero: "04",
    titulo: "Reportes",
    descripcion: "Organiza los resultados de tu consulta para comunicar los principales hallazgos.",
    ruta: "/app/reportes",
    permiso: "reportes",
  },
  {
    numero: "05",
    titulo: "Recomendaciones",
    descripcion: "Consulta orientaciones para identificar prioridades y oportunidades de mejora territorial.",
    ruta: "/app/recomendaciones",
    permiso: "recomendaciones",
  },
  {
    numero: "06",
    titulo: "Predicciones IA",
    descripcion: "Explora proyecciones y resultados del componente de inteligencia artificial.",
    ruta: "/app/predicciones",
    permiso: "predicciones",
  },
  {
    numero: "07",
    titulo: "Análisis de variables",
    descripcion: "Examina las relaciones entre indicadores y las variables priorizadas por su impacto.",
    ruta: "/app/variables",
    permiso: "variables",
  },
  {
    numero: "08",
    titulo: "Comparar",
    descripcion: "Contrasta información entre municipios y reconoce diferencias en sus indicadores.",
    ruta: "/app/comparar",
    permiso: "comparar",
  },
];

/* =========================================
   ICONOS DE RESUMEN
========================================= */

function IconoResumen({ tipo }) {
  const atributos = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (tipo === "municipios") {
    return (
      <svg {...atributos}>
        <path d="M3 21h18" />
        <path d="M5 21V9l7-4 7 4v12" />
        <path d="M8 21v-6h3v6" />
        <path d="M13 21v-6h3v6" />
        <path d="M9 10h.01M15 10h.01" />
      </svg>
    );
  }

  if (tipo === "indicadores") {
    return (
      <svg {...atributos}>
        <path d="M4 19V5M4 19h16" />
        <path d="M8 16v-4M12 16V8M16 16V5" />
      </svg>
    );
  }

  if (tipo === "periodos") {
    return (
      <svg {...atributos}>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      </svg>
    );
  }

  if (tipo === "subregiones") {
    return (
      <svg {...atributos}>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 13 9 5 9-5" />
      </svg>
    );
  }

  return null;
}

/* =========================================
   ICONOS DE ACCESOS RÁPIDOS
========================================= */

function IconoAcceso({ tipo }) {
  const atributos = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (tipo) {
    case "indicadores":
      return (
        <svg {...atributos}>
          <path d="M4 19V5M4 19h16" />
          <path d="M8 16v-4M12 16V8M16 16V5" />
        </svg>
      );

    case "visualizacion":
      return (
        <svg {...atributos}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9" />
          <path d="M12 3c-2.4 2.5-3.6 5.5-3.6 9s1.2 6.5 3.6 9" />
        </svg>
      );

    case "comparar":
      return (
        <svg {...atributos}>
          <path d="M7 5v14M4 8l3-3 3 3" />
          <path d="M17 19V5m-3 11 3 3 3-3" />
          <path d="M10 9h4M10 15h4" />
        </svg>
      );

    case "estadisticas":
      return (
        <svg {...atributos}>
          <path d="M4 19V5M4 19h17" />
          <path d="m7 15 4-4 3 2 5-6M15 7h4v4" />
        </svg>
      );

    case "predicciones":
      return (
        <svg {...atributos}>
          <path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" />
          <path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" />
        </svg>
      );

    case "variables":
      return (
        <svg {...atributos}>
          <circle cx="5" cy="18" r="2" />
          <circle cx="12" cy="8" r="2" />
          <circle cx="19" cy="14" r="2" />
          <path d="m6.5 16.5 4.5-7m2.8-.3 4 3.6" />
        </svg>
      );

    case "reportes":
      return (
        <svg {...atributos}>
          <path d="M6 3h9l4 4v14H6z" />
          <path d="M14 3v5h5M9 13h6M9 17h6M9 9h2" />
        </svg>
      );

    default:
      return null;
  }
}

/* =========================================
   ACCESOS RÁPIDOS
========================================= */

const accesosRapidos = [
  {
    titulo: "Consultar indicadores",
    descripcion: "Consulta información de municipios y regiones.",
    icono: "indicadores",
    pantalla: "indicadores",
    permiso: "indicadores",
  },
  {
    titulo: "Visualizar información",
    descripcion: "Explora indicadores mediante mapas y gráficos.",
    icono: "visualizacion",
    pantalla: "mapa",
    permiso: "visualizacion",
  },
  {
    titulo: "Comparar territorios",
    descripcion: "Compara indicadores entre municipios o regiones.",
    icono: "comparar",
    pantalla: "comparar",
    permiso: "comparar",
  },
  {
    titulo: "Análisis estadístico",
    descripcion: "Analiza patrones y comportamientos en los datos.",
    icono: "estadisticas",
    pantalla: "estadisticas",
    permiso: "estadisticas",
  },
  {
    titulo: "Predicciones IA",
    descripcion: "Proyecta un indicador hasta 5 años y simula escenarios.",
    icono: "predicciones",
    pantalla: "predicciones",
    permiso: "predicciones",
  },
  {
    titulo: "Análisis de variables",
    descripcion: "Descubre con qué otras variables se relaciona un indicador.",
    icono: "variables",
    pantalla: "variables",
    permiso: "variables",
  },
];

/* =========================================
   UTILIDADES DE DATOS
========================================= */

const listaDe = (datos) =>
  Array.isArray(datos) ? datos : datos?.datos || datos?.data || [];

function textoRangoPeriodos(datos) {
  const anios = listaDe(datos)
    .map((periodo) =>
      Number(periodo?.periodo ?? periodo?.anio ?? periodo?.year ?? periodo)
    )
    .filter(Number.isFinite);

  if (!anios.length) return "—";

  const minimo = Math.min(...anios);
  const maximo = Math.max(...anios);

  return minimo === maximo
    ? String(minimo)
    : `${minimo}–${maximo}`;
}

function obtenerNombreUsuario() {
  try {
    const usuarioGuardado = localStorage.getItem("datavida_usuario");

    if (!usuarioGuardado) return "Usuario";

    const usuario = JSON.parse(usuarioGuardado);

    if (typeof usuario === "string") return usuario;

    return (
      usuario?.nombreCompleto ||
      usuario?.nombre ||
      usuario?.nombres ||
      usuario?.name ||
      usuario?.correo ||
      usuario?.email ||
      "Usuario"
    );
  } catch {
    return "Usuario";
  }
}

function obtenerIniciales(nombre) {
  if (!nombre || nombre === "Usuario") return "U";

  const partes = nombre.trim().split(/\s+/);

  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase();
  }

  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

/* =========================================
   COMPONENTE PRINCIPAL
========================================= */

function Inicio() {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busquedaTerritorio, setBusquedaTerritorio] = useState("");

  const sesion = obtenerSesion();
  const nombreUsuario = sesion?.nombre || obtenerNombreUsuario();
  const inicialesUsuario = obtenerIniciales(nombreUsuario);
  const rolActual = String(sesion?.rol || "Usuario").trim().toLowerCase();

  const accesosPermitidos = accesosRapidos.filter((acceso) =>
    tienePermiso(sesion?.rol, acceso.permiso)
  );

  const opcionesVisibles = opcionesMenu.filter((opcion) => {
    if (opcion.ruta === "/app") return true;

    if (opcion.ruta === "/app/perfil") {
      return Boolean(sesion);
    }

    return opcion.permiso
      ? tienePermiso(sesion?.rol, opcion.permiso)
      : false;
  });

  const exploracionesVisibles = rutasExploracion.filter((ruta) =>
    tienePermiso(sesion?.rol, ruta.permiso)
  );

  const [resumen, setResumen] = useState({
    municipios: "—",
    subregiones: "—",
    indicadores: "—",
    periodos: "—",
  });

  useEffect(() => {
    let activo = true;

    Promise.allSettled([
      obtenerMunicipios(),
      obtenerSubregiones(),
      obtenerCatalogoIndicadores(),
      obtenerPeriodos(),
    ]).then(([municipios, subregiones, indicadores, periodos]) => {
      if (!activo) return;

      const cantidad = (resultado) =>
        resultado.status === "fulfilled"
          ? String(listaDe(resultado.value).length)
          : "—";

      setResumen({
        municipios: cantidad(municipios),
        subregiones: cantidad(subregiones),
        indicadores: cantidad(indicadores),
        periodos:
          periodos.status === "fulfilled"
            ? textoRangoPeriodos(periodos.value)
            : "—",
      });
    });

    return () => {
      activo = false;
    };
  }, []);

  const tarjetasResumen = [
    { valor: resumen.municipios, etiqueta: "Municipios PDET", icono: "municipios", tono: "ocre" },
    { valor: resumen.subregiones, etiqueta: "Subregiones PDET", icono: "subregiones", tono: "verde" },
    { valor: resumen.indicadores, etiqueta: "Indicadores", icono: "indicadores", tono: "azul" },
    { valor: resumen.periodos, etiqueta: "Periodos de datos", icono: "periodos", tono: "morado", largo: true },
  ];

  function irAPantalla(pantalla) {
    navigate(pantalla === "inicio" ? "/app" : `/app/${pantalla}`);
  }

  function cerrarMenu() {
    setMenuAbierto(false);
  }

  function manejarBusqueda(evento) {
    const valor = evento.target.value;
    setBusquedaTerritorio(valor);
  }

  return (
    <main className="inicio-datavida" id="inicio">
      <section className="hero-inicio">
        <img
          className="hero-inicio-imagen"
          src="https://sensorial.coffee/cdn/shop/articles/10.png?v=1791889602&width=1600"
          alt="Paisaje natural de montañas y vegetación"
        />

        <div className="hero-inicio-degradado" />

        <header className="barra-superior-inicio">
          <Link
            to="/app"
            className="marca-inicio"
            aria-label="DATAVIDA, ir al inicio"
          >
            <img
              className="logo-inicio-imagen"
              src={logoDataVida}
              alt="Logo DATAVIDA"
            />
            <span>DATAVIDA</span>
          </Link>

          <div className="acciones-superiores-inicio">
            <label className="busqueda-territorio-inicio">
              <span className="icono-busqueda-inicio" aria-hidden="true">
                ⌕
              </span>

              <input
                type="search"
                value={busquedaTerritorio}
                onChange={manejarBusqueda}
                placeholder="Buscar territorio"
                aria-label="Buscar territorio"
              />
            </label>

            {sesion && (
              <Link
                to="/app/perfil"
                className="boton-perfil-inicio"
                aria-label={`Ver perfil de ${nombreUsuario}`}
                title={nombreUsuario}
              >
                <span aria-hidden="true">{inicialesUsuario}</span>
              </Link>
            )}

            <button
              type="button"
              className={`boton-menu-inicio ${menuAbierto ? "activo" : ""}`}
              aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuAbierto}
              aria-controls="menu-principal-inicio"
              onClick={() => setMenuAbierto((abierto) => !abierto)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </header>

        {menuAbierto && (
          <>
            <button
              type="button"
              className="fondo-menu-inicio"
              aria-label="Cerrar menú"
              onClick={cerrarMenu}
            />

            <nav
              id="menu-principal-inicio"
              className="menu-desplegable-inicio"
              aria-label="Menú principal"
            >
              <div className="menu-desplegable-encabezado">
                <div className="menu-encabezado-identidad">
                  <span className="menu-encabezado-marca">DATAVIDA</span>
                  <span className="menu-encabezado-etiqueta">
                    MENÚ PRINCIPAL
                  </span>
                </div>

                <button
                  type="button"
                  className="menu-boton-cerrar"
                  onClick={cerrarMenu}
                  aria-label="Cerrar menú"
                >
                  ×
                </button>
              </div>

              <div className="menu-usuario-inicio">
                <div className="menu-avatar-inicio">
                  {inicialesUsuario}
                </div>

                <div className="menu-usuario-datos">
                  <strong>{nombreUsuario}</strong>
                  <span>
                    {sesion?.rol || "Usuario"} · Sesión activa
                  </span>
                </div>

                <span className="menu-estado-sesion" aria-label="Sesión activa" />
              </div>

              <div className="menu-seccion-titulo">
                <span>EXPLORA LA PLATAFORMA</span>
              </div>

              <div className="menu-enlaces-inicio">
                {opcionesVisibles.map((opcion) => (
                  <Link
                    key={opcion.ruta}
                    to={opcion.ruta}
                    className="enlace-menu-inicio"
                    onClick={cerrarMenu}
                  >
                    <span className="enlace-menu-icono" aria-hidden="true">
                      {opcion.icono}
                    </span>

                    <span className="enlace-menu-contenido">
                      <strong>{opcion.nombre}</strong>
                      <small>{opcion.descripcion}</small>
                    </span>

                    <span className="enlace-menu-flecha" aria-hidden="true">
                      ›
                    </span>
                  </Link>
                ))}
              </div>

              <div className="menu-pie-inicio">
                <img src={logoDataVida} alt="" aria-hidden="true" />
                <div>
                  <strong>DATAVIDA · DATOS CON PROPÓSITO</strong>
                  <small>Información para comprender el territorio</small>
                </div>
              </div>
            </nav>
          </>
        )}

        <div className="hero-inicio-contenido">
          <h1>
            <span className="hero-inicio-saludo">
              TU ESPACIO DE EXPLORACIÓN
            </span>

            <span className="hero-inicio-bienvenida">
              Bienvenido/a,
            </span>

            <span className="hero-inicio-nombre">
              {nombreUsuario}
            </span>
          </h1>
        </div>
      </section>

      <section className="contenido-inicio">
        <section
          className="estadisticas-datavida"
          aria-label="Cifras destacadas de DATAVIDA"
        >
          <div className="estadisticas-datavida-fila">
            {tarjetasResumen.map((tarjeta) => (
              <article
                className="estadistica-datavida"
                key={tarjeta.etiqueta}
              >
                <div className={`estadistica-datavida-icono tono-${tarjeta.tono}`}>
                  <IconoResumen tipo={tarjeta.icono} />
                </div>

                <div className="estadistica-datavida-texto">
                  <strong>{tarjeta.valor}</strong>
                  <span>{tarjeta.etiqueta}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="exploracion-inicio" id="exploracion">
          <div className="titulo-bloque-inicio">
            <div>
              <span className="etiqueta-seccion-inicio">
                HERRAMIENTAS DATAVIDA
              </span>

              <h2>Rutas de exploración</h2>
              <p>Selecciona una opción para continuar.</p>
            </div>
          </div>

          <div className="tarjetas-exploracion-inicio">
            {tienePermiso(sesion?.rol, "usuarios") && (
              <Link
                to="/app/usuarios"
                className="tarjeta-exploracion-inicio"
              >
                <div className="tarjeta-exploracion-superior">
                  <span className="tarjeta-exploracion-numero">01</span>
                </div>

                <h3>Gestión de usuarios</h3>

                <p>
                  Administra las cuentas, los roles y el acceso de los
                  usuarios de DATAVIDA.
                </p>

                <span className="tarjeta-exploracion-enlace">
                  Administrar usuarios
                </span>
              </Link>
            )}

            {exploracionesVisibles.map((ruta) => (
              <Link
                to={ruta.ruta}
                className="tarjeta-exploracion-inicio"
                key={ruta.ruta}
              >
                <div className="tarjeta-exploracion-superior">
                  <span className="tarjeta-exploracion-numero">
                    {ruta.numero}
                  </span>
                </div>

                <h3>{ruta.titulo}</h3>
                <p>{ruta.descripcion}</p>

                <span className="tarjeta-exploracion-enlace">
                  Explorar sección
                </span>
              </Link>
            ))}
          </div>
        </section>

        <footer className="pie-inicio-datavida">
          <Link to="/app" className="pie-inicio-marca">
            <img
              className="logo-inicio-imagen"
              src={logoDataVida}
              alt="Logo DATAVIDA"
            />

            <span className="pie-inicio-identidad">
              <strong>DATAVIDA</strong>
              <span>DATOS QUE TRANSFORMAN</span>
            </span>
          </Link>

          <p className="pie-inicio-descripcion">
            Información para comprender la pobreza multidimensional en los
            territorios PDET de Colombia.
          </p>

          <nav
            className="pie-inicio-enlaces"
            aria-label="Enlaces institucionales"
          >
            <Link to="/#proposito">Propósito</Link>
            <Link to="/#funcionalidades">Funcionalidades</Link>
            <Link to="/#territorios">Territorios</Link>
            <Link to="/login">Iniciar sesión</Link>
          </nav>

          <div className="pie-inicio-inferior">
            <span>
              Proyecto DATAVIDA · Proyecto Integrador II · UPB
            </span>

            <Link to="/app">Volver al inicio ↑</Link>
          </div>
        </footer>
      </section>
    </main>
  );
}

export default Inicio;
