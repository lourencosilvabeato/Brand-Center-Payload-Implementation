import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getPayload } from '@/lib/payload'
import { sendPasswordRecoveryEmail } from '@/lib/email'

export async function POST(request: Request) {
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

  const existingUsers = await payload.find({
    collection: 'externalUsers',
    where: { email: { equals: email } },
    limit: 1,
  })

  // Always respond with success to prevent email enumeration
  if (existingUsers.totalDocs === 0) {
    return NextResponse.json({ success: true })
  }

  const user = existingUsers.docs[0]!

  const rawToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const resetRecord = await payload.create({
    collection: 'passwordResets',
    data: {
      user: user.id,
      tokenHash,
      expiresAt,
      used: false,
    },
  })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const resetUrl = `${baseUrl}/set-password?token=${rawToken}&type=reset`

  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n[reset-password] Reset link for ${email}:\n  ${resetUrl}\n`)
  }

  try {
    await sendPasswordRecoveryEmail(email, resetUrl)
  } catch (err) {
    await payload.delete({ collection: 'passwordResets', id: resetRecord.id }).catch(() => null)
    console.error('[reset-password] email send failed:', err)
    // Still return success to prevent email enumeration — the user gets no info either way
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: true })
}
