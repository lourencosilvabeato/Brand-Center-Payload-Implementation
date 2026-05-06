import { NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { getSessionUserFromRequest } from '@/lib/auth'

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/
const PASSWORD_ERROR =
  'Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.'

export async function POST(request: Request) {
  const user = getSessionUserFromRequest(request)

  if (!user || user.collection !== 'externalUsers') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: { currentPassword?: string; newPassword?: string; confirmPassword?: string }
  try {
    body = (await request.json()) as {
      currentPassword?: string
      newPassword?: string
      confirmPassword?: string
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { currentPassword, newPassword, confirmPassword } = body

  if (!currentPassword) {
    return NextResponse.json(
      { field: 'currentPassword', error: 'This field is required.' },
      { status: 400 },
    )
  }

  if (!newPassword) {
    return NextResponse.json(
      { field: 'newPassword', error: 'This field is required.' },
      { status: 400 },
    )
  }

  if (!confirmPassword) {
    return NextResponse.json(
      { field: 'confirmPassword', error: 'This field is required.' },
      { status: 400 },
    )
  }

  if (!PASSWORD_REGEX.test(newPassword)) {
    return NextResponse.json({ field: 'newPassword', error: PASSWORD_ERROR }, { status: 400 })
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json(
      {
        field: 'confirmPassword',
        error: 'The new passwords do not match. Please ensure both fields are identical.',
      },
      { status: 400 },
    )
  }

  const payload = await getPayload()

  try {
    await payload.login({
      collection: 'externalUsers',
      data: { email: user.email, password: currentPassword },
    })
  } catch {
    return NextResponse.json(
      {
        field: 'currentPassword',
        error: 'The current password you entered is incorrect. Please try again.',
      },
      { status: 400 },
    )
  }

  try {
    await payload.update({
      collection: 'externalUsers',
      id: user.id,
      data: { password: newPassword },
    })
  } catch {
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again shortly.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true })
}
