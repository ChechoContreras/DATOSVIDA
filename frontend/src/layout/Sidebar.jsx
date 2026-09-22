import React from "react";
import "../styles/Sidebar.css";
import logoDatavida from "../assets/logo-icono.png";
import { obtenerUsuario } from "../utils/auth";
import { tienePermiso } from "../utils/permisos";

const elementosNavegacion = [
  {
    id: "inicio",
    etiqueta: "Inicio",
    icono: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
        <path d="M9 21v-7h6v7" />
      </svg>
    ),
  },

  {
    id: "indicadores",
    etiqueta: "Indicadores",
    icono: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },

  {
    id: "visualizacion",
    etiqueta: "Visualización",
    icono: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3c2.2 2.5 3.4 5.5 3.4 9s-1.2 6.5-3.4 9" />
        <path d="M12 3c-2.2 2.5-3.4 5.5-3.4 9s1.2 6.5 3.4 9" />
      </svg>
    ),
  },

  {
    id: "comparar",
    etiqueta: "Comparar",
    icono: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 4v16" />
        <path d="M16 4v16" />
        <path d="M4 8h8" />
        <path d="M12 16h8" />
      </svg>
    ),
  },

  {
    id: "estadisticas",
    etiqueta: "Análisis estadístico",
    icono: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 20V4" />
        <path d="M3 20h18" />
        <path d="m6 15 4-4 3 2 6-7" />
      </svg>
    ),
  },

  {
    id: "predicciones",
    etiqueta: "Predicciones IA",
    icono: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3v3" />
        <path d="M12 18v3" />
        <path d="m4.22 4.22 2.12 2.12" />
        <path d="m17.66 17.66 2.12 2.12" />
        <path d="M3 12h3" />
        <path d="M18 12h3" />
        <path d="m4.22 19.78 2.12-2.12" />
        <path d="m17.66 6.34 2.12-2.12" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },

  {
    id: "recomendaciones",
    etiqueta: "Recomendaciones",
    icono: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M8.5 14.5C7.55 13.7 7 12.5 7 11a5 5 0 0 1 10 0c0 1.5-.55 2.7-1.5 3.5-.75.65-1.5 1.3-1.5 2.5h-4c0-1.2-.75-1.85-1.5-2.5Z" />
      </svg>
    ),
  },

  {
    id: "reportes",
    etiqueta: "Reportes",
    icono: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8" />
        <path d="M8 17h6" />
      </svg>
    ),
  },
];

const elementoUsuarios = {
  id: "usuarios",
  etiqueta: "Usuarios",
  icono: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

const TODOS_LOS_ELEMENTOS = [...elementosNavegacion, elementoUsuarios];

function BarraLateral({ pantallaActual, navegar }) {
  const usuario = obtenerUsuario();

  const items = TODOS_LOS_ELEMENTOS.filter((el) => tienePermiso(usuario?.rol, el.id));

  return (
    <aside className="barra-lateral">

      <div className="barra-lateral-logo">
        <button
          className="logo-datavida-interno"
          onClick={() => navegar("inicio")}
          type="button"
        >
          <img
            src={logoDatavida}
            alt="DataVida"
          />

          <span>
            DataVida
          </span>
        </button>
      </div>

      <nav className="navegacion-lateral">

        <p className="titulo-navegacion">
          MENÚ PRINCIPAL
        </p>

        <div className="lista-navegacion">

          {items.map((elemento) => {
            const activo =
              pantallaActual === elemento.id;

            return (
              <button
                key={elemento.id}
                type="button"
                onClick={() => navegar(elemento.id)}
                className={`elemento-navegacion ${
                  activo ? "activo" : ""
                }`}
              >

                <span className="icono-navegacion">
                  {elemento.icono}
                </span>

                <span className="texto-navegacion">
                  {elemento.etiqueta}
                </span>

              </button>
            );
          })}

        </div>
      </nav>

      <div className="barra-lateral-inferior">

        <button
          type="button"
          className={`elemento-navegacion ${
            pantallaActual === "perfil" ? "activo" : ""
          }`}
          onClick={() => navegar("perfil")}
        >
          <span className="icono-navegacion">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
            </svg>

          </span>

          <span className="texto-navegacion">
            Perfil
          </span>
        </button>

        <button
          type="button"
          className="elemento-navegacion cerrar-sesion"
          onClick={() => navegar("inicio-sesion")}
        >
          <span className="icono-navegacion">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="m16 17 5-5-5-5" />
              <path d="M21 12H9" />
            </svg>

          </span>

          <span className="texto-navegacion">
            Cerrar sesión
          </span>
        </button>

      </div>

    </aside>
  );
}

export default BarraLateral;