
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

/**
 * RF-13: Predicciones mediante IA.
 *
 * Una predicción temporal requiere observaciones
 * históricas reales de un mismo indicador y municipio.
 *
 * No se generan series históricas artificiales.
 */
async function generarPrediccion({
  municipioCodigo,
  indicadorId,
  horizonte = 1,
}) {
  validarParametros(municipioCodigo, indicadorId);

  const horizonteNumerico = Number(horizonte);

  if (
    !Number.isInteger(horizonteNumerico) ||
    horizonteNumerico < 1 ||
    horizonteNumerico > 10
  ) {
    throw crearError(
      "El horizonte debe ser un número entero entre 1 y 10 años.",
      "HORIZONTE_INVALIDO"
    );
  }

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
    throw crearError(
      "DATAVIDA dispone actualmente de información censal de 2018 " +
        "para este municipio e indicador. No existen suficientes " +
        "años históricos reales para generar una predicción temporal " +
        "estadísticamente sustentada. Se requieren al menos " +
        "3 periodos anuales diferentes. El dato de 2018 puede " +
        "consultarse en el módulo de indicadores.",
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

  todos.forEach((dato) => {
    if (!dato.municipio || !dato.indicador) {
      return;
    }

    const codigo = dato.municipio.codigo;
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

  const correlaciones = pares.map(([a, b]) => {
    const xs = [];
    const ys = [];

    Object.values(porMunicipio).forEach((municipio) => {
      if (
        municipio[a] !== undefined &&
        municipio[b] !== undefined
      ) {
        xs.push(municipio[a]);
        ys.push(municipio[b]);
      }
    });

    const r = correlacionPearson(xs, ys);

    return {
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

module.exports = {
  generarPrediccion,
  obtenerRecomendaciones,
  calcularCorrelaciones,
  obtenerHistorialPredicciones,
  obtenerHistorialRecomendaciones,
};
