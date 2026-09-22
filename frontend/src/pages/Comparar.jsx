import { useEffect, useState } from "react";
import { obtenerMunicipios, obtenerCatalogoIndicadores, obtenerPeriodos } from "../services/indicadoresService";
import { compararTerritorios } from "../services/analiticaService";
import "../styles/Indicadores.css";

export default function Comparar() {
  const [municipios, setMunicipios] = useState([]);
  const [indicadores, setIndicadores] = useState([]);
  const [periodos, setPeriodos] = useState([]);

  const [seleccionados, setSeleccionados] = useState([]);
  const [indicadorId, setIndicadorId] = useState("");
  const [periodo, setPeriodo] = useState("");

  const [estado, setEstado] = useState("vacio"); // vacio | cargando | error | resultados
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    obtenerMunicipios().then(setMunicipios).catch(() => {});
    obtenerCatalogoIndicadores().then(setIndicadores).catch(() => {});
    obtenerPeriodos().then(setPeriodos).catch(() => {});
  }, []);

  function alternarSeleccion(codigo) {
    setSeleccionados((prev) =>
      prev.includes(codigo) ? prev.filter((c) => c !== codigo) : [...prev, codigo]
    );
  }

  async function comparar() {
    setEstado("cargando");
    setError("");
    try {
      const data = await compararTerritorios({ municipios: seleccionados, indicadorId, periodo });
      setResultado(data);
      setEstado("resultados");
    } catch (err) {
      setError(err.response?.data?.mensaje || "No fue posible completar la comparación.");
      setEstado("error");
    }
  }

  return (
    <div className="pagina-indicadores">
      <header className="encabezado-indicadores">
        <span className="etiqueta-pagina-indicadores">ANÁLISIS TERRITORIAL</span>
        <h1>Comparar municipios o regiones</h1>
        <p>Selecciona dos o más municipios y un indicador para comparar sus valores (RF-11).</p>
      </header>

      <section className="panel-filtros-indicadores">
        <div className="titulo-panel-indicadores">
          <div>
            <h2>Municipios a comparar</h2>
            <p>Marca al menos dos.</p>
          </div>
        </div>

        <div className="lista-checks-municipios">
          {municipios.map((m) => (
            <label key={m.codigo} className="check-municipio">
              <input
                type="checkbox"
                checked={seleccionados.includes(m.codigo)}
                onChange={() => alternarSeleccion(m.codigo)}
              />
              {m.nombre}, {m.departamento}
            </label>
          ))}
        </div>

        <div className="grid-filtros-indicadores" style={{ marginTop: 18 }}>
          <div className="campo-indicadores">
            <label>Indicador</label>
            <select value={indicadorId} onChange={(e) => setIndicadorId(e.target.value)}>
              <option value="">Selecciona un indicador</option>
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
        </div>

        <div className="acciones-filtros-indicadores">
          <button type="button" className="boton-consultar-indicadores" onClick={comparar}>
            Comparar
          </button>
        </div>
      </section>

      {estado === "cargando" && (
        <section className="estado-indicadores estado-cargando-indicadores">
          <div className="spinner-indicadores"></div>
          <h2>Comparando territorios…</h2>
        </section>
      )}

      {estado === "error" && (
        <section className="estado-indicadores estado-sin-resultados">
          <h2>No fue posible completar la comparación</h2>
          <p>{error}</p>
        </section>
      )}

      {estado === "resultados" && resultado && (
        <section className="tabla-usuarios-contenedor">
          <table className="tabla-usuarios">
            <thead>
              <tr>
                <th>Municipio</th>
                <th>Departamento</th>
                <th>Valor</th>
                <th>Periodo</th>
                <th>Fuente</th>
              </tr>
            </thead>
            <tbody>
              {resultado.territorios.map((t, idx) => (
                <tr key={idx}>
                  <td>{t.municipio.nombre}</td>
                  <td>{t.municipio.departamento}</td>
                  <td>{t.sinDatos ? "Sin datos" : `${t.valor}${resultado.indicador.unidad}`}</td>
                  <td>{t.sinDatos ? "—" : t.periodo}</td>
                  <td>{t.sinDatos ? "—" : t.fuente}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mensaje-resultado" style={{ padding: "14px 18px 0" }}>
            Diferencia máxima: <strong>{resultado.diferenciaMaxima}{resultado.indicador.unidad}</strong> entre{" "}
            {resultado.territorioMayor?.nombre} y {resultado.territorioMenor?.nombre}.
          </p>
        </section>
      )}
    </div>
  );
}
