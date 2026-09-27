import { useEffect, useState } from "react";
import { obtenerCatalogoIndicadores } from "../services/indicadoresService";
import { obtenerCorrelaciones } from "../services/iaServiceCliente";
import "../styles/Indicadores.css";

export default function AnalisisVariables() {
  const [indicadores, setIndicadores] = useState([]);
  const [estado, setEstado] = useState("cargando");
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    obtenerCatalogoIndicadores().then(setIndicadores).catch(() => {});
    consultar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function consultar() {
    setEstado("cargando");
    setError("");
    try {
      const data = await obtenerCorrelaciones();
      setResultado(data);
      setEstado("resultados");
    } catch (err) {
      setError(err.response?.data?.mensaje || "No fue posible calcular las correlaciones.");
      setEstado("error");
    }
  }

  return (
    <div className="pagina-indicadores">
      <header className="encabezado-indicadores">
        <span className="etiqueta-pagina-indicadores">INTELIGENCIA ARTIFICIAL</span>
        <h1>Análisis de variables</h1>
        <p>
          Correlación entre indicadores e impacto de variables priorizadas,
          calculado sobre los datos actualmente registrados (RF-13, apoyo al
          modelo predictivo).
        </p>
      </header>

      <section className="panel-filtros-indicadores">
        <div className="acciones-filtros-indicadores">
          <button type="button" className="boton-consultar-indicadores" onClick={consultar}>
            Recalcular
          </button>
        </div>
      </section>

      {estado === "cargando" && (
        <section className="estado-indicadores estado-cargando-indicadores">
          <div className="spinner-indicadores"></div>
          <h2>Calculando correlaciones…</h2>
        </section>
      )}

      {estado === "error" && (
        <section className="estado-indicadores estado-sin-resultados">
          <h2>No fue posible calcular las correlaciones</h2>
          <p>{error}</p>
        </section>
      )}

      {estado === "resultados" && resultado && (
        <>
          <h2 style={{ fontSize: 16, margin: "22px 0 12px", color: "var(--verde-oscuro)" }}>
            Variables priorizadas por impacto
          </h2>
          <div className="tarjetas-grid" style={{ marginBottom: 26 }}>
            {resultado.variablesPriorizadas.map((v) => (
              <div className="tarjeta-indicador" key={v.indicador.id}>
                <p className="tarjeta-indicador__dimension">{v.indicador.dimension}</p>
                <h3 style={{ margin: "4px 0" }}>{v.indicador.nombre}</h3>
                <p className="tarjeta-indicador__valor">
                  {v.impactoPromedio === null ? "—" : v.impactoPromedio}
                  {v.impactoPromedio !== null && <span> impacto prom.</span>}
                </p>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 16, margin: "0 0 12px", color: "var(--verde-oscuro)" }}>
            Matriz de correlación entre indicadores
          </h2>
          <section className="tabla-usuarios-contenedor">
            <table className="tabla-usuarios">
              <thead>
                <tr>
                  <th>Indicador A</th>
                  <th>Indicador B</th>
                  <th>r (Pearson)</th>
                  <th>Fuerza</th>
                  <th>n</th>
                </tr>
              </thead>
              <tbody>
                {resultado.correlaciones.map((c, idx) => (
                  <tr key={idx}>
                    <td>{c.indicadorA.nombre}</td>
                    <td>{c.indicadorB.nombre}</td>
                    <td>{c.r === null ? "—" : c.r}</td>
                    <td>{c.fuerza}</td>
                    <td>{c.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {resultado.correlaciones.some((c) => c.advertencia) && (
            <p className="mensaje-resultado" style={{ marginTop: 12 }}>
              ⚠ Algunos pares tienen muestra pequeña; el resultado es preliminar y
              se recalculará automáticamente a medida que se carguen más
              municipios en la base de datos.
            </p>
          )}
        </>
      )}
    </div>
  );
}