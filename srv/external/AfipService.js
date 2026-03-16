'use strict'

/**
 * AfipService — simulación del web service de AFIP para obtención de CAE.
 * En producción este módulo se reemplazaría por la integración real con
 * los WS de AFIP (WSAA + WSFE).
 */

const AFIP_CAE_VALIDITY_DAYS = 10

/**
 * Genera un CAE simulado para un comprobante.
 * @param {object} params
 * @param {string} params.tipoComprobante  'A' | 'B' | 'C'
 * @param {string} params.puntoVenta       e.g. '0001'
 * @param {string} params.numero           e.g. '00000001'
 * @param {number} params.total            importe total del comprobante
 * @param {string} params.clientCuit       CUIT del receptor
 * @returns {Promise<{cae: string, caeFechaVto: string}>}
 */
async function generateCAE({ tipoComprobante, puntoVenta, numero, total, clientCuit }) {
  // Simula latencia de red
  await _delay(50)

  const cae        = _generateCaeNumber()
  const caeFechaVto = _addDays(new Date(), AFIP_CAE_VALIDITY_DAYS)

  console.log(`[AfipService] CAE generado: ${cae} | Vto: ${caeFechaVto} | Comprobante: ${tipoComprobante} ${puntoVenta}-${numero}`)

  return { cae, caeFechaVto }
}

/**
 * Valida si un CAE es válido (simulado — siempre retorna true).
 * @param {string} cae
 * @returns {Promise<boolean>}
 */
async function validateCAE(cae) {
  await _delay(30)
  return typeof cae === 'string' && cae.length === 14
}

// ── Helpers privados ────────────────────────────────────────────

function _generateCaeNumber() {
  // CAE real de AFIP tiene 14 dígitos
  const ts   = Date.now().toString().slice(-8)
  const rand = Math.floor(Math.random() * 999999).toString().padStart(6, '0')
  return `${ts}${rand}`
}

function _addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function _delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = { generateCAE, validateCAE }
