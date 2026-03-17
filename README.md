# EasyBill Lab

Aplicación de facturación electrónica argentina construida en **SAP CAP Node.js v9**. Simula el flujo completo de AFIP: facturas, notas de crédito, pagos y auditoría, con frontend React (pendiente).

## Objetivo
Demostrar dominio de CAP Node.js, patrones enterprise y lógica fiscal argentina en un caso real.


## Alcances

EasyBill Lab es una solución completa de facturación electrónica pensada para empresas argentinas, con foco en la realidad fiscal local y en la experiencia de usuario para distintos roles (vendedor, contador, administrador).

Como **vendedor** podés:
- Crear pedidos de clientes, agregar productos y editar borradores antes de enviarlos para aprobación.
- Consultar el catálogo de productos y clientes activos.
- Aprobar pedidos y convertirlos en facturas electrónicas.
- Ver el estado de tus pedidos y facturas en tiempo real.

Como **contador** podés:
- Emitir facturas electrónicas tipo A, B o C según la condición fiscal del cliente.
- Validar CUITs automáticamente (emisor y receptor) antes de emitir comprobantes.
- Registrar pagos parciales o totales sobre facturas, con actualización automática del estado (Emitida, Pagada, Vencida).
- Emitir notas de crédito totales o parciales, copiando ítems de la factura original y validando cantidades.
- Consultar el historial de pagos, facturas y notas de crédito.

Como **administrador** podés:
- Gestionar la base de clientes y productos.
- Acceder a la auditoría completa de eventos fiscales: cada acción relevante queda registrada (emisión, pago, anulación, nota de crédito).
- Configurar jobs automáticos: vencimiento de facturas, alertas por facturas próximas a vencer.
- Visualizar y descargar PDFs profesionales de cada comprobante, con todos los datos fiscales requeridos por AFIP.
- Recibir emails transaccionales ante cada evento importante (emisión, pago, anulación, nota de crédito).

Además:
- El sistema simula la integración con AFIP generando CAE y fechas de vencimiento reales.
- Todos los documentos fiscales cumplen con las reglas de validación y numeración exigidas por la normativa argentina.
- El frontend React (en desarrollo) permitirá visualizar dashboards, filtrar documentos, ver gráficos de ventas y acceder a todas las funciones desde una interfaz moderna.

EasyBill Lab es ideal para aprender, probar y entender cómo funciona un sistema de facturación electrónica real, con lógica de negocio robusta, validaciones fiscales, auditoría y automatización.

## Stack
- **Backend:** CAP, SQLite, Node.js, cron jobs, PDF, email (Mailtrap)
- **Frontend:** React, Vite, React Query, Router, Recharts
- **Testing:** Jest (unitarios e integración)

## Estructura
```
easybill-lab/
 db/         # Modelo y datos seed
 srv/        # Servicios OData, lógica de negocio, helpers
 app/        # Frontend React (pendiente)
 test/       # Unitarios e integración
```

## Testing
- Ejecutar: `npm test`
- Cobertura: `npm run test:coverage`
- Tests cubren validaciones fiscales, lógica de pagos, helpers y escenarios críticos.

### Servicios externos
- **AfipService:** genera CAE de 14 dígitos con fecha de vencimiento (+10 días)
- **EmailService:** envío real via nodemailer apuntando a Mailtrap SMTP — 4 funciones (factura, pago, anulación, NC)
- **PdfService:** PDF A4 profesional con `pdfkit`, diferenciado por tipo A/B/C en `tmp/pdfs/`

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

## Contexto del proyecto

Este proyecto es el trabajo final de capacitación en **SAP CAP Node.js**, implementando un caso de uso real del mercado argentino: facturación electrónica AFIP. El objetivo es demostrar el dominio de los patrones enterprise de SAP BTP en un escenario complejo y concreto.
