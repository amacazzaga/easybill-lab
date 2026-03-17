'use strict'

const cds = require('@sap/cds')
const { describe, test, expect, beforeAll } = require('@jest/globals')
const { randomUUID } = require('crypto')

// ─────────────────────────────────────────────────────────────
// cds.test(path) arranca la app CAP en modo test con SQLite
// in-memory y carga los datos de seed de los CSVs.
// Nota: cds.test.in() sólo configura el root; cds.test(path)
// llama .run() internamente y registra el beforeAll de bootstrap.
// ─────────────────────────────────────────────────────────────
const { POST } = cds.test(__dirname + '/../..')

// UUIDs fijos del seed (easybill.Companies.csv / Clients.csv)
const COMPANY_ID = '11111111-1111-1111-1111-111111111111'
const CLIENT_ID  = '22222222-2222-2222-2222-222222222201' // Grupo Vientos del Sur RI

const AUTH = { auth: { username: 'admin', password: 'admin' } }

// ─────────────────────────────────────────────────────────────
// Se inserta una Factura directamente en la DB (sin pasar por
// InvoiceService) para testear PaymentService de forma aislada,
// asumiendo que la factura ya fue emitida correctamente.
// ─────────────────────────────────────────────────────────────
describe('PaymentService — lógica de pagos', () => {
  let invoiceId

  beforeAll(async () => {
    invoiceId       = randomUUID()
    const orderId   = randomUUID()
    const db        = await cds.connect.to('db')

    // Insertar una Order dummy primero (order_ID es NOT NULL en Invoices)
    await db.run(
      INSERT.into('easybill.Orders').entries({
        ID:         orderId,
        company_ID: COMPANY_ID,
        client_ID:  CLIENT_ID,
        fecha:      '2026-03-17',
        estado:     'Facturada'
      })
    )

    await db.run(
      INSERT.into('easybill.Invoices').entries({
        ID:               invoiceId,
        company_ID:       COMPANY_ID,
        client_ID:        CLIENT_ID,
        order_ID:         orderId,
        tipoComprobante:  'A',
        puntoVenta:       '0001',
        numeroComprobante:'99999901',
        numero:           '0001-99999901',
        fecha:            '2026-03-17',
        fechaVencimiento: '2026-04-16',
        estado:           'Emitida',
        subtotal:         10000,
        totalIVA:         2100,
        total:            12100,
        cae:              '12345678901234',
        caeFechaVto:      '2026-03-27'
      })
    )
  })

  // ── Validaciones de entrada ──────────────────────────────────

  test('rechaza importe = 0', async () => {
    const res = await POST('/odata/v4/payment/Payments', {
      invoice_ID:  invoiceId,
      fecha:       '2026-03-17',
      importe:     0,
      metodoPago:  'Transferencia'
    }, AUTH).catch(e => e.response)

    expect(res.status).toBe(400)
  })

  test('rechaza importe negativo', async () => {
    const res = await POST('/odata/v4/payment/Payments', {
      invoice_ID:  invoiceId,
      fecha:       '2026-03-17',
      importe:     -500,
      metodoPago:  'Transferencia'
    }, AUTH).catch(e => e.response)

    expect(res.status).toBe(400)
  })

  test('rechaza pago sobre factura inexistente', async () => {
    const res = await POST('/odata/v4/payment/Payments', {
      invoice_ID:  randomUUID(),
      fecha:       '2026-03-17',
      importe:     1000,
      metodoPago:  'Transferencia'
    }, AUTH).catch(e => e.response)

    expect(res.status).toBe(404)
  })

  // ── Lógica de pagos parciales / totales ──────────────────────
  // Nota: los tests 4-6 son secuenciales y comparten estado
  // (acumulan pagos sobre la misma factura de $12.100).

  test('pago parcial ($5.000) NO cambia estado — sigue Emitida', async () => {
    await POST('/odata/v4/payment/Payments', {
      invoice_ID:  invoiceId,
      fecha:       '2026-03-17',
      importe:     5000,
      metodoPago:  'Transferencia'
    }, AUTH)

    const db = await cds.connect.to('db')
    const inv = await db.run(SELECT.one.from('easybill.Invoices').where({ ID: invoiceId }))
    expect(inv.estado).toBe('Emitida')
  })

  test('segundo pago parcial ($7.100) completa el total → estado Pagada', async () => {
    // $5.000 ya pagados + $7.100 = $12.100 = total de la factura
    await POST('/odata/v4/payment/Payments', {
      invoice_ID:  invoiceId,
      fecha:       '2026-03-17',
      importe:     7100,
      metodoPago:  'Transferencia'
    }, AUTH)

    const db = await cds.connect.to('db')
    const inv = await db.run(SELECT.one.from('easybill.Invoices').where({ ID: invoiceId }))
    expect(inv.estado).toBe('Pagada')
  })

  test('rechaza nuevo pago sobre factura ya Pagada → 409', async () => {
    const res = await POST('/odata/v4/payment/Payments', {
      invoice_ID:  invoiceId,
      fecha:       '2026-03-17',
      importe:     100,
      metodoPago:  'Transferencia'
    }, AUTH).catch(e => e.response)

    expect(res.status).toBe(409)
  })
})

// ─────────────────────────────────────────────────────────────
// Factura Anulada — el pago debe rechazarse siempre
// ─────────────────────────────────────────────────────────────
describe('PaymentService — factura anulada', () => {
  let invoiceAnuladaId

  beforeAll(async () => {
    invoiceAnuladaId   = randomUUID()
    const orderAnulId  = randomUUID()
    const db           = await cds.connect.to('db')

    await db.run(
      INSERT.into('easybill.Orders').entries({
        ID:         orderAnulId,
        company_ID: COMPANY_ID,
        client_ID:  CLIENT_ID,
        fecha:      '2026-03-17',
        estado:     'Facturada'
      })
    )

    await db.run(
      INSERT.into('easybill.Invoices').entries({
        ID:               invoiceAnuladaId,
        company_ID:       COMPANY_ID,
        client_ID:        CLIENT_ID,
        order_ID:         orderAnulId,
        tipoComprobante:  'B',
        puntoVenta:       '0001',
        numeroComprobante:'99999902',
        numero:           '0001-99999902',
        fecha:            '2026-03-17',
        fechaVencimiento: '2026-04-16',
        estado:           'Anulada',
        subtotal:         5000,
        totalIVA:         0,
        total:            5000,
        cae:              '98765432109876',
        caeFechaVto:      '2026-03-27'
      })
    )
  })

  test('rechaza pago sobre factura Anulada → 409', async () => {
    const res = await POST('/odata/v4/payment/Payments', {
      invoice_ID:  invoiceAnuladaId,
      fecha:       '2026-03-17',
      importe:     1000,
      metodoPago:  'Efectivo'
    }, AUTH).catch(e => e.response)

    expect(res.status).toBe(409)
  })
})
