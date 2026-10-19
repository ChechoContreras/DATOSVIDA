
const indicadoresClient = require("../repository/indicadoresClient");
const repository = require("../repository/iaRepository");

const {
  VERSION_MODELO,
  regresionLineal,
  predecir,
  correlacionPearson,
  clasificarFuerzaCorrelacion,
  calcularConfianza,
} = require("../model/iaModel");

/**
 * DATAVIDA - Microservicio de Inteligencia Artificial
 *
 * La API pública devuelve "territorio".
 * El microservicio utiliza internamente "municipio".
 *
 * Esta función normaliza ambas estructuras.
 */
function normalizarDato(dato) {
  const municipio = dato?.municipio || dato?.territorio;

  return {
    ...dato,
    municipio: municipio
      ? {
          ...municipio,
          departamento: municipio.departamento || "",
        }
      : null,
  };
}

function crearError(mensaje, codigo) {
  const error = new Error(mensaje);
  error.codigo = codigo;
  return error;
}

function validarParametros(municipioCodigo, indicadorId) {
  if (!municipioCodigo || !indicadorId) {
    throw crearError(
      "Debes seleccionar un municipio y un indicador.",
      "PARAMETROS_INCOMPLETOS"
    );
  }
}

const HORIZONTE_MAXIMO = 5;

function validarHorizonte(horizonte) {
  const horizonteNumerico = Number(horizonte);

  if (
    !Number.isInteger(horizonteNumerico) ||
    horizonteNumerico < 1 ||
    horizonteNumerico > HORIZONTE_MAXIMO
  ) {
    throw crearError(
      `El horizonte debe ser un número entero entre 1 y ${HORIZONTE_MAXIMO} años.`,
      "HORIZONTE_INVALIDO"
    );
  }

  return horizonteNumerico;
}

/**
 * Obtiene la serie histórica real de un indicador en un territorio
 * y ajusta la regresión lineal. Lo comparten las predicciones (RF-13)
 * y la simulación de escenarios.
 *
 * No se generan series históricas artificiales.
 */
async function prepararSerieTemporal(municipioCodigo, indicadorId) {
  validarParametros(municipioCodigo, indicadorId);

  const valores = (
    await indicadoresClient.consultarValoresIndicadores({
      municipioCodigo,
      indicadorId,
    })
  ).map(normalizarDato);

  if (valores.length === 0) {
    throw crearError(
      "No existen datos para el municipio e indicador seleccionados.",
      "DATOS_INSUFICIENTES"
    );
  }

  const seriePorAnio = new Map();

  for (const dato of valores) {
    const anio = Number(dato.periodo);
    const valor = Number(dato.valor);

    if (
      Number.isInteger(anio) &&
      Number.isFinite(valor)
    ) {
      seriePorAnio.set(anio, valor);
    }
  }

  const serieHistorica = [...seriePorAnio.entries()]
    .sort((a, b) => a[0] - b[0]);

  /**
   * Se requieren al menos 3 años reales diferentes
   * para realizar una regresión temporal preliminar.
   */
  if (serieHistorica.length < 3) {
    const territorio = valores[0].municipio?.nombre || "el territorio seleccionado";
    const periodos = serieHistorica.map(([anio]) => anio).join(", ");

    throw crearError(
      `Para ${territorio} solo hay ${serieHistorica.length} periodo(s) ` +
        `con datos reales (${periodos}). Una proyección temporal ` +
        "estadísticamente sustentada requiere al menos 3 periodos " +
        "anuales distintos. A nivel municipal DATAVIDA solo dispone " +
        "del corte censal 2018; la serie anual 2018-2025 está " +
        "disponible para el agregado PDET (PDET Colombia, cabeceras " +
        "y centros poblados/rural disperso). Selecciona uno de esos " +
        "territorios, o consulta el dato del municipio en el módulo " +
        "de Indicadores.",
      "SERIE_HISTORICA_INSUFICIENTE"
    );
  }

  const anios = serieHistorica.map(([anio]) => anio);
  const datos = serieHistorica.map(([, valor]) => valor);

  const regresion = regresionLineal(anios, datos);

  if (
    !regresion ||
    !Number.isFinite(regresion.r2)
  ) {
    throw crearError(
      "No fue posible calcular un modelo estadístico válido " +
        "con los datos históricos disponibles.",
      "MODELO_NO_VALIDO"
    );
  }

  const indicador = valores[0].indicador;

  return {
    valores,
    indicador,
    municipio: valores[0].municipio,
    serieHistorica,
    anios,
    datos,
    regresion,
  };
}

