import type { Navigation, ChannelPage, ContentPage } from '@/payload-types'

export interface BreadcrumbItem {
  label: string
  href: string
  current: boolean
}

export interface SiblingItem {
  label: string
  href: string
  id: string
}

type NavL1 = NonNullable<Navigation['items']>[number]
type NavL2 = NonNullable<NavL1['children']>[number]
type NavL3 = NonNullable<NavL2['children']>[number]

function getPolySlug(
  page: NavL1['page'] | NavL2['page'],
): string | null {
  if (!page) return null
  const val = page.value
  if (typeof val === 'number') return null
  return (val as ChannelPage | ContentPage).slug ?? null
}

function getDirectSlug(page: NavL3['page']): string | null {
  if (!page || typeof page === 'number') return null
  return (page as ContentPage).slug ?? null
}

function href(...slugs: string[]): string {
  return '/' + slugs.join('/')
}

export function buildBreadcrumb(
  items: Navigation['items'],
  pathSegments: string[],
): BreadcrumbItem[] {
  if (!items || pathSegments.length === 0) return []

  const [l1Seg, l2Seg, l3Seg] = pathSegments

  for (const l1 of items) {
    const l1Slug = getPolySlug(l1.page)
    if (!l1Slug || l1Slug !== l1Seg) continue

    const trail: BreadcrumbItem[] = [
      { label: l1.label, href: href(l1Slug), current: pathSegments.length === 1 },
    ]

    if (!l2Seg || !l1.children) return trail

    for (const l2 of l1.children) {
      const l2Slug = getPolySlug(l2.page)
      if (!l2Slug || l2Slug !== l2Seg) continue

      trail.push({
        label: l2.label,
        href: href(l1Slug, l2Slug),
        current: pathSegments.length === 2,
      })

      if (!l3Seg || !l2.children) return trail

      for (const l3 of l2.children) {
        const l3Slug = getDirectSlug(l3.page)
        if (!l3Slug || l3Slug !== l3Seg) continue

        trail.push({
          label: l3.label,
          href: href(l1Slug, l2Slug, l3Slug),
          current: true,
        })

        return trail
      }

      return trail
    }

    return trail
  }

  return []
}

export function findSiblings(
  items: Navigation['items'],
  pathSegments: string[],
): SiblingItem[] {
  if (!items || pathSegments.length === 0) return []

  const [l1Seg, l2Seg, l3Seg] = pathSegments

  for (const l1 of items) {
    const l1Slug = getPolySlug(l1.page)
    if (!l1Slug || l1Slug !== l1Seg) continue

    if (pathSegments.length === 1) {
      return items.flatMap((item) => {
        const slug = getPolySlug(item.page)
        return slug ? [{ label: item.label, href: href(slug), id: item.id ?? '' }] : []
      })
    }

    if (!l1.children) return []

    for (const l2 of l1.children) {
      const l2Slug = getPolySlug(l2.page)
      if (!l2Slug || l2Slug !== l2Seg) continue

      if (pathSegments.length === 2) {
        return l1.children.flatMap((item) => {
          const slug = getPolySlug(item.page)
          return slug ? [{ label: item.label, href: href(l1Slug, slug), id: item.id ?? '' }] : []
        })
      }

      if (!l2.children) return []

      return l2.children.flatMap((item) => {
        const slug = getDirectSlug(item.page)
        return slug
          ? [{ label: item.label, href: href(l1Slug, l2Slug, slug), id: item.id ?? '' }]
          : []
      })
    }
  }

  return []
}

export function findPrevNext(
  siblings: SiblingItem[],
  currentHref: string,
): { prev: SiblingItem | null; next: SiblingItem | null } {
  const idx = siblings.findIndex((s) => s.href === currentHref)
  if (idx === -1) return { prev: null, next: null }
  return {
    prev: idx > 0 ? (siblings[idx - 1] ?? null) : null,
    next: idx < siblings.length - 1 ? (siblings[idx + 1] ?? null) : null,
  }
}

// Extracts L2 items for a given active L1 slug — used by mega-menu
export function getL2ForL1(
  items: Navigation['items'],
  l1Slug: string,
): NavL2[] {
  if (!items) return []
  const l1 = items.find((item) => getPolySlug(item.page) === l1Slug)
  return l1?.children ?? []
}
