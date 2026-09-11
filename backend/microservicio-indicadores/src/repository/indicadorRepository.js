/**
 * Capa Repository (prototipo con datos de prueba).
 *
 * IMPORTANTE: En la arquitectura definitiva, esta es la ÚNICA capa que
 * debe tener acceso directo a la base de datos (PostgreSQL con PostGIS),
 * según el documento de Arquitectura Tecnológica. Por ahora, mientras no
 * hay base de datos montada, simulamos esos datos en memoria para poder
 * entregar el primer incremento funcional del Sprint 3.
 */

// Municipios PDET de ejemplo (universo real limitado a 170 municipios PDET)
const municipios = [
  { codigo: "05045", nombre: "Anorí", subregion: "Bajo Cauca y Nordeste Antioqueño", departamento: "Antioquia" },
  { codigo: "13430", nombre: "Montes de María", subregion: "Montes de María", departamento: "Bolívar" },
  { codigo: "50006", nombre: "Vistahermosa", subregion: "Macarena - Guaviare", departamento: "Meta" },
  { codigo: "54405", nombre: "Sardinata", subregion: "Catatumbo", departamento: "Norte de Santander" },
];

// Las 5 dimensiones del IPM (metodología oficial DANE)
const indicadores = [
  { id: 1, nombre: "Bajo logro educativo", unidad: "%", dimension: "Educación" },
  { id: 2, nombre: "Trabajo informal", unidad: "%", dimension: "Trabajo" },
  { id: 3, nombre: "Sin acceso a fuente de agua mejorada", unidad: "%", dimension: "Vivienda y servicios públicos" },
  { id: 4, nombre: "Inasistencia escolar", unidad: "%", dimension: "Niñez y juventud" },
];

// Valores de ejemplo por municipio, indicador y periodo
const valoresIndicador = [
  { id: 1, municipioCodigo: "05045", indicadorId: 1, periodo: "2024", valor: 28.4, fuente: "DANE", fechaActualizacion: "2025-03-15" },
  { id: 2, municipioCodigo: "05045", indicadorId: 2, periodo: "2024", valor: 61.2, fuente: "DANE", fechaActualizacion: "2025-03-15" },
  { id: 3, municipioCodigo: "13430", indicadorId: 1, periodo: "2024", valor: 33.1, fuente: "DANE", fechaActualizacion: "2025-03-15" },
  { id: 4, municipioCodigo: "13430", indicadorId: 3, periodo: "2024", valor: 19.7, fuente: "DANE", fechaActualizacion: "2025-03-15" },
  { id: 5, municipioCodigo: "50006", indicadorId: 2, periodo: "2024", valor: 54.9, fuente: "DANE", fechaActualizacion: "2025-03-15" },
  { id: 6, municipioCodigo: "50006", indicadorId: 4, periodo: "2024", valor: 12.3, fuente: "DANE", fechaActualizacion: "2025-03-15" },
  { id: 7, municipioCodigo: "54405", indicadorId: 1, periodo: "2024", valor: 25.6, fuente: "DANE", fechaActualizacion: "2025-03-15" },
  { id: 8, municipioCodigo: "54405", indicadorId: 3, periodo: "2024", valor: 22.8, fuente: "DANE", fechaActualizacion: "2025-03-15" },
];

/**
 * Consulta los valores de indicadores aplicando filtros opcionales
 * de municipio, indicador y periodo (RF-09 Consultar indicadores).
 */
function consultarValores({ municipioCodigo, indicadorId, periodo } = {}) {
  return valoresIndicador
    .filter((v) => !municipioCodigo || v.municipioCodigo === municipioCodigo)
    .filter((v) => !indicadorId || v.indicadorId === Number(indicadorId))
    .filter((v) => !periodo || v.periodo === periodo)
    .map((v) => {
      const municipio = municipios.find((m) => m.codigo === v.municipioCodigo);
      const indicador = indicadores.find((i) => i.id === v.indicadorId);
      return {
        municipio,
        indicador,
        periodo: v.periodo,
        valor: v.valor,
        fuente: v.fuente,
        fechaActualizacion: v.fechaActualizacion,
      };
    });
}

function listarMunicipios() {
  return municipios;
}

function listarIndicadores() {
  return indicadores;
}

module.exports = {
  consultarValores,
  listarMunicipios,
  listarIndicadores,
};
