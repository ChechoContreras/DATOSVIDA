/**
 * Modelos de datos del Microservicio de Autenticación.
 * Estructura basada en el Diagrama de Autenticación del documento de
 * Arquitectura Tecnológica (Usuario, Rol, Sesión, TokenAutenticacion).
 *
 * NOTA: Prototipo sin base de datos (capa "Model" describe la forma
 * de los objetos; el almacenamiento real vive en Repository, en
 * memoria por ahora, y deberá migrar a PostgreSQL).
 */

/**
 * @typedef {"Administrador"|"Analista"|"Usuario"} Rol
 */

/**
 * @typedef {Object} Usuario
 * @property {number} id
 * @property {string} nombre
 * @property {string} correo
 * @property {string} contrasenaHash
 * @property {Rol} rol
 * @property {"activo"|"inactivo"} estado
 * @property {string} fechaCreacion
 */

module.exports = {};
