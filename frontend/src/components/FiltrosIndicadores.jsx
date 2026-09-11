export default function FiltrosIndicadores({
  municipios,
  catalogoIndicadores,
  onBuscar,
}) {
  function manejarSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    onBuscar({
      municipioCodigo: form.get("municipio") || "",
      indicadorId: form.get("indicador") || "",
      periodo: form.get("periodo") || "",
    });
  }

  return (
    <form className="filtros" onSubmit={manejarSubmit}>
      <div className="filtro-campo">
        <label htmlFor="municipio">Municipio</label>
        <select id="municipio" name="municipio" defaultValue="">
          <option value="">Todos</option>
          {municipios.map((m) => (
            <option key={m.codigo} value={m.codigo}>
              {m.nombre} — {m.departamento}
            </option>
          ))}
        </select>
      </div>

      <div className="filtro-campo">
        <label htmlFor="indicador">Indicador</label>
        <select id="indicador" name="indicador" defaultValue="">
          <option value="">Todos</option>
          {catalogoIndicadores.map((i) => (
            <option key={i.id} value={i.id}>
              {i.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="filtro-campo">
        <label htmlFor="periodo">Periodo</label>
        <input id="periodo" name="periodo" type="text" placeholder="2024" />
      </div>

      <button type="submit">Consultar</button>
    </form>
  );
}
