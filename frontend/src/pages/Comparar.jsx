
import { useEffect, useState } from "react";
import {
  obtenerMunicipios,
  obtenerCatalogoIndicadores,
  obtenerIndicadores,
} from "../services/indicadoresService";
import "../styles/Indicadores.css";

export default function Comparar() {
  const [municipios, setMunicipios] = useState([]);
  const [indicadores, setIndicadores] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [indicadorId, setIndicadorId] = useState("");
  const [estado, setEstado] = useState("vacio");
  const [error, setError] = useState("");
  const [resultados, setResultados] = useState([]);

  const periodo = "2018";

  useEffect(() => {
    Promise.all([
      obtenerMunicipios(),
      obtenerCatalogoIndicadores(),
    ])
      .then(([listaMunicipios, listaIndicadores]) => {
        setMunicipios(listaMunicipios);
        setIndicadores(listaIndicadores);
      })
      .catch(() => {
        setError("No fue posible cargar los catálogos.");
        setEstado("error");
      });
  }, []);

  function alternarSeleccion(codigo) {
    setSeleccionados((anteriores) =>
      anteriores.includes(codigo)
        ? anteriores.filter((c) => c !== codigo)
        : [...anteriores, codigo]
    );
  }

  async function comparar() {
    if (seleccionados.length < 2) {
      setError("Selecciona al menos dos municipios.");
      setEstado("error");
      return;
    }

    if (!indicadorId) {
      setError("Selecciona un indicador.");
      setEstado("error");
      return;
    }

    setEstado("cargando");
    setError("");
    setResultados([]);

    try {
      const consultas = await Promise.all(
        seleccionados.map(async (codigo) => {
          const respuesta = await obtenerIndicadores({
            municipioCodigo: codigo,
            indicadorId,
            periodo,
          });

          const registros = Array.isArray(respuesta)
            ? respuesta
            : respuesta?.datos || [];

          const registro = registros.find(
            (r) =>
              String(r.indicador?.id ?? r.indicadorId) ===
              String(indicadorId)
          );

          const municipio = municipios.find(
            (m) => String(m.codigo) === String(codigo)
          );

          return {
            codigo,
            nombre: municipio?.nombre || codigo,
            departamento: municipio?.departamento || "—",
            valor:
              registro?.valor !== undefined &&
              registro?.valor !== null
                ? Number(registro.valor)
                : null,
            fuente: registro?.fuente || "DANE — CNPV 2018",
          };
        })
      );

      setResultados(consultas);
      setEstado("resultados");
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          err.message ||
          "No fue posible completar la comparación."
      );
      setEstado("error");
    }
  }

  const indicadorSeleccionado = indicadores.find(
    (i) => String(i.id) === String(indicadorId)
  );

  const validos = resultados.filter(
    (r) => r.valor !== null && Number.isFinite(r.valor)
  );

  const maximo = validos.length
    ? Math.max(...validos.map((r) => r.valor))
    : 0;

  const minimo = validos.length
    ? Math.min(...validos.map((r) => r.valor))
    : 0;

  const escala = Math.max(maximo, 1);

  return (
    <div className="pagina-indicadores">
      <header className="encabezado-indicadores">
        <span className="etiqueta-pagina-indicadores">
          ANÁLISIS TERRITORIAL
        </span>
        <h1>Comparar municipios PDET</h1>
        <p>
          Compara indicadores oficiales de pobreza
          multidimensional entre municipios PDET.
        </p>
      </header>

      <section className="panel-filtros-indicadores">
        <div className="titulo-panel-indicadores">
          <div>
            <h2>Municipios a comparar</h2>
            <p>
              Selecciona dos o más municipios.
              Seleccionados: {seleccionados.length}
            </p>
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

        <div
          className="grid-filtros-indicadores"
          style={{ marginTop: 18 }}
        >
          <div className="campo-indicadores">
            <label>Indicador</label>
            <select
              value={indicadorId}
              onChange={(e) => setIndicadorId(e.target.value)}
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
            <select value={periodo} disabled>
              <option value="2018">2018</option>
            </select>
          </div>
        </div>

        <div className="acciones-filtros-indicadores">
          <button
            type="button"
            className="boton-consultar-indicadores"
            onClick={comparar}
            disabled={estado === "cargando"}
          >
            {estado === "cargando"
              ? "Comparando..."
              : "Comparar"}
          </button>
        </div>
      </section>

      {estado === "cargando" && (
        <section className="estado-indicadores estado-cargando-indicadores">
          <div className="spinner-indicadores"></div>
          <h2>Consultando datos oficiales...</h2>
        </section>
      )}

      {estado === "error" && (
        <section className="estado-indicadores estado-sin-resultados">
          <h2>No fue posible completar la comparación</h2>
          <p>{error}</p>
        </section>
      )}

      {estado === "resultados" && (
        <section
          className="tabla-usuarios-contenedor"
          style={{ padding: 24 }}
        >
          <h2>
            Comparación: {indicadorSeleccionado?.nombre}
          </h2>
          <p>Fuente: DANE — CNPV 2018</p>

          <div style={{ marginTop: 28, marginBottom: 30 }}>
            {resultados.map((r) => (
              <div
                key={r.codigo}
                style={{ marginBottom: 20 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 6,
                  }}
                >
                  <strong>{r.nombre}</strong>
                  <span>
                    {r.valor === null
                      ? "Sin datos"
                      : `${r.valor.toLocaleString("es-CO")}%`}
                  </span>
                </div>

                <div
                  style={{
                    width: "100%",
                    height: 26,
                    background: "#e8e8e8",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${
                        r.valor === null
                          ? 0
                          : Math.max(
                              0,
                              Math.min(100, (r.valor / escala) * 100)
                            )
                      }%`,
                      height: "100%",
                      background: "#c28a3a",
                      borderRadius: 8,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <table className="tabla-usuarios">
            <thead>
              <tr>
                <th>Municipio</th>
                <th>Departamento</th>
                <th>Valor</th>
                <th>Periodo</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((r) => (
                <tr key={r.codigo}>
                  <td>{r.nombre}</td>
                  <td>{r.departamento}</td>
                  <td>
                    {r.valor === null
                      ? "Sin datos"
                      : `${r.valor.toLocaleString("es-CO")}%`}
                  </td>
                  <td>{periodo}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {validos.length >= 2 && (
            <p
              className="mensaje-resultado"
              style={{ marginTop: 20 }}
            >
              Diferencia máxima:{" "}
              <strong>
                {(maximo - minimo).toLocaleString("es-CO")}{" "}
                puntos porcentuales
              </strong>
              .
            </p>
          )}

          {validos.length === 0 && (
            <p>No hay datos disponibles para esta selección.</p>
          )}
        </section>
      )}
    </div>
  );
}
