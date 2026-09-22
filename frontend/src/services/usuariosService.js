import authApi from "./authApi";

/** RF-03 Consultar usuario (listado, con búsqueda opcional). */
async function listarUsuarios(busqueda = "") {
  const { data } = await authApi.get("/usuarios", {
    params: busqueda ? { busqueda } : {},
  });
  return data;
}

/** RF-02 Crear usuario. */
async function crearUsuario({ nombre, correo, contrasena, rol }) {
  const { data } = await authApi.post("/usuarios", { nombre, correo, contrasena, rol });
  return data;
}

/** RF-04 Actualizar usuario. */
async function actualizarUsuario(id, cambios) {
  const { data } = await authApi.put(`/usuarios/${id}`, cambios);
  return data;
}

/** RF-05 Activar/Desactivar usuario. */
async function cambiarEstadoUsuario(id, activo) {
  const { data } = await authApi.patch(`/usuarios/${id}/estado`, { activo });
  return data;
}

export { listarUsuarios, crearUsuario, actualizarUsuario, cambiarEstadoUsuario };
