import { notFound, redirect } from 'next/navigation'
import { getPayload } from '@/lib/payload'
import { getSessionUser } from '@/lib/auth'
import { buildBreadcrumb, findSiblings } from '@/lib/navigation'
import { ContentPageLayout } from '@/components/ContentPageLayout'
import { ChannelPageLayout } from '@/components/ChannelPageLayout'

interface Props {
  params: Promise<{ slug: string[] }>
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params
  const slugStr = slug[slug.length - 1]

  const [sessionUser, payload] = await Promise.all([getSessionUser(), getPayload()])

  // Secondary server-side guard for custom role page access.
  // Read fresh from DB (not JWT) so permission changes take effect immediately.
  if (sessionUser?.collection === 'externalUsers') {
    try {
      const externalUser = await payload.findByID({
        collection: 'externalUsers',
        id: Number(sessionUser.id),
        overrideAccess: true,
      }) as { allowedMenuItems?: unknown }
      const fresh = externalUser.allowedMenuItems
      if (Array.isArray(fresh) && fresh.length > 0 && !fresh.includes(slugStr)) {
        redirect('/')
      }
    } catch {
      // If DB read fails, fall back to JWT value
      if (
        Array.isArray(sessionUser.allowedMenuItems) &&
        sessionUser.allowedMenuItems.length > 0 &&
        !sessionUser.allowedMenuItems.includes(slugStr)
      ) {
        redirect('/')
      }
    }
  }

  const [contentResult, channelResult, nav] = await Promise.all([
    payload.find({
      collection: 'contentPages',
      where: { slug: { equals: slugStr } },
      depth: 2,
      limit: 1,
    }),
    payload.find({
      collection: 'channelPages',
      where: { slug: { equals: slugStr } },
      depth: 2,
      limit: 1,
    }),
    payload.findGlobal({ slug: 'navigation' }),
  ])

  const trail = buildBreadcrumb(nav.items, slug)
  const currentHref = '/' + slug.join('/')

  if (contentResult.docs[0]) {
    const page = contentResult.docs[0]
    const siblings = findSiblings(nav.items, slug)
    return (
      <ContentPageLayout
        page={page}
        trail={trail}
        siblings={siblings}
        currentHref={currentHref}
      />
    )
  }

  if (channelResult.docs[0]) {
    return <ChannelPageLayout page={channelResult.docs[0]} trail={trail} />
  }

  notFound()
}