/**
 * RF-13: Predicciones mediante IA.
 *
 * Una predicción temporal requiere observaciones
 * históricas reales de un mismo indicador y municipio.
 */
async function generarPrediccion({
  municipioCodigo,
  indicadorId,
  horizonte = 1,
}) {
  validarParametros(municipioCodigo, indicadorId);

  const horizonteNumerico = validarHorizonte(horizonte);

  const { valores, serieHistorica, anios, datos, regresion } =
    await prepararSerieTemporal(municipioCodigo, indicadorId);

  const anioActual = anios[anios.length - 1];
  const valorActual = datos[datos.length - 1];

  const anioObjetivo = anioActual + horizonteNumerico;

  let valorPredicho = predecir(regresion, anioObjetivo);

  if (!Number.isFinite(valorPredicho)) {
    throw crearError(
      "El modelo no produjo una predicción numérica válida.",
      "PREDICCION_NO_VALIDA"
    );
  }

  /**
   * Los indicadores IPM expresados en porcentaje
   * deben mantenerse dentro del intervalo 0-100.
   */
  const indicador = valores[0].indicador;

  if (indicador.unidad === "%") {
    valorPredicho = Math.max(
      0,
      Math.min(100, valorPredicho)
    );
  }

  const confianzaCalculada = calcularConfianza({
    r2: regresion.r2,
    n: regresion.n,
    horizonte: horizonteNumerico,
    basadoEnDatoReal: true,
  });

  /**
   * La función heredada calcularConfianza genera
   * una puntuación interna del modelo.
   * No equivale a una probabilidad estadística
   * de acierto ni a un intervalo de confianza.
   */
  const puntuacionModelo = Number.isFinite(
    Number(confianzaCalculada)
  )
    ? Number(confianzaCalculada)
    : null;

  const resultado = {
    municipio: valores[0].municipio,
    indicador,
    horizonte: horizonteNumerico,
    anioActual,
    anioObjetivo,
    valorActual,
    valorPredicho:
      Math.round(valorPredicho * 10) / 10,
    r2: Math.round(regresion.r2 * 100) / 100,

    // Compatibilidad con la interfaz existente.
    confianza: puntuacionModelo,

    // No declarar confiabilidad estadística sin validación.
    apto: false,
    basadoEnDatoReal: true,
    serieHistorica: serieHistorica.map(
      ([anio, valor]) => ({ anio, valor })
    ),
    mensajeConfiabilidad:
      "Proyección exploratoria basada en observaciones " +
      "históricas reales. El modelo no cuenta todavía " +
      "con validación predictiva independiente. " +
      "La puntuación mostrada no representa una " +
      "probabilidad de acierto.",
    versionModelo: VERSION_MODELO,
    variablesRelevantes: [
      "Evolución temporal real del indicador",
    ],
  };

  repository.guardarPrediccion({
    municipioCodigo,
    indicadorId,
    horizonte: horizonteNumerico,
    resultado,
  });

  return resultado;
}

/**
 * RF-14: Recomendaciones basadas en los
 * valores observados de los indicadores.
 */
async function obtenerRecomendaciones({
  municipioCodigo,
  indicadorId,
} = {}) {
  const valores = (
    await indicadoresClient.consultarValoresIndicadores({
      municipioCodigo,
      indicadorId,
    })
  ).map(normalizarDato);

  if (valores.length === 0) {
    throw crearError(
      "No existe evidencia suficiente para generar recomendaciones.",
      "EVIDENCIA_INSUFICIENTE"
    );
  }

  const recomendaciones = valores
    .filter((dato) => dato.municipio && dato.indicador)
    .map((dato) => {
      const valor = Number(dato.valor);

      let prioridad = "baja";

      let descripcion =
        `Mantener el seguimiento del indicador ` +
        `"${dato.indicador.nombre}" en ` +
        `${dato.municipio.nombre}.`;

      if (valor >= 45) {
        prioridad = "alta";
        descripcion =
          `Priorizar el análisis del indicador ` +
          `"${dato.indicador.nombre}" en ` +
          `${dato.municipio.nombre}, dado su valor elevado.`;
      } else if (valor >= 25) {
        prioridad = "media";
        descripcion =
          `Reforzar el seguimiento del indicador ` +
          `"${dato.indicador.nombre}" en ` +
          `${dato.municipio.nombre}.`;
      }

      const recomendacion = {
        municipio: dato.municipio,
        indicador: dato.indicador,
        prioridad,
        descripcion,
        justificacion:
          `Basado en un valor registrado de ` +
          `${dato.valor}${dato.indicador.unidad || ""} ` +
          `(${dato.periodo}, fuente: ${dato.fuente}).`,
        fechaGeneracion: new Date().toISOString(),
      };

      repository.guardarRecomendacion({
        municipioCodigo: dato.municipio.codigo,
        indicadorId: dato.indicador.id,
        recomendacion,
      });

      return recomendacion;
    });

  return recomendaciones;
}

