/**
 * Historial en memoria de análisis y comparaciones ejecutados
 * (equivalente simplificado de ResultadoAnalisis / ParametroAnalisis
 * del diagrama de clases de Analítica). Sirve para trazabilidad
 * (RNF-06) mientras no hay base de datos.
 */
const historial = [];
let siguienteId = 1;

function guardar(registro) {
  const nuevo = { id: siguienteId++, fechaEjecucion: new Date().toISOString(), ...registro };
  historial.push(nuevo);
  return nuevo;
}

function listar() {
  return historial;
}

module.exports = { guardar, listar };
