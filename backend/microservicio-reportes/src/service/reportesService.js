const indicadoresClient = require("../repository/indicadoresClient");
const repository = require("../repository/reportesRepository");
const { generarPDF, generarExcel } = require("./reportGenerator");

function slug(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** RF-15 Generar y exportar reportes. */
async function generarReporte({ titulo = "Reporte DATAVIDA", filtros = {}, formato = "pdf" }) {
  if (!["pdf", "excel"].includes(formato)) {
    const error = new Error('El formato debe ser "pdf" o "excel".');
    error.codigo = "FORMATO_INVALIDO";
    throw error;
  }

  const datos = await indicadoresClient.consultarValoresIndicadores(filtros);

  let buffer;
  let mime;
  let extension;

  if (formato === "excel") {
    buffer = await generarExcel({ titulo, filtros, datos });
    mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    extension = "xlsx";
  } else {
    buffer = await generarPDF({ titulo, filtros, datos });
    mime = "application/pdf";
    extension = "pdf";
  }

  const nombreArchivo = `${slug(titulo)}-${Date.now()}.${extension}`;

  repository.guardar({
    titulo,
    filtros,
    formato,
    nombreArchivo,
    cantidadRegistros: datos.length,
  });

  return { buffer, mime, nombreArchivo };
}

function obtenerHistorial() {
  return repository.listar();
}

module.exports = { generarReporte, obtenerHistorial };
