/**
 * Configuración del token JWT.
 *
 * IMPORTANTE: en un entorno real, JWT_SECRET debe venir de una variable
 * de entorno (process.env.JWT_SECRET) y nunca quedar escrito en el
 * código fuente. Aquí se deja un valor fijo únicamente para que el
 * prototipo funcione de inmediato sin configuración adicional.
 */
module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || "datavida-secreto-de-prototipo-cambiar-en-produccion",
  JWT_EXPIRACION: "2h",
};
