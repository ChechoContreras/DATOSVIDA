import { Link } from "react-router-dom";

import logoIcono from "../assets/logo-icono.png";
import fondoHero from "../assets/hero-topografico.png";

import "../styles/Landing.css";

export default function Landing() {
return ( <div className="landing">


  {/* NAVEGACIÓN */}
  <header className="landing__nav">

    {/* LOGO + NOMBRE */}
    <div className="landing__marca">
      <img
        src={logoIcono}
        alt="DATAVIDA"
        className="landing__logo"
      />

      <span className="landing__nombre">
        DATAVIDA
      </span>
    </div>

    {/* MENÚ */}
    <nav className="landing__menu">
      <a href="#inicio">Inicio</a>
      <a href="#nosotros">Nosotros</a>
      <a href="#servicios">Servicios</a>
      <a href="#informacion">Información</a>
    </nav>

    {/* ÚNICO BOTÓN INGRESAR */}
    <Link
      to="/login"
      className="landing__boton-login"
    >
      Ingresar
    </Link>

  </header>

  <main>

    {/* HERO */}
    <section
      id="inicio"
      className="landing__hero"
      style={{
        backgroundImage: `url(${fondoHero})`,
      }}
    >
      <div className="landing__hero-contenido">

        <span className="landing__badge">
          DATOS + VIDA
        </span>

        <h1>
          Entender la pobreza para transformar{" "}
          <em>vida</em> en los territorios PDET
        </h1>

        <p className="landing__descripcion">
          DataVida transforma tus datos en información clara para ayudarte a comprenderlos y analizarlos.
        </p>

        <div className="landing__acciones">
          <a
            href="#servicios"
            className="landing__boton-ghost"
          >
            Conocer más ↓
          </a>
        </div>

      </div>
    </section>


    {/* SERVICIOS */}
    <section
      id="servicios"
      className="landing__caracteristicas"
    >

      <p className="landing__seccion-etiqueta">
        DESCUBRE DATAVIDA
      </p>

      <h2 className="landing__seccion-titulo">
        Todo lo que necesitas
        <br />
        en un solo lugar
      </h2>

      <div className="landing__grid">

        {/* INDICADORES */}
        <article className="landing__tarjeta">

          <div className="landing__tarjeta-icono">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="19" x2="4" y2="10" />
              <line x1="10" y1="19" x2="10" y2="5" />
              <line x1="16" y1="19" x2="16" y2="13" />
              <line x1="22" y1="19" x2="22" y2="8" />
            </svg>
          </div>

          <h3>Indicadores</h3>

          <p>
            Consulta información importante de manera
            sencilla y organizada sobre los territorios
            y sus condiciones de pobreza multidimensional.
          </p>

        </article>


        {/* ESTADÍSTICAS */}
        <article className="landing__tarjeta">

          <div className="landing__tarjeta-icono">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 17 9 11 13 14 21 6" />
              <polyline points="16 6 21 6 21 11" />
            </svg>
          </div>

          <h3>Estadísticas</h3>

          <p>
            Visualiza los datos y comprende mejor
            su comportamiento para identificar
            tendencias y diferencias entre territorios.
          </p>

        </article>


        {/* RECOMENDACIONES */}
        <article className="landing__tarjeta">

          <div className="landing__tarjeta-icono">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18h6" />
              <path d="M10 22h4" />
              <path d="M8.5 14.5C7.55 13.7 7 12.5 7 11a5 5 0 0 1 10 0c0 1.5-.55 2.7-1.5 3.5-.75.65-1.5 1.3-1.5 2.5h-4c0-1.2-.75-1.85-1.5-2.5Z" />
            </svg>
          </div>

          <h3>Recomendaciones</h3>

          <p>
            Obtén información que te ayude a interpretar
            los datos y tomar mejores decisiones basadas
            en evidencia.
          </p>

        </article>

      </div>
    </section>


    {/* SOBRE DATAVIDA */}
    <section
      id="nosotros"
      className="landing__informacion"
    >

      <div className="landing__informacion-visual">

        <div className="landing__grafico-grande">

          <div className="landing__barra landing__barra--1"></div>

          <div className="landing__barra landing__barra--2"></div>

          <div className="landing__barra landing__barra--3"></div>

          <div className="landing__barra landing__barra--4"></div>

        </div>

      </div>


      <div className="landing__informacion-texto">

        <p className="landing__seccion-etiqueta">
          SOBRE DATAVIDA
        </p>

        <h2>
          Los datos también
          <br />
          cuentan una historia.
        </h2>

        <p>
          DATAVIDA reúne diferentes herramientas para
          consultar, analizar y visualizar información
          de una manera más clara y fácil de entender.
        </p>

        <p>
          La plataforma permite explorar los indicadores
          de pobreza multidimensional de los territorios
          PDET y utilizar los datos como apoyo para
          comprender mejor sus necesidades.
        </p>

        <a
          href="#informacion"
          className="landing__boton-secundario"
        >
          Conocer más
        </a>

      </div>

    </section>


    {/* INFORMACIÓN */}
    <section
      id="informacion"
      className="landing__informacion-extra"
    >

      <p className="landing__seccion-etiqueta">
        INFORMACIÓN
      </p>

      <h2>
        Datos para comprender
        <br />
        nuestros territorios.
      </h2>

      <p>
        DATAVIDA busca facilitar el acceso y la
        interpretación de información relacionada
        con la pobreza multidimensional en los
        territorios PDET de Colombia.
      </p>

    </section>

  </main>


  {/* FOOTER */}
  <footer className="landing__footer">
    <p>
      Proyecto DATAVIDA — Proyecto Integrador II, UPB
    </p>
  </footer>

</div>


);
}
