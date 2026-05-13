import { getPayload } from '@/lib/payload'
import { HomepageHero } from '@/components/homepage/HomepageHero'
import { HomepageSectionHeader } from '@/components/homepage/HomepageSectionHeader'
import { HomepageCardGrid } from '@/components/homepage/HomepageCardGrid'
import { HomepageHelpButtons } from '@/components/homepage/HomepageHelpButtons'
import type { Media } from '@/payload-types'
import type { SearchFilter } from '@/components/homepage/HomepageHero'

function resolveMediaUrl(media: number | Media | null | undefined): string | null {
  if (typeof media === 'object' && media !== null) return media.url ?? null
  return null
}

export default async function HomePage() {
  const payload = await getPayload()

  const [homepage, nav] = await Promise.all([
    payload.findGlobal({ slug: 'homePage', depth: 1 }),
    payload.findGlobal({ slug: 'navigation', depth: 0 }),
  ])

  // Build search filters from nav items marked showAsSearchFilter
  const searchFilters: SearchFilter[] = [
    { label: 'All content', value: '' },
    ...(nav.items ?? []).flatMap((l1) => {
      const acc: SearchFilter[] = []
      if (l1.showAsSearchFilter) {
        acc.push({ label: l1.label, value: l1.id ?? l1.label })
      }
      ;(l1.children ?? []).forEach((l2) => {
        if (l2.showAsSearchFilter) {
          acc.push({ label: l2.label, value: l2.id ?? l2.label })
        }
      })
      return acc
    }),
  ]

  const newInItems = (homepage.newInItems ?? []).map((item) => ({
    id: item.id ?? item.title,
    title: item.title,
    imageUrl: resolveMediaUrl(item.image),
    imageAlt: item.title,
    href: item.link ?? null,
    newTab: item.newTab ?? false,
  }))

  const quickAccessItems = (homepage.quickAccessItems ?? []).map((item) => ({
    id: item.id ?? item.title,
    title: item.title,
    imageUrl: resolveMediaUrl(item.image),
    imageAlt: item.title,
    href: item.link ?? null,
    newTab: item.newTab ?? false,
  }))

  const helpButtons = (homepage.helpButtons ?? [])
    .filter((b) => b.enabled !== false)
    .map((b) => ({
      id: b.id ?? b.label,
      label: b.label,
      url: b.url,
      newTab: b.newTab ?? false,
    }))

  return (
    <>
      <HomepageHero
        heroImageUrl={resolveMediaUrl(homepage.heroImage)}
        heroHeadline={homepage.heroHeadline}
        heroIntroText={homepage.heroIntroText}
        searchFilters={searchFilters}
      />
      <HomepageSectionHeader title={homepage.newInTitle} body={homepage.newInBody} />
      <HomepageCardGrid items={newInItems} />
      <HomepageSectionHeader title={homepage.quickAccessTitle} body={homepage.quickAccessBody} />
      <HomepageCardGrid items={quickAccessItems} />
      <HomepageHelpButtons buttons={helpButtons} />
    </>
  )
}
