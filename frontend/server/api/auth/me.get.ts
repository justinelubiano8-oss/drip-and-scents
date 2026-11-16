// GET /api/auth/me — naka-login ba ang admin?
export default defineEventHandler(async (event) => {
  const session = await adminSession(event)
  return { admin: !!session.data.admin }
})
