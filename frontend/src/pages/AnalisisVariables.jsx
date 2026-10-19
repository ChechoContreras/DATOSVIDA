import { useEffect, useMemo, useRef, useState } from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Scatter } from "react-chartjs-2";
import { obtenerCorrelaciones } from "../services/iaServiceCliente";
import { obtenerCatalogoIndicadores } from "../services/indicadoresService";
import "../styles/Indicadores.css";
import "../styles/AnalisisVariables.css";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

const COLOR_POSITIVA = "#2f5d52";
const COLOR_NEGATIVA = "#b5793a";

/** Frase en lenguaje sencillo que explica qué significa la correlación. */
function interpretar(a, b, r) {
  if (r === null) return "No hay datos suficientes para comparar estas dos variables.";
  const abs = Math.abs(r);
  if (abs < 0.2) {
    return `No se observa una relación clara entre «${a}» y «${b}».`;
  }
  const intensidad = abs >= 0.7 ? "claramente" : abs >= 0.4 ? "con frecuencia" : "algo";
  return r > 0
    ? `Los municipios con más «${a}» ${intensidad} tienen también más «${b}».`
    : `Los municipios con más «${a}» ${intensidad} tienen menos «${b}».`;
}

/** Recta de mínimos cuadrados para dibujar la tendencia en la dispersión. */
function rectaAjuste(puntos) {
  const n = puntos.length;
  if (n < 2) return [];
  const mx = puntos.reduce((s, p) => s + p.x, 0) / n;
  const my = puntos.reduce((s, p) => s + p.y, 0) / n;
  let sxy = 0;
  let sxx = 0;
  puntos.forEach((p) => {
    sxy += (p.x - mx) * (p.y - my);
    sxx += (p.x - mx) ** 2;
  });
  if (sxx === 0) return [];
  const m = sxy / sxx;
  const b = my - m * mx;
  const xs = puntos.map((p) => p.x);
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  return [
    { x: x0, y: m * x0 + b },
    { x: x1, y: m * x1 + b },
  ];
}

