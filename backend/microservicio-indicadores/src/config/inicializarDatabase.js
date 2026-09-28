const pool = require("./database");

/**
 * Crea la estructura necesaria para almacenar los indicadores
 * territoriales de DataVida en PostgreSQL.
 *
 * Es seguro ejecutarlo varias veces porque utiliza
 * CREATE TABLE IF NOT EXISTS.
 */
async function inicializarDatabase() {
  // 1. Municipios
  await pool.query(`
    CREATE TABLE IF NOT EXISTS municipios (
      codigo VARCHAR(5) PRIMARY KEY,
      nombre VARCHAR(150) NOT NULL,
      subregion VARCHAR(150),
      departamento VARCHAR(150) NOT NULL
    );
  `);

  // 2. Catálogo de indicadores
  await pool.query(`
    CREATE TABLE IF NOT EXISTS indicadores (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(250) NOT NULL,
      unidad VARCHAR(50),
      dimension VARCHAR(150),
      fuente VARCHAR(150)
    );
  `);

  // 3. Valores de cada indicador por municipio y periodo
  await pool.query(`
    CREATE TABLE IF NOT EXISTS valores_indicador (
      id SERIAL PRIMARY KEY,
      municipio_codigo VARCHAR(5) NOT NULL,
      indicador_id INTEGER NOT NULL,
      periodo VARCHAR(20) NOT NULL,
      valor NUMERIC(15,4) NOT NULL,
      fuente VARCHAR(150) NOT NULL,
      fecha_actualizacion DATE,
      CONSTRAINT fk_municipio
        FOREIGN KEY (municipio_codigo)
        REFERENCES municipios(codigo),
      CONSTRAINT fk_indicador
        FOREIGN KEY (indicador_id)
        REFERENCES indicadores(id),
      CONSTRAINT valor_unico
        UNIQUE (municipio_codigo, indicador_id, periodo)
    );
  `);

  console.log("Tablas de indicadores verificadas correctamente.");
}

module.exports = inicializarDatabase;
