import { NextResponse } from 'next/server'

// A01 — Azure AD OAuth callback (implemented in feature/auth-azure)
export async function GET() {
  return NextResponse.json({ message: 'Not yet implemented' }, { status: 501 })
}
