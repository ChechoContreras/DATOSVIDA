import { useNavigate } from "react-router-dom";
import { obtenerUsuario } from "../utils/auth";
import { tienePermiso } from "../utils/permisos";

import "../styles/Inicio.css";

/* =========================================
   ICONOS DE RESUMEN
   ========================================= */

function IconoResumen({ tipo }) {
  if (tipo === "municipios") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 21h18" />
        <path d="M5 21V9l7-4 7 4v12" />
        <path d="M8 21v-6h3v6" />
        <path d="M13 21v-6h3v6" />
        <path d="M9 10h.01" />
        <path d="M15 10h.01" />
      </svg>
    );
  }

  if (tipo === "indicadores") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="M8 16v-4" />
        <path d="M12 16V8" />
        <path d="M16 16V5" />
      </svg>
    );
  }

  if (tipo === "periodos") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M16 2v4" />
        <path d="M8 2v4" />
        <path d="M3 10h18" />
        <path d="M8 14h.01" />
        <path d="M12 14h.01" />
        <path d="M16 14h.01" />
        <path d="M8 18h.01" />
        <path d="M12 18h.01" />
      </svg>
    );
  }

  if (tipo === "analisis") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19V5" />
        <path d="M4 19h17" />
        <path d="M7 15l4-4 3 2 5-6" />
        <path d="M15 7h4v4" />
      </svg>
    );
  }

  return null;
}

/* =========================================
   ICONOS DE ACCESOS RÁPIDOS
   ========================================= */

function IconoAcceso({ tipo }) {
  if (tipo === "indicadores") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="M8 16v-4" />
        <path d="M12 16V8" />
        <path d="M16 16V5" />
      </svg>
    );
  }

  if (tipo === "visualizacion") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9" />
        <path d="M12 3c-2.4 2.5-3.6 5.5-3.6 9s1.2 6.5 3.6 9" />
      </svg>
    );
  }

  if (tipo === "comparar") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 5v14" />
        <path d="M4 8l3-3 3 3" />
        <path d="M17 19V5" />
        <path d="M14 16l3 3 3-3" />
        <path d="M10 9h4" />
        <path d="M10 15h4" />
      </svg>
    );
  }

  if (tipo === "estadisticas") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19V5" />
        <path d="M4 19h17" />
        <path d="M7 15l4-4 3 2 5-6" />
        <path d="M15 7h4v4" />
      </svg>
    );
  }

  if (tipo === "predicciones") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3z" />
        <path d="M19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16z" />
      </svg>
    );
  }

  if (tipo === "reportes") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6" />
        <path d="M9 17h6" />
        <path d="M9 9h2" />
      </svg>
    );
  }

  return null;
}

/* =========================================
   ICONOS DE ACTIVIDAD
   ========================================= */

function IconoActividad({ tipo }) {
  if (tipo === "consulta") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="6" />
        <path d="M16 16l5 5" />
      </svg>
    );
  }

  if (tipo === "analisis") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19V5" />
        <path d="M4 19h17" />
        <path d="M7 15l4-4 3 2 5-6" />
      </svg>
    );
  }

  if (tipo === "reporte") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6" />
        <path d="M9 17h6" />
      </svg>
    );
  }

  return null;
}

/* =========================================
   DATOS
   ========================================= */

const tarjetasResumen = [
  {
    valor: "1.103",
    etiqueta: "Municipios disponibles",
    icono: "municipios",
    color: "azul",
  },
  {
    valor: "32",
    etiqueta: "Indicadores disponibles",
    icono: "indicadores",
    color: "cian",
  },
  {
    valor: "12",
    etiqueta: "Periodos registrados",
    icono: "periodos",
    color: "cielo",
  },
  {
    valor: "248",
    etiqueta: "Análisis realizados",
    icono: "analisis",
    color: "verde",
  },
];

/* =========================================
   ACCESOS RÁPIDOS
   ========================================= */

