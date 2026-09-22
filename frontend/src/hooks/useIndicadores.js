import { useState, useEffect, useCallback } from "react";
import {
  consultarIndicadores,
  obtenerMunicipios,
  obtenerCatalogoIndicadores,
  obtenerPeriodos,
} from "../services/indicadoresService";

/**
 * Encapsula el estado de carga/error y las llamadas a Services,
 * siguiendo el rol de "Hooks" definido en la arquitectura frontend.
 *
 * No dispara la búsqueda automáticamente al montar: la página decide
 * cuándo consultar (por ejemplo, al hacer clic en "Consultar"), y
 * mientras tanto se muestra un estado vacío inicial.
 */
export function useIndicadores() {
  const [datos, setDatos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [catalogoIndicadores, setCatalogoIndicadores] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [haBuscado, setHaBuscado] = useState(false);

  useEffect(() => {
    obtenerMunicipios().then(setMunicipios).catch(() => {});
    obtenerCatalogoIndicadores().then(setCatalogoIndicadores).catch(() => {});
    obtenerPeriodos().then(setPeriodos).catch(() => {});
  }, []);

  const buscar = useCallback(async (filtros) => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await consultarIndicadores(filtros);
      setDatos(resultado.datos);
      setMensaje(resultado.mensaje);
    } catch (err) {
      setError(
        "No fue posible conectar con el Microservicio de Indicadores. Verifica que el backend esté en ejecución."
      );
      setDatos([]);
    } finally {
      setCargando(false);
      setHaBuscado(true);
    }
  }, []);

  const limpiar = useCallback(() => {
    setDatos([]);
    setError(null);
    setMensaje("");
    setHaBuscado(false);
  }, []);

  return {
    datos,
    municipios,
    catalogoIndicadores,
    periodos,
    cargando,
    error,
    mensaje,
    haBuscado,
    buscar,
    limpiar,
  };
}
