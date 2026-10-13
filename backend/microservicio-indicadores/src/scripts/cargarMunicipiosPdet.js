
/**
 * DATAVIDA
 * Importador y diagnóstico de municipios PDET
 *
 * Fuente:
 * Agencia de Renovación del Territorio (ART)
 * Datos Abiertos Colombia
 * Dataset: idrk-ba8y
 *
 * Comandos:
 *
 * npm run importar:pdet -- --diagnostico
 *   Consulta las tablas existentes sin modificar datos.
 *
 * npm run importar:pdet
 *   Importa o actualiza los municipios PDET.
 *
 * IMPORTANTE:
 * El diagnóstico no crea tablas ni modifica registros.
 */

const { Pool } = require("pg");

const DATASET_URL =
  "https://www.datos.gov.co/resource/idrk-ba8y.json?$limit=50000";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

function texto(valor) {
  return String(valor ?? "").trim();
}

function codigoDepartamento(valor) {
  const codigo = texto(valor);

  if (!/^\d{1,2}$/.test(codigo)) {
    throw new Error(
      `Código de departamento inválido: ${codigo}`
    );
  }

  return codigo.padStart(2, "0");
}

function codigoMunicipio(valor) {
  const codigo = texto(valor);

  if (!/^\d{1,5}$/.test(codigo)) {
    throw new Error(
      `Código de municipio inválido: ${codigo}`
    );
  }

  return codigo.padStart(5, "0");
}

// ==========================================
// DESCARGAR DATOS OFICIALES
// ==========================================

async function obtenerDatosOficiales() {
  console.log(
    "Consultando fuente territorial PDET..."
  );

  const respuesta = await fetch(DATASET_URL);

  if (!respuesta.ok) {
    throw new Error(
      `Error consultando ART: HTTP ${respuesta.status}`
    );
  }

  const datos = await respuesta.json();

  if (!Array.isArray(datos) || datos.length === 0) {
    throw new Error(
      "La fuente ART no devolvió registros."
    );
  }

  console.log(
    `Registros descargados: ${datos.length}`
  );

  return datos;
}

// ==========================================
// VALIDAR DATOS ANTES DE IMPORTAR
// ==========================================

function validarDatos(datos) {
  const municipios = new Set();
  const subregiones = new Set();

  const registros = datos.map((fila) => {
    const subregionCodigo = Number(
      fila.cod_subreg
    );

    const subregionNombre = texto(
      fila.nom_subreg
    );

    const departamentoCodigo =
      codigoDepartamento(fila.cod_depto);

    const departamentoNombre = texto(
      fila.nom_depto
    );

    const municipioCodigo =
      codigoMunicipio(fila.cod_muni);

    const municipioNombre = texto(
      fila.nom_muni
    );

    if (
      !Number.isInteger(subregionCodigo) ||
      subregionCodigo <= 0 ||
      !subregionNombre ||
      !departamentoNombre ||
      !municipioNombre
    ) {
      throw new Error(
        `Registro ART incompleto: ${JSON.stringify(fila)}`
      );
    }

    if (municipios.has(municipioCodigo)) {
      throw new Error(
        `Municipio duplicado: ${municipioCodigo}`
      );
    }

    municipios.add(municipioCodigo);
    subregiones.add(subregionCodigo);

    return {
      subregionCodigo,
      subregionNombre,
      departamentoCodigo,
      departamentoNombre,
      municipioCodigo,
      municipioNombre,
    };
  });

  if (
    municipios.size !== 170 ||
    subregiones.size !== 16
  ) {
    throw new Error(
      `Validación ART fallida: ` +
      `${municipios.size} municipios y ` +
      `${subregiones.size} subregiones. ` +
      `Se esperaban 170 y 16.`
    );
  }

  console.log(
    "Validación de fuente ART completada."
  );

  return registros;
}

// ==========================================
// CREAR ESTRUCTURA TERRITORIAL
// ==========================================

