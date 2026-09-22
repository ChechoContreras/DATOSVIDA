const express = require("express");
const router = express.Router();
const service = require("../service/reportesService");

/**
 * POST /api/reportes
 * body: { titulo, filtros: { municipioCodigo, indicadorId, periodo }, formato: "pdf"|"excel" }
 * RF-15 Generar y exportar reportes. Responde con el archivo para descarga directa.
 */
router.post("/", async (req, res) => {
  try {
    const { titulo, filtros, formato } = req.body || {};
    const { buffer, mime, nombreArchivo } = await service.generarReporte({ titulo, filtros, formato });
    res.setHeader("Content-Type", mime);
    res.setHeader("Content-Disposition", `attachment; filename="${nombreArchivo}"`);
    res.status(200).send(buffer);
  } catch (err) {
    res.status(400).json({ mensaje: err.message, codigo: err.codigo });
  }
});

/** GET /api/reportes/historial — reportes generados previamente. */
router.get("/historial", (req, res) => {
  res.status(200).json(service.obtenerHistorial());
});

module.exports = router;
