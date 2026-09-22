/**
 * Capa Repository (prototipo con datos de prueba en memoria).
 *
 * IMPORTANTE: en la arquitectura definitiva, esta es la única capa con
 * acceso directo a PostgreSQL. Por ahora simula esa persistencia en
 * memoria del proceso, para poder entregar el microservicio funcional
 * mientras no hay base de datos montada.
 */

const { hashearContrasena } = require("../util/passwordUtil");

let siguienteId = 4;

const usuarios = [
  {
    id: 1,
    nombre: "Ana Administradora",
    correo: "admin@datavida.gov.co",
    contrasenaHash: hashearContrasena("Admin123!"),
    rol: "Administrador",
    estado: "activo",
    fechaCreacion: "2026-08-01",
  },
  {
    id: 2,
    nombre: "Andrés Analista",
    correo: "analista@datavida.gov.co",
    contrasenaHash: hashearContrasena("Analista123!"),
    rol: "Analista",
    estado: "activo",
    fechaCreacion: "2026-08-01",
  },
  {
    id: 3,
    nombre: "Úrsula Usuaria",
    correo: "usuario@datavida.gov.co",
    contrasenaHash: hashearContrasena("Usuario123!"),
    rol: "Usuario",
    estado: "activo",
    fechaCreacion: "2026-08-01",
  },
];

/** Log de auditoría en memoria (RNF-06 Trazabilidad y auditoría). */
const auditoria = [];

function registrarAuditoria({ accion, usuarioObjetivoId, ejecutadoPor }) {
  auditoria.push({
    id: auditoria.length + 1,
    accion,
    usuarioObjetivoId,
    ejecutadoPor,
    fecha: new Date().toISOString(),
  });
}

function buscarPorCorreo(correo) {
  return usuarios.find((u) => u.correo.toLowerCase() === correo.toLowerCase());
}

function buscarPorId(id) {
  return usuarios.find((u) => u.id === Number(id));
}

function listar({ busqueda } = {}) {
  if (!busqueda) return usuarios;
  const texto = busqueda.toLowerCase();
  return usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(texto) ||
      u.correo.toLowerCase().includes(texto)
  );
}

function crear({ nombre, correo, contrasena, rol }) {
  const nuevo = {
    id: siguienteId++,
    nombre,
    correo,
    contrasenaHash: hashearContrasena(contrasena),
    rol,
    estado: "activo",
    fechaCreacion: new Date().toISOString().slice(0, 10),
  };
  usuarios.push(nuevo);
  return nuevo;
}

function actualizar(id, cambios) {
  const usuario = buscarPorId(id);
  if (!usuario) return null;
  if (cambios.nombre !== undefined) usuario.nombre = cambios.nombre;
  if (cambios.correo !== undefined) usuario.correo = cambios.correo;
  if (cambios.rol !== undefined) usuario.rol = cambios.rol;
  if (cambios.contrasena) usuario.contrasenaHash = hashearContrasena(cambios.contrasena);
  return usuario;
}

function cambiarEstado(id, estado) {
  const usuario = buscarPorId(id);
  if (!usuario) return null;
  usuario.estado = estado;
  return usuario;
}

function contarAdministradoresActivos() {
  return usuarios.filter((u) => u.rol === "Administrador" && u.estado === "activo").length;
}

module.exports = {
  buscarPorCorreo,
  buscarPorId,
  listar,
  crear,
  actualizar,
  cambiarEstado,
  contarAdministradoresActivos,
  registrarAuditoria,
  auditoria,
};
