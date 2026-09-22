const repository = require("../repository/usuarioRepository");

function quitarContrasena(usuario) {
  if (!usuario) return usuario;
  const { contrasenaHash, ...resto } = usuario;
  return resto;
}

/** RF-03 Consultar usuario (listado, con búsqueda opcional). */
function listarUsuarios(filtros) {
  return repository.listar(filtros).map(quitarContrasena);
}

function obtenerUsuario(id) {
  return quitarContrasena(repository.buscarPorId(id));
}

/** RF-02 Crear usuario. */
function crearUsuario({ nombre, correo, contrasena, rol }, ejecutadoPor) {
  if (!nombre || !correo || !contrasena || !rol) {
    const error = new Error("Todos los campos son obligatorios (nombre, correo, contraseña, rol).");
    error.codigo = "DATOS_INCOMPLETOS";
    throw error;
  }

  if (repository.buscarPorCorreo(correo)) {
    const error = new Error("El correo ya se encuentra registrado.");
    error.codigo = "CORREO_DUPLICADO";
    throw error;
  }

  const nuevo = repository.crear({ nombre, correo, contrasena, rol });
  repository.registrarAuditoria({
    accion: "CREAR_USUARIO",
    usuarioObjetivoId: nuevo.id,
    ejecutadoPor,
  });
  return quitarContrasena(nuevo);
}

/** RF-04 Actualizar usuario. */
function actualizarUsuario(id, cambios, ejecutadoPor) {
  const existente = repository.buscarPorId(id);
  if (!existente) {
    const error = new Error("El usuario no existe.");
    error.codigo = "NO_ENCONTRADO";
    throw error;
  }

  if (cambios.correo) {
    const otro = repository.buscarPorCorreo(cambios.correo);
    if (otro && otro.id !== Number(id)) {
      const error = new Error("El correo ya se encuentra registrado por otro usuario.");
      error.codigo = "CORREO_DUPLICADO";
      throw error;
    }
  }

  const actualizado = repository.actualizar(id, cambios);
  repository.registrarAuditoria({
    accion: "ACTUALIZAR_USUARIO",
    usuarioObjetivoId: Number(id),
    ejecutadoPor,
  });
  return quitarContrasena(actualizado);
}

/** RF-05 Activar/Desactivar usuario. */
function cambiarEstadoUsuario(id, activo, solicitante) {
  const objetivo = repository.buscarPorId(id);
  if (!objetivo) {
    const error = new Error("El usuario no existe.");
    error.codigo = "NO_ENCONTRADO";
    throw error;
  }

  // Restricción: un administrador no puede desactivar su propia cuenta.
  if (!activo && objetivo.id === solicitante.sub) {
    const error = new Error("No puedes desactivar tu propia cuenta.");
    error.codigo = "AUTODESACTIVACION_NO_PERMITIDA";
    throw error;
  }

  // Restricción: no se puede desactivar al único administrador activo.
  if (
    !activo &&
    objetivo.rol === "Administrador" &&
    objetivo.estado === "activo" &&
    repository.contarAdministradoresActivos() <= 1
  ) {
    const error = new Error("No puedes desactivar al único administrador activo del sistema.");
    error.codigo = "UNICO_ADMIN_ACTIVO";
    throw error;
  }

  const actualizado = repository.cambiarEstado(id, activo ? "activo" : "inactivo");
  repository.registrarAuditoria({
    accion: activo ? "ACTIVAR_USUARIO" : "DESACTIVAR_USUARIO",
    usuarioObjetivoId: Number(id),
    ejecutadoPor: solicitante.sub,
  });
  return quitarContrasena(actualizado);
}

module.exports = {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  cambiarEstadoUsuario,
};
