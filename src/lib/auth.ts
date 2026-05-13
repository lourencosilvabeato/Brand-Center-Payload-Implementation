import { createHash, createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

export interface SessionUser {
  id: string
  email: string
  role?: 'admin' | 'localAdmin' | 'internal' | 'external'
  collection: 'platformUsers' | 'externalUsers'
}

// Payload derives the signing key exactly this way (see payload/dist/index.js)
function getSigningKey(): string {
  return createHash('sha256')
    .update(process.env.PAYLOAD_SECRET ?? '')
    .digest('hex')
    .slice(0, 32)
}

function b64urlDecode(str: string): Buffer {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
}

function verifyAndDecodeJWT(token: string): Record<string, unknown> | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [headerB64, payloadB64, sigB64] = parts

  const key = getSigningKey()
  const expected = createHmac('sha256', Buffer.from(key, 'utf8'))
    .update(`${headerB64}.${payloadB64}`)
    .digest()
  const actual = b64urlDecode(sigB64)

  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null

  try {
    return JSON.parse(b64urlDecode(payloadB64).toString('utf8')) as Record<string, unknown>
  } catch {
    return null
  }
}

export function getSessionUserFromRequest(request: Request): SessionUser | null {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const entry = cookieHeader.split(';').find((c) => c.trim().startsWith('payload-token='))
  const token = entry?.split('=').slice(1).join('=').trim()
  if (!token) return null

  const payload = verifyAndDecodeJWT(token)
  if (!payload) return null
  if (payload.exp && Number(payload.exp) * 1000 < Date.now()) return null

  return {
    id: String(payload.id),
    email: String(payload.email),
    role: payload.role as SessionUser['role'],
    collection: payload.collection as SessionUser['collection'],
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  if (!token) return null

  const payload = verifyAndDecodeJWT(token)
  if (!payload) return null
  if (payload.exp && Number(payload.exp) * 1000 < Date.now()) return null

  return {
    id: String(payload.id),
    email: String(payload.email),
    role: payload.role as SessionUser['role'],
    collection: payload.collection as SessionUser['collection'],
  }
}
