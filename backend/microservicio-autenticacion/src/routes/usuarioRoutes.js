const express = require("express");
const router = express.Router();
const usuarioService = require("../service/usuarioService");
const { requiereAutenticacion, requiereRol } = require("../middleware/authMiddleware");

// Todas las rutas de gestión de usuarios requieren estar autenticado
// y tener rol Administrador (RF-02 a RF-05).
router.use(requiereAutenticacion, requiereRol("Administrador"));

/** GET /api/usuarios?busqueda= — RF-03 Consultar usuario (listado). */
router.get("/", (req, res) => {
  const { busqueda } = req.query;
  res.status(200).json(usuarioService.listarUsuarios({ busqueda }));
});

/** GET /api/usuarios/:id — RF-03 Consultar usuario (detalle). */
router.get("/:id", (req, res) => {
  const usuario = usuarioService.obtenerUsuario(req.params.id);
  if (!usuario) {
    return res.status(404).json({ mensaje: "Usuario no encontrado." });
  }
  res.status(200).json(usuario);
});

/** POST /api/usuarios — RF-02 Crear usuario. */
router.post("/", (req, res) => {
  try {
    const nuevo = usuarioService.crearUsuario(req.body || {}, req.usuario.sub);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(400).json({ mensaje: err.message, codigo: err.codigo });
  }
});

/** PUT /api/usuarios/:id — RF-04 Actualizar usuario. */
router.put("/:id", (req, res) => {
  try {
    const actualizado = usuarioService.actualizarUsuario(req.params.id, req.body || {}, req.usuario.sub);
    res.status(200).json(actualizado);
  } catch (err) {
    const codigo = err.codigo === "NO_ENCONTRADO" ? 404 : 400;
    res.status(codigo).json({ mensaje: err.message, codigo: err.codigo });
  }
});

/** PATCH /api/usuarios/:id/estado — RF-05 Activar/Desactivar usuario. */
router.patch("/:id/estado", (req, res) => {
  const { activo } = req.body || {};
  try {
    const actualizado = usuarioService.cambiarEstadoUsuario(req.params.id, Boolean(activo), req.usuario);
    res.status(200).json(actualizado);
  } catch (err) {
    const codigo = err.codigo === "NO_ENCONTRADO" ? 404 : 400;
    res.status(codigo).json({ mensaje: err.message, codigo: err.codigo });
  }
});

module.exports = router;
