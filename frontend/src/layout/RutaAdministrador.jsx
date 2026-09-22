import { Navigate, Outlet } from "react-router-dom";
import { obtenerUsuario } from "../utils/auth";

/**
 * RF-02 a RF-05 Restricciones: la gestión de usuarios es exclusiva
 * del rol Administrador. Si el usuario autenticado tiene otro rol,
 * se le redirige al panel principal.
 */
export default function RutaAdministrador() {
  const usuario = obtenerUsuario();
  if (!usuario || usuario.rol !== "Administrador") {
    return <Navigate to="/app" replace />;
  }
  return <Outlet />;
}
