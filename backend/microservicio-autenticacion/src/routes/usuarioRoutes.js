const express = require("express");
const router = express.Router();
const usuarioService = require("../service/usuarioService");
const {
  requiereAutenticacion,
  requiereRol,
} = require("../middleware/authMiddleware");

// Todas las rutas de gestión de usuarios requieren estar autenticado
// y tener rol Administrador (RF-02 a RF-05).
router.use(requiereAutenticacion, requiereRol("Administrador"));

/** GET /api/usuarios?busqueda= — RF-03 Consultar usuario (listado). */
router.get("/", async (req, res) => {
  try {
    const { busqueda } = req.query;

    const usuarios = await usuarioService.listarUsuarios({
      busqueda,
    });

    res.status(200).json(usuarios);
  } catch (err) {
    console.error("Error al listar usuarios:", err);

    res.status(500).json({
      mensaje: "Ocurrió un error al consultar los usuarios.",
    });
  }
});

/** GET /api/usuarios/:id — RF-03 Consultar usuario (detalle). */
router.get("/:id", async (req, res) => {
  try {
    const usuario = await usuarioService.obtenerUsuario(req.params.id);

    if (!usuario) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado.",
      });
    }

    res.status(200).json(usuario);
  } catch (err) {
    console.error("Error al consultar usuario:", err);

    res.status(500).json({
      mensaje: "Ocurrió un error al consultar el usuario.",
    });
  }
});

/** POST /api/usuarios — RF-02 Crear usuario. */
router.post("/", async (req, res) => {
  try {
    const nuevo = await usuarioService.crearUsuario(
      req.body || {},
      req.usuario.sub
    );

    res.status(201).json(nuevo);
  } catch (err) {
    console.error("Error al crear usuario:", err);

    if (
      err.codigo === "DATOS_INCOMPLETOS" ||
      err.codigo === "CORREO_DUPLICADO"
    ) {
      return res.status(400).json({
        mensaje: err.message,
        codigo: err.codigo,
      });
    }

    res.status(500).json({
      mensaje: "Ocurrió un error al crear el usuario.",
    });
  }
});

/** PUT /api/usuarios/:id — RF-04 Actualizar usuario. */
router.put("/:id", async (req, res) => {
  try {
    const actualizado = await usuarioService.actualizarUsuario(
      req.params.id,
      req.body || {},
      req.usuario.sub
    );

    res.status(200).json(actualizado);
  } catch (err) {
    console.error("Error al actualizar usuario:", err);

    if (err.codigo === "NO_ENCONTRADO") {
      return res.status(404).json({
        mensaje: err.message,
        codigo: err.codigo,
      });
    }

    if (err.codigo === "CORREO_DUPLICADO") {
      return res.status(400).json({
        mensaje: err.message,
        codigo: err.codigo,
      });
    }

    res.status(500).json({
      mensaje: "Ocurrió un error al actualizar el usuario.",
    });
  }
});

/** PATCH /api/usuarios/:id/estado — RF-05 Activar/Desactivar usuario. */
router.patch("/:id/estado", async (req, res) => {
  const { activo } = req.body || {};

  try {
    const actualizado =
      await usuarioService.cambiarEstadoUsuario(
        req.params.id,
        Boolean(activo),
        req.usuario
      );

    res.status(200).json(actualizado);
  } catch (err) {
    console.error("Error al cambiar estado del usuario:", err);

    if (err.codigo === "NO_ENCONTRADO") {
      return res.status(404).json({
        mensaje: err.message,
        codigo: err.codigo,
      });
    }

    if (
      err.codigo === "AUTODESACTIVACION_NO_PERMITIDA" ||
      err.codigo === "UNICO_ADMIN_ACTIVO"
    ) {
      return res.status(400).json({
        mensaje: err.message,
        codigo: err.codigo,
      });
    }

    res.status(500).json({
      mensaje: "Ocurrió un error al cambiar el estado del usuario.",
    });
  }
});

module.exports = router;
