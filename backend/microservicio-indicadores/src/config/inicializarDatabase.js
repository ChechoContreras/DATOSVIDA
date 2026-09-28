const pool = require("./database");

/**
 * Crea la estructura necesaria para almacenar los indicadores
 * territoriales de DataVida en PostgreSQL.
 *
 * Es seguro ejecutarlo varias veces porque utiliza
 * CREATE TABLE IF NOT EXISTS y ON CONFLICT.
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

  // 4. Datos iniciales de municipios
  // ON CONFLICT evita duplicarlos cada vez que Render reinicie.
  await pool.query(`
    INSERT INTO municipios (
      codigo,
      nombre,
      subregion,
      departamento
    )
    VALUES
      (
        '05045',
        'Anorí',
        'Bajo Cauca y Nordeste Antioqueño',
        'Antioquia'
      ),
      (
        '13430',
        'Montes de María',
        'Montes de María',
        'Bolívar'
      ),
      (
        '50006',
        'Vistahermosa',
        'Macarena-Guaviare',
        'Meta'
      ),
      (
        '54405',
        'Sardinata',
        'Catatumbo',
        'Norte de Santander'
      )
    ON CONFLICT (codigo) DO NOTHING;
  `);

  console.log("Municipios iniciales cargados correctamente.");
  console.log("Tablas de indicadores verificadas correctamente.");
}

module.exports = inicializarDatabase;
