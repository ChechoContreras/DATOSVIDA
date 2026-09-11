import { useState } from "react";
import { NavLink } from "react-router-dom";

const ITEMS = [
  { to: "/", etiqueta: "Inicio", icono: "🏠", fin: true },
  { to: "/indicadores", etiqueta: "Consultar IPM", icono: "📊" },
  { to: "/mapa", etiqueta: "Mapa de territorios", icono: "🗺️" },
];

export default function Sidebar() {
  const [abierto, setAbierto] = useState(true);

  return (
    <aside className={`sidebar ${abierto ? "sidebar--abierto" : "sidebar--cerrado"}`}>
      <div className="sidebar__encabezado">
        {abierto && <span className="sidebar__marca">DATAVIDA</span>}
        <button
          className="sidebar__toggle"
          onClick={() => setAbierto((v) => !v)}
          aria-label={abierto ? "Contraer menú" : "Expandir menú"}
          aria-expanded={abierto}
        >
          {abierto ? "‹" : "›"}
        </button>
      </div>

      <nav className="sidebar__nav">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.fin}
            className={({ isActive }) =>
              "sidebar__item" + (isActive ? " sidebar__item--activo" : "")
            }
            title={item.etiqueta}
          >
            <span className="sidebar__icono">{item.icono}</span>
            {abierto && <span className="sidebar__texto">{item.etiqueta}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
