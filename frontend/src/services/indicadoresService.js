import api from "./api";

/**
 * Consulta valores de indicadores aplicando filtros opcionales.
 * @param {{municipioCodigo?: string, indicadorId?: string, periodo?: string}} filtros
 */
export async function consultarIndicadores(filtros = {}) {
  const params = {};
  if (filtros.municipioCodigo) params.municipioCodigo = filtros.municipioCodigo;
  if (filtros.indicadorId) params.indicadorId = filtros.indicadorId;
  if (filtros.periodo) params.periodo = filtros.periodo;

  const { data } = await api.get("/indicadores", { params });
  return data;
}

export async function obtenerMunicipios() {
  const { data } = await api.get("/municipios");
  return data;
}

export async function obtenerCatalogoIndicadores() {
  const { data } = await api.get("/catalogo-indicadores");
  return data;
}
