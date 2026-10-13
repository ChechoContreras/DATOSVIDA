const axios = require("axios");

// En Render se puede sobreescribir con la variable de entorno INDICADORES_URL.
// Si no está definida, se usa la URL pública del microservicio de indicadores
// desplegado, para que esto funcione en producción sin configuración extra.
const INDICADORES_URL =
  process.env.INDICADORES_URL || "https://datavida-api.onrender.com/api";

async function consultarValoresIndicadores(filtros = {}) {
  const { data } = await axios.get(`${INDICADORES_URL}/indicadores`, {
    params: filtros,
    timeout: 5000,
  });
  return data.datos || [];
}

module.exports = { consultarValoresIndicadores };
