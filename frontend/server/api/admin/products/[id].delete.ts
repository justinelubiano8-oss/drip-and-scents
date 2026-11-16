// DELETE /api/admin/products/:documentId — burahin ang product (admin lang)
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  try {
    await strapiAdmin()(`/products/${id}`, { method: 'DELETE' })
    return { deleted: true }
  } catch (err: any) {
    throw createError({ statusCode: err?.statusCode || 500, statusMessage: strapiErrorMessage(err) })
  }
})
