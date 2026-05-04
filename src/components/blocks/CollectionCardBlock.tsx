import { RichText } from '@payloadcms/richtext-lexical/react'
import type { ContentPage, Media, ProtectedFile } from '@/payload-types'
import styles from './Blocks.module.css'

type Block = Extract<NonNullable<ContentPage['layout']>[number], { blockType: 'collectionCardBlock' }>

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2V10M8 10L5 7M8 10L11 7M2 12H14"
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

  const isLarge = block.cardModel === 'large'

  return (
    <div className={styles.collectionCard}>
      <div className={styles.collectionCardHeader}>
        {block.label && <p className={styles.collectionCardLabel}>{block.label}</p>}
        <h3 className={styles.collectionCardTitle}>{block.title}</h3>
        {block.description && (
          <div className={styles.collectionCardDescription}>
            <RichText data={block.description} />
          </div>
        )}
      </div>

      {block.assets && block.assets.length > 0 && (
        <div
          className={`${styles.collectionCardAssets} ${isLarge ? styles.collectionCardAssetsLarge : styles.collectionCardAssetsSmall}`}
        >
          {block.assets.map((asset, i) => {
            const media =
              asset.image && typeof asset.image !== 'number' ? (asset.image as Media) : null
            return (
              <div key={asset.id ?? i} className={styles.collectionAssetItem}>
                {media?.url && (
                  <div className={styles.collectionAssetImageWrap}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={media.url} alt={media.alt ?? ''} />
                  </div>
                )}
                {asset.description && (
                  <div className={styles.collectionAssetDescription}>
                    <RichText data={asset.description} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {downloadFileId && (
        <div className={styles.collectionCardFooter}>
          <a
            href={`/api/download/${downloadFileId}`}
            className={styles.collectionCardDownload}
          >
            <DownloadIcon />
            <span>Download collection</span>
          </a>
        </div>
      )}
    </div>
  )
}
