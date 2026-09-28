const express = require("express");
const router = express.Router();
const authService = require("../service/authService");
const { requiereAutenticacion } = require("../middleware/authMiddleware");

/**
 * POST /api/auth/login
 * RF-01 Iniciar sesión.
 */
router.post("/login", async (req, res) => {
  const { correo, contrasena } = req.body || {};

  try {
    const resultado = await authService.iniciarSesion({
      correo,
      contrasena,
    });

    res.status(200).json(resultado);
  } catch (err) {
    console.error("Error al iniciar sesión:", err);

    if (err.codigo === "CUENTA_INACTIVA") {
      return res.status(403).json({ mensaje: err.message });
    }

    if (err.codigo === "CREDENCIALES_INVALIDAS") {
      return res.status(401).json({ mensaje: err.message });
    }

    res.status(500).json({
      mensaje: "Ocurrió un error interno al iniciar sesión.",
    });
  }
});

/**
 * POST /api/auth/logout
 * RF-16 Cerrar sesión.
 */
router.post("/logout", requiereAutenticacion, (req, res) => {
  authService.cerrarSesion(req.token);

  res.status(200).json({
    mensaje: "Sesión cerrada correctamente.",
  });
});

/**
 * GET /api/auth/perfil
 * Devuelve los datos del usuario autenticado a partir de su token.
 */
router.get("/perfil", requiereAutenticacion, (req, res) => {
  res.status(200).json({
    usuario: req.usuario,
  });
});

module.exports = router;
