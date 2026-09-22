import { Navigate, Outlet } from "react-router-dom";
import { haySesion } from "../utils/auth";

/**
 * RF-01 Restricciones: el acceso a las funcionalidades protegidas
 * requiere que el usuario esté autenticado. Si no hay una sesión
 * guardada localmente, se redirige a la pantalla de inicio de sesión.
 */
export default function RutaProtegida() {
  if (!haySesion()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
