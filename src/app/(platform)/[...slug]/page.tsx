import { notFound } from 'next/navigation'
import { getPayload } from '@/lib/payload'
import { buildBreadcrumb, findSiblings } from '@/lib/navigation'
import { ContentPageLayout } from '@/components/ContentPageLayout'
import { ChannelPageLayout } from '@/components/ChannelPageLayout'

interface Props {
  params: Promise<{ slug: string[] }>
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params
  const slugStr = slug[slug.length - 1]

  const payload = await getPayload()

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
