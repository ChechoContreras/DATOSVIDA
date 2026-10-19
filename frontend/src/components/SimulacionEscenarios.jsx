import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { simularEscenario } from "../services/iaServiceCliente";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const AJUSTES_RAPIDOS = [-2, -1, -0.5, 0.5, 1];

/**
 * Simulación de escenarios: compara la tendencia actual del indicador
 * (regresión lineal) con un escenario hipotético que suma un cambio anual
 * adicional elegido por la persona usuaria.
 */
export default function SimulacionEscenarios({ municipioCodigo, indicadorId, horizonte, unidad }) {
  const [ajuste, setAjuste] = useState(-1);
  const [estado, setEstado] = useState("vacio");
  const [error, setError] = useState("");
  const [sim, setSim] = useState(null);

  async function simular() {
    setEstado("cargando");
    setError("");
    try {
      const data = await simularEscenario({
        municipioCodigo,
        indicadorId,
        horizonte,
        ajusteAnual: Number(ajuste),
      });
      setSim(data);
      setEstado("resultados");
    } catch (err) {
      setError(err.response?.data?.mensaje || "No fue posible simular el escenario.");
      setEstado("error");
    }
  }

  const suf = unidad === "%" ? " pp" : ` ${unidad || ""}`;
  const signo = (n) => (n > 0 ? `+${n}` : `${n}`);

  let grafico = null;
  if (sim) {
    const anios = [
      ...sim.serieHistorica.map((p) => p.anio),
      ...sim.tendencia.slice(1).map((p) => p.anio),
    ];
    const pos = (anio) => anios.indexOf(anio);
    const serie = (puntos) => {
      const arr = anios.map(() => null);
      puntos.forEach((p) => { arr[pos(p.anio)] = p.valor; });
      return arr;
    };
    grafico = {
      labels: anios,
      datasets: [
        { label: "Histórico", data: serie(sim.serieHistorica.map((p) => ({ anio: p.anio, valor: p.valor }))), borderColor: "#2f5d34", backgroundColor: "#2f5d34", tension: 0.2 },
        { label: "Tendencia actual", data: serie(sim.tendencia), borderColor: "#8a8578", backgroundColor: "#8a8578", borderDash: [6, 4], tension: 0.2 },
        { label: `Escenario (${signo(sim.ajusteAnual)}${suf} por año)`, data: serie(sim.escenario), borderColor: "#c9892f", backgroundColor: "#c9892f", tension: 0.2 },
      ],
    };
  }

  return (
    <section className="tabla-usuarios-contenedor" style={{ padding: 24, marginTop: 20 }}>
      <p className="etiqueta-pagina-indicadores">SIMULACIÓN DE ESCENARIOS</p>
      <h2 style={{ margin: "6px 0 4px" }}>¿Qué pasaría si el indicador cambiara cada año más que su tendencia?</h2>
      <p style={{ fontSize: 13, color: "#8a8578", marginBottom: 14 }}>
        Se compara la tendencia actual con un escenario hipotético, a {horizonte} año{horizonte > 1 ? "s" : ""}.
      </p>

      <div className="grid-filtros-indicadores" style={{ gridTemplateColumns: "1fr 2fr", alignItems: "end" }}>
        <div className="campo-indicadores">
          <label>Cambio adicional por año ({unidad === "%" ? "puntos porcentuales" : unidad})</label>
          <input
            type="number"
            step="0.1"
            min="-20"
            max="20"
            value={ajuste}
            onChange={(e) => setAjuste(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {AJUSTES_RAPIDOS.map((a) => (
            <button
              key={a}
              type="button"
              className="boton-consultar-indicadores"
              style={{ opacity: Number(ajuste) === a ? 1 : 0.65 }}
              onClick={() => setAjuste(a)}
            >
              {signo(a)}{suf}
            </button>
          ))}
        </div>
      </div>

      <div className="acciones-filtros-indicadores">
        <button type="button" className="boton-consultar-indicadores" onClick={simular} disabled={estado === "cargando"}>
          {estado === "cargando" ? "Simulando…" : "Simular escenario"}
        </button>
      </div>

      {estado === "error" && <p className="mensaje-error-usuarios">{error}</p>}

      {estado === "resultados" && sim && (
        <>
          <div className="tarjetas-grid" style={{ margin: "14px 0" }}>
            <div className="tarjeta-indicador">
              <p className="tarjeta-indicador__dimension">Tendencia actual en {sim.anioObjetivo}</p>
              <p className="tarjeta-indicador__valor">{sim.valorFinalTendencia}<span>{sim.indicador.unidad}</span></p>
            </div>
            <div className="tarjeta-indicador">
              <p className="tarjeta-indicador__dimension">Escenario en {sim.anioObjetivo}</p>
              <p className="tarjeta-indicador__valor">{sim.valorFinalEscenario}<span>{sim.indicador.unidad}</span></p>
            </div>
            <div className="tarjeta-indicador">
              <p className="tarjeta-indicador__dimension">Diferencia</p>
              <p className="tarjeta-indicador__valor">{signo(sim.diferencia)}<span>{suf}</span></p>
            </div>
          </div>

          <div style={{ maxWidth: 760 }}>
            <Line
              data={grafico}
              options={{
                responsive: true,
                plugins: { legend: { position: "bottom" } },
                spanGaps: false,
              }}
            />
          </div>

          <table className="tabla-usuarios" style={{ marginTop: 16 }}>
            <thead>
              <tr><th>Año</th><th>Tendencia actual</th><th>Escenario</th><th>Diferencia</th></tr>
            </thead>
            <tbody>
              {sim.tendencia.map((t, i) => (
                <tr key={t.anio}>
                  <td>{t.anio}</td>
                  <td>{t.valor}</td>
                  <td>{sim.escenario[i].valor}</td>
                  <td>{signo(Math.round((sim.escenario[i].valor - t.valor) * 10) / 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p style={{ fontSize: 12, color: "#8a8578", marginTop: 10 }}>{sim.nota}</p>
        </>
      )}
    </section>
  );
}
