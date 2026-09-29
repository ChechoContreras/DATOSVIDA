export default function TarjetasIndicadores({ datos }) {
  // Si no existen datos o el arreglo está vacío
  if (!datos || datos.length === 0) {
    return (
      <p className="estado-vacio">
        No hay resultados para mostrar con estos filtros.
      </p>
    );
  }

  return (
    <div className="tarjetas-grid">
      {datos.map((d, idx) => {
        // Información del indicador con valores seguros
        const dimension =
          d.indicador?.dimension || "Sin dimensión";

        const unidad =
          d.indicador?.unidad || "";

        const nombreIndicador =
          d.indicador?.nombre || "Indicador";

        /*
         * El resultado puede corresponder a un municipio
         * o a un territorio agregado como PDET Colombia.
         */
        const nombreTerritorio =
          d.municipio?.nombre ||
          d.territorio?.nombre ||
          "Territorio";

        const departamento =
          d.municipio?.departamento || "";

        return (
          <article
            className="tarjeta-indicador"
            key={
              d.id ||
              `${d.indicador?.id || "indicador"}-${d.periodo || "periodo"}-${idx}`
            }
          >
            <p className="tarjeta-indicador__dimension">
              {dimension}
            </p>

            <p className="tarjeta-indicador__valor">
              {d.valor ?? "N/D"}
              <span>{unidad}</span>
            </p>

            <h3>{nombreIndicador}</h3>

            <div className="tarjeta-indicador__pie">
              <span>
                {nombreTerritorio}
                {departamento ? `, ${departamento}` : ""}
              </span>

              <span>
                {d.periodo || "Sin periodo"}
                {d.fuente ? ` · ${d.fuente}` : ""}
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
