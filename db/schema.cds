namespace easybill;

using { cuid, managed } from '@sap/cds/common';

// ─────────────────────────────────────────────
// Tipos y enumeraciones
// ─────────────────────────────────────────────

type CUIT       : String(13); // formato: 20-12345678-9
type IVARate    : Decimal(5,2); // alícuota IVA: 0, 10.5, 21, 27

type IVACondicion : String(2) enum {
  ResponsableInscripto = 'RI';
  Monotributista       = 'MT';
  Exento               = 'EX';
  ConsumidorFinal      = 'CF';
}

type InvoiceType : String(1) enum {
  FacturaA = 'A';
  FacturaB = 'B';
  FacturaC = 'C';
}

type OrderStatus : String(20) enum {
  Borrador  = 'Borrador';
  Aprobada  = 'Aprobada';
  Facturada = 'Facturada';
  Anulada   = 'Anulada';
}

type InvoiceStatus : String(20) enum {
  Emitida  = 'Emitida';
  Pagada   = 'Pagada';
  Vencida  = 'Vencida';
  Anulada  = 'Anulada';
}

type CreditNoteStatus : String(20) enum {
  Emitida = 'Emitida';
  Anulada = 'Anulada';
}

type PaymentMethod : String(20) enum {
  Transferencia = 'Transferencia';
  Cheque        = 'Cheque';
  Efectivo      = 'Efectivo';
  TarjetaDebito = 'TarjetaDebito';
}

// ─────────────────────────────────────────────
// Companies — empresa emisora
// ─────────────────────────────────────────────
entity Companies : cuid, managed {
  razonSocial     : String(200) not null;
  cuit            : CUIT        not null;
  condicionIVA    : IVACondicion not null default 'RI';
  domicilio       : String(300);
  email           : String(200);
  telefono        : String(50);
  activa          : Boolean     not null default true;

  // Asociaciones inversas
  clients         : Association to many Clients         on clients.company     = $self;
  products        : Association to many Products        on products.company    = $self;
  orders          : Association to many Orders          on orders.company      = $self;
  invoices        : Association to many Invoices        on invoices.company    = $self;
}

// ─────────────────────────────────────────────
// Clients — clientes con CUIT y condición IVA
// ─────────────────────────────────────────────
entity Clients : cuid, managed {
  company         : Association to Companies not null;
  razonSocial     : String(200) not null;
  cuit            : CUIT        not null;
  condicionIVA    : IVACondicion not null default 'CF';
  domicilio       : String(300);
  email           : String(200);
  telefono        : String(50);
  activo          : Boolean     not null default true;

  orders          : Association to many Orders   on orders.client   = $self;
  invoices        : Association to many Invoices on invoices.client = $self;
}

// ─────────────────────────────────────────────
// Products — catálogo con precio y alícuota IVA
// ─────────────────────────────────────────────
entity Products : cuid, managed {
  company         : Association to Companies not null;
  codigo          : String(50)  not null;
  descripcion     : String(300) not null;
  precioUnitario  : Decimal(15,2) not null;
  alicuotaIVA     : IVARate     not null default 21;
  unidadMedida    : String(20)  default 'Unidad';
  activo          : Boolean     not null default true;
}

// ─────────────────────────────────────────────
// Orders — cabecera de pedido
// ─────────────────────────────────────────────
entity Orders : cuid, managed {
  company         : Association to Companies not null;
  client          : Association to Clients   not null;
  numero          : String(20);
  fecha           : Date        not null;
  estado          : OrderStatus not null default 'Borrador';
  observaciones   : String(500);
  subtotal        : Decimal(15,2) default 0;
  totalIVA        : Decimal(15,2) default 0;
  total           : Decimal(15,2) default 0;

  items           : Composition of many OrderItems on items.order = $self;
  invoice         : Association to Invoices;
}

// ─────────────────────────────────────────────
// OrderItems — líneas del pedido
// ─────────────────────────────────────────────
entity OrderItems : cuid {
  order           : Association to Orders   not null;
  product         : Association to Products not null;
  descripcion     : String(300) not null;
  cantidad        : Decimal(13,3) not null;
  precioUnitario  : Decimal(15,2) not null;
  alicuotaIVA     : IVARate     not null;
  subtotal        : Decimal(15,2) not null default 0; // cantidad * precioUnitario
  importeIVA      : Decimal(15,2) not null default 0; // subtotal * alicuotaIVA / 100
  total           : Decimal(15,2) not null default 0; // subtotal + importeIVA
}

