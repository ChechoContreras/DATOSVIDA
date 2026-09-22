const indicadoresClient = require("../repository/indicadoresClient");
const historial = require("../repository/analisisRepository");

function redondear(numero, decimales = 2) {
  const factor = 10 ** decimales;
  return Math.round(numero * factor) / factor;
}

/** RF-11 Comparar municipios o regiones. */
async function compararTerritorios({ municipios, indicadorId, periodo }) {
  if (!Array.isArray(municipios) || municipios.length < 2) {
    const error = new Error("Debes seleccionar al menos dos municipios o regiones para comparar.");
    error.codigo = "SELECCION_INSUFICIENTE";
    throw error;
  }
  if (!indicadorId) {
    const error = new Error("Debes seleccionar un indicador para la comparación.");
    error.codigo = "INDICADOR_REQUERIDO";
    throw error;
  }

  const resultadosPorMunicipio = await Promise.all(
    municipios.map(async (codigo) => {
      const valores = await indicadoresClient.consultarValoresIndicadores({
        municipioCodigo: codigo,
        indicadorId,
        periodo,
      });
      return valores[0]
        ? { ...valores[0], sinDatos: false }
        : { municipioCodigo: codigo, sinDatos: true };
    })
  );

  const conDatos = resultadosPorMunicipio.filter((r) => !r.sinDatos);

  // Flujo Alternativo #2 de RF-11: territorio sin datos para el periodo.
  if (conDatos.length < 2) {
    const error = new Error(
      "No hay suficientes territorios con datos para el indicador y periodo seleccionados."
    );
    error.codigo = "DATOS_INSUFICIENTES";
    throw error;
  }

  const valoresNumericos = conDatos.map((r) => r.valor);
  const maximo = Math.max(...valoresNumericos);
  const minimo = Math.min(...valoresNumericos);

  const resultado = {
    indicador: conDatos[0].indicador,
    periodo,
    territorios: resultadosPorMunicipio,
    diferenciaMaxima: redondear(maximo - minimo),
    territorioMayor: conDatos.find((r) => r.valor === maximo)?.municipio,
    territorioMenor: conDatos.find((r) => r.valor === minimo)?.municipio,
  };

  historial.guardar({ tipo: "comparacion", indicadorId, periodo, municipios });
  return resultado;
}

/** RF-12 Ejecutar análisis estadístico. */
async function ejecutarAnalisisEstadistico({
  municipioCodigo,
  indicadorId,
  periodo,
  tipoAnalisis = "estadisticas",
  indicadorIdB,
}) {
  const valores = await indicadoresClient.consultarValoresIndicadores({
    municipioCodigo,
    indicadorId,
    periodo,
  });

  // Flujo Alternativo #1 de RF-12: datos insuficientes.
  if (valores.length === 0) {
    const error = new Error(
      "No hay datos suficientes para ejecutar el análisis con los filtros seleccionados."
    );
    error.codigo = "DATOS_INSUFICIENTES";
    throw error;
  }

  const numeros = valores.map((v) => v.valor);
  const promedio = numeros.reduce((a, b) => a + b, 0) / numeros.length;
  const varianza = numeros.reduce((a, b) => a + (b - promedio) ** 2, 0) / numeros.length;

  const estadisticas = {
    promedio: redondear(promedio),
    minimo: Math.min(...numeros),
    maximo: Math.max(...numeros),
    desviacionEstandar: redondear(Math.sqrt(varianza)),
  };

  let correlacion = null;
  if (tipoAnalisis === "correlacion" && indicadorIdB) {
    const valoresB = await indicadoresClient.consultarValoresIndicadores({
      municipioCodigo,
      indicadorId: indicadorIdB,
      periodo,
    });
    correlacion = calcularCorrelacion(valores, valoresB);
  }

  const resultado = {
    tipoAnalisis,
    cantidadRegistros: valores.length,
    estadisticas,
    correlacion,
    fechaEjecucion: new Date().toISOString(),
    detalle: valores,
  };

  historial.guardar({ tipo: "analisis-estadistico", indicadorId, municipioCodigo, periodo, tipoAnalisis });
  return resultado;
}

function calcularCorrelacion(valoresA, valoresB) {
  const mapaB = new Map(valoresB.map((v) => [v.municipio.codigo, v.valor]));
  const pares = valoresA
    .filter((v) => mapaB.has(v.municipio.codigo))
    .map((v) => [v.valor, mapaB.get(v.municipio.codigo)]);

  if (pares.length < 2) return null;

  const n = pares.length;
  const sumX = pares.reduce((s, p) => s + p[0], 0);
  const sumY = pares.reduce((s, p) => s + p[1], 0);
  const sumXY = pares.reduce((s, p) => s + p[0] * p[1], 0);
  const sumX2 = pares.reduce((s, p) => s + p[0] * p[0], 0);
  const sumY2 = pares.reduce((s, p) => s + p[1] * p[1], 0);

  const numerador = n * sumXY - sumX * sumY;
  const denominador = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominador === 0 ? 0 : redondear(numerador / denominador, 3);
}

function obtenerHistorial() {
  return historial.listar();
}

module.exports = { compararTerritorios, ejecutarAnalisisEstadistico, obtenerHistorial };
