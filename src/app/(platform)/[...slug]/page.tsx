import { notFound, redirect } from 'next/navigation'
import { getPayload } from '@/lib/payload'
import { getSessionUser } from '@/lib/auth'
import { buildBreadcrumb, findSiblings, expandSlugsWithAncestors } from '@/lib/navigation'
import { ContentPageLayout } from '@/components/ContentPageLayout'
import { ChannelPageLayout } from '@/components/ChannelPageLayout'

interface Props {
  params: Promise<{ slug: string[] }>
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params
  const slugStr = slug[slug.length - 1]

  const [sessionUser, payload] = await Promise.all([getSessionUser(), getPayload()])

  // Fetch everything in parallel: user doc (for fresh permissions), nav, and page content
  const [externalUserDoc, contentResult, channelResult, nav] = await Promise.all([
    sessionUser?.collection === 'externalUsers'
      ? (payload.findByID({
          collection: 'externalUsers',
          id: Number(sessionUser.id),
          overrideAccess: true,
        }) as Promise<{ allowedMenuItems?: unknown }>)
      : Promise.resolve(null),
    payload.find({ collection: 'contentPages', where: { slug: { equals: slugStr } }, depth: 2, limit: 1 }),
    payload.find({ collection: 'channelPages', where: { slug: { equals: slugStr } }, depth: 2, limit: 1 }),
    payload.findGlobal({ slug: 'navigation' }),
  ])

  // Server-side access guard — reads fresh from DB and expands ancestor slugs
  if (sessionUser?.collection === 'externalUsers') {
    const raw = externalUserDoc?.allowedMenuItems
    if (Array.isArray(raw) && raw.length > 0) {
      const expanded = expandSlugsWithAncestors(raw as string[], nav.items ?? [])
      if (!expanded.includes(slugStr)) {
        redirect('/')
      }
    }
  }

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
    return <ChannelPageLayout page={channelResult.docs[0]} trail={trail} nav={nav} />
  }

  notFound()
}