async function asegurarEstructura(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS subregiones_pdet (
      codigo INTEGER PRIMARY KEY,
      nombre VARCHAR(150) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS departamentos (
      codigo VARCHAR(2) PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS municipios (
      codigo VARCHAR(5) PRIMARY KEY,
      nombre VARCHAR(150) NOT NULL,
      departamento_codigo VARCHAR(2) NOT NULL
        REFERENCES departamentos(codigo),
      subregion_codigo INTEGER NOT NULL
        REFERENCES subregiones_pdet(codigo),
      es_pdet BOOLEAN NOT NULL DEFAULT TRUE
    );

    CREATE INDEX IF NOT EXISTS idx_municipios_departamento
      ON municipios(departamento_codigo);

    CREATE INDEX IF NOT EXISTS idx_municipios_subregion
      ON municipios(subregion_codigo);
  `);
}

// ==========================================
// DIAGNÓSTICO DE SOLO LECTURA
// ==========================================

async function diagnosticar() {
  const client = await pool.connect();

  try {
    console.log(
      "=================================="
    );
    console.log(
      "DIAGNÓSTICO TERRITORIAL DATAVIDA"
    );
    console.log(
      "=================================="
    );

    const resultado = await client.query(`
      SELECT
        to_regclass('public.municipios')
          AS municipios,

        to_regclass('public.departamentos')
          AS departamentos,

        to_regclass('public.subregiones_pdet')
          AS subregiones
    `);

    const tablas = resultado.rows[0];

    console.log(
      "Tablas encontradas:",
      tablas
    );

    if (
      !tablas.municipios ||
      !tablas.departamentos ||
      !tablas.subregiones
    ) {
      console.log(
        "DIAGNÓSTICO: faltan tablas territoriales."
      );

      console.log(
        "Todavía no se ha confirmado una importación completa."
      );

      return;
    }

    const conteos = await client.query(`
      SELECT
        (
          SELECT COUNT(*)
          FROM municipios
          WHERE es_pdet = TRUE
        ) AS municipios,

        (
          SELECT COUNT(*)
          FROM departamentos
        ) AS departamentos,

        (
          SELECT COUNT(*)
          FROM subregiones_pdet
        ) AS subregiones
    `);

    const c = conteos.rows[0];

    console.log(
      "=================================="
    );

    console.log(
      `Municipios PDET: ${c.municipios}`
    );

    console.log(
      `Departamentos: ${c.departamentos}`
    );

    console.log(
      `Subregiones: ${c.subregiones}`
    );

    console.log(
      "=================================="
    );

    if (
      Number(c.municipios) === 170 &&
      Number(c.subregiones) === 16
    ) {
      console.log(
        "DIAGNÓSTICO: cantidades territoriales correctas."
      );
    } else {
      console.log(
        "DIAGNÓSTICO: cantidades territoriales incompletas."
      );
    }

    console.log(
      "No se modificaron registros."
    );
  } finally {
    client.release();
  }
}

// ==========================================
// IMPORTAR MUNICIPIOS PDET
// ==========================================

async function cargar() {
  console.log(
    "Iniciando importación territorial PDET..."
  );

  const datos = await obtenerDatosOficiales();

  const registros = validarDatos(datos);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await asegurarEstructura(client);

    for (const fila of registros) {
      await client.query(
        `
        INSERT INTO subregiones_pdet (
          codigo,
          nombre
        )
        VALUES ($1, $2)

        ON CONFLICT (codigo)
        DO UPDATE SET
          nombre = EXCLUDED.nombre
        `,
        [
          fila.subregionCodigo,
          fila.subregionNombre,
        ]
      );

      await client.query(
        `
        INSERT INTO departamentos (
          codigo,
          nombre
        )
        VALUES ($1, $2)

        ON CONFLICT (codigo)
        DO UPDATE SET
          nombre = EXCLUDED.nombre
        `,
        [
          fila.departamentoCodigo,
          fila.departamentoNombre,
        ]
      );

      await client.query(
        `
        INSERT INTO municipios (
          codigo,
          nombre,
          departamento_codigo,
          subregion_codigo,
          es_pdet
        )
        VALUES ($1, $2, $3, $4, TRUE)

        ON CONFLICT (codigo)
        DO UPDATE SET
          nombre = EXCLUDED.nombre,
          departamento_codigo =
            EXCLUDED.departamento_codigo,
          subregion_codigo =
            EXCLUDED.subregion_codigo,
          es_pdet = TRUE
        `,
        [
          fila.municipioCodigo,
          fila.municipioNombre,
          fila.departamentoCodigo,
          fila.subregionCodigo,
        ]
      );
    }

    const conteos = await client.query(`
      SELECT
        (
          SELECT COUNT(*)
          FROM municipios
          WHERE es_pdet = TRUE
        ) AS municipios,

        (
          SELECT COUNT(*)
          FROM subregiones_pdet
        ) AS subregiones,

        (
          SELECT COUNT(DISTINCT departamento_codigo)
          FROM municipios
          WHERE es_pdet = TRUE
        ) AS departamentos
    `);

    const c = conteos.rows[0];

    if (
      Number(c.municipios) !== 170 ||
      Number(c.subregiones) !== 16
    ) {
      throw new Error(
        `Validación fallida: ${c.municipios} municipios y ` +
        `${c.subregiones} subregiones.`
      );
    }

    await client.query("COMMIT");

    console.log(
      "=================================="
    );

    console.log(
      "IMPORTACIÓN PDET COMPLETADA"
    );

    console.log(
      `Municipios PDET: ${c.municipios}`
    );

    console.log(
      `Subregiones: ${c.subregiones}`
    );

    console.log(
      `Departamentos: ${c.departamentos}`
    );

    console.log(
      "Fuente: Agencia de Renovación del Territorio."
    );

    console.log(
      "=================================="
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// ==========================================
// EJECUCIÓN CONTROLADA
// ==========================================

async function ejecutar() {
  try {
    if (process.argv.includes("--diagnostico")) {
      await diagnosticar();
    } else {
      await cargar();
    }
  } catch (error) {
    console.error(
      "Error en proceso territorial PDET:",
      error
    );

    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

ejecutar();
