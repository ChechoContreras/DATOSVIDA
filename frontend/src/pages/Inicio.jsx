import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { obtenerUsuario } from "../utils/auth";
import { tienePermiso } from "../utils/permisos";
import {
  obtenerMunicipios,
  obtenerSubregiones,
  obtenerCatalogoIndicadores,
  obtenerPeriodos,
} from "../services/indicadoresService";
import logoDataVida from "../assets/logo-icono.png";
import "../styles/Inicio.css";

/* =========================================
   MENÚ PRINCIPAL
========================================= */

const opcionesMenu = [
  {
    nombre: "Inicio",
    descripcion: "Resumen territorial",
    ruta: "/app",
    icono: "⌂",
  },
  {
    nombre: "Indicadores",
    descripcion: "Consulta de información",
    ruta: "/app/indicadores",
    icono: "▤",
    permiso: "indicadores",
  },
  {
    nombre: "Visualización",
    descripcion: "Exploración territorial",
    ruta: "/app/mapa",
    icono: "◫",
    permiso: "visualizacion",
  },
  {
    nombre: "Comparar",
    descripcion: "Comparación de territorios",
    ruta: "/app/comparar",
    icono: "⇄",
    permiso: "comparar",
  },
  {
    nombre: "Análisis estadístico",
    descripcion: "Relaciones y hallazgos",
    ruta: "/app/analisis-estadistico",
    icono: "⌁",
    permiso: "estadisticas",
  },
  {
    nombre: "Predicciones IA",
    descripcion: "Proyecciones e inteligencia artificial",
    ruta: "/app/predicciones",
    icono: "✳",
    permiso: "predicciones",
  },
  {
    nombre: "Análisis de variables",
    descripcion: "Relaciones entre indicadores y variables",
    ruta: "/app/variables",
    icono: "⌁",
    permiso: "variables",
  },
  {
    nombre: "Recomendaciones",
    descripcion: "Orientación para el territorio",
    ruta: "/app/recomendaciones",
    icono: "◇",
    permiso: "recomendaciones",
  },
  {
    nombre: "Reportes",
    descripcion: "Síntesis de resultados",
    ruta: "/app/reportes",
    icono: "▧",
    permiso: "reportes",
  },
  {
    nombre: "Perfil",
    descripcion: "Mi cuenta",
    ruta: "/app/perfil",
    icono: "○",
    permiso: "perfil",
  },
  {
    nombre: "Gestión de usuarios",
    descripcion: "Administración de cuentas",
    ruta: "/app/usuarios",
    icono: "♙",
    permiso: "usuarios",
  },
];

/* =========================================
   ACCESOS DE EXPLORACIÓN
========================================= */

const rutasExploracion = [
  {
    numero: "01",
    titulo: "Indicadores",
    descripcion:
      "Consulta las dimensiones del Índice de Pobreza Multidimensional del territorio seleccionado.",
    ruta: "/app/indicadores",
    permiso: "indicadores",
  },
  {
    numero: "02",
    titulo: "Visualización",
    descripcion:
      "Explora la información territorial y comprende las condiciones de cada municipio.",
    ruta: "/app/mapa",
    permiso: "visualizacion",
  },
  {
    numero: "03",
    titulo: "Análisis estadístico",
    descripcion:
      "Explora relaciones entre dimensiones, periodos y territorios.",
    ruta: "/app/analisis-estadistico",
    permiso: "estadisticas",
  },
  {
    numero: "04",
    titulo: "Reportes",
    descripcion:
      "Organiza los resultados de tu consulta para comunicar los principales hallazgos.",
    ruta: "/app/reportes",
    permiso: "reportes",
  },
  {
    numero: "05",
    titulo: "Recomendaciones",
    descripcion:
      "Consulta orientaciones para identificar prioridades y oportunidades de mejora territorial.",
    ruta: "/app/recomendaciones",
    permiso: "recomendaciones",
  },
  {
    numero: "06",
    titulo: "Predicciones IA",
    descripcion:
      "Explora proyecciones y resultados del componente de inteligencia artificial.",
    ruta: "/app/predicciones",
    permiso: "predicciones",
  },
  {
    numero: "07",
    titulo: "Análisis de variables",
    descripcion:
      "Examina las relaciones entre indicadores y las variables priorizadas por su impacto.",
    ruta: "/app/variables",
    permiso: "variables",
  },
  {
    numero: "08",
    titulo: "Comparar",
    descripcion:
      "Contrasta información entre municipios y reconoce diferencias en sus indicadores.",
    ruta: "/app/comparar",
    permiso: "comparar",
  },
];

/* =========================================
   UTILIDADES PARA EL BACKEND
========================================= */

const listaDe = (datos) =>
  Array.isArray(datos) ? datos : datos?.datos || datos?.data || [];

function textoRangoPeriodos(datos) {
  const anios = listaDe(datos)
    .map((periodo) =>
      Number(
        periodo?.periodo ??
          periodo?.anio ??
          periodo?.year ??
          periodo
      )
    )
    .filter(Number.isFinite);

  if (!anios.length) return "—";

  const minimo = Math.min(...anios);
  const maximo = Math.max(...anios);

  return minimo === maximo
    ? String(minimo)
    : `${minimo}–${maximo}`;
}

