import { useEffect, useState } from "react";
import { obtenerMunicipios, obtenerCatalogoIndicadores, obtenerPeriodos } from "../services/indicadoresService";
import { ejecutarAnalisisEstadistico } from "../services/analiticaService";
import "../styles/Indicadores.css";

export default function AnalisisEstadistico() {
  const [municipios, setMunicipios] = useState([]);
  const [indicadores, setIndicadores] = useState([]);
  const [periodos, setPeriodos] = useState([]);

  const [municipioCodigo, setMunicipioCodigo] = useState("");
  const [indicadorId, setIndicadorId] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [tipoAnalisis, setTipoAnalisis] = useState("estadisticas");
  const [indicadorIdB, setIndicadorIdB] = useState("");

  const [estado, setEstado] = useState("vacio");
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    obtenerMunicipios().then(setMunicipios).catch(() => {});
    obtenerCatalogoIndicadores().then(setIndicadores).catch(() => {});
    obtenerPeriodos().then(setPeriodos).catch(() => {});
  }, []);

  async function ejecutar() {
    setEstado("cargando");
    setError("");
    try {
      const data = await ejecutarAnalisisEstadistico({
        municipioCodigo,
        indicadorId,
        periodo,
        tipoAnalisis,
        indicadorIdB: tipoAnalisis === "correlacion" ? indicadorIdB : undefined,
      });
      setResultado(data);
      setEstado("resultados");
    } catch (err) {
      setError(err.response?.data?.mensaje || "No fue posible ejecutar el análisis.");
      setEstado("error");
    }
  }

  return (
    <div className="pagina-indicadores">
      <header className="encabezado-indicadores">
        <span className="etiqueta-pagina-indicadores">ANÁLISIS ESTADÍSTICO</span>
        <h1>Análisis estadístico</h1>
        <p>Calcula estadísticas descriptivas o correlaciones entre indicadores (RF-12).</p>
      </header>

      <section className="panel-filtros-indicadores">
        <div className="grid-filtros-indicadores">
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
          <div className="campo-indicadores">
            <label>Periodo</label>
            <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
              <option value="">Todos</option>
              {periodos.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="campo-indicadores">
            <label>Tipo de análisis</label>
            <select value={tipoAnalisis} onChange={(e) => setTipoAnalisis(e.target.value)}>
              <option value="estadisticas">Estadísticas descriptivas</option>
              <option value="correlacion">Correlación entre indicadores</option>
            </select>
          </div>
          {tipoAnalisis === "correlacion" && (
            <div className="campo-indicadores">
              <label>Indicador B (a correlacionar)</label>
              <select value={indicadorIdB} onChange={(e) => setIndicadorIdB(e.target.value)}>
                <option value="">Selecciona…</option>
                {indicadores.map((i) => (
                  <option key={i.id} value={i.id}>{i.nombre}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="acciones-filtros-indicadores">
          <button type="button" className="boton-consultar-indicadores" onClick={ejecutar}>
            Ejecutar análisis
          </button>
        </div>
      </section>

      {estado === "cargando" && (
        <section className="estado-indicadores estado-cargando-indicadores">
          <div className="spinner-indicadores"></div>
          <h2>Calculando…</h2>
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
          <div className="tarjetas-grid" style={{ marginBottom: 20 }}>
            <div className="tarjeta-indicador">
              <p className="tarjeta-indicador__dimension">Promedio</p>
              <p className="tarjeta-indicador__valor">{resultado.estadisticas.promedio}</p>
            </div>
            <div className="tarjeta-indicador">
              <p className="tarjeta-indicador__dimension">Mínimo</p>
              <p className="tarjeta-indicador__valor">{resultado.estadisticas.minimo}</p>
            </div>
            <div className="tarjeta-indicador">
              <p className="tarjeta-indicador__dimension">Máximo</p>
              <p className="tarjeta-indicador__valor">{resultado.estadisticas.maximo}</p>
            </div>
            <div className="tarjeta-indicador">
              <p className="tarjeta-indicador__dimension">Desviación estándar</p>
              <p className="tarjeta-indicador__valor">{resultado.estadisticas.desviacionEstandar}</p>
            </div>
            {resultado.correlacion !== null && resultado.correlacion !== undefined && (
              <div className="tarjeta-indicador">
                <p className="tarjeta-indicador__dimension">Coeficiente de correlación</p>
                <p className="tarjeta-indicador__valor">{resultado.correlacion}</p>
              </div>
            )}
          </div>

          <p className="mensaje-resultado">
            {resultado.cantidadRegistros} registro(s) analizados — {new Date(resultado.fechaEjecucion).toLocaleString("es-CO")}
          </p>
        </>
      )}
    </div>
  );
}
