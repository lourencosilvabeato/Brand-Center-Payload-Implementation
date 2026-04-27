import jwt from 'jsonwebtoken'

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
