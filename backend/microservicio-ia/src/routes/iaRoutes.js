const express = require("express");
const router = express.Router();
const service = require("../service/iaService");

/** POST /api/ia/predicciones — RF-13 Generar predicciones mediante IA. */
router.post("/predicciones", async (req, res) => {
  try {
    const resultado = await service.generarPrediccion(req.body || {});
    res.status(200).json(resultado);
  } catch (err) {
    res.status(400).json({ mensaje: err.message, codigo: err.codigo });
  }
});

/** GET /api/ia/recomendaciones?municipioCodigo=&indicadorId= — RF-14. */
router.get("/recomendaciones", async (req, res) => {
  try {
    const resultado = await service.obtenerRecomendaciones(req.query || {});
    res.status(200).json(resultado);
  } catch (err) {
    res.status(400).json({ mensaje: err.message, codigo: err.codigo });
  }
});

router.get("/predicciones/historial", (req, res) => {
  res.status(200).json(service.obtenerHistorialPredicciones());
});

router.get("/recomendaciones/historial", (req, res) => {
  res.status(200).json(service.obtenerHistorialRecomendaciones());
});

module.exports = router;
