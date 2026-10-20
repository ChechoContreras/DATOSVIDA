
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useIndicadores } from "../hooks/useIndicadores";
import GraficoIndicadores from "../components/GraficoIndicadores";
import TarjetasIndicadores from "../components/TarjetasIndicadores";
import logoIcono from "../assets/logo-icono.png";
import "../styles/Inicio.css";
import "../styles/Indicadores.css";

const imagenIndicadores =
  "https://sensorial.coffee/cdn/shop/articles/10.png?v=1791889602&width=1600";

const opcionesMenu = [
  { nombre: "Inicio", descripcion: "Resumen territorial", ruta: "/app", icono: "⌂" },
  { nombre: "Indicadores", descripcion: "Consulta de información", ruta: "/app/indicadores", icono: "▤" },
  { nombre: "Visualización", descripcion: "Exploración territorial", ruta: "/app/mapa", icono: "◫" },
  { nombre: "Comparar", descripcion: "Comparación de territorios", ruta: "/app/comparar", icono: "⇄" },
  { nombre: "Análisis estadístico", descripcion: "Relaciones y hallazgos", ruta: "/app/analisis-estadistico", icono: "⌁" },
  { nombre: "Predicciones IA", descripcion: "Proyecciones e inteligencia artificial", ruta: "/app/predicciones", icono: "✳" },
  { nombre: "Análisis de variables", descripcion: "Relaciones entre indicadores y variables", ruta: "/app/variables", icono: "⌁" },
  { nombre: "Recomendaciones", descripcion: "Orientación para el territorio", ruta: "/app/recomendaciones", icono: "◇" },
  { nombre: "Reportes", descripcion: "Síntesis de resultados", ruta: "/app/reportes", icono: "▧" },
  { nombre: "Perfil", descripcion: "Mi cuenta", ruta: "/app/perfil", icono: "○" },
];

function obtenerNombreUsuario() {
  try {
    const guardado = localStorage.getItem("datavida_usuario");
    if (!guardado) return "Usuario";

    const usuario = JSON.parse(guardado);
    if (typeof usuario === "string") return usuario;

    return (
      usuario?.nombreCompleto ||
      usuario?.nombre ||
      usuario?.nombres ||
      usuario?.name ||
      usuario?.correo ||
      usuario?.email ||
      "Usuario"
    );
  } catch {
    return "Usuario";
  }
}

function obtenerIniciales(nombre) {
  if (!nombre || nombre === "Usuario") return "U";

  const palabras = nombre.trim().split(/\s+/);

  if (palabras.length === 1) {
    return palabras[0].slice(0, 2).toUpperCase();
  }

  return (
    palabras[0][0] + palabras[palabras.length - 1][0]
  ).toUpperCase();
}

function IconoBusqueda() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4.2 4.2" />
    </svg>
  );
}

function IconoAlerta() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6M12 16.5v.1" />
    </svg>
  );
}

