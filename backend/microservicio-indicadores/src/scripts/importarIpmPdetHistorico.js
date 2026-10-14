const path = require("path");
const XLSX = require("xlsx");

/**
 * DATAVIDA
 * Importador de la serie histórica IPM PDET 2018-2025.
 *
 * Fuente: DANE - Encuesta Nacional de Calidad de Vida (ECV),
 * anexo "Pobreza multidimensional PDET" (anex-PMPDET-2025.xlsx).
 *
 * El anexo trae la serie anual 2018-2025 para el agregado PDET y para
 * dos dominios (cabeceras y centros poblados/rural disperso).
 * NO trae datos por municipio: a nivel municipal solo existe el corte
 * censal 2018 (importarIpmMunicipal2018.js).
 *
 * MODO PRUEBA (no escribe en la base de datos):
 *   npm run importar:pdet-historico
 *
 * MODO IMPORTACIÓN:
 *   npm run importar:pdet-historico -- --confirmar
 */

const ARCHIVO = path.join(
  __dirname,
  "..",
  "data",
  "anex-PMPDET-2025.xlsx"
);

const FUENTE =
  "DANE - IPM PDET (ECV), serie 2018-2025";

const CONFIRMAR = process.argv.includes("--confirmar");

// Dominio del anexo -> territorio en la base de datos.
const TERRITORIOS = {
  "Agregado": {
    codigo: "PDET-CO",
    nombre: "PDET Colombia",
    tipo: "Programas de Desarrollo con Enfoque Territorial",
  },
  "Cabeceras": {
    codigo: "PDET-CAB",
    nombre: "PDET Colombia - Cabeceras",
    tipo: "Agregado PDET por dominio",
  },
  "Centros poblados y rural disperso": {
    codigo: "PDET-CPRD",
    nombre: "PDET Colombia - Centros poblados y rural disperso",
    tipo: "Agregado PDET por dominio",
  },
};

// Nombre del indicador en el anexo -> código del catálogo.
const INDICADORES = {
  "analfabetismo": "ANALFABETISMO",
  "bajo logro educativo": "LOGRO_EDUCATIVO",
  "barreras de acceso a servicios de salud": "BARRERAS_SALUD",
  "desempleo de larga duracion": "DESEMPLEO_LARGA_DURACION",
  "hacinamiento critico": "HACINAMIENTO",
  "inadecuada eliminacion de excretas": "EXCRETAS",
  "inasistencia escolar": "INASISTENCIA",
  "material inadecuado de paredes exteriores": "PAREDES_INADECUADAS",
  "material inadecuado de pisos": "PISOS_INADECUADOS",
  "rezago escolar": "REZAGO_ESCOLAR",
  "sin acceso a fuente de agua mejorada": "SIN_ACUEDUCTO",
  "sin aseguramiento en salud": "SIN_ASEGURAMIENTO",
  "trabajo infantil": "TRABAJO_INFANTIL",
  "trabajo informal": "EMPLEO_INFORMAL",
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
  return /^(20\d{2})\*?$/.test(String(celda ?? "").trim());
}

function anioDe(celda) {
  return String(celda).trim().replace("*", "");
}

function numero(celda) {
  const valor = Number(String(celda ?? "").replace(",", "."));
  return celda !== "" && celda !== null && Number.isFinite(valor)
    ? valor
    : null;
}

function leerHoja(libro, nombre) {
  const hoja = libro.Sheets[nombre];

  if (!hoja) {
    throw new Error(`No se encontró la hoja "${nombre}" en el anexo.`);
  }

  return XLSX.utils.sheet_to_json(hoja, {
    header: 1,
    defval: "",
    raw: true,
  });
}

/**
 * Hoja IPM_PDET_Dominios: una fila por dominio, una columna por año.
 * Devuelve [{ dominio, indicador: "IPM", periodo, valor }].
 */
function extraerIpm(filas) {
  const registros = [];
  let anios = null;

  for (const fila of filas) {
    if (!anios) {
      const posibles = fila.filter(esAnio);
      if (posibles.length >= 3) {
        anios = fila.map((c) => (esAnio(c) ? anioDe(c) : null));
      }
      continue;
    }

    const dominio = String(fila[0]).trim();
    if (!TERRITORIOS[dominio]) continue;

    // La serie del dominio está en las mismas columnas que los años;
    // la columna 0 es el nombre del dominio.
    anios.forEach((anio, indice) => {
      if (!anio) return;
      const valor = numero(fila[indice]);
      if (valor !== null) {
        registros.push({ dominio, indicador: "IPM", periodo: anio, valor });
      }
    });
  }

  return registros;
}

