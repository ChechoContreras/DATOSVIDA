import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import logoDataVida from "../assets/logo-icono.png";
import {
  obtenerMunicipios,
  obtenerCatalogoIndicadores,
  obtenerPeriodos,
  consultarIndicadores,
} from "../services/indicadoresService";
import "../styles/Comparar.css";

const MAX_MUNICIPIOS = 4;
const PERIODO_INICIAL = "2018";

const OPCIONES_MENU = [
  { nombre: "Inicio", descripcion: "Resumen territorial", ruta: "/app", icono: "⌂" },
  { nombre: "Indicadores", descripcion: "Consulta de información", ruta: "/app/indicadores", icono: "▤" },
  { nombre: "Visualización", descripcion: "Exploración territorial", ruta: "/app/mapa", icono: "◫" },
  { nombre: "Comparar", descripcion: "Comparación de territorios", ruta: "/app/comparar", icono: "⇄" },
  { nombre: "Análisis estadístico", descripcion: "Relaciones y hallazgos", ruta: "/app/estadisticas", icono: "⌁" },
  { nombre: "Recomendaciones", descripcion: "Orientación para el territorio", ruta: "/app/recomendaciones", icono: "◇" },
  { nombre: "Reportes", descripcion: "Síntesis de resultados", ruta: "/app/reportes", icono: "▧" },
  { nombre: "Perfil", descripcion: "Mi cuenta", ruta: "/app/perfil", icono: "○" },
];

const COLORES_GRAFICA = ["#245047", "#b5793a", "#6d8b76", "#c9a878"];

function extraerLista(respuesta, clave) {
  if (Array.isArray(respuesta)) return respuesta;
  if (Array.isArray(respuesta?.[clave])) return respuesta[clave];
  if (Array.isArray(respuesta?.datos)) return respuesta.datos;
  if (Array.isArray(respuesta?.data)) return respuesta.data;
  if (Array.isArray(respuesta?.resultados)) return respuesta.resultados;
  if (Array.isArray(respuesta?.items)) return respuesta.items;
  return [];
}

function obtenerCodigo(municipio) {
  const codigo =
    municipio?.codigo ??
    municipio?.municipioCodigo ??
    municipio?.codigoDane ??
    municipio?.codigo_dane ??
    municipio?.id;

  return codigo === undefined || codigo === null ? "" : String(codigo);
}

function obtenerNombreMunicipio(municipio) {
  return (
    municipio?.nombre ??
    municipio?.municipioNombre ??
    municipio?.municipio ??
    municipio?.name ??
    "Municipio sin nombre"
  );
}

function obtenerDepartamento(municipio) {
  if (typeof municipio?.departamento === "string") {
    return municipio.departamento;
  }

  return (
    municipio?.departamento?.nombre ||
    municipio?.departamentoNombre ||
    municipio?.departamento_nombre ||
    "—"
  );
}

function obtenerIdIndicador(indicador) {
  const id =
    indicador?.id ??
    indicador?.indicadorId ??
    indicador?.indicador_id ??
    indicador?.codigo;

  return id === undefined || id === null ? "" : String(id);
}

function obtenerNombreUsuario(usuario) {
  return (
    usuario?.nombreCompleto ||
    usuario?.nombre ||
    usuario?.nombres ||
    usuario?.name ||
    usuario?.correo ||
    usuario?.email ||
    "Usuario"
  );
}

function obtenerIniciales(nombre) {
  if (!nombre || nombre === "Usuario") return "U";

  const partes = nombre.trim().split(/[\s@.]+/).filter(Boolean);

  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase();
  }

  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
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

function formato(numero) {
  return Number(numero).toLocaleString("es-CO", {
    maximumFractionDigits: 2,
  });
}

