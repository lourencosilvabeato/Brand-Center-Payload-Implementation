import { notFound } from 'next/navigation'
import { getPayload } from '@/lib/payload'
import { ContentPageLayout } from '@/components/ContentPageLayout'

export default async function FaqsPage() {
  const payload = await getPayload()

  const result = await payload.find({
    collection: 'contentPages',
    where: { slug: { equals: 'faqs' } },
    depth: 2,
    limit: 1,
  })

  const page = result.docs[0]
  if (!page) notFound()

  return (
    <ContentPageLayout
      page={page}
      trail={[]}
      siblings={[]}
      currentHref="/faqs"
    />
  )
}
