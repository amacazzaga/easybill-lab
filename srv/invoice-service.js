const cds    = require('@sap/cds')
const AfipService  = require('./external/AfipService')
const EmailService = require('./external/EmailService')
const PdfService   = require('./external/PdfService')

module.exports = class InvoiceService extends cds.ApplicationService {

  async init() {
    const { Invoices, InvoiceItems, Orders } = this.entities
    const db = await cds.connect.to('db')
    const { Orders: DBOrders, OrderItems, Clients } = db.entities('easybill')

    // ── before CREATE ──────────────────────────────────────────
    this.before('CREATE', Invoices, async (req) => {
      const { order_ID, puntoVenta = '0001' } = req.data

      // Validar que la Order existe y está Aprobada
      const order = await SELECT.one.from(DBOrders)
        .columns('ID','estado','client_ID','company_ID','subtotal','totalIVA','total','invoice_ID')
        .where({ ID: order_ID })

      if (!order)
        return req.error(404, `Pedido ${order_ID} no encontrado`)
      if (order.estado !== 'Aprobada')
        return req.error(400, `El pedido debe estar Aprobado para facturar. Estado actual: ${order.estado}`)
      if (order.invoice_ID)
        return req.error(409, 'Este pedido ya tiene una factura emitida')

      // Determinar tipo de comprobante según condición IVA del cliente
      const client = await SELECT.one.from(Clients).where({ ID: order.client_ID })
      const tipoComprobante = _determineTipoComprobante(client.condicionIVA)

      // Obtener ítems de la order para copiarlos
      const orderItems = await SELECT.from(OrderItems).where({ order_ID })

      // Número de comprobante auto-generado
      const lastInvoice = await SELECT.one.from(db.entities('easybill').Invoices)
        .columns('numeroComprobante')
        .where({ puntoVenta, tipoComprobante })
        .orderBy({ numeroComprobante: 'desc' })

      const nextNum = lastInvoice
        ? String(parseInt(lastInvoice.numeroComprobante) + 1).padStart(8, '0')
        : '00000001'

      // Obtener CAE simulado de AFIP
      const caeData = await AfipService.generateCAE({
        tipoComprobante,
        puntoVenta,
        numero:    nextNum,
        total:     order.total,
        clientCuit: client.cuit
      })

      // Poblar la factura
      req.data.tipoComprobante   = tipoComprobante
      req.data.puntoVenta        = puntoVenta
      req.data.numeroComprobante = nextNum
      req.data.numero            = `${puntoVenta}-${nextNum}`
      req.data.client_ID         = order.client_ID
      req.data.company_ID        = order.company_ID
      req.data.fecha             = req.data.fecha || new Date().toISOString().split('T')[0]
      req.data.fechaVencimiento  = req.data.fechaVencimiento || _addDays(req.data.fecha, 30)
      req.data.cae               = caeData.cae
      req.data.caeFechaVto       = caeData.caeFechaVto
      req.data.subtotal          = order.subtotal
      req.data.totalIVA          = order.totalIVA
      req.data.total             = order.total

      // Copiar items de la order a la factura
      req.data.items = orderItems.map(i => ({
        product_ID:     i.product_ID,
        descripcion:    i.descripcion,
        cantidad:       i.cantidad,
        precioUnitario: i.precioUnitario,
        alicuotaIVA:    i.alicuotaIVA,
        subtotal:       i.subtotal,
        importeIVA:     i.importeIVA,
        total:          i.total
      }))
    })

    // ── after CREATE ───────────────────────────────────────────
    this.after('CREATE', Invoices, async (invoice, req) => {
      const db = await cds.connect.to('db')
      const { Orders: DBOrders } = db.entities('easybill')

      // Marcar la Order como Facturada
      await UPDATE(DBOrders)
        .set({ estado: 'Facturada', invoice_ID: invoice.ID })
        .where({ ID: invoice.order_ID })

      // Enviar email simulado
      const client = await SELECT.one.from(db.entities('easybill').Clients)
        .where({ ID: invoice.client_ID })
      await EmailService.sendInvoiceEmail(invoice, client)

      await this.emit('InvoiceGenerated', {
        invoiceID: invoice.ID,
        companyID: invoice.company_ID,
        numero:    invoice.numero,
        total:     invoice.total
      })
    })

    // ── Control de concurrencia: ETag mismatch → 412 ──────────
    this.on('error', (err, req) => {
      if (err.code === 412 || err.status === 412) {
        err.message = 'La factura fue modificada por otro usuario. Recargá la página para ver la versión actualizada.'
      }
    })

    // ── before UPDATE — bloquear si Emitida/Pagada ─────────────
    this.before('UPDATE', Invoices, async (req) => {
      const { ID } = req.params[0]
      const invoice = await SELECT.one.from(Invoices).where({ ID })
      if (!invoice) return req.error(404, 'Factura no encontrada')

      if (['Emitida', 'Pagada'].includes(invoice.estado))
        return req.error(409, `No se puede modificar una factura en estado "${invoice.estado}"`)
    })

    // ── ACTION: void ───────────────────────────────────────────
    this.on('void', async (req) => {
      const { invoiceID, motivo } = req.data
      const invoice = await SELECT.one.from(Invoices).where({ ID: invoiceID })

      if (!invoice)
        return req.error(404, `Factura ${invoiceID} no encontrada`)
      if (invoice.estado === 'Anulada')
        return req.error(409, 'La factura ya está anulada')
      if (invoice.estado === 'Pagada')
        return req.error(409, 'No se puede anular una factura pagada')

      await UPDATE(Invoices).set({ estado: 'Anulada' }).where({ ID: invoiceID })

      // Revertir el estado de la Order a Aprobada
      const db = await cds.connect.to('db')
      await UPDATE(db.entities('easybill').Orders)
        .set({ estado: 'Aprobada', invoice_ID: null })
        .where({ ID: invoice.order_ID })

      await this.emit('InvoiceVoided', {
        invoiceID: invoiceID,
        companyID: invoice.company_ID,
        motivo
      })

      return { message: `Factura ${invoice.numero} anulada correctamente` }
    })

    // ── ACTION: generatePDF ────────────────────────────────────
    this.on('generatePDF', async (req) => {
      const { invoiceID } = req.data
      const invoice = await SELECT.one
        .from(Invoices)
        .columns('*')
        .where({ ID: invoiceID })

      if (!invoice) return req.error(404, 'Factura no encontrada')

      const items = await SELECT.from(this.entities.InvoiceItems)
        .where({ invoice_ID: invoiceID })

      const url = await PdfService.generateInvoicePDF(invoice, items)
      return { url }
    })

    return super.init()
  }
}

// ── Helpers ────────────────────────────────────────────────────

function _determineTipoComprobante(condicionIVA) {
  // RI factura a RI → A | RI factura a CF/EX/MT → B | MT factura a quien sea → C
  if (condicionIVA === 'RI') return 'A'
  if (condicionIVA === 'MT') return 'C'
  return 'B'
}

function _addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function _addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}
