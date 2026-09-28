const express = require("express");
const router = express.Router();
const service = require("../service/indicadorService");

/**
 * GET /api/indicadores
 * Filtros opcionales:
 * ?municipioCodigo=&indicadorId=&periodo=
 */
router.get("/indicadores", async (req, res) => {
  try {
    const { municipioCodigo, indicadorId, periodo } = req.query;

    const resultado = await service.obtenerIndicadores({
      municipioCodigo,
      indicadorId,
      periodo,
    });

    res.status(200).json(resultado);
  } catch (error) {
    console.error("Error consultando indicadores:", error);
    res.status(500).json({
      mensaje: "Error al consultar los indicadores.",
    });
  }
});

/**
 * GET /api/municipios
 */
router.get("/municipios", async (req, res) => {
  try {
    const municipios = await service.obtenerMunicipios();
    res.status(200).json(municipios);
  } catch (error) {
    console.error("Error consultando municipios:", error);
    res.status(500).json({
      mensaje: "Error al consultar los municipios.",
    });
  }
});

/**
 * GET /api/catalogo-indicadores
 */
router.get("/catalogo-indicadores", async (req, res) => {
  try {
    const indicadores = await service.obtenerCatalogoIndicadores();
    res.status(200).json(indicadores);
  } catch (error) {
    console.error("Error consultando catálogo de indicadores:", error);
    res.status(500).json({
      mensaje: "Error al consultar el catálogo de indicadores.",
    });
  }
});

/**
 * GET /api/periodos
 */
router.get("/periodos", async (req, res) => {
  try {
    const periodos = await service.obtenerPeriodos();
    res.status(200).json(periodos);
  } catch (error) {
    console.error("Error consultando periodos:", error);
    res.status(500).json({
      mensaje: "Error al consultar los periodos.",
    });
  }
});

module.exports = router;
