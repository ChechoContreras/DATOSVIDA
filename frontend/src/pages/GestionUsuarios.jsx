import { useEffect, useState } from "react";
import {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  cambiarEstadoUsuario,
} from "../services/usuariosService";
import { obtenerUsuario } from "../utils/auth";
import "../styles/GestionUsuarios.css";

const ROLES = ["Administrador", "Analista", "Usuario"];

const FORMULARIO_VACIO = { nombre: "", correo: "", contrasena: "", rol: "Usuario" };

export default function GestionUsuarios() {
  const usuarioActual = obtenerUsuario();

  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [errorFormulario, setErrorFormulario] = useState("");
  const [guardando, setGuardando] = useState(false);

  const administradoresActivos = usuarios.filter(
    (u) => u.rol === "Administrador" && u.estado === "activo"
  ).length;

  async function cargarUsuarios(textoBusqueda = busqueda) {
    setCargando(true);
    setError("");
    try {
      const datos = await listarUsuarios(textoBusqueda);
      setUsuarios(datos);
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          "No fue posible conectar con el Microservicio de Autenticación."
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarUsuarios("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function manejarBuscar(e) {
    e.preventDefault();
    cargarUsuarios(busqueda);
  }

  function abrirCrear() {
    setModoEdicion(false);
    setIdEditando(null);
    setFormulario(FORMULARIO_VACIO);
    setErrorFormulario("");
    setModalAbierto(true);
  }

  function abrirEditar(usuario) {
    setModoEdicion(true);
    setIdEditando(usuario.id);
    setFormulario({
      nombre: usuario.nombre,
      correo: usuario.correo,
      contrasena: "",
      rol: usuario.rol,
    });
    setErrorFormulario("");
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setGuardando(true);
    setErrorFormulario("");
    try {
      if (modoEdicion) {
        const cambios = {
          nombre: formulario.nombre,
          correo: formulario.correo,
          rol: formulario.rol,
        };
        if (formulario.contrasena) cambios.contrasena = formulario.contrasena;
        await actualizarUsuario(idEditando, cambios);
      } else {
        await crearUsuario(formulario);
      }
      setModalAbierto(false);
      await cargarUsuarios();
    } catch (err) {
      setErrorFormulario(
        err.response?.data?.mensaje || "No fue posible guardar el usuario."
      );
    } finally {
      setGuardando(false);
    }
  }

  async function manejarCambiarEstado(usuario) {
    setError("");
    try {
      await cambiarEstadoUsuario(usuario.id, usuario.estado !== "activo");
      await cargarUsuarios();
    } catch (err) {
      setError(err.response?.data?.mensaje || "No fue posible cambiar el estado.");
    }
  }

  return (
    <div className="pagina-usuarios">
      <header className="encabezado-usuarios">
        <span className="etiqueta-pagina-usuarios">ADMINISTRACIÓN</span>
        <h1>Gestión de usuarios</h1>
        <p>
          Crea, consulta, actualiza y activa o desactiva las cuentas de la
          plataforma (RF-02 a RF-05).
        </p>
      </header>

      <div className="barra-acciones-usuarios">
        <form className="buscador-usuarios" onSubmit={manejarBuscar}>
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            autoComplete="off"
          />
          <button type="submit">Buscar</button>
        </form>

        <button type="button" className="boton-nuevo-usuario" onClick={abrirCrear}>
          + Nuevo usuario
        </button>
      </div>

      {error && <p className="mensaje-error-usuarios">{error}</p>}

      {cargando ? (
        <p className="estado-carga-usuarios">Cargando usuarios…</p>
      ) : (
        <div className="tabla-usuarios-contenedor">
          <table className="tabla-usuarios">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => {
                const esMismoUsuario = usuarioActual?.id === u.id;
                const esUnicoAdminActivo =
                  u.rol === "Administrador" &&
                  u.estado === "activo" &&
                  administradoresActivos <= 1;
                const noSePuedeDesactivar = esMismoUsuario || esUnicoAdminActivo;

                return (
                  <tr key={u.id}>
                    <td>{u.nombre}</td>
                    <td>{u.correo}</td>
                    <td>{u.rol}</td>
                    <td>
                      <span
                        className={`insignia-estado ${
                          u.estado === "activo" ? "insignia-activo" : "insignia-inactivo"
                        }`}
                      >
                        {u.estado === "activo" ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="celda-acciones-usuarios">
                      <button type="button" onClick={() => abrirEditar(u)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        className={
                          u.estado === "activo" ? "boton-desactivar" : "boton-activar"
                        }
                        disabled={u.estado === "activo" && noSePuedeDesactivar}
                        title={
                          u.estado === "activo" && esMismoUsuario
                            ? "No puedes desactivar tu propia cuenta"
                            : u.estado === "activo" && esUnicoAdminActivo
                            ? "No puedes desactivar al único administrador activo"
                            : ""
                        }
                        onClick={() => manejarCambiarEstado(u)}
                      >
                        {u.estado === "activo" ? "Desactivar" : "Activar"}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={5} className="fila-vacia-usuarios">
                    No se encontraron usuarios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalAbierto && (
        <div className="modal-overlay-usuarios" onClick={cerrarModal}>
          <form
            className="modal-usuarios"
            onClick={(e) => e.stopPropagation()}
            onSubmit={manejarSubmit}
          >
            <h2>{modoEdicion ? "Editar usuario" : "Crear usuario"}</h2>

            {errorFormulario && (
              <p className="mensaje-error-usuarios">{errorFormulario}</p>
            )}

            <label>Nombre completo</label>
            <input
              type="text"
              required
              autoComplete="off"
              value={formulario.nombre}
              onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
            />

            <label>Correo electrónico</label>
            <input
              type="email"
              required
              autoComplete="off"
              value={formulario.correo}
              onChange={(e) => setFormulario({ ...formulario, correo: e.target.value })}
            />

            <label>
              Contraseña
              {modoEdicion && (
                <span className="nota-campo"> (déjalo vacío para no cambiarla)</span>
              )}
            </label>
            <input
              type="password"
              required={!modoEdicion}
              autoComplete="new-password"
              value={formulario.contrasena}
              onChange={(e) => setFormulario({ ...formulario, contrasena: e.target.value })}
            />

            <label>Rol</label>
            <select
              value={formulario.rol}
              onChange={(e) => setFormulario({ ...formulario, rol: e.target.value })}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <div className="acciones-modal-usuarios">
              <button type="button" className="boton-cancelar-modal" onClick={cerrarModal}>
                Cancelar
              </button>
              <button type="submit" className="boton-guardar-modal" disabled={guardando}>
                {guardando ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
