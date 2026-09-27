const axios = require("axios");

const INDICADORES_URL = process.env.INDICADORES_URL || "http://localhost:4001/api";

async function consultarValoresIndicadores(filtros = {}) {
  const { data } = await axios.get(`${INDICADORES_URL}/indicadores`, {
    params: filtros,
    timeout: 5000,
  });
  return data.datos || [];
}

/**
 * Trae todos los valores registrados, sin filtro. Se usa para calcular
 * correlaciones entre indicadores cruzando municipios (RF-13 apoyo:
 * "correlaciones e impacto de variables priorizadas").
 */
async function consultarTodosLosValores() {
  return consultarValoresIndicadores({});
}

module.exports = { consultarValoresIndicadores, consultarTodosLosValores };