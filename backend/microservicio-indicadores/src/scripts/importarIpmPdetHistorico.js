
const path = require("path");
const XLSX = require("xlsx");

/**
 * DATAVIDA
 * Importador histórico IPM PDET 2018-2025.
 *
 * Fuente: DANE - Encuesta Nacional de Calidad
 * de Vida (ECV), anexo PMPDET 2025.
 *
 * Lee:
 * - IPM_PDET_Dominios
 * - IPM_PDET_Indicadores
 *
 * No inventa valores ni series municipales.
 *
 * PRUEBA:
 * npm run importar:pdet-historico
 *
 * IMPORTACIÓN:
 * npm run importar:pdet-historico -- --confirmar
 */

const ARCHIVO = path.join(
  __dirname,
  "..",
  "data",
  "anex-PMPDET-2025.xlsx"
);

const CONFIRMAR = process.argv.includes("--confirmar");

const FUENTE =
  "DANE - ECV - IPM PDET, anexo 2025";

const ANIOS = Array.from(
  { length: 8 },
  (_, i) => String(2018 + i)
);

const TERRITORIOS = {
  Agregado: {
    codigo: "PDET-CO",
    nombre: "Agregado PDET Colombia",
    tipo: "Agregado PDET"
  },
  Cabeceras: {
    codigo: "PDET-CAB",
    nombre: "Cabeceras PDET",
    tipo: "Dominio PDET"
  },
  "Centros poblados y rural disperso": {
    codigo: "PDET-RUR",
    nombre: "Centros poblados y rural disperso PDET",
    tipo: "Dominio PDET"
  }
};

/*
 * Los códigos TC_ corresponden exclusivamente
 * a tasas censuradas de la ECV.
 *
 * No se mezclan con indicadores censales
 * municipales de 2018.
 */
const INDICADORES = {
  "analfabetismo": [
    "TC_ANALFABETISMO",
    "Analfabetismo",
    "Educación"
  ],
  "bajo logro educativo": [
    "TC_LOGRO_EDUCATIVO",
    "Bajo logro educativo",
    "Educación"
  ],
  "barreras a servicios para cuidado de la primera infancia": [
    "TC_PRIMERA_INFANCIA",
    "Barreras para cuidado de la primera infancia",
    "Niñez y juventud"
  ],
  "barreras de acceso a servicios de salud": [
    "TC_BARRERAS_SALUD",
    "Barreras de acceso a servicios de salud",
    "Salud"
  ],
  "desempleo de larga duracion": [
    "TC_DESEMPLEO_LARGA_DURACION",
    "Desempleo de larga duración",
    "Trabajo"
  ],
  "hacinamiento critico": [
    "TC_HACINAMIENTO",
    "Hacinamiento crítico",
    "Vivienda"
  ],
  "inadecuada eliminacion de excretas": [
    "TC_EXCRETAS",
    "Inadecuada eliminación de excretas",
    "Vivienda y servicios públicos"
  ],
  "inasistencia escolar": [
    "TC_INASISTENCIA",
    "Inasistencia escolar",
    "Educación"
  ],
  "material inadecuado de paredes exteriores": [
    "TC_PAREDES_INADECUADAS",
    "Material inadecuado de paredes exteriores",
    "Vivienda"
  ],
  "material inadecuado de pisos": [
    "TC_PISOS_INADECUADOS",
    "Material inadecuado de pisos",
    "Vivienda"
  ],
  "rezago escolar": [
    "TC_REZAGO_ESCOLAR",
    "Rezago escolar",
    "Educación"
  ],
  "sin acceso a fuente de agua mejorada": [
    "TC_SIN_ACUEDUCTO",
    "Sin acceso a fuente de agua mejorada",
    "Vivienda y servicios públicos"
  ],
  "sin aseguramiento en salud": [
    "TC_SIN_ASEGURAMIENTO",
    "Sin aseguramiento en salud",
    "Salud"
  ],
  "trabajo infantil": [
    "TC_TRABAJO_INFANTIL",
    "Trabajo infantil",
    "Niñez y juventud"
  ],
  "trabajo informal": [
    "TC_EMPLEO_INFORMAL",
    "Trabajo informal",
    "Trabajo"
  ]
};

