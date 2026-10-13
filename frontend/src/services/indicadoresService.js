
import api from "./api";

/**
 * DATAVIDA
 * Servicio de Indicadores Territoriales PDET
 *
 * API principal:
 * https://datavida-api.onrender.com/api
 *
 * La URL se configura en services/api.js.
 *
 * Funciones:
 * - Consultar indicadores municipales
 * - Obtener departamentos PDET
 * - Obtener subregiones PDET
 * - Obtener municipios PDET
 * - Obtener catálogo de indicadores
 * - Obtener periodos disponibles
 *
 * Compatible con:
 * - ConsultarIndicadores.jsx
 * - Comparador.jsx
 */

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

function crearParametros(filtros = {}) {
  const params = {};

  if (
    filtros.municipioCodigo !== undefined &&
    filtros.municipioCodigo !== null &&
    filtros.municipioCodigo !== ""
  ) {
    params.municipioCodigo = filtros.municipioCodigo;
  }

  if (
    filtros.indicadorId !== undefined &&
    filtros.indicadorId !== null &&
    filtros.indicadorId !== ""
  ) {
    params.indicadorId = filtros.indicadorId;
  }

  if (
    filtros.periodo !== undefined &&
    filtros.periodo !== null &&
    filtros.periodo !== ""
  ) {
    params.periodo = filtros.periodo;
  }

  return params;
}

// ==========================================
// CONSULTAR INDICADORES
// ==========================================

export async function consultarIndicadores(filtros = {}) {
  const params = crearParametros(filtros);

  const { data } = await api.get("/indicadores", {
    params,
  });

  return data;
}

// ==========================================
// ALIAS PARA COMPARADOR
// ==========================================

export async function obtenerIndicadores(filtros = {}) {
  return consultarIndicadores(filtros);
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

  if (
    filtros.departamentoCodigo !== undefined &&
    filtros.departamentoCodigo !== null &&
    filtros.departamentoCodigo !== ""
  ) {
    params.departamentoCodigo = filtros.departamentoCodigo;
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

  if (
    filtros.departamentoCodigo !== undefined &&
    filtros.departamentoCodigo !== null &&
    filtros.departamentoCodigo !== ""
  ) {
    params.departamentoCodigo = filtros.departamentoCodigo;
  }

  if (
    filtros.subregionCodigo !== undefined &&
    filtros.subregionCodigo !== null &&
    filtros.subregionCodigo !== ""
  ) {
    params.subregionCodigo = filtros.subregionCodigo;
  }

  const { data } = await api.get("/municipios", {
    params,
  });

  return data;
}

// ==========================================
// CATÁLOGO DE INDICADORES
// ==========================================

export async function obtenerCatalogoIndicadores() {
  const { data } = await api.get(
    "/catalogo-indicadores"
  );

  return data;
}

// ==========================================
// PERIODOS DISPONIBLES
// ==========================================

export async function obtenerPeriodos() {
  const { data } = await api.get("/periodos");

  return data;
}
