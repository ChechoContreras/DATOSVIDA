
const pool = require("../config/database");

/**
 * DATAVIDA - Repositorio de Indicadores
 *
 * Consultas de indicadores y estructura territorial PDET.
 *
 * Tablas:
 * - territorios
 * - indicadores
 * - valores_indicador
 * - departamentos
 * - subregiones_pdet
 * - municipios
 *
 * Los valores estadísticos existentes se conservan.
 */

// ==========================================
// CONSULTAR VALORES DE INDICADORES
// ==========================================

async function consultarValores({
  municipioCodigo,
  indicadorId,
  periodo,
} = {}) {
  const condiciones = [];
  const parametros = [];

  if (municipioCodigo) {
    parametros.push(municipioCodigo);
    condiciones.push(
      `v.territorio_codigo = $${parametros.length}`
    );
  }

  if (indicadorId) {
    parametros.push(Number(indicadorId));
    condiciones.push(
      `v.indicador_id = $${parametros.length}`
    );
  }

  if (periodo) {
    parametros.push(periodo);
    condiciones.push(
      `v.periodo = $${parametros.length}`
    );
  }

  const where =
    condiciones.length > 0
      ? `WHERE ${condiciones.join(" AND ")}`
      : "";

  const { rows } = await pool.query(
    `
      SELECT
        t.codigo AS "territorioCodigo",
        t.nombre AS "territorioNombre",
        t.tipo AS "territorioTipo",

        i.id AS "indicadorId",
        i.codigo AS "indicadorCodigo",
        i.nombre AS "indicadorNombre",
        i.unidad,
        i.dimension,

        v.periodo,
        v.valor,
        v.fuente,
        v.fecha_actualizacion AS "fechaActualizacion"

      FROM valores_indicador v

      INNER JOIN territorios t
        ON t.codigo = v.territorio_codigo

      INNER JOIN indicadores i
        ON i.id = v.indicador_id

      ${where}

      ORDER BY
        t.nombre,
        i.nombre,
        v.periodo
    `,
    parametros
  );

  return rows.map((fila) => ({
    territorio: {
      codigo: fila.territorioCodigo,
      nombre: fila.territorioNombre,
      tipo: fila.territorioTipo,
    },
    indicador: {
      id: fila.indicadorId,
      codigo: fila.indicadorCodigo,
      nombre: fila.indicadorNombre,
      unidad: fila.unidad,
      dimension: fila.dimension,
    },
    periodo: fila.periodo,
    valor: Number(fila.valor),
    fuente: fila.fuente,
    fechaActualizacion: fila.fechaActualizacion,
  }));
}

// ==========================================
// LISTAR DEPARTAMENTOS PDET
// ==========================================

async function listarDepartamentos() {
  const { rows } = await pool.query(`
    SELECT
      d.codigo,
      d.nombre
    FROM departamentos d
    WHERE EXISTS (
      SELECT 1
      FROM municipios m
      WHERE m.departamento_codigo = d.codigo
        AND m.es_pdet = TRUE
    )
    ORDER BY d.nombre
  `);

  return rows;
}

// ==========================================
// LISTAR SUBREGIONES PDET
// ==========================================

async function listarSubregiones({
  departamentoCodigo,
} = {}) {
  const parametros = [];
  let filtro = "";

  if (departamentoCodigo) {
    parametros.push(departamentoCodigo);

    filtro = `
      AND m.departamento_codigo = $1
    `;
  }

  const { rows } = await pool.query(
    `
      SELECT DISTINCT
        s.codigo,
        s.nombre
      FROM subregiones_pdet s

      INNER JOIN municipios m
        ON m.subregion_codigo = s.codigo

      WHERE m.es_pdet = TRUE

      ${filtro}

      ORDER BY s.nombre
    `,
    parametros
  );

  return rows;
}

// ==========================================
// LISTAR MUNICIPIOS PDET
// ==========================================

async function listarMunicipios({
  departamentoCodigo,
  subregionCodigo,
} = {}) {
  const condiciones = [
    "m.es_pdet = TRUE"
  ];

  const parametros = [];

  if (departamentoCodigo) {
    parametros.push(departamentoCodigo);

    condiciones.push(
      `m.departamento_codigo = $${parametros.length}`
    );
  }

  if (subregionCodigo) {
    parametros.push(Number(subregionCodigo));

    condiciones.push(
      `m.subregion_codigo = $${parametros.length}`
    );
  }

  const { rows } = await pool.query(
    `
      SELECT
        m.codigo,
        m.nombre,
        m.departamento_codigo AS "departamentoCodigo",
        d.nombre AS "departamentoNombre",
        m.subregion_codigo AS "subregionCodigo",
        s.nombre AS "subregionNombre",
        m.es_pdet AS "esPdet"

      FROM municipios m

      INNER JOIN departamentos d
        ON d.codigo = m.departamento_codigo

      INNER JOIN subregiones_pdet s
        ON s.codigo = m.subregion_codigo

      WHERE ${condiciones.join(" AND ")}

      ORDER BY m.nombre, d.nombre
    `,
    parametros
  );

  return rows;
}

// ==========================================
// CATÁLOGO DE INDICADORES
// ==========================================

async function listarIndicadores() {
  const { rows } = await pool.query(`
    SELECT
      id,
      codigo,
      nombre,
      unidad,
      dimension,
      fuente
    FROM indicadores
    ORDER BY nombre
  `);

  return rows;
}

// ==========================================
// PERIODOS DISPONIBLES
// ==========================================

async function listarPeriodos() {
  const { rows } = await pool.query(`
    SELECT DISTINCT periodo
    FROM valores_indicador
    ORDER BY periodo
  `);

  return rows.map((fila) => fila.periodo);
}

// ==========================================
// EXPORTAR FUNCIONES
// ==========================================

module.exports = {
  consultarValores,
  listarDepartamentos,
  listarSubregiones,
  listarMunicipios,
  listarIndicadores,
  listarPeriodos,
};
