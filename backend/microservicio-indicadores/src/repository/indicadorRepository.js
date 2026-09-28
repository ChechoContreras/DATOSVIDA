const pool = require("../config/database");

/**
 * Repository de Indicadores.
 *
 * Esta es la capa encargada de acceder directamente a PostgreSQL.
 * Los datos ya no se almacenan en memoria.
 */

/**
 * Consulta valores de indicadores aplicando filtros opcionales
 * de municipio, indicador y periodo.
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
    condiciones.push(`v.municipio_codigo = $${parametros.length}`);
  }

  if (indicadorId) {
    parametros.push(Number(indicadorId));
    condiciones.push(`v.indicador_id = $${parametros.length}`);
  }

  if (periodo) {
    parametros.push(periodo);
    condiciones.push(`v.periodo = $${parametros.length}`);
  }

  const where =
    condiciones.length > 0
      ? `WHERE ${condiciones.join(" AND ")}`
      : "";

  const { rows } = await pool.query(
    `
      SELECT
        m.codigo AS "municipioCodigo",
        m.nombre AS "municipioNombre",
        m.subregion,
        m.departamento,

        i.id AS "indicadorId",
        i.nombre AS "indicadorNombre",
        i.unidad,
        i.dimension,

        v.periodo,
        v.valor,
        v.fuente,
        v.fecha_actualizacion AS "fechaActualizacion"

      FROM valores_indicador v

      INNER JOIN municipios m
        ON m.codigo = v.municipio_codigo

      INNER JOIN indicadores i
        ON i.id = v.indicador_id

      ${where}

      ORDER BY
        m.nombre,
        i.nombre,
        v.periodo
    `,
    parametros
  );

  return rows.map((fila) => ({
    municipio: {
      codigo: fila.municipioCodigo,
      nombre: fila.municipioNombre,
      subregion: fila.subregion,
      departamento: fila.departamento,
    },

    indicador: {
      id: fila.indicadorId,
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
 * Lista los municipios almacenados en PostgreSQL.
 */
async function listarMunicipios() {
  const { rows } = await pool.query(`
    SELECT
      codigo,
      nombre,
      subregion,
      departamento
    FROM municipios
    ORDER BY nombre
  `);

  return rows;
}

/**
 * Lista el catálogo de indicadores.
 */
async function listarIndicadores() {
  const { rows } = await pool.query(`
    SELECT
      id,
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
 * Lista los periodos que realmente existen
 * en la base de datos.
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
