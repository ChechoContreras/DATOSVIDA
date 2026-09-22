const bcrypt = require("bcryptjs");

const RONDAS_SAL = 10;

function hashearContrasena(contrasenaPlana) {
  return bcrypt.hashSync(contrasenaPlana, RONDAS_SAL);
}

function verificarContrasena(contrasenaPlana, contrasenaHash) {
  return bcrypt.compareSync(contrasenaPlana, contrasenaHash);
}

module.exports = { hashearContrasena, verificarContrasena };
