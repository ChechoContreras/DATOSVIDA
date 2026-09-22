/**
 * Permisos por rol, según los actores definidos en el documento de
 * Especificación de Requerimientos:
 *
 * - Usuario: RF-09 Consultar indicadores, RF-10 Visualizar mapas y
 *   gráficos, RF-14 Consultar recomendaciones, RF-15 Generar y
 *   exportar reportes.
 * - Analista: todo lo del Usuario + RF-11 Comparar municipios o
 *   regiones, RF-12 Ejecutar análisis estadístico, RF-13 Generar
 *   predicciones mediante IA.
 * - Administrador: RF-02 a RF-05 Gestión de usuarios, y RF-06 a RF-08
 *   Gestión de datos (microservicio aún pendiente).
 */
export const PERMISOS_POR_PANTALLA = {
  inicio: ["Administrador", "Analista", "Usuario"],
  indicadores: ["Analista", "Usuario"],
  visualizacion: ["Analista", "Usuario"],
  comparar: ["Analista"],
  estadisticas: ["Analista"],
  predicciones: ["Analista"],
  recomendaciones: ["Analista", "Usuario"],
  reportes: ["Analista", "Usuario"],
  usuarios: ["Administrador"],
};

export function tienePermiso(rol, pantallaId) {
  const permitidos = PERMISOS_POR_PANTALLA[pantallaId];
  return Boolean(permitidos && permitidos.includes(rol));
}
