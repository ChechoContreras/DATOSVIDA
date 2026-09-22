const axios = require("axios");

const INDICADORES_URL = process.env.INDICADORES_URL || "http://localhost:4001/api";

async function consultarValoresIndicadores(filtros = {}) {
  const { data } = await axios.get(`${INDICADORES_URL}/indicadores`, {
    params: filtros,
    timeout: 5000,
  });
  return data.datos || [];
}

module.exports = { consultarValoresIndicadores };