function obtenerPeriodosLista(respuesta) {
  const lista = extraerLista(respuesta, "periodos");

  const valores = lista
    .map((item) => {
      if (typeof item === "string" || typeof item === "number") {
        return String(item);
      }

      const valor =
        item?.periodo ??
        item?.anio ??
        item?.año ??
        item?.year ??
        item?.valor ??
        item?.nombre;

      return valor === undefined || valor === null
        ? ""
        : String(valor);
    })
    .filter((valor) => /^\d{4}$/.test(valor));

  return [...new Set(valores)].sort((a, b) => Number(b) - Number(a));
}

function obtenerRegistroIndicador(respuesta, indicadorId) {
  const registros = [
    ...extraerLista(respuesta, "indicadores"),
    ...extraerLista(respuesta, "resultados"),
    ...extraerLista(respuesta, "datos"),
  ];

  const lista = registros.length
    ? registros
    : Array.isArray(respuesta)
      ? respuesta
      : respuesta && typeof respuesta === "object"
        ? [respuesta]
        : [];

  const encontrado = lista.find((registro) => {
    const id =
      registro?.indicador?.id ??
      registro?.indicadorId ??
      registro?.indicador_id ??
      registro?.idIndicador;

    return id !== undefined && String(id) === String(indicadorId);
  });

  return encontrado || (lista.length === 1 ? lista[0] : null);
}

function obtenerValor(registro) {
  const original =
    registro?.valor ??
    registro?.valorIndicador ??
    registro?.valor_indicador ??
    registro?.resultado;

  if (original === null || original === undefined || original === "") {
    return null;
  }

  const numero = Number(original);
  return Number.isFinite(numero) ? numero : null;
}

function obtenerFuente(registro) {
  if (typeof registro?.fuente === "string") return registro.fuente;

  return (
    registro?.fuente?.nombre ||
    registro?.fuenteNombre ||
    registro?.fuente_nombre ||
    "Fuente no especificada por la API"
  );
}

function IconoBusqueda() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4.2 4.2" />
    </svg>
  );
}

function IconoFlecha() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m7 10 5 5 5-5" />
    </svg>
  );
}

function IconoComparar() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
      <path d="M8 4 4 7l4 3M16 14l4 3-4 3" />
    </svg>
  );
}

export default function Comparar() {
  const [municipios, setMunicipios] = useState([]);
  const [indicadores, setIndicadores] = useState([]);
  const [periodosDisponibles, setPeriodosDisponibles] = useState([
    PERIODO_INICIAL,
  ]);

  const [municipiosSeleccionados, setMunicipiosSeleccionados] = useState([]);
  const [indicadorId, setIndicadorId] = useState("");
  const [periodo, setPeriodo] = useState(PERIODO_INICIAL);

  const [busqueda, setBusqueda] = useState("");
  const [busquedaTerritorio, setBusquedaTerritorio] = useState("");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [comparacionRealizada, setComparacionRealizada] = useState(false);

  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
  const [cargandoResultados, setCargandoResultados] = useState(false);
  const [errorCatalogos, setErrorCatalogos] = useState("");
  const [errorComparacion, setErrorComparacion] = useState("");
  const [resultados, setResultados] = useState([]);

  const [usuario] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("datavida_usuario")) || {};
    } catch {
      return {};
    }
  });

  const nombreUsuario = obtenerNombreUsuario(usuario);
  const iniciales = obtenerIniciales(nombreUsuario);

  useEffect(() => {
    let activo = true;

    async function cargarCatalogos() {
      setCargandoCatalogos(true);
      setErrorCatalogos("");

      try {
        const [respuestaMunicipios, respuestaIndicadores, respuestaPeriodos] =
          await Promise.all([
            obtenerMunicipios(),
            obtenerCatalogoIndicadores(),
            obtenerPeriodos().catch((error) => {
              console.error("No fue posible cargar los periodos:", error);
              return [];
            }),
          ]);

        if (!activo) return;

        const listaMunicipios = extraerLista(
          respuestaMunicipios,
          "municipios"
        ).filter((municipio) => obtenerCodigo(municipio));

        const listaIndicadores = extraerLista(
          respuestaIndicadores,
          "indicadores"
        ).filter((indicador) => obtenerIdIndicador(indicador));

        const listaPeriodos = obtenerPeriodosLista(respuestaPeriodos);

        setMunicipios(listaMunicipios);
        setIndicadores(listaIndicadores);

        const periodos = listaPeriodos.length
          ? listaPeriodos
          : [PERIODO_INICIAL];

        setPeriodosDisponibles(periodos);
        setPeriodo((actual) =>
          periodos.includes(actual)
            ? actual
            : periodos.includes(PERIODO_INICIAL)
              ? PERIODO_INICIAL
              : periodos[0]
        );

        if (listaMunicipios.length === 0) {
          setErrorCatalogos(
            "El servicio respondió, pero no se encontraron municipios en el formato esperado."
          );
        } else if (listaIndicadores.length === 0) {
          setErrorCatalogos(
            "No se encontraron indicadores disponibles en el catálogo."
          );
        }
      } catch (error) {
        if (!activo) return;

        console.error("Error cargando catálogos de comparación:", error);

        setErrorCatalogos(
          error?.response?.data?.mensaje ||
            error?.message ||
            "No fue posible cargar los municipios o indicadores del backend."
        );
      } finally {
        if (activo) setCargandoCatalogos(false);
      }
    }

    cargarCatalogos();

    return () => {
      activo = false;
    };
  }, []);

  const municipiosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase("es");

    return municipios.filter((municipio) => {
      const nombre = obtenerNombreMunicipio(municipio);
      const departamento = obtenerDepartamento(municipio);
      const codigo = obtenerCodigo(municipio);

      return `${nombre} ${departamento} ${codigo}`
        .toLocaleLowerCase("es")
        .includes(termino);
    });
  }, [municipios, busqueda]);

  const resultadosBusquedaSuperior = useMemo(() => {
    const termino = busquedaTerritorio.trim().toLocaleLowerCase("es");

    if (!termino) return [];

    return municipios
      .filter((municipio) =>
        `${obtenerNombreMunicipio(municipio)} ${obtenerDepartamento(municipio)} ${obtenerCodigo(municipio)}`
          .toLocaleLowerCase("es")
          .includes(termino)
      )
      .slice(0, 6);
  }, [municipios, busquedaTerritorio]);

  const indicadorSeleccionado = indicadores.find(
    (indicador) => obtenerIdIndicador(indicador) === String(indicadorId)
  );

  const unidad = obtenerUnidad(indicadorSeleccionado);

  const resultadosValidos = resultados.filter(
    (resultado) => resultado.valor !== null
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
    ...resultadosValidos.map((resultado) => resultado.valor)
  );

  function invalidarResultados() {
    setComparacionRealizada(false);
    setResultados([]);
    setErrorComparacion("");
  }

  function cambiarMunicipio(municipio) {
    const codigo = obtenerCodigo(municipio);
    if (!codigo) return;

    setMunicipiosSeleccionados((actuales) => {
      const existe = actuales.some((item) => item.codigo === codigo);

      if (existe) {
        return actuales.filter((item) => item.codigo !== codigo);
      }

      if (actuales.length >= MAX_MUNICIPIOS) return actuales;

      return [
        ...actuales,
        {
          codigo,
          nombre: obtenerNombreMunicipio(municipio),
          departamento: obtenerDepartamento(municipio),
        },
      ];
    });

    invalidarResultados();
  }

  function quitarMunicipio(codigo) {
    setMunicipiosSeleccionados((actuales) =>
      actuales.filter((item) => item.codigo !== codigo)
    );

    invalidarResultados();
  }

  function limpiarSeleccion() {
    setMunicipiosSeleccionados([]);
    setBusqueda("");
    setBusquedaTerritorio("");
    invalidarResultados();
  }

  async function realizarComparacion() {
    if (municipiosSeleccionados.length < 2) {
      setErrorComparacion("Selecciona al menos dos municipios.");
      return;
    }

    if (!indicadorId) {
      setErrorComparacion("Selecciona un indicador para comparar.");
      return;
    }

    if (!periodo) {
      setErrorComparacion("Selecciona un periodo de análisis.");
      return;
    }

    setCargandoResultados(true);
    setErrorComparacion("");
    setResultados([]);
    setComparacionRealizada(false);

    try {
      const comparaciones = await Promise.all(
        municipiosSeleccionados.map(async (municipio) => {
          const respuesta = await consultarIndicadores({
            municipioCodigo: municipio.codigo,
            indicadorId,
            periodo,
          });

          const registro = obtenerRegistroIndicador(
            respuesta,
            indicadorId
          );

          return {
            ...municipio,
            valor: obtenerValor(registro),
            fuente: registro ? obtenerFuente(registro) : "—",
          };
        })
      );

      setResultados(comparaciones);
      setComparacionRealizada(true);
    } catch (error) {
      console.error("Error consultando la comparación:", error);

      setErrorComparacion(
        error?.response?.data?.mensaje ||
          error?.message ||
          "No fue posible consultar los datos de la comparación."
      );
    } finally {
      setCargandoResultados(false);
    }
  }

  function agregarDesdeBusqueda(municipio) {
    const codigo = obtenerCodigo(municipio);
    if (!codigo) return;

    const existe = municipiosSeleccionados.some(
      (item) => item.codigo === codigo
    );

    if (!existe && municipiosSeleccionados.length < MAX_MUNICIPIOS) {
      setMunicipiosSeleccionados((actuales) => [
        ...actuales,
        {
          codigo,
          nombre: obtenerNombreMunicipio(municipio),
          departamento: obtenerDepartamento(municipio),
        },
      ]);

      invalidarResultados();
    }

    setBusquedaTerritorio("");
  }

  return (
    <main className="pagina-comparar" id="comparar">
      <section className="hero-comparar">
        <img
          className="hero-comparar-imagen"
          src="https://sensorial.coffee/cdn/shop/articles/10.png?v=1791889602&width=1600"
          alt="Paisaje natural de montañas y vegetación"
        />

        <div className="hero-comparar-degradado" />

        <header className="barra-superior-comparar">
          <Link
            to="/app"
            className="marca-comparar"
            aria-label="Ir al inicio de DATAVIDA"
          >
            <img src={logoDataVida} alt="" />
            <span>DATAVIDA</span>
          </Link>

          <div className="acciones-superiores-comparar">
            <div className="contenedor-busqueda-superior">
              <label className="busqueda-territorio-comparar">
                <span className="icono-busqueda-comparar">
                  <IconoBusqueda />
                </span>

                <input
                  type="search"
                  value={busquedaTerritorio}
                  onChange={(evento) =>
                    setBusquedaTerritorio(evento.target.value)
                  }
                  placeholder="Buscar territorio"
                  aria-label="Buscar territorio"
                />
              </label>

              {busquedaTerritorio.trim() && (
                <div className="resultados-busqueda-superior">
                  {resultadosBusquedaSuperior.length ? (
                    resultadosBusquedaSuperior.map((municipio) => {
                      const codigo = obtenerCodigo(municipio);
                      const seleccionado = municipiosSeleccionados.some(
                        (item) => item.codigo === codigo
                      );

                      return (
                        <button
                          type="button"
                          key={codigo}
                          onClick={() => agregarDesdeBusqueda(municipio)}
                          disabled={
                            !seleccionado &&
                            municipiosSeleccionados.length >= MAX_MUNICIPIOS
                          }
                        >
                          <strong>{obtenerNombreMunicipio(municipio)}</strong>
                          <small>{obtenerDepartamento(municipio)}</small>
                        </button>
                      );
                    })
                  ) : (
                    <p>No se encontraron municipios.</p>
                  )}
                </div>
              )}
            </div>

            <Link
              to="/app/perfil"
              className="boton-perfil-comparar"
              aria-label={`Ver perfil de ${nombreUsuario}`}
              title={nombreUsuario}
            >
              {iniciales}
            </Link>

            <button
              type="button"
              className={`boton-menu-comparar ${menuAbierto ? "activo" : ""}`}
              aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuAbierto}
              onClick={() => setMenuAbierto((abierto) => !abierto)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </header>

        {menuAbierto && (
          <>
            <button
              type="button"
              className="fondo-menu-comparar"
              aria-label="Cerrar menú"
              onClick={() => setMenuAbierto(false)}
            />

            <nav className="menu-desplegable-comparar" aria-label="Menú principal">
              <div className="menu-encabezado-comparar">
                <span>MENÚ PRINCIPAL</span>
                <button
                  type="button"
                  onClick={() => setMenuAbierto(false)}
                  aria-label="Cerrar menú"
                >
                  ×
                </button>
              </div>

              <div className="menu-usuario-comparar">
                <div className="menu-avatar-comparar">{iniciales}</div>
                <div>
                  <strong>{nombreUsuario}</strong>
                  <span>Sesión activa</span>
                </div>
              </div>

              <div className="menu-enlaces-comparar">
                {OPCIONES_MENU.map((opcion) => (
                  <Link
                    key={opcion.nombre}
                    to={opcion.ruta}
                    className={`enlace-menu-comparar ${
                      opcion.ruta === "/app/comparar" ? "activo" : ""
                    }`}
                    onClick={() => setMenuAbierto(false)}
                    aria-current={
                      opcion.ruta === "/app/comparar" ? "page" : undefined
                    }
                  >
                    <span className="enlace-menu-icono-comparar">
                      {opcion.icono}
                    </span>

                    <span className="enlace-menu-texto-comparar">
                      <strong>{opcion.nombre}</strong>
                      <small>{opcion.descripcion}</small>
                    </span>

                    <span className="enlace-menu-flecha-comparar">›</span>
                  </Link>
                ))}
              </div>

              <div className="menu-pie-comparar">
                <span>DATAVIDA</span>
                <small>DATAVIDA · DATOS CON PROPÓSITO</small>
              </div>
            </nav>
          </>
        )}

        <div className="hero-comparar-contenido">
          <span className="etiqueta-hero-comparar">
            ANÁLISIS COMPARATIVO
          </span>

          <h1>Comparación de municipios PDET</h1>

          <p>
            Contrasta las condiciones territoriales y los indicadores de
            pobreza multidimensional para comprender las diferencias y
            necesidades de cada municipio.
          </p>
        </div>
      </section>

      <section className="contenido-comparar">
        <div className="bloque-seccion-comparar">
          <header className="encabezado-externo-comparar">
            <span className="sobrelinea-seccion-comparar">
              SELECCIÓN TERRITORIAL
            </span>
            <h2>Municipios a comparar</h2>
            <p>
              Selecciona entre dos y cuatro municipios para preparar la
              comparación.
            </p>
          </header>

          <section className="panel-seleccion-comparar">
            <div className="encabezado-panel-comparar">
              <div>
                <h2>Municipios a comparar</h2>
                <p>
                  Selecciona entre dos y cuatro municipios para preparar la
                  comparación.
                </p>
              </div>

              <span className="contador-comparar">
                {municipiosSeleccionados.length} de {MAX_MUNICIPIOS}
              </span>
            </div>

            <label
              className="etiqueta-campo-comparar"
              htmlFor="buscar-municipio"
            >
              Buscar municipio
            </label>

            <div className="entrada-busqueda-municipios">
              <IconoBusqueda />
              <input
                id="buscar-municipio"
                type="search"
                placeholder="Escribe el municipio o departamento..."
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
              />
            </div>

            {cargandoCatalogos ? (
              <p className="mensaje-vacio-comparar">
                Cargando municipios desde el backend...
              </p>
            ) : errorCatalogos ? (
              <p className="mensaje-vacio-comparar" role="alert">
                {errorCatalogos}
              </p>
            ) : (
              <div className="lista-municipios-comparar">
                {municipiosFiltrados.length ? (
                  municipiosFiltrados.map((municipio) => {
                    const codigo = obtenerCodigo(municipio);
                    const seleccionado = municipiosSeleccionados.some(
                      (item) => item.codigo === codigo
                    );

                    return (
                      <label
                        className={`opcion-municipio-comparar ${
                          seleccionado ? "seleccionado" : ""
                        }`}
                        key={codigo}
                      >
                        <input
                          type="checkbox"
                          checked={seleccionado}
                          disabled={
                            !seleccionado &&
                            municipiosSeleccionados.length >= MAX_MUNICIPIOS
                          }
                          onChange={() => cambiarMunicipio(municipio)}
                        />

                        <span className="casilla-visual-comparar">
                          {seleccionado ? "✓" : ""}
                        </span>

                        <span className="datos-municipio-comparar">
                          <strong>{obtenerNombreMunicipio(municipio)}</strong>
                          <span>{obtenerDepartamento(municipio)}</span>
                        </span>
                      </label>
                    );
                  })
                ) : (
                  <div className="sin-resultados-comparar">
                    No se encontraron municipios con esa búsqueda.
                  </div>
                )}
              </div>
            )}

            <div className="pie-seleccion-comparar">
              <span>
                {municipiosSeleccionados.length < 2
                  ? "Selecciona al menos dos municipios."
                  : "Ya puedes preparar la comparación."}
              </span>

              <button
                type="button"
                className="boton-texto-comparar"
                onClick={limpiarSeleccion}
                disabled={
                  !municipiosSeleccionados.length || cargandoResultados
                }
              >
                Limpiar selección
              </button>
            </div>
          </section>
        </div>

        <div className="bloque-seccion-comparar">
          <header className="encabezado-externo-comparar">
            <span className="sobrelinea-seccion-comparar">
              PARÁMETROS DE ANÁLISIS
            </span>
            <h2>Configurar comparación</h2>
            <p>
              Define el indicador y el periodo, y revisa los municipios
              elegidos antes de continuar.
            </p>
          </header>

          <section className="panel-filtros-comparar">
            <div className="encabezado-panel-comparar">
              <div>
                <h2>Configurar comparación</h2>
                <p>
                  Selecciona los parámetros que quieres consultar en el
                  backend.
                </p>
              </div>
            </div>

            <label
              className="etiqueta-campo-comparar"
              htmlFor="indicador-comparar"
            >
              Indicador
            </label>

            <div className="selector-periodo-comparar">
              <select
                id="indicador-comparar"
                value={indicadorId}
                onChange={(evento) => {
                  setIndicadorId(evento.target.value);
                  invalidarResultados();
                }}
                disabled={cargandoCatalogos || indicadores.length === 0}
              >
                <option value="">Selecciona un indicador</option>
                {indicadores.map((indicador) => (
                  <option
                    key={obtenerIdIndicador(indicador)}
                    value={obtenerIdIndicador(indicador)}
                  >
                    {indicador.nombre ||
                      indicador.nombreIndicador ||
                      indicador.descripcion ||
                      `Indicador ${obtenerIdIndicador(indicador)}`}
                  </option>
                ))}
              </select>
              <IconoFlecha />
            </div>

            <label
              className="etiqueta-campo-comparar"
              htmlFor="periodo"
              style={{ marginTop: 20 }}
            >
              Periodo de análisis
            </label>

            <div className="selector-periodo-comparar">
              <select
                id="periodo"
                value={periodo}
                onChange={(evento) => {
                  setPeriodo(evento.target.value);
                  invalidarResultados();
                }}
                disabled={cargandoCatalogos}
              >
                {periodosDisponibles.map((anio) => (
                  <option key={anio} value={anio}>
                    {anio}
                  </option>
                ))}
              </select>
              <IconoFlecha />
            </div>

            <div className="resumen-municipios-comparar">
              <h3>Municipios seleccionados</h3>

              {!municipiosSeleccionados.length ? (
                <p className="mensaje-vacio-comparar">
                  Los municipios que selecciones aparecerán aquí.
                </p>
              ) : (
                <div className="etiquetas-municipios-comparar">
                  {municipiosSeleccionados.map((item) => (
                    <div
                      className="etiqueta-municipio-seleccionado"
                      key={item.codigo}
                    >
                      <span>
                        <strong>{item.nombre}</strong>
                        <small>{item.departamento}</small>
                      </span>

                      <button
                        type="button"
                        aria-label={`Quitar ${item.nombre}`}
                        onClick={() => quitarMunicipio(item.codigo)}
                        disabled={cargandoResultados}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="boton-comparar-principal"
              disabled={
                cargandoCatalogos ||
                cargandoResultados ||
                municipiosSeleccionados.length < 2 ||
                !indicadorId
              }
              onClick={realizarComparacion}
            >
              <IconoComparar />
              {cargandoResultados
                ? "Consultando datos..."
                : "Comparar municipios"}
            </button>

            <p className="nota-comparar">
              Los resultados se consultan mediante el servicio de indicadores
              de DATAVIDA.
            </p>

            {errorComparacion && (
              <p className="mensaje-vacio-comparar" role="alert">
                {errorComparacion}
              </p>
            )}
          </section>
        </div>

        {cargandoResultados && (
          <section className="bloque-seccion-comparar">
            <div className="resultados-comparar">
              <h2>Consultando datos oficiales...</h2>
              <p>
                Estamos consultando el indicador seleccionado para cada
                municipio.
              </p>
            </div>
          </section>
        )}

        {comparacionRealizada && (
          <>
            <div className="bloque-seccion-comparar bloque-resultados-comparar">
              <header className="encabezado-externo-comparar">
                <span className="sobrelinea-seccion-comparar">
                  SÍNTESIS TERRITORIAL
                </span>
                <h2>Resumen de la comparación</h2>
                <p>
                  Resultados del indicador seleccionado para el periodo{" "}
                  {periodo}.
                </p>
              </header>

              <section className="resultados-comparar">
                <div className="encabezado-resultados-comparar">
                  <div>
                    <h2>Resumen de la comparación</h2>
                    <p>
                      {indicadorSeleccionado?.nombre ||
                        indicadorSeleccionado?.nombreIndicador ||
                        "Indicador seleccionado"}
                      {" · Periodo "}
                      {periodo}
                    </p>
                  </div>

                  <span className="estado-resultados-comparar">
                    Datos consultados
                  </span>
                </div>

                <div className="tarjetas-resultados-comparar">
                  {resultados.map((resultado) => (
                    <article
                      className="tarjeta-resultado-comparar"
                      key={resultado.codigo}
                    >
                      <h3>{resultado.nombre}</h3>
                      <p>{resultado.departamento}</p>
                      <div className="linea-resultado-comparar" />
                      <span className="periodo-resultado-comparar">
                        {resultado.valor === null
                          ? "Sin datos disponibles"
                          : `${formato(resultado.valor)} ${unidad}`}
                      </span>
                    </article>
                  ))}
                </div>

                <p className="aclaracion-resultados-comparar">
                  Los valores corresponden a las respuestas del servicio de
                  indicadores. Los municipios sin valor se muestran sin datos
                  disponibles.
                </p>
              </section>
            </div>

            <div className="bloque-seccion-comparar bloque-grafico-comparar">
              <header className="encabezado-externo-comparar">
                <span className="sobrelinea-seccion-comparar">RESULTADOS</span>
                <h2>Visualización comparativa</h2>
                <p>
                  {indicadorSeleccionado?.nombre ||
                    indicadorSeleccionado?.nombreIndicador ||
                    "Indicador seleccionado"}
                  {" · Periodo "}
                  {periodo}
                </p>
              </header>

              <section
                className="grafico-comparativo"
                aria-label="Gráfico comparativo de indicadores"
              >
                <div className="encabezado-grafico">
                  <div>
                    <h2>Comparación por municipio</h2>
                    <p>Valores obtenidos del backend</p>
                  </div>
                  <span className="etiqueta-ilustrativa">
                    Datos consultados
                  </span>
                </div>

                <div className="grafico-barras">
                  {resultados.map((resultado, indice) => {
                    const ancho =
                      resultado.valor === null
                        ? 0
                        : Math.max(
                            0,
                            Math.min(
                              100,
                              (resultado.valor / maximoGrafica) * 100
                            )
                          );

                    return (
                      <div className="fila-grafico" key={resultado.codigo}>
                        <div className="etiqueta-barra">
                          <div>
                            <strong>{resultado.nombre}</strong>
                            <small>{resultado.departamento}</small>
                          </div>
                        </div>

                        <div className="pista-barra">
                          <div
                            className="barra-valor"
                            style={{
                              width: `${ancho}%`,
                              backgroundColor:
                                COLORES_GRAFICA[
                                  indice % COLORES_GRAFICA.length
                                ],
                            }}
                          />
                        </div>

                        <span className="valor-ilustrativo">
                          {resultado.valor === null
                            ? "Sin datos"
                            : `${formato(resultado.valor)} ${unidad}`}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {resultadosValidos.length === 0 && (
                  <p className="aviso-grafico">
                    El servicio no devolvió valores numéricos para esta
                    selección. Revisa el indicador, el periodo y la respuesta
                    del backend.
                  </p>
                )}
              </section>
            </div>

            <div className="bloque-seccion-comparar">
              <header className="encabezado-externo-comparar">
                <span className="sobrelinea-seccion-comparar">
                  DETALLE DE DATOS
                </span>
                <h2>Tabla comparativa</h2>
                <p>Consulta los valores y las fuentes reportadas por el servicio.</p>
              </header>

              <section className="resultados-comparar">
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
                      {resultados.map((resultado) => (
                        <tr key={resultado.codigo}>
                          <td>{resultado.nombre}</td>
                          <td>{resultado.departamento}</td>
                          <td>
                            {resultado.valor === null
                              ? "Sin datos"
                              : `${formato(resultado.valor)} ${unidad}`}
                          </td>
                          <td>{periodo}</td>
                          <td>
                            {resultado.valor === null
                              ? "—"
                              : resultado.fuente}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {resultadosValidos.length >= 2 && (
                  <div className="mensaje-resultado">
                    <h3>Resumen de la comparación</h3>

                    <p style={{ marginTop: 14 }}>
                      <strong>Valor más alto:</strong> {valorMayor.nombre} (
                      {formato(valorMayor.valor)} {unidad})
                    </p>

                    <p>
                      <strong>Valor más bajo:</strong> {valorMenor.nombre} (
                      {formato(valorMenor.valor)} {unidad})
                    </p>

                    <p>
                      <strong>Diferencia:</strong> {formato(diferencia)}{" "}
                      {unidad.trim() === "%" ||
                      unidad.toLowerCase().includes("porcentaje")
                        ? "puntos porcentuales"
                        : unidad}
                    </p>
                  </div>
                )}

                {resultadosValidos.length === 0 && (
                  <p className="aclaracion-resultados-comparar">
                    No hay valores disponibles para calcular diferencias.
                  </p>
                )}

                {resultadosValidos.length === 1 && (
                  <p className="aclaracion-resultados-comparar">
                    Solo un municipio tiene un valor disponible. Se necesitan
                    al menos dos para calcular una diferencia.
                  </p>
                )}
              </section>
            </div>
          </>
        )}
      </section>

      <footer className="footer-comparar">
        <Link to="/app" className="marca-footer-comparar">
          <img src={logoDataVida} alt="" />
          <span>DATAVIDA</span>
        </Link>

        <p>
          Información para comprender la pobreza multidimensional en los
          territorios PDET de Colombia.
        </p>

        <span className="creditos-footer-comparar">
          DATAVIDA · DATOS CON PROPÓSITO · Proyecto Integrador II · UPB
        </span>
      </footer>
    </main>
  );
}
