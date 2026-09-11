import { Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Inicio from "./pages/Inicio";
import ConsultarIndicadores from "./pages/ConsultarIndicadores";
import Mapa from "./pages/Mapa";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Inicio />} />
        <Route path="/indicadores" element={<ConsultarIndicadores />} />
        <Route path="/mapa" element={<Mapa />} />
      </Route>
    </Routes>
  );
}

export default App;
