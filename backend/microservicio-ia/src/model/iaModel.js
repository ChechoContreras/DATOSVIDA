/**
 * Modelos del Microservicio de Inteligencia Artificial.
 * Basado en el Diagrama de IA del documento de Arquitectura
 * Tecnológica (Prediction, Recommendation, PredictionModel).
 *
 * NOTA IMPORTANTE (alcance de este prototipo): no existe todavía un
 * modelo de machine learning entrenado ni datos históricos multi-año
 * reales. Este microservicio implementa un modelo heurístico simple
 * y determinístico (PredictionModel v1.0-heuristico) que sirve para
 * demostrar el flujo completo de RF-13/RF-14 (contrato de API,
 * validaciones, nivel de confianza, trazabilidad). Debe reemplazarse
 * por un modelo real cuando existan series históricas suficientes.
 */

/**
 * @typedef {Object} Prediction
 * @property {string} municipioCodigo
 * @property {number} indicadorId
 * @property {number} horizonte
 * @property {number} valorActual
 * @property {number} valorPredicho
 * @property {number} confianza
 * @property {boolean} apto
 * @property {string} versionModelo
 * @property {string[]} variablesRelevantes
 */

/**
 * @typedef {Object} Recommendation
 * @property {string} municipioCodigo
 * @property {number} indicadorId
 * @property {"alta"|"media"|"baja"} prioridad
 * @property {string} descripcion
 * @property {string} justificacion
 */

module.exports = { VERSION_MODELO: "v1.0-heuristico" };
