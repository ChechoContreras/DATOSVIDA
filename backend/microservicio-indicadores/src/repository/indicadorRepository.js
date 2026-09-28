const pool = require("../config/database");

/**
 * Repository de Indicadores.
 *
 * Acceso a los indicadores territoriales almacenados
 * en PostgreSQL.
 */

/**
 * Consulta los valores de indicadores aplicando filtros
 * opcionales de territorio, indicador y periodo.
 *
 * Se conserva municipioCodigo como parámetro por compatibilidad
 * con el frontend actual. Internamente representa el código
 * territorial.
 */
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

/**
 * Lista los territorios disponibles.
 *
 * Se mantiene el nombre listarMunicipios para no romper
 * las capas Service y Routes existentes.
 */
async function listarMunicipios() {
  const { rows } = await pool.query(`
    SELECT
      codigo,
      nombre,
      tipo
    FROM territorios
    ORDER BY nombre
  `);

  return rows;
}

/**
 * Lista el catálogo de indicadores almacenados
 * en PostgreSQL.
 */
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

/**
 * Lista los periodos disponibles en la base de datos.
 */
async function listarPeriodos() {
  const { rows } = await pool.query(`
    SELECT DISTINCT periodo
    FROM valores_indicador
    ORDER BY periodo
  `);

  return rows.map((fila) => fila.periodo);
}

module.exports = {
  consultarValores,
  listarMunicipios,
  listarIndicadores,
  listarPeriodos,
};
