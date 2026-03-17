'use strict'

require('dotenv').config()


const cds  = require('@sap/cds')
const cron = require('node-cron')
const express = require('express')

// ═══════════════════════════════════════════════════════════════
// SSE — Server-Sent Events (Fase 9)
// ═══════════════════════════════════════════════════════════════
const clients = []

function broadcast(data) {
  const msg = `data: ${JSON.stringify(data)}\n\n`
  clients.forEach(res => res.write(msg))
}

// Hook para agregar el endpoint SSE al servidor Express de CAP
cds.on('bootstrap', app => {
  app.get('/api/sse', (req, res) => {
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    })
    res.flushHeaders()
    res.write('retry: 10000\n\n')
    clients.push(res)
    req.on('close', () => {
      const idx = clients.indexOf(res)
      if (idx >= 0) clients.splice(idx, 1)
    })
  })
})

// ═══════════════════════════════════════════════════════════════
// Fase 6 — Job Scheduling
//
// cds.on('served') se dispara una vez que todos los servicios CAP
// están inicializados y la base de datos está lista.
// ═══════════════════════════════════════════════════════════════

cds.on('served', async () => {
  const db = await cds.connect.to('db')
  const { Invoices } = cds.entities('easybill')

  console.log('[Jobs] Schedulers inicializados ✓')

  // ── Job 1: 00:00 — Marcar facturas vencidas ───────────────────
  // Busca facturas Emitidas cuya fechaVencimiento ya pasó
  // y las actualiza a estado Vencida.
  cron.schedule('0 0 * * *', async () => {
    try {
      const hoy = new Date().toISOString().split('T')[0]

      const vencidas = await SELECT.from(Invoices)
        .where`fechaVencimiento <= ${hoy} AND estado = 'Emitida'`

      if (vencidas.length === 0) {
        console.log('[Job:Vencimientos] Sin facturas para vencer')
        return
      }

      for (const inv of vencidas) {
        await UPDATE(Invoices)
          .set({ estado: 'Vencida' })
          .where({ ID: inv.ID })
      }

      console.log(`[Job:Vencimientos] ${vencidas.length} factura(s) marcadas como Vencida`)
    } catch (err) {
      console.error('[Job:Vencimientos] Error:', err.message)
    }
  })

  // ── Job 2: 08:00 — Alertar facturas por vencer en 3 días ─────
  // Detecta facturas Emitidas que vencen en los próximos 3 días
  // y las registra. En Fase 9 se reemplaza el log por broadcast SSE.
  cron.schedule('0 8 * * *', async () => {
    try {
      const hoy = new Date()
      const en3 = new Date(hoy)
      en3.setDate(hoy.getDate() + 3)

      const desde = hoy.toISOString().split('T')[0]
      const hasta = en3.toISOString().split('T')[0]

      const porVencer = await SELECT.from(Invoices)
        .where`fechaVencimiento >= ${desde} AND fechaVencimiento <= ${hasta} AND estado = 'Emitida'`

      if (porVencer.length === 0) return

      console.log(`[Job:Alertas] ${porVencer.length} factura(s) vencen en los próximos 3 días:`)
      for (const inv of porVencer) {
        console.log(`  → ${inv.numero} | Vence: ${inv.fechaVencimiento} | Total: $${inv.total}`)
      }

      // Fase 9: broadcast SSE
      broadcast({ tipo: 'FACTURAS_POR_VENCER', facturas: porVencer })
    } catch (err) {
      console.error('[Job:Alertas] Error:', err.message)
    }
  })
})

// Reutiliza el servidor CAP por defecto — no reemplaza nada
module.exports = cds.server
