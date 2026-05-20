import type { Navigation, ChannelPage, ContentPage } from '@/payload-types'

export interface NavPageMeta {
  href: string
  breadcrumbText: string
  l1Slug: string
}

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
type NavL3 = NonNullable<NavL2['l3Items']>[number]

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

      if (!l3Seg || !l2.l3Items) return trail

      for (const l3 of l2.l3Items) {
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

      if (!l2.l3Items) return []

      return l2.l3Items.flatMap((item) => {
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

// Builds a slug → NavPageMeta map for all pages in the navigation tree
export function buildNavIndex(items: Navigation['items']): Map<string, NavPageMeta> {
  const map = new Map<string, NavPageMeta>()
  for (const l1 of items ?? []) {
    const l1Slug = getPolySlug(l1.page)
    if (!l1Slug) continue
    map.set(l1Slug, { href: `/${l1Slug}`, breadcrumbText: l1.label, l1Slug })
    for (const l2 of l1.children ?? []) {
      const l2Slug = getPolySlug(l2.page)
      if (!l2Slug) continue
      map.set(l2Slug, {
        href: `/${l1Slug}/${l2Slug}`,
        breadcrumbText: `${l1.label} / ${l2.label}`,
        l1Slug,
      })
      for (const l3 of l2.l3Items ?? []) {
        const l3Slug = getDirectSlug(l3.page)
        if (!l3Slug) continue
        map.set(l3Slug, {
          href: `/${l1Slug}/${l2Slug}/${l3Slug}`,
          breadcrumbText: `${l1.label} / ${l2.label} / ${l3.label}`,
          l1Slug,
        })
      }
    }
  }
  return map
}

// Expands a set of allowed slugs to include all ancestor slugs in the nav tree.
// Allowing an L3 implicitly allows its L2 and L1 ancestors so the user can
// navigate through the full URL path without being blocked by the middleware.
export function expandSlugsWithAncestors(
  slugs: string[],
  items: Navigation['items'],
): string[] {
  if (!items || slugs.length === 0) return slugs
  const set = new Set(slugs)

  for (const l1 of items) {
    const l1Slug = getPolySlug(l1.page)
    for (const l2 of l1.children ?? []) {
      const l2Slug = getPolySlug(l2.page)
      for (const l3 of l2.l3Items ?? []) {
        const l3Slug = getDirectSlug(l3.page)
        if (l3Slug && set.has(l3Slug)) {
          if (l2Slug) set.add(l2Slug)
          if (l1Slug) set.add(l1Slug)
        }
      }
      if (l2Slug && set.has(l2Slug) && l1Slug) {
        set.add(l1Slug)
      }
    }
  }

  return Array.from(set)
}

// Filters nav items to only those accessible for a given set of allowed slugs.
// The allowedSlugs set is expected to already include ancestor slugs (via
// expandSlugsWithAncestors) so parent items are always reachable.
export function filterNavByAllowedSlugs(
  items: Navigation['items'],
  allowedSlugs: string[],
): Navigation['items'] {
  if (!items) return items

  return items.flatMap((l1) => {
    const filteredChildren = (l1.children ?? []).flatMap((l2) => {
      const filteredL3 = (l2.l3Items ?? []).filter((l3) => {
        const slug = getDirectSlug(l3.page)
        // Only include items that have a slug AND that slug is explicitly allowed
        return slug != null && allowedSlugs.includes(slug)
      })

      const l2Slug = getPolySlug(l2.page)
      const l2OwnAllowed = l2Slug != null && allowedSlugs.includes(l2Slug)
      const hasVisibleL3 = filteredL3.length > 0
      if (!l2OwnAllowed && !hasVisibleL3) return []

      return [{ ...l2, l3Items: filteredL3 }]
    })

    const l1Slug = getPolySlug(l1.page)
    const hasOriginalChildren = (l1.children?.length ?? 0) > 0

    if (hasOriginalChildren) {
      if (filteredChildren.length === 0) {
        // All children filtered out — if the L1 page itself is explicitly allowed,
        // show it as a plain leaf link without a mega menu
        if (l1Slug != null && allowedSlugs.includes(l1Slug)) {
          return [{ ...l1, children: [] }]
        }
        return []
      }
      return [{ ...l1, children: filteredChildren }]
    }

    // Leaf L1: only show when its own slug is explicitly allowed
    if (l1Slug != null && allowedSlugs.includes(l1Slug)) {
      return [l1]
    }
    return []
  })
}

// Flat representation of a nav item used by the Role Permissions admin view
export interface PermissionsNavItem {
  label: string
  slug: string | null
  level: 1 | 2 | 3
  canSelect: boolean
}

// Builds a flat ordered list of all nav items for the permissions checkbox tree
export function buildPermissionsNavTree(items: Navigation['items']): PermissionsNavItem[] {
  const result: PermissionsNavItem[] = []
  for (const l1 of items ?? []) {
    const l1Slug = getPolySlug(l1.page)
    result.push({ label: l1.label, slug: l1Slug, level: 1, canSelect: !!l1Slug })
    for (const l2 of l1.children ?? []) {
      const l2Slug = getPolySlug(l2.page)
      result.push({ label: l2.label, slug: l2Slug, level: 2, canSelect: !!l2Slug })
      for (const l3 of l2.l3Items ?? []) {
        const l3Slug = getDirectSlug(l3.page)
        result.push({ label: l3.label, slug: l3Slug, level: 3, canSelect: !!l3Slug })
      }
    }
  }
  return result
}

// Returns label+slug pairs for all L1 nav items — used for search filter tabs
export function getL1NavItems(items: Navigation['items']): Array<{ label: string; slug: string }> {
  return (items ?? []).flatMap((item) => {
    const slug = getPolySlug(item.page)
    return slug ? [{ label: item.label, slug }] : []
  })
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
