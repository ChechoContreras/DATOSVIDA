
import { Link } from "react-router-dom";
import logoIcono from "../assets/logo-icono.png";
import "../styles/Landing.css";

const imagenHero =
  "https://images.unsplash.com/photo-1568489711036-9c94a7d5aea6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=88&w=1600";

const imagenTerritorio =
  "https://images.unsplash.com/photo-1650201777831-8c5c23a2b41e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=88&w=1400";

const mapaPdetUrl =
  "https://www.arcgis.com/apps/mapviewer/index.html?url=https%3A%2F%2Fmapas.igac.gov.co%2Fserver%2Frest%2Fservices%2Fordenamientoterritorial%2FmunicipiosPDET%2FMapServer";

function Marca({ footer = false }) {
  return (
    <Link
      to="/"
      className={`landing__marca ${
        footer ? "landing__marca--footer" : ""
      }`}
      aria-label="DATAVIDA, página de inicio"
    >
      <img
        src={logoIcono}
        alt=""
        className="landing__logo"
      />

      <span className="landing__marca-texto">
        <strong>DATAVIDA</strong>
        <small>DATOS QUE TRANSFORMAN</small>
      </span>
    </Link>
  );
}

function Icono({ tipo }) {
  const propiedades = {
    width: 25,
    height: 25,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (tipo === "indicadores") {
    return (
      <svg {...propiedades}>
        <path d="M4 19V5" />
        <path d="M4 19h17" />
        <rect x="7" y="11" width="3" height="5" rx="0.5" />
        <rect x="13" y="7" width="3" height="9" rx="0.5" />
        <rect x="19" y="4" width="2" height="12" rx="0.5" />
      </svg>
    );
  }

  if (tipo === "mapa") {
    return (
      <svg {...propiedades}>
        <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z" />
        <path d="M9 3v15" />
        <path d="M15 6v15" />
        <circle cx="12" cy="10" r="2" />
      </svg>
    );
  }

  if (tipo === "analisis") {
    return (
      <svg {...propiedades}>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m15.5 15.5 5 5" />
        <path d="M7.5 12.5 9.5 10l2 1.5 2.5-3" />
      </svg>
    );
  }

  return (
    <svg {...propiedades}>
      <path d="M6 2.5h8l4 4V21H6z" />
      <path d="M14 2.5v5h4" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
      <path d="M9 8h1" />
    </svg>
  );
}

const funcionalidades = [
  {
    numero: "01",
    icono: "indicadores",
    titulo: "Indicadores territoriales",
    descripcion:
      "Consulta información relacionada con las dimensiones e indicadores de pobreza multidimensional.",
    ruta: "/app/indicadores",
  },
  {
    numero: "02",
    icono: "mapa",
    titulo: "Visualización geográfica",
    descripcion:
      "Explora los territorios PDET y comprende cómo se distribuye la información en Colombia.",
    ruta: "/app/mapa",
  },
  {
    numero: "03",
    icono: "analisis",
    titulo: "Análisis de datos",
    descripcion:
      "Compara indicadores y encuentra diferencias que ayudan a comprender las realidades territoriales.",
    ruta: "/app/analisis-estadistico",
  },
  {
    numero: "04",
    icono: "reportes",
    titulo: "Generación de reportes",
    descripcion:
      "Organiza los resultados para facilitar su consulta, interpretación y seguimiento.",
    ruta: "/app/reportes",
  },
];

const pasos = [
  {
    numero: "01",
    titulo: "Organizar",
    descripcion:
      "Reunir los indicadores para contar con información estructurada y comprensible.",
  },
  {
    numero: "02",
    titulo: "Contextualizar",
    descripcion:
      "Relacionar los datos con las características de cada territorio.",
  },
  {
    numero: "03",
    titulo: "Comprender",
    descripcion:
      "Identificar diferencias y necesidades que contribuyan a orientar decisiones.",
  },
];

function Landing() {
  const volverAlInicio = (evento) => {
    evento.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="landing" id="inicio">
      <header className="landing__header">
        <div className="landing__header-contenido">
          <Marca />

          <nav
            className="landing__nav"
            aria-label="Navegación principal"
          >
            <a href="#proposito">Propósito</a>
            <a href="#funcionalidades">Funcionalidades</a>
            <a href="#territorios">Territorios</a>
          </nav>

          <div className="landing__acciones-header">
            <Link to="/login" className="landing__login">
              Iniciar sesión
            </Link>

            <Link
              to="/login"
              className="landing__boton landing__boton--pequeno"
            >
              Explorar plataforma
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </header>

      <section className="landing__hero">
        <div className="landing__hero-cuadricula" />

        <div className="landing__hero-contenido">
          <div className="landing__hero-texto">
            <p className="landing__eyebrow landing__eyebrow--claro">
              INFORMACIÓN · TERRITORIO · COMPRENSIÓN
            </p>

            <h1>
              Datos que revelan
              <br />
              <em>el territorio.</em>
            </h1>

            <p className="landing__hero-descripcion">
              Información para comprender la pobreza multidimensional
              en los territorios PDET de Colombia.
            </p>

            <div className="landing__hero-botones">
              <a
                href="#territorios"
                className="landing__boton landing__boton--dorado"
              >
                Explorar territorios
                <span aria-hidden="true">↗</span>
              </a>

              <a
                href="#proposito"
                className="landing__enlace-claro"
              >
                Conocer DATAVIDA
                <span aria-hidden="true">→</span>
              </a>
            </div>

            <div className="landing__hero-dato">
              <span className="landing__hero-dato-linea" />
              <p>
                <strong>170 municipios</strong>
                <span>agrupados en 16 subregiones PDET</span>
              </p>
            </div>
          </div>

          <div className="landing__hero-imagen-contenedor">
            <img
              src={imagenHero}
              alt="Paisaje rural colombiano rodeado de montañas y vegetación"
              className="landing__hero-imagen"
            />

            <div className="landing__hero-imagen-sombra" />

            <div className="landing__hero-imagen-texto">
              <span>COLOMBIA PROFUNDA</span>
              <p>
                Cada dato tiene un lugar
                <br />y una historia.
              </p>
            </div>

            <span className="landing__hero-coordenadas">
              04° N · 72° O
            </span>
          </div>
        </div>

        <div className="landing__hero-pie">
          <span>DATOS CON CONTEXTO</span>
          <span>UNA MIRADA AL TERRITORIO COLOMBIANO</span>
          <a href="#proposito" aria-label="Desplazarse hacia abajo">
            ↓
          </a>
        </div>
      </section>

      <section className="landing__proposito" id="proposito">
        <div className="landing__proposito-imagen-contenedor">
          <img
            src={imagenTerritorio}
            alt="Paisaje natural que representa la diversidad de los territorios"
            className="landing__proposito-imagen"
            loading="lazy"
          />

          <div className="landing__imagen-etiqueta">
            <span>01 — EL PROPÓSITO</span>
            <p>Comprender para transformar.</p>
          </div>
        </div>

        <div className="landing__proposito-contenido">
          <p className="landing__eyebrow">
            01 — NUESTRO PROPÓSITO
          </p>

          <h2>
            Comprender la pobreza
            <br />
            más allá de <em>una cifra.</em>
          </h2>

          <p className="landing__texto">
            La pobreza multidimensional tiene distintas expresiones
            según las condiciones sociales, económicas y territoriales.
            DATAVIDA busca facilitar la consulta y el análisis de
            información para comprender mejor las realidades de los
            municipios PDET de Colombia.
          </p>

          <div className="landing__pasos">
            {pasos.map((paso) => (
              <article className="landing__paso" key={paso.numero}>
                <span className="landing__paso-numero">
                  {paso.numero}
                </span>

                <div>
                  <h3>{paso.titulo}</h3>
                  <p>{paso.descripcion}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="landing__funcionalidades"
        id="funcionalidades"
      >
        <div className="landing__seccion-encabezado">
          <div>
            <p className="landing__eyebrow">
              02 — LA PLATAFORMA
            </p>

            <h2>
              Información que
              <br />
              <em>cobra sentido.</em>
            </h2>
          </div>

          <p className="landing__seccion-descripcion">
            Herramientas para consultar, explorar y analizar información
            sobre los territorios, desde diferentes perspectivas.
          </p>
        </div>

        <div className="landing__funcionalidades-grid">
          {funcionalidades.map((funcionalidad) => (
            <article
              className="landing__funcionalidad"
              key={funcionalidad.numero}
            >
              <div className="landing__funcionalidad-arriba">
                <span>{funcionalidad.numero}</span>
                <span className="landing__funcionalidad-icono">
                  <Icono tipo={funcionalidad.icono} />
                </span>
              </div>

              <h3>{funcionalidad.titulo}</h3>
              <p>{funcionalidad.descripcion}</p>

              <Link
                to={funcionalidad.ruta}
                className="landing__funcionalidad-enlace"
              >
                Explorar
                <span aria-hidden="true">↗</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="landing__territorios" id="territorios">
        <div className="landing__territorios-contenido">
          <p className="landing__eyebrow landing__eyebrow--claro">
            04 — UNA MIRADA A COLOMBIA
          </p>

          <h2>
            Un país.
            <br />
            Muchos territorios.
            <br />
            <em>Realidades distintas.</em>
          </h2>

          <p className="landing__territorios-descripcion">
            Los municipios PDET hacen parte de territorios con historias,
            características y desafíos propios. Explorar sus indicadores
            permite acercarnos a esas diferencias con mayor contexto.
          </p>

          <Link
            to="/app/mapa"
            className="landing__boton landing__boton--dorado"
          >
            Explorar los datos
            <span aria-hidden="true">↗</span>
          </Link>

          <div className="landing__territorios-cita">
            <span>170</span>
            <p>
              municipios PDET
              <br />
              en 16 subregiones
            </p>
          </div>
        </div>

        <div className="landing__territorios-visual">
          <div className="landing__mapa-encabezado">
            <span>COLOMBIA</span>
            <span>MAPA DE TERRITORIOS PDET</span>
          </div>

          <div className="landing__mapa-marco landing__mapa-marco--real">
            <iframe
              className="landing__mapa-iframe"
              src={mapaPdetUrl}
              title="Mapa geográfico de municipios PDET de Colombia"
              loading="lazy"
              allowFullScreen
            />

            <div className="landing__mapa-leyenda">
              <span className="landing__mapa-leyenda-muestra" />
              <p>Municipios PDET de Colombia</p>
            </div>
          </div>

          <p className="landing__mapa-fuente">
            Fuente cartográfica: IGAC y Agencia de Renovación del Territorio.
          </p>

          <a
            className="landing__mapa-enlace"
            href="https://mapas.igac.gov.co/server/rest/services/ordenamientoterritorial/municipiosPDET/MapServer"
            target="_blank"
            rel="noreferrer"
          >
            Consultar servicio cartográfico oficial
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <section className="landing__llamado">
        <div className="landing__llamado-contenido">
          <p className="landing__eyebrow">
            DATAVIDA · DATOS CON PROPÓSITO
          </p>

          <h2>
            Conocer el territorio es el primer paso para{" "}
            <em>comprenderlo.</em>
          </h2>

          <p>
            Explora la información y descubre nuevas perspectivas sobre
            la pobreza multidimensional en los territorios PDET.
          </p>

          <Link
            to="/login"
            className="landing__boton landing__boton--oscuro"
          >
            Ingresar a DATAVIDA
            <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div
          className="landing__llamado-decoracion"
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
        </div>
      </section>

      <footer className="landing__footer">
        <div className="landing__footer-principal">
          <Marca footer />

          <p className="landing__footer-descripcion">
            Información para comprender la pobreza multidimensional
            en los territorios PDET de Colombia.
          </p>

          <nav
            className="landing__footer-enlaces"
            aria-label="Enlaces del pie de página"
          >
            <a href="#proposito">Propósito</a>
            <a href="#funcionalidades">Funcionalidades</a>
            <a href="#territorios">Territorios</a>
            <Link to="/login">Iniciar sesión</Link>
          </nav>
        </div>

        <div className="landing__footer-final">
          <p>Proyecto DATAVIDA · Proyecto Integrador II · UPB</p>

          <a href="#inicio" onClick={volverAlInicio}>
            Volver al inicio ↑
          </a>
        </div>
      </footer>
    </main>
  );
}

export default Landing;
