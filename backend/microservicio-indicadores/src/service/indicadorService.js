
const repository = require("../repository/indicadorRepository");

/**
 * DATAVIDA - Servicio de Indicadores
 *
 * Capa de lógica de negocio.
 *
 * Permite consultar:
 * - Valores de indicadores
 * - Departamentos PDET
 * - Subregiones PDET
 * - Municipios PDET
 * - Catálogo de indicadores
 * - Periodos disponibles
 */

// ==========================================
// CONSULTAR INDICADORES
// ==========================================

async function obtenerIndicadores(filtros = {}) {
  const resultados = await repository.consultarValores(filtros);

  if (resultados.length === 0) {
    return {
      encontrados: false,
      mensaje:
        "No se encontraron resultados para los filtros seleccionados.",
      datos: [],
    };
  }

  return {
    encontrados: true,
    mensaje: "Consulta realizada correctamente.",
    datos: resultados,
  };
}

// ==========================================
// OBTENER DEPARTAMENTOS PDET
// ==========================================

async function obtenerDepartamentos() {
  return await repository.listarDepartamentos();
}

// ==========================================
// OBTENER SUBREGIONES PDET
// ==========================================

async function obtenerSubregiones(filtros = {}) {
  return await repository.listarSubregiones(filtros);
}

// ==========================================
// OBTENER MUNICIPIOS PDET
// ==========================================

async function obtenerMunicipios(filtros = {}) {
  return await repository.listarMunicipios(filtros);
}

// ==========================================
// OBTENER CATÁLOGO DE INDICADORES
// ==========================================

async function obtenerCatalogoIndicadores() {
  return await repository.listarIndicadores();
}

// ==========================================
// OBTENER PERIODOS DISPONIBLES
// ==========================================

async function obtenerPeriodos() {
  return await repository.listarPeriodos();
}

// ==========================================
// EXPORTAR FUNCIONES
// ==========================================

module.exports = {
  obtenerIndicadores,
  obtenerDepartamentos,
  obtenerSubregiones,
  obtenerMunicipios,
  obtenerCatalogoIndicadores,
  obtenerPeriodos,
};
