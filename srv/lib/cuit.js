'use strict'

/**
 * Valida formato y dígito verificador de un CUIT argentino.
 * Formato esperado: XX-XXXXXXXX-X (con guiones) o XXXXXXXXXXX (sin guiones).
 * @param {string} cuit
 * @returns {{ valid: boolean, message?: string }}
 */
function validateCuit(cuit) {
  if (!cuit) return { valid: false, message: 'CUIT requerido' }

  // Normalizar: quitar guiones y espacios
  const clean = cuit.replace(/[-\s]/g, '')

  if (!/^\d{11}$/.test(clean))
    return { valid: false, message: `CUIT inválido: debe tener 11 dígitos (recibido: "${cuit}")` }

  const factors = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  const digits  = clean.split('').map(Number)

  const sum       = factors.reduce((acc, f, i) => acc + f * digits[i], 0)
  const remainder = sum % 11
  const verifier  = remainder === 0 ? 0 : 11 - remainder

  // Si el verificador da 10, el CUIT es matemáticamente inválido
  if (verifier === 10)
    return { valid: false, message: `CUIT inválido: "${cuit}"` }

  if (verifier !== digits[10])
    return { valid: false, message: `CUIT inválido: dígito verificador incorrecto en "${cuit}"` }

  return { valid: true }
}

module.exports = { validateCuit }
