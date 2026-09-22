const indicadoresClient = require("../repository/indicadoresClient");
const repository = require("../repository/iaRepository");
const { VERSION_MODELO } = require("../model/iaModel");

const UMBRAL_CONFIANZA_MINIMO = 60;

/** Hash simple y determinístico para producir variación reproducible sin Math.random(). */
function hashTexto(texto) {
  let h = 0;
  for (let i = 0; i < texto.length; i++) {
    h = (h * 31 + texto.charCodeAt(i)) % 1000;
  }
  return h;
}

const VARIABLES_POR_DIMENSION = {
  Educación: ["Cobertura educativa histórica", "Tasa de deserción escolar", "Inversión en infraestructura educativa"],
  Trabajo: ["Tasa de informalidad histórica", "Dinámica del mercado laboral regional", "Nivel educativo de la población"],
  "Niñez y juventud": ["Cobertura de programas de primera infancia", "Tasa de trabajo infantil histórica"],
  "Vivienda y servicios públicos": ["Cobertura histórica de acueducto", "Inversión pública en infraestructura básica"],
};

/** RF-13 Generar predicciones mediante IA. */
async function generarPrediccion({ municipioCodigo, indicadorId, horizonte = 1 }) {
  if (!municipioCodigo || !indicadorId) {
    const error = new Error("Debes seleccionar un municipio y un indicador.");
    error.codigo = "PARAMETROS_INCOMPLETOS";
    throw error;
  }

  const valores = await indicadoresClient.consultarValoresIndicadores({ municipioCodigo, indicadorId });

  // Flujo Alternativo #1 de RF-13: no existen datos suficientes.
  if (valores.length === 0) {
    const error = new Error(
      "No existen datos suficientes para este municipio e indicador. No se puede generar la predicción."
    );
    error.codigo = "DATOS_INSUFICIENTES";
    throw error;
  }

  const dato = valores[0];
  const semilla = hashTexto(`${municipioCodigo}-${indicadorId}`);

  // Heurística determinística (ver nota del modelo en iaModel.js): la mayoría
  // de indicadores de privación tienden a mejorar levemente con el tiempo;
  // la semilla introduce variación reproducible entre municipios/indicadores.
  const tasaAnual = -0.4 - (semilla % 10) / 10; // entre -0.4 y -1.3 puntos/año
  let valorPredicho = dato.valor + tasaAnual * Number(horizonte);
  valorPredicho = Math.max(0, Math.min(100, valorPredicho));

  let confianza = 88 - Number(horizonte) * 6 - (semilla % 15);
  confianza = Math.max(35, Math.min(95, confianza));

  // Flujo Alternativo #2 de RF-13: el modelo no cumple el umbral mínimo de calidad.
  const apto = confianza >= UMBRAL_CONFIANZA_MINIMO;

  const resultado = {
    municipio: dato.municipio,
    indicador: dato.indicador,
    horizonte: Number(horizonte),
    valorActual: dato.valor,
    valorPredicho: Math.round(valorPredicho * 10) / 10,
    confianza: Math.round(confianza),
    apto,
    mensajeConfiabilidad: apto
      ? "Predicción con nivel de confianza aceptable."
      : "Confiabilidad baja: este resultado no debe presentarse como una recomendación definitiva.",
    versionModelo: VERSION_MODELO,
    variablesRelevantes:
      VARIABLES_POR_DIMENSION[dato.indicador.dimension] || ["Comportamiento histórico del indicador"],
  };

  repository.guardarPrediccion({ municipioCodigo, indicadorId, horizonte, resultado });
  return resultado;
}

/** RF-14 Consultar recomendaciones. */
async function obtenerRecomendaciones({ municipioCodigo, indicadorId }) {
  const valores = await indicadoresClient.consultarValoresIndicadores({ municipioCodigo, indicadorId });

  // Flujo Alternativo #2 de RF-14: no existe evidencia suficiente.
  if (valores.length === 0) {
    const error = new Error("No existe evidencia suficiente para generar una recomendación confiable.");
    error.codigo = "EVIDENCIA_INSUFICIENTE";
    throw error;
  }

  const recomendaciones = valores.map((dato) => {
    let prioridad = "baja";
    let descripcion = `Mantener el seguimiento del indicador "${dato.indicador.nombre}" en ${dato.municipio.nombre}.`;

    if (dato.valor >= 45) {
      prioridad = "alta";
      descripcion = `Priorizar intervención en "${dato.indicador.nombre}" (dimensión ${dato.indicador.dimension}) en ${dato.municipio.nombre}, dado su valor elevado.`;
    } else if (dato.valor >= 25) {
      prioridad = "media";
      descripcion = `Reforzar programas relacionados con "${dato.indicador.nombre}" en ${dato.municipio.nombre}.`;
    }

    const recomendacion = {
      municipio: dato.municipio,
      indicador: dato.indicador,
      prioridad,
      descripcion,
      justificacion: `Basado en un valor registrado de ${dato.valor}${dato.indicador.unidad} (${dato.periodo}, fuente ${dato.fuente}).`,
      fechaGeneracion: new Date().toISOString(),
    };

    repository.guardarRecomendacion({ municipioCodigo: dato.municipio.codigo, indicadorId: dato.indicador.id, recomendacion });
    return recomendacion;
  });

  return recomendaciones;
}

function obtenerHistorialPredicciones() {
  return repository.listarPredicciones();
}

function obtenerHistorialRecomendaciones() {
  return repository.listarRecomendaciones();
}

module.exports = {
  generarPrediccion,
  obtenerRecomendaciones,
  obtenerHistorialPredicciones,
  obtenerHistorialRecomendaciones,
};
