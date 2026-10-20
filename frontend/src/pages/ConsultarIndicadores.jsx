
import { useMemo, useState } from "react";
import { useIndicadores } from "../hooks/useIndicadores";
import GraficoIndicadores from "../components/GraficoIndicadores";
import TarjetasIndicadores from "../components/TarjetasIndicadores";
import "../styles/Indicadores.css";

/* =========================================
   ICONO DE BÚSQUEDA
   ========================================= */

function IconoBusqueda() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

/* =========================================
   ICONO DE ALERTA
   ========================================= */

function IconoAlerta() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <path d="M12 16h.01" />
    </svg>
  );
}

/* =========================================
   COMPONENTE PRINCIPAL
   ========================================= */

function ConsultarIndicadores() {
  const {
    datos,
    departamentos,
    subregiones,
    municipios,
    catalogoIndicadores,
    periodos,
    cargando,
    cargandoTerritorios,
    error,
    mensaje,
    haBuscado,
    buscar,
    limpiar,
  } = useIndicadores();

  // ==========================================
  // FILTROS SELECCIONADOS
  // ==========================================

  const [departamento, setDepartamento] = useState("");
  const [region, setRegion] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [indicador, setIndicador] = useState("");
  const [periodo, setPeriodo] = useState("");

  const [avisoTerritorial, setAvisoTerritorial] =
    useState("");

  // ==========================================
  // SUBREGIONES DISPONIBLES
  // ==========================================

  const regionesDisponibles = useMemo(() => {
    if (!departamento) {
      return subregiones;
    }

    const codigos = new Set(
      municipios
        .filter(
          (m) =>
            String(m.departamentoCodigo) ===
            String(departamento)
        )
        .map((m) => String(m.subregionCodigo))
    );

    return subregiones.filter((s) =>
      codigos.has(String(s.codigo))
    );
  }, [departamento, municipios, subregiones]);

  // ==========================================
  // MUNICIPIOS DISPONIBLES
  // ==========================================

  const municipiosDisponibles = useMemo(() => {
    return municipios.filter((m) => {
      const coincideDepartamento =
        !departamento ||
        String(m.departamentoCodigo) ===
          String(departamento);

      const coincideRegion =
        !region ||
        String(m.subregionCodigo) ===
          String(region);

      return coincideDepartamento && coincideRegion;
    });
  }, [municipios, departamento, region]);

  // ==========================================
  // CAMBIO DE DEPARTAMENTO
  // ==========================================

  function manejarCambioDepartamento(valor) {
    setDepartamento(valor);
    setRegion("");
    setMunicipio("");
    setAvisoTerritorial("");
    limpiar();
  }

  // ==========================================
  // CAMBIO DE REGIÓN
  // ==========================================

  function manejarCambioRegion(valor) {
    setRegion(valor);
    setMunicipio("");
    setAvisoTerritorial("");
    limpiar();
  }

  // ==========================================
  // CAMBIO DE MUNICIPIO
  // ==========================================

  function manejarCambioMunicipio(valor) {
    setMunicipio(valor);
    setAvisoTerritorial("");
    limpiar();
  }

  // ==========================================
  // CONSULTAR INDICADORES
  // ==========================================

  function consultar() {
    setAvisoTerritorial("");

    // CONSULTA MUNICIPAL DANE 2018

    if (municipio) {
      // Los valores municipales importados
      // corresponden al CNPV 2018.

      if (periodo && String(periodo) !== "2018") {
        limpiar();

        setAvisoTerritorial(
          "Los indicadores municipales del DANE " +
            "actualmente disponibles en DATAVIDA " +
            "corresponden al año 2018. " +
            "Selecciona el periodo 2018 o " +
            "la opción Todos."
        );

        return;
      }

      buscar({
        municipioCodigo: municipio,
        indicadorId: indicador,
        periodo: "2018",
      });

      return;
    }

    // CONSULTA DEPARTAMENTAL O REGIONAL
    //
    // No se presentan datos municipales
    // como si fueran agregados oficiales.

    if (departamento || region) {
      limpiar();

      setAvisoTerritorial(
        "Selecciona un municipio para consultar " +
          "sus indicadores oficiales del DANE 2018. " +
          "Los resultados agregados por departamento " +
          "y región PDET todavía no están disponibles."
      );

      return;
    }

    // CONSULTA GENERAL PDET COLOMBIA
    //
    // Se conserva el comportamiento anterior.

    buscar({
      municipioCodigo: "PDET-CO",
      indicadorId: indicador,
      periodo,
    });
  }

  // ==========================================
  // LIMPIAR FILTROS
  // ==========================================

  function limpiarFiltros() {
    setDepartamento("");
    setRegion("");
    setMunicipio("");
    setIndicador("");
    setPeriodo("");
    setAvisoTerritorial("");
    limpiar();
  }

  // ==========================================
  // ESTADO DE RESULTADOS
  // ==========================================

  const estado = avisoTerritorial
    ? "sin-datos-territoriales"
    : cargando
    ? "cargando"
    : error
    ? "error"
    : !haBuscado
    ? "vacio"
    : datos.length === 0
    ? "sin-resultados"
    : "resultados";

  return (
    <div className="pagina-indicadores">

      {/* =====================================
          ENCABEZADO
          ===================================== */}

      <header className="encabezado-indicadores">
        <span className="etiqueta-pagina-indicadores">
          CONSULTA TERRITORIAL
        </span>

        <h1>Indicadores</h1>

        <p>
          Consulta los indicadores territoriales de
          Colombia y analiza información por municipio,
          región y periodo.
        </p>
      </header>

      {/* =====================================
          PANEL DE FILTROS
          ===================================== */}

      <section className="panel-filtros-indicadores">

        <div className="titulo-panel-indicadores">
          <div className="icono-titulo-filtros">
            <IconoBusqueda />
          </div>

          <div>
            <h2>Filtros de consulta</h2>

            <p>
              Selecciona los criterios para consultar
              información.
            </p>
          </div>
        </div>

        <div className="grid-filtros-indicadores">

          {/* DEPARTAMENTO */}

          <div className="campo-indicadores">
            <label htmlFor="departamento">
              Departamento
            </label>

            <select
              id="departamento"
              value={departamento}
              onChange={(e) =>
                manejarCambioDepartamento(e.target.value)
              }
              disabled={cargandoTerritorios}
            >
              <option value="">Todos</option>

              {departamentos.map((d) => (
                <option
                  key={d.codigo}
                  value={d.codigo}
                >
                  {d.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* REGIÓN PDET */}

          <div className="campo-indicadores">
            <label htmlFor="region">
              Región
            </label>

            <select
              id="region"
              value={region}
              onChange={(e) =>
                manejarCambioRegion(e.target.value)
              }
              disabled={cargandoTerritorios}
            >
              <option value="">Todas</option>

              {regionesDisponibles.map((r) => (
                <option
                  key={r.codigo}
                  value={String(r.codigo)}
                >
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* MUNICIPIO */}

          <div className="campo-indicadores">
            <label htmlFor="municipio">
              Municipio
            </label>

            <select
              id="municipio"
              value={municipio}
              onChange={(e) =>
                manejarCambioMunicipio(e.target.value)
              }
              disabled={cargandoTerritorios}
            >
              <option value="">Todos</option>

              {municipiosDisponibles.map((m) => (
                <option
                  key={m.codigo}
                  value={m.codigo}
                >
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* INDICADOR */}

          <div className="campo-indicadores">
            <label htmlFor="indicador">
              Indicador
            </label>

            <select
              id="indicador"
              value={indicador}
              onChange={(e) => {
                setIndicador(e.target.value);
                setAvisoTerritorial("");
                limpiar();
              }}
            >
              <option value="">Todos</option>

              {catalogoIndicadores.map((i) => (
                <option
                  key={i.id}
                  value={i.id}
                >
                  {i.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* PERIODO */}

          <div className="campo-indicadores">
            <label htmlFor="periodo">
              Periodo
            </label>

            <select
              id="periodo"
              value={periodo}
              onChange={(e) => {
                setPeriodo(e.target.value);
                setAvisoTerritorial("");
                limpiar();
              }}
            >
              <option value="">Todos</option>

              {periodos.map((p) => (
                <option
                  key={p}
                  value={p}
                >
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* =====================================
            BOTONES
            ===================================== */}

        <div className="acciones-filtros-indicadores">
          <button
            type="button"
            className="boton-consultar-indicadores"
            onClick={consultar}
            disabled={cargando}
          >
            Consultar
          </button>

          <button
            type="button"
            className="boton-limpiar-indicadores"
            onClick={limpiarFiltros}
          >
            Limpiar filtros
          </button>
        </div>
      </section>

      {/* =====================================
          ESTADO INICIAL
          ===================================== */}

      {estado === "vacio" && (
        <section className="estado-indicadores estado-vacio-indicadores">
          <div className="icono-estado-indicadores">
            <IconoBusqueda />
          </div>

          <h2>
            Selecciona los filtros para consultar
          </h2>

          <p>
            Define los criterios de búsqueda y pulsa{" "}
            <strong>Consultar</strong>.
          </p>
        </section>
      )}

      {/* =====================================
          CARGANDO
          ===================================== */}

      {estado === "cargando" && (
        <section className="estado-indicadores estado-cargando-indicadores">
          <div className="spinner-indicadores"></div>

          <h2>Consultando información</h2>

          <p>
            Estamos preparando los resultados de la consulta.
          </p>
        </section>
      )}

      {/* =====================================
          ERROR
          ===================================== */}

      {estado === "error" && (
        <section className="estado-indicadores estado-sin-resultados">
          <div className="icono-alerta-indicadores">
            <IconoAlerta />
          </div>

          <h2>
            No fue posible completar la consulta
          </h2>

          <p>{error}</p>
        </section>
      )}

      {/* =====================================
          AVISO TERRITORIAL
          ===================================== */}

      {estado === "sin-datos-territoriales" && (
        <section className="estado-indicadores estado-sin-resultados">
          <div className="icono-alerta-indicadores">
            <IconoAlerta />
          </div>

          <h2>
            Información territorial no disponible
          </h2>

          <p>{avisoTerritorial}</p>
        </section>
      )}

      {/* =====================================
          SIN RESULTADOS
          ===================================== */}

      {estado === "sin-resultados" && (
        <section className="estado-indicadores estado-sin-resultados">
          <div className="icono-alerta-indicadores">
            <IconoAlerta />
          </div>

          <h2>No se encontraron resultados</h2>

          <p>
            No hay información disponible para
            los criterios seleccionados.
          </p>
        </section>
      )}

      {/* =====================================
          RESULTADOS
          ===================================== */}

      {estado === "resultados" && (
        <section className="resultados-indicadores">
          <p className="mensaje-resultado">
            {mensaje}
          </p>

          <GraficoIndicadores datos={datos} />

          <TarjetasIndicadores datos={datos} />
        </section>
      )}
    </div>
  );
}

export default ConsultarIndicadores;
