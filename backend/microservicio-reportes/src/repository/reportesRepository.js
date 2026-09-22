const historial = [];
let siguienteId = 1;

function guardar(registro) {
  const nuevo = { id: siguienteId++, fecha: new Date().toISOString(), ...registro };
  historial.push(nuevo);
  return nuevo;
}

function listar() {
  return historial;
}

module.exports = { guardar, listar };