function normalizar(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function esAnio(celda) {
  return /^20\d{2}\*?$/.test(
    String(celda ?? "").trim()
  );
}

function obtenerAnio(celda) {
  return String(celda).trim().replace("*", "");
}

function obtenerNumero(celda) {
  if (
    celda === null ||
    celda === undefined ||
    String(celda).trim() === ""
  ) {
    return null;
  }

  const valor = Number(
    String(celda).trim().replace(",", ".")
  );

  return Number.isFinite(valor) ? valor : null;
}

function leerHoja(libro, nombre) {
  const hoja = libro.Sheets[nombre];

  if (!hoja) {
    throw new Error(
      `No existe la hoja: ${nombre}`
    );
  }

  return XLSX.utils.sheet_to_json(hoja, {
    header: 1,
    defval: "",
    raw: true
  });
}

function columnasAnuales(fila) {
  const columnas = [];

  fila.forEach((celda, indice) => {
    if (esAnio(celda)) {
      const anio = obtenerAnio(celda);

      if (ANIOS.includes(anio)) {
        columnas.push({ indice, anio });
      }
    }
  });

  const periodos = columnas.map(c => c.anio);

  if (
    columnas.length === 8 &&
    ANIOS.every(anio => periodos.includes(anio))
  ) {
    return columnas;
  }

  return null;
}

function reconocerDominio(texto) {
  const buscado = normalizar(texto);

  return Object.keys(TERRITORIOS).find(
    nombre => normalizar(nombre) === buscado
  ) || null;
}

function validarValor(valor, contexto) {
  if (
    valor === null ||
    valor < 0 ||
    valor > 100
  ) {
    throw new Error(
      `Valor inválido o faltante: ${contexto}`
    );
  }
}

/*
 * Extrae la incidencia IPM por dominio.
 * Espera tres dominios y ocho años.
 */
function extraerIpm(filas) {
  const registros = [];
  let columnas = null;

  for (const fila of filas) {
    const encabezado = columnasAnuales(fila);

    if (encabezado) {
      columnas = encabezado;
      continue;
    }

    if (!columnas) continue;

    const dominio = reconocerDominio(fila[0]);

    if (!dominio) continue;

    for (const { indice, anio } of columnas) {
      const valor = obtenerNumero(fila[indice]);

      validarValor(
        valor,
        `IPM ${dominio} ${anio}`
      );

      registros.push({
        dominio,
        indicador: "IPM",
        periodo: anio,
        valor
      });
    }
  }

  return registros;
}

/*
 * Extrae tasas censuradas por indicador.
 *
 * La hoja está organizada en bloques:
 * Agregado, Cabeceras y Rural.
 *
 * Columna A: dominio.
 * Columna B: indicador.
 * Columnas siguientes: valores anuales.
 */
function extraerIndicadores(filas) {
  const registros = [];
  const omitidos = new Set();

  let dominio = null;
  let columnas = null;

  for (const fila of filas) {
    const nuevoDominio =
      reconocerDominio(fila[0]);

    if (nuevoDominio) {
      dominio = nuevoDominio;
    }

    const encabezado = columnasAnuales(fila);

    if (encabezado) {
      columnas = encabezado;
      continue;
    }

    if (!dominio || !columnas) continue;

    const nombreOriginal =
      String(fila[1] ?? "").trim();

    const nombre = normalizar(nombreOriginal);

    if (!nombre) continue;

    const definicion = INDICADORES[nombre];

    if (!definicion) {
      const tieneNumeros = columnas.some(
        ({ indice }) =>
          obtenerNumero(fila[indice]) !== null
      );

      if (tieneNumeros) {
        omitidos.add(nombreOriginal);
      }

      continue;
    }

    const codigo = definicion[0];

    for (const { indice, anio } of columnas) {
      const valor = obtenerNumero(fila[indice]);

      validarValor(
        valor,
        `${dominio} ${codigo} ${anio}`
      );

      registros.push({
        dominio,
        indicador: codigo,
        periodo: anio,
        valor
      });
    }
  }

  return {
    registros,
    omitidos: [...omitidos]
  };
}

function validarRegistros(registros) {
  const claves = new Set();

  for (const registro of registros) {
    const territorio =
      TERRITORIOS[registro.dominio];

    if (!territorio) {
      throw new Error(
        `Dominio desconocido: ${registro.dominio}`
      );
    }

    const clave = [
      territorio.codigo,
      registro.indicador,
      registro.periodo
    ].join("|");

    if (claves.has(clave)) {
      throw new Error(
        `Registro duplicado: ${clave}`
      );
    }

    claves.add(clave);
  }

  const ipm = registros.filter(
    r => r.indicador === "IPM"
  );

  if (ipm.length !== 24) {
    throw new Error(
      `IPM incompleto: ${ipm.length} de 24 valores`
    );
  }

  for (const dominio of Object.keys(TERRITORIOS)) {
    for (const anio of ANIOS) {
      const existe = ipm.some(
        r =>
          r.dominio === dominio &&
          r.periodo === anio
      );

      if (!existe) {
        throw new Error(
          `Falta IPM: ${dominio} ${anio}`
        );
      }
    }
  }

  const tasas = registros.filter(
    r => r.indicador.startsWith("TC_")
  );

  const esperados =
    Object.keys(TERRITORIOS).length *
    Object.keys(INDICADORES).length *
    ANIOS.length;

  if (tasas.length !== esperados) {
    throw new Error(
      `Tasas censuradas incompletas: ` +
      `${tasas.length} de ${esperados}`
    );
  }

  return {
    ipm: ipm.length,
    tasas: tasas.length,
    total: registros.length
  };
}

function leerAnexo() {
  const libro = XLSX.readFile(ARCHIVO);

  const ipm = extraerIpm(
    leerHoja(libro, "IPM_PDET_Dominios")
  );

  const resultado = extraerIndicadores(
    leerHoja(libro, "IPM_PDET_Indicadores")
  );

  const registros = [
    ...ipm,
    ...resultado.registros
  ];

  const resumen = validarRegistros(registros);

  return {
    registros,
    omitidos: resultado.omitidos,
    resumen
  };
}

async function importar(registros) {
  const pool = require("../config/database");
  let cliente;
  let transaccion = false;

  try {
    cliente = await pool.connect();

    await cliente.query("BEGIN");
    transaccion = true;

    // Registrar territorios sin alterar
    // otros territorios existentes.
    for (const territorio of Object.values(
      TERRITORIOS
    )) {
      await cliente.query(
        `
        INSERT INTO territorios (
          codigo, nombre, tipo
        )
        VALUES ($1, $2, $3)
        ON CONFLICT (codigo) DO NOTHING
        `,
        [
          territorio.codigo,
          territorio.nombre,
          territorio.tipo
        ]
      );
    }

    // Registrar las tasas censuradas
    // con códigos propios.
    for (const definicion of Object.values(
      INDICADORES
    )) {
      const [codigo, nombre, dimension] =
        definicion;

      await cliente.query(
        `
        INSERT INTO indicadores (
          codigo,
          nombre,
          unidad,
          dimension,
          fuente
        )
        VALUES ($1, $2, '%', $3, $4)
        ON CONFLICT (codigo) DO NOTHING
        `,
        [
          codigo,
          nombre,
          dimension,
          FUENTE + " - Tasa censurada"
        ]
      );
    }

    const resultado = await cliente.query(
      `
      SELECT id, codigo
      FROM indicadores
      WHERE codigo = 'IPM'
         OR codigo LIKE 'TC_%'
      `
    );

    const ids = new Map(
      resultado.rows.map(
        fila => [fila.codigo, fila.id]
      )
    );

    for (const registro of registros) {
      const indicadorId =
        ids.get(registro.indicador);

      if (!indicadorId) {
        throw new Error(
          `Indicador inexistente: ${registro.indicador}`
        );
      }

      const territorio =
        TERRITORIOS[registro.dominio].codigo;

      const fuenteRegistro =
        registro.indicador === "IPM"
          ? FUENTE + " - Incidencia IPM"
          : FUENTE + " - Tasa censurada";

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
            EXCLUDED.fecha_actualizacion
        `,
        [
          territorio,
          indicadorId,
          registro.periodo,
          registro.valor,
          fuenteRegistro
        ]
      );
    }

    await cliente.query("COMMIT");
    transaccion = false;

    console.log(
      "IMPORTACIÓN COMPLETADA CORRECTAMENTE"
    );

    console.log(
      `Registros procesados: ${registros.length}`
    );

  } catch (error) {
    if (cliente && transaccion) {
      await cliente.query("ROLLBACK");
    }

    throw error;

  } finally {
    if (cliente) {
      cliente.release();
    }

    await pool.end();
  }
}

async function main() {
  console.log(
    "DATAVIDA - IMPORTADOR HISTÓRICO PDET"
  );

  console.log(`Archivo: ${ARCHIVO}`);

  const {
    registros,
    omitidos,
    resumen
  } = leerAnexo();

  console.log("RESULTADO DE VALIDACIÓN");
  console.log(`Incidencia IPM: ${resumen.ipm}`);
  console.log(`Tasas censuradas: ${resumen.tasas}`);
  console.log(`Total: ${resumen.total}`);

  if (omitidos.length) {
    console.log(
      "Nombres no reconocidos:",
      omitidos
    );
  }

  console.log(
    "Ejemplo: IPM agregado PDET 2025"
  );

  const ejemplo = registros.find(
    r =>
      r.dominio === "Agregado" &&
      r.indicador === "IPM" &&
      r.periodo === "2025"
  );

  console.log(ejemplo);

  if (!ejemplo || ejemplo.valor !== 21.2) {
    throw new Error(
      "Validación fallida: IPM PDET 2025 debe ser 21.2"
    );
  }

  if (!CONFIRMAR) {
    console.log(
      "MODO PRUEBA: PostgreSQL no fue modificado."
    );
    return;
  }

  await importar(registros);
}

if (require.main === module) {
  main().catch(error => {
    console.error(
      "ERROR DE IMPORTACIÓN:",
      error.message
    );

    process.exitCode = 1;
  });
}

module.exports = {
  leerAnexo,
  TERRITORIOS,
  INDICADORES
};
