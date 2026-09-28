const repository = require("../repository/indicadorRepository");

/**
 * Capa Service (RF-09 Consultar indicadores).
 * Aplica las reglas de negocio antes/después de consultar el Repository.
 */

async function obtenerIndicadores(filtros) {
  const resultados = await repository.consultarValores(filtros);

  // Flujo Alternativo #1 de RF-09: si no hay datos, se informa explícitamente
  if (resultados.length === 0) {
    return {
      encontrados: false,
      mensaje: "No se encontraron resultados para los filtros seleccionados.",
      datos: [],
    };
  }

  return {
    encontrados: true,
    mensaje: "Consulta realizada correctamente.",
    datos: resultados,
  };
}

async function obtenerMunicipios() {
  return await repository.listarMunicipios();
}

async function obtenerCatalogoIndicadores() {
  return await repository.listarIndicadores();
}

async function obtenerPeriodos() {
  return await repository.listarPeriodos();
}

module.exports = {
  obtenerIndicadores,
  obtenerMunicipios,
  obtenerCatalogoIndicadores,
  obtenerPeriodos,
};
