import { Link } from "react-router-dom";

export default function Inicio() {
  return (
    <section className="pagina-inicio">
      <p className="pagina-inicio__etiqueta">Panel principal</p>
      <h1>Índice de Pobreza Multidimensional en municipios PDET</h1>
      <p className="pagina-inicio__intro">
        DATAVIDA reúne los indicadores oficiales de pobreza multidimensional
        para apoyar el análisis, la comparación territorial y la toma de
        decisiones en los municipios PDET de Colombia.
      </p>

      <div className="pagina-inicio__accesos">
        <Link to="/indicadores" className="tarjeta-acceso">
          <span className="tarjeta-acceso__icono">📊</span>
          <div>
            <h2>Consultar IPM</h2>
            <p>Filtra indicadores por municipio, dimensión y periodo.</p>
          </div>
        </Link>

        <Link to="/mapa" className="tarjeta-acceso">
          <span className="tarjeta-acceso__icono">🗺️</span>
          <div>
            <h2>Mapa de territorios</h2>
            <p>Ubicación de los municipios dentro del universo PDET.</p>
          </div>
        </Link>
      </div>
    </section>
  );
}
