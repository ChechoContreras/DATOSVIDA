const predicciones = [];
const recomendaciones = [];
let idPrediccion = 1;
let idRecomendacion = 1;

function guardarPrediccion(registro) {
  const nuevo = { id: idPrediccion++, fecha: new Date().toISOString(), ...registro };
  predicciones.push(nuevo);
  return nuevo;
}

function guardarRecomendacion(registro) {
  const nueva = { id: idRecomendacion++, fecha: new Date().toISOString(), ...registro };
  recomendaciones.push(nueva);
  return nueva;
}

function listarPredicciones() {
  return predicciones;
}

function listarRecomendaciones() {
  return recomendaciones;
}

module.exports = {
  guardarPrediccion,
  guardarRecomendacion,
  listarPredicciones,
  listarRecomendaciones,
};
