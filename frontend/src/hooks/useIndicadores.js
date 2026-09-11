import { useState, useEffect, useCallback } from "react";
import {
  consultarIndicadores,
  obtenerMunicipios,
  obtenerCatalogoIndicadores,
} from "../services/indicadoresService";

/**
 * Encapsula el estado de carga/error y las llamadas a Services,
 * siguiendo el rol de "Hooks" definido en la arquitectura frontend.
 */
export function useIndicadores() {
  const [datos, setDatos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [catalogoIndicadores, setCatalogoIndicadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    obtenerMunicipios().then(setMunicipios).catch(() => {});
    obtenerCatalogoIndicadores().then(setCatalogoIndicadores).catch(() => {});
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
    }
  }, []);

  useEffect(() => {
    buscar({});
  }, [buscar]);

  return { datos, municipios, catalogoIndicadores, cargando, error, mensaje, buscar };
}
