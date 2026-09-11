export default function Mapa() {
  return (
    <section className="pagina-mapa">
      <p className="pagina-consulta__etiqueta">Próximamente</p>
      <h1>Mapa de territorios PDET</h1>
      <p>
        Esta vista mostrará los municipios sobre un mapa interactivo
        (React-Leaflet), coloreados según su valor de IPM. Se implementará
        cuando el Microservicio de Gestión de Datos entregue la información
        geoespacial (PostGIS).
      </p>
    </section>
  );
}
