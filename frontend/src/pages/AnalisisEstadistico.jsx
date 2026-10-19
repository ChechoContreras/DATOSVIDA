
import { useEffect, useMemo, useRef, useState } from "react";
import {
  obtenerMunicipios,
  obtenerCatalogoIndicadores,
  consultarIndicadores,
} from "../services/indicadoresService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import "../styles/Indicadores.css";
import "../styles/AnalisisEstadistico.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const PERIODO = "2018";

function extraerLista(respuesta, clave) {
  if (Array.isArray(respuesta)) return respuesta;
  if (Array.isArray(respuesta?.[clave])) return respuesta[clave];
  if (Array.isArray(respuesta?.datos)) return respuesta.datos;
  return [];
}

function numero(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : null;
}

function calcularEstadisticas(valores) {
  const ordenados = [...valores].sort((a, b) => a - b);
  const n = ordenados.length;

  if (n === 0) return null;

  const suma = ordenados.reduce((a, b) => a + b, 0);
  const promedio = suma / n;

  const mediana =
    n % 2 === 0
      ? (ordenados[n / 2 - 1] + ordenados[n / 2]) / 2
      : ordenados[Math.floor(n / 2)];

  const varianza =
    n > 1
      ? ordenados.reduce(
          (total, valor) => total + (valor - promedio) ** 2,
          0
        ) / (n - 1)
      : null;

  return {
    cantidad: n,
    promedio,
    mediana,
    minimo: ordenados[0],
    maximo: ordenados[n - 1],
    desviacionEstandar:
      varianza === null ? null : Math.sqrt(varianza),
  };
}

/* Formato con 1 decimal (coma decimal) y unidad: 21,1 % */
function conUnidad(valor, unidad, decimales = 1) {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) return "—";

  const texto = valor.toLocaleString("es-CO", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });

  if (!unidad) return texto;
  return unidad === "%" ? `${texto} %` : `${texto} ${unidad}`;
}

/* Paso "redondo" para los rangos del histograma */
function pasoRedondo(bruto) {
  const potencia = 10 ** Math.floor(Math.log10(bruto));
  const base = bruto / potencia;
  const paso = base <= 1 ? 1 : base <= 2 ? 2 : base <= 2.5 ? 2.5 : base <= 5 ? 5 : 10;
  return paso * potencia;
}

/* Cuenta cuántos municipios caen en cada rango */
function calcularHistograma(valores) {
  if (valores.length < 5) return null;

  const min = Math.min(...valores);
  const max = Math.max(...valores);
  if (min === max) return null;

  const paso = pasoRedondo((max - min) / 8);
  const inicio = Math.floor(min / paso) * paso;
  const cantidad = Math.max(1, Math.ceil((max - inicio) / paso + 1e-9));
  const conteos = new Array(cantidad).fill(0);

  valores.forEach((valor) => {
    const indice = Math.min(cantidad - 1, Math.floor((valor - inicio) / paso));
    conteos[indice] += 1;
  });

  const decimales = paso % 1 === 0 ? 0 : 1;
  const etiqueta = (n) =>
    n.toLocaleString("es-CO", {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
    });

  const etiquetas = conteos.map(
    (_, i) => `${etiqueta(inicio + i * paso)}–${etiqueta(inicio + (i + 1) * paso)}`
  );

  return { etiquetas, conteos };
}

/* Plugin sencillo: escribe el conteo encima de cada barra */
const etiquetasSobreBarras = {
  id: "etiquetasSobreBarras",
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    ctx.save();
    ctx.font = "700 12px sans-serif";
    ctx.fillStyle = "#12362f";
    ctx.textAlign = "center";
    chart.getDatasetMeta(0).data.forEach((barra, i) => {
      ctx.fillText(String(chart.data.datasets[0].data[i]), barra.x, barra.y - 6);
    });
    ctx.restore();
  },
};

