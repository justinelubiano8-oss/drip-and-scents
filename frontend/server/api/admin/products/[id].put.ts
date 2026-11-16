// PUT /api/admin/products/:documentId  { data } — i-edit ang product (admin lang)
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody<{ data: Record<string, unknown> }>(event)
  try {
    return await strapiAdmin()(`/products/${id}`, { method: 'PUT', body: { data: body.data } })
  } catch (err: any) {
    throw createError({ statusCode: err?.statusCode || 500, statusMessage: strapiErrorMessage(err) })
  }
})
