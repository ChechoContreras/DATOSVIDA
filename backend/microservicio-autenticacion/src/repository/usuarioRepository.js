const pool = require("../config/database");
const { hashearContrasena } = require("../util/passwordUtil");

/**
 * Repository de usuarios.
 *
 * Esta capa es la encargada del acceso directo a PostgreSQL.
 * Los servicios no acceden directamente a la base de datos.
 */

function mapearUsuario(fila) {
  if (!fila) return null;

  return {
    id: fila.id,
    nombre: fila.nombre,
    correo: fila.correo,
    contrasenaHash: fila.contrasena_hash,
    rol: fila.rol,
    estado: fila.estado,
    fechaCreacion: fila.fecha_creacion,
  };
}

async function registrarAuditoria({
  accion,
  usuarioObjetivoId,
  ejecutadoPor,
}) {
  await pool.query(
    `
      INSERT INTO auditoria
        (accion, usuario_objetivo_id, ejecutado_por)
      VALUES ($1, $2, $3)
    `,
    [accion, usuarioObjetivoId || null, ejecutadoPor || null]
  );
}

async function buscarPorCorreo(correo) {
  const resultado = await pool.query(
    `
      SELECT
        id,
        nombre,
        correo,
        contrasena_hash,
        rol,
        estado,
        fecha_creacion
      FROM usuarios
      WHERE LOWER(correo) = LOWER($1)
      LIMIT 1
    `,
    [correo]
  );

  return mapearUsuario(resultado.rows[0]);
}

async function buscarPorId(id) {
  const resultado = await pool.query(
    `
      SELECT
        id,
        nombre,
        correo,
        contrasena_hash,
        rol,
        estado,
        fecha_creacion
      FROM usuarios
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return mapearUsuario(resultado.rows[0]);
}

async function listar({ busqueda } = {}) {
  let resultado;

  if (busqueda) {
    resultado = await pool.query(
      `
        SELECT
          id,
          nombre,
          correo,
          contrasena_hash,
          rol,
          estado,
          fecha_creacion
        FROM usuarios
        WHERE nombre ILIKE $1
           OR correo ILIKE $1
        ORDER BY id
      `,
      [`%${busqueda}%`]
    );
  } else {
    resultado = await pool.query(
      `
        SELECT
          id,
          nombre,
          correo,
          contrasena_hash,
          rol,
          estado,
          fecha_creacion
        FROM usuarios
        ORDER BY id
      `
    );
  }

  return resultado.rows.map(mapearUsuario);
}

async function crear({ nombre, correo, contrasena, rol }) {
  const contrasenaHash = hashearContrasena(contrasena);

  const resultado = await pool.query(
    `
      INSERT INTO usuarios
        (nombre, correo, contrasena_hash, rol, estado)
      VALUES ($1, $2, $3, $4, 'activo')
      RETURNING
        id,
        nombre,
        correo,
        contrasena_hash,
        rol,
        estado,
        fecha_creacion
    `,
    [nombre, correo, contrasenaHash, rol]
  );

  return mapearUsuario(resultado.rows[0]);
}

async function actualizar(id, cambios) {
  const usuario = await buscarPorId(id);

  if (!usuario) {
    return null;
  }

  const nombre =
    cambios.nombre !== undefined ? cambios.nombre : usuario.nombre;

  const correo =
    cambios.correo !== undefined ? cambios.correo : usuario.correo;

  const rol =
    cambios.rol !== undefined ? cambios.rol : usuario.rol;

  const contrasenaHash = cambios.contrasena
    ? hashearContrasena(cambios.contrasena)
    : usuario.contrasenaHash;

  const resultado = await pool.query(
    `
      UPDATE usuarios
      SET
        nombre = $1,
        correo = $2,
        rol = $3,
        contrasena_hash = $4
      WHERE id = $5
      RETURNING
        id,
        nombre,
        correo,
        contrasena_hash,
        rol,
        estado,
        fecha_creacion
    `,
    [nombre, correo, rol, contrasenaHash, id]
  );

  return mapearUsuario(resultado.rows[0]);
}

async function cambiarEstado(id, estado) {
  const resultado = await pool.query(
    `
      UPDATE usuarios
      SET estado = $1
      WHERE id = $2
      RETURNING
        id,
        nombre,
        correo,
        contrasena_hash,
        rol,
        estado,
        fecha_creacion
    `,
    [estado, id]
  );

  return mapearUsuario(resultado.rows[0]);
}

async function contarAdministradoresActivos() {
  const resultado = await pool.query(
    `
      SELECT COUNT(*)::INTEGER AS total
      FROM usuarios
      WHERE rol = 'Administrador'
        AND estado = 'activo'
    `
  );

  return resultado.rows[0].total;
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
};