const accesosRapidos = [
  {
    titulo: "Consultar indicadores",
    descripcion: "Consulta información de municipios y regiones.",
    icono: "indicadores",
    color: "gris",
    pantalla: "indicadores",
    permiso: "indicadores",
  },
  {
    titulo: "Visualizar información",
    descripcion: "Explora indicadores mediante mapas y gráficos.",
    icono: "visualizacion",
    color: "celeste",
    pantalla: "mapa",
    permiso: "visualizacion",
  },
  {
    titulo: "Comparar territorios",
    descripcion: "Compara indicadores entre municipios o regiones.",
    icono: "comparar",
    color: "azul",
    pantalla: "comparar",
    permiso: "comparar",
  },
  {
    titulo: "Análisis estadístico",
    descripcion: "Analiza patrones y comportamientos en los datos.",
    icono: "estadisticas",
    color: "verde",
    pantalla: "analisis-estadistico",
    permiso: "estadisticas",
  },
  {
    titulo: "Predicciones IA",
    descripcion: "Genera predicciones a partir de información histórica.",
    icono: "predicciones",
    color: "morado",
    pantalla: "predicciones",
    permiso: "predicciones",
  },
  {
    titulo: "Reportes",
    descripcion: "Genera y exporta reportes personalizados.",
    icono: "reportes",
    color: "naranja",
    pantalla: "reportes",
    permiso: "reportes",
  },
];

const indicadoresDestacados = [
  {
    codigo: "IPM",
    nombre: "Índice de Pobreza Multidimensional",
    periodo: "2024",
    valor: "28,4%",
    tendencia: "+1,8%",
    tipo: "negativa",
  },
  {
    codigo: "EDU",
    nombre: "Rezago educativo",
    periodo: "2024",
    valor: "18,7%",
    tendencia: "-2,4%",
    tipo: "positiva",
  },
  {
    codigo: "SAL",
    nombre: "Sin acceso a servicios de salud",
    periodo: "2024",
    valor: "11,2%",
    tendencia: "-1,1%",
    tipo: "positiva",
  },
  {
    codigo: "EMP",
    nombre: "Desempleo de larga duración",
    periodo: "2024",
    valor: "9,6%",
    tendencia: "+0,7%",
    tipo: "negativa",
  },
];

const actividadReciente = [
  {
    tipo: "consulta",
    texto: "Consultaste indicadores de Bucaramanga",
    tiempo: "Hace 2 horas",
  },
  {
    tipo: "analisis",
    texto: "Realizaste un análisis estadístico",
    tiempo: "Ayer",
  },
  {
    tipo: "reporte",
    texto: "Generaste un reporte territorial",
    tiempo: "Hace 3 días",
  },
];

/* =========================================
   COMPONENTE PRINCIPAL
   ========================================= */

