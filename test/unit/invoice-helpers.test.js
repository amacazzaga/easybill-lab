'use strict'

const { describe, test, expect } = require('@jest/globals')

// Los helpers se exportan en module.exports._helpers desde invoice-service.js
// sin necesidad de levantar CAP ni conectarse a la base de datos.
const { _determineTipoComprobante, _addDays } = require('../../srv/invoice-service')._helpers

// ─────────────────────────────────────────────────────────────
// _determineTipoComprobante
// Regla AFIP: emisor RI + receptor RI → A
//             emisor RI + receptor CF/EX → B
//             emisor MT (cualquier receptor) → C
//
// La función recibe la condiciónIVA del CLIENTE (receptor).
// La condición MT del receptor también devuelve C (caso especial
// donde el emisor MT factura a un receptor MT).
// ─────────────────────────────────────────────────────────────
describe('_determineTipoComprobante', () => {
  test('cliente RI → Factura A', () => {
    expect(_determineTipoComprobante('RI')).toBe('A')
  })

  test('cliente CF → Factura B', () => {
    expect(_determineTipoComprobante('CF')).toBe('B')
  })

  test('cliente EX (exento) → Factura B', () => {
    expect(_determineTipoComprobante('EX')).toBe('B')
  })

  test('cliente MT (monotributista) → Factura C', () => {
    expect(_determineTipoComprobante('MT')).toBe('C')
  })

  test('condición desconocida → Factura B (fallback seguro)', () => {
    expect(_determineTipoComprobante('XX')).toBe('B')
  })

  test('undefined → Factura B (fallback seguro)', () => {
    expect(_determineTipoComprobante(undefined)).toBe('B')
  })

  test('null → Factura B (fallback seguro)', () => {
    expect(_determineTipoComprobante(null)).toBe('B')
  })
})

// ─────────────────────────────────────────────────────────────
// _addDays
// Suma días a una fecha en formato YYYY-MM-DD y devuelve
// el resultado en el mismo formato.
// ─────────────────────────────────────────────────────────────
describe('_addDays', () => {
  test('suma 30 días correctamente (vencimiento estándar)', () => {
    expect(_addDays('2026-01-01', 30)).toBe('2026-01-31')
  })

  test('cruza correctamente el fin de mes', () => {
    expect(_addDays('2026-01-31', 1)).toBe('2026-02-01')
  })

  test('cruza correctamente el fin de año', () => {
    expect(_addDays('2026-12-31', 1)).toBe('2027-01-01')
  })

  test('suma 0 días devuelve la misma fecha', () => {
    expect(_addDays('2026-03-17', 0)).toBe('2026-03-17')
  })

  test('suma 10 días (vencimiento CAE)', () => {
    expect(_addDays('2026-03-17', 10)).toBe('2026-03-27')
  })

  test('suma 365 días en año no bisiesto', () => {
    expect(_addDays('2026-01-01', 365)).toBe('2027-01-01')
  })

  test('devuelve siempre formato YYYY-MM-DD', () => {
    const result = _addDays('2026-06-05', 5)
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
