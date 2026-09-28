const pool = require("./database");
const { hashearContrasena } = require("../util/passwordUtil");

/**
 * Inicializa la estructura mínima de PostgreSQL para el
 * Microservicio de Autenticación de DataVida.
 */
async function inicializarDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        correo VARCHAR(255) NOT NULL UNIQUE,
        contrasena_hash VARCHAR(255) NOT NULL,
        rol VARCHAR(50) NOT NULL
          CHECK (rol IN ('Administrador', 'Analista', 'Usuario')),
        estado VARCHAR(20) NOT NULL DEFAULT 'activo'
          CHECK (estado IN ('activo', 'inactivo')),
        fecha_creacion DATE NOT NULL DEFAULT CURRENT_DATE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS auditoria (
        id SERIAL PRIMARY KEY,
        accion VARCHAR(100) NOT NULL,
        usuario_objetivo_id INTEGER,
        ejecutado_por INTEGER,
        fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_auditoria_usuario_objetivo
          FOREIGN KEY (usuario_objetivo_id)
          REFERENCES usuarios(id)
          ON DELETE SET NULL
      );
    `);

    /*
     * Usuarios iniciales del prototipo.
     * Solo se insertan si el correo todavía no existe.
     * Las contraseñas se almacenan únicamente como hash.
     */
    const usuariosIniciales = [
      {
        nombre: "Ana Administradora",
        correo: "admin@datavida.co",
        contrasena: "Admin123!",
        rol: "Administrador",
      },
      {
        nombre: "Andrés Analista",
        correo: "analista@datavida.co",
        contrasena: "Analista123!",
        rol: "Analista",
      },
      {
        nombre: "Úrsula Usuaria",
        correo: "usuario@datavida.co",
        contrasena: "Usuario123!",
        rol: "Usuario",
      },
    ];

    for (const usuario of usuariosIniciales) {
      const contrasenaHash = hashearContrasena(usuario.contrasena);

      await pool.query(
        `
          INSERT INTO usuarios
            (nombre, correo, contrasena_hash, rol, estado)
          VALUES ($1, $2, $3, $4, 'activo')
          ON CONFLICT (correo) DO NOTHING;
        `,
        [
          usuario.nombre,
          usuario.correo,
          contrasenaHash,
          usuario.rol,
        ]
      );
    }

    console.log("Base de datos PostgreSQL inicializada correctamente.");
  } catch (error) {
    console.error(
      "Error al inicializar la base de datos PostgreSQL:",
      error
    );
    throw error;
  }
}

module.exports = { inicializarDB };
