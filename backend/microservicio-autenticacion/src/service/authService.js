const repository = require("../repository/usuarioRepository");
const { verificarContrasena } = require("../util/passwordUtil");
const { generarToken, invalidarToken } = require("../util/tokenUtil");

/**
 * RF-01 Iniciar sesión.
 * Flujo básico + Alternativo #1 (credenciales inválidas) +
 * Alternativo #2 (cuenta inactiva/bloqueada).
 */
function iniciarSesion({ correo, contrasena }) {
  const usuario = repository.buscarPorCorreo(correo || "");

  // Mismo mensaje tanto si el correo no existe como si la contraseña
  // es incorrecta, para no revelar cuáles correos están registrados.
  if (!usuario || !verificarContrasena(contrasena || "", usuario.contrasenaHash)) {
    const error = new Error("Correo o contraseña incorrectos.");
    error.codigo = "CREDENCIALES_INVALIDAS";
    throw error;
  }

  if (usuario.estado !== "activo") {
    const error = new Error("La cuenta no está habilitada.");
    error.codigo = "CUENTA_INACTIVA";
    throw error;
  }

  const token = generarToken(usuario);

  return {
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
    },
  };
}

/** RF-16 Cerrar sesión: invalida el token para que no pueda reutilizarse. */
function cerrarSesion(token) {
  if (token) invalidarToken(token);
}

module.exports = { iniciarSesion, cerrarSesion };
