/**
 * DataVida - Importador oficial de municipios PDET
 *
 * Fuente:
 * Agencia de Renovación del Territorio (ART)
 * Datos Abiertos Colombia - "Municipios PDET"
 * Dataset ID: idrk-ba8y
 *
 * Este script consulta la fuente oficial y carga/actualiza
 * la estructura territorial PDET en PostgreSQL.
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

function texto(valor) {
  return String(valor ?? "").trim();
}

function codigoDepartamento(valor) {
  return texto(valor).padStart(2, "0");
}

function codigoMunicipio(valor) {
  return texto(valor).padStart(5, "0");
}

async function obtenerDatosOficiales() {
  const respuesta = await fetch(DATASET_URL);

  if (!respuesta.ok) {
    throw new Error(
      `No fue posible descargar ART: HTTP ${respuesta.status}`
    );
  }

  const datos = await respuesta.json();

  if (!Array.isArray(datos) || datos.length === 0) {
    throw new Error(
      "La fuente oficial ART no devolvió registros."
    );
  }

  return datos;
}

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

async function cargar() {
  const datos = await obtenerDatosOficiales();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await asegurarEstructura(client);

    for (const fila of datos) {
      const subregionCodigo = Number(fila.cod_subreg);
      const subregionNombre = texto(fila.nom_subreg);

      const departamentoCodigo =
        codigoDepartamento(fila.cod_depto);

      const departamentoNombre =
        texto(fila.nom_depto);

      const municipioCodigo =
        codigoMunicipio(fila.cod_muni);

      const municipioNombre =
        texto(fila.nom_muni);

      if (
        !Number.isInteger(subregionCodigo) ||
        !subregionNombre ||
        !departamentoCodigo ||
        !departamentoNombre ||
        !municipioCodigo ||
        !municipioNombre
      ) {
        throw new Error(
          `Registro ART incompleto: ${JSON.stringify(fila)}`
        );
      }

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
          subregionCodigo,
          subregionNombre,
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
          departamentoCodigo,
          departamentoNombre,
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
          municipioCodigo,
          municipioNombre,
          departamentoCodigo,
          subregionCodigo,
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
        `${c.subregiones} subregiones. ` +
        `Se esperaba 170 y 16.`
      );
    }

    await client.query("COMMIT");

    console.log(
      "Carga territorial PDET completada."
    );

    console.log(
      `Municipios PDET: ${c.municipios}`
    );

    console.log(
      `Subregiones PDET: ${c.subregiones}`
    );

    console.log(
      `Departamentos presentes: ${c.departamentos}`
    );

    console.log(
      "Fuente: Agencia de Renovación del Territorio - ART."
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

cargar().catch((error) => {
  console.error(
    "Error cargando municipios PDET:",
    error
  );

  process.exit(1);
});
