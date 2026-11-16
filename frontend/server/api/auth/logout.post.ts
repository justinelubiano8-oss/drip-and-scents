// POST /api/auth/logout
export default defineEventHandler(async (event) => {
  const session = await adminSession(event)
  await session.clear()
  return { admin: false }
})
