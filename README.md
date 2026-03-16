# EasyBill Lab

Aplicación de facturación electrónica argentina, construida como proyecto de capacitación avanzada en **SAP CAP Node.js v9**. Implementa el flujo completo de facturación AFIP (Factura A/B/C, Notas de Crédito, pagos), combinando patrones enterprise de SAP BTP con un frontend React moderno.

> **Objetivo:** demostrar dominio de CAP Node.js v9  Draft Handling, Concurrency Control, Event Mesh, Job Scheduling, Unit Testing y UI5 Web Components  en un caso de uso real del mercado argentino.

---

## Stack tecnológico

### Backend
| Tecnología | Versión | Rol |
|---|---|---|
| SAP CAP (`@sap/cds`) | `^9` | Framework principal  OData v4, CDS, servicios |
| `@sap/cds-dk` | `^9.8` | CLI: `cds watch`, `cds deploy`, `cds compile` |
| `@cap-js/sqlite` | `^2.2` | Base de datos SQLite in-memory (dev) |
| `node-cron` | `^4.2` | Jobs programados (vencimientos, alertas SSE) |
| `pdfkit` | `^0.17` | Generación de PDFs de facturas |
| `express` | `^4` | HTTP server base |

### Frontend (`app/invoicing-ui/`)
| Tecnología | Versión | Rol |
|---|---|---|
| React | `^18.3` | UI library |
| Vite | `^6.4` | Build tool y dev server |
| `@ui5/webcomponents-react` | `^2` | Componentes SAP Fiori |
| `@tanstack/react-query` | `^5` | Data fetching y cache |
| `react-router-dom` | `^6` | Navegación SPA |
| `recharts` | `^3.8` | Gráficos del dashboard |

### Testing
| Tecnología | Versión | Rol |
|---|---|---|
| `jest` | `^30` | Test runner |
| `@jest/globals` | `^30` | API de Jest sin imports globales |

---

## Estructura del proyecto

```
easybill-lab/
 db/
    schema.cds              # Modelo de datos completo (10 entidades)
    data/
        easybill.Companies.csv
        easybill.Clients.csv
        easybill.Products.csv
 srv/
    services.cds            # Definición de los 5 servicios OData
    service.cds             # AdminService (debug)
    order-service.js        # Pedidos + Draft Handling + ETag
    invoice-service.js      # Facturación electrónica + AFIP + PDF
    payment-service.js      # Pagos parciales/totales
    credit-note-service.js  # Notas de crédito
    audit-service.js        # Event Mesh + auditoría
    external/
        AfipService.js      # CAE simulado (AFIP mock)
        EmailService.js     # Envío de emails (mock)
        PdfService.js       # Generación de PDFs con pdfkit
 app/
    invoicing-ui/           # Frontend React (Fase 10)
 .cdsrc.json                 # Config: SQLite in-memory + auth mocked
 package.json
```

---

## Modelo de datos (`db/schema.cds`)

Namespace: `easybill`

### Entidades principales

| Entidad | Descripción |
|---|---|
| `Companies` | Empresa emisora (CUIT, razón social, condición IVA) |
| `Clients` | Clientes con condición IVA (`RI`, `MT`, `EX`, `CF`) |
| `Products` | Productos/servicios con alícuota IVA |
| `Orders` + `OrderItems` | Pedidos con Draft Handling habilitado |
| `Invoices` + `InvoiceItems` | Facturas A/B/C con CAE y punto de venta |
| `Payments` | Pagos contra facturas (soporta pagos parciales) |
| `CreditNotes` + `CreditNoteItems` | Notas de crédito electrónicas |
| `AuditLog` | Registro de eventos del sistema (`@readonly`) |

### Tipos definidos

```cds
type CUIT          : String(13);
type IVARate       : Decimal(5, 2);
type IVACondicion  : String(2)  enum { RI; MT; EX; CF };
type InvoiceType   : String(1)  enum { A; B; C };
type OrderStatus   : String(10) enum { Borrador; Aprobada; Facturada; Anulada };
type InvoiceStatus : String(10) enum { Emitida; Pagada; Vencida; Anulada };
```

---

## Servicios OData

Todos los servicios están disponibles bajo `/odata/v4/`.

| Servicio | Path | Roles permitidos |
|---|---|---|
| `OrderService` | `/odata/v4/order` | `admin`, `vendedor`, `contador` |
| `InvoiceService` | `/odata/v4/invoice` | `admin`, `contador` |
| `PaymentService` | `/odata/v4/payment` | `admin`, `contador` |
| `CreditNoteService` | `/odata/v4/creditnote` | `admin`, `contador` |
| `AuditService` | `/odata/v4/audit` | `admin`, `contador` |
| `AdminService` | `/odata/v4/admin` | `admin` |

### Acciones disponibles

