import { Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Inicio from "./pages/Inicio";
import ConsultarIndicadores from "./pages/ConsultarIndicadores";
import Mapa from "./pages/Mapa";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Inicio />} />
        <Route path="indicadores" element={<ConsultarIndicadores />} />
        <Route path="mapa" element={<Mapa />} />
      </Route>
    </Routes>
  );
}

export default App;
