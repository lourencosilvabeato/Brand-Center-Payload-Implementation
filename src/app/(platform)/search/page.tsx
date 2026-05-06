import { getPayload } from '@/lib/payload'
import { buildNavIndex, getL1NavItems } from '@/lib/navigation'
import { SearchPageLayout } from '@/components/SearchPageLayout'
import type { SearchResult, FilterOption } from '@/components/SearchPageLayout'
import type { ContentPage, ChannelPage } from '@/payload-types'

const PAGE_SIZE = 7

function lexicalToText(data: unknown): string {
  if (!data || typeof data !== 'object') return ''
  const root = (data as Record<string, unknown>).root
  if (!root || typeof root !== 'object') return ''
  const nodes = (root as Record<string, unknown>).children
  if (!Array.isArray(nodes)) return ''

  function extract(node: unknown): string {
    if (!node || typeof node !== 'object') return ''
    const n = node as Record<string, unknown>
    if (typeof n.text === 'string') return n.text
    if (Array.isArray(n.children)) return n.children.map(extract).join(' ')
    return ''
  }

  return nodes.map(extract).join(' ').replace(/\s+/g, ' ').trim()
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string; page?: string }>
}) {
  const { q = '', filter = '', page = '1' } = await searchParams
  const query = q.trim()
  const currentPage = Math.max(1, parseInt(page, 10) || 1)

  const payload = await getPayload()

  const [contentResult, channelResult, nav] = await Promise.all([
    query
      ? payload.find({
          collection: 'contentPages',
          where: { title: { like: query } },
          limit: 500,
          depth: 0,
        })
      : ({ docs: [] as ContentPage[] } as { docs: ContentPage[] }),
    query
      ? payload.find({
          collection: 'channelPages',
          where: {
            or: [{ title: { like: query } }, { excerpt: { like: query } }],
          },
          limit: 500,
          depth: 0,
        })
      : ({ docs: [] as ChannelPage[] } as { docs: ChannelPage[] }),
    payload.findGlobal({ slug: 'navigation' }),
  ])

  const navIndex = buildNavIndex(nav.items)
  const filterOptions: FilterOption[] = getL1NavItems(nav.items)

  const allResults: SearchResult[] = []
  const seenHrefs = new Set<string>()

  for (const doc of contentResult.docs) {
    const meta = navIndex.get(doc.slug)
    if (!meta) continue
    if (filter && meta.l1Slug !== filter) continue
    if (seenHrefs.has(meta.href)) continue
    seenHrefs.add(meta.href)
    allResults.push({
      id: doc.id,
      title: doc.title,
      slug: doc.slug,
      excerpt: lexicalToText(doc.excerpt) || null,
      href: meta.href,
      breadcrumbText: meta.breadcrumbText,
    })
  }

  for (const doc of channelResult.docs) {
    const meta = navIndex.get(doc.slug)
    if (!meta) continue
    if (filter && meta.l1Slug !== filter) continue
    if (seenHrefs.has(meta.href)) continue
    seenHrefs.add(meta.href)
    allResults.push({
      id: doc.id,
      title: doc.title,
      slug: doc.slug,
      excerpt: doc.excerpt ?? null,
      href: meta.href,
      breadcrumbText: meta.breadcrumbText,
    })
  }

  const totalResults = allResults.length
  const totalPages = Math.ceil(totalResults / PAGE_SIZE)
  const safePage = Math.min(currentPage, Math.max(totalPages, 1))
  const start = (safePage - 1) * PAGE_SIZE
  const pageResults = allResults.slice(start, start + PAGE_SIZE)

  return (
    <SearchPageLayout
      query={query}
      results={pageResults}
      filterOptions={filterOptions}
      activeFilter={filter}
      totalResults={totalResults}
      currentPage={safePage}
      totalPages={totalPages}
    />
  )
}
