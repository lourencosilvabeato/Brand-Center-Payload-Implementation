import { Breadcrumb } from './layout/Breadcrumb'
import { LeftSidebar } from './layout/LeftSidebar'
import { AnchorBar, type AnchorItem } from './layout/AnchorBar'
import { BlockRenderer } from './BlockRenderer'
import type { BreadcrumbItem, SiblingItem } from '@/lib/navigation'
import type { ContentPage } from '@/payload-types'
import styles from './ContentPageLayout.module.css'

interface Props {
  page: ContentPage
  trail: BreadcrumbItem[]
  siblings: SiblingItem[]
  currentHref: string
}

export function ContentPageLayout({ page, trail, siblings, currentHref }: Props) {
  const anchors: AnchorItem[] = (page.anchors ?? []).map((a) => ({
    id: a.anchor,
    label: a.label,
  }))

  const hasBreadcrumb = trail.length > 0
  const hasSidebar = siblings.length > 0

  return (
    <>
      {hasBreadcrumb && (
        <div className={styles.breadcrumbRow}>
          <Breadcrumb trail={trail} />
        </div>
      )}

      <div className={styles.titleRow}>
        <h1 className={styles.title}>{page.title}</h1>
      </div>

      <div className={styles.body}>
        {hasSidebar && (
          <LeftSidebar siblings={siblings} currentHref={currentHref} />
        )}
        <main className={styles.content}>
          <BlockRenderer blocks={page.layout ?? []} />
        </main>
        {anchors.length > 0 && (
          <AnchorBar anchors={anchors} />
        )}
      </div>
    </>
  )
}
