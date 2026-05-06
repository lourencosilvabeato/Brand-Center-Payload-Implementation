import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getPayload } from '@/lib/payload'

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/
const PASSWORD_ERROR =
  'Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.'

export async function POST(request: Request) {
  let body: { token?: string; password?: string; confirmPassword?: string }
  try {
    body = (await request.json()) as {
      token?: string
      password?: string
      confirmPassword?: string
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { token, password, confirmPassword } = body

  if (!token) {
    return NextResponse.json({ error: 'expired' }, { status: 410 })
  }

  if (!password) {
    return NextResponse.json({ field: 'password', error: 'This field is required.' }, { status: 400 })
  }

  if (!confirmPassword) {
    return NextResponse.json(
      { field: 'confirmPassword', error: 'This field is required.' },
      { status: 400 },
    )
  }

  if (!PASSWORD_REGEX.test(password)) {
    return NextResponse.json({ field: 'password', error: PASSWORD_ERROR }, { status: 400 })
  }

  if (password !== confirmPassword) {
    return NextResponse.json(
      {
        field: 'confirmPassword',
        error: 'The new passwords do not match. Please ensure both fields are identical.',
      },
      { status: 400 },
    )
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const payload = await getPayload()
  const now = new Date().toISOString()

  const resets = await payload.find({
    collection: 'passwordResets',
    where: {
      and: [
        { tokenHash: { equals: tokenHash } },
        { used: { equals: false } },
        { expiresAt: { greater_than: now } },
      ],
    },
    limit: 1,
    depth: 0,
  })

  if (resets.totalDocs === 0) {
    return NextResponse.json({ error: 'expired' }, { status: 410 })
  }

  const reset = resets.docs[0]!
  const userId = reset.user as unknown as string

  try {
    await payload.update({
      collection: 'externalUsers',
      id: userId,
      data: { password },
    })
  } catch {
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again shortly.' },
      { status: 500 },
    )
  }

  await payload.update({
    collection: 'passwordResets',
    id: String(reset.id),
    data: { used: true },
  })

  return NextResponse.json({ success: true })
}
