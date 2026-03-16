'use strict'

const path = require('path')
const fs   = require('fs')
const PDFDocument = require('pdfkit')

const OUTPUT_DIR = path.join(__dirname, '..', '..', 'tmp', 'pdfs')

/**
 * PdfService — generación de PDF de facturas con pdfkit.
 */

/**
 * Genera el PDF de una factura y lo guarda en tmp/pdfs/.
 * @param {object} invoice  Entidad Invoices
 * @param {Array}  items    Array de InvoiceItems
 * @returns {Promise<string>} URL relativa del PDF generado
 */
async function generateInvoicePDF(invoice, items) {
  _ensureOutputDir()

  const filename = `factura-${invoice.numero.replace('-', '_')}.pdf`
  const filepath = path.join(OUTPUT_DIR, filename)

  await _buildPDF(invoice, items, filepath)

  const url = `/tmp/pdfs/${filename}`
  console.log(`[PdfService] PDF generado: ${url}`)
  return url
}

// ── Helpers privados ────────────────────────────────────────────

function _ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }
}

function _buildPDF(invoice, items, filepath) {
  return new Promise((resolve, reject) => {
    const doc  = new PDFDocument({ margin: 50, size: 'A4' })
    const stream = fs.createWriteStream(filepath)

    doc.pipe(stream)

    // ── Encabezado ──────────────────────────────────────
    doc.fontSize(20).text(`FACTURA ${invoice.tipoComprobante}`, { align: 'center' })
    doc.fontSize(12).text(`N° ${invoice.numero}`, { align: 'center' })
    doc.moveDown()

    // ── Datos del comprobante ───────────────────────────
    doc.fontSize(10)
    doc.text(`Fecha:           ${invoice.fecha}`)
    doc.text(`Fecha Vencimiento: ${invoice.fechaVencimiento || '-'}`)
    doc.text(`CAE:             ${invoice.cae}`)
    doc.text(`CAE Vto:         ${invoice.caeFechaVto}`)
    doc.text(`Estado:          ${invoice.estado}`)
    doc.moveDown()

    // ── Tabla de ítems ──────────────────────────────────
    doc.fontSize(11).text('Detalle', { underline: true })
    doc.moveDown(0.5)

    const col = { desc: 50, qty: 300, price: 360, iva: 420, total: 480 }
    doc.fontSize(9)
    doc.text('Descripción',     col.desc,  doc.y, { continued: false })
    doc.text('Cant',            col.qty,   doc.y - 12)
    doc.text('P.Unit',          col.price, doc.y - 12)
    doc.text('IVA%',            col.iva,   doc.y - 12)
    doc.text('Total',           col.total, doc.y - 12)
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
    doc.moveDown(0.3)

    for (const item of items) {
      const y = doc.y
      doc.text(item.descripcion,              col.desc,  y, { width: 230 })
      doc.text(String(item.cantidad),         col.qty,   y)
      doc.text(`$${item.precioUnitario}`,     col.price, y)
      doc.text(`${item.alicuotaIVA}%`,        col.iva,   y)
      doc.text(`$${item.total}`,              col.total, y)
      doc.moveDown(0.5)
    }

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
    doc.moveDown()

    // ── Totales ─────────────────────────────────────────
    doc.fontSize(10)
    doc.text(`Subtotal:  $${invoice.subtotal}`,  { align: 'right' })
    doc.text(`IVA:       $${invoice.totalIVA}`,  { align: 'right' })
    doc.fontSize(12).text(`TOTAL:     $${invoice.total}`, { align: 'right', bold: true })

    doc.end()

    stream.on('finish', resolve)
    stream.on('error',  reject)
  })
}

module.exports = { generateInvoicePDF }
