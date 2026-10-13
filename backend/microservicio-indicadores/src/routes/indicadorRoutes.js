
const express = require("express");
const router = express.Router();

const service = require("../service/indicadorService");

/**
 * DATAVIDA - Rutas del microservicio de Indicadores
 *
 * Prefijo configurado en index.js: /api
 */

// ==========================================
// CONSULTAR INDICADORES
// ==========================================

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

// ==========================================
// LISTAR DEPARTAMENTOS PDET
// ==========================================

router.get("/departamentos", async (req, res) => {
  try {
    const departamentos = await service.obtenerDepartamentos();

    res.status(200).json(departamentos);
  } catch (error) {
    console.error("Error consultando departamentos:", error);

    res.status(500).json({
      mensaje: "Error al consultar los departamentos.",
    });
  }
});

// ==========================================
// LISTAR SUBREGIONES PDET
// ==========================================

router.get("/subregiones", async (req, res) => {
  try {
    const { departamentoCodigo } = req.query;

    const subregiones = await service.obtenerSubregiones({
      departamentoCodigo,
    });

    res.status(200).json(subregiones);
  } catch (error) {
    console.error("Error consultando subregiones:", error);

    res.status(500).json({
      mensaje: "Error al consultar las subregiones.",
    });
  }
});

// ==========================================
// LISTAR MUNICIPIOS PDET
// ==========================================

router.get("/municipios", async (req, res) => {
  try {
    const { departamentoCodigo, subregionCodigo } = req.query;

    const municipios = await service.obtenerMunicipios({
      departamentoCodigo,
      subregionCodigo,
    });

    res.status(200).json(municipios);
  } catch (error) {
    console.error("Error consultando municipios:", error);

    res.status(500).json({
      mensaje: "Error al consultar los municipios.",
    });
  }
});

// ==========================================
// CATÁLOGO DE INDICADORES
// ==========================================

router.get("/catalogo-indicadores", async (req, res) => {
  try {
    const indicadores = await service.obtenerCatalogoIndicadores();

    res.status(200).json(indicadores);
  } catch (error) {
    console.error("Error consultando catálogo:", error);

    res.status(500).json({
      mensaje: "Error al consultar el catálogo de indicadores.",
    });
  }
});

// ==========================================
// PERIODOS DISPONIBLES
// ==========================================

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
