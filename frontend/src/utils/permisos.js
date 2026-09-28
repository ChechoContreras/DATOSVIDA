/**
 * Permisos por rol:
 *
 * - Usuario: acceso a consultas, visualización, recomendaciones y reportes.
 * - Analista: acceso a herramientas de análisis, comparación e IA.
 * - Administrador: acceso completo a todas las funcionalidades del sistema.
 */

export const PERMISOS_POR_PANTALLA = {
  inicio: ["Administrador", "Analista", "Usuario"],

  indicadores: ["Administrador", "Analista", "Usuario"],

  visualizacion: ["Administrador", "Analista", "Usuario"],

  comparar: ["Administrador", "Analista"],

  estadisticas: ["Administrador", "Analista"],

  predicciones: ["Administrador", "Analista"],

  variables: ["Administrador", "Analista"],

  recomendaciones: ["Administrador", "Analista", "Usuario"],

  reportes: ["Administrador", "Analista", "Usuario"],

  usuarios: ["Administrador"],
};

export function tienePermiso(rol, pantallaId) {
  const permitidos = PERMISOS_POR_PANTALLA[pantallaId];
  return Boolean(permitidos && permitidos.includes(rol));
}
