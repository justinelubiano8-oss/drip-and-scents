// POST /api/admin/upload (multipart, field "files") — i-upload ang image sa Strapi (admin lang)
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const parts = await readMultipartFormData(event)
  const file = parts?.find((p) => p.name === 'files' && p.filename)
  if (!file) throw createError({ statusCode: 400, statusMessage: 'No image file received.' })
  if (!file.type?.startsWith('image/')) throw createError({ statusCode: 400, statusMessage: 'Only image files are allowed.' })

  const form = new FormData()
  form.append('files', new Blob([file.data], { type: file.type }), file.filename)
  try {
    return await strapiAdmin()('/upload', { method: 'POST', body: form })
  } catch (err: any) {
    throw createError({ statusCode: err?.statusCode || 500, statusMessage: strapiErrorMessage(err) })
  }
})
