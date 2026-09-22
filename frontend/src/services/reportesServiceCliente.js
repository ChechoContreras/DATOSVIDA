import reportesApi from "./reportesApi";

/** Genera el reporte y dispara la descarga del archivo en el navegador. */
async function generarYDescargarReporte({ titulo, filtros, formato }) {
  const respuesta = await reportesApi.post(
    "/reportes",
    { titulo, filtros, formato },
    { responseType: "blob" }
  );

  const disposicion = respuesta.headers["content-disposition"] || "";
  const coincidencia = disposicion.match(/filename="?([^"]+)"?/);
  const nombreArchivo = coincidencia ? coincidencia[1] : `reporte.${formato === "excel" ? "xlsx" : "pdf"}`;

  const url = window.URL.createObjectURL(new Blob([respuesta.data]));
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  window.URL.revokeObjectURL(url);

  return nombreArchivo;
}

async function obtenerHistorialReportes() {
  const { data } = await reportesApi.get("/reportes/historial");
  return data;
}

export { generarYDescargarReporte, obtenerHistorialReportes };
