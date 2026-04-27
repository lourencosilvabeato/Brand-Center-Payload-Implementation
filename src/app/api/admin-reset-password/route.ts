import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getPayload } from '@/lib/payload'
import { getSessionUserFromRequest } from '@/lib/auth'
import { sendAdminPasswordResetEmail } from '@/lib/email'

export async function POST(request: Request) {
  const user = getSessionUserFromRequest(request)
  if (!user || user.collection !== 'platformUsers' || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: { userId?: string | number }
  try {
    body = (await request.json()) as { userId?: string | number }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { userId } = body
  if (!userId) {
    return NextResponse.json({ error: 'userId is required.' }, { status: 400 })
  }

  const payload = await getPayload()

  const externalUser = await payload.findByID({
    collection: 'externalUsers',
    id: String(userId),
    depth: 0,
  }).catch(() => null)

  if (!externalUser) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 })
  }

  const rawToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  await payload.create({
    collection: 'passwordResets',
    data: {
      user: Number(userId),
      tokenHash,
      expiresAt,
      used: false,
    },
  })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  await sendAdminPasswordResetEmail(
    externalUser.email,
    `${baseUrl}/set-password?token=${rawToken}&type=reset`,
  )

  return NextResponse.json({ success: true })
}
