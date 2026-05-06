import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

export interface SessionUser {
  id: string
  email: string
  role?: 'admin' | 'localAdmin' | 'internal' | 'external'
  collection: 'platformUsers' | 'externalUsers'
}

export function getSessionUserFromRequest(request: Request): SessionUser | null {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const entry = cookieHeader.split(';').find((c) => c.trim().startsWith('payload-token='))
  const token = entry?.split('=').slice(1).join('=').trim()
  if (!token) return null

  try {
    const decoded = jwt.verify(token, process.env.PAYLOAD_SECRET ?? '') as SessionUser
    return decoded
  } catch {
    return null
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(token, process.env.PAYLOAD_SECRET ?? '') as SessionUser & {
      exp?: number
    }
    if (decoded.exp && decoded.exp * 1000 < Date.now()) return null
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      collection: decoded.collection,
    }
  } catch {
    return null
  }
}
