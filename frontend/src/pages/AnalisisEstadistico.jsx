
import { useEffect, useMemo, useState } from "react";
import {
  obtenerMunicipios,
  obtenerCatalogoIndicadores,
  consultarIndicadores,
} from "../services/indicadoresService";
import "../styles/Indicadores.css";

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

function formato(valor) {
  if (valor === null || !Number.isFinite(valor)) return "—";

  return valor.toLocaleString("es-CO", {
    maximumFractionDigits: 3,
  });
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

function calcularCorrelacion(pares) {
  const n = pares.length;
  if (n < 3) return null;

  const promedioX =
    pares.reduce((s, p) => s + p.x, 0) / n;
  const promedioY =
    pares.reduce((s, p) => s + p.y, 0) / n;

  let numerador = 0;
  let sumaX = 0;
  let sumaY = 0;

  for (const par of pares) {
    const dx = par.x - promedioX;
    const dy = par.y - promedioY;

    numerador += dx * dy;
    sumaX += dx * dx;
    sumaY += dy * dy;
  }

  if (sumaX === 0 || sumaY === 0) return null;

  return numerador / Math.sqrt(sumaX * sumaY);
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
  const [indicadorIdB, setIndicadorIdB] = useState("");
  const [tipoAnalisis, setTipoAnalisis] = useState("estadisticas");

  const [estado, setEstado] = useState("vacio");
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState(null);

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

  const indicadorB = useMemo(
    () =>
      indicadores.find(
        (item) => String(item.id) === String(indicadorIdB)
      ),
    [indicadores, indicadorIdB]
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

    if (tipoAnalisis === "correlacion") {
      if (!indicadorIdB) {
        setError("Selecciona el segundo indicador.");
        setEstado("error");
        return;
      }

      if (indicadorId === indicadorIdB) {
        setError("Selecciona dos indicadores diferentes.");
        setEstado("error");
        return;
      }

      if (municipioCodigo) {
        setError(
          "Para calcular correlaciones, selecciona todos los municipios PDET."
        );
        setEstado("error");
        return;
      }
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
      const valoresB = new Map();

      for (const registro of registrosPDET) {
        const codigo = obtenerCodigo(registro);
        const id = obtenerIdIndicador(registro);
        const valor = numero(registro.valor);

        if (valor === null) continue;

        if (id === String(indicadorId)) {
          valoresA.set(codigo, valor);
        }

        if (id === String(indicadorIdB)) {
          valoresB.set(codigo, valor);
        }
      }

      if (tipoAnalisis === "estadisticas") {
        const valores = [...valoresA.values()];
        const estadisticas = calcularEstadisticas(valores);

        if (!estadisticas) {
          setError(
            "No se encontraron registros para el indicador seleccionado."
          );
          setEstado("error");
          return;
        }

        setResultado({
          tipo: "estadisticas",
          estadisticas,
          cantidadRegistros: valores.length,
        });
      } else {
        const pares = [];

        for (const [codigo, x] of valoresA) {
          if (valoresB.has(codigo)) {
            pares.push({
              codigo,
              x,
              y: valoresB.get(codigo),
            });
          }
        }

        const correlacion = calcularCorrelacion(pares);

        setResultado({
          tipo: "correlacion",
          correlacion,
          cantidadRegistros: pares.length,
          pares,
        });
      }

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

  return (
    <div className="pagina-indicadores">
      <header className="encabezado-indicadores">
        <span className="etiqueta-pagina-indicadores">
          ANÁLISIS ESTADÍSTICO
        </span>
        <h1>Análisis estadístico</h1>
        <p>
          Calcula estadísticas descriptivas y correlaciones
          con los datos oficiales de los municipios PDET.
        </p>
      </header>

      <section className="panel-filtros-indicadores">
        <div className="grid-filtros-indicadores">
          <div className="campo-indicadores">
            <label>Municipio</label>
            <select
              value={municipioCodigo}
              onChange={(e) => {
                setMunicipioCodigo(e.target.value);
                limpiarResultado();
              }}
              disabled={tipoAnalisis === "correlacion"}
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
            <label>Periodo</label>
            <select value={PERIODO} disabled>
              <option value="2018">2018</option>
            </select>
          </div>

          <div className="campo-indicadores">
            <label>Tipo de análisis</label>
            <select
              value={tipoAnalisis}
              onChange={(e) => {
                setTipoAnalisis(e.target.value);
                setMunicipioCodigo("");
                limpiarResultado();
              }}
            >
              <option value="estadisticas">
                Estadísticas descriptivas
              </option>
              <option value="correlacion">
                Correlación entre indicadores
              </option>
            </select>
          </div>

          {tipoAnalisis === "correlacion" && (
            <div className="campo-indicadores">
              <label>Segundo indicador</label>
              <select
                value={indicadorIdB}
                onChange={(e) => {
                  setIndicadorIdB(e.target.value);
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
          )}
        </div>

        <div className="acciones-filtros-indicadores">
          <button
            type="button"
            className="boton-consultar-indicadores"
            onClick={ejecutar}
            disabled={estado === "cargando"}
          >
            {estado === "cargando"
              ? "Calculando..."
              : "Ejecutar análisis"}
          </button>
        </div>
      </section>

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

      {estado === "resultados" && resultado && (
        <>
          {resultado.tipo === "estadisticas" && estadisticas && (
            <div className="tarjetas-grid" style={{ marginBottom: 20 }}>
              {[
                ["Promedio", estadisticas.promedio],
                ["Mediana", estadisticas.mediana],
                ["Mínimo", estadisticas.minimo],
                ["Máximo", estadisticas.maximo],
                [
                  "Desviación estándar",
                  estadisticas.desviacionEstandar,
                ],
              ].map(([titulo, valor]) => (
                <div className="tarjeta-indicador" key={titulo}>
                  <p className="tarjeta-indicador__dimension">
                    {titulo}
                  </p>
                  <p className="tarjeta-indicador__valor">
                    {formato(valor)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {resultado.tipo === "correlacion" && (
            <div className="tarjetas-grid" style={{ marginBottom: 20 }}>
              <div className="tarjeta-indicador">
                <p className="tarjeta-indicador__dimension">
                  Coeficiente de correlación de Pearson
                </p>
                <p className="tarjeta-indicador__valor">
                  {formato(resultado.correlacion)}
                </p>
              </div>
              <div className="tarjeta-indicador">
                <p className="tarjeta-indicador__dimension">
                  Municipios con ambos indicadores
                </p>
                <p className="tarjeta-indicador__valor">
                  {resultado.cantidadRegistros}
                </p>
              </div>
            </div>
          )}

          <p className="mensaje-resultado">
            {resultado.cantidadRegistros} observación(es)
            analizada(s) — Periodo {PERIODO}.
          </p>

          {resultado.tipo === "estadisticas" &&
            resultado.cantidadRegistros === 1 && (
              <p className="mensaje-resultado">
                La desviación estándar muestral requiere
                al menos dos observaciones.
              </p>
            )}

          {resultado.tipo === "correlacion" &&
            resultado.correlacion === null && (
              <p className="mensaje-resultado">
                No es posible calcular una correlación válida:
                se necesitan al menos tres municipios con
                ambos indicadores y variación en sus valores.
              </p>
            )}

          <p className="mensaje-resultado">
            Fuente: DANE — Censo Nacional de Población
            y Vivienda 2018. Los resultados son cálculos
            descriptivos de DATAVIDA sobre los registros
            municipales disponibles; no constituyen
            estimaciones oficiales adicionales del DANE.
          </p>
        </>
      )}
    </div>
  );
}
