import { useEffect, useState } from "react";
import { obtenerMunicipios, obtenerCatalogoIndicadores, obtenerPeriodos } from "../services/indicadoresService";
import { generarYDescargarReporte, obtenerHistorialReportes } from "../services/reportesServiceCliente";
import "../styles/Indicadores.css";
import "../styles/GestionUsuarios.css";

export default function Reportes() {
  const [municipios, setMunicipios] = useState([]);
  const [indicadores, setIndicadores] = useState([]);
  const [periodos, setPeriodos] = useState([]);

  const [titulo, setTitulo] = useState("Reporte DATAVIDA");
  const [municipioCodigo, setMunicipioCodigo] = useState("");
  const [indicadorId, setIndicadorId] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [formato, setFormato] = useState("pdf");

  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState("");
  const [historial, setHistorial] = useState([]);

  function cargarHistorial() {
    obtenerHistorialReportes().then(setHistorial).catch(() => {});
  }

  useEffect(() => {
    obtenerMunicipios().then(setMunicipios).catch(() => {});
    obtenerCatalogoIndicadores().then(setIndicadores).catch(() => {});
    obtenerPeriodos().then(setPeriodos).catch(() => {});
    cargarHistorial();
  }, []);

  async function generar() {
    setGenerando(true);
    setError("");
    try {
      await generarYDescargarReporte({
        titulo,
        filtros: { municipioCodigo, indicadorId, periodo },
        formato,
      });
      cargarHistorial();
    } catch (err) {
      setError(err.response?.data?.mensaje || "No fue posible generar el reporte.");
    } finally {
      setGenerando(false);
    }
  }

  return (
    <div className="pagina-indicadores">
      <header className="encabezado-indicadores">
        <span className="etiqueta-pagina-indicadores">REPORTES</span>
        <h1>Generar y exportar reportes</h1>
        <p>Genera un archivo PDF o Excel con los indicadores según los filtros que elijas (RF-15).</p>
      </header>

      <section className="panel-filtros-indicadores">
        <div className="campo-indicadores" style={{ marginBottom: 16 }}>
          <label>Título del reporte</label>
          <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} autoComplete="off" />
        </div>

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
            <label>Formato</label>
            <select value={formato} onChange={(e) => setFormato(e.target.value)}>
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
            </select>
          </div>
        </div>

        {error && <p className="mensaje-error-usuarios" style={{ marginTop: 14 }}>{error}</p>}

        <div className="acciones-filtros-indicadores">
          <button type="button" className="boton-consultar-indicadores" onClick={generar} disabled={generando}>
            {generando ? "Generando…" : "Generar y descargar"}
          </button>
        </div>
      </section>

      <div className="tabla-usuarios-contenedor">
        <table className="tabla-usuarios">
          <thead>
            <tr>
              <th>Título</th>
              <th>Formato</th>
              <th>Registros</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((r) => (
              <tr key={r.id}>
                <td>{r.titulo}</td>
                <td>{r.formato.toUpperCase()}</td>
                <td>{r.cantidadRegistros}</td>
                <td>{new Date(r.fecha).toLocaleString("es-CO")}</td>
              </tr>
            ))}
            {historial.length === 0 && (
              <tr>
                <td colSpan={4} className="fila-vacia-usuarios">Todavía no se han generado reportes.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
