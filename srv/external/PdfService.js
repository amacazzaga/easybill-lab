'use strict'

const path = require('path')
const fs   = require('fs')
const PDFDocument = require('pdfkit')

const OUTPUT_DIR = path.join(__dirname, '..', '..', 'tmp', 'pdfs')

async function generateInvoicePDF(invoice, items, company, client) {
  _ensureOutputDir()
  const filename = `factura-${invoice.numero.replace('-', '_')}.pdf`
  const filepath = path.join(OUTPUT_DIR, filename)
  await _buildPDF(invoice, items, company, client, filepath)
  const url = `/tmp/pdfs/${filename}`
  console.log(`[PdfService] PDF generado: ${url}`)
  return url
}

function _ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

function _buildPDF(invoice, items, company, client, filepath) {
  return new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ margin: 50, size: 'A4' })
    const stream = fs.createWriteStream(filepath)
    doc.pipe(stream)

    const esA = invoice.tipoComprobante === 'A'
    const esC = invoice.tipoComprobante === 'C'

    // -- TITULO + ORIGINAL --
    doc.fontSize(20).font('Helvetica-Bold')
       .text(`FACTURA ${invoice.tipoComprobante}`, 50, 50, { width: 495, align: 'center' })
    doc.fontSize(9).font('Helvetica')
       .text('ORIGINAL', 460, 52, { width: 80, align: 'right' })

    const sep1Y = 82
    doc.moveTo(50, sep1Y).lineTo(545, sep1Y).strokeColor('#999999').lineWidth(0.5).stroke()
    doc.strokeColor('black').lineWidth(1)

    // -- EMISOR / RECEPTOR --
    const colL = 50, colR = 310
    let rY = 90

    doc.fontSize(8).font('Helvetica-Bold')
    doc.text('EMISOR',   colL, rY)
    doc.text('RECEPTOR', colR, rY)
    rY += 12

    doc.font('Helvetica')
    doc.text(company ? company.razonSocial : '-', colL, rY, { width: 240 })
    doc.text(client  ? client.razonSocial  : '-', colR, rY, { width: 235 })
    rY += 12

    doc.text('CUIT: ' + (company ? company.cuit : '-'), colL, rY)
    doc.text('CUIT: ' + (client  ? client.cuit  : '-'), colR, rY)
    rY += 11

    doc.text('Cond. IVA: ' + _ivaLabel(company ? company.condicionIVA : null), colL, rY)
    doc.text('Cond. IVA: ' + _ivaLabel(client  ? client.condicionIVA  : null), colR, rY)
    rY += 11

    if (company && company.domicilio) doc.text(company.domicilio, colL, rY, { width: 240 })
    if (client  && client.domicilio)  doc.text(client.domicilio,  colR, rY, { width: 235 })
    rY += 20

    doc.moveTo(50, rY).lineTo(545, rY).strokeColor('#999999').lineWidth(0.5).stroke()
    doc.strokeColor('black').lineWidth(1)
    rY += 8

    // -- DATOS COMPROBANTE --
    doc.y = rY
    doc.fontSize(8).font('Helvetica')
    doc.text('Comprobante N: ' + invoice.numero + '   |   Fecha: ' + invoice.fecha + '   |   Vto. pago: ' + (invoice.fechaVencimiento || '-'))
    doc.text('CAE: ' + invoice.cae + '   |   CAE Vto: ' + invoice.caeFechaVto + '   |   Estado: ' + invoice.estado)
    doc.moveDown(0.6)

    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#999999').lineWidth(0.5).stroke()
    doc.strokeColor('black').lineWidth(1)
    doc.moveDown(0.4)

    // -- CABECERA TABLA --
    const col = esA
      ? { desc: 50, qty: 255, price: 305, iva: 360, ivaImp: 410, total: 475 }
      : { desc: 50, qty: 290, price: 360, total: 460 }

    doc.fontSize(8).font('Helvetica-Bold')
    if (esA) {
      doc.text('Descripcion', col.desc,   doc.y, { width: 195 })
      doc.text('Cant',        col.qty,    doc.y - 10)
      doc.text('P.Neto',      col.price,  doc.y - 10)
      doc.text('IVA%',        col.iva,    doc.y - 10)
      doc.text('Imp.IVA',     col.ivaImp, doc.y - 10)
      doc.text('Total',       col.total,  doc.y - 10)
    } else {
      doc.text('Descripcion', col.desc,  doc.y, { width: 230 })
      doc.text('Cant',        col.qty,   doc.y - 10)
      doc.text('Precio',      col.price, doc.y - 10)
      doc.text('Total',       col.total, doc.y - 10)
    }

    doc.font('Helvetica')
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke()
    doc.moveDown(0.3)

    for (const item of items) {
      const y = doc.y
      if (esA) {
        doc.text(String(item.descripcion),  col.desc,   y, { width: 195 })
        doc.text(_fmt(item.cantidad),       col.qty,    y)
        doc.text('$' + _num(item.precioUnitario), col.price, y)
        doc.text(item.alicuotaIVA + '%',    col.iva,    y)
        doc.text('$' + _num(item.importeIVA), col.ivaImp, y)
        doc.text('$' + _num(item.total),    col.total,  y)
      } else {
        doc.text(String(item.descripcion),  col.desc,  y, { width: 230 })
        doc.text(_fmt(item.cantidad),       col.qty,   y)
        doc.text('$' + _num(item.precioUnitario), col.price, y)
        doc.text('$' + _num(item.total),    col.total, y)
      }
      doc.moveDown(0.5)
    }

    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke()
    doc.moveDown(0.5)

    // -- TOTALES --
    if (esA) {
      const ivaMap = {}
      for (const item of items) {
        const key = String(item.alicuotaIVA)
        ivaMap[key] = (ivaMap[key] || 0) + Number(item.importeIVA)
      }
      doc.fontSize(9).font('Helvetica')
      doc.text('Subtotal Neto:  $' + _num(invoice.subtotal), { align: 'right' })
      Object.keys(ivaMap).sort().forEach(function(k) {
        doc.text('IVA ' + k + '%:        $' + _num(ivaMap[k]), { align: 'right' })
      })
      doc.font('Helvetica-Bold').fontSize(11)
         .text('TOTAL:         $' + _num(invoice.total), { align: 'right' })
      doc.font('Helvetica').fontSize(7)
         .text('(*) IVA discriminado. Valido como credito fiscal solo para Responsables Inscriptos.', { align: 'right' })
    } else if (esC) {
      doc.font('Helvetica-Bold').fontSize(11)
         .text('TOTAL:  $' + _num(invoice.total), { align: 'right' })
      doc.font('Helvetica').fontSize(7)
         .text('Emisor Monotributista - no se discrimina IVA.', { align: 'right' })
    } else {
      doc.fontSize(9).font('Helvetica')
      doc.text('Subtotal:      $' + _num(invoice.subtotal), { align: 'right' })
      doc.text('IVA incluido:  $' + _num(invoice.totalIVA), { align: 'right' })
      doc.font('Helvetica-Bold').fontSize(11)
         .text('TOTAL (IVA incluido):  $' + _num(invoice.total), { align: 'right' })
      doc.font('Helvetica')
    }

    doc.end()
    stream.on('finish', resolve)
    stream.on('error',  reject)
  })
}

function _ivaLabel(code) {
  const map = { RI: 'Responsable Inscripto', MT: 'Monotributista', EX: 'Exento', CF: 'Consumidor Final' }
  return (map[code] || code || '-')
}

function _num(n) {
  return Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function _fmt(n) {
  return Number(n || 0).toLocaleString('es-AR', { maximumFractionDigits: 3 })
}

module.exports = { generateInvoicePDF }