```
POST /odata/v4/order/approve                  { "orderID": "..." }
POST /odata/v4/invoice/void                   { "invoiceID": "...", "motivo": "..." }
POST /odata/v4/invoice/generatePDF            { "invoiceID": "..." }
POST /odata/v4/creditnote/voidCreditNote      { "creditNoteID": "...", "motivo": "..." }
```

---

## Características implementadas

### Fase 1  Modelo de datos
- 10 entidades con relaciones, composiciones y tipos enumerados
- Compatible con AFIP: `puntoVenta`, `numeroComprobante`, `cae`, `caeFechaVto`
- `cds compile` limpio: 0 errores, 0 warnings

### Fase 2  Lógica de negocio
- **OrderService:** validación de cliente/productos, cálculo de IVA por ítem, autonumeración `PED-XXXXXX`
- **InvoiceService:** determinación automática de tipo (A/B/C) según condición IVA del cliente, llamada a AFIP, copia de ítems desde Order
- **PaymentService:** pagos parciales acumulados  marca como Pagada cuando `totalPagado >= total`
- **CreditNoteService:** validación, numeración, copia de ítems de factura original
- **AuditService:** registro de todos los eventos del sistema

### Fase 3  Draft Handling
- `@odata.draft.enabled` en `Orders`
- Recálculo de totales en tiempo real durante edición del draft (sin bloquear datos incompletos)
- Validación completa solo al activar el draft (CREATE activo)

### Fase 4  Concurrency Control
- `@odata.etag: modifiedAt` en `Orders`, `Invoices` y `CreditNotes`
- Handler `on('error')` devuelve mensajes `412` en español

### Fase 5  Event Mesh simulado
- Eventos formalmente declarados en CDS: `OrderPlaced`, `OrderApproved`, `InvoiceGenerated`, `InvoiceVoided`, `PaymentReceived`, `CreditNoteIssued`, `CreditNoteVoided`
- `this.emit()` en cada servicio productor
- `AuditService` usa `cds.connect.to()` para suscribirse a todos los eventos y persistirlos en `AuditLog`

### Servicios externos simulados
- **AfipService:** genera CAE de 14 dígitos con fecha de vencimiento (+10 días)
- **EmailService:** simula envío de email de factura/nota de crédito via `console.log`
- **PdfService:** genera un PDF A4 real con `pdfkit` en `tmp/pdfs/`

---

## Instalación y ejecución

### Requisitos
- Node.js >= 18
- `@sap/cds-dk` instalado globalmente: `npm install -g @sap/cds-dk`

### Backend

```bash
# Instalar dependencias
npm install

# Arrancar en modo desarrollo (hot reload + SQLite in-memory)
cds watch
```

El servidor arranca en `http://localhost:4004`.

### Frontend

```bash
cd app/invoicing-ui
npm install
npm run dev
```

El frontend arranca en `http://localhost:5173` con proxy configurado hacia `:4004`.

---

## Usuarios de prueba (auth mocked)

| Usuario | Contraseña | Roles |
|---|---|---|
| `admin` | `admin` | `admin`, `contador`, `vendedor` |
| `contador` | `contador` | `contador` |
| `vendedor` | `vendedor` | `vendedor` |

Las credenciales se pasan como Basic Auth: `Authorization: Basic base64(usuario:contraseña)`.

---

## Testing

```bash
# Ejecutar tests
npm test

# Con reporte de cobertura
npm run test:coverage
```

Tests ubicados en `test/**/*.test.js`. Cobertura configurada sobre `srv/**/*.js`.

---

## Datos de seed

La base in-memory se inicializa automáticamente con:

- **1 empresa:** Tech Solutions S.R.L. (CUIT `30-71234567-8`, condición RI)
- **5 clientes:** con distintas condiciones IVA (RI, MT, EX, CF)
- **8 productos:** con alícuotas 0%, 10.5%, 21% y 27%

---

## Roadmap

| Fase | Estado | Descripción |
|---|---|---|
| 1  Schema |  | Modelo de datos completo |
| 2  Servicios |  | Lógica de negocio en los 5 servicios |
| 3  Draft Handling |  | `@odata.draft.enabled` en Orders |
| 4  Concurrencia |  | `@odata.etag` + handlers 412 |
| 5  Event Mesh |  | Eventos CDS + `cds.connect.to()` |
| 6  Job Scheduling |  | `node-cron`: vencimientos + alertas SSE |
| 7  Autorización |  | `@restrict` por operación y rol |
| 8  Unit Testing |  | Jest: servicios y helpers |
| 9  SSE |  | Server-Sent Events para notificaciones |
| 10  Frontend |  | React + UI5: 6 vistas completas |

---

## Contexto del proyecto

Este proyecto es el trabajo final de capacitación en **SAP CAP Node.js**, implementando un caso de uso real del mercado argentino: facturación electrónica AFIP. El objetivo es demostrar el dominio de los patrones enterprise de SAP BTP en un escenario complejo y concreto.
