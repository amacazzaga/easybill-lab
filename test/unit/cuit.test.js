'use strict'

const { describe, test, expect } = require('@jest/globals')
const { validateCuit } = require('../../srv/lib/cuit')

// CUITs con dígito verificador correcto (calculados algorítmicamente):
//   20-12345678-6  →  sum=148, r=5,  v=6
//   27-33693450-3  →  sum=195, r=8,  v=3
//   30-50000000-3  →  sum=30,  r=8,  v=3
//   30-71234567-1  →  sum=142, r=10, v=1  (CUIT de la empresa en seed)

describe('validateCuit', () => {

  describe('CUITs válidos', () => {
    test('acepta CUIT con guiones formato XX-XXXXXXXX-X', () => {
      const result = validateCuit('20-12345678-6')
      expect(result.valid).toBe(true)
      expect(result.message).toBeUndefined()
    })

    test('acepta CUIT sin guiones (11 dígitos)', () => {
      expect(validateCuit('20123456786').valid).toBe(true)
    })

    test('acepta CUIT con espacios (los normaliza)', () => {
      expect(validateCuit('20 12345678 6').valid).toBe(true)
    })

    test('acepta CUIT tipo 20 (persona física masculino)', () => {
      expect(validateCuit('20-12345678-6').valid).toBe(true)
    })

    test('acepta CUIT tipo 27 (persona física femenino)', () => {
      expect(validateCuit('27-33693450-3').valid).toBe(true)
    })

    test('acepta CUIT tipo 30 (persona jurídica)', () => {
      expect(validateCuit('30-50000000-3').valid).toBe(true)
    })

    test('acepta el CUIT de la empresa del seed (verificador = 1, r = 10)', () => {
      // Caso especial: remainder=10 → verifier=1 (no es inválido)
      expect(validateCuit('30-71234567-1').valid).toBe(true)
    })
  })

  describe('CUITs inválidos — formato', () => {
    test('rechaza null', () => {
      expect(validateCuit(null).valid).toBe(false)
    })

    test('rechaza undefined', () => {
      expect(validateCuit(undefined).valid).toBe(false)
    })

    test('rechaza string vacío', () => {
      expect(validateCuit('').valid).toBe(false)
    })

    test('rechaza CUIT con 10 dígitos (muy corto)', () => {
      expect(validateCuit('2012345678').valid).toBe(false)
    })

    test('rechaza CUIT con 12 dígitos (muy largo)', () => {
      expect(validateCuit('201234567890').valid).toBe(false)
    })

    test('rechaza CUIT con letras', () => {
      expect(validateCuit('AB-CDEFGHIJ-K').valid).toBe(false)
    })

    test('rechaza CUIT con caracteres especiales distintos a guiones', () => {
      expect(validateCuit('20.12345678.6').valid).toBe(false)
    })
  })

  describe('CUITs inválidos — dígito verificador incorrecto', () => {
    test('rechaza CUIT con dígito verificador +1 del correcto', () => {
      // correcto: 20-12345678-6, incorrecto: -7
      expect(validateCuit('20-12345678-7').valid).toBe(false)
    })

    test('rechaza CUIT con dígito verificador -1 del correcto', () => {
      // correcto: 20-12345678-6, incorrecto: -5
      expect(validateCuit('20-12345678-5').valid).toBe(false)
    })

    test('rechaza CUIT con dígito verificador 0 cuando debería ser 6', () => {
      expect(validateCuit('20-12345678-0').valid).toBe(false)
    })
  })

  describe('Mensajes de error', () => {
    test('mensaje de error menciona el CUIT recibido', () => {
      const result = validateCuit('20-12345678-9')
      expect(result.message).toContain('20-12345678-9')
    })

    test('mensaje de error indica "11 dígitos" cuando el formato es incorrecto', () => {
      const result = validateCuit('123456')
      expect(result.message).toContain('11')
    })

    test('el resultado válido retorna exactamente { valid: true }', () => {
      expect(validateCuit('20-12345678-6')).toEqual({ valid: true })
    })

    test('el resultado inválido retorna { valid: false, message: string }', () => {
      const result = validateCuit('20-12345678-9')
      expect(result).toMatchObject({ valid: false, message: expect.any(String) })
    })
  })
})
