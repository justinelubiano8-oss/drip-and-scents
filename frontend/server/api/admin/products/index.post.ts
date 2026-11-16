// POST /api/admin/products  { data } — gumawa ng product (admin lang)
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{ data: Record<string, unknown> }>(event)
  try {
    return await strapiAdmin()('/products', { method: 'POST', body: { data: body.data } })
  } catch (err: any) {
    throw createError({ statusCode: err?.statusCode || 500, statusMessage: strapiErrorMessage(err) })
  }
})
