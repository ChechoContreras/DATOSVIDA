import { Navigate, Outlet } from "react-router-dom";
import { obtenerUsuario } from "../utils/auth";
import { tienePermiso } from "../utils/permisos";

/**
 * Protege una ruta según el mapa de permisos (utils/permisos.js).
 * `pantallaId` debe coincidir con una clave de PERMISOS_POR_PANTALLA.
 */
export default function RutaConPermiso({ pantallaId }) {
  const usuario = obtenerUsuario();
  if (!usuario || !tienePermiso(usuario.rol, pantallaId)) {
    return <Navigate to="/app" replace />;
  }
  return <Outlet />;
}
