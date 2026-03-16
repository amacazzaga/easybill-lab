const cds = require('@sap/cds')

module.exports = class OrderService extends cds.ApplicationService {

  async init() {
    const { Orders, OrderItems, Clients, Products } = this.entities

    // ══════════════════════════════════════════════════════════
    // DRAFT HANDLING (Fase 3)
    // ══════════════════════════════════════════════════════════

    // ── PATCH en borrador: recalcular totales sin validar ──────
    // Se dispara cada vez que el usuario edita un ítem en el draft.
    // No rechazamos datos incompletos — el draft puede estar "a medias".
    this.before('PATCH', Orders.drafts, async (req) => {
      const items = req.data.items
      if (!items || items.length === 0) return

      for (const item of items) {
        // Solo recalcular si tenemos los datos mínimos
        if (item.cantidad > 0 && item.precioUnitario > 0) {
          item.subtotal   = parseFloat((item.cantidad * item.precioUnitario).toFixed(2))
          item.importeIVA = parseFloat((item.subtotal * (item.alicuotaIVA ?? 21) / 100).toFixed(2))
          item.total      = parseFloat((item.subtotal + item.importeIVA).toFixed(2))
        }
      }

      // Recalcular totales de cabecera si hay ítems completos
      const completedItems = items.filter(i => i.subtotal != null)
      if (completedItems.length > 0) {
        const subtotal = completedItems.reduce((s, i) => s + (i.subtotal   || 0), 0)
        const totalIVA = completedItems.reduce((s, i) => s + (i.importeIVA || 0), 0)
        req.data.subtotal = parseFloat(subtotal.toFixed(2))
        req.data.totalIVA = parseFloat(totalIVA.toFixed(2))
        req.data.total    = parseFloat((subtotal + totalIVA).toFixed(2))
      }
    })

    // ── CANCEL del draft: log sin bloquear ────────────────────
    this.on('CANCEL', Orders.drafts, async (req, next) => {
      console.log(`[OrderService] Draft cancelado por usuario: ${req.user?.id}`)
      return next()
    })

    // ══════════════════════════════════════════════════════════
    // ACTIVE ENTITY HANDLERS
    // Corren al activar el draft (draftActivate) o al crear directo.
    // Aquí sí aplicamos validación completa.
    // ══════════════════════════════════════════════════════════

    // ── before CREATE (activación del draft) ──────────────────
    this.before('CREATE', Orders, async (req) => {
      const { client_ID, items } = req.data

      // Validar cliente activo
      const client = await SELECT.one.from(Clients).where({ ID: client_ID })
      if (!client)        return req.error(400, `Cliente ${client_ID} no existe`)
      if (!client.activo) return req.error(400, `El cliente "${client.razonSocial}" está inactivo`)

      // Validar ítems
      if (!items || items.length === 0)
        return req.error(400, 'El pedido debe tener al menos un ítem')

      for (const item of items) {
        if (!item.cantidad || item.cantidad <= 0)
          return req.error(400, 'Todos los ítems deben tener cantidad mayor a 0')

        const product = await SELECT.one.from(Products).where({ ID: item.product_ID })
        if (!product)        return req.error(400, `Producto ${item.product_ID} no existe`)
        if (!product.activo) return req.error(400, `El producto "${product.descripcion}" está inactivo`)

        // Copiar datos del producto al ítem (si no vinieron del draft)
        item.descripcion    = item.descripcion    || product.descripcion
        item.precioUnitario = item.precioUnitario || product.precioUnitario
        item.alicuotaIVA    = item.alicuotaIVA    ?? product.alicuotaIVA

        // Recalcular con datos definitivos
        item.subtotal   = parseFloat((item.cantidad * item.precioUnitario).toFixed(2))
        item.importeIVA = parseFloat((item.subtotal * item.alicuotaIVA / 100).toFixed(2))
        item.total      = parseFloat((item.subtotal + item.importeIVA).toFixed(2))
      }

      // Totales de cabecera
      const subtotal = items.reduce((s, i) => s + i.subtotal,   0)
      const totalIVA = items.reduce((s, i) => s + i.importeIVA, 0)
      req.data.subtotal = parseFloat(subtotal.toFixed(2))
      req.data.totalIVA = parseFloat(totalIVA.toFixed(2))
      req.data.total    = parseFloat((subtotal + totalIVA).toFixed(2))

      // Número de pedido automático
      if (!req.data.numero) {
        const count = await SELECT`count(*) as n`.from(Orders)
        req.data.numero = `PED-${String(count[0].n + 1).padStart(6, '0')}`
      }
    })

    // ── after CREATE ───────────────────────────────────────────
    this.after('CREATE', Orders, async (order, req) => {
      await this.emit('OrderPlaced', {
        orderID:   order.ID,
        companyID: order.company_ID,
        numero:    order.numero
      })
    })

    // ── ACTION: approve ────────────────────────────────────────
    this.on('approve', async (req) => {
      const { orderID } = req.data
      const order = await SELECT.one.from(Orders).where({ ID: orderID })

      if (!order)
        return req.error(404, `Pedido ${orderID} no encontrado`)
      if (order.estado !== 'Borrador')
        return req.error(400, `Solo se pueden aprobar pedidos en estado Borrador. Estado actual: ${order.estado}`)

      await UPDATE(Orders).set({ estado: 'Aprobada' }).where({ ID: orderID })

      await this.emit('OrderApproved', {
        orderID:   orderID,
        companyID: order.company_ID
      })

      return { message: `Pedido ${order.numero} aprobado correctamente` }
    })

    // ── Control de concurrencia: ETag mismatch → 412 ──────────
    // CAP lanza automáticamente 412 cuando el If-Match no coincide.
    // Aquí lo interceptamos para devolver un mensaje legible.
    this.on('error', (err, req) => {
      if (err.code === 412 || err.status === 412) {
        err.message = 'El pedido fue modificado por otro usuario. Recargá la página para ver la versión actualizada.'
      }
    })

    // ── before DELETE ──────────────────────────────────────────
    this.before('DELETE', Orders, async (req) => {
      const { ID } = req.params[0]
      const order = await SELECT.one.from(Orders).where({ ID })

      if (!order)
        return req.error(404, 'Pedido no encontrado')
      if (order.estado !== 'Borrador')
        return req.error(409, `No se puede eliminar un pedido en estado "${order.estado}". Solo se eliminan pedidos en Borrador.`)
    })

    return super.init()
  }
}
