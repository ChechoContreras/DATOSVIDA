const express = require("express");
const router = express.Router();
const service = require("../service/analisisService");

/** POST /api/analitica/comparar — RF-11 Comparar municipios o regiones. */
router.post("/comparar", async (req, res) => {
  try {
    const resultado = await service.compararTerritorios(req.body || {});
    res.status(200).json(resultado);
  } catch (err) {
    res.status(400).json({ mensaje: err.message, codigo: err.codigo });
  }
});

/** POST /api/analitica/estadistico — RF-12 Ejecutar análisis estadístico. */
router.post("/estadistico", async (req, res) => {
  try {
    const resultado = await service.ejecutarAnalisisEstadistico(req.body || {});
    res.status(200).json(resultado);
  } catch (err) {
    res.status(400).json({ mensaje: err.message, codigo: err.codigo });
  }
});

/** GET /api/analitica/historial — trazabilidad de análisis ejecutados. */
router.get("/historial", (req, res) => {
  res.status(200).json(service.obtenerHistorial());
});

module.exports = router;
