using { easybill } from '../db/schema';

// ─────────────────────────────────────────────
// OrderService — gestión de pedidos
// ─────────────────────────────────────────────
service OrderService @(requires: ['admin','vendedor','contador']) {

  @odata.draft.enabled
  @odata.etag: modifiedAt
  entity Orders     as projection on easybill.Orders;
  entity OrderItems as projection on easybill.OrderItems;
  entity Clients    as projection on easybill.Clients { * } where activo = true;
  entity Products   as projection on easybill.Products { * } where activo = true;

  action approve(orderID: UUID) returns { message: String };

  // Eventos emitidos por este servicio
  event OrderPlaced  { orderID: UUID; companyID: UUID; numero: String; }
  event OrderApproved { orderID: UUID; companyID: UUID; }
}

// ─────────────────────────────────────────────
// InvoiceService — emisión y gestión de facturas
// ─────────────────────────────────────────────
service InvoiceService @(requires: ['admin','contador']) {

  @odata.etag: modifiedAt
  entity Invoices      as projection on easybill.Invoices;
  entity InvoiceItems  as projection on easybill.InvoiceItems;
  entity Orders        as projection on easybill.Orders { * } where estado = 'Aprobada';

  action void(invoiceID: UUID, motivo: String) returns { message: String };
  action generatePDF(invoiceID: UUID)          returns { url: String };

  // Eventos emitidos por este servicio
  event InvoiceGenerated { invoiceID: UUID; companyID: UUID; numero: String; total: Decimal; }
  event InvoiceVoided    { invoiceID: UUID; companyID: UUID; motivo: String; }
}

// ─────────────────────────────────────────────
// PaymentService — registro de pagos
// ─────────────────────────────────────────────
service PaymentService @(requires: ['admin','contador']) {

  entity Payments  as projection on easybill.Payments;
  entity Invoices  as projection on easybill.Invoices { * } where estado in ('Emitida','Vencida');

  // Eventos emitidos por este servicio
  event PaymentReceived { paymentID: UUID; invoiceID: UUID; companyID: UUID; importe: Decimal; pagada: Boolean; }
}

// ─────────────────────────────────────────────
// CreditNoteService — notas de crédito
// ─────────────────────────────────────────────
service CreditNoteService @(requires: ['admin','contador']) {

  @odata.etag: modifiedAt
  entity CreditNotes      as projection on easybill.CreditNotes;
  entity CreditNoteItems  as projection on easybill.CreditNoteItems;
  entity Invoices         as projection on easybill.Invoices;

  action voidCreditNote(creditNoteID: UUID, motivo: String) returns { message: String };

  // Eventos emitidos por este servicio
  event CreditNoteIssued { creditNoteID: UUID; invoiceID: UUID; companyID: UUID; numero: String; }
  event CreditNoteVoided { creditNoteID: UUID; companyID: UUID; motivo: String; }
}

// ─────────────────────────────────────────────
// AuditService — log inmutable de eventos fiscales
// ─────────────────────────────────────────────
service AuditService @(requires: ['admin','contador']) {

  @readonly
  entity AuditLog as projection on easybill.AuditLog;
}
