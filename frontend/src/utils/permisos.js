/**
 * Permisos por rol:
 *
 * - Administrador: solo administra la plataforma (Inicio y Gestión de
 *   usuarios). No entra a las pantallas de consulta/análisis de datos.
 * - Usuario: acceso a consultas, visualización, recomendaciones y reportes.
 * - Analista: acceso a herramientas de análisis, comparación e IA.
 */

export const PERMISOS_POR_PANTALLA = {
  inicio: ["Administrador", "Analista", "Usuario"],

  indicadores: ["Analista", "Usuario"],

  visualizacion: ["Analista", "Usuario"],

  comparar: ["Analista"],

  estadisticas: ["Analista"],

  predicciones: ["Analista"],

  variables: ["Analista"],

  recomendaciones: ["Analista", "Usuario"],

  reportes: ["Analista", "Usuario"],

  usuarios: ["Administrador"],
};

export function tienePermiso(rol, pantallaId) {
  const permitidos = PERMISOS_POR_PANTALLA[pantallaId];
  return Boolean(permitidos && permitidos.includes(rol));
}
