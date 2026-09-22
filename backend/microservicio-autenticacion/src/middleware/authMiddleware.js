const { verificarToken } = require("../util/tokenUtil");

function extraerToken(req) {
  const encabezado = req.headers.authorization || "";
  const [tipo, token] = encabezado.split(" ");
  return tipo === "Bearer" ? token : null;
}

/** Exige un token JWT válido; adjunta el payload en req.usuario. */
function requiereAutenticacion(req, res, next) {
  const token = extraerToken(req);
  if (!token) {
    return res.status(401).json({ mensaje: "No se proporcionó un token de autenticación." });
  }
  try {
    req.usuario = verificarToken(token);
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ mensaje: "Token inválido o expirado." });
  }
}

/** Exige que el usuario autenticado tenga uno de los roles indicados. */
function requiereRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: "No tienes permisos para realizar esta acción." });
    }
    next();
  };
}

module.exports = { requiereAutenticacion, requiereRol };
