const indicadoresClient = require("../repository/indicadoresClient");
const repository = require("../repository/iaRepository");
const {
  VERSION_MODELO,
  regresionLineal,
  predecir,
  correlacionPearson,
  clasificarFuerzaCorrelacion,
  calcularConfianza,
} = require("../model/iaModel");
const {
  TASA_ANUAL_REFERENCIA_DANE_PDET,
  FUENTE_TENDENCIA,
  ANIOS_SERIE_PROVISIONAL,
} = require("../model/parametrosModelo");

const UMBRAL_CONFIANZA_MINIMO = 60;

/** Hash simple y determinístico para producir variación reproducible sin Math.random(). */
function hashTexto(texto) {
  let h = 0;
  for (let i = 0; i < texto.length; i++) {
    h = (h * 31 + texto.charCodeAt(i)) % 1000;
  }
  return h;
}

const VARIABLES_POR_DIMENSION = {
  Educación: ["Cobertura educativa histórica", "Tasa de deserción escolar", "Inversión en infraestructura educativa"],
  Trabajo: ["Tasa de informalidad histórica", "Dinámica del mercado laboral regional", "Nivel educativo de la población"],
  "Niñez y juventud": ["Cobertura de programas de primera infancia", "Tasa de trabajo infantil histórica"],
  "Vivienda y servicios públicos": ["Cobertura histórica de acueducto", "Inversión pública en infraestructura básica"],
};

function generarSerieProvisional(valorActual, anioActual, semilla) {
  const anios = [];
  const valores = [];

  for (let offset = ANIOS_SERIE_PROVISIONAL - 1; offset >= 0; offset--) {
    const anio = anioActual - offset;
    const tendencia = valorActual + TASA_ANUAL_REFERENCIA_DANE_PDET * (anio - anioActual);
    const jitter = Math.sin(semilla + offset * 13) * 1.1;
    const valor = Math.max(0, Math.min(100, tendencia + jitter));
    anios.push(anio);
    valores.push(Math.round(valor * 10) / 10);
  }

  valores[valores.length - 1] = valorActual;
  return { anios, valores };
}

/** RF-13 Generar predicciones mediante IA. */
async function generarPrediccion({ municipioCodigo, indicadorId, horizonte = 1 }) {
  if (!municipioCodigo || !indicadorId) {
    const error = new Error("Debes seleccionar un municipio y un indicador.");
    error.codigo = "PARAMETROS_INCOMPLETOS";
    throw error;
  }

  const valores = await indicadoresClient.consultarValoresIndicadores({ municipioCodigo, indicadorId });

  if (valores.length === 0) {
    const error = new Error(
      "No existen datos suficientes para este municipio e indicador. No se puede generar la predicción."
    );
    error.codigo = "DATOS_INSUFICIENTES";
    throw error;
  }

  const dato = valores[0];
  const anioActual = Number(dato.periodo);
  const semilla = hashTexto(`${municipioCodigo}-${indicadorId}`);

  const serie = generarSerieProvisional(dato.valor, anioActual, semilla);
  const regresion = regresionLineal(serie.anios, serie.valores);

  const anioObjetivo = anioActual + Number(horizonte);
  let valorPredicho = predecir(regresion, anioObjetivo);
  valorPredicho = Math.max(0, Math.min(100, valorPredicho));

  const confianza = calcularConfianza({
    r2: regresion.r2,
    n: regresion.n,
    horizonte: Number(horizonte),
    basadoEnDatoReal: false,
  });

  const apto = confianza >= UMBRAL_CONFIANZA_MINIMO;

  const resultado = {
    municipio: dato.municipio,
    indicador: dato.indicador,
    horizonte: Number(horizonte),
    valorActual: dato.valor,
    valorPredicho: Math.round(valorPredicho * 10) / 10,
    r2: Math.round(regresion.r2 * 100) / 100,
    confianza,
    apto,
    basadoEnDatoReal: false,
    fuenteTendencia: FUENTE_TENDENCIA,
    mensajeConfiabilidad: apto
      ? "Predicción con nivel de confianza aceptable."
      : "Confiabilidad baja: este resultado no debe presentarse como una recomendación definitiva.",
    versionModelo: VERSION_MODELO,
    variablesRelevantes:
      VARIABLES_POR_DIMENSION[dato.indicador.dimension] || ["Comportamiento histórico del indicador"],
  };

  repository.guardarPrediccion({ municipioCodigo, indicadorId, horizonte, resultado });
  return resultado;
}

