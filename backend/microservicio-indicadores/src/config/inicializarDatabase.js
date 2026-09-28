const pool = require("./database");

/**
 * Inicializa la base de datos del Microservicio de Indicadores.
 *
 * Los datos iniciales corresponden a resultados PDET 2025
 * calculados a partir de los microdatos oficiales del DANE.
 */
async function inicializarDatabase() {
  // 1. Eliminar estructura anterior del prototipo.
  // CASCADE elimina también la tabla de valores que dependía
  // de los municipios de prueba.
  await pool.query(`
    DROP TABLE IF EXISTS valores_indicador CASCADE;
    DROP TABLE IF EXISTS municipios CASCADE;
  `);

  // 2. Territorios o grupos territoriales
  await pool.query(`
    CREATE TABLE IF NOT EXISTS territorios (
      codigo VARCHAR(30) PRIMARY KEY,
      nombre VARCHAR(200) NOT NULL,
      tipo VARCHAR(100) NOT NULL
    );
  `);

  // 3. Catálogo de indicadores
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

  // 4. Valores de los indicadores
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
        UNIQUE (territorio_codigo, indicador_id, periodo)
    );
  `);

  // 5. Eliminar los indicadores anteriores del prototipo.
  // En este momento todavía no existen valores asociados
  // porque valores_indicador acaba de ser recreada.
  await pool.query(`
    DELETE FROM indicadores;
  `);

  // 6. Registrar el universo territorial identificado
  // por los microdatos PDET.
  await pool.query(`
    INSERT INTO territorios (codigo, nombre, tipo)
    VALUES (
      'PDET-CO',
      'PDET Colombia',
      'Programas de Desarrollo con Enfoque Territorial'
    )
    ON CONFLICT (codigo) DO UPDATE SET
      nombre = EXCLUDED.nombre,
      tipo = EXCLUDED.tipo;
  `);

  // 7. Catálogo de indicadores PDET 2025
  await pool.query(`
    INSERT INTO indicadores
      (codigo, nombre, unidad, dimension, fuente)
    VALUES
      (
        'IPM',
        'Pobreza multidimensional',
        '%',
        'Pobreza multidimensional',
        'DANE - Índice de Pobreza Multidimensional 2025'
      ),
      (
        'LOGRO_EDUCATIVO',
        'Bajo logro educativo',
        '%',
        'Educación',
        'DANE - Índice de Pobreza Multidimensional 2025'
      ),
      (
        'ANALFABETISMO',
        'Analfabetismo',
        '%',
        'Educación',
        'DANE - Índice de Pobreza Multidimensional 2025'
      ),
      (
        'INASISTENCIA',
        'Inasistencia escolar',
        '%',
        'Educación',
        'DANE - Índice de Pobreza Multidimensional 2025'
      ),
      (
        'REZAGO_ESCOLAR',
        'Rezago escolar',
        '%',
        'Educación',
        'DANE - Índice de Pobreza Multidimensional 2025'
      ),
      (
        'TRABAJO_INFANTIL',
        'Trabajo infantil',
        '%',
        'Niñez y juventud',
        'DANE - Índice de Pobreza Multidimensional 2025'
      ),
      (
        'SIN_ASEGURAMIENTO',
        'Sin aseguramiento en salud',
        '%',
        'Salud',
        'DANE - Índice de Pobreza Multidimensional 2025'
      ),
      (
        'BARRERAS_SALUD',
        'Barreras de acceso a servicios de salud',
        '%',
        'Salud',
        'DANE - Índice de Pobreza Multidimensional 2025'
      ),
      (
        'DESEMPLEO_LARGA_DURACION',
        'Desempleo de larga duración',
        '%',
        'Trabajo',
        'DANE - Índice de Pobreza Multidimensional 2025'
      ),
      (
        'EMPLEO_INFORMAL',
        'Empleo informal',
        '%',
        'Trabajo',
        'DANE - Índice de Pobreza Multidimensional 2025'
      ),
      (
        'SIN_ACUEDUCTO',
        'Sin acceso a fuente de agua mejorada',
        '%',
        'Vivienda y servicios públicos',
        'DANE - Índice de Pobreza Multidimensional 2025'
      ),
      (
        'EXCRETAS',
        'Inadecuada eliminación de excretas',
        '%',
        'Vivienda y servicios públicos',
        'DANE - Índice de Pobreza Multidimensional 2025'
      ),
      (
        'PISOS_INADECUADOS',
        'Pisos inadecuados',
        '%',
        'Vivienda',
        'DANE - Índice de Pobreza Multidimensional 2025'
      ),
      (
        'PAREDES_INADECUADAS',
        'Paredes exteriores inadecuadas',
        '%',
        'Vivienda',
        'DANE - Índice de Pobreza Multidimensional 2025'
      ),
      (
        'HACINAMIENTO',
        'Hacinamiento crítico',
        '%',
        'Vivienda',
        'DANE - Índice de Pobreza Multidimensional 2025'
      )
    ON CONFLICT (codigo) DO NOTHING;
  `);

  // 8. Valores PDET 2025 obtenidos mediante
  // procesamiento ponderado de los microdatos DANE.
  await pool.query(`
    INSERT INTO valores_indicador
      (
        territorio_codigo,
        indicador_id,
        periodo,
        valor,
        fuente,
        fecha_actualizacion
      )
    SELECT
      'PDET-CO',
      i.id,
      '2025',
      d.valor,
      'DANE - Índice de Pobreza Multidimensional 2025',
      CURRENT_DATE
    FROM (
      VALUES
        ('IPM', 21.3546),
        ('LOGRO_EDUCATIVO', 57.8),
        ('ANALFABETISMO', 13.2),
        ('INASISTENCIA', 6.3),
        ('REZAGO_ESCOLAR', 36.3),
        ('TRABAJO_INFANTIL', 4.3),
        ('SIN_ASEGURAMIENTO', 3.7),
        ('BARRERAS_SALUD', 3.5),
        ('DESEMPLEO_LARGA_DURACION', 7.1),
        ('EMPLEO_INFORMAL', 91.8),
        ('SIN_ACUEDUCTO', 31.3),
        ('EXCRETAS', 26.2),
        ('PISOS_INADECUADOS', 12.7),
        ('PAREDES_INADECUADAS', 5.9),
        ('HACINAMIENTO', 11.7)
    ) AS d(codigo, valor)

    INNER JOIN indicadores i
      ON i.codigo = d.codigo

    ON CONFLICT (territorio_codigo, indicador_id, periodo)
    DO UPDATE SET
      valor = EXCLUDED.valor,
      fuente = EXCLUDED.fuente,
      fecha_actualizacion = EXCLUDED.fecha_actualizacion;
  `);

  console.log("Estructura PostgreSQL verificada correctamente.");
  console.log("Datos PDET 2025 cargados correctamente.");
  console.log("Fuente: DANE - Índice de Pobreza Multidimensional 2025.");
}

module.exports = inicializarDatabase;