// ─────────────────────────────────────────────
// Invoices — factura generada desde una Order
// ─────────────────────────────────────────────
entity Invoices : cuid, managed {
  company          : Association to Companies not null;
  client           : Association to Clients   not null;
  order            : Association to Orders    not null;
  tipoComprobante  : InvoiceType  not null;
  puntoVenta       : String(4)    not null default '0001'; // XXXX
  numeroComprobante: String(8);                            // XXXXXXXX (auto-generado)
  numero           : String(20);                           // XXXX-XXXXXXXX (calculado)
  fecha            : Date         not null;
  fechaVencimiento : Date;
  estado           : InvoiceStatus not null default 'Emitida';
  cae              : String(20);  // CAE simulado
  caeFechaVto      : Date;        // vencimiento del CAE
  subtotal         : Decimal(15,2) not null default 0;
  totalIVA         : Decimal(15,2) not null default 0;
  total            : Decimal(15,2) not null default 0;
  observaciones    : String(500);

  items            : Composition of many InvoiceItems on items.invoice    = $self;
  payments         : Association to many Payments     on payments.invoice = $self;
  creditNotes      : Association to many CreditNotes  on creditNotes.invoice = $self;
}

// ─────────────────────────────────────────────
// InvoiceItems — líneas copiadas desde OrderItems
// ─────────────────────────────────────────────
entity InvoiceItems : cuid {
  invoice         : Association to Invoices  not null;
  product         : Association to Products  not null;
  descripcion     : String(300) not null;
  cantidad        : Decimal(13,3) not null;
  precioUnitario  : Decimal(15,2) not null;
  alicuotaIVA     : IVARate     not null;
  subtotal        : Decimal(15,2) not null default 0;
  importeIVA      : Decimal(15,2) not null default 0;
  total           : Decimal(15,2) not null default 0;
}

// ─────────────────────────────────────────────
// Payments — pagos asociados a una factura
// ─────────────────────────────────────────────
entity Payments : cuid, managed {
  invoice         : Association to Invoices not null;
  fecha           : Date          not null;
  importe         : Decimal(15,2) not null;
  metodoPago      : PaymentMethod not null default 'Transferencia';
  referencia      : String(100);  // número de transferencia, cheque, etc.
  observaciones   : String(300);
}

// ─────────────────────────────────────────────
// CreditNotes — notas de crédito (reversa de factura)
// ─────────────────────────────────────────────
entity CreditNotes : cuid, managed {
  company          : Association to Companies not null;
  client           : Association to Clients   not null;
  invoice          : Association to Invoices  not null;  // factura que revierte
  tipoComprobante  : InvoiceType  not null;              // mismo tipo que la factura
  puntoVenta       : String(4)    not null default '0001';
  numeroComprobante: String(8);
  numero           : String(20);                         // XXXX-XXXXXXXX
  fecha            : Date         not null;
  estado           : CreditNoteStatus not null default 'Emitida';
  cae              : String(20);
  caeFechaVto      : Date;
  motivo           : String(300)  not null;
  subtotal         : Decimal(15,2) not null default 0;
  totalIVA         : Decimal(15,2) not null default 0;
  total            : Decimal(15,2) not null default 0;

  items            : Composition of many CreditNoteItems on items.creditNote = $self;
}

// ─────────────────────────────────────────────
// CreditNoteItems — líneas de la nota de crédito
// ─────────────────────────────────────────────
entity CreditNoteItems : cuid {
  creditNote      : Association to CreditNotes not null;
  product         : Association to Products    not null;
  descripcion     : String(300) not null;
  cantidad        : Decimal(13,3) not null;
  precioUnitario  : Decimal(15,2) not null;
  alicuotaIVA     : IVARate     not null;
  subtotal        : Decimal(15,2) not null default 0;
  importeIVA      : Decimal(15,2) not null default 0;
  total           : Decimal(15,2) not null default 0;
}

// ─────────────────────────────────────────────
// AuditLog — log inmutable de eventos fiscales
// ─────────────────────────────────────────────
@readonly
entity AuditLog : cuid {
  timestamp       : Timestamp    not null;
  evento          : String(100)  not null; // InvoiceGenerated, InvoiceVoided, etc.
  entidad         : String(50)   not null; // Invoices, Orders, etc.
  entidadId       : String(36)   not null; // UUID del registro afectado
  usuario         : String(200);           // login del usuario que disparó el evento
  companyId       : String(36);            // para filtrado por empresa
  detalle         : LargeString;           // payload JSON del evento
}
