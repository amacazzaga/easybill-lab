'use strict'

const nodemailer = require('nodemailer')
require('dotenv').config()

// Transporter singleton  se crea una sola vez al cargar el módulo
let _transporter = null

function _getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
      port: parseInt(process.env.SMTP_PORT) || 2525,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  }
  return _transporter
}

const FROM = process.env.MAIL_FROM || 'noreply@easybill.com.ar'

// 
// sendInvoiceEmail  factura emitida
// 
async function sendInvoiceEmail(invoice, client) {
  if (!client || !client.email) {
    console.log(`[EmailService] Cliente sin email  omitiendo envio factura ${invoice.numero}`)
    return
  }

  const html = `
    <h2>Factura ${invoice.tipoComprobante} N&deg; ${invoice.numero}</h2>
    <p>Estimado/a <strong>${client.razonSocial}</strong>,</p>
    <p>Le informamos que se ha emitido la siguiente factura:</p>
    <table border="1" cellpadding="6" style="border-collapse:collapse">
      <tr><td><b>Comprobante</b></td><td>Factura ${invoice.tipoComprobante} N&deg; ${invoice.numero}</td></tr>
      <tr><td><b>Fecha</b></td><td>${invoice.fecha}</td></tr>
      <tr><td><b>Vencimiento</b></td><td>${invoice.fechaVencimiento || '-'}</td></tr>
      <tr><td><b>Total</b></td><td><strong>$${invoice.total}</strong></td></tr>
      <tr><td><b>CAE</b></td><td>${invoice.cae}</td></tr>
      <tr><td><b>CAE Vto</b></td><td>${invoice.caeFechaVto}</td></tr>
    </table>
    <hr style="margin-top:32px;border:none;border-top:1px solid #ddd">
    <p style="color:#b00;font-size:11px;font-style:italic">⚠️ Este correo fue generado por <strong>EasyBill Lab</strong>, un proyecto integrador de capacitaci&oacute;n en SAP CAP Node.js. No corresponde a una operaci&oacute;n comercial real. Por favor ignor&aacute; este mensaje si lo recibiste por error.</p>
    <p style="color:#888;font-size:11px">EasyBill &mdash; Sistema de Facturaci&oacute;n Electr&oacute;nica</p>
  `

  try {
    const info = await _getTransporter().sendMail({
      from:    FROM,
      to:      client.email,
      subject: `Factura ${invoice.tipoComprobante} N° ${invoice.numero}  Total $${invoice.total}`,
      html
    })
    console.log(`[EmailService] Factura enviada a ${client.email} | msgId: ${info.messageId}`)
  } catch (err) {
    console.error(`[EmailService] Error enviando factura ${invoice.numero}:`, err.message)
  }
}

// 
// sendPaymentConfirmation  pago registrado
// 
async function sendPaymentConfirmation(payment, invoice, client) {
  if (!client || !client.email) return

  const pagada = payment.pagada
  const html = `
    <h2>Confirmacion de Pago</h2>
    <p>Estimado/a <strong>${client.razonSocial}</strong>,</p>
    <p>Registramos un pago sobre la factura <strong>${invoice.numero}</strong>:</p>
    <table border="1" cellpadding="6" style="border-collapse:collapse">
      <tr><td><b>Factura</b></td><td>${invoice.numero}</td></tr>
      <tr><td><b>Pago recibido</b></td><td>$${payment.importe}</td></tr>
      <tr><td><b>Total factura</b></td><td>$${invoice.total}</td></tr>
      <tr><td><b>Estado</b></td><td><strong>${pagada ? 'CANCELADA TOTALMENTE' : 'Pendiente de saldo'}</strong></td></tr>
    </table>
    <hr style="margin-top:32px;border:none;border-top:1px solid #ddd">
    <p style="color:#b00;font-size:11px;font-style:italic">⚠️ Este correo fue generado por <strong>EasyBill Lab</strong>, un proyecto integrador de capacitaci&oacute;n en SAP CAP Node.js. No corresponde a una operaci&oacute;n comercial real. Por favor ignor&aacute; este mensaje si lo recibiste por error.</p>
    <p style="color:#888;font-size:11px">EasyBill &mdash; Sistema de Facturaci&oacute;n Electr&oacute;nica</p>
  `

  try {
    const info = await _getTransporter().sendMail({
      from:    FROM,
      to:      client.email,
      subject: `Pago recibido  Factura ${invoice.numero}${pagada ? ' (CANCELADA)' : ''}`,
      html
    })
    console.log(`[EmailService] Confirmacion pago enviada a ${client.email} | msgId: ${info.messageId}`)
  } catch (err) {
    console.error(`[EmailService] Error enviando confirmacion pago:`, err.message)
  }
}