function obtenerNombreUsuario(usuario) {
  const nombre =
    usuario?.nombreCompleto ||
    usuario?.nombre ||
    usuario?.nombres ||
    usuario?.name ||
    usuario?.correo ||
    usuario?.email;

  if (nombre) return nombre;

  try {
    const guardado = localStorage.getItem("datavida_usuario");

    if (!guardado) return "Usuario";

    const datos = JSON.parse(guardado);

    if (typeof datos === "string") return datos;

    return (
      datos?.nombreCompleto ||
      datos?.nombre ||
      datos?.nombres ||
      datos?.name ||
      datos?.correo ||
      datos?.email ||
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

  return (
    `${partes[0][0]}${partes[partes.length - 1][0]}`
  ).toUpperCase();
}

/* =========================================
   ICONOS DE LAS CIFRAS
========================================= */

function IconoResumen({ tipo }) {
  if (tipo === "municipios") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  if (tipo === "subregiones") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
      </svg>
    );
  }

  if (tipo === "indicadores") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 19V5M4 19h17" />
        <path d="m7 15 4-4 3 2 6-7" />
        <path d="M16 6h4v4" />
      </svg>
    );
  }

  if (tipo === "periodos") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18M7 14h3M14 14h3M7 17h3" />
      </svg>
    );
  }

  return null;
}

/* =========================================
   COMPONENTE PRINCIPAL
========================================= */

function Inicio() {
  const navigate = useNavigate();
  const usuario = obtenerUsuario();

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busquedaTerritorio, setBusquedaTerritorio] = useState("");

  const [resumen, setResumen] = useState({
    municipios: "—",
    subregiones: "—",
    indicadores: "—",
    periodos: "—",
  });

  const nombreUsuario = obtenerNombreUsuario(usuario);
  const inicialesUsuario = obtenerIniciales(nombreUsuario);

  const accesosPermitidos = rutasExploracion.filter((ruta) =>
    tienePermiso(usuario?.rol, ruta.permiso)
  );

  const opcionesVisibles = opcionesMenu.filter((opcion) => {
    if (!opcion.permiso) return true;

    return tienePermiso(usuario?.rol, opcion.permiso);
  });

  const perfilPermitido = tienePermiso(usuario?.rol, "perfil");

  const gestionUsuariosPermitida = tienePermiso(
    usuario?.rol,
    "usuarios"
  );

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
    {
      valor: resumen.municipios,
      etiqueta: "Municipios PDET",
      icono: "municipios",
    },
    {
      valor: resumen.subregiones,
      etiqueta: "Subregiones PDET",
      icono: "subregiones",
    },
    {
      valor: resumen.indicadores,
      etiqueta: "Indicadores",
      icono: "indicadores",
    },
    {
      valor: resumen.periodos,
      etiqueta: "Periodos de datos",
      icono: "periodos",
      largo: true,
    },
  ];

  function abrirRuta(ruta) {
    setMenuAbierto(false);
    navigate(ruta);
  }

  return (
    <main className="inicio-datavida" id="inicio">
      {/* HERO Y BARRA SUPERIOR */}

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
                onChange={(evento) =>
                  setBusquedaTerritorio(evento.target.value)
                }
                placeholder="Buscar territorio"
                aria-label="Buscar territorio"
              />
            </label>

            {perfilPermitido && (
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
              onClick={() => setMenuAbierto((abierto) => !abierto)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </header>

        {/* MENÚ DESPLEGABLE */}

        {menuAbierto && (
          <>
            <button
              type="button"
              className="fondo-menu-inicio"
              aria-label="Cerrar menú"
              onClick={() => setMenuAbierto(false)}
            />

            <nav
              className="menu-desplegable-inicio"
              aria-label="Menú principal"
            >
              <div className="menu-desplegable-encabezado">
                <span>MENÚ PRINCIPAL</span>

                <button
                  type="button"
                  onClick={() => setMenuAbierto(false)}
                  aria-label="Cerrar menú"
                >
                  ×
                </button>
              </div>

              <div className="menu-usuario-inicio">
                <div className="menu-avatar-inicio">
                  {inicialesUsuario}
                </div>

                <div>
                  <strong>{nombreUsuario}</strong>
                  <span>
                    {usuario?.rol || "Usuario"} · Sesión activa
                  </span>
                </div>
              </div>

              <div className="menu-enlaces-inicio">
                {opcionesVisibles.map((opcion) => (
                  <Link
                    key={opcion.ruta}
                    to={opcion.ruta}
                    className="enlace-menu-inicio"
                    onClick={() => setMenuAbierto(false)}
                  >
                    <span className="enlace-menu-icono">
                      {opcion.icono}
                    </span>

                    <span className="enlace-menu-contenido">
                      <strong>{opcion.nombre}</strong>
                      <small>{opcion.descripcion}</small>
                    </span>

                    <span className="enlace-menu-flecha">›</span>
                  </Link>
                ))}
              </div>

              <div className="menu-pie-inicio">
                <span>DATAVIDA</span>
                <small>Información para comprender el territorio</small>
              </div>
            </nav>
          </>
        )}

        {/* BIENVENIDA PERSONALIZADA */}

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

      {/* CONTENIDO PRINCIPAL */}

      <section className="contenido-inicio">
        {/* CIFRAS DINÁMICAS DEL BACKEND */}

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
                <div className="estadistica-datavida-icono">
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

        {/* RUTAS DE EXPLORACIÓN */}

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
            {gestionUsuariosPermitida && (
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

            {accesosPermitidos.map((ruta) => (
              <Link
                to={ruta.ruta}
                className="tarjeta-exploracion-inicio"
                key={ruta.numero}
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

        {/* PIE DE PÁGINA */}

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
            Información para comprender la pobreza multidimensional
            en los territorios PDET de Colombia.
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
