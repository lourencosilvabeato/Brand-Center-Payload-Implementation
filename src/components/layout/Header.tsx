import { getPayload } from '@/lib/payload'
import { getSessionUser } from '@/lib/auth'
import type { Navigation, PlatformUser } from '@/payload-types'
import { HeaderClient } from './HeaderClient'

export async function Header() {
  const [payload, sessionUser] = await Promise.all([getPayload(), getSessionUser()])

  const nav = (await payload.findGlobal({ slug: 'navigation', depth: 1 })) as Navigation

  let displayName: string | null = null
  let avatarUrl: string | null = null
  let role: 'admin' | 'localAdmin' | 'internal' | 'external' = 'internal'

  if (sessionUser) {
    role = sessionUser.role ?? 'internal'

    if (sessionUser.collection === 'platformUsers') {
      try {
        const user = await payload.findByID({
          collection: 'platformUsers',
          id: Number(sessionUser.id),
        }) as PlatformUser
        displayName = user.displayName ?? null
        avatarUrl = user.avatarUrl ?? null
      } catch {
        // user not found — session may be stale
      }
    }
  }

  return (
    <HeaderClient
      items={nav.items ?? null}
      role={role}
      displayName={displayName}
      avatarUrl={avatarUrl}
    />
  )
}
