const express = require("express");
const router = express.Router();
const service = require("../service/indicadorService");

/**
 * GET /api/indicadores
 * Filtros opcionales por query string: ?municipioCodigo=&indicadorId=&periodo=
 * (RF-09 Consultar indicadores)
 */
router.get("/indicadores", (req, res) => {
  const { municipioCodigo, indicadorId, periodo } = req.query;
  const resultado = service.obtenerIndicadores({ municipioCodigo, indicadorId, periodo });
  res.status(200).json(resultado);
});

/**
 * GET /api/municipios
 * Lista los municipios PDET disponibles (para poblar filtros en el frontend).
 */
router.get("/municipios", (req, res) => {
  res.status(200).json(service.obtenerMunicipios());
});

/**
 * GET /api/catalogo-indicadores
 * Lista el catálogo de indicadores disponibles (para poblar filtros en el frontend).
 */
router.get("/catalogo-indicadores", (req, res) => {
  res.status(200).json(service.obtenerCatalogoIndicadores());
});

module.exports = router;
