/**
 * Modelos y motor estadístico del Microservicio de Inteligencia Artificial.
 * Basado en el Diagrama de IA del documento de Arquitectura Tecnológica
 * (Prediction, Recommendation, PredictionModel).
 *
 * v2.0-regresion-lineal
 * ----------------------
 * Reemplaza el heurístico v1.0 por un motor de regresión lineal simple
 * (mínimos cuadrados) y correlación de Pearson. Estas funciones son
 * PURAS: no conocen de dónde vienen los datos ni si son reales o
 * provisionales. Reciben series numéricas y devuelven resultados
 * estadísticos verificables. Cuando la base de datos tenga series
 * históricas reales por municipio (varios años), este motor se usa
 * exactamente igual, sin modificar nada aquí.
 */

function regresionLineal(xs, ys) {
  const n = xs.length;
  if (n < 2 || n !== ys.length) {
    return { intercepto: ys[0] ?? 0, pendiente: 0, r2: 0, n };
  }

  const mediaX = xs.reduce((a, b) => a + b, 0) / n;
  const mediaY = ys.reduce((a, b) => a + b, 0) / n;

  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumXY += (xs[i] - mediaX) * (ys[i] - mediaY);
    sumXX += (xs[i] - mediaX) ** 2;
  }

  const pendiente = sumXX === 0 ? 0 : sumXY / sumXX;
  const intercepto = mediaY - pendiente * mediaX;

  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < n; i++) {
    const yPred = intercepto + pendiente * xs[i];
    ssRes += (ys[i] - yPred) ** 2;
    ssTot += (ys[i] - mediaY) ** 2;
  }
  const r2 = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);

  return { intercepto, pendiente, r2, n };
}

function predecir(regresion, x) {
  return regresion.intercepto + regresion.pendiente * x;
}

function correlacionPearson(xs, ys) {
  const n = xs.length;
  if (n < 2 || n !== ys.length) return null;

  const mediaX = xs.reduce((a, b) => a + b, 0) / n;
  const mediaY = ys.reduce((a, b) => a + b, 0) / n;

  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mediaX;
    const dy = ys[i] - mediaY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  if (denX === 0 || denY === 0) return null;
  return num / Math.sqrt(denX * denY);
}

function clasificarFuerzaCorrelacion(r) {
  if (r === null) return "sin datos suficientes";
  const abs = Math.abs(r);
  if (abs >= 0.7) return "fuerte";
  if (abs >= 0.4) return "moderada";
  if (abs >= 0.2) return "débil";
  return "muy débil / nula";
}

function calcularConfianza({ r2, n, horizonte, basadoEnDatoReal }) {
  let confianza = 50 + r2 * 40;
  confianza += Math.min(n, 6) * 2;
  confianza -= Math.max(0, horizonte - 1) * 5;
  if (!basadoEnDatoReal) confianza -= 15;
  return Math.max(20, Math.min(95, Math.round(confianza)));
}

module.exports = {
  VERSION_MODELO: "v2.0-regresion-lineal",
  regresionLineal,
  predecir,
  correlacionPearson,
  clasificarFuerzaCorrelacion,
  calcularConfianza,
};
