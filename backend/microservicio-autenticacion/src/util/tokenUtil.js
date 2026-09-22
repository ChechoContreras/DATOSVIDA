const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRACION } = require("../config/jwtConfig");

/**
 * Lista negra en memoria de tokens invalidados por "Cerrar sesión" (RF-16).
 * En una implementación real esto viviría en una base de datos o caché
 * compartida (Redis) entre instancias del microservicio.
 */
const tokensInvalidados = new Set();

function generarToken(usuario) {
  return jwt.sign(
    {
      sub: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRACION }
  );
}

function verificarToken(token) {
  if (tokensInvalidados.has(token)) {
    throw new Error("Token invalidado (sesión cerrada)");
  }
  return jwt.verify(token, JWT_SECRET);
}

function invalidarToken(token) {
  tokensInvalidados.add(token);
}

module.exports = { generarToken, verificarToken, invalidarToken };
