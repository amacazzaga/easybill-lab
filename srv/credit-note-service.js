const cds = require('@sap/cds')
const AfipService = require('./external/AfipService')

module.exports = class CreditNoteService extends cds.ApplicationService {

  async init() {
    const { CreditNotes, CreditNoteItems, Invoices } = this.entities
    const db = await cds.connect.to('db')
    const { InvoiceItems } = db.entities('easybill')

    // ── before CREATE ──────────────────────────────────────────
    this.before('CREATE', CreditNotes, async (req) => {
      const { invoice_ID, puntoVenta = '0001', motivo } = req.data

      if (!motivo || motivo.trim() === '')
        return req.error(400, 'Debe indicar un motivo para la nota de crédito')

      const invoice = await SELECT.one.from(Invoices).where({ ID: invoice_ID })

      if (!invoice)
        return req.error(404, `Factura ${invoice_ID} no encontrada`)
      if (invoice.estado === 'Anulada')
        return req.error(409, 'No se puede emitir nota de crédito sobre una factura anulada')

      // Verificar que no exista una nota de crédito activa para esta factura
      const existingCN = await SELECT.one.from(CreditNotes)
        .where({ invoice_ID, estado: 'Emitida' })
      if (existingCN)
        return req.error(409, 'Ya existe una nota de crédito emitida para esta factura')

      // Número de nota de crédito auto-generado
      const lastCN = await SELECT.one
        .from(db.entities('easybill').CreditNotes)
        .columns('numeroComprobante')
        .where({ puntoVenta, tipoComprobante: invoice.tipoComprobante })
        .orderBy({ numeroComprobante: 'desc' })

      const nextNum = lastCN
        ? String(parseInt(lastCN.numeroComprobante) + 1).padStart(8, '0')
        : '00000001'

      // CAE simulado para la nota de crédito
      const caeData = await AfipService.generateCAE({
        tipoComprobante: invoice.tipoComprobante,
        puntoVenta,
        numero: nextNum,
        total:  invoice.total,
        clientCuit: null
      })

      req.data.tipoComprobante   = invoice.tipoComprobante
      req.data.puntoVenta        = puntoVenta
      req.data.numeroComprobante = nextNum
      req.data.numero            = `${puntoVenta}-${nextNum}`
      req.data.client_ID         = invoice.client_ID
      req.data.company_ID        = invoice.company_ID
      req.data.fecha             = req.data.fecha || new Date().toISOString().split('T')[0]
      req.data.cae               = caeData.cae
      req.data.caeFechaVto       = caeData.caeFechaVto
      req.data.subtotal          = invoice.subtotal
      req.data.totalIVA          = invoice.totalIVA
      req.data.total             = invoice.total

      // Copiar ítems de la factura original
      const invoiceItems = await SELECT.from(InvoiceItems).where({ invoice_ID })
      req.data.items = invoiceItems.map(i => ({
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
    this.after('CREATE', CreditNotes, async (creditNote, req) => {
      await this.emit('CreditNoteIssued', {
        creditNoteID: creditNote.ID,
        invoiceID:    creditNote.invoice_ID,
        companyID:    creditNote.company_ID,
        numero:       creditNote.numero
      })
    })

    // ── ACTION: voidCreditNote ─────────────────────────────────
    this.on('voidCreditNote', async (req) => {
      const { creditNoteID, motivo } = req.data
      const cn = await SELECT.one.from(CreditNotes).where({ ID: creditNoteID })

      if (!cn)
        return req.error(404, `Nota de crédito ${creditNoteID} no encontrada`)
      if (cn.estado === 'Anulada')
        return req.error(409, 'La nota de crédito ya está anulada')

      await UPDATE(CreditNotes).set({ estado: 'Anulada' }).where({ ID: creditNoteID })

      await this.emit('CreditNoteVoided', {
        creditNoteID: creditNoteID,
        companyID:    cn.company_ID,
        motivo
      })

      return { message: `Nota de crédito ${cn.numero} anulada correctamente` }
    })

    return super.init()
  }
}
