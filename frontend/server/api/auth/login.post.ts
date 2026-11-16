// POST /api/auth/login  { password }
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  if (!config.adminPassword) {
    throw createError({ statusCode: 500, statusMessage: 'NUXT_ADMIN_PASSWORD is not set on the server.' })
  }
  const body = await readBody<{ password?: string }>(event)
  if (!body?.password || !passwordMatches(body.password, config.adminPassword)) {
    throw createError({ statusCode: 401, statusMessage: 'Incorrect password.' })
  }
  const session = await adminSession(event)
  await session.update({ admin: true })
  return { admin: true }
})
