const { Pool } = require("pg");

/**
 * Conexión centralizada a PostgreSQL.
 * En producción DATABASE_URL es suministrada por Render.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

pool.on("error", (err) => {
  console.error("Error inesperado en PostgreSQL:", err);
});

module.exports = pool;