/* Frases en lenguaje sencillo para el cuadro "Cómo leerlo" */
function explicarResultados(est, unidad) {
  const puntos = unidad === "%" ? "puntos" : unidad || "unidades";
  const fmt = (n) => n.toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const items = [];

  const diferencia = Math.abs(est.promedio - est.mediana);
  const dispersion = est.desviacionEstandar ?? 0;

  if (dispersion > 0 && diferencia <= dispersion * 0.15) {
    items.push(["Promedio ≈ mediana", "los valores están repartidos de forma bastante pareja."]);
  } else if (est.promedio > est.mediana) {
    items.push(["Promedio mayor que la mediana", "unos pocos municipios con valores muy altos suben el promedio."]);
  } else {
    items.push(["Promedio menor que la mediana", "unos pocos municipios con valores muy bajos bajan el promedio."]);
  }

  items.push([
    `Rango de ${conUnidad(est.minimo, unidad)} a ${conUnidad(est.maximo, unidad)}`,
    `entre el municipio más bajo y el más alto hay ${fmt(est.maximo - est.minimo)} ${puntos} de diferencia.`,
  ]);

  if (est.desviacionEstandar !== null && est.desviacionEstandar !== undefined) {
    items.push([
      `Dispersión de ${fmt(est.desviacionEstandar)} ${unidad === "%" ? "pp" : unidad || ""}`.trim(),
      `un municipio típico se aleja del promedio unos ${fmt(est.desviacionEstandar)} ${puntos}.`,
    ]);
  }

  return items;
}

function obtenerCodigo(registro) {
  return String(
    registro?.territorio?.codigo ??
    registro?.municipio?.codigo ??
    registro?.municipioCodigo ??
    registro?.municipio_codigo ??
    ""
  );
}

function obtenerIdIndicador(registro) {
  return String(
    registro?.indicador?.id ??
    registro?.indicadorId ??
    registro?.indicador_id ??
    ""
  );
}

