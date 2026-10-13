
import { useEffect, useMemo, useState } from "react";
import {
  obtenerMunicipios,
  obtenerCatalogoIndicadores,
  consultarIndicadores,
} from "../services/indicadoresService";
import "../styles/Indicadores.css";

const PERIODO = "2018";

function extraerLista(respuesta, clave) {
  if (Array.isArray(respuesta)) return respuesta;
  if (Array.isArray(respuesta?.[clave])) return respuesta[clave];
  if (Array.isArray(respuesta?.datos)) return respuesta.datos;
  return [];
}

function obtenerDepartamento(municipio) {
  if (typeof municipio?.departamento === "string") {
    return municipio.departamento;
  }

  return (
    municipio?.departamento?.nombre ||
    municipio?.departamentoNombre ||
    "—"
  );
}

function formato(numero) {
  return Number(numero).toLocaleString("es-CO", {
    maximumFractionDigits: 2,
  });
}

function obtenerUnidad(indicador) {
  const unidad =
    indicador?.unidad?.simbolo ||
    indicador?.unidad?.nombre ||
    indicador?.unidadMedida ||
    indicador?.unidad ||
    "%";

  return typeof unidad === "string" ? unidad : "%";
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

        setMunicipios(
          extraerLista(respuestaMunicipios, "municipios")
        );

        setIndicadores(
          extraerLista(respuestaIndicadores, "indicadores")
        );
      } catch (err) {
        if (!activo) return;

        console.error("Error cargando catálogos:", err);

        setError(
          "No fue posible cargar los municipios o indicadores."
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
    (indicador) =>
      String(indicador.id) === String(indicadorId)
  );

  const unidad = obtenerUnidad(indicadorSeleccionado);

  const esPorcentaje =
    unidad === "%" ||
    unidad.toLowerCase().includes("porcentaje");

  function limpiarResultados() {
    setEstado("vacio");
    setResultados([]);
    setError("");
  }

  function alternarSeleccion(codigo) {
    const codigoTexto = String(codigo);

    setSeleccionados((anteriores) =>
      anteriores.includes(codigoTexto)
        ? anteriores.filter((item) => item !== codigoTexto)
        : [...anteriores, codigoTexto]
    );

    limpiarResultados();
  }

  function limpiarSeleccion() {
    setSeleccionados([]);
    setIndicadorId("");
    setBusqueda("");
    limpiarResultados();
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

          const registros = extraerLista(
            respuesta,
            "indicadores"
          );

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

          const fuente =
            typeof registro?.fuente === "string"
              ? registro.fuente
              : registro?.fuente?.nombre ||
                "DANE — CNPV 2018";

          return {
            codigo,
            nombre: municipio?.nombre || codigo,
            departamento: obtenerDepartamento(municipio),
            valor:
              valor !== null && Number.isFinite(valor)
                ? valor
                : null,
            fuente,
          };
        })
      );

      setResultados(comparaciones);
      setEstado("resultados");
    } catch (err) {
      console.error("Error en comparación:", err);

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
          Selecciona dos o más municipios PDET para
          comparar sus indicadores de pobreza multidimensional.
        </p>
      </header>

      <section className="panel-filtros-indicadores">
        <div className="titulo-panel-indicadores">
          <div>
            <h2>Municipios a comparar</h2>
            <p>
              Selecciona al menos dos municipios.
            </p>
          </div>
        </div>

        <div
          className="campo-indicadores"
          style={{ marginBottom: 18 }}
        >
          <label htmlFor="buscar-municipio">
            Buscar municipio
          </label>

          <input
            id="buscar-municipio"
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Escribe un municipio o departamento..."
            style={{
              width: "100%",
              padding: "13px 15px",
              border: "1px solid #d8ddcf",
              borderRadius: 10,
              background: "#fff",
              color: "#173b37",
            }}
          />
        </div>

        <p style={{ marginBottom: 14 }}>
          <strong>
            Municipios seleccionados: {seleccionados.length}
          </strong>
        </p>

        <div
          className="lista-checks-municipios"
          style={{
            maxHeight: 300,
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
                  onChange={() => alternarSeleccion(codigo)}
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
          style={{ marginTop: 22 }}
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
                limpiarResultados();
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

          <button
            type="button"
            onClick={limpiarSeleccion}
            disabled={estado === "cargando"}
            style={{
              padding: "12px 20px",
              border: "1px solid #d8ddcf",
              borderRadius: 10,
              background: "#fff",
              color: "#173b37",
              cursor: "pointer",
            }}
          >
            Limpiar selección
          </button>
        </div>
      </section>

      {estado === "cargando" && (
        <section className="estado-indicadores estado-cargando-indicadores">
          <div className="spinner-indicadores"></div>
          <h2>Consultando datos oficiales...</h2>
          <p>
            Obteniendo indicadores de los municipios seleccionados.
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

          <p style={{ marginTop: 10 }}>
            <strong>Indicador:</strong>{" "}
            {indicadorSeleccionado?.nombre}
          </p>

          <p>
            <strong>Periodo:</strong> {PERIODO}
          </p>

          <p>
            <strong>Fuente:</strong> DANE — CNPV 2018
          </p>

          <h3 style={{ marginTop: 30, marginBottom: 20 }}>
            Gráfica comparativa
          </h3>

          <div style={{ marginBottom: 32 }}>
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
                  style={{ marginBottom: 24 }}
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
                        : `${formato(municipio.valor)} ${unidad}`}
                    </strong>
                  </div>

                  <div
                    style={{
                      width: "100%",
                      height: 28,
                      background: "#e9ece8",
                      borderRadius: 9,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${porcentajeBarra}%`,
                        height: "100%",
                        background: "#bd873b",
                        borderRadius: 9,
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
                        : `${formato(municipio.valor)} ${unidad}`}
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
                marginTop: 26,
                padding: 22,
                borderRadius: 12,
                background: "#f5f5f0",
              }}
            >
              <h3>Resumen de la comparación</h3>

              <p style={{ marginTop: 14 }}>
                <strong>Valor más alto:</strong>{" "}
                {valorMayor.nombre} (
                {formato(valorMayor.valor)} {unidad})
              </p>

              <p>
                <strong>Valor más bajo:</strong>{" "}
                {valorMenor.nombre} (
                {formato(valorMenor.valor)} {unidad})
              </p>

              <p>
                <strong>Diferencia máxima:</strong>{" "}
                {formato(diferencia)}{" "}
                {esPorcentaje
                  ? "puntos porcentuales"
                  : unidad}
              </p>
            </div>
          )}

          {resultadosValidos.length === 0 && (
            <p style={{ marginTop: 20 }}>
              No hay datos disponibles para los municipios
              y el indicador seleccionados.
            </p>
          )}

          {resultadosValidos.length === 1 && (
            <p style={{ marginTop: 20 }}>
              Solo un municipio tiene datos disponibles.
              No es posible calcular una diferencia.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
