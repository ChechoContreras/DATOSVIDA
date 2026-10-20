
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="app-shell app-shell-sin-barra">
      <main className="app-contenido app-contenido-completo">
        <Outlet />
      </main>
    </div>
  );
}