/**
 * Genera combinaciones únicas de indicadores.
 */
function combinacionesUnicas(ids) {
  const pares = [];

  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      pares.push([ids[i], ids[j]]);
    }
  }

  return pares;
}

/**
 * RF-13: Correlaciones de Pearson entre
 * indicadores de distintos municipios.
 */
async function calcularCorrelaciones({
  indicadorIdA,
  indicadorIdB,
} = {}) {
  const todos = (
    await indicadoresClient.consultarTodosLosValores()
  ).map(normalizarDato);

  if (todos.length === 0) {
    throw crearError(
      "No hay datos de indicadores registrados.",
      "DATOS_INSUFICIENTES"
    );
  }

  const porMunicipio = {};
  const catalogo = {};
  const nombresMunicipio = {};

  todos.forEach((dato) => {
    if (!dato.municipio || !dato.indicador) {
      return;
    }

    const codigo = dato.municipio.codigo;

    // Los agregados PDET (PDET-CO, PDET-CAB, PDET-CPRD) no son
    // municipios: se excluyen de la correlación entre municipios.
    if (String(codigo).startsWith("PDET-")) {
      return;
    }

    const idIndicador = Number(dato.indicador.id);
    const valor = Number(dato.valor);

    if (!Number.isFinite(valor)) {
      return;
    }

    if (!porMunicipio[codigo]) {
      porMunicipio[codigo] = {};
    }

    porMunicipio[codigo][idIndicador] = valor;
    catalogo[idIndicador] = dato.indicador;
    nombresMunicipio[codigo] = dato.municipio.nombre;
  });

  const idsCatalogo = Object.keys(catalogo).map(Number);

  const pares =
    indicadorIdA && indicadorIdB
      ? [
          [
            Number(indicadorIdA),
            Number(indicadorIdB),
          ],
        ]
      : combinacionesUnicas(idsCatalogo);

  const soloUnPar = Boolean(indicadorIdA && indicadorIdB);

  const correlaciones = pares.map(([a, b]) => {
    const xs = [];
    const ys = [];
    const puntos = [];

    Object.entries(porMunicipio).forEach(([codigo, municipio]) => {
      if (
        municipio[a] !== undefined &&
        municipio[b] !== undefined
      ) {
        xs.push(municipio[a]);
        ys.push(municipio[b]);
        puntos.push({
          codigo,
          nombre: nombresMunicipio[codigo] || codigo,
          x: municipio[a],
          y: municipio[b],
        });
      }
    });

    const r = correlacionPearson(xs, ys);

    return {
      // Los puntos por municipio solo se devuelven al consultar un par,
      // para el gráfico de dispersión del detalle.
      ...(soloUnPar ? { puntos } : {}),
      indicadorA: catalogo[a] || null,
      indicadorB: catalogo[b] || null,
      n: xs.length,
      r:
        r === null || !Number.isFinite(r)
          ? null
          : Math.round(r * 100) / 100,
      fuerza: clasificarFuerzaCorrelacion(r),
      advertencia:
        xs.length < 5
          ? `Muestra pequeña (n=${xs.length}). ` +
            "El resultado debe interpretarse con precaución."
          : "La correlación representa asociación estadística, " +
            "no demuestra causalidad.",
    };
  });

  const variablesPriorizadas = idsCatalogo
    .map((id) => {
      const rs = correlaciones
        .filter(
          (correlacion) =>
            correlacion.indicadorA?.id === id ||
            correlacion.indicadorB?.id === id
        )
        .map((correlacion) => correlacion.r)
        .filter(
          (r) => r !== null && Number.isFinite(r)
        );

      const asociacionPromedio = rs.length
        ? Math.round(
            (rs.reduce(
              (suma, r) => suma + Math.abs(r),
              0
            ) /
              rs.length) *
              100
          ) / 100
        : null;

      return {
        indicador: catalogo[id],

        // Nombre conservado por compatibilidad.
        impactoPromedio: asociacionPromedio,
      };
    })
    .sort(
      (a, b) =>
        (b.impactoPromedio ?? -1) -
        (a.impactoPromedio ?? -1)
    );

  return {
    municipiosAnalizados: Object.keys(porMunicipio).length,
    correlaciones,
    variablesPriorizadas,
  };
}

