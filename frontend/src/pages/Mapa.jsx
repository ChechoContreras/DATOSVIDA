import { useState } from "react";
import colombiaGeoJSON from "../data/colombia.geo.json";
import "../styles/Mapa.css";

// ============================================
// DATOS PDET
// ============================================

const datosPDET = {
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

  // Datos adicionales para la comparación
  "BOGOTA D.C": 4.2,
  "SANTAFE DE BOGOTA D.C": 4.2,
};

// ============================================
// DATOS PARA COMPARACIÓN
// ============================================

const departamentosComparacion = [
  {
    nombre: "ANTIOQUIA",
    valor: 18.3,
  },
  {
    nombre: "BOGOTA D.C.",
    valor: 4.2,
  },
  {
    nombre: "BOLIVAR",
    valor: 38.5,
  },
  {
    nombre: "CHOCO",
    valor: 62.4,
  },
  {
    nombre: "CUNDINAMARCA",
    valor: 14.1,
  },
  {
    nombre: "LA GUAJIRA",
    valor: 65.2,
  },
];

// ============================================
// DATOS EVOLUCIÓN
// ============================================

const evolucionIPM = [
  {
    periodo: "2019",
    valor: 27.8,
  },
  {
    periodo: "2020",
    valor: 26.4,
  },
  {
    periodo: "2021",
    valor: 25.7,
  },
  {
    periodo: "2022",
    valor: 24.9,
  },
  {
    periodo: "2023",
    valor: 23.8,
  },
];

// ============================================
// NORMALIZAR NOMBRES
// ============================================

const normalizarNombre = (nombre) => {
  if (!nombre) return "";

  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim()
    .replace(/,/g, "")
    .replace(/\s+/g, " ");
};

// ============================================
// OBTENER VALOR
// ============================================

const obtenerValor = (nombre) => {
  const nombreNormalizado = normalizarNombre(nombre);

  return datosPDET[nombreNormalizado] ?? null;
};

// ============================================
// COLORES
// ============================================

const obtenerColor = (valor) => {
  if (valor === null || valor === undefined) {
    return "#CBD5E1";
  }

  if (valor >= 60) {
    return "#991B1B";
  }

  if (valor >= 45) {
    return "#DC2626";
  }

  if (valor >= 30) {
    return "#F97316";
  }

  if (valor >= 20) {
    return "#FACC15";
  }

  return "#22C55E";
};

// ============================================
// COORDENADAS DEL GEOJSON
// ============================================

const obtenerCoordenadas = (geoJSON) => {
  const coordenadas = [];

  const recorrer = (elemento) => {
    if (!Array.isArray(elemento)) return;

    if (
      elemento.length >= 2 &&
      typeof elemento[0] === "number" &&
      typeof elemento[1] === "number"
    ) {
      coordenadas.push(elemento);
      return;
    }

    elemento.forEach(recorrer);
  };

  geoJSON.features.forEach((feature) => {
    if (feature.geometry?.coordinates) {
      recorrer(feature.geometry.coordinates);
    }
  });

  return coordenadas;
};

const todasLasCoordenadas = obtenerCoordenadas(colombiaGeoJSON);

const longitudes = todasLasCoordenadas.map(
  (coordenada) => coordenada[0]
);

const latitudes = todasLasCoordenadas.map(
  (coordenada) => coordenada[1]
);

const minLon = Math.min(...longitudes);
const maxLon = Math.max(...longitudes);
const minLat = Math.min(...latitudes);
const maxLat = Math.max(...latitudes);

// ============================================
// MAPA SVG
// ============================================

const ANCHO_MAPA = 500;
const ALTO_MAPA = 550;
const MARGEN = 20;

const convertirCoordenada = ([lon, lat]) => {
  const rangoLon = maxLon - minLon;
  const rangoLat = maxLat - minLat;

  const x =
    ((lon - minLon) / rangoLon) *
      (ANCHO_MAPA - MARGEN * 2) +
    MARGEN;

  const y =
    ALTO_MAPA -
    ((lat - minLat) / rangoLat) *
      (ALTO_MAPA - MARGEN * 2) -
    MARGEN;

  return [x, y];
};

// ============================================
// GEOJSON → PATH SVG
// ============================================

