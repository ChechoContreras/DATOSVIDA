import { Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import RutaProtegida from "./layout/RutaProtegida";
import RutaConPermiso from "./layout/RutaConPermiso";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Inicio from "./pages/Inicio";
import ConsultarIndicadores from "./pages/ConsultarIndicadores";
import Mapa from "./pages/Mapa";
import GestionUsuarios from "./pages/GestionUsuarios";
import Comparar from "./pages/Comparar";
import AnalisisEstadistico from "./pages/AnalisisEstadistico";
import PrediccionesIA from "./pages/PrediccionesIA";
import Recomendaciones from "./pages/Recomendaciones";
import Reportes from "./pages/Reportes";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      <Route element={<RutaProtegida />}>
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Inicio />} />

          <Route element={<RutaConPermiso pantallaId="indicadores" />}>
            <Route path="indicadores" element={<ConsultarIndicadores />} />
          </Route>

          <Route element={<RutaConPermiso pantallaId="visualizacion" />}>
            <Route path="mapa" element={<Mapa />} />
          </Route>

          <Route element={<RutaConPermiso pantallaId="comparar" />}>
            <Route path="comparar" element={<Comparar />} />
          </Route>

          <Route element={<RutaConPermiso pantallaId="estadisticas" />}>
            <Route path="analisis-estadistico" element={<AnalisisEstadistico />} />
          </Route>

          <Route element={<RutaConPermiso pantallaId="predicciones" />}>
            <Route path="predicciones" element={<PrediccionesIA />} />
          </Route>

          <Route element={<RutaConPermiso pantallaId="recomendaciones" />}>
            <Route path="recomendaciones" element={<Recomendaciones />} />
          </Route>

          <Route element={<RutaConPermiso pantallaId="reportes" />}>
            <Route path="reportes" element={<Reportes />} />
          </Route>

          <Route element={<RutaConPermiso pantallaId="usuarios" />}>
            <Route path="usuarios" element={<GestionUsuarios />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;