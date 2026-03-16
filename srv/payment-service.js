const cds = require('@sap/cds')

module.exports = class PaymentService extends cds.ApplicationService {

  async init() {
    const { Payments, Invoices } = this.entities

    // ── before CREATE ──────────────────────────────────────────
    this.before('CREATE', Payments, async (req) => {
      const { invoice_ID, importe } = req.data

      if (!importe || importe <= 0)
        return req.error(400, 'El importe del pago debe ser mayor a 0')

      const invoice = await SELECT.one.from(Invoices).where({ ID: invoice_ID })

      if (!invoice)
        return req.error(404, `Factura ${invoice_ID} no encontrada`)
      if (invoice.estado === 'Pagada')
        return req.error(409, 'La factura ya está completamente pagada')
      if (invoice.estado === 'Anulada')
        return req.error(409, 'No se pueden registrar pagos en una factura anulada')
    })

    // ── after CREATE ───────────────────────────────────────────
    this.after('CREATE', Payments, async (payment, req) => {
      const invoice = await SELECT.one.from(Invoices).where({ ID: payment.invoice_ID })

      // Sumar todos los pagos de esta factura
      const pagos = await SELECT.from(Payments).where({ invoice_ID: payment.invoice_ID })
      const totalPagado = pagos.reduce((s, p) => s + p.importe, 0)

      // Si se cubre el total → marcar como Pagada
      if (totalPagado >= invoice.total) {
        await UPDATE(Invoices)
          .set({ estado: 'Pagada' })
          .where({ ID: payment.invoice_ID })
      }

      await this.emit('PaymentReceived', {
        paymentID:    payment.ID,
        invoiceID:    payment.invoice_ID,
        companyID:    invoice.company_ID,
        importe:      payment.importe,
        totalPagado,
        totalFactura: invoice.total,
        pagada:       totalPagado >= invoice.total
      })
    })

    return super.init()
  }
}