function Inicio() {
  const navigate = useNavigate();
  const usuario = obtenerUsuario();
  const accesosPermitidos = accesosRapidos.filter((acceso) =>
    tienePermiso(usuario?.rol, acceso.permiso)
  );

  function irAPantalla(pantalla) {
    if (pantalla === "inicio") {
      navigate("/app");
      return;
    }

    navigate(`/app/${pantalla}`);
  }

  return (
    <div className="inicio-usuario">

      {/* ENCABEZADO */}

      <header className="encabezado-inicio-usuario">
        <div>
          <span className="etiqueta-inicio-usuario">
            PANEL PRINCIPAL
          </span>

          <h1>Bienvenido a DataVida</h1>

          <p>
            Explora la información territorial de Colombia y utiliza
            nuestras herramientas para consultar, comparar y analizar datos.
          </p>
        </div>

        <div className="fecha-inicio-usuario">
          <span>HOY</span>
          <strong>Resumen general</strong>
        </div>
      </header>

      {/* TARJETAS DE RESUMEN */}

      <section className="tarjetas-resumen">
        {tarjetasResumen.map((tarjeta) => (
          <article
            className="tarjeta-resumen"
            key={tarjeta.etiqueta}
          >
            <div className={`icono-resumen ${tarjeta.color}`}>
              <IconoResumen tipo={tarjeta.icono} />
            </div>

            <div className="contenido-resumen">
              <strong>{tarjeta.valor}</strong>
              <span>{tarjeta.etiqueta}</span>
            </div>
          </article>
        ))}
      </section>

      {/* ACCESOS RÁPIDOS */}

      <section className="seccion-inicio-usuario">
        <div className="titulo-seccion-inicio">
          <h2>Accesos rápidos</h2>
        </div>

        <div className="grid-accesos">
          {accesosPermitidos.map((acceso) => (
            <article
              className={`tarjeta-acceso tarjeta-acceso-${acceso.color}`}
              key={acceso.pantalla}
              onClick={() => irAPantalla(acceso.pantalla)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  irAPantalla(acceso.pantalla);
                }
              }}
            >
              <div
                className={`icono-acceso icono-acceso-${acceso.color}`}
              >
                <IconoAcceso tipo={acceso.icono} />
              </div>

              <div className="contenido-acceso">
                <h3>{acceso.titulo}</h3>
                <p>{acceso.descripcion}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* INDICADORES Y ACTIVIDAD */}

      <section className="seccion-inferior-inicio">

        {/* INDICADORES */}

        <article className="panel-indicadores">
          <div className="encabezado-panel">
            <div>
              <span>DATOS DESTACADOS</span>
              <h2>Indicadores recientes</h2>
            </div>

            <button
              type="button"
              onClick={() => irAPantalla("indicadores")}
              style={{ visibility: tienePermiso(usuario?.rol, "indicadores") ? "visible" : "hidden" }}
            >
              Ver todos
            </button>
          </div>

          <div className="lista-indicadores">
            {indicadoresDestacados.map((indicador) => (
              <div
                className="fila-indicador"
                key={indicador.codigo}
              >
                <div className="informacion-indicador">
                  <span className="etiqueta-indicador">
                    {indicador.codigo}
                  </span>

                  <div>
                    <strong>{indicador.nombre}</strong>
                    <small>{indicador.periodo}</small>
                  </div>
                </div>

                <div className="valor-indicador">
                  <strong>{indicador.valor}</strong>

                  <span
                    className={`tendencia ${indicador.tipo}`}
                  >
                    {indicador.tendencia}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* ACTIVIDAD */}

        <article className="panel-actividad">
          <div className="encabezado-panel">
            <div>
              <span>HISTORIAL</span>
              <h2>Actividad reciente</h2>
            </div>

            <button type="button">
              Ver todo
            </button>
          </div>

          <div className="lista-actividad">
            {actividadReciente.map((actividad, indice) => (
              <div
                className="elemento-actividad"
                key={`${actividad.tipo}-${indice}`}
              >
                <div
                  className={`icono-actividad ${actividad.tipo}`}
                >
                  <IconoActividad tipo={actividad.tipo} />
                </div>

                <div className="contenido-actividad">
                  <p>{actividad.texto}</p>
                  <span>{actividad.tiempo}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

      </section>

      {/* BANNER FINAL */}

      <section className="banner-inicio-usuario">
        <div className="banner-contenido">
          <span>DATAVIDA</span>

          <h2>
            Convierte los datos en decisiones.
          </h2>

          <p>
            Explora los indicadores territoriales de Colombia,
            identifica patrones y comprende mejor la realidad de
            nuestros territorios.
          </p>
        </div>

        <div
          className="banner-grafico"
          aria-hidden="true"
        >
          <span className="barra-grafico barra-1"></span>
          <span className="barra-grafico barra-2"></span>
          <span className="barra-grafico barra-3"></span>
          <span className="barra-grafico barra-4"></span>
          <span className="barra-grafico barra-5"></span>
          <span className="linea-grafico"></span>
        </div>
      </section>

    </div>
  );
}

export default Inicio;