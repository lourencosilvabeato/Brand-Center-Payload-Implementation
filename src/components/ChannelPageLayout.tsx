import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import { Breadcrumb } from './layout/Breadcrumb'
import type { BreadcrumbItem } from '@/lib/navigation'
import type { ChannelPage, Media } from '@/payload-types'
import styles from './ChannelPageLayout.module.css'

interface Props {
  page: ChannelPage
  trail: BreadcrumbItem[]
}

export function ChannelPageLayout({ page, trail }: Props) {
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
            return (
              <a key={card.id ?? i} href={card.link} className={styles.card}>
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