// 
// sendVoidNotification  factura anulada
// 
async function sendVoidNotification(invoice, client, motivo) {
  if (!client || !client.email) return

  const html = `
    <h2>Anulacion de Factura</h2>
    <p>Estimado/a <strong>${client.razonSocial}</strong>,</p>
    <p>Le informamos que la factura <strong>${invoice.numero}</strong> ha sido <strong style="color:red">ANULADA</strong>.</p>
    <table border="1" cellpadding="6" style="border-collapse:collapse">
      <tr><td><b>Factura</b></td><td>${invoice.numero}</td></tr>
      <tr><td><b>Motivo</b></td><td>${motivo}</td></tr>
    </table>
    <hr style="margin-top:32px;border:none;border-top:1px solid #ddd">
    <p style="color:#b00;font-size:11px;font-style:italic">⚠️ Este correo fue generado por <strong>EasyBill Lab</strong>, un proyecto integrador de capacitaci&oacute;n en SAP CAP Node.js. No corresponde a una operaci&oacute;n comercial real. Por favor ignor&aacute; este mensaje si lo recibiste por error.</p>
    <p style="color:#888;font-size:11px">EasyBill &mdash; Sistema de Facturaci&oacute;n Electr&oacute;nica</p>
  `

  try {
    const info = await _getTransporter().sendMail({
      from:    FROM,
      to:      client.email,
      subject: `Factura ${invoice.numero} ANULADA`,
      html
    })
    console.log(`[EmailService] Notificacion anulacion enviada a ${client.email} | msgId: ${info.messageId}`)
  } catch (err) {
    console.error(`[EmailService] Error enviando anulacion:`, err.message)
  }
}

// 
// sendCreditNoteEmail  nota de credito emitida
// 
async function sendCreditNoteEmail(creditNote, client) {
  if (!client || !client.email) return

  const html = `
    <h2>Nota de Credito N&deg; ${creditNote.numero}</h2>
    <p>Estimado/a <strong>${client.razonSocial}</strong>,</p>
    <p>Se ha emitido una nota de credito sobre la factura vinculada:</p>
    <table border="1" cellpadding="6" style="border-collapse:collapse">
      <tr><td><b>Nota de Credito</b></td><td>${creditNote.numero}</td></tr>
      <tr><td><b>Motivo</b></td><td>${creditNote.motivo}</td></tr>
      <tr><td><b>Total acreditado</b></td><td><strong>$${creditNote.total}</strong></td></tr>
      <tr><td><b>CAE</b></td><td>${creditNote.cae}</td></tr>
    </table>
    <hr style="margin-top:32px;border:none;border-top:1px solid #ddd">
    <p style="color:#b00;font-size:11px;font-style:italic">⚠️ Este correo fue generado por <strong>EasyBill Lab</strong>, un proyecto integrador de capacitaci&oacute;n en SAP CAP Node.js. No corresponde a una operaci&oacute;n comercial real. Por favor ignor&aacute; este mensaje si lo recibiste por error.</p>
    <p style="color:#888;font-size:11px">EasyBill &mdash; Sistema de Facturaci&oacute;n Electr&oacute;nica</p>
  `

  try {
    const info = await _getTransporter().sendMail({
      from:    FROM,
      to:      client.email,
      subject: `Nota de Credito N° ${creditNote.numero}  $${creditNote.total}`,
      html
    })
    console.log(`[EmailService] NC enviada a ${client.email} | msgId: ${info.messageId}`)
  } catch (err) {
    console.error(`[EmailService] Error enviando NC ${creditNote.numero}:`, err.message)
  }
}

module.exports = { sendInvoiceEmail, sendPaymentConfirmation, sendVoidNotification, sendCreditNoteEmail }
