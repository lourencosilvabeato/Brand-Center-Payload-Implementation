import { getPayload } from '@/lib/payload'
import { getSessionUser } from '@/lib/auth'
import type { Navigation, PlatformUser } from '@/payload-types'
import { filterNavByAllowedSlugs, expandSlugsWithAncestors } from '@/lib/navigation'
import { HeaderClient } from './HeaderClient'

export async function Header() {
  const [payload, sessionUser] = await Promise.all([getPayload(), getSessionUser()])

  const nav = (await payload.findGlobal({ slug: 'navigation', depth: 1 })) as Navigation

  let displayName: string | null = null
  let avatarUrl: string | null = null
  let role: 'admin' | 'localAdmin' | 'internal' | 'external' = 'internal'

  let allowedSlugs: string[] | null = null

  if (sessionUser) {
    if (sessionUser.collection === 'platformUsers') {
      try {
        const user = await payload.findByID({
          collection: 'platformUsers',
          id: Number(sessionUser.id),
          overrideAccess: true,
        }) as PlatformUser
        role = (user.role as typeof role) ?? 'internal'
        displayName = user.displayName ?? null
        avatarUrl = user.avatarUrl ?? null
      } catch {
        role = sessionUser.role ?? 'internal'
      }
    } else if (sessionUser.collection === 'externalUsers') {
      role = 'external'
      // Read allowedMenuItems fresh from DB so permission changes take effect on the
      // next page load without requiring the user to re-login.
      // Expand raw slugs with ancestor slugs using the nav tree already fetched above.
      try {
        const externalUser = await payload.findByID({
          collection: 'externalUsers',
          id: Number(sessionUser.id),
          overrideAccess: true,
        }) as { allowedMenuItems?: unknown }
        const raw = externalUser.allowedMenuItems
        if (Array.isArray(raw) && raw.length > 0) {
          allowedSlugs = expandSlugsWithAncestors(raw as string[], nav.items ?? [])
        }
      } catch {
        // Fall back to JWT value on DB failure
        if (Array.isArray(sessionUser.allowedMenuItems) && sessionUser.allowedMenuItems.length > 0) {
          allowedSlugs = expandSlugsWithAncestors(sessionUser.allowedMenuItems, nav.items ?? [])
        }
      }
    }
  }

  const navItems = allowedSlugs
    ? filterNavByAllowedSlugs(nav.items ?? [], allowedSlugs)
    : (nav.items ?? null)

  return (
    <HeaderClient
      items={navItems}
      role={role}
      displayName={displayName}
      avatarUrl={avatarUrl}
      allowedSlugs={allowedSlugs}
    />
  )
}
