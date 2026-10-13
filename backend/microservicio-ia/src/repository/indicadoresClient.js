
const axios = require("axios");

const INDICADORES_URL =
  process.env.INDICADORES_URL ||
  "https://datavida-api.onrender.com/api";

async function consultarValoresIndicadores(filtros = {}) {
  const { data } = await axios.get(
    `${INDICADORES_URL}/indicadores`,
    {
      params: filtros,
      timeout: 30000,
    }
  );

  return data.datos || [];
}

/**
 * Consulta todos los valores registrados para
 * calcular correlaciones entre indicadores.
 */
async function consultarTodosLosValores() {
  return consultarValoresIndicadores({});
}

module.exports = {
  consultarValoresIndicadores,
  consultarTodosLosValores,
};
