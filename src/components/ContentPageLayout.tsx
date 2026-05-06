import { RichText } from '@payloadcms/richtext-lexical/react'
import { Breadcrumb } from './layout/Breadcrumb'
import { LeftSidebar } from './layout/LeftSidebar'
import { AnchorBar, type AnchorItem } from './layout/AnchorBar'
import { SiblingNav } from './layout/SiblingNav'
import { BlockRenderer } from './BlockRenderer'
import { getSectionAnchorId } from './blocks/SectionBlock'
import { findPrevNext } from '@/lib/navigation'
import type { BreadcrumbItem, SiblingItem } from '@/lib/navigation'
import type { ContentPage, ProtectedFile } from '@/payload-types'
import styles from './ContentPageLayout.module.css'

interface Props {
  page: ContentPage
  trail: BreadcrumbItem[]
  siblings: SiblingItem[]
  currentHref: string
}

export function ContentPageLayout({ page, trail, siblings, currentHref }: Props) {
  const sectionAnchors: AnchorItem[] = (page.layout ?? [])
    .filter(
      (b): b is Extract<typeof b, { blockType: 'sectionBlock' }> => b.blockType === 'sectionBlock',
    )
    .map((b) => ({ id: getSectionAnchorId(b), label: b.title }))

  const anchors: AnchorItem[] = [
    ...(page.headerAnchorName ? [{ id: page.headerAnchorName, label: page.title }] : []),
    ...sectionAnchors.filter((a) => Boolean(a.id)),
  ]

  const { prev, next } = findPrevNext(siblings, currentHref)

  const hasBreadcrumb = trail.length > 0
  const hasSidebar = siblings.length > 0

  return (
    <>
      {hasBreadcrumb && (
        <div className={styles.breadcrumbRow}>
          <Breadcrumb trail={trail} />
        </div>
      )}

      <div className={styles.body}>
        {hasSidebar && <LeftSidebar siblings={siblings} currentHref={currentHref} />}
        <main className={styles.content}>
          <div
            className={styles.titleRow}
            {...(page.headerAnchorName ? { id: page.headerAnchorName } : {})}
          >
            <h1 className={styles.title}>{page.title}</h1>
            {page.excerpt && (
              <div className={styles.excerpt}>
                <RichText data={page.excerpt} />
              </div>
            )}
            {page.buttons && page.buttons.length > 0 && (
              <div className={styles.headerButtons}>
                {page.buttons.map((btn, i) => {
                  const fileId =
                    btn.file && typeof btn.file !== 'number'
                      ? (btn.file as ProtectedFile).id
                      : typeof btn.file === 'number'
                        ? btn.file
                        : null
                  const href = btn.url ?? (fileId ? `/api/download/${fileId}` : '#')
                  return (
                    <a key={btn.id ?? i} href={href} className={styles.headerBtn}>
                      {btn.label}
                    </a>
                  )
                })}
              </div>
            )}
          </div>
          <BlockRenderer blocks={page.layout ?? []} />
          {hasSidebar && (prev || next) && <SiblingNav prev={prev} next={next} />}
        </main>
        {anchors.length > 0 && <AnchorBar anchors={anchors} />}
      </div>
    </>
  )
}
