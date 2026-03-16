'use strict'

/**
 * EmailService — simulación de envío de emails transaccionales.
 * En producción se reemplazaría por SendGrid, AWS SES, o SAP BTP Mail.
 */

/**
 * Envía el email de factura emitida al cliente.
 * @param {object} invoice  Entidad Invoices
 * @param {object} client   Entidad Clients
 */
async function sendInvoiceEmail(invoice, client) {
  if (!client?.email) {
    console.log(`[EmailService] Cliente sin email — omitiendo envío para factura ${invoice.numero}`)
    return
  }

  console.log(`[EmailService] EMAIL ENVIADO`)
  console.log(`  Para:    ${client.email}`)
  console.log(`  Asunto:  Factura ${invoice.tipoComprobante} N° ${invoice.numero}`)
  console.log(`  Total:   $${invoice.total}`)
  console.log(`  CAE:     ${invoice.cae}`)
}

/**
 * Envía el email de nota de crédito al cliente.
 * @param {object} creditNote  Entidad CreditNotes
 * @param {object} client      Entidad Clients
 */
async function sendCreditNoteEmail(creditNote, client) {
  if (!client?.email) {
    console.log(`[EmailService] Cliente sin email — omitiendo envío para NC ${creditNote.numero}`)
    return
  }

  console.log(`[EmailService] EMAIL ENVIADO`)
  console.log(`  Para:    ${client.email}`)
  console.log(`  Asunto:  Nota de Crédito N° ${creditNote.numero}`)
  console.log(`  Total:   $${creditNote.total}`)
  console.log(`  Motivo:  ${creditNote.motivo}`)
}

module.exports = { sendInvoiceEmail, sendCreditNoteEmail }
