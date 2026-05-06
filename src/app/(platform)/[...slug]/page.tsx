import { notFound } from 'next/navigation'
import { getPayload } from '@/lib/payload'
import { buildBreadcrumb, findSiblings } from '@/lib/navigation'
import { ContentPageLayout } from '@/components/ContentPageLayout'

interface Props {
  params: Promise<{ slug: string[] }>
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params
  const slugStr = slug[slug.length - 1]

  const payload = await getPayload()

  const result = await payload.find({
    collection: 'contentPages',
    where: { slug: { equals: slugStr } },
    depth: 2,
    limit: 1,
  })

  const page = result.docs[0]
  if (!page) notFound()

  const nav = await payload.findGlobal({ slug: 'navigation' })
  const trail = buildBreadcrumb(nav.items, slug)
  const siblings = findSiblings(nav.items, slug)
  const currentHref = '/' + slug.join('/')

  return (
    <ContentPageLayout
      page={page}
      trail={trail}
      siblings={siblings}
      currentHref={currentHref}
    />
  )
}
