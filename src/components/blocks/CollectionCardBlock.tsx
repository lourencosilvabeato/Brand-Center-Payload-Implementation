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
  const media =
    block.thumbnail && typeof block.thumbnail !== 'number' ? (block.thumbnail as Media) : null

  return (
    <div className={styles.collectionCard}>
      {media?.url && (
        <div className={styles.collectionCardImageWrap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={media.url} alt={block.title} />
        </div>
      )}

      <div className={styles.collectionCardBody}>
        <h3 className={styles.collectionCardTitle}>{block.title}</h3>
        {block.description && (
          <RichText data={block.description} className={styles.collectionCardDescription} />
        )}
      </div>

      {block.assets && block.assets.length > 0 && (
        <ul className={styles.collectionCardAssets}>
          {block.assets.map((asset, i) => {
            const fileId =
              asset.file && typeof asset.file !== 'number'
                ? (asset.file as ProtectedFile).id
                : typeof asset.file === 'number'
                  ? asset.file
                  : null

            return (
              <li key={asset.id ?? i}>
                <a
                  href={fileId ? `/api/download/${fileId}` : '#'}
                  className={styles.collectionCardAssetLink}
                >
                  <DownloadIcon />
                  <span>{asset.label}</span>
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