export default function AnalisisEstadistico() {
  const [municipios, setMunicipios] = useState([]);
  const [indicadores, setIndicadores] = useState([]);

  const [municipioCodigo, setMunicipioCodigo] = useState("");
  const [indicadorId, setIndicadorId] = useState("");

  const [estado, setEstado] = useState("vacio");
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState(null);
  const zonaResultados = useRef(null);

  useEffect(() => {
    let activo = true;

    Promise.all([
      obtenerMunicipios(),
      obtenerCatalogoIndicadores(),
    ])
      .then(([respuestaMunicipios, respuestaIndicadores]) => {
        if (!activo) return;

        setMunicipios(
          extraerLista(respuestaMunicipios, "municipios")
        );

        setIndicadores(
          extraerLista(respuestaIndicadores, "indicadores")
        );
      })
      .catch(() => {
        if (!activo) return;
        setError("No fue posible cargar los catálogos.");
        setEstado("error");
      });

    return () => {
      activo = false;
    };
  }, []);

  const indicadorA = useMemo(
    () =>
      indicadores.find(
        (item) => String(item.id) === String(indicadorId)
      ),
    [indicadores, indicadorId]
  );

  function limpiarResultado() {
    setEstado("vacio");
    setError("");
    setResultado(null);
  }

  async function ejecutar() {
    if (!indicadorId) {
      setError("Selecciona un indicador.");
      setEstado("error");
      return;
    }

    setEstado("cargando");
    setError("");
    setResultado(null);

    try {
      const filtros = {
        periodo: PERIODO,
        ...(municipioCodigo ? { municipioCodigo } : {}),
      };

      const respuesta = await consultarIndicadores(filtros);
      const registros = extraerLista(respuesta, "indicadores");

      if (!Array.isArray(registros)) {
        throw new Error("Formato de respuesta no reconocido.");
      }

      const codigosPDET = new Set(
        municipios.map((m) => String(m.codigo))
      );

      const registrosPDET = registros.filter((registro) => {
        const codigo = obtenerCodigo(registro);

        return (
          codigosPDET.has(codigo) &&
          (!municipioCodigo ||
            codigo === String(municipioCodigo))
        );
      });

      const valoresA = new Map();

      for (const registro of registrosPDET) {
        const codigo = obtenerCodigo(registro);
        const id = obtenerIdIndicador(registro);
        const valor = numero(registro.valor);

        if (valor === null) continue;

        if (id === String(indicadorId)) {
          valoresA.set(codigo, valor);
        }
      }

      const valores = [...valoresA.values()];
      const estadisticas = calcularEstadisticas(valores);

      if (!estadisticas) {
        setError(
          "No se encontraron registros para el indicador seleccionado."
        );
        setEstado("error");
        return;
      }

      const nombrePorCodigo = new Map(
        municipios.map((m) => [String(m.codigo), m.nombre])
      );
      const codigoDe = (objetivo) =>
        [...valoresA].find(([, v]) => v === objetivo)?.[0];

      setResultado({
        tipo: "estadisticas",
        estadisticas,
        cantidadRegistros: valores.length,
        indicador: indicadorA,
        municipioMinimo: nombrePorCodigo.get(codigoDe(estadisticas.minimo)),
        municipioMaximo: nombrePorCodigo.get(codigoDe(estadisticas.maximo)),
        histograma: calcularHistograma(valores),
        municipioUnico: municipioCodigo
          ? nombrePorCodigo.get(String(municipioCodigo))
          : null,
      });

      setEstado("resultados");
    } catch (err) {
      console.error("Error en análisis estadístico:", err);

      setError(
        err.response?.data?.mensaje ||
        err.message ||
        "No fue posible ejecutar el análisis."
      );
      setEstado("error");
    }
  }

  const estadisticas = resultado?.estadisticas;

  // Al terminar el cálculo, lleva la vista a los resultados.
  useEffect(() => {
    if (estado === "resultados") {
      zonaResultados.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [estado]);

  const unidad = resultado?.indicador?.unidad || indicadorA?.unidad || "";
  const histograma = resultado?.histograma;
  const indiceMayor = histograma
    ? histograma.conteos.indexOf(Math.max(...histograma.conteos))
    : -1;

  return (
    <div className="pagina-indicadores pagina-estadistico">
      <header className="encabezado-indicadores">
        <span className="etiqueta-pagina-indicadores">
          ANÁLISIS ESTADÍSTICO
        </span>
        <h1>Análisis estadístico</h1>
        <p>
          Mira cómo se distribuye un indicador entre los municipios PDET,
          con datos oficiales del DANE.
        </p>
      </header>

      <section className="est-filtros">
        <div className="campo-indicadores">
          <label>Municipio</label>
          <select
            value={municipioCodigo}
            onChange={(e) => {
              setMunicipioCodigo(e.target.value);
              limpiarResultado();
            }}
          >
            <option value="">Todos los municipios PDET</option>
            {municipios.map((m) => (
              <option key={m.codigo} value={m.codigo}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="campo-indicadores">
          <label>Indicador</label>
          <select
            value={indicadorId}
            onChange={(e) => {
              setIndicadorId(e.target.value);
              limpiarResultado();
            }}
          >
            <option value="">Selecciona un indicador</option>
            {indicadores.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="campo-indicadores">
          <label>Datos</label>
          <div className="est-dato-fijo">Censo DANE {PERIODO}</div>
        </div>

        <button
          type="button"
          className="est-boton"
          onClick={ejecutar}
          disabled={estado === "cargando"}
        >
          {estado === "cargando" ? "Calculando..." : "Ejecutar análisis"}
        </button>
      </section>

      {estado === "vacio" && (
        <section className="est-inicio">
          <h2>Elige un indicador para empezar</h2>
          <p>
            Selecciona el indicador y presiona «Ejecutar análisis» para ver
            cómo se distribuye entre los municipios PDET.
          </p>
        </section>
      )}

      {estado === "cargando" && (
        <section className="estado-indicadores estado-cargando-indicadores">
          <div className="spinner-indicadores"></div>
          <h2>Calculando estadísticas...</h2>
        </section>
      )}

      {estado === "error" && (
        <section className="estado-indicadores estado-sin-resultados">
          <h2>No fue posible ejecutar el análisis</h2>
          <p>{error}</p>
        </section>
      )}

      <div ref={zonaResultados}>
        {estado === "resultados" && resultado && (
          <>
            {estadisticas && (
              <>
                <section className="est-destacado">
                  <div className="est-destacado__valor">
                    {conUnidad(estadisticas.promedio, unidad)}
                  </div>
                  <div>
                    <p>
                      {resultado.municipioUnico
                        ? <>Valor de <b>{resultado.indicador?.nombre}</b> en <b>{resultado.municipioUnico}</b>.</>
                        : <>En el municipio PDET promedio, <b>{resultado.indicador?.nombre}</b> es de <b>{conUnidad(estadisticas.promedio, unidad)}</b>.</>}
                    </p>
                    <small>
                      {resultado.cantidadRegistros} municipio(s) analizado(s) · Censo Nacional de Población y Vivienda {PERIODO} (DANE)
                    </small>
                  </div>
                </section>

                {resultado.cantidadRegistros > 1 && (
                <>
                <section className="est-tarjetas">
                  {[
                    ["Promedio", conUnidad(estadisticas.promedio, unidad), "el municipio típico"],
                    ["Mediana", conUnidad(estadisticas.mediana, unidad), "la mitad está por debajo"],
                    ["Mínimo", conUnidad(estadisticas.minimo, unidad), resultado.municipioMinimo || "valor más bajo"],
                    ["Máximo", conUnidad(estadisticas.maximo, unidad), resultado.municipioMaximo || "valor más alto"],
                    [
                      "Desviación estándar",
                      estadisticas.desviacionEstandar === null
                        ? "—"
                        : conUnidad(estadisticas.desviacionEstandar, unidad === "%" ? "pp" : unidad),
                      "qué tan dispersos están",
                    ],
                  ].map(([titulo, valor, nota]) => (
                    <article className="est-tarjeta" key={titulo}>
                      <span>{titulo}</span>
                      <strong>{valor}</strong>
                      <small>{nota}</small>
                    </article>
                  ))}
                </section>

                <section className="est-dos-columnas">
                  {histograma && (
                    <article className="est-panel">
                      <h3>¿Cómo se distribuyen los municipios?</h3>
                      <p className="est-pista">
                        Cada barra cuenta cuántos de los {resultado.cantidadRegistros} municipios caen en ese rango. En naranja, el rango más frecuente.
                      </p>
                      <div className="est-grafico">
                        <Bar
                          data={{
                            labels: histograma.etiquetas,
                            datasets: [
                              {
                                label: "Municipios",
                                data: histograma.conteos,
                                borderRadius: 6,
                                backgroundColor: histograma.conteos.map((_, i) =>
                                  i === indiceMayor ? "#d68c3e" : "#2f7d68"
                                ),
                              },
                            ],
                          }}
                          plugins={[etiquetasSobreBarras]}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            animation: false,
                            layout: { padding: { top: 20 } },
                            plugins: {
                              legend: { display: false },
                              tooltip: {
                                callbacks: {
                                  label: (ctx) => `${ctx.raw} municipio(s)`,
                                },
                              },
                            },
                            scales: {
                              x: {
                                grid: { display: false },
                                title: {
                                  display: true,
                                  text: `${resultado.indicador?.nombre || "Indicador"}${unidad ? ` (${unidad})` : ""}`,
                                },
                              },
                              y: { beginAtZero: true, ticks: { precision: 0 } },
                            },
                          }}
                        />
                      </div>
                    </article>
                  )}

                  <article className="est-panel">
                    <h3>Cómo leerlo</h3>
                    <p className="est-pista">En lenguaje sencillo</p>
                    <ul className="est-lectura">
                      {explicarResultados(estadisticas, unidad).map(([titulo, texto]) => (
                        <li key={titulo}>
                          <strong>{titulo}</strong>
                          <span>{texto}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                </section>

                </>
                )}

                {resultado.cantidadRegistros === 1 && (
                  <p className="mensaje-resultado">
                    Con un solo municipio no hay distribución que mostrar.
                    Elige «Todos los municipios PDET» para ver el promedio, el
                    rango y cómo se reparten los valores.
                  </p>
                )}
              </>
            )}

            <p className="est-fuente">
              Fuente: DANE — Censo Nacional de Población y Vivienda 2018.
              Los resultados son cálculos descriptivos de DATAVIDA sobre los
              registros municipales disponibles; no constituyen estimaciones
              oficiales adicionales del DANE.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