/** RF-14 Consultar recomendaciones. (sin cambios de lógica de negocio) */
async function obtenerRecomendaciones({ municipioCodigo, indicadorId }) {
  const valores = await indicadoresClient.consultarValoresIndicadores({ municipioCodigo, indicadorId });

  if (valores.length === 0) {
    const error = new Error("No existe evidencia suficiente para generar una recomendación confiable.");
    error.codigo = "EVIDENCIA_INSUFICIENTE";
    throw error;
  }

  const recomendaciones = valores.map((dato) => {
    let prioridad = "baja";
    let descripcion = `Mantener el seguimiento del indicador "${dato.indicador.nombre}" en ${dato.municipio.nombre}.`;

    if (dato.valor >= 45) {
      prioridad = "alta";
      descripcion = `Priorizar intervención en "${dato.indicador.nombre}" (dimensión ${dato.indicador.dimension}) en ${dato.municipio.nombre}, dado su valor elevado.`;
    } else if (dato.valor >= 25) {
      prioridad = "media";
      descripcion = `Reforzar programas relacionados con "${dato.indicador.nombre}" en ${dato.municipio.nombre}.`;
    }

    const recomendacion = {
      municipio: dato.municipio,
      indicador: dato.indicador,
      prioridad,
      descripcion,
      justificacion: `Basado en un valor registrado de ${dato.valor}${dato.indicador.unidad} (${dato.periodo}, fuente ${dato.fuente}).`,
      fechaGeneracion: new Date().toISOString(),
    };

    repository.guardarRecomendacion({ municipioCodigo: dato.municipio.codigo, indicadorId: dato.indicador.id, recomendacion });
    return recomendacion;
  });

  return recomendaciones;
}

function combinacionesUnicas(ids) {
  const pares = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      pares.push([ids[i], ids[j]]);
    }
  }
  return pares;
}

/** RF-13 apoyo: correlaciones e impacto de variables priorizadas. */
async function calcularCorrelaciones({ indicadorIdA, indicadorIdB } = {}) {
  const todos = await indicadoresClient.consultarTodosLosValores();

  if (todos.length === 0) {
    const error = new Error("No hay datos de indicadores registrados todavía.");
    error.codigo = "DATOS_INSUFICIENTES";
    throw error;
  }

  const porMunicipio = {};
  todos.forEach((v) => {
    const cod = v.municipio.codigo;
    porMunicipio[cod] = porMunicipio[cod] || {};
    porMunicipio[cod][v.indicador.id] = v.valor;
  });

  const catalogo = {};
  todos.forEach((v) => {
    catalogo[v.indicador.id] = v.indicador;
  });
  const idsCatalogo = Object.keys(catalogo).map(Number);

  const pares =
    indicadorIdA && indicadorIdB
      ? [[Number(indicadorIdA), Number(indicadorIdB)]]
      : combinacionesUnicas(idsCatalogo);

  const correlaciones = pares.map(([a, b]) => {
    const xs = [];
    const ys = [];
    Object.values(porMunicipio).forEach((m) => {
      if (m[a] !== undefined && m[b] !== undefined) {
        xs.push(m[a]);
        ys.push(m[b]);
      }
    });

    const r = correlacionPearson(xs, ys);
    return {
      indicadorA: catalogo[a],
      indicadorB: catalogo[b],
      n: xs.length,
      r: r === null ? null : Math.round(r * 100) / 100,
      fuerza: clasificarFuerzaCorrelacion(r),
      advertencia:
        xs.length < 5
          ? `Muestra pequeña (n=${xs.length} municipios con ambos indicadores). Resultado preliminar; se recalculará automáticamente con más datos en la base de datos.`
          : null,
    };
  });

  const variablesPriorizadas = idsCatalogo
    .map((id) => {
      const rs = correlaciones
        .filter((c) => c.indicadorA.id === id || c.indicadorB.id === id)
        .map((c) => c.r)
        .filter((r) => r !== null);
      const impactoPromedio = rs.length ? Math.round((rs.reduce((a, b) => a + Math.abs(b), 0) / rs.length) * 100) / 100 : null;
      return { indicador: catalogo[id], impactoPromedio };
    })
    .sort((a, b) => (b.impactoPromedio ?? -1) - (a.impactoPromedio ?? -1));

  return { correlaciones, variablesPriorizadas };
}

function obtenerHistorialPredicciones() {
  return repository.listarPredicciones();
}

function obtenerHistorialRecomendaciones() {
  return repository.listarRecomendaciones();
}

module.exports = {
  generarPrediccion,
  obtenerRecomendaciones,
  calcularCorrelaciones,
  obtenerHistorialPredicciones,
  obtenerHistorialRecomendaciones,
};