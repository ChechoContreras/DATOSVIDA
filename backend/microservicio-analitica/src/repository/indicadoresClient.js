const axios = require("axios");

const INDICADORES_URL = process.env.INDICADORES_URL || "http://localhost:4001/api";

/**
 * Capa Repository del microservicio de Analítica.
 *
 * En la arquitectura de DATAVIDA, Analítica consume los datos ya
 * validados por el Microservicio de Indicadores (que es quien tiene
 * acceso a PostgreSQL). Por eso esta capa no habla con una base de
 * datos directamente, sino con ese otro microservicio vía HTTP —tal
 * como está descrito en el diagrama de comportamiento de Analítica
 * del documento de Arquitectura Tecnológica.
 */
async function consultarValoresIndicadores(filtros = {}) {
  const { data } = await axios.get(`${INDICADORES_URL}/indicadores`, {
    params: filtros,
    timeout: 5000,
  });
  return data.datos || [];
}

module.exports = { consultarValoresIndicadores };
