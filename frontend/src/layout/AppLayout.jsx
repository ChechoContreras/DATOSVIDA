import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { cerrarSesion } from "../services/authService";

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const navegar = (pantalla) => {
    switch (pantalla) {
      case "inicio":
        navigate("/app");
        break;

      case "indicadores":
        navigate("/app/indicadores");
        break;

      case "visualizacion":
        navigate("/app/mapa");
        break;

      case "usuarios":
        navigate("/app/usuarios");
        break;

      case "comparar":
        navigate("/app/comparar");
        break;

      case "estadisticas":
        navigate("/app/analisis-estadistico");
        break;

      case "predicciones":
        navigate("/app/predicciones");
        break;

      case "recomendaciones":
        navigate("/app/recomendaciones");
        break;

      case "reportes":
        navigate("/app/reportes");
        break;

      case "inicio-sesion":
        cerrarSesion().finally(() => navigate("/login"));
        break;

      default:
        navigate("/app");
        break;
    }
  };

  const obtenerPantallaActual = () => {
    const ruta = location.pathname;

    if (ruta === "/app" || ruta === "/app/") {
      return "inicio";
    }

    if (ruta.startsWith("/app/indicadores")) {
      return "indicadores";
    }

    if (ruta.startsWith("/app/mapa")) {
      return "visualizacion";
    }

    if (ruta.startsWith("/app/usuarios")) {
      return "usuarios";
    }

    if (ruta.startsWith("/app/comparar")) {
      return "comparar";
    }

    if (ruta.startsWith("/app/analisis-estadistico")) {
      return "estadisticas";
    }

    if (ruta.startsWith("/app/predicciones")) {
      return "predicciones";
    }

    if (ruta.startsWith("/app/recomendaciones")) {
      return "recomendaciones";
    }

    if (ruta.startsWith("/app/reportes")) {
      return "reportes";
    }

    return "inicio";
  };

  return (
    <div className="app-shell">
      <Sidebar
        pantallaActual={obtenerPantallaActual()}
        navegar={navegar}
      />

      <div className="app-contenido">
        <Outlet />
      </div>
    </div>
  );
}