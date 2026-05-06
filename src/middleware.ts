import { NextRequest, NextResponse } from 'next/server'

// Paths that do not require authentication
const PUBLIC_PATHS = ['/login', '/reset-password', '/set-password', '/expired-link']

// Payload REST API — always pass through (Payload handles its own auth)
const API_PREFIX = '/api'

// Payload admin sub-paths that are always accessible (login, setup)
const ADMIN_PUBLIC = ['/admin/login', '/admin/create-first-user', '/admin/logout']

interface TokenPayload {
  id: string
  email: string
  collection: string
  role?: 'admin' | 'localAdmin' | 'internal' | 'external'
  exp?: number
}

function decodeToken(token: string): TokenPayload | null {
  // JWT verification with PAYLOAD_SECRET is not available in the Edge runtime.
  // Middleware performs a structural decode only; cryptographic verification
  // happens server-side in every Payload Local API call.
  try {
    const [, payloadSegment] = token.split('.')
    if (!payloadSegment) return null
    const decoded = JSON.parse(atob(payloadSegment.replace(/-/g, '+').replace(/_/g, '/')))
    if (decoded.exp && decoded.exp * 1000 < Date.now()) return null
    return decoded as TokenPayload
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Payload REST API — always pass through
  if (pathname.startsWith(API_PREFIX)) {
    return NextResponse.next()
  }

  // Static assets — pass through
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.endsWith('.ico')
  ) {
    return NextResponse.next()
  }

  // Payload admin login/setup pages — pass through
  if (ADMIN_PUBLIC.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next()
  }

  const token = request.cookies.get('payload-token')?.value
  const decoded = token ? decodeToken(token) : null

  // Payload admin panel — admin role only
  if (pathname.startsWith('/admin')) {
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Auth pages — pass through
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next()
  }

  // Platform pages — require any authenticated session
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (!decoded) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('payload-token')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
