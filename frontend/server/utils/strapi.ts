// Mga helper na tumatakbo lang sa SERVER ng Nuxt.
// Dito lang ginagamit ang secret na Strapi API token, kaya hindi ito nakikita sa browser.
import { timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

// $fetch papunta sa Strapi na may Authorization: Bearer <token>
export const strapiAdmin = () => {
  const config = useRuntimeConfig()
  if (!config.strapiToken) {
    throw createError({ statusCode: 500, statusMessage: 'NUXT_STRAPI_TOKEN is not set on the server.' })
  }
  return $fetch.create({
    baseURL: `${String(config.public.strapiUrl).replace(/\/$/, '')}/api`,
    headers: { Authorization: `Bearer ${config.strapiToken}` }
  })
}

// Session para malaman kung naka-login ang admin (naka-encrypt na cookie)
export const adminSession = (event: H3Event) => {
  const config = useRuntimeConfig()
  const password = config.sessionSecret || ''
  if (password.length < 32) {
    throw createError({ statusCode: 500, statusMessage: 'NUXT_SESSION_SECRET must be at least 32 characters.' })
  }
  return useSession<{ admin?: boolean }>(event, {
    name: 'ds-admin',
    password,
    maxAge: 60 * 60 * 8, // 8 oras
    cookie: { httpOnly: true, sameSite: 'lax', secure: !import.meta.dev }
  })
}

// Harangin ang request kapag hindi naka-login ang admin
export const requireAdmin = async (event: H3Event) => {
  const session = await adminSession(event)
  if (!session.data.admin) {
    throw createError({ statusCode: 401, statusMessage: 'Please log in as admin first.' })
  }
}

// Ligtas na paghahambing ng password (iwas timing attack)
export const passwordMatches = (given: string, expected: string) => {
  const a = Buffer.from(String(given))
  const b = Buffer.from(String(expected))
  return a.length === b.length && timingSafeEqual(a, b)
}

// Kinukuha ang mensahe ng error galing Strapi
export const strapiErrorMessage = (err: any) =>
  err?.data?.error?.message || err?.message || 'Strapi request failed.'
