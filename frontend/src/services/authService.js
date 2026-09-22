import authApi from "./authApi";
import { guardarSesion, obtenerToken, limpiarSesion } from "../utils/auth";

/** RF-01 Iniciar sesión. Lanza un error con `.mensaje` si falla. */
async function iniciarSesion(correo, contrasena) {
  try {
    const { data } = await authApi.post("/auth/login", { correo, contrasena });
    guardarSesion(data.token, data.usuario);
    return data.usuario;
  } catch (err) {
    const mensaje =
      err.response?.data?.mensaje ||
      "No fue posible conectar con el Microservicio de Autenticación.";
    throw new Error(mensaje);
  }
}

/** RF-16 Cerrar sesión. */
async function cerrarSesion() {
  const token = obtenerToken();
  try {
    if (token) {
      await authApi.post("/auth/logout");
    }
  } catch (err) {
    // Aunque falle la invalidación en el servidor, la sesión local
    // igual debe eliminarse (ver RNF de la especificación de RF-16).
  } finally {
    limpiarSesion();
  }
}

export { iniciarSesion, cerrarSesion };
