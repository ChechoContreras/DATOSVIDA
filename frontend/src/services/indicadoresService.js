
import { useEffect, useMemo, useState } from "react";
import {
  obtenerMunicipios,
  obtenerCatalogoIndicadores,
  consultarIndicadores,
} from "../services/indicadoresService";
import "../styles/Indicadores.css";

const PERIODO = "2018";

function extraerLista(respuesta) {
  if (Array.isArray(respuesta)) return respuesta;
  if (Array.isArray(respuesta?.datos)) return respuesta.datos;
  if (Array.isArray(respuesta?.municipios)) return respuesta.municipios;
  if (Array.isArray(respuesta?.indicadores)) return respuesta.indicadores;
  return [];
}

function obtenerDepartamento(municipio) {
  if (typeof municipio.departamento === "string") {
    return municipio.departamento;
  }

  return (
    municipio.departamento?.nombre ||
    municipio.departamentoNombre ||
    "Sin departamento"
  );
}

function formatearNumero(numero) {
  return Number(numero).toLocaleString("es-CO", {
    maximumFractionDigits: 2,
  });
}

export default function Comparar() {
  const [municipios, setMunicipios] = useState([]);
  const [indicadores, setIndicadores] = useState([]);

  const [seleccionados, setSeleccionados] = useState([]);
  const [indicadorId, setIndicadorId] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const [estado, setEstado] = useState("vacio");
  const [error, setError] = useState("");
  const [resultados, setResultados] = useState([]);

  useEffect(() => {
    let activo = true;

    async function cargarCatalogos() {
      try {
        const [respuestaMunicipios, respuestaIndicadores] =
          await Promise.all([
            obtenerMunicipios(),
            obtenerCatalogoIndicadores(),
          ]);

        if (!activo) return;

        setMunicipios(extraerLista(respuestaMunicipios));
        setIndicadores(extraerLista(respuestaIndicadores));
      } catch (err) {
        if (!activo) return;

        setError(
          "No fue posible cargar los municipios o los indicadores."
        );
        setEstado("error");
      }
    }

    cargarCatalogos();

    return () => {
      activo = false;
    };
  }, []);

  const municipiosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase("es");

    if (!texto) return municipios;

    return municipios.filter((municipio) => {
      const contenido = [
        municipio.nombre,
        obtenerDepartamento(municipio),
        municipio.codigo,
      ]
        .join(" ")
        .toLocaleLowerCase("es");

      return contenido.includes(texto);
    });
  }, [municipios, busqueda]);

  const indicadorSeleccionado = indicadores.find(
    (indicador) => String(indicador.id) === String(indicadorId)
  );

  function alternarSeleccion(codigo) {
    const codigoTexto = String(codigo);

    setSeleccionados((anteriores) =>
      anteriores.includes(codigoTexto)
        ? anteriores.filter((item) => item !== codigoTexto)
        : [...anteriores, codigoTexto]
    );

    setEstado("vacio");
    setResultados([]);
    setError("");
  }

  async function comparar() {
    if (seleccionados.length < 2) {
      setError("Debes seleccionar al menos dos municipios.");
      setEstado("error");
      return;
    }

    if (!indicadorId) {
      setError("Debes seleccionar un indicador.");
      setEstado("error");
      return;
    }

    setEstado("cargando");
    setError("");
    setResultados([]);

    try {
      const comparaciones = await Promise.all(
        seleccionados.map(async (codigo) => {
          const municipio = municipios.find(
            (item) => String(item.codigo) === codigo
          );

          const respuesta = await consultarIndicadores({
            municipioCodigo: codigo,
            indicadorId,
            periodo: PERIODO,
          });

          const registros = extraerLista(respuesta);

          const registro = registros.find((item) => {
            const id =
              item.indicador?.id ??
              item.indicadorId ??
              item.indicador_id;

            return String(id) === String(indicadorId);
          });

          const valorOriginal = registro?.valor;

          const valor =
            valorOriginal === null ||
            valorOriginal === undefined ||
            valorOriginal === ""
              ? null
              : Number(valorOriginal);

          return {
            codigo,
            nombre: municipio?.nombre || codigo,
            departamento: municipio
              ? obtenerDepartamento(municipio)
              : "—",
            valor:
              valor !== null && Number.isFinite(valor)
                ? valor
                : null,
            fuente:
              typeof registro?.fuente === "string"
                ? registro.fuente
                : registro?.fuente?.nombre || "DANE — CNPV 2018",
          };
        })
      );

      setResultados(comparaciones);
      setEstado("resultados");
    } catch (err) {
      console.error("Error al comparar municipios:", err);

      setError(
        err.response?.data?.mensaje ||
          err.message ||
          "No fue posible completar la comparación."
      );

      setEstado("error");
    }
  }

  const resultadosValidos = resultados.filter(
    (item) => item.valor !== null
  );

  const valorMayor =
    resultadosValidos.length > 0
      ? resultadosValidos.reduce((mayor, actual) =>
          actual.valor > mayor.valor ? actual : mayor
        )
      : null;

  const valorMenor =
    resultadosValidos.length > 0
      ? resultadosValidos.reduce((menor, actual) =>
          actual.valor < menor.valor ? actual : menor
        )
      : null;

  const diferencia =
    valorMayor && valorMenor
      ? valorMayor.valor - valorMenor.valor
      : null;

  const unidad =
    indicadorSeleccionado?.unidad ||
    indicadorSeleccionado?.unidadMedida ||
    "%";

  const esPorcentaje =
    unidad === "%" ||
    unidad.toLowerCase().includes("porcentaje");

  const maximoGrafica = Math.max(
    1,
    ...resultadosValidos.map((item) => item.valor)
  );

  return (
    <div className="pagina-indicadores">
      <header className="encabezado-indicadores">
        <span className="etiqueta-pagina-indicadores">
          ANÁLISIS TERRITORIAL
        </span>

        <h1>Comparar municipios PDET</h1>

        <p>
          Compara los indicadores oficiales de pobreza
          multidimensional entre dos o más municipios
          pertenecientes a los territorios PDET.
        </p>
      </header>

      <section className="panel-filtros-indicadores">
        <div className="titulo-panel-indicadores">
          <div>
            <h2>Seleccionar municipios</h2>
            <p>
              Selecciona al menos dos municipios para realizar
              la comparación.
            </p>
          </div>
        </div>

        <div
          className="campo-indicadores"
          style={{ marginBottom: 16 }}
        >
          <label htmlFor="buscar-municipio">
            Buscar municipio
          </label>

          <input
            id="buscar-municipio"
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Escribe el nombre del municipio..."
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: 8,
            }}
          />
        </div>

        <p style={{ marginBottom: 12 }}>
          <strong>
            Municipios seleccionados: {seleccionados.length}
          </strong>
        </p>

        <div
          className="lista-checks-municipios"
          style={{
            maxHeight: 290,
            overflowY: "auto",
          }}
        >
          {municipiosFiltrados.map((municipio) => {
            const codigo = String(municipio.codigo);

            return (
              <label
                key={codigo}
                className="check-municipio"
              >
                <input
                  type="checkbox"
                  checked={seleccionados.includes(codigo)}
                  onChange={() =>
                    alternarSeleccion(codigo)
                  }
                />

                {municipio.nombre},{" "}
                {obtenerDepartamento(municipio)}
              </label>
            );
          })}

          {municipiosFiltrados.length === 0 && (
            <p>No se encontraron municipios.</p>
          )}
        </div>

        <div
          className="grid-filtros-indicadores"
          style={{ marginTop: 20 }}
        >
          <div className="campo-indicadores">
            <label htmlFor="indicador-comparar">
              Indicador
            </label>

            <select
              id="indicador-comparar"
              value={indicadorId}
              onChange={(e) => {
                setIndicadorId(e.target.value);
                setEstado("vacio");
                setResultados([]);
              }}
            >
              <option value="">
                Selecciona un indicador
              </option>

              {indicadores.map((indicador) => (
                <option
                  key={indicador.id}
                  value={indicador.id}
                >
                  {indicador.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="campo-indicadores">
            <label htmlFor="periodo-comparar">
              Periodo
            </label>

            <select
              id="periodo-comparar"
              value={PERIODO}
              disabled
            >
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
              : "Comparar municipios"}
          </button>
        </div>
      </section>

      {estado === "cargando" && (
        <section className="estado-indicadores estado-cargando-indicadores">
          <div className="spinner-indicadores"></div>
          <h2>Consultando indicadores...</h2>
          <p>
            Estamos obteniendo los datos oficiales
            de los municipios seleccionados.
          </p>
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
          <h2>Resultados de la comparación</h2>

          <p style={{ marginTop: 8 }}>
            <strong>Indicador:</strong>{" "}
            {indicadorSeleccionado?.nombre}
          </p>

          <p>
            <strong>Periodo:</strong> {PERIODO}
          </p>

          <p>
            <strong>Fuente:</strong> DANE — Censo Nacional
            de Población y Vivienda 2018
          </p>

          <h3 style={{ marginTop: 30, marginBottom: 20 }}>
            Comparación gráfica
          </h3>

          <div style={{ marginBottom: 30 }}>
            {resultados.map((municipio) => {
              const porcentajeBarra =
                municipio.valor === null
                  ? 0
                  : Math.max(
                      0,
                      Math.min(
                        100,
                        (municipio.valor / maximoGrafica) * 100
                      )
                    );

              return (
                <div
                  key={municipio.codigo}
                  style={{ marginBottom: 22 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <strong>{municipio.nombre}</strong>

                    <strong>
                      {municipio.valor === null
                        ? "Sin datos"
                        : `${formatearNumero(
                            municipio.valor
                          )} ${unidad}`}
                    </strong>
                  </div>

                  <div
                    style={{
                      height: 28,
                      backgroundColor: "#eeeeee",
                      borderRadius: 8,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${porcentajeBarra}%`,
                        height: "100%",
                        backgroundColor: "#c59a45",
                        borderRadius: 8,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <h3 style={{ marginBottom: 16 }}>
            Tabla comparativa
          </h3>

          <div style={{ overflowX: "auto" }}>
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
                {resultados.map((municipio) => (
                  <tr key={municipio.codigo}>
                    <td>{municipio.nombre}</td>
                    <td>{municipio.departamento}</td>
                    <td>
                      {municipio.valor === null
                        ? "Sin datos"
                        : `${formatearNumero(
                            municipio.valor
                          )} ${unidad}`}
                    </td>
                    <td>{PERIODO}</td>
                    <td>
                      {municipio.valor === null
                        ? "—"
                        : municipio.fuente}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {resultadosValidos.length >= 2 && (
            <div
              className="mensaje-resultado"
              style={{
                marginTop: 24,
                padding: 20,
                borderRadius: 10,
                backgroundColor: "#f5f5f5",
              }}
            >
              <h3>Resumen de la comparación</h3>

              <p style={{ marginTop: 12 }}>
                <strong>Valor más alto:</strong>{" "}
                {valorMayor.nombre} (
                {formatearNumero(valorMayor.valor)} {unidad})
              </p>

              <p>
                <strong>Valor más bajo:</strong>{" "}
                {valorMenor.nombre} (
                {formatearNumero(valorMenor.valor)} {unidad})
              </p>

              <p>
                <strong>Diferencia máxima:</strong>{" "}
                {formatearNumero(diferencia)}{" "}
                {esPorcentaje
                  ? "puntos porcentuales"
                  : unidad}
              </p>
            </div>
          )}

          {resultadosValidos.length === 0 && (
            <p style={{ marginTop: 20 }}>
              No se encontraron datos para los municipios
              y el indicador seleccionados.
            </p>
          )}

          {resultadosValidos.length === 1 && (
            <p style={{ marginTop: 20 }}>
              Solo uno de los municipios tiene datos
              disponibles. No es posible calcular
              una diferencia entre dos valores.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
