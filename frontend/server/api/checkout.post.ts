// POST /api/checkout  { items: [{ documentId, quantity }] }
// Sinusuri ulit ng SERVER ang stock bago ito bawasan, para hindi madaya mula sa browser.
interface Line { documentId: string; quantity: number }

export default defineEventHandler(async (event) => {
  const body = await readBody<{ items?: Line[] }>(event)
  const items = Array.isArray(body?.items) ? body.items : []
  if (!items.length) throw createError({ statusCode: 400, statusMessage: 'Your cart is empty.' })

  // Pagsamahin ang quantity per product (hal. 50 ml + 100 ml ng iisang perfume)
  const totals = new Map<string, number>()
  for (const i of items) {
    const qty = Math.floor(Number(i.quantity))
    if (!i.documentId || !Number.isFinite(qty) || qty < 1) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid cart item.' })
    }
    totals.set(i.documentId, (totals.get(i.documentId) || 0) + qty)
  }

  const strapi = strapiAdmin()

  // Kunin ang pinakabagong data ng bawat product
  const latest = await Promise.all(
    [...totals.keys()].map((id) =>
      strapi<{ data: any }>(`/products/${id}`).then((r) => r.data).catch(() => null)
    )
  )

  // I-check kung active pa at sapat ang stock
  const problems: string[] = []
  const ids = [...totals.keys()]
  latest.forEach((p, idx) => {
    const qty = totals.get(ids[idx]!)!
    if (!p || !p.isActive) problems.push('An item in your cart is no longer available.')
    else if (p.stock < qty) problems.push(`${p.name}: only ${p.stock} left.`)
  })
  if (problems.length) {
    throw createError({ statusCode: 409, statusMessage: problems.join(' '), data: { problems } })
  }

  // Bawasan ang stock
  for (const p of latest) {
    await strapi(`/products/${p.documentId}`, {
      method: 'PUT',
      body: { data: { stock: p.stock - totals.get(p.documentId)! } }
    })
  }

  return { ok: true }
})