export default function ConsultarIndicadores() {
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

  const [departamento, setDepartamento] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [region, setRegion] = useState("");
  const [indicador, setIndicador] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [avisoTerritorial, setAvisoTerritorial] = useState("");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const nombreUsuario = obtenerNombreUsuario();
  const inicialesUsuario = obtenerIniciales(nombreUsuario);

  const regionesDisponibles = useMemo(() => {
    if (!departamento) return subregiones;

    const codigos = new Set(
      municipios
        .filter(
          (m) =>
            String(m.departamentoCodigo) === String(departamento)
        )
        .map((m) => String(m.subregionCodigo))
    );

    return subregiones.filter((s) =>
      codigos.has(String(s.codigo))
    );
  }, [departamento, municipios, subregiones]);

  const municipiosDisponibles = useMemo(
    () =>
      municipios.filter((m) => {
        const coincideDepartamento =
          !departamento ||
          String(m.departamentoCodigo) === String(departamento);

        const coincideRegion =
          !region ||
          String(m.subregionCodigo) === String(region);

        return coincideDepartamento && coincideRegion;
      }),
    [municipios, departamento, region]
  );

  const opcionesMenuFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase("es");

    if (!texto) return opcionesMenu;

    return opcionesMenu.filter((opcion) =>
      `${opcion.nombre} ${opcion.descripcion}`
        .toLocaleLowerCase("es")
        .includes(texto)
    );
  }, [busqueda]);

  function manejarCambioDepartamento(valor) {
    setDepartamento(valor);
    setRegion("");
    setMunicipio("");
    setAvisoTerritorial("");
    limpiar();
  }

  function manejarCambioRegion(valor) {
    setRegion(valor);
    setMunicipio("");
    setAvisoTerritorial("");
    limpiar();
  }

  function manejarCambioMunicipio(valor) {
    setMunicipio(valor);
    setAvisoTerritorial("");
    limpiar();
  }

  function consultar(evento) {
    evento.preventDefault();
    setAvisoTerritorial("");

    if (municipio) {
      if (periodo && String(periodo) !== "2018") {
        limpiar();

        setAvisoTerritorial(
          "Los indicadores municipales del DANE actualmente disponibles en DATAVIDA corresponden al año 2018. Selecciona el periodo 2018 o la opción Todos."
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

    if (departamento || region) {
      limpiar();

      setAvisoTerritorial(
        "Selecciona un municipio para consultar sus indicadores oficiales del DANE 2018. Los resultados agregados por departamento y región PDET todavía no están disponibles."
      );

      return;
    }

    buscar({
      municipioCodigo: "PDET-CO",
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
    setAvisoTerritorial("");
    limpiar();
  }

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
    <main className="pagina-indicadores">
      <section className="hero-indicadores">
        <img
          className="hero-indicadores-imagen"
          src={imagenIndicadores}
          alt="Paisaje natural colombiano"
        />
        <div className="hero-indicadores-degradado" />

        <header className="barra-superior-inicio">
          <Link to="/app" className="marca-inicio"
            aria-label="Ir al inicio de DATAVIDA">
            <img src={logoIcono} alt=""
              onError={(evento) => {
                evento.currentTarget.style.display = "none";
              }} />
            <span>DATAVIDA</span>
          </Link>

          <div className="acciones-superiores-inicio">
            <label className="busqueda-territorio-inicio">
              <span className="icono-busqueda-inicio" aria-hidden="true">
                ⌕
              </span>
              <input
                type="search"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Buscar sección del menú"
                aria-label="Buscar sección del menú"
              />
            </label>

            <Link to="/app/perfil" className="boton-perfil-inicio"
              aria-label={`Ver perfil de ${nombreUsuario}`}
              title={nombreUsuario}>
              <span aria-hidden="true">{inicialesUsuario}</span>
            </Link>

            <button
              type="button"
              className={`boton-menu-inicio ${menuAbierto ? "activo" : ""}`}
              aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuAbierto}
              onClick={() => setMenuAbierto(!menuAbierto)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </header>

        {menuAbierto && (
          <>
            <button type="button" className="fondo-menu-inicio"
              aria-label="Cerrar menú"
              onClick={() => setMenuAbierto(false)} />

            <nav className="menu-desplegable-inicio"
              aria-label="Menú principal">
              <div className="menu-desplegable-encabezado">
                <span>MENÚ PRINCIPAL</span>
                <button type="button"
                  onClick={() => setMenuAbierto(false)}
                  aria-label="Cerrar menú">×</button>
              </div>

              <div className="menu-usuario-inicio">
                <div className="menu-avatar-inicio">{inicialesUsuario}</div>
                <div>
                  <strong>{nombreUsuario}</strong>
                  <span>Sesión activa</span>
                </div>
              </div>

              <div className="menu-enlaces-inicio">
                {opcionesMenuFiltradas.map((opcion) => (
                  <Link key={opcion.nombre} to={opcion.ruta}
                    className="enlace-menu-inicio"
                    onClick={() => setMenuAbierto(false)}>
                    <span className="enlace-menu-icono">{opcion.icono}</span>
                    <span className="enlace-menu-contenido">
                      <strong>{opcion.nombre}</strong>
                      <small>{opcion.descripcion}</small>
                    </span>
                    <span className="enlace-menu-flecha">›</span>
                  </Link>
                ))}
                {opcionesMenuFiltradas.length === 0 && (
                  <p>No se encontraron secciones del menú.</p>
                )}
              </div>

              <div className="menu-pie-inicio">
                <span>DATAVIDA</span>
                <small>Datos con propósito</small>
              </div>
            </nav>
          </>
        )}

        <div className="hero-indicadores-contenido">
          <span className="etiqueta-hero-indicadores">
            EXPLORACIÓN TERRITORIAL
          </span>
          <h1>Indicadores</h1>
          <p>
            Explora la información y comprende las condiciones de los
            territorios de Colombia.
          </p>
        </div>
      </section>

      <section className="contenido-indicadores">
        <header className="encabezado-exploracion-indicadores">
          <span className="sobretitulo-indicadores">
            EXPLORACIÓN TERRITORIAL
          </span>
          <h2>Filtros de consulta</h2>
          <p>Selecciona los criterios para consultar información.</p>
        </header>

        <section className="panel-filtros-indicadores">
          <form className="formulario-filtros-indicadores"
            onSubmit={consultar}>
            <div className="rejilla-filtros-indicadores">
              <div className="campo-indicadores">
                <label htmlFor="departamento">Departamento</label>
                <select id="departamento" value={departamento}
                  onChange={(e) => manejarCambioDepartamento(e.target.value)}
                  disabled={cargandoTerritorios}>
                  <option value="">Todos</option>
                  {departamentos.map((d) => (
                    <option key={d.codigo} value={d.codigo}>
                      {d.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="campo-indicadores">
                <label htmlFor="municipio">Municipio</label>
                <select id="municipio" value={municipio}
                  onChange={(e) => manejarCambioMunicipio(e.target.value)}
                  disabled={cargandoTerritorios}>
                  <option value="">Todos</option>
                  {municipiosDisponibles.map((m) => (
                    <option key={m.codigo} value={m.codigo}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="campo-indicadores">
                <label htmlFor="region">Región PDET</label>
                <select id="region" value={region}
                  onChange={(e) => manejarCambioRegion(e.target.value)}
                  disabled={cargandoTerritorios}>
                  <option value="">Todas</option>
                  {regionesDisponibles.map((r) => (
                    <option key={r.codigo} value={String(r.codigo)}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="campo-indicadores">
                <label htmlFor="indicador">Indicador</label>
                <select id="indicador" value={indicador}
                  onChange={(e) => {
                    setIndicador(e.target.value);
                    setAvisoTerritorial("");
                    limpiar();
                  }}>
                  <option value="">Todos</option>
                  {catalogoIndicadores.map((i) => (
                    <option key={i.id} value={i.id}>{i.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="campo-indicadores">
                <label htmlFor="periodo">Periodo</label>
                <select id="periodo" value={periodo}
                  onChange={(e) => {
                    setPeriodo(e.target.value);
                    setAvisoTerritorial("");
                    limpiar();
                  }}>
                  <option value="">Todos</option>
                  {periodos.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="acciones-filtros-indicadores">
              <button type="submit" className="boton-consultar-indicadores"
                disabled={cargando}>
                {cargando ? "Consultando..." : "Consultar"}
              </button>
              <button type="button" className="boton-limpiar-indicadores"
                onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            </div>
          </form>
        </section>

        <section className="resultados-indicadores" aria-live="polite">
          {estado === "vacio" && (
            <div className="estado-indicadores estado-inicial-indicadores">
              <div className="icono-estado-indicadores"><IconoBusqueda /></div>
              <h3>Selecciona los filtros para consultar</h3>
              <p>
                Define los criterios de búsqueda y pulsa{" "}
                <strong>Consultar</strong> para explorar la información.
              </p>
            </div>
          )}

          {estado === "cargando" && (
            <div className="estado-indicadores estado-cargando-indicadores">
              <div className="spinner-indicadores" />
              <h3>Consultando información</h3>
              <p>Estamos preparando los resultados de la consulta.</p>
            </div>
          )}

          {(estado === "error" || estado === "sin-datos-territoriales" ||
            estado === "sin-resultados") && (
            <div className="estado-indicadores estado-sin-resultados">
              <div className="icono-alerta-indicadores"><IconoAlerta /></div>
              <h3>
                {estado === "error"
                  ? "No fue posible completar la consulta"
                  : estado === "sin-datos-territoriales"
                  ? "Información territorial no disponible"
                  : "No se encontraron resultados"}
              </h3>
              <p>
                {estado === "error"
                  ? error
                  : estado === "sin-datos-territoriales"
                  ? avisoTerritorial
                  : "No hay información disponible para los criterios seleccionados."}
              </p>
            </div>
          )}

          {estado === "resultados" && (
            <>
              {mensaje && <p className="mensaje-resultado">{mensaje}</p>}
              <GraficoIndicadores datos={datos} />
              <TarjetasIndicadores datos={datos} />
            </>
          )}
        </section>
      </section>

      <footer className="pie-indicadores">
        <div className="pie-indicadores-contenido">
          <Link to="/app" className="marca-pie-indicadores">
            <img src={logoIcono} alt="" />
            <span>DATAVIDA</span>
          </Link>
          <p>
            Información para comprender la pobreza multidimensional
            en los territorios PDET de Colombia.
          </p>
        </div>
        <div className="pie-indicadores-final">
          Proyecto DATAVIDA · Proyecto Integrador II · UPB
        </div>
      </footer>
    </main>
  );
}
