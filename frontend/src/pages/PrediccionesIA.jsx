import { useEffect, useState } from "react";
import { obtenerMunicipios, obtenerCatalogoIndicadores } from "../services/indicadoresService";
import { generarPrediccion } from "../services/iaServiceCliente";
import "../styles/Indicadores.css";

export default function PrediccionesIA() {
  const [municipios, setMunicipios] = useState([]);
  const [indicadores, setIndicadores] = useState([]);

  const [municipioCodigo, setMunicipioCodigo] = useState("");
  const [indicadorId, setIndicadorId] = useState("");
  const [horizonte, setHorizonte] = useState(1);

  const [estado, setEstado] = useState("vacio");
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    obtenerMunicipios().then(setMunicipios).catch(() => {});
    obtenerCatalogoIndicadores().then(setIndicadores).catch(() => {});
  }, []);

  async function predecir() {
    setEstado("cargando");
    setError("");
    try {
      const data = await generarPrediccion({ municipioCodigo, indicadorId, horizonte });
      setResultado(data);
      setEstado("resultados");
    } catch (err) {
      setError(err.response?.data?.mensaje || "No fue posible generar la predicción.");
      setEstado("error");
    }
  }

  return (
    <div className="pagina-indicadores">
      <header className="encabezado-indicadores">
        <span className="etiqueta-pagina-indicadores">INTELIGENCIA ARTIFICIAL</span>
        <h1>Predicciones IA</h1>
        <p>Genera una predicción para un municipio e indicador, con su nivel de confianza (RF-13).</p>
      </header>

      <section className="panel-filtros-indicadores">
        <div className="grid-filtros-indicadores" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <div className="campo-indicadores">
            <label>Municipio</label>
            <select value={municipioCodigo} onChange={(e) => setMunicipioCodigo(e.target.value)}>
              <option value="">Selecciona…</option>
              {municipios.map((m) => (
                <option key={m.codigo} value={m.codigo}>{m.nombre}</option>
              ))}
            </select>
          </div>
          <div className="campo-indicadores">
            <label>Indicador</label>
            <select value={indicadorId} onChange={(e) => setIndicadorId(e.target.value)}>
              <option value="">Selecciona…</option>
              {indicadores.map((i) => (
                <option key={i.id} value={i.id}>{i.nombre}</option>
              ))}
            </select>
          </div>
          <div className="campo-indicadores">
            <label>Horizonte (años)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={horizonte}
              onChange={(e) => setHorizonte(e.target.value)}
            />
          </div>
        </div>

        <div className="acciones-filtros-indicadores">
          <button type="button" className="boton-consultar-indicadores" onClick={predecir}>
            Generar predicción
          </button>
        </div>
      </section>

      {estado === "cargando" && (
        <section className="estado-indicadores estado-cargando-indicadores">
          <div className="spinner-indicadores"></div>
          <h2>Ejecutando modelo…</h2>
        </section>
      )}

      {estado === "error" && (
        <section className="estado-indicadores estado-sin-resultados">
          <h2>No fue posible generar la predicción</h2>
          <p>{error}</p>
        </section>
      )}

      {estado === "resultados" && resultado && (
        <section className="tabla-usuarios-contenedor" style={{ padding: 24 }}>
          <p className="etiqueta-pagina-indicadores">
            {resultado.municipio.nombre}, {resultado.municipio.departamento} — {resultado.indicador.nombre}
          </p>

          <div className="tarjetas-grid" style={{ margin: "14px 0" }}>
            <div className="tarjeta-indicador">
              <p className="tarjeta-indicador__dimension">Valor actual</p>
              <p className="tarjeta-indicador__valor">{resultado.valorActual}<span>{resultado.indicador.unidad}</span></p>
            </div>
            <div className="tarjeta-indicador">
              <p className="tarjeta-indicador__dimension">Valor predicho ({resultado.horizonte} año{resultado.horizonte>1?"s":""})</p>
              <p className="tarjeta-indicador__valor">{resultado.valorPredicho}<span>{resultado.indicador.unidad}</span></p>
            </div>
            <div className="tarjeta-indicador">
              <p className="tarjeta-indicador__dimension">Confianza del modelo</p>
              <p className="tarjeta-indicador__valor">{resultado.confianza}<span>%</span></p>
            </div>
          </div>

          <p className={resultado.apto ? "mensaje-resultado" : "mensaje-error-usuarios"}>
            {resultado.mensajeConfiabilidad}
          </p>

          <p style={{ fontSize: 12, color: "#8a8578", marginTop: 10 }}>
            Modelo: {resultado.versionModelo} · Variables consideradas: {resultado.variablesRelevantes.join(", ")}
          </p>
        </section>
      )}
    </div>
  );
}
