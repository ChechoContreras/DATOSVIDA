import { useEffect, useState } from "react";
import { obtenerMunicipios, obtenerCatalogoIndicadores } from "../services/indicadoresService";
import { obtenerRecomendaciones } from "../services/iaServiceCliente";
import "../styles/Indicadores.css";

export default function Recomendaciones() {
  const [municipios, setMunicipios] = useState([]);
  const [indicadores, setIndicadores] = useState([]);

  const [municipioCodigo, setMunicipioCodigo] = useState("");
  const [indicadorId, setIndicadorId] = useState("");

  const [estado, setEstado] = useState("vacio");
  const [error, setError] = useState("");
  const [resultados, setResultados] = useState([]);

  useEffect(() => {
    obtenerMunicipios().then(setMunicipios).catch(() => {});
    obtenerCatalogoIndicadores().then(setIndicadores).catch(() => {});
  }, []);

  async function consultar() {
    setEstado("cargando");
    setError("");
    try {
      const data = await obtenerRecomendaciones({ municipioCodigo, indicadorId });
      setResultados(data);
      setEstado("resultados");
    } catch (err) {
      setError(err.response?.data?.mensaje || "No fue posible consultar recomendaciones.");
      setEstado("error");
    }
  }

  const colorPrioridad = { alta: "#9c3b3b", media: "#b5793a", baja: "#16803d" };

  return (
    <div className="pagina-indicadores">
      <header className="encabezado-indicadores">
        <span className="etiqueta-pagina-indicadores">RECOMENDACIONES</span>
        <h1>Recomendaciones</h1>
        <p>Consulta recomendaciones priorizadas a partir de los indicadores registrados (RF-14).</p>
      </header>

      <section className="panel-filtros-indicadores">
        <div className="grid-filtros-indicadores" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
          <div className="campo-indicadores">
            <label>Municipio</label>
            <select value={municipioCodigo} onChange={(e) => setMunicipioCodigo(e.target.value)}>
              <option value="">Todos</option>
              {municipios.map((m) => (
                <option key={m.codigo} value={m.codigo}>{m.nombre}</option>
              ))}
            </select>
          </div>
          <div className="campo-indicadores">
            <label>Indicador</label>
            <select value={indicadorId} onChange={(e) => setIndicadorId(e.target.value)}>
              <option value="">Todos</option>
              {indicadores.map((i) => (
                <option key={i.id} value={i.id}>{i.nombre}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="acciones-filtros-indicadores">
          <button type="button" className="boton-consultar-indicadores" onClick={consultar}>
            Consultar
          </button>
        </div>
      </section>

      {estado === "cargando" && (
        <section className="estado-indicadores estado-cargando-indicadores">
          <div className="spinner-indicadores"></div>
          <h2>Generando recomendaciones…</h2>
        </section>
      )}

      {estado === "error" && (
        <section className="estado-indicadores estado-sin-resultados">
          <h2>No fue posible generar recomendaciones</h2>
          <p>{error}</p>
        </section>
      )}

      {estado === "resultados" && (
        <div className="tarjetas-grid">
          {resultados.map((r, idx) => (
            <article className="tarjeta-indicador" key={idx}>
              <p className="tarjeta-indicador__dimension" style={{ color: colorPrioridad[r.prioridad] }}>
                Prioridad {r.prioridad}
              </p>
              <h3>{r.descripcion}</h3>
              <div className="tarjeta-indicador__pie">
                <span>{r.municipio.nombre}, {r.municipio.departamento}</span>
                <span>{r.justificacion}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
