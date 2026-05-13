import { NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { getSessionUserFromRequest } from '@/lib/auth'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = getSessionUserFromRequest(request)
  if (
    !user ||
    user.collection !== 'platformUsers' ||
    (user.role !== 'admin' && user.role !== 'localAdmin')
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const payload = await getPayload()

  try {
    await payload.update({
      collection: 'invitations',
      id,
      data: { cancelled: true },
    })
  } catch {
    return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
