import iaApi from "./iaApi";

async function generarPrediccion({ municipioCodigo, indicadorId, horizonte }) {
  const { data } = await iaApi.post("/ia/predicciones", { municipioCodigo, indicadorId, horizonte });
  return data;
}

/** Simulación de escenarios: tendencia actual vs. cambio anual adicional hipotético. */
async function simularEscenario({ municipioCodigo, indicadorId, horizonte, ajusteAnual }) {
  const { data } = await iaApi.post("/ia/simulacion", { municipioCodigo, indicadorId, horizonte, ajusteAnual });
  return data;
}

async function obtenerRecomendaciones({ municipioCodigo, indicadorId }) {
  const params = {};
  if (municipioCodigo) params.municipioCodigo = municipioCodigo;
  if (indicadorId) params.indicadorId = indicadorId;
  const { data } = await iaApi.get("/ia/recomendaciones", { params });
  return data;
}

/** Correlación de Pearson entre indicadores + variables priorizadas por impacto. */
async function obtenerCorrelaciones({ indicadorIdA, indicadorIdB } = {}) {
  const params = {};
  if (indicadorIdA) params.indicadorIdA = indicadorIdA;
  if (indicadorIdB) params.indicadorIdB = indicadorIdB;
  const { data } = await iaApi.get("/ia/correlaciones", { params });
  return data;
}

export { generarPrediccion, simularEscenario, obtenerRecomendaciones, obtenerCorrelaciones };
