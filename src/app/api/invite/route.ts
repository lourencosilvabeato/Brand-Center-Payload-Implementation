import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getPayload } from '@/lib/payload'
import { getSessionUserFromRequest } from '@/lib/auth'
import { sendInvitationEmail } from '@/lib/email'

function isAdminOrLocalAdmin(role?: string): boolean {
  return role === 'admin' || role === 'localAdmin'
}

export async function POST(request: Request) {
  const user = getSessionUserFromRequest(request)
  if (!user || user.collection !== 'platformUsers' || !isAdminOrLocalAdmin(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: { email?: string }
  try {
    body = (await request.json()) as { email?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const email = (body.email ?? '').trim().toLowerCase()

  if (!email) {
    return NextResponse.json({ field: 'email', error: 'This field is required.' }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { field: 'email', error: 'Please enter a valid email address.' },
      { status: 400 },
    )
  }

  const payload = await getPayload()

  const existingUser = await payload.find({
    collection: 'externalUsers',
    where: { email: { equals: email } },
    limit: 1,
  })
  if (existingUser.totalDocs > 0) {
    return NextResponse.json(
      {
        field: 'email',
        error: 'An account or a pending invitation already exists for this email address.',
      },
      { status: 409 },
    )
  }

  const now = new Date().toISOString()
  const existingInvite = await payload.find({
    collection: 'invitations',
    where: {
      and: [
        { email: { equals: email } },
        { used: { equals: false } },
        { cancelled: { equals: false } },
        { expiresAt: { greater_than: now } },
      ],
    },
    limit: 1,
  })
  if (existingInvite.totalDocs > 0) {
    return NextResponse.json(
      {
        field: 'email',
        error: 'An account or a pending invitation already exists for this email address.',
      },
      { status: 409 },
    )
  }

  const rawToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const invitation = await payload.create({
    collection: 'invitations',
    data: {
      email,
      tokenHash,
      expiresAt,
      used: false,
      cancelled: false,
      invitedBy: Number(user.id),
    },
  })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const inviteUrl = `${baseUrl}/set-password?token=${rawToken}`

  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n[invite] Set-password link for ${email}:\n  ${inviteUrl}\n`)
  }

  try {
    await sendInvitationEmail(email, inviteUrl)
  } catch (err) {
    // Roll back the invitation so the sender can retry
    await payload.delete({ collection: 'invitations', id: invitation.id }).catch(() => null)
    console.error('[invite] email send failed:', err)
    return NextResponse.json(
      { error: 'Failed to send invitation email. Please check your email configuration and try again.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true })
}

export async function GET(request: Request) {
  const user = getSessionUserFromRequest(request)
  if (!user || user.collection !== 'platformUsers' || !isAdminOrLocalAdmin(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const payload = await getPayload()
  const now = new Date().toISOString()

  const result = await payload.find({
    collection: 'invitations',
    where: {
      and: [
        { used: { equals: false } },
        { cancelled: { equals: false } },
        { expiresAt: { greater_than: now } },
      ],
    },
    sort: 'createdAt',
    limit: 100,
  })

  return NextResponse.json({
    invitations: result.docs.map((inv) => ({
      id: inv.id,
      email: inv.email,
      expiresAt: inv.expiresAt,
    })),
  })
}
