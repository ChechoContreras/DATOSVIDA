const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");

function generarPDF({ titulo, filtros, datos }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 45 });
    const buffers = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    doc.fontSize(18).fillColor("#1c3a34").text(titulo, { align: "center" });
    doc.moveDown(0.5);
    doc
      .fontSize(9)
      .fillColor("#666")
      .text(`Generado: ${new Date().toLocaleString("es-CO")}`, { align: "center" });

    const filtrosTexto = Object.entries(filtros || {})
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" · ");
    if (filtrosTexto) {
      doc.text(`Filtros aplicados: ${filtrosTexto}`, { align: "center" });
    }

    doc.moveDown(1.2);

    if (datos.length === 0) {
      doc.fontSize(12).fillColor("#9c3b3b").text("No se encontraron resultados para los filtros seleccionados.");
    } else {
      doc.fontSize(10).fillColor("#1c3a34");
      datos.forEach((d, i) => {
        doc
          .fillColor("#1c3a34")
          .font("Helvetica-Bold")
          .text(`${i + 1}. ${d.municipio.nombre}, ${d.municipio.departamento}`, { continued: false });
        doc
          .font("Helvetica")
          .fillColor("#333")
          .text(
            `   ${d.indicador.nombre} (${d.indicador.dimension}): ${d.valor}${d.indicador.unidad} — periodo ${d.periodo}, fuente ${d.fuente}`
          );
        doc.moveDown(0.3);
      });
    }

    doc.moveDown(1);
    doc
      .fontSize(8)
      .fillColor("#999")
      .text("DATAVIDA — Índice de Pobreza Multidimensional. Documento generado automáticamente.", {
        align: "center",
      });

    doc.end();
  });
}

async function generarExcel({ titulo, filtros, datos }) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "DATAVIDA";
  workbook.created = new Date();

  const hoja = workbook.addWorksheet("Reporte");

  hoja.mergeCells("A1:G1");
  hoja.getCell("A1").value = titulo;
  hoja.getCell("A1").font = { bold: true, size: 14, color: { argb: "FF1C3A34" } };

  hoja.getCell("A2").value = `Generado: ${new Date().toLocaleString("es-CO")}`;
  hoja.getCell("A2").font = { italic: true, size: 9, color: { argb: "FF666666" } };

  const filtrosTexto = Object.entries(filtros || {})
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");
  hoja.getCell("A3").value = filtrosTexto ? `Filtros: ${filtrosTexto}` : "Sin filtros aplicados";
  hoja.getCell("A3").font = { italic: true, size: 9, color: { argb: "FF666666" } };

  const encabezados = ["Municipio", "Departamento", "Indicador", "Dimensión", "Periodo", "Valor", "Fuente"];
  const filaEncabezado = hoja.addRow([]); // fila 4 en blanco de separación
  const filaTitulos = hoja.addRow(encabezados);
  filaTitulos.eachCell((celda) => {
    celda.font = { bold: true, color: { argb: "FFFFFFFF" } };
    celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1C3A34" } };
  });

  datos.forEach((d) => {
    hoja.addRow([
      d.municipio.nombre,
      d.municipio.departamento,
      d.indicador.nombre,
      d.indicador.dimension,
      d.periodo,
      d.valor,
      d.fuente,
    ]);
  });

  hoja.columns.forEach((columna) => {
    columna.width = 22;
  });

  return workbook.xlsx.writeBuffer();
}

module.exports = { generarPDF, generarExcel };
