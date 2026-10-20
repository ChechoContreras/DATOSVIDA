

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerUsuario } from "../utils/auth";
import { tienePermiso } from "../utils/permisos";
import {
  obtenerMunicipios,
  obtenerSubregiones,
  obtenerCatalogoIndicadores,
  obtenerPeriodos,
} from "../services/indicadoresService";

import "../styles/Inicio.css";

/* =========================================
   ICONOS DE RESUMEN
   ========================================= */

function IconoResumen({ tipo }) {
  if (tipo === "municipios") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 21h18" />
        <path d="M5 21V9l7-4 7 4v12" />
        <path d="M8 21v-6h3v6" />
        <path d="M13 21v-6h3v6" />
        <path d="M9 10h.01" />
        <path d="M15 10h.01" />
      </svg>
    );
  }

  if (tipo === "indicadores") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="M8 16v-4" />
        <path d="M12 16V8" />
        <path d="M16 16V5" />
      </svg>
    );
  }

  if (tipo === "periodos") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M16 2v4" />
        <path d="M8 2v4" />
        <path d="M3 10h18" />
        <path d="M8 14h.01" />
        <path d="M12 14h.01" />
        <path d="M16 14h.01" />
        <path d="M8 18h.01" />
        <path d="M12 18h.01" />
      </svg>
    );
  }

  if (tipo === "subregiones") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3l9 5-9 5-9-5z" />
        <path d="M3 13l9 5 9-5" />
      </svg>
    );
  }

  if (tipo === "analisis") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19V5" />
        <path d="M4 19h17" />
        <path d="M7 15l4-4 3 2 5-6" />
        <path d="M15 7h4v4" />
      </svg>
    );
  }

  return null;
}

/* =========================================
   ICONOS DE ACCESOS RÁPIDOS
   ========================================= */

function IconoAcceso({ tipo }) {
  if (tipo === "indicadores") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="M8 16v-4" />
        <path d="M12 16V8" />
        <path d="M16 16V5" />
      </svg>
    );
  }

  if (tipo === "visualizacion") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9" />
        <path d="M12 3c-2.4 2.5-3.6 5.5-3.6 9s1.2 6.5 3.6 9" />
      </svg>
    );
  }

  if (tipo === "comparar") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 5v14" />
        <path d="M4 8l3-3 3 3" />
        <path d="M17 19V5" />
        <path d="M14 16l3 3 3-3" />
        <path d="M10 9h4" />
        <path d="M10 15h4" />
      </svg>
    );
  }

  if (tipo === "estadisticas") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19V5" />
        <path d="M4 19h17" />
        <path d="M7 15l4-4 3 2 5-6" />
        <path d="M15 7h4v4" />
      </svg>
    );
  }

  if (tipo === "predicciones") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3z" />
        <path d="M19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16z" />
      </svg>
    );
  }

  if (tipo === "variables") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="5" cy="18" r="2" />
        <circle cx="12" cy="8" r="2" />
        <circle cx="19" cy="14" r="2" />
        <path d="M6.5 16.5L11 9.5" />
        <path d="M13.8 9.2l4 3.6" />
      </svg>
    );
  }

  if (tipo === "reportes") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6" />
        <path d="M9 17h6" />
        <path d="M9 9h2" />
      </svg>
    );
  }

  return null;
}

/* =========================================
   DATOS
   ========================================= */

const accesosRapidos = [
  {
    titulo: "Consultar indicadores",
    descripcion: "Consulta información de municipios y regiones.",
    icono: "indicadores",
    pantalla: "indicadores",
    permiso: "indicadores",
  },
  {
    titulo: "Visualizar información",
    descripcion: "Explora indicadores mediante mapas y gráficos.",
    icono: "visualizacion",
    pantalla: "mapa",
    permiso: "visualizacion",
  },
  {
    titulo: "Comparar territorios",
    descripcion: "Compara indicadores entre municipios o regiones.",
    icono: "comparar",
    pantalla: "comparar",
    permiso: "comparar",
  },
  {
    titulo: "Análisis estadístico",
    descripcion: "Analiza patrones y comportamientos en los datos.",
    icono: "estadisticas",
    pantalla: "analisis-estadistico",
    permiso: "estadisticas",
  },
  {
    titulo: "Predicciones IA",
    descripcion: "Proyecta un indicador hasta 5 años y simula escenarios.",
    icono: "predicciones",
    pantalla: "predicciones",
    permiso: "predicciones",
  },
  {
    titulo: "Análisis de variables",
    descripcion: "Descubre con qué otras variables se relaciona un indicador.",
    icono: "variables",
    pantalla: "variables",
    permiso: "variables",
  },
];

