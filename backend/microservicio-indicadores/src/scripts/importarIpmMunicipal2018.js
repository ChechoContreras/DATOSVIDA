
const path = require("path");
const XLSX = require("xlsx");
const pool = require("../config/database");

/**
 * DATAVIDA
 * Importación de IPM municipal censal 2018.
 *
 * Fuente: DANE - CNPV 2018.
 *
 * Solo importa municipios existentes en
 * la tabla municipios con es_pdet = true.
 *
 * No elimina información existente.
 * No modifica registros de otros periodos.
 */

const ARCHIVO = path.join(
  __dirname,
  "..",
  "data",
  "anexo-censal-pobreza-municipal-2018.xlsx"
);

const FUENTE =
  "DANE - IPM municipal de fuente censal CNPV 2018";

const PERIODO = "2018";

// Columnas del anexo DANE:
// Hoja 2: ID, Municipio, IPM...
// Hoja 6: ID, Municipio y privaciones.

const COLUMNAS_PRIVACIONES = {
  ANALFABETISMO: "Analfabetismo",
  LOGRO_EDUCATIVO: "Bajo logro educativo",
  BARRERAS_SALUD:
    "Barreras de acceso a servicios de salud",
  HACINAMIENTO: "Hacinamiento crítico",
  EXCRETAS:
    "Inadecuada eliminación de excretas",
  INASISTENCIA: "Inasistencia escolar",
  PAREDES_INADECUADAS:
    "Material inadecuado de paredes exteriores",
  PISOS_INADECUADOS:
    "Material inadecuado de pisos",
  REZAGO_ESCOLAR: "Rezago escolar",
  SIN_ACUEDUCTO:
    "Sin acceso a fuente de agua mejorada",
  SIN_ASEGURAMIENTO:
    "Sin aseguramiento en salud",
  TRABAJO_INFANTIL: "Trabajo infantil",
  EMPLEO_INFORMAL: "Trabajo informal",
};

// Desempleo de larga duración no aparece
// como variable equivalente en este anexo.
// Por ello no se importa.

function normalizarCodigo(valor) {
  if (valor === null || valor === undefined) {
    return "";
  }

  const codigo = String(valor).trim();

  if (!/^\d{1,5}$/.test(codigo)) {
    return "";
  }

  return codigo.padStart(5, "0");
}

function normalizarTexto(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function obtenerValor(valor) {
  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    return null;
  }

  const numero =
    typeof valor === "number"
      ? valor
      : Number(String(valor).replace(",", "."));

  if (
    !Number.isFinite(numero) ||
    numero < 0 ||
    numero > 100
  ) {
    return null;
  }

  return numero;
}

function leerHoja(libro, nombre, encabezado) {
  const hoja = libro.Sheets[nombre];

  if (!hoja) {
    throw new Error(
      `No se encontró la hoja: ${nombre}`
    );
  }

  const filas = XLSX.utils.sheet_to_json(hoja, {
    range: encabezado - 1,
    defval: null,
    raw: true,
  });

  if (!filas.length) {
    throw new Error(
      `La hoja ${nombre} no contiene registros.`
    );
  }

  return filas;
}

