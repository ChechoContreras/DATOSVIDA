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
    municipios,
    catalogoIndicadores,
    periodos,
    cargando,
    error,
    mensaje,
    haBuscado,
    buscar,
    limpiar,
  } = useIndicadores();

  const [departamento, setDepartamento] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [region, setRegion] = useState("");
  const [indicador, setIndicador] = useState("");
  const [periodo, setPeriodo] = useState("");

  /* Departamentos únicos a partir de los municipios reales del backend */
  const departamentos = useMemo(() => {
    return [...new Set(municipios.map((m) => m.departamento))].sort();
  }, [municipios]);

  /* Regiones (subregión) disponibles, acotadas por el departamento elegido */
  const regiones = useMemo(() => {
    const base = departamento
      ? municipios.filter((m) => m.departamento === departamento)
      : municipios;
    return [...new Set(base.map((m) => m.subregion))].sort();
  }, [municipios, departamento]);

  /* Municipios disponibles, acotados por departamento y región elegidos */
  const municipiosDisponibles = useMemo(() => {
    return municipios
      .filter((m) => !departamento || m.departamento === departamento)
      .filter((m) => !region || m.subregion === region);
  }, [municipios, departamento, region]);

  function manejarCambioDepartamento(valor) {
    setDepartamento(valor);
    setRegion("");
    setMunicipio("");
  }

  function manejarCambioRegion(valor) {
    setRegion(valor);
    setMunicipio("");
  }

  function consultar() {
    buscar({
      municipioCodigo: municipio,
      indicadorId: indicador,
      periodo,
    });
  }

  function limpiarFiltros() {
    setDepartamento("");
    setMunicipio("");
    setRegion("");
    setIndicador("");
    setPeriodo("");
    limpiar();
  }

  // Determina qué bloque de estado mostrar debajo del panel de filtros
  const estado = cargando
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
        <span className="etiqueta-pagina-indicadores">CONSULTA TERRITORIAL</span>
        <h1>Indicadores</h1>
        <p>
          Consulta los indicadores territoriales de Colombia y analiza
          información por municipio, región y periodo.
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
            <p>Selecciona los criterios para consultar información.</p>
          </div>
        </div>

        <div className="grid-filtros-indicadores">
          {/* DEPARTAMENTO */}
          <div className="campo-indicadores">
            <label htmlFor="departamento">Departamento</label>
            <select
              id="departamento"
              value={departamento}
              onChange={(e) => manejarCambioDepartamento(e.target.value)}
            >
              <option value="">Todos</option>
              {departamentos.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* REGIÓN */}
          <div className="campo-indicadores">
            <label htmlFor="region">Región</label>
            <select
              id="region"
              value={region}
              onChange={(e) => manejarCambioRegion(e.target.value)}
            >
              <option value="">Todas</option>
              {regiones.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* MUNICIPIO */}
          <div className="campo-indicadores">
            <label htmlFor="municipio">Municipio</label>
            <select
              id="municipio"
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
            >
              <option value="">Todos</option>
              {municipiosDisponibles.map((m) => (
                <option key={m.codigo} value={m.codigo}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* INDICADOR */}
          <div className="campo-indicadores">
            <label htmlFor="indicador">Indicador</label>
            <select
              id="indicador"
              value={indicador}
              onChange={(e) => setIndicador(e.target.value)}
            >
              <option value="">Todos</option>
              {catalogoIndicadores.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* PERIODO */}
          <div className="campo-indicadores">
            <label htmlFor="periodo">Periodo</label>
            <select
              id="periodo"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
            >
              <option value="">Todos</option>
              {periodos.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="acciones-filtros-indicadores">
          <button
            type="button"
            className="boton-consultar-indicadores"
            onClick={consultar}
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
          ESTADO VACÍO (aún no se ha consultado)
          ===================================== */}

      {estado === "vacio" && (
        <section className="estado-indicadores estado-vacio-indicadores">
          <div className="icono-estado-indicadores">
            <IconoBusqueda />
          </div>
          <h2>Selecciona los filtros para consultar</h2>
          <p>
            Define los criterios de búsqueda y pulsa <strong>Consultar</strong>.
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
          <p>Estamos preparando los resultados de la consulta.</p>
        </section>
      )}

      {/* =====================================
          ERROR DE CONEXIÓN CON EL BACKEND
          ===================================== */}

      {estado === "error" && (
        <section className="estado-indicadores estado-sin-resultados">
          <div className="icono-alerta-indicadores">
            <IconoAlerta />
          </div>
          <h2>No fue posible completar la consulta</h2>
          <p>{error}</p>
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
          <p>Intenta modificar los criterios de búsqueda.</p>
        </section>
      )}

      {/* =====================================
          RESULTADOS REALES (Microservicio de Indicadores)
          ===================================== */}

      {estado === "resultados" && (
        <section className="resultados-indicadores">
          <p className="mensaje-resultado">{mensaje}</p>
          <GraficoIndicadores datos={datos} />
          <TarjetasIndicadores datos={datos} />
        </section>
      )}
    </div>
  );
}

export default ConsultarIndicadores;