/**
 * Hoja IPM_PDET_Indicadores: bloques por dominio; cada bloque repite
 * la fila de años y lista los indicadores en las filas siguientes.
 */
function extraerIndicadores(filas) {
  const registros = [];
  const omitidos = new Set();
  let dominio = null;
  let anios = null;
  let colIndicador = 1;

  for (const fila of filas) {
    if (fila.filter(esAnio).length >= 3) {
      anios = fila.map((c) => (esAnio(c) ? anioDe(c) : null));
      continue;
    }

    const primera = String(fila[0]).trim();
    if (TERRITORIOS[primera]) dominio = primera;
    if (!dominio || !anios) continue;

    const nombre = normalizar(fila[colIndicador]);
    if (!nombre || nombre === "indicador") continue;

    const codigo = INDICADORES[nombre];
    if (!codigo) {
      omitidos.add(String(fila[colIndicador]).trim());
      continue;
    }

    anios.forEach((anio, indice) => {
      if (!anio) return;
      const valor = numero(fila[indice]);
      if (valor !== null) {
        registros.push({ dominio, indicador: codigo, periodo: anio, valor });
      }
    });
  }

  return { registros, omitidos: [...omitidos] };
}

function leerAnexo() {
  const libro = XLSX.readFile(ARCHIVO);

  const ipm = extraerIpm(leerHoja(libro, "IPM_PDET_Dominios"));
  const { registros, omitidos } = extraerIndicadores(
    leerHoja(libro, "IPM_PDET_Indicadores")
  );

  return { registros: [...ipm, ...registros], omitidos };
}

function resumir(registros) {
  const porSerie = new Map();

  for (const r of registros) {
    const clave = `${TERRITORIOS[r.dominio].codigo} | ${r.indicador}`;
    if (!porSerie.has(clave)) porSerie.set(clave, []);
    porSerie.get(clave).push(r.periodo);
  }

  return porSerie;
}

async function importar(registros) {
  const pool = require("../config/database");
  const cliente = await pool.connect();

  try {
    await cliente.query("BEGIN");

    for (const t of Object.values(TERRITORIOS)) {
      await cliente.query(
        `INSERT INTO territorios (codigo, nombre, tipo)
         VALUES ($1, $2, $3)
         ON CONFLICT (codigo) DO UPDATE SET
           nombre = EXCLUDED.nombre,
           tipo = EXCLUDED.tipo`,
        [t.codigo, t.nombre, t.tipo]
      );
    }

    const { rows } = await cliente.query(
      "SELECT id, codigo FROM indicadores"
    );
    const idPorCodigo = new Map(rows.map((r) => [r.codigo, r.id]));

    let insertados = 0;

    for (const r of registros) {
      const indicadorId = idPorCodigo.get(r.indicador);

      if (!indicadorId) {
        console.warn(
          `Indicador ${r.indicador} no existe en el catálogo; se omite.`
        );
        continue;
      }

      await cliente.query(
        `INSERT INTO valores_indicador (
           territorio_codigo, indicador_id, periodo,
           valor, fuente, fecha_actualizacion
         )
         VALUES ($1, $2, $3, $4, $5, CURRENT_DATE)
         ON CONFLICT (territorio_codigo, indicador_id, periodo)
         DO UPDATE SET
           valor = EXCLUDED.valor,
           fuente = EXCLUDED.fuente,
           fecha_actualizacion = EXCLUDED.fecha_actualizacion`,
        [
          TERRITORIOS[r.dominio].codigo,
          indicadorId,
          r.periodo,
          r.valor,
          FUENTE,
        ]
      );

      insertados++;
    }

    await cliente.query("COMMIT");
    console.log(`Importación completada: ${insertados} valores.`);
  } catch (error) {
    await cliente.query("ROLLBACK");
    throw error;
  } finally {
    cliente.release();
    await pool.end();
  }
}

async function main() {
  const { registros, omitidos } = leerAnexo();
  const series = resumir(registros);

  console.log(`Archivo: ${ARCHIVO}`);
  console.log(`Valores leídos: ${registros.length}`);
  console.log(`Series (territorio | indicador): ${series.size}`);

  for (const [clave, periodos] of series) {
    console.log(`  ${clave}: ${periodos.join(", ")}`);
  }

  if (omitidos.length > 0) {
    console.log("Indicadores sin equivalente en el catálogo (omitidos):");
    omitidos.forEach((o) => console.log(`  - ${o}`));
  }

  if (!CONFIRMAR) {
    console.log(
      "\nMODO PRUEBA: no se escribió nada. " +
        "Ejecuta con --confirmar para importar."
    );
    return;
  }

  await importar(registros);
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Error en la importación:", error);
    process.exit(1);
  });
}

module.exports = { leerAnexo, TERRITORIOS, INDICADORES };
