
import { useState, useEffect, useCallback } from "react";

import {
  consultarIndicadores,
  obtenerDepartamentos,
  obtenerSubregiones,
  obtenerMunicipios,
  obtenerCatalogoIndicadores,
  obtenerPeriodos,
} from "../services/indicadoresService";

/**
 * DATAVIDA - Hook de Indicadores
 *
 * Gestiona:
 * - Departamentos PDET
 * - Subregiones PDET
 * - Municipios PDET
 * - Catálogo de indicadores
 * - Periodos disponibles
 * - Consultas estadísticas
 * - Estados de carga y error
 */

export function useIndicadores() {

  // ==========================================
  // ESTADOS TERRITORIALES
  // ==========================================

  const [departamentos, setDepartamentos] = useState([]);
  const [subregiones, setSubregiones] = useState([]);
  const [municipios, setMunicipios] = useState([]);

  // ==========================================
  // ESTADOS DE INDICADORES
  // ==========================================

  const [catalogoIndicadores, setCatalogoIndicadores] =
    useState([]);

  const [periodos, setPeriodos] = useState([]);

  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [cargandoTerritorios, setCargandoTerritorios] =
    useState(false);

  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [haBuscado, setHaBuscado] = useState(false);

  // ==========================================
  // CARGAR CATÁLOGOS INICIALES
  // ==========================================

  useEffect(() => {
    let activo = true;

    async function cargarCatalogos() {
      setCargandoTerritorios(true);

      const resultados = await Promise.allSettled([
        obtenerDepartamentos(),
        obtenerSubregiones(),
        obtenerMunicipios(),
        obtenerCatalogoIndicadores(),
        obtenerPeriodos(),
      ]);

      if (!activo) return;

      const [
        resultadoDepartamentos,
        resultadoSubregiones,
        resultadoMunicipios,
        resultadoIndicadores,
        resultadoPeriodos,
      ] = resultados;

      if (resultadoDepartamentos.status === "fulfilled") {
        setDepartamentos(resultadoDepartamentos.value);
      }

      if (resultadoSubregiones.status === "fulfilled") {
        setSubregiones(resultadoSubregiones.value);
      }

      if (resultadoMunicipios.status === "fulfilled") {
        setMunicipios(resultadoMunicipios.value);
      }

      if (resultadoIndicadores.status === "fulfilled") {
        setCatalogoIndicadores(resultadoIndicadores.value);
      }

      if (resultadoPeriodos.status === "fulfilled") {
        setPeriodos(resultadoPeriodos.value);
      }

      if (resultados.some(
        (resultado) => resultado.status === "rejected"
      )) {
        console.error(
          "DATAVIDA: No fue posible cargar uno o más catálogos."
        );
      }

      setCargandoTerritorios(false);
    }

    cargarCatalogos();

    return () => {
      activo = false;
    };
  }, []);

  // ==========================================
  // FILTRAR SUBREGIONES POR DEPARTAMENTO
  // ==========================================

  const cargarSubregiones = useCallback(
    async (departamentoCodigo = "") => {
      try {
        const resultado = await obtenerSubregiones({
          departamentoCodigo,
        });

        setSubregiones(resultado);

        return resultado;
      } catch (err) {
        console.error(
          "Error cargando subregiones PDET:",
          err
        );

        setSubregiones([]);
        return [];
      }
    },
    []
  );

  // ==========================================
  // FILTRAR MUNICIPIOS
  // ==========================================

  const cargarMunicipios = useCallback(
    async ({
      departamentoCodigo = "",
      subregionCodigo = "",
    } = {}) => {
      try {
        const resultado = await obtenerMunicipios({
          departamentoCodigo,
          subregionCodigo,
        });

        setMunicipios(resultado);

        return resultado;
      } catch (err) {
        console.error(
          "Error cargando municipios PDET:",
          err
        );

        setMunicipios([]);
        return [];
      }
    },
    []
  );

  // ==========================================
  // CONSULTAR INDICADORES
  // ==========================================

  const buscar = useCallback(async (filtros = {}) => {
    setCargando(true);
    setError(null);

    try {
      const resultado = await consultarIndicadores(filtros);

      setDatos(resultado.datos || []);
      setMensaje(resultado.mensaje || "");
    } catch (err) {
      console.error(
        "Error consultando indicadores:",
        err
      );

      setError(
        "No fue posible consultar los indicadores. Verifica la conexión con el servidor."
      );

      setDatos([]);
      setMensaje("");
    } finally {
      setCargando(false);
      setHaBuscado(true);
    }
  }, []);

  // ==========================================
  // LIMPIAR RESULTADOS
  // ==========================================

  const limpiar = useCallback(() => {
    setDatos([]);
    setError(null);
    setMensaje("");
    setHaBuscado(false);
  }, []);

  // ==========================================
  // EXPORTAR ESTADOS Y FUNCIONES
  // ==========================================

  return {
    departamentos,
    subregiones,
    municipios,

    catalogoIndicadores,
    periodos,

    datos,
    cargando,
    cargandoTerritorios,
    error,
    mensaje,
    haBuscado,

    cargarSubregiones,
    cargarMunicipios,

    buscar,
    limpiar,
  };
}
