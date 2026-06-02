import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import { Breadcrumb } from './layout/Breadcrumb'
import { buildNavIndex } from '@/lib/navigation'
import type { BreadcrumbItem } from '@/lib/navigation'
import type { ChannelPage, Media, Navigation } from '@/payload-types'
import styles from './ChannelPageLayout.module.css'

interface Props {
  page: ChannelPage
  trail: BreadcrumbItem[]
  nav: Navigation
}

function resolveCardHref(
  card: NonNullable<ChannelPage['cards']>[number],
  navIndex: Map<string, { href: string }>,
): string {
  const pageField = card.page
  if (pageField) {
    const pageVal = pageField.value
    if (typeof pageVal !== 'number') {
      const slug = pageVal.slug
      if (slug) {
        const found = navIndex.get(slug)
        if (found) return found.href
        return `/${slug}`
      }
    }
  }
  return card.link ?? '#'
}

export function ChannelPageLayout({ page, trail, nav }: Props) {
  const navIndex = buildNavIndex(nav.items)

  const hasRightColumn =
    page.description != null || (page.buttons != null && page.buttons.length > 0)

  return (
    <>
      {trail.length > 0 && (
        <div className={styles.breadcrumbRow}>
          <Breadcrumb trail={trail} />
        </div>
      )}

      <div className={styles.header}>
        <h1 className={styles.title}>{page.title}</h1>
        {hasRightColumn && (
          <div className={styles.headerRight}>
            {page.description && (
              <div className={styles.description}>
                <RichText data={page.description} />
              </div>
            )}
            {page.buttons && page.buttons.length > 0 && (
              <div className={styles.buttons}>
                {page.buttons.map((btn, i) => (
                  <a key={btn.id ?? i} href={btn.url} className={styles.btn}>
                    {btn.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {page.cards && page.cards.length > 0 && (
        <div className={styles.grid}>
          {page.cards.map((card, i) => {
            const image =
              card.image && typeof card.image !== 'number' ? (card.image as Media) : null
            const href = resolveCardHref(card, navIndex)
            return (
              <a key={card.id ?? i} href={href} className={styles.card}>
                <div className={styles.cardDetails}>
                  <div className={styles.cardText}>
                    <span className={styles.cardTitle}>{card.title}</span>
                    {card.excerpt && (
                      <span className={styles.cardSubtitle}>{card.excerpt}</span>
                    )}
                  </div>
                </div>
                <div className={styles.cardImage}>
                  {image?.url && (
                    <Image
                      src={image.url}
                      alt={image.alt ?? card.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 310px"
                      style={{ objectFit: 'cover' }}
                    />
                  )}
                </div>
                <div className={styles.cardArrow} aria-hidden="true">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M5.833 14.167L14.167 5.833M14.167 5.833H7.5M14.167 5.833V12.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </a>
            )
          })}
        </div>
      )}
    </>
  )
}
