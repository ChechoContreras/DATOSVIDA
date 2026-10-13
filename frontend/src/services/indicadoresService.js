
import api from "./api";

/**
 * DATAVIDA - Servicios de Indicadores
 *
 * Conexión del frontend con el microservicio
 * de indicadores territoriales.
 *
 * Permite consultar:
 * - Indicadores
 * - Departamentos PDET
 * - Subregiones PDET
 * - Municipios PDET
 * - Catálogo de indicadores
 * - Periodos disponibles
 */

// ==========================================
// CONSULTAR INDICADORES
// ==========================================

export async function consultarIndicadores(filtros = {}) {
  const params = {};

  if (filtros.municipioCodigo) {
    params.municipioCodigo = filtros.municipioCodigo;
  }

  if (filtros.indicadorId) {
    params.indicadorId = filtros.indicadorId;
  }

  if (filtros.periodo) {
    params.periodo = filtros.periodo;
  }

  const { data } = await api.get("/indicadores", {
    params,
  });

  return data;
}

// ==========================================
// OBTENER DEPARTAMENTOS PDET
// ==========================================

export async function obtenerDepartamentos() {
  const { data } = await api.get("/departamentos");

  return data;
}

// ==========================================
// OBTENER SUBREGIONES PDET
// ==========================================

export async function obtenerSubregiones(filtros = {}) {
  const params = {};

  if (filtros.departamentoCodigo) {
    params.departamentoCodigo =
      filtros.departamentoCodigo;
  }

  const { data } = await api.get("/subregiones", {
    params,
  });

  return data;
}

// ==========================================
// OBTENER MUNICIPIOS PDET
// ==========================================

export async function obtenerMunicipios(filtros = {}) {
  const params = {};

  if (filtros.departamentoCodigo) {
    params.departamentoCodigo =
      filtros.departamentoCodigo;
  }

  if (filtros.subregionCodigo) {
    params.subregionCodigo =
      filtros.subregionCodigo;
  }

  const { data } = await api.get("/municipios", {
    params,
  });

  return data;
}

// ==========================================
// OBTENER CATÁLOGO DE INDICADORES
// ==========================================

export async function obtenerCatalogoIndicadores() {
  const { data } = await api.get(
    "/catalogo-indicadores"
  );

  return data;
}

// ==========================================
// OBTENER PERIODOS DISPONIBLES
// ==========================================

export async function obtenerPeriodos() {
  const { data } = await api.get("/periodos");

  return data;
}
