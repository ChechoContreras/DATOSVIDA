export default function TarjetasIndicadores({ datos }) {
  if (datos.length === 0) {
    return <p className="estado-vacio">No hay resultados para mostrar con estos filtros.</p>;
  }

  return (
    <div className="tarjetas-grid">
      {datos.map((d, idx) => (
        <article className="tarjeta-indicador" key={idx}>
          <p className="tarjeta-indicador__dimension">{d.indicador.dimension}</p>
          <p className="tarjeta-indicador__valor">
            {d.valor}
            <span>{d.indicador.unidad}</span>
          </p>
          <h3>{d.indicador.nombre}</h3>
          <div className="tarjeta-indicador__pie">
            <span>{d.municipio.nombre}, {d.municipio.departamento}</span>
            <span>{d.periodo} · {d.fuente}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
