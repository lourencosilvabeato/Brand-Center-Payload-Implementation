import type { ContentPage, Media, ProtectedFile } from '@/payload-types'
import styles from './Blocks.module.css'

type Block = Extract<NonNullable<ContentPage['layout']>[number], { blockType: 'collectionCardBlock' }>

function DownloadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 3V13M10 13L6.5 9.5M10 13L13.5 9.5M3.5 15.5H16.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ArrowUpRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M5.5 14.5L14.5 5.5M14.5 5.5H7.5M14.5 5.5V12.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CollectionCardBlock({ block }: { block: Block }) {
  const downloadFileId =
    block.downloadFile && typeof block.downloadFile !== 'number'
      ? (block.downloadFile as ProtectedFile).id
      : typeof block.downloadFile === 'number'
        ? block.downloadFile
        : null

  const detailHref = block.slug
    ? `/collection/${block.slug}`
    : block.detailHref ?? null

  return (
    <div className={styles.collectionCard}>
      {block.assets && block.assets.length > 0 && (
        <div className={styles.collectionCardImages}>
          {block.assets.map((asset, i) => {
            const media =
              asset.image && typeof asset.image !== 'number' ? (asset.image as Media) : null
            return (
              <div key={asset.id ?? i} className={styles.collectionCardThumb}>
                {media?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={media.url} alt={media.alt ?? ''} />
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className={styles.collectionCardInfo}>
        <h3 className={styles.collectionCardTitle}>{block.title}</h3>
        <div className={styles.collectionCardDetails}>
          <div className={styles.collectionCardMeta}>
            {block.label && (
              <span className={styles.collectionCardLabel}>{block.label}</span>
            )}
            <span className={styles.collectionCardChip}>
              {block.assets?.length ?? 0} assets
            </span>
          </div>
          <div className={styles.collectionCardActions}>
            {downloadFileId && (
              <a
                href={`/api/download/${downloadFileId}`}
                className={styles.collectionCardIconBtn}
                aria-label="Download collection"
              >
                <DownloadIcon />
              </a>
            )}
            {detailHref && (
              <a
                href={detailHref}
                className={styles.collectionCardIconBtn}
                aria-label="View collection detail"
              >
                <ArrowUpRightIcon />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
