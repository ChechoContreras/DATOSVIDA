import { Link } from "react-router-dom";
import logoHorizontal from "../assets/logo-horizontal-claro.png";
import fondoHero from "../assets/hero-topografico.png";

export default function Landing() {
  return (
    <div className="landing">
      <nav className="landing__nav">
        <img src={logoHorizontal} alt="DATAVIDA" className="landing__logo" />
        <Link to="/login" className="landing__boton-login">
          Iniciar sesión
        </Link>
      </nav>

      <section
        className="landing__hero"
        style={{ backgroundImage: `url(${fondoHero})` }}
      >
        <div className="landing__hero-contenido">
          <span className="landing__badge">Índice de Pobreza Multidimensional</span>
          <h1>
            Entender la pobreza para transformar <em>vida</em> en los
            territorios PDET
          </h1>
          <p className="landing__descripcion">
            DATAVIDA reúne, analiza y visualiza los indicadores oficiales de
            pobreza multidimensional en Colombia. Consulta información por
            municipio y periodo, compara territorios, ejecuta análisis
            estadísticos y genera predicciones con inteligencia artificial.
          </p>
          <div className="landing__acciones">
            <Link to="/login" className="landing__boton-primario">
              Ingresar a la plataforma
            </Link>
            <a href="#caracteristicas" className="landing__boton-ghost">
              Conocer más ↓
            </a>
          </div>
        </div>
      </section>

      <section id="caracteristicas" className="landing__caracteristicas">
        <p className="landing__seccion-etiqueta">Qué hace DATAVIDA</p>
        <h2 className="landing__seccion-titulo">
          Una plataforma para entender el territorio con datos
        </h2>

        <div className="landing__grid">
          <article className="landing__tarjeta">
            <span className="landing__tarjeta-icono">📊</span>
            <h3>Consulta de indicadores</h3>
            <p>
              Filtra los datos del IPM por municipio, dimensión y periodo,
              con la fuente y fecha de actualización siempre visibles.
            </p>
          </article>
          <article className="landing__tarjeta">
            <span className="landing__tarjeta-icono">🗺️</span>
            <h3>Comparación territorial</h3>
            <p>
              Compara municipios o regiones para identificar diferencias y
              prioridades de intervención.
            </p>
          </article>
          <article className="landing__tarjeta">
            <span className="landing__tarjeta-icono">🤖</span>
            <h3>Analítica e Inteligencia Artificial</h3>
            <p>
              Ejecuta análisis estadísticos y genera predicciones que apoyan
              la toma de decisiones basada en evidencia.
            </p>
          </article>
        </div>
      </section>

      <footer className="landing__footer">
        <p>Proyecto DATAVIDA — Proyecto Integrador II, UPB</p>
      </footer>
    </div>
  );
}
