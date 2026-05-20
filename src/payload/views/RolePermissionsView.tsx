import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { getPayload } from '@/lib/payload'
import type { Navigation } from '@/payload-types'
import { buildPermissionsNavTree } from '@/lib/navigation'
import { RolePermissionsClient } from './RolePermissionsClient'

interface RawRole {
  id: number
  name: string
  description?: string | null
  allowedMenuItems?: unknown
}

export async function RolePermissionsView() {
  const sessionUser = await getSessionUser()
  if (!sessionUser || sessionUser.role !== 'admin') {
    redirect('/admin')
  }

  const payload = await getPayload()

  const [rolesResult, nav] = await Promise.all([
    payload.find({
      collection: 'customRoles',
      limit: 200,
      overrideAccess: true,
    }),
    payload.findGlobal({ slug: 'navigation', depth: 1 }),
  ])

  const roles = (rolesResult.docs as unknown as RawRole[]).map((doc) => ({
    id: String(doc.id),
    name: doc.name,
    description: doc.description ?? null,
    allowedMenuItems: Array.isArray(doc.allowedMenuItems)
      ? (doc.allowedMenuItems as string[])
      : [],
  }))

  const navTree = buildPermissionsNavTree((nav as Navigation).items)

  return <RolePermissionsClient roles={roles} navTree={navTree} />
}
