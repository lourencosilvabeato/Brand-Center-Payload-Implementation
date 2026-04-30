import type { ContentPage, Media } from '@/payload-types'
import styles from './Blocks.module.css'

type Block = Extract<NonNullable<ContentPage['layout']>[number], { blockType: 'collectionCardBlock' }>

function ArrowUpRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M5.83334 14.1667L14.1667 5.83334M14.1667 5.83334H7.50001M14.1667 5.83334V12.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CollectionCardBlock({ block }: { block: Block }) {
  const media = block.image && typeof block.image !== 'number' ? (block.image as Media) : null

  return (
    <a href={block.link} className={styles.collectionCard}>
      {media?.url && (
        <div className={styles.collectionCardImageWrap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={media.url} alt={block.title} />
        </div>
      )}
      <div className={styles.collectionCardBody}>
        <span className={styles.collectionCardTitle}>{block.title}</span>
        <span className={styles.collectionCardBtn} aria-hidden="true">
          <ArrowUpRightIcon />
        </span>
      </div>
    </a>
  )
}
