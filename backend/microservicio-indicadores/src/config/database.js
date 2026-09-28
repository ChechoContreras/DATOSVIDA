const { Pool } = require("pg");

/**
 * Conexión centralizada a PostgreSQL para el
 * Microservicio de Indicadores de DataVida.
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
