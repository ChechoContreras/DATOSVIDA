const CLAVE_TOKEN = "datavida_token";
const CLAVE_USUARIO = "datavida_usuario";

function guardarSesion(token, usuario) {
  localStorage.setItem(CLAVE_TOKEN, token);
  localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
}

function obtenerToken() {
  return localStorage.getItem(CLAVE_TOKEN);
}

function obtenerUsuario() {
  const crudo = localStorage.getItem(CLAVE_USUARIO);
  return crudo ? JSON.parse(crudo) : null;
}

function limpiarSesion() {
  localStorage.removeItem(CLAVE_TOKEN);
  localStorage.removeItem(CLAVE_USUARIO);
}

function haySesion() {
  return Boolean(obtenerToken());
}

export { guardarSesion, obtenerToken, obtenerUsuario, limpiarSesion, haySesion };