const convertirAnilloAPath = (anillo) => {
  if (!anillo || anillo.length === 0) {
    return "";
  }

  return (
    anillo
      .map((coordenada, index) => {
        const [x, y] =
          convertirCoordenada(coordenada);

        if (index === 0) {
          return `M ${x} ${y}`;
        }

        return `L ${x} ${y}`;
      })
      .join(" ") + " Z"
  );
};

const convertirGeometriaAPath = (geometry) => {
  if (!geometry) return "";

  if (geometry.type === "Polygon") {
    return geometry.coordinates
      .map((anillo) =>
        convertirAnilloAPath(anillo)
      )
      .join(" ");
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates
      .map((poligono) =>
        poligono
          .map((anillo) =>
            convertirAnilloAPath(anillo)
          )
          .join(" ")
      )
      .join(" ");
  }

  return "";
};

// ============================================
// COMPONENTE
// ============================================

export default function Mapa() {
  const [seleccionado, setSeleccionado] =
    useState(null);

  const [filtroDepartamento, setFiltroDepartamento] =
    useState("");

  const [filtroIndicador, setFiltroIndicador] =
    useState("ipm");

  const [filtroPeriodo, setFiltroPeriodo] =
    useState("2023");

  // ============================================
  // DEPARTAMENTOS
  // ============================================

  const departamentos = colombiaGeoJSON.features
    .map(
      (feature) =>
        feature.properties?.NOMBRE_DPT ||
        feature.properties?.NOMBRE_DPTO ||
        feature.properties?.name
    )
    .filter(Boolean)
    .sort();

  // ============================================
  // SELECCIONAR DEPARTAMENTO
  // ============================================

  const seleccionarDepartamento = (feature) => {
    const nombre =
      feature.properties?.NOMBRE_DPT ||
      feature.properties?.NOMBRE_DPTO ||
      feature.properties?.name;

    const valor = obtenerValor(nombre);

    setSeleccionado({
      nombre,
      valor,
    });
  };

  // ============================================
  // FILTRO DEPARTAMENTO
  // ============================================

  const mostrarDepartamento = (nombre) => {
    if (!filtroDepartamento) {
      return true;
    }

    return (
      normalizarNombre(nombre) ===
      normalizarNombre(filtroDepartamento)
    );
  };

  // ============================================
  // ACTUALIZAR
  // ============================================

  const actualizarMapa = () => {
    setSeleccionado(null);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <section className="pagina-mapa">

      {/* ========================================
          ENCABEZADO
      ======================================== */}

      <div className="encabezado-mapa">

        <div>
          <p className="pagina-mapa__etiqueta">
            VISUALIZACIÓN
          </p>

          <h1>
            Mapa de territorios PDET
          </h1>

          <p className="descripcion-mapa">
            Explora los territorios priorizados y
            consulta información relacionada con el
            Índice de Pobreza Multidimensional.
          </p>
        </div>

      </div>

      {/* ========================================
          FILTROS
      ======================================== */}

      <div className="filtros-mapa">

        <div className="filtros-mapa__contenido">

          {/* DEPARTAMENTO */}

          <div className="campo-mapa">

            <label>
              Departamento
            </label>

            <select
              value={filtroDepartamento}
              onChange={(e) =>
                setFiltroDepartamento(
                  e.target.value
                )
              }
            >

              <option value="">
                Todos
              </option>

              {departamentos.map(
                (departamento) => (
                  <option
                    key={departamento}
                    value={departamento}
                  >
                    {departamento}
                  </option>
                )
              )}

            </select>

          </div>

          {/* INDICADOR */}

          <div className="campo-mapa">

            <label>
              Indicador
            </label>

            <select
              value={filtroIndicador}
              onChange={(e) =>
                setFiltroIndicador(
                  e.target.value
                )
              }
            >

              <option value="todos">
                Todos los indicadores
              </option>

              <option value="ipm">
                Índice de Pobreza Multidimensional
              </option>

            </select>

          </div>

          {/* PERIODO */}

          <div className="campo-mapa">

            <label>
              Periodo
            </label>

            <select
              value={filtroPeriodo}
              onChange={(e) =>
                setFiltroPeriodo(
                  e.target.value
                )
              }
            >

              <option value="2019">
                2019
              </option>

              <option value="2020">
                2020
              </option>

              <option value="2021">
                2021
              </option>

              <option value="2022">
                2022
              </option>

              <option value="2023">
                2023
              </option>

            </select>

          </div>

          {/* BOTÓN */}

          <button
            className="boton-consultar-mapa"
            onClick={actualizarMapa}
          >
            Consultar
          </button>

        </div>

      </div>

      {/* ========================================
          CONTENIDO PRINCIPAL
      ======================================== */}

      <div className="contenido-mapa">

        {/* ======================================
            TARJETA DEL MAPA
        ====================================== */}

        <div className="tarjeta-mapa-pdet">

          <div className="encabezado-tarjeta-mapa">

            <div>

              <h2>
                Mapa de Colombia
              </h2>

              <p>
                Territorios PDET según el IPM
              </p>

            </div>

            {/* LEYENDA */}

            <div className="leyenda-mapa-pdet">

              <span>
                <i
                  style={{
                    background: "#22C55E",
                  }}
                />
                0 - 20
              </span>

              <span>
                <i
                  style={{
                    background: "#FACC15",
                  }}
                />
                20 - 30
              </span>

              <span>
                <i
                  style={{
                    background: "#F97316",
                  }}
                />
                30 - 45
              </span>

              <span>
                <i
                  style={{
                    background: "#DC2626",
                  }}
                />
                45 - 60
              </span>

              <span>
                <i
                  style={{
                    background: "#991B1B",
                  }}
                />
                60+
              </span>

            </div>

          </div>

          {/* ====================================
              MAPA
          ==================================== */}

          <div className="contenedor-mapa-pdet">

            <svg
              className="mapa-colombia-pdet"
              viewBox={`0 0 ${ANCHO_MAPA} ${ALTO_MAPA}`}
              preserveAspectRatio="xMidYMid meet"
            >

              {colombiaGeoJSON.features.map(
                (feature, index) => {

                  const nombre =
                    feature.properties?.NOMBRE_DPT ||
                    feature.properties?.NOMBRE_DPTO ||
                    feature.properties?.name;

                  const valor =
                    obtenerValor(nombre);

                  const path =
                    convertirGeometriaAPath(
                      feature.geometry
                    );

                  const seleccionadoActual =
                    seleccionado?.nombre ===
                    nombre;

                  const visible =
                    mostrarDepartamento(nombre);

                  return (
                    <path
                      key={`${nombre}-${index}`}
                      d={path}
                      fill={
                        visible
                          ? obtenerColor(valor)
                          : "#E5E7EB"
                      }
                      stroke="#FFFFFF"
                      strokeWidth={
                        seleccionadoActual
                          ? 2
                          : 0.7
                      }
                      fillOpacity={
                        seleccionadoActual
                          ? 1
                          : 0.9
                      }
                      fillRule="evenodd"
                      className="departamento-pdet"
                      onClick={() =>
                        seleccionarDepartamento(
                          feature
                        )
                      }
                    >

                      <title>
                        {nombre}

                        {valor !== null
                          ? ` - ${valor}%`
                          : " - Sin datos"}
                      </title>

                    </path>
                  );
                }
              )}

            </svg>

            {/* ==================================
                INFORMACIÓN SELECCIONADA
            ================================== */}

            {seleccionado && (
              <div className="informacion-mapa-pdet">

                <button
                  className="cerrar-informacion-mapa"
                  onClick={() =>
                    setSeleccionado(null)
                  }
                >
                  ×
                </button>

                <p>
                  Departamento
                </p>

                <h3>
                  {seleccionado.nombre}
                </h3>

                <strong>
                  {seleccionado.valor !== null
                    ? `${seleccionado.valor}%`
                    : "Sin datos"}
                </strong>

                <span>
                  Índice de Pobreza
                  Multidimensional
                </span>

              </div>
            )}

          </div>

        </div>

        {/* ======================================
            PANEL DERECHO
        ====================================== */}

        <aside className="panel-mapa-pdet">

          {/* TARJETA PDET */}

          <div className="tarjeta-info-pdet">

            <span className="tarjeta-info-pdet__etiqueta">
              PDET
            </span>

            <h2>
              Territorios priorizados
            </h2>

            <p>
              Consulta los departamentos
              representados en el mapa y revisa
              su comportamiento frente al Índice
              de Pobreza Multidimensional.
            </p>

          </div>

          {/* TERRITORIO SELECCIONADO */}

          {seleccionado && (
            <div className="tarjeta-seleccion-pdet">

              <span>
                Territorio seleccionado
              </span>

              <h3>
                {seleccionado.nombre}
              </h3>

              <div className="valor-pdet">

                {seleccionado.valor !== null
                  ? `${seleccionado.valor}%`
                  : "Sin datos"}

              </div>

              <p>
                Valor del IPM registrado para el
                territorio.
              </p>

            </div>
          )}

        </aside>

      </div>

      {/* ========================================
          COMPARACIÓN DEL INDICADOR
      ======================================== */}

      <section className="seccion-estadisticas">

        <div className="encabezado-estadisticas">

          <p className="estadistica-etiqueta">
            COMPARACIÓN DEL INDICADOR
          </p>

          <h2>
            Departamentos con mayor IPM
          </h2>

          <p>
            Comparación del Índice de Pobreza
            Multidimensional entre departamentos.
          </p>

        </div>

        <div className="tarjetas-comparacion">

          {departamentosComparacion.map(
            (departamento) => (

              <div
                className="tarjeta-comparacion"
                key={departamento.nombre}
              >

                <div className="comparacion-superior">

                  <span>
                    {departamento.nombre}
                  </span>

                  <strong>
                    {departamento.valor}%
                  </strong>

                </div>

                <div className="barra-comparacion">

                  <div
                    className="barra-comparacion__relleno"
                    style={{
                      width: `${Math.min(
                        departamento.valor,
                        100
                      )}%`,
                      backgroundColor:
                        obtenerColor(
                          departamento.valor
                        ),
                    }}
                  />

                </div>

              </div>

            )
          )}

        </div>

      </section>

      {/* ========================================
          EVOLUCIÓN DEL IPM
      ======================================== */}

      <section className="seccion-evolucion">

        <div className="encabezado-estadisticas">

          <p className="estadistica-etiqueta">
            EVOLUCIÓN
          </p>

          <h2>
            Evolución del IPM
          </h2>

          <p>
            Comportamiento del promedio nacional
            durante el periodo seleccionado.
          </p>

        </div>

        <div className="tarjeta-evolucion">

          {/* RESUMEN */}

          <div className="resumen-evolucion">

            <span>
              Promedio nacional
            </span>

            <strong>
              23.8%
            </strong>

          </div>

          {/* GRÁFICO */}

          <div className="grafico-evolucion">

            <div className="linea-grafico">

              {evolucionIPM.map(
                (dato, index) => {

                  const maximo = 30;
                  const minimo = 20;

                  const porcentaje =
                    ((dato.valor - minimo) /
                      (maximo - minimo)) *
                    100;

                  return (
                    <div
                      className="punto-evolucion"
                      key={dato.periodo}
                    >

                      <div
                        className="valor-evolucion"
                        style={{
                          bottom: `${Math.max(
                            15,
                            Math.min(
                              porcentaje,
                              90
                            )
                          )}%`,
                        }}
                      >
                        {dato.valor}%
                      </div>

                      <div
                        className="punto-evolucion__circulo"
                        style={{
                          bottom: `${Math.max(
                            15,
                            Math.min(
                              porcentaje,
                              90
                            )
                          )}%`,
                        }}
                      />

                      {index <
                        evolucionIPM.length -
                          1 && (
                        <div
                          className="linea-conexion"
                          style={{
                            bottom: `${Math.max(
                              15,
                              Math.min(
                                porcentaje,
                                90
                              )
                            )}%`,
                          }}
                        />
                      )}

                      <span className="periodo-evolucion">
                        {dato.periodo}
                      </span>

                    </div>
                  );
                }
              )}

            </div>

          </div>

          {/* VALORES */}

          <div className="valores-evolucion">

            {evolucionIPM.map(
              (dato) => (
                <div
                  key={dato.periodo}
                  className="dato-evolucion"
                >
                  <span>
                    {dato.periodo}
                  </span>

                  <strong>
                    {dato.valor}%
                  </strong>
                </div>
              )
            )}

          </div>

        </div>

      </section>

    </section>
  );
}