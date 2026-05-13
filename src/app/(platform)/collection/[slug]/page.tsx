import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPayload } from '@/lib/payload'
import type { ContentPage, Media, ProtectedFile } from '@/payload-types'
import styles from './CollectionDetail.module.css'

type CollectionBlock = Extract<
  NonNullable<ContentPage['layout']>[number],
  { blockType: 'collectionCardBlock' }
>

interface Props {
  params: Promise<{ slug: string }>
}

async function findCollectionBlock(slug: string): Promise<CollectionBlock | null> {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'contentPages',
    depth: 2,
    limit: 500,
    pagination: false,
  })

  for (const page of result.docs) {
    const layout = page.layout ?? []
    for (const block of layout) {
      if (block.blockType === 'collectionCardBlock' && (block as CollectionBlock).slug === slug) {
        return block as CollectionBlock
      }
    }
  }
  return null
}

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

export default async function CollectionDetailPage({ params }: Props) {
  const { slug } = await params
  const block = await findCollectionBlock(slug)

  if (!block) notFound()

  const downloadFileId =
    block.downloadFile && typeof block.downloadFile !== 'number'
      ? (block.downloadFile as ProtectedFile).id
      : typeof block.downloadFile === 'number'
        ? block.downloadFile
        : null

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{block.title}</h1>
        {block.description && (
          <RichText data={block.description} className={styles.description} />
        )}
      </div>

      {block.assets && block.assets.length > 0 && (
        <div className={styles.assetGrid}>
          {block.assets.map((asset, i) => {
            const media =
              asset.image && typeof asset.image !== 'number' ? (asset.image as Media) : null

            return (
              <div key={asset.id ?? i} className={styles.assetItem}>
                <div className={styles.assetThumb}>
                  {media?.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={media.url} alt={media.alt ?? ''} />
                  )}
                </div>
                {asset.assetDescription && (
                  <RichText
                    data={asset.assetDescription}
                    className={styles.assetDescription}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

      {downloadFileId && <div className={styles.downloadSpacer} />}

      {downloadFileId && (
        <div className={styles.downloadBar}>
          <a
            href={`/api/download/${downloadFileId}`}
            className={styles.downloadBtn}
            download
          >
            <DownloadIcon />
            Download collection
          </a>
        </div>
      )}
    </div>
  )
}