async function importar() {
  let cliente;

  try {
    console.log(
      "DATAVIDA: Iniciando importación DANE 2018..."
    );

    // =====================================
    // 1. LEER EXCEL
    // =====================================

    const libro = XLSX.readFile(ARCHIVO);

    const filasIpm = leerHoja(
      libro,
      "2_IPM Mpio y Dpt",
      1
    );

    const filasPrivaciones = leerHoja(
      libro,
      "6_Privaciones IPM Dpt-Mpio",
      2
    );

    console.log(
      `Filas IPM encontradas: ${filasIpm.length}`
    );

    console.log(
      `Filas de privaciones: ${filasPrivaciones.length}`
    );

    // =====================================
    // 2. ORGANIZAR DATOS POR MUNICIPIO
    // =====================================

    const datosMunicipales = new Map();

    for (const fila of filasIpm) {
      const codigo = normalizarCodigo(fila.ID);
      const valor = obtenerValor(fila.IPM);

      if (!codigo || valor === null) {
        continue;
      }

      datosMunicipales.set(codigo, {
        codigo,
        nombre: fila.Municipio,
        indicadores: {
          IPM: valor,
        },
      });
    }

    const columnasNormalizadas = Object.fromEntries(
      Object.entries(COLUMNAS_PRIVACIONES).map(
        ([codigo, nombre]) => [
          codigo,
          normalizarTexto(nombre),
        ]
      )
    );

    for (const fila of filasPrivaciones) {
      const codigo = normalizarCodigo(fila.ID);

      if (!datosMunicipales.has(codigo)) {
        continue;
      }

      const registro = datosMunicipales.get(codigo);

      const valoresFila = new Map(
        Object.entries(fila).map(([nombre, valor]) => [
          normalizarTexto(nombre),
          valor,
        ])
      );

      for (const [
        codigoIndicador,
        nombreColumna,
      ] of Object.entries(columnasNormalizadas)) {
        const valor = obtenerValor(
          valoresFila.get(nombreColumna)
        );

        if (valor !== null) {
          registro.indicadores[codigoIndicador] =
            valor;
        }
      }
    }

    // =====================================
    // 3. CONECTAR A POSTGRESQL
    // =====================================

    cliente = await pool.connect();

    await cliente.query("BEGIN");

    // =====================================
    // 4. CONSULTAR MUNICIPIOS PDET
    // =====================================

    const resultadoMunicipios = await cliente.query(`
      SELECT codigo, nombre
      FROM municipios
      WHERE es_pdet = true
      ORDER BY codigo;
    `);

    const municipiosPdet = resultadoMunicipios.rows;

    console.log(
      `Municipios PDET en PostgreSQL: ${municipiosPdet.length}`
    );

    if (municipiosPdet.length !== 170) {
      throw new Error(
        "Se esperaban 170 municipios PDET. " +
        "Se cancela la importación para revisión."
      );
    }

    // =====================================
    // 5. CONSULTAR CATÁLOGO INDICADORES
    // =====================================

    const resultadoIndicadores = await cliente.query(`
      SELECT id, codigo
      FROM indicadores;
    `);

    const indicadores = new Map(
      resultadoIndicadores.rows.map((i) => [
        i.codigo,
        i.id,
      ])
    );

    const codigosRequeridos = [
      "IPM",
      ...Object.keys(COLUMNAS_PRIVACIONES),
    ];

    for (const codigo of codigosRequeridos) {
      if (!indicadores.has(codigo)) {
        throw new Error(
          `Falta el indicador ${codigo} en PostgreSQL.`
        );
      }
    }

    // =====================================
    // 6. VERIFICAR COBERTURA
    // =====================================

    const encontrados = municipiosPdet.filter(
      (municipio) =>
        datosMunicipales.has(municipio.codigo)
    );

    const faltantes = municipiosPdet.filter(
      (municipio) =>
        !datosMunicipales.has(municipio.codigo)
    );

    console.log(
      `Municipios PDET con IPM: ${encontrados.length}`
    );

    if (faltantes.length) {
      console.log(
        "Municipios sin coincidencia:",
        faltantes
      );
    }

    // Umbral de seguridad: evita importar
    // una hoja equivocada o incompleta.
    if (encontrados.length < 150) {
      throw new Error(
        "Cobertura municipal insuficiente. " +
        "Se cancela la importación."
      );
    }

    // =====================================
    // 7. INSERTAR TERRITORIOS MUNICIPALES
    // =====================================

    let valoresInsertados = 0;

    for (const municipio of encontrados) {
      const registro = datosMunicipales.get(
        municipio.codigo
      );

      await cliente.query(
        `
        INSERT INTO territorios (
          codigo,
          nombre,
          tipo
        )
        VALUES ($1, $2, $3)
        ON CONFLICT (codigo) DO NOTHING;
        `,
        [
          municipio.codigo,
          municipio.nombre,
          "Municipio PDET",
        ]
      );

      // ===================================
      // 8. INSERTAR VALORES DANE 2018
      // ===================================

      for (const [
        codigoIndicador,
        valor,
      ] of Object.entries(registro.indicadores)) {
        const indicadorId = indicadores.get(
          codigoIndicador
        );

        if (!indicadorId) {
          continue;
        }

        await cliente.query(
          `
          INSERT INTO valores_indicador (
            territorio_codigo,
            indicador_id,
            periodo,
            valor,
            fuente,
            fecha_actualizacion
          )
          VALUES (
            $1, $2, $3, $4, $5, CURRENT_DATE
          )
          ON CONFLICT (
            territorio_codigo,
            indicador_id,
            periodo
          )
          DO UPDATE SET
            valor = EXCLUDED.valor,
            fuente = EXCLUDED.fuente,
            fecha_actualizacion =
              EXCLUDED.fecha_actualizacion;
          `,
          [
            municipio.codigo,
            indicadorId,
            PERIODO,
            valor,
            FUENTE,
          ]
        );

        valoresInsertados++;
      }
    }

    // =====================================
    // 9. CONFIRMAR TRANSACCIÓN
    // =====================================

    await cliente.query("COMMIT");

    console.log(
      "====================================="
    );
    console.log(
      "IMPORTACIÓN DANE 2018 COMPLETADA"
    );
    console.log(
      `Municipios procesados: ${encontrados.length}`
    );
    console.log(
      `Valores procesados: ${valoresInsertados}`
    );
    console.log(
      "Periodo: 2018"
    );
    console.log(
      "Fuente: DANE - CNPV 2018"
    );
    console.log(
      "====================================="
    );

  } catch (error) {
    if (cliente) {
      await cliente.query("ROLLBACK");
    }

    console.error(
      "Error importando IPM 2018:",
      error
    );

    process.exitCode = 1;

  } finally {
    if (cliente) {
      cliente.release();
    }

    await pool.end();
  }
}

importar();

