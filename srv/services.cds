using { easybill } from '../db/schema';

// ─────────────────────────────────────────────
// OrderService — gestión de pedidos
// ─────────────────────────────────────────────
service OrderService @(requires: ['admin','vendedor','contador']) {

  @odata.draft.enabled
  @odata.etag: modifiedAt
  @restrict: [
    { grant: 'READ',   to: ['admin','vendedor','contador'] },
    { grant: 'CREATE', to: ['admin','vendedor'] },
    { grant: 'UPDATE', to: ['admin','vendedor'] },
    { grant: 'DELETE', to: ['admin','vendedor'] }
  ]
  entity Orders     as projection on easybill.Orders;

  @restrict: [
    { grant: 'READ',   to: ['admin','vendedor','contador'] },
    { grant: 'CREATE', to: ['admin','vendedor'] },
    { grant: 'UPDATE', to: ['admin','vendedor'] },
    { grant: 'DELETE', to: ['admin','vendedor'] }
  ]
  entity OrderItems as projection on easybill.OrderItems;

  @readonly
  entity Clients    as projection on easybill.Clients { * } where activo = true;

  @readonly
  entity Products   as projection on easybill.Products { * } where activo = true;

  @restrict: [{ grant: 'INVOKE', to: ['admin','vendedor'] }]
  action approve(orderID: UUID) returns { message: String };

  // Eventos emitidos por este servicio
  event OrderPlaced   { orderID: UUID; companyID: UUID; numero: String; }
  event OrderApproved { orderID: UUID; companyID: UUID; }
}

// ─────────────────────────────────────────────
// InvoiceService — emisión y gestión de facturas
// ─────────────────────────────────────────────
service InvoiceService @(requires: ['admin','contador']) {

  @odata.etag: modifiedAt
  @restrict: [
    { grant: 'READ',   to: ['admin','contador'] },
    { grant: 'CREATE', to: ['admin','contador'] },
    { grant: 'UPDATE', to: ['admin'] },
    { grant: 'DELETE', to: ['admin'] }
  ]
  entity Invoices      as projection on easybill.Invoices;

  @readonly
  entity InvoiceItems  as projection on easybill.InvoiceItems;

  @readonly
  entity Orders        as projection on easybill.Orders { * } where estado = 'Aprobada';

  @restrict: [{ grant: 'INVOKE', to: ['admin','contador'] }]
  action void(invoiceID: UUID, motivo: String) returns { message: String };

  @restrict: [{ grant: 'INVOKE', to: ['admin','contador'] }]
  action generatePDF(invoiceID: UUID)          returns { url: String };

  // Eventos emitidos por este servicio
  event InvoiceGenerated { invoiceID: UUID; companyID: UUID; numero: String; total: Decimal; }
  event InvoiceVoided    { invoiceID: UUID; companyID: UUID; motivo: String; }
}

// ─────────────────────────────────────────────
// PaymentService — registro de pagos
// ─────────────────────────────────────────────
service PaymentService @(requires: ['admin','contador']) {

  @restrict: [
    { grant: 'READ',   to: ['admin','contador'] },
    { grant: 'CREATE', to: ['admin','contador'] },
    { grant: 'UPDATE', to: ['admin'] },
    { grant: 'DELETE', to: ['admin'] }
  ]
  entity Payments  as projection on easybill.Payments;

  @readonly
  entity Invoices  as projection on easybill.Invoices { * } where estado in ('Emitida','Vencida');

  // Eventos emitidos por este servicio
  event PaymentReceived { paymentID: UUID; invoiceID: UUID; companyID: UUID; importe: Decimal; pagada: Boolean; }
}

// ─────────────────────────────────────────────
// CreditNoteService — notas de crédito
// ─────────────────────────────────────────────
service CreditNoteService @(requires: ['admin','contador']) {

  @odata.etag: modifiedAt
  @restrict: [
    { grant: 'READ',   to: ['admin','contador'] },
    { grant: 'CREATE', to: ['admin','contador'] },
    { grant: 'UPDATE', to: ['admin'] },
    { grant: 'DELETE', to: ['admin'] }
  ]
  entity CreditNotes      as projection on easybill.CreditNotes;

  @readonly
  entity CreditNoteItems  as projection on easybill.CreditNoteItems;

  @readonly
  entity Invoices         as projection on easybill.Invoices;

  @restrict: [{ grant: 'INVOKE', to: ['admin','contador'] }]
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
