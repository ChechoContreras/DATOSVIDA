import analiticaApi from "./analiticaApi";

async function compararTerritorios({ municipios, indicadorId, periodo }) {
  const { data } = await analiticaApi.post("/analitica/comparar", { municipios, indicadorId, periodo });
  return data;
}

async function ejecutarAnalisisEstadistico(filtros) {
  const { data } = await analiticaApi.post("/analitica/estadistico", filtros);
  return data;
}

export { compararTerritorios, ejecutarAnalisisEstadistico };