/**
 * Historial de predicciones.
 */
function obtenerHistorialPredicciones() {
  return repository.listarPredicciones();
}

/**
 * Historial de recomendaciones.
 */
function obtenerHistorialRecomendaciones() {
  return repository.listarRecomendaciones();
}

/**
 * Simulación de escenarios.
 *
 * Compara la TENDENCIA ACTUAL (regresión lineal sobre la serie real)
 * con un ESCENARIO HIPOTÉTICO que suma un cambio anual adicional,
 * elegido por la persona usuaria, a esa tendencia.
 *
 *   escenario(t) = tendencia(t) + ajusteAnual * t     (t = años desde el último dato)
 *
 * No predice el efecto real de una política: muestra qué pasaría con el
 * indicador si, además de su tendencia, cambiara cada año en esa cantidad.
 */
async function simularEscenario({
  municipioCodigo,
  indicadorId,
  horizonte = 3,
  ajusteAnual = 0,
}) {
  validarParametros(municipioCodigo, indicadorId);

  const horizonteNumerico = validarHorizonte(horizonte);
  const ajuste = Number(ajusteAnual);

  if (!Number.isFinite(ajuste) || Math.abs(ajuste) > 20) {
    throw crearError(
      "El cambio anual adicional debe ser un número entre -20 y 20.",
      "AJUSTE_INVALIDO"
    );
  }

  const { indicador, municipio, serieHistorica, anios, datos, regresion } =
    await prepararSerieTemporal(municipioCodigo, indicadorId);

  const anioActual = anios[anios.length - 1];
  const valorActual = datos[datos.length - 1];
  const esPorcentaje = indicador.unidad === "%";

  const limitar = (v) => (esPorcentaje ? Math.max(0, Math.min(100, v)) : v);
  const redondear = (v) => Math.round(v * 10) / 10;

  const tendencia = [{ anio: anioActual, valor: redondear(valorActual) }];
  const escenario = [{ anio: anioActual, valor: redondear(valorActual) }];

  for (let t = 1; t <= horizonteNumerico; t++) {
    const anio = anioActual + t;
    const base = limitar(predecir(regresion, anio));

    tendencia.push({ anio, valor: redondear(base) });
    escenario.push({ anio, valor: redondear(limitar(base + ajuste * t)) });
  }

  const finalTendencia = tendencia[tendencia.length - 1].valor;
  const finalEscenario = escenario[escenario.length - 1].valor;

  return {
    municipio,
    indicador,
    horizonte: horizonteNumerico,
    anioActual,
    anioObjetivo: anioActual + horizonteNumerico,
    ajusteAnual: ajuste,
    serieHistorica: serieHistorica.map(([anio, valor]) => ({ anio, valor })),
    tendencia,
    escenario,
    valorFinalTendencia: finalTendencia,
    valorFinalEscenario: finalEscenario,
    diferencia: redondear(finalEscenario - finalTendencia),
    r2: Math.round(regresion.r2 * 100) / 100,
    versionModelo: VERSION_MODELO,
    nota:
      "Escenario hipotético: suma a la tendencia estimada un cambio anual " +
      "adicional definido por la persona usuaria. No representa el efecto " +
      "real de una intervención ni una predicción validada.",
  };
} module.exports = {
  generarPrediccion,
  simularEscenario,

  obtenerRecomendaciones,
  calcularCorrelaciones,
  obtenerHistorialPredicciones,
  obtenerHistorialRecomendaciones,
};