/* =========================================
   CIFRAS DEL RESUMEN (calculadas con la API, sin valores fijos)
   ========================================= */

const listaDe = (datos) =>
  Array.isArray(datos) ? datos : datos?.datos || datos?.data || [];

function textoRangoPeriodos(datos) {
  const anios = listaDe(datos)
    .map((p) => Number(p?.periodo ?? p?.anio ?? p?.year ?? p))
    .filter(Number.isFinite);

  if (!anios.length) return "—";

  const min = Math.min(...anios);
  const max = Math.max(...anios);

  return min === max ? String(min) : `${min}–${max}`;
}

/* =========================================
   COMPONENTE PRINCIPAL
   ========================================= */

function Inicio() {
  const navigate = useNavigate();
  const usuario = obtenerUsuario();
  const accesosPermitidos = accesosRapidos.filter((acceso) =>
    tienePermiso(usuario?.rol, acceso.permiso)
  );

  const [resumen, setResumen] = useState({
    municipios: "—",
    subregiones: "—",
    indicadores: "—",
    periodos: "—",
  });

  useEffect(() => {
    let activo = true;

    Promise.allSettled([
      obtenerMunicipios(),
      obtenerSubregiones(),
      obtenerCatalogoIndicadores(),
      obtenerPeriodos(),
    ]).then(([municipios, subregiones, indicadores, periodos]) => {
      if (!activo) return;

      const cantidad = (r) =>
        r.status === "fulfilled" ? String(listaDe(r.value).length) : "—";

      setResumen({
        municipios: cantidad(municipios),
        subregiones: cantidad(subregiones),
        indicadores: cantidad(indicadores),
        periodos:
          periodos.status === "fulfilled"
            ? textoRangoPeriodos(periodos.value)
            : "—",
      });
    });

    return () => {
      activo = false;
    };
  }, []);

  const tarjetasResumen = [
    { valor: resumen.municipios, etiqueta: "Municipios PDET", icono: "municipios", tono: "ocre" },
    { valor: resumen.subregiones, etiqueta: "Subregiones PDET", icono: "subregiones", tono: "verde" },
    { valor: resumen.indicadores, etiqueta: "Indicadores", icono: "indicadores", tono: "azul" },
    { valor: resumen.periodos, etiqueta: "Periodos de datos", icono: "periodos", tono: "morado", largo: true },
  ];

  function irAPantalla(pantalla) {
    if (pantalla === "inicio") {
      navigate("/app");
      return;
    }

    navigate(`/app/${pantalla}`);
  }

  return (
    <div className="inicio-usuario">

      {/* BANNER DE BIENVENIDA */}

      <header className="inicio-hero">
        <span className="inicio-hero__etiqueta">PANEL PRINCIPAL</span>

        <h1>Bienvenido a DataVida</h1>

        <p>
          Explora la información territorial de los municipios PDET y usa
          nuestras herramientas para consultar, comparar, proyectar y
          entender la pobreza multidimensional.
        </p>
      </header>

      {/* CIFRAS */}

      <section className="inicio-cifras">
        {tarjetasResumen.map((tarjeta) => (
          <article className="inicio-cifra" key={tarjeta.etiqueta}>
            <div className={`inicio-cifra__icono tono-${tarjeta.tono}`}>
              <IconoResumen tipo={tarjeta.icono} />
            </div>

            <div className="inicio-cifra__texto">
              <strong className={tarjeta.largo ? "inicio-cifra__valor--largo" : ""}>
                {tarjeta.valor}
              </strong>
              <span>{tarjeta.etiqueta}</span>
            </div>
          </article>
        ))}
      </section>

      {/* ACCESOS RÁPIDOS */}

      <section className="inicio-accesos">
        <h2>Accesos rápidos</h2>

        <div className="inicio-accesos__grid">
          {accesosPermitidos.map((acceso) => (
            <article
              className="inicio-acceso"
              key={acceso.pantalla}
              onClick={() => irAPantalla(acceso.pantalla)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  irAPantalla(acceso.pantalla);
                }
              }}
            >
              <div className="inicio-acceso__icono">
                <IconoAcceso tipo={acceso.icono} />
              </div>

              <h3>{acceso.titulo}</h3>
              <p>{acceso.descripcion}</p>

              <span className="inicio-acceso__abrir">Abrir →</span>
            </article>
          ))}
        </div>
      </section>

    </div>
  );
}

export default Inicio;
