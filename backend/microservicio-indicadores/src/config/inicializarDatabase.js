
const pool = require("./database");

/**
 * DATAVIDA
 * Inicialización de PostgreSQL.
 *
 * Crea las tablas necesarias y registra
 * los territorios y el catálogo de indicadores.
 *
 * NO elimina datos existentes.
 * NO inserta valores estadísticos.
 * NO sobrescribe observaciones oficiales.
 */

async function inicializarDatabase() {
  // 1. Tabla de territorios
  await pool.query(`
    CREATE TABLE IF NOT EXISTS territorios (
      codigo VARCHAR(30) PRIMARY KEY,
      nombre VARCHAR(200) NOT NULL,
      tipo VARCHAR(100) NOT NULL
    );
  `);

  // 2. Catálogo de indicadores
  await pool.query(`
    CREATE TABLE IF NOT EXISTS indicadores (
      id SERIAL PRIMARY KEY,
      codigo VARCHAR(100) UNIQUE NOT NULL,
      nombre VARCHAR(250) NOT NULL,
      unidad VARCHAR(50) NOT NULL,
      dimension VARCHAR(150),
      fuente VARCHAR(250) NOT NULL
    );
  `);

  // 3. Valores de los indicadores
  await pool.query(`
    CREATE TABLE IF NOT EXISTS valores_indicador (
      id SERIAL PRIMARY KEY,
      territorio_codigo VARCHAR(30) NOT NULL,
      indicador_id INTEGER NOT NULL,
      periodo VARCHAR(20) NOT NULL,
      valor NUMERIC(15,4) NOT NULL,
      fuente VARCHAR(250) NOT NULL,
      fecha_actualizacion DATE,

      CONSTRAINT fk_territorio
        FOREIGN KEY (territorio_codigo)
        REFERENCES territorios(codigo),

      CONSTRAINT fk_indicador
        FOREIGN KEY (indicador_id)
        REFERENCES indicadores(id),

      CONSTRAINT valor_unico
        UNIQUE (
          territorio_codigo,
          indicador_id,
          periodo
        )
    );
  `);

  // 4. Territorios agregados PDET
  await pool.query(`
    INSERT INTO territorios (
      codigo, nombre, tipo
    )
    VALUES
      (
        'PDET-CO',
        'Agregado PDET Colombia',
        'Agregado PDET'
      ),
      (
        'PDET-CAB',
        'Cabeceras PDET',
        'Dominio PDET'
      ),
      (
        'PDET-RUR',
        'Centros poblados y rural disperso PDET',
        'Dominio PDET'
      )
    ON CONFLICT (codigo) DO NOTHING;
  `);

  // 5. Catálogo de indicadores
  const indicadores = [
    ["IPM", "Pobreza multidimensional",
      "Pobreza multidimensional"],

    ["LOGRO_EDUCATIVO", "Bajo logro educativo",
      "Educación"],

    ["ANALFABETISMO", "Analfabetismo",
      "Educación"],

    ["INASISTENCIA", "Inasistencia escolar",
      "Educación"],

    ["REZAGO_ESCOLAR", "Rezago escolar",
      "Educación"],

    ["TRABAJO_INFANTIL", "Trabajo infantil",
      "Niñez y juventud"],

    ["SIN_ASEGURAMIENTO",
      "Sin aseguramiento en salud", "Salud"],

    ["BARRERAS_SALUD",
      "Barreras de acceso a servicios de salud",
      "Salud"],

    ["DESEMPLEO_LARGA_DURACION",
      "Desempleo de larga duración", "Trabajo"],

    ["EMPLEO_INFORMAL", "Empleo informal",
      "Trabajo"],

    ["SIN_ACUEDUCTO",
      "Sin acceso a fuente de agua mejorada",
      "Vivienda y servicios públicos"],

    ["EXCRETAS",
      "Inadecuada eliminación de excretas",
      "Vivienda y servicios públicos"],

    ["PISOS_INADECUADOS",
      "Pisos inadecuados", "Vivienda"],

    ["PAREDES_INADECUADAS",
      "Paredes exteriores inadecuadas",
      "Vivienda"],

    ["HACINAMIENTO",
      "Hacinamiento crítico", "Vivienda"]
  ];

  for (const [codigo, nombre, dimension] of indicadores) {
    await pool.query(
      `
      INSERT INTO indicadores (
        codigo, nombre, unidad, dimension, fuente
      )
      VALUES ($1, $2, '%', $3, $4)
      ON CONFLICT (codigo) DO NOTHING;
      `,
      [
        codigo,
        nombre,
        dimension,
        "DANE - Índice de Pobreza Multidimensional"
      ]
    );
  }

  console.log(
    "DATAVIDA: estructura PostgreSQL verificada."
  );

  console.log(
    "DATAVIDA: territorios PDET registrados."
  );

  console.log(
    "DATAVIDA: catálogo de indicadores verificado."
  );

  console.log(
    "DATAVIDA: no se modificaron valores estadísticos."
  );
}

module.exports = inicializarDatabase;
