
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import logoDataVida from "../assets/logo-icono.png";
import colombiaGeoJSON from "../data/colombia.geo.json";
import "../styles/Indicadores.css";
import "../styles/Mapa.css";
import "leaflet/dist/leaflet.css";

const imagenMapa =
  "https://sensorial.coffee/cdn/shop/articles/10.png?v=1791889602&width=1600";

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
  },
  {
    nombre: "Visualización",
    descripcion: "Exploración territorial",
    ruta: "/app/mapa",
    icono: "◫",
  },
  {
    nombre: "Comparar",
    descripcion: "Comparación de territorios",
    ruta: "/app/comparar",
    icono: "⇄",
  },
  {
    nombre: "Análisis estadístico",
    descripcion: "Relaciones y hallazgos",
    ruta: "/app/estadisticas",
    icono: "⌁",
  },
  {
    nombre: "Predicciones IA",
    descripcion: "Proyecciones e inteligencia artificial",
    ruta: "/app/predicciones",
    icono: "✳",
  },
  {
    nombre: "Análisis de variables",
    descripcion: "Relaciones entre indicadores y variables",
    ruta: "/app/variables",
    icono: "⌁",
  },
  {
    nombre: "Recomendaciones",
    descripcion: "Orientación para el territorio",
    ruta: "/app/recomendaciones",
    icono: "◇",
  },
  {
    nombre: "Reportes",
    descripcion: "Síntesis de resultados",
    ruta: "/app/reportes",
    icono: "▧",
  },
  {
    nombre: "Perfil",
    descripcion: "Mi cuenta",
    ruta: "/app/perfil",
    icono: "○",
  },
];

/*
 * DATOS DEMOSTRATIVOS.
 * Pendiente: reemplazar por los datos del backend.
 *
 * Las claves deben coincidir con el resultado de normalizar().
 */
const datosIPM = {
  ANTIOQUIA: 18.3,
  BOLIVAR: 38.5,
  BOYACA: 21.4,
  CAQUETA: 45.3,
  CAUCA: 51.6,
  CESAR: 32.8,
  CHOCO: 62.4,
  CORDOBA: 45.3,
  CUNDINAMARCA: 14.1,
  "LA GUAJIRA": 65.2,
  MAGDALENA: 35.7,
  META: 29.4,
  NARINO: 42.8,
  "NORTE DE SANTANDER": 37.6,
  PUTUMAYO: 48.2,
  TOLIMA: 27.5,
  "VALLE DEL CAUCA": 11.7,
  "BOGOTA DC": 4.2,
  "SANTAFE DE BOGOTA DC": 4.2,
};

function normalizar(texto = "") {
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim()
    .replace(/[.,]/g, "")
    .replace(/\s+/g, " ");
}

function obtenerNombre(feature) {
  const propiedades = feature?.properties || {};

  return (
    propiedades.NOMBRE_DPT ||
    propiedades.NOMBRE ||
    propiedades.name ||
    propiedades.NAME_1 ||
    propiedades.DPTO ||
    propiedades.departamento ||
    "Territorio sin nombre"
  );
}

function obtenerIPM(nombre) {
  return datosIPM[normalizar(nombre)] ?? null;
}

function colorIPM(valor) {
  if (valor === null || valor === undefined) {
    return "#dce5dc";
  }

  if (valor < 15) return "#dce9d8";
  if (valor < 25) return "#b8d0b0";
  if (valor < 35) return "#8db18d";
  if (valor < 45) return "#d7c58b";
  if (valor < 55) return "#c99b62";

  return "#a85f45";
}

function obtenerEstilo(feature, departamentoSeleccionado) {
  const nombre = normalizar(obtenerNombre(feature));
  const seleccionado = normalizar(departamentoSeleccionado);
  const valor = obtenerIPM(obtenerNombre(feature));
  const estaSeleccionado =
    Boolean(seleccionado) && nombre === seleccionado;

  return {
    fillColor: colorIPM(valor),
    fillOpacity: estaSeleccionado ? 0.9 : 0.72,
    color: estaSeleccionado ? "#173c34" : "#ffffff",
    weight: estaSeleccionado ? 3 : 1,
    opacity: 1,
  };
}

