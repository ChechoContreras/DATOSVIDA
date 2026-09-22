const express = require("express");
const router = express.Router();
const authService = require("../service/authService");
const { requiereAutenticacion } = require("../middleware/authMiddleware");

/**
 * POST /api/auth/login
 * RF-01 Iniciar sesión.
 */
router.post("/login", (req, res) => {
  const { correo, contrasena } = req.body || {};
  try {
    const resultado = authService.iniciarSesion({ correo, contrasena });
    res.status(200).json(resultado);
  } catch (err) {
    const codigo = err.codigo === "CUENTA_INACTIVA" ? 403 : 401;
    res.status(codigo).json({ mensaje: err.message });
  }
});

/**
 * POST /api/auth/logout
 * RF-16 Cerrar sesión.
 */
router.post("/logout", requiereAutenticacion, (req, res) => {
  authService.cerrarSesion(req.token);
  res.status(200).json({ mensaje: "Sesión cerrada correctamente." });
});

/**
 * GET /api/auth/perfil
 * Devuelve los datos del usuario autenticado a partir de su token
 * (útil para que el frontend valide la sesión al recargar la página).
 */
router.get("/perfil", requiereAutenticacion, (req, res) => {
  res.status(200).json({ usuario: req.usuario });
});

module.exports = router;
