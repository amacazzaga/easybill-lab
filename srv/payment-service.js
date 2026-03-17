const cds = require('@sap/cds')
const EmailService = require('./external/EmailService')

module.exports = class PaymentService extends cds.ApplicationService {

  async init() {

    // handler de diagnóstico - sin filtro de entidad, intercepta todo CREATE
    this.before('CREATE', async (req) => {
      console.error('[DIAG] CREATE - entity:', req.entity, '- path:', req.path)
    })

    // ── before CREATE ──────────────────────────────────────────
    // Usamos el nombre de entidad como string (no referencia) para
    // garantizar que el filtro h.for(req) matchee correctamente en CAP v9.
    // Usamos 'easybill.Invoices' directamente para ver estados Pagada/Anulada
    // (la proyección del servicio solo muestra Emitida/Vencida).
    this.before('CREATE', 'Payments', async (req) => {
      console.error('[DEBUG] before CREATE Payments - entity:', req.entity, '- path:', req.path, '- target:', req.target?.name)
      const { invoice_ID, importe } = req.data

      if (!importe || importe <= 0)
        req.reject(400, 'El importe del pago debe ser mayor a 0')

      const invoice = await SELECT.one.from('easybill.Invoices').where({ ID: invoice_ID })

      if (!invoice)
        req.reject(404, `Factura ${invoice_ID} no encontrada`)
      if (invoice.estado === 'Pagada')
        req.reject(409, 'La factura ya está completamente pagada')
      if (invoice.estado === 'Anulada')
        req.reject(409, 'No se pueden registrar pagos en una factura anulada')
    })

    // ── after CREATE ───────────────────────────────────────────
    this.after('CREATE', 'Payments', async (payment, req) => {
      const invoice = await SELECT.one.from('easybill.Invoices').where({ ID: payment.invoice_ID })

      // Sumar todos los pagos de esta factura
      const pagos = await SELECT.from('easybill.Payments').where({ invoice_ID: payment.invoice_ID })
      const totalPagado = pagos.reduce((s, p) => s + p.importe, 0)

      // Si se cubre el total → marcar como Pagada
      if (totalPagado >= invoice.total) {
        await UPDATE('easybill.Invoices')
          .set({ estado: 'Pagada' })
          .where({ ID: payment.invoice_ID })
      }

      // Enviar confirmacion de pago al cliente
      const db = await cds.connect.to('db')
      const client = await SELECT.one.from(db.entities('easybill').Clients).where({ ID: invoice.client_ID })
      await EmailService.sendPaymentConfirmation(
        { importe: payment.importe, pagada: totalPagado >= invoice.total },
        invoice,
        client
      )

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

    // ── before DELETE — pagos no se eliminan físicamente ──
    this.before('DELETE', 'Payments', (req) => {
      req.reject(405, 'Los pagos no se pueden eliminar.')
    })

    return super.init()
  }
}
