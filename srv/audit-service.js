const cds = require('@sap/cds')

module.exports = class AuditService extends cds.ApplicationService {

  async init() {
    const db = await cds.connect.to('db')
    const { AuditLog } = db.entities('easybill')

    // ── Suscripción a servicios via cds.connect.to (Event Mesh simulado) ────
    // Cada servicio se conecta independientemente y suscribe sus eventos.
    // En producción con SAP Event Mesh, este mismo código funcionaría
    // apuntando a un broker externo en lugar de in-process.

    const orderSrv      = await cds.connect.to('OrderService')
    const invoiceSrv    = await cds.connect.to('InvoiceService')
    const paymentSrv    = await cds.connect.to('PaymentService')
    const creditNoteSrv = await cds.connect.to('CreditNoteService')

    const _persist = (evento, entidad) => async (data) => {
      await db.insert(AuditLog).entries({
        timestamp:  new Date().toISOString(),
        evento,
        entidad,
        entidadId:  data.orderID || data.invoiceID || data.paymentID || data.creditNoteID || '',
        usuario:    data.user    || 'system',
        companyId:  data.companyID || '',
        detalle:    JSON.stringify(data)
      })
      console.log(`[AuditService] Evento registrado: ${evento}`)
    }

    // Pedidos
    orderSrv.on('OrderPlaced',   _persist('OrderPlaced',   'Orders'))
    orderSrv.on('OrderApproved', _persist('OrderApproved', 'Orders'))

    // Facturas
    invoiceSrv.on('InvoiceGenerated', _persist('InvoiceGenerated', 'Invoices'))
    invoiceSrv.on('InvoiceVoided',    _persist('InvoiceVoided',    'Invoices'))

    // Pagos
    paymentSrv.on('PaymentReceived', _persist('PaymentReceived', 'Payments'))

    // Notas de crédito
    creditNoteSrv.on('CreditNoteIssued', _persist('CreditNoteIssued', 'CreditNotes'))
    creditNoteSrv.on('CreditNoteVoided', _persist('CreditNoteVoided', 'CreditNotes'))

    return super.init()
  }
}