export default function AnalisisVariables() {
  const [catalogo, setCatalogo] = useState([]);
  const [estado, setEstado] = useState("vacio"); // vacio | cargando | resultados | error
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState(null);

  const [seleccionadoId, setSeleccionadoId] = useState("");
  const [otroId, setOtroId] = useState(null);

  const [detalle, setDetalle] = useState(null);
  const [estadoDetalle, setEstadoDetalle] = useState("vacio");
  const ultimaPeticion = useRef(0);

  // Solo se carga la lista de indicadores; los cálculos se hacen al elegir uno.
  useEffect(() => {
    obtenerCatalogoIndicadores().then(setCatalogo).catch(() => {});
  }, []);

  async function consultar() {
    setEstado("cargando");
    setError("");
    try {
      const data = await obtenerCorrelaciones();
      setResultado(data);
      setEstado("resultados");
    } catch (err) {
      setError(err.response?.data?.mensaje || "No fue posible calcular las relaciones entre variables.");
      setEstado("error");
    }
  }

  const indicadores = useMemo(
    () => [...catalogo].sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
    [catalogo]
  );

  const seleccionado = indicadores.find((i) => String(i.id) === String(seleccionadoId)) || null;

  function elegirIndicador(id) {
    setSeleccionadoId(id);
    setOtroId(null);
    // Los cálculos se piden una sola vez, la primera vez que se elige un indicador.
    if (id && !resultado && estado !== "cargando") consultar();
  }

  const mismo = (a, b) => a !== undefined && b !== undefined && String(a) === String(b);

  // Ranking: todas las demás variables, ordenadas por qué tan fuerte es la relación.
  const ranking = useMemo(() => {
    if (!resultado || !seleccionado) return [];
    return resultado.correlaciones
      .filter(
        (c) =>
          c.r !== null &&
          (mismo(c.indicadorA?.id, seleccionado.id) || mismo(c.indicadorB?.id, seleccionado.id))
      )
      .map((c) => ({
        otro: mismo(c.indicadorA?.id, seleccionado.id) ? c.indicadorB : c.indicadorA,
        r: c.r,
        fuerza: c.fuerza,
        n: c.n,
      }))
      .filter((f) => f.otro)
      .sort((x, y) => Math.abs(y.r) - Math.abs(x.r));
  }, [resultado, seleccionado]);

  const sinDatos = useMemo(() => {
    if (!resultado || !seleccionado) return 0;
    return resultado.correlaciones.filter(
      (c) =>
        c.r === null &&
        (mismo(c.indicadorA?.id, seleccionado.id) || mismo(c.indicadorB?.id, seleccionado.id))
    ).length;
  }, [resultado, seleccionado]);

  // Al cambiar de indicador, se elige automáticamente la relación más fuerte.
  useEffect(() => {
    setOtroId(ranking.length ? ranking[0].otro.id : null);
  }, [seleccionadoId, resultado]); // eslint-disable-line react-hooks/exhaustive-deps

  // Detalle del par elegido (incluye los puntos por municipio).
  useEffect(() => {
    if (!seleccionado || otroId === null) {
      setDetalle(null);
      setEstadoDetalle("vacio");
      return;
    }
    const idPeticion = ++ultimaPeticion.current;
    setEstadoDetalle("cargando");
    obtenerCorrelaciones({ indicadorIdA: seleccionado.id, indicadorIdB: otroId })
      .then((data) => {
        if (idPeticion !== ultimaPeticion.current) return;
        setDetalle(data.correlaciones?.[0] || null);
        setEstadoDetalle("listo");
      })
      .catch(() => {
        if (idPeticion !== ultimaPeticion.current) return;
        setDetalle(null);
        setEstadoDetalle("error");
      });
  }, [seleccionado, otroId]);

  const puntos = detalle?.puntos || [];
  const datosGrafico = {
    datasets: [
      {
        label: "Municipios",
        data: puntos,
        backgroundColor: "rgba(47, 93, 82, 0.55)",
        borderColor: "#1c3a34",
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Tendencia",
        data: rectaAjuste(puntos),
        type: "line",
        showLine: true,
        borderColor: COLOR_NEGATIVA,
        borderWidth: 2,
        borderDash: [6, 4],
        pointRadius: 0,
        pointHoverRadius: 0,
      },
    ],
  };

  const unidad = (ind) => (ind?.unidad ? ` (${ind.unidad})` : "");

  return (
    <div className="pagina-indicadores pagina-variables">
      <header className="encabezado-indicadores">
        <span className="etiqueta-pagina-indicadores">INTELIGENCIA ARTIFICIAL</span>
        <h1>Análisis de variables</h1>
        <p>
          Elige un indicador y descubre con cuáles otros se mueve junto en los
          municipios PDET (RF-13, apoyo al modelo predictivo).
        </p>
      </header>

      <section className="variables-guia" aria-label="Cómo usar este módulo">
        <div className="variables-paso">
          <span>1</span>
          <p><strong>Elige un indicador</strong><br />el que quieres entender mejor.</p>
        </div>
        <div className="variables-paso">
          <span>2</span>
          <p><strong>Mira el ranking</strong><br />las barras más largas son las variables más relacionadas.</p>
        </div>
        <div className="variables-paso">
          <span>3</span>
          <p><strong>Haz clic en una barra</strong><br />para ver el detalle, municipio por municipio.</p>
        </div>
      </section>

      <section className="variables-selector">
        <div className="campo-indicadores">
          <label htmlFor="indicador-base">Indicador que quiero analizar</label>
          <select
            id="indicador-base"
            value={seleccionadoId}
            onChange={(e) => elegirIndicador(e.target.value)}
          >
            <option value="">Selecciona un indicador…</option>
            {indicadores.map((i) => (
              <option key={i.id} value={i.id}>{i.nombre}</option>
            ))}
          </select>
        </div>
        {resultado && (
          <p className="variables-muestra">
            Calculado con <strong>{resultado.municipiosAnalizados}</strong> municipios PDET
            (corte 2018 del DANE).
          </p>
        )}
      </section>

      {!seleccionado && (
        <section className="variables-panel variables-inicio">
          <h2>Selecciona un indicador para empezar</h2>
          <p>
            Después de elegirlo verás con qué otras variables se relaciona y
            qué tan fuerte es esa relación.
          </p>
        </section>
      )}

      {seleccionado && estado === "cargando" && (
        <section className="estado-indicadores estado-cargando-indicadores">
          <div className="spinner-indicadores"></div>
          <h2>Calculando relaciones con «{seleccionado.nombre}»…</h2>
        </section>
      )}

      {seleccionado && estado === "error" && (
        <section className="estado-indicadores estado-sin-resultados">
          <h2>No fue posible calcular las relaciones</h2>
          <p>{error}</p>
          <button type="button" className="boton-consultar-indicadores" onClick={consultar}>
            Reintentar
          </button>
        </section>
      )}

      {seleccionado && estado === "resultados" && resultado && (
        <>
          <section className="variables-panel">
            <div className="variables-panel__cabecera">
              <h2>
                ¿Con qué se relaciona «{seleccionado?.nombre}»?
              </h2>
              <div className="variables-leyenda">
                <span><i style={{ background: COLOR_POSITIVA }} /> Suben juntas</span>
                <span><i style={{ background: COLOR_NEGATIVA }} /> Una sube, la otra baja</span>
              </div>
            </div>

            {ranking.length === 0 ? (
              <p className="variables-vacio">
                No hay suficientes datos para comparar este indicador con otros.
              </p>
            ) : (
              <ul className="variables-ranking">
                {ranking.map((f) => {
                  const activo = f.otro.id === otroId;
                  const color = f.r >= 0 ? COLOR_POSITIVA : COLOR_NEGATIVA;
                  return (
                    <li key={f.otro.id}>
                      <button
                        type="button"
                        className={`variables-fila${activo ? " variables-fila--activa" : ""}`}
                        onClick={() => setOtroId(f.otro.id)}
                        aria-pressed={activo}
                      >
                        <span className="variables-fila__nombre">
                          {f.otro.nombre}
                          <small>{f.otro.dimension}</small>
                        </span>
                        <span className="variables-fila__pista">
                          <span
                            className="variables-fila__barra"
                            style={{ width: `${Math.max(3, Math.abs(f.r) * 100)}%`, background: color }}
                          />
                        </span>
                        <span className="variables-fila__valor">
                          {f.r > 0 ? "+" : ""}{f.r.toFixed(2)}
                          <small>{f.fuerza}</small>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {sinDatos > 0 && (
              <p className="variables-nota">
                {sinDatos} indicador{sinDatos > 1 ? "es" : ""} no se muestra{sinDatos > 1 ? "n" : ""} por no
                tener datos suficientes para compararse.
              </p>
            )}
          </section>

          {seleccionado && otroId !== null && (
            <section className="variables-panel variables-detalle">
              {estadoDetalle === "cargando" && <p className="variables-vacio">Cargando detalle…</p>}
              {estadoDetalle === "error" && (
                <p className="mensaje-error-usuarios">No fue posible cargar el detalle de esta comparación.</p>
              )}
              {estadoDetalle === "listo" && detalle && (
                <>
                  <p className="etiqueta-pagina-indicadores">DETALLE DE LA RELACIÓN</p>
                  <h2>
                    {detalle.indicadorA?.nombre} <span>vs</span> {detalle.indicadorB?.nombre}
                  </h2>
                  <p className="variables-frase">
                    {interpretar(detalle.indicadorA?.nombre, detalle.indicadorB?.nombre, detalle.r)}
                  </p>

                  <div className="variables-cifras">
                    <div>
                      <span>Relación (r)</span>
                      <strong>{detalle.r === null ? "—" : (detalle.r > 0 ? "+" : "") + detalle.r.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span>Fuerza</span>
                      <strong>{detalle.fuerza}</strong>
                    </div>
                    <div>
                      <span>Municipios comparados</span>
                      <strong>{detalle.n}</strong>
                    </div>
                  </div>

                  {puntos.length > 0 && (
                    <div className="variables-grafico">
                      <Scatter
                        data={datosGrafico}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          animation: false,
                          plugins: {
                            legend: { position: "bottom" },
                            tooltip: {
                              filter: (item) => item.datasetIndex === 0,
                              callbacks: {
                                label: (ctx) => {
                                  const p = ctx.raw;
                                  return [
                                    p.nombre,
                                    `${detalle.indicadorA?.nombre}: ${p.x}`,
                                    `${detalle.indicadorB?.nombre}: ${p.y}`,
                                  ];
                                },
                              },
                            },
                          },
                          scales: {
                            x: { title: { display: true, text: `${detalle.indicadorA?.nombre}${unidad(detalle.indicadorA)}` } },
                            y: { title: { display: true, text: `${detalle.indicadorB?.nombre}${unidad(detalle.indicadorB)}` } },
                          },
                        }}
                      />
                    </div>
                  )}

                  <p className="variables-aviso">
                    {detalle.advertencia} Cada punto es un municipio.
                  </p>
                </>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
