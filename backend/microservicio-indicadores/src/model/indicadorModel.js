/**
 * Modelos de datos del Microservicio de Indicadores.
 * Estructura basada en el Diagrama de Indicadores del documento de
 * Arquitectura Tecnológica (Municipio, Indicador, ValorIndicador).
 *
 * NOTA: Esta es la capa "Model" en modo prototipo (sin base de datos).
 * Cuando se conecte PostgreSQL/PostGIS, estas mismas formas de objeto
 * deben coincidir con las tablas reales.
 */

/**
 * @typedef {Object} Municipio
 * @property {string} codigo
 * @property {string} nombre
 * @property {string} subregion
 * @property {string} departamento
 */

/**
 * @typedef {Object} Indicador
 * @property {number} id
 * @property {string} nombre
 * @property {string} unidad
 * @property {string} dimension
 */

/**
 * @typedef {Object} ValorIndicador
 * @property {number} id
 * @property {string} municipioCodigo
 * @property {number} indicadorId
 * @property {string} periodo
 * @property {number} valor
 * @property {string} fuente
 * @property {string} fechaActualizacion
 */

module.exports = {};
