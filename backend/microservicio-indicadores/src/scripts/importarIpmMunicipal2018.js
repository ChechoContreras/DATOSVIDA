
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const pool = require("../config/database");

/**
 * DATAVIDA
 * Importador de IPM municipal censal 2018.
 *
 * Fuente: DANE - CNPV 2018.
 *
 * MODO PRUEBA:
 * npm run importar:ipm2018
 *
 * MODO IMPORTACIÓN:
 * npm run importar:ipm2018 -- --confirmar
 *
 * Solo procesa los municipios PDET existentes.
 * No modifica datos de otros periodos.
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

const CONFIRMAR = process.argv.includes("--confirmar");

const COLUMNAS = {
  IPM: "IPM Municipal",
  ANALFABETISMO: "Analfabetismo",
  LOGRO_EDUCATIVO: "Bajo logro educativo",
  BARRERAS_SALUD:
    "Barreras de acceso a servicios de salud",
  HACINAMIENTO: "Hacinamiento crítico",
  EXCRETAS: "Inadecuada eliminación de excretas",
  INASISTENCIA: "Inasistencia escolar",
  PAREDES_INADECUADAS:
    "Material inadecuado de paredes exteriores",
  PISOS_INADECUADOS: "Material inadecuado de pisos",
  REZAGO_ESCOLAR: "Rezago escolar",
  SIN_ACUEDUCTO:
    "Sin acceso a fuente de agua mejorada",
  SIN_ASEGURAMIENTO: "Sin aseguramiento en salud",
  TRABAJO_INFANTIL: "Trabajo infantil",
  EMPLEO_INFORMAL: "Trabajo informal",
};

// El anexo también incluye otras variables,
// pero no se importan sin un indicador equivalente.
//
// DESEMPLEO_LARGA_DURACION no tiene una columna
// equivalente en este archivo.

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
  return String(valor ?? "")
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
    String(valor).trim() === ""
  ) {
    return null;
  }

  const numero =
    typeof valor === "number"
      ? valor
      : Number(
          String(valor)
            .trim()
            .replace(",", ".")
        );

  if (
    !Number.isFinite(numero) ||
    numero < 0 ||
    numero > 100
  ) {
    return null;
  }

  return numero;
}

function leerHoja(libro, nombre, filaEncabezado) {
  const hoja = libro.Sheets[nombre];

  if (!hoja) {
    throw new Error(
      `No existe la hoja "${nombre}".`
    );
  }

  const filas = XLSX.utils.sheet_to_json(hoja, {
    range: filaEncabezado - 1,
    raw: true,
    defval: null,
  });

  if (filas.length === 0) {
    throw new Error(
      `La hoja "${nombre}" está vacía.`
    );
  }

  return filas;
}

function validarColumnas(filas, columnas, hoja) {
  const disponibles = new Set(
    Object.keys(filas[0]).map(normalizarTexto)
  );

  for (const columna of columnas) {
    if (!disponibles.has(normalizarTexto(columna))) {
      throw new Error(
        `Falta la columna "${columna}" ` +
        `en la hoja "${hoja}".`
      );
    }
  }
}

function obtenerCampo(fila, nombre) {
  const buscado = normalizarTexto(nombre);

  const entrada = Object.entries(fila).find(
    ([clave]) => normalizarTexto(clave) === buscado
  );

  return entrada ? entrada[1] : null;
}

function construirDatos(libro) {
  const nombreIpm = "2_IPM Mpio y Dpt";
  const nombrePrivaciones =
    "6_Privaciones IPM Dpt-Mpio";

  const filasIpm = leerHoja(
    libro,
    nombreIpm,
    1
  );

  const filasPrivaciones = leerHoja(
    libro,
    nombrePrivaciones,
    2
  );

  validarColumnas(
    filasIpm,
    ["ID", "Municipio", "IPM Municipal"],
    nombreIpm
  );

  validarColumnas(
    filasPrivaciones,
    [
      "ID",
      "Municipio",
      ...Object.values(COLUMNAS).filter(
        (nombre) => nombre !== "IPM Municipal"
      ),
    ],
    nombrePrivaciones
  );

  console.log(
    `Filas IPM leídas: ${filasIpm.length}`
  );

  console.log(
    `Filas de privaciones: ${filasPrivaciones.length}`
  );

  const datos = new Map();

  // =====================================
  // LEER IPM MUNICIPAL
  // =====================================

  for (const fila of filasIpm) {
    const codigo = normalizarCodigo(
      obtenerCampo(fila, "ID")
    );

    const valor = obtenerValor(
      obtenerCampo(fila, "IPM Municipal")
    );

    if (!codigo || valor === null) {
      continue;
    }

    if (datos.has(codigo)) {
      throw new Error(
        `Código municipal duplicado: ${codigo}`
      );
    }

    datos.set(codigo, {
      codigo,
      nombre: obtenerCampo(fila, "Municipio"),
      indicadores: {
        IPM: valor,
      },
    });
  }

  // =====================================
  // LEER PRIVACIONES MUNICIPALES
  // =====================================

  const codigosPrivaciones =
    Object.keys(COLUMNAS).filter(
      (codigo) => codigo !== "IPM"
    );

  const municipiosConPrivaciones = new Set();

  for (const fila of filasPrivaciones) {
    const codigo = normalizarCodigo(
      obtenerCampo(fila, "ID")
    );

    if (!datos.has(codigo)) {
      continue;
    }

    if (municipiosConPrivaciones.has(codigo)) {
      throw new Error(
        `Privaciones duplicadas para ${codigo}`
      );
    }

    municipiosConPrivaciones.add(codigo);

    const registro = datos.get(codigo);

    for (const codigoIndicador of codigosPrivaciones) {
      const columna = COLUMNAS[codigoIndicador];

      const valor = obtenerValor(
        obtenerCampo(fila, columna)
      );

      if (valor !== null) {
        registro.indicadores[codigoIndicador] =
          valor;
      }
    }
  }

  console.log(
    `Municipios con IPM válido: ${datos.size}`
  );

  console.log(
    "Municipios con privaciones:",
    municipiosConPrivaciones.size
  );

  return datos;
}

async function importar() {
  let cliente = null;
  let transaccion = false;

  try {
    console.log(
      "===================================="
    );

    console.log(
      "DATAVIDA - IPM MUNICIPAL DANE 2018"
    );

    console.log(
      CONFIRMAR
        ? "MODO IMPORTACIÓN"
        : "MODO PRUEBA - SIN ESCRITURA"
    );

    console.log(
      "===================================="
    );

    // =====================================
    // 1. VALIDAR ARCHIVO
    // =====================================

    if (!fs.existsSync(ARCHIVO)) {
      throw new Error(
        `No se encontró el Excel: ${ARCHIVO}`
      );
    }

    const libro = XLSX.readFile(ARCHIVO);

    const datos = construirDatos(libro);

    // =====================================
    // 2. CONECTAR A POSTGRESQL
    // =====================================

    cliente = await pool.connect();

    const resultadoMunicipios =
      await cliente.query(`
        SELECT codigo, nombre
        FROM municipios
        WHERE es_pdet = true
        ORDER BY codigo;
      `);

    const municipiosPdet =
      resultadoMunicipios.rows;

    if (municipiosPdet.length !== 170) {
      throw new Error(
        "Se esperaban 170 municipios PDET. " +
        `Encontrados: ${municipiosPdet.length}`
      );
    }

    const encontrados = municipiosPdet.filter(
      (municipio) => datos.has(municipio.codigo)
    );

    const faltantes = municipiosPdet.filter(
      (municipio) => !datos.has(municipio.codigo)
    );

    console.log(
      `Municipios PDET: ${municipiosPdet.length}`
    );

    console.log(
      `Con IPM disponible: ${encontrados.length}`
    );

    if (faltantes.length > 0) {
      console.log(
        "Municipios sin coincidencia:",
        faltantes
      );
    }

    if (encontrados.length < 150) {
      throw new Error(
        "Cobertura PDET insuficiente. " +
        "No se permite importar."
      );
    }

    // =====================================
    // 3. VALIDAR INDICADORES
    // =====================================

    const resultadoIndicadores =
      await cliente.query(`
        SELECT id, codigo
        FROM indicadores;
      `);

    const indicadores = new Map(
      resultadoIndicadores.rows.map(
        (indicador) => [
          indicador.codigo,
          indicador.id,
        ]
      )
    );

    for (const codigo of Object.keys(COLUMNAS)) {
      if (!indicadores.has(codigo)) {
        throw new Error(
          `Indicador inexistente: ${codigo}`
        );
      }
    }

    // =====================================
    // 4. PREPARAR REGISTROS
    // =====================================

    const registros = [];

    for (const municipio of encontrados) {
      const datosMunicipio = datos.get(
        municipio.codigo
      );

      for (const [
        codigoIndicador,
        valor,
      ] of Object.entries(
        datosMunicipio.indicadores
      )) {
        registros.push({
          municipioCodigo: municipio.codigo,
          municipioNombre: municipio.nombre,
          indicadorId: indicadores.get(
            codigoIndicador
          ),
          indicadorCodigo: codigoIndicador,
          valor,
        });
      }
    }

    console.log(
      `Valores preparados: ${registros.length}`
    );

    // =====================================
    // 5. VERIFICACIÓN DE EJEMPLO
    // =====================================

    const ejemplo = registros.filter(
      (registro) =>
        registro.municipioCodigo === "54206" &&
        ["IPM", "INASISTENCIA"].includes(
          registro.indicadorCodigo
        )
    );

    console.log(
      "Ejemplo Convención:",
      ejemplo
    );

    // =====================================
    // 6. MODO PRUEBA
    // =====================================

    if (!CONFIRMAR) {
      console.log(
        "PRUEBA COMPLETADA."
      );

      console.log(
        "No se modificó PostgreSQL."
      );

      console.log(
        "Para importar se requiere --confirmar."
      );

      return;
    }

    // =====================================
    // 7. IMPORTACIÓN TRANSACCIONAL
    // =====================================

    await cliente.query("BEGIN");
    transaccion = true;

    for (const municipio of encontrados) {
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
    }

    for (const registro of registros) {
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
          registro.municipioCodigo,
          registro.indicadorId,
          PERIODO,
          registro.valor,
          FUENTE,
        ]
      );
    }

    await cliente.query("COMMIT");
    transaccion = false;

    console.log(
      "===================================="
    );

    console.log(
      "IMPORTACIÓN COMPLETADA"
    );

    console.log(
      `Municipios: ${encontrados.length}`
    );

    console.log(
      `Valores: ${registros.length}`
    );

    console.log(
      `Periodo: ${PERIODO}`
    );

    console.log(
      "===================================="
    );

  } catch (error) {
    if (cliente && transaccion) {
      await cliente.query("ROLLBACK");
    }

    console.error(
      "ERROR EN IMPORTACIÓN:",
      error.message
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
