import { type NextRequest, NextResponse } from 'next/server'
import { getSessionUserFromRequest } from '@/lib/auth'
import { getPayload } from '@/lib/payload'
import type { ProtectedFile } from '@/payload-types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const user = getSessionUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { fileId } = await params
  const id = parseInt(fileId, 10)
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 })
  }

  try {
    const payload = await getPayload()
    const file = (await payload.findByID({
      collection: 'protectedFiles',
      id,
    })) as ProtectedFile

    if (!file?.url) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    return NextResponse.redirect(new URL(file.url, request.url))
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