function AjustarMapa({ datos }) {
  const mapa = useMap();

  useEffect(() => {
    if (!datos || !Array.isArray(datos.features)) {
      return;
    }

    if (datos.features.length === 0) {
      return;
    }

    const capa = L.geoJSON(datos);
    const limites = capa.getBounds();

    if (limites.isValid()) {
      mapa.fitBounds(limites, {
        padding: [20, 20],
        maxZoom: 7,
      });
    }
  }, [datos, mapa]);

  return null;
}

function IconoBusqueda() {
  return (
    <svg
      className="icono-busqueda-indicadores"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4.2 4.2" />
    </svg>
  );
}

function IconoMenu() {
  return (
    <svg
      className="icono-menu-indicadores"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function IconoCerrar() {
  return (
    <svg
      className="icono-cerrar-indicadores"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function obtenerNombreUsuario() {
  try {
    const guardado = localStorage.getItem("datavida_usuario");

    if (!guardado) {
      return "Usuario";
    }

    const usuario = JSON.parse(guardado);

    if (typeof usuario === "string") {
      return usuario;
    }

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
  if (!nombre || nombre === "Usuario") {
    return "U";
  }

  const palabras = nombre.trim().split(/\s+/);

  if (palabras.length === 1) {
    return palabras[0].slice(0, 2).toUpperCase();
  }

  return `${palabras[0][0]}${
    palabras[palabras.length - 1][0]
  }`.toUpperCase();
}

export default function Mapa() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [indicador, setIndicador] = useState("ipm");
  const [periodo, setPeriodo] = useState("2024");
  const [territorio, setTerritorio] = useState(null);

  const nombreUsuario = obtenerNombreUsuario();
  const inicialesUsuario = obtenerIniciales(nombreUsuario);

  const departamentos = useMemo(() => {
    const features = Array.isArray(colombiaGeoJSON?.features)
      ? colombiaGeoJSON.features
      : [];

    const nombres = features
      .map((feature) => obtenerNombre(feature))
      .filter((nombre) => nombre !== "Territorio sin nombre");

    return [...new Set(nombres)].sort((a, b) =>
      a.localeCompare(b, "es")
    );
  }, []);

  const datosFiltrados = useMemo(() => {
    const features = Array.isArray(colombiaGeoJSON?.features)
      ? colombiaGeoJSON.features
      : [];

    const termino = normalizar(busqueda);
    const departamentoNormalizado = normalizar(departamento);

    if (!termino && !departamentoNormalizado) {
      return colombiaGeoJSON;
    }

    return {
      ...colombiaGeoJSON,
      features: features.filter((feature) => {
        const nombre = normalizar(obtenerNombre(feature));

        const coincideBusqueda =
          !termino || nombre.includes(termino);

        const coincideDepartamento =
          !departamentoNormalizado ||
          nombre === departamentoNormalizado;

        return coincideBusqueda && coincideDepartamento;
      }),
    };
  }, [busqueda, departamento]);

  function limpiarFiltros() {
    setBusqueda("");
    setDepartamento("");
    setIndicador("ipm");
    setPeriodo("2024");
    setTerritorio(null);
  }

  function seleccionarTerritorio(feature) {
    const nombre = obtenerNombre(feature);

    setTerritorio({
      nombre,
      ipm: obtenerIPM(nombre),
    });

    setDepartamento(nombre);
    setBusqueda("");
  }

  return (
    <main className="pagina-indicadores pagina-mapa">
      <section className="hero-indicadores hero-mapa">
        <img
          className="hero-indicadores-imagen"
          src={imagenMapa}
          alt="Paisaje natural"
        />

        <div className="hero-indicadores-degradado" />

        <header className="barra-superior-indicadores">
          <Link
            to="/app"
            className="marca-indicadores"
            aria-label="Ir al inicio de DATAVIDA"
          >
            <img
              src={logoDataVida}
              alt=""
              className="logo-indicadores"
            />

            <span className="nombre-marca-indicadores">
              DATAVIDA
            </span>
          </Link>

          <div className="buscador-indicadores">
            <IconoBusqueda />

            <input
              type="search"
              placeholder="Buscar territorio"
              aria-label="Buscar territorio"
              value={busqueda}
              onChange={(evento) => {
                setBusqueda(evento.target.value);
                setTerritorio(null);
              }}
            />

            {busqueda && (
              <button
                type="button"
                className="limpiar-busqueda-indicadores"
                aria-label="Limpiar búsqueda"
                onClick={() => {
                  setBusqueda("");
                  setTerritorio(null);
                }}
              >
                <IconoCerrar />
              </button>
            )}
          </div>

          <div className="acciones-superiores-indicadores">
            <Link
              to="/app/perfil"
              className="perfil-indicadores"
              title={nombreUsuario}
              aria-label={`Ver perfil de ${nombreUsuario}`}
            >
              <span className="avatar-indicadores">
                {inicialesUsuario}
              </span>
            </Link>

            <button
              type="button"
              className="boton-menu-indicadores"
              aria-label={
                menuAbierto ? "Cerrar menú" : "Abrir menú"
              }
              aria-expanded={menuAbierto}
              onClick={() => setMenuAbierto((abierto) => !abierto)}
            >
              {menuAbierto ? <IconoCerrar /> : <IconoMenu />}
            </button>
          </div>
        </header>

        <div className="hero-indicadores-contenido">
          <span className="etiqueta-hero-indicadores">
            VISUALIZACIÓN TERRITORIAL
          </span>

          <h1>Mapa de territorios PDET</h1>

          <p>
            Información para comprender la pobreza multidimensional
            en los territorios PDET de Colombia.
          </p>
        </div>
      </section>

      {menuAbierto && (
        <>
          <button
            type="button"
            className="fondo-menu-indicadores"
            aria-label="Cerrar menú de navegación"
            onClick={() => setMenuAbierto(false)}
          />

          <nav
            className="menu-desplegable-inicio menu-mapa"
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
                <span>Sesión activa</span>
              </div>
            </div>

            <div className="menu-enlaces-inicio">
              {opcionesMenu.map((opcion) => (
                <Link
                  key={opcion.nombre}
                  to={opcion.ruta}
                  className={
                    opcion.ruta === "/app/mapa"
                      ? "enlace-menu-inicio activo"
                      : "enlace-menu-inicio"
                  }
                  aria-current={
                    opcion.ruta === "/app/mapa"
                      ? "page"
                      : undefined
                  }
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
              <small>DATAVIDA · DATOS CON PROPÓSITO</small>
            </div>
          </nav>
        </>
      )}

      <section className="contenido-indicadores contenido-mapa">
        <div className="encabezado-mapa">
          <div>
            <span className="sobretitulo-indicadores">
              EXPLORACIÓN GEOGRÁFICA
            </span>

            <h2>Explora el territorio</h2>

            <p>
              Selecciona un departamento o busca su nombre para
              consultar la información disponible.
            </p>
          </div>
        </div>

        <section className="panel-filtros-indicadores filtros-mapa">
          <div className="rejilla-filtros-indicadores">
            <div className="campo-indicadores">
              <label htmlFor="departamento-mapa">
                Departamento
              </label>

              <select
                id="departamento-mapa"
                value={departamento}
                onChange={(evento) => {
                  setDepartamento(evento.target.value);
                  setTerritorio(null);
                  setBusqueda("");
                }}
              >
                <option value="">Todos los departamentos</option>

                {departamentos.map((nombre) => (
                  <option key={nombre} value={nombre}>
                    {nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="campo-indicadores">
              <label htmlFor="indicador-mapa">Indicador</label>

              <select
                id="indicador-mapa"
                value={indicador}
                onChange={(evento) =>
                  setIndicador(evento.target.value)
                }
              >
                <option value="ipm">
                  Índice de Pobreza Multidimensional
                </option>
              </select>
            </div>

            <div className="campo-indicadores">
              <label htmlFor="periodo-mapa">Periodo</label>

              <select
                id="periodo-mapa"
                value={periodo}
                onChange={(evento) =>
                  setPeriodo(evento.target.value)
                }
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>
          </div>

          <div className="acciones-filtros-indicadores">
            <button
              type="button"
              className="boton-consultar-indicadores"
              onClick={() => setTerritorio(null)}
            >
              Consultar mapa
            </button>

            <button
              type="button"
              className="boton-limpiar-indicadores"
              onClick={limpiarFiltros}
            >
              Limpiar filtros
            </button>
          </div>
        </section>

        <section
          className="panel-mapa"
          aria-label="Mapa interactivo"
        >
          <div className="encabezado-panel-mapa">
            <div>
              <h2>Mapa interactivo de Colombia</h2>

              <p>
                Selecciona un departamento para consultar sus datos
                demostrativos.
              </p>
            </div>

            <span className="etiqueta-periodo-mapa">
              Periodo {periodo}
            </span>
          </div>

          <div className="contenedor-leaflet">
            <MapContainer
              center={[4.5709, -74.2973]}
              zoom={5}
              minZoom={4}
              scrollWheelZoom
              zoomControl={false}
              className="mapa-leaflet"
            >
              <ZoomControl position="bottomright" />

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <AjustarMapa datos={datosFiltrados} />

              <GeoJSON
                key={`${departamento}-${busqueda}`}
                data={datosFiltrados}
                style={(feature) =>
                  obtenerEstilo(feature, departamento)
                }
                onEachFeature={(feature, capa) => {
                  const nombre = obtenerNombre(feature);
                  const valor = obtenerIPM(nombre);

                  capa.bindTooltip(
                    `<strong>${nombre}</strong><br/>IPM demostrativo: ${
                      valor === null ? "Sin dato" : `${valor}%`
                    }`,
                    { sticky: true }
                  );

                  capa.on({
                    click: () => seleccionarTerritorio(feature),

                    mouseover: (evento) => {
                      evento.target.setStyle({
                        weight: 2.5,
                        color: "#173c34",
                        fillOpacity: 0.9,
                      });

                      evento.target.bringToFront();
                    },

                    mouseout: (evento) => {
                      evento.target.setStyle(
                        obtenerEstilo(feature, departamento)
                      );
                    },
                  });
                }}
              />
            </MapContainer>
          </div>

          <div className="leyenda-mapa">
            <strong>Nivel del IPM</strong>

            <div className="elementos-leyenda-mapa">
              <span>
                <i style={{ background: "#dce9d8" }} />
                Menor de 15%
              </span>

              <span>
                <i style={{ background: "#b8d0b0" }} />
                15–24%
              </span>

              <span>
                <i style={{ background: "#8db18d" }} />
                25–34%
              </span>

              <span>
                <i style={{ background: "#d7c58b" }} />
                35–44%
              </span>

              <span>
                <i style={{ background: "#c99b62" }} />
                45–54%
              </span>

              <span>
                <i style={{ background: "#a85f45" }} />
                55% o más
              </span>
            </div>
          </div>
        </section>

        {territorio && (
          <section
            className="detalle-territorio-mapa"
            aria-live="polite"
          >
            <div>
              <span className="sobretitulo-indicadores">
                TERRITORIO SELECCIONADO
              </span>

              <h2>{territorio.nombre}</h2>

              <p>Índice de Pobreza Multidimensional (IPM)</p>
            </div>

            <div className="valor-ipm-mapa">
              {territorio.ipm === null
                ? "Sin dato"
                : `${territorio.ipm}%`}
            </div>
          </section>
        )}

        <p className="nota-datos-mapa">
          Nota: los valores representados son demostrativos y no
          corresponden a estadísticas oficiales. El periodo es un
          filtro visual; los datos reales deberán conectarse al
          microservicio de indicadores.
        </p>
      </section>

      <footer className="pie-indicadores">
        <div className="pie-indicadores-contenido">
          <Link to="/app" className="marca-pie-indicadores">
            <img src={logoDataVida} alt="" />
            <span>DATAVIDA</span>
          </Link>

          <p>
            Información para comprender la pobreza multidimensional
            en los territorios PDET de Colombia.
          </p>
        </div>

        <div className="pie-indicadores-final">
          Proyecto DATAVIDA · Proyecto Integrador II · UPB
        </div>
      </footer>
    </main>
  );
}

