import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPayload } from '@/lib/payload'
import type { ContentPage, Media, ProtectedFile } from '@/payload-types'
import { CollectionDetailViewer } from './CollectionDetailViewer'
import type { AssetMeta } from './CollectionDetailViewer'
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

  // Pre-render sidebar description server-side
  const sidebarDescription = block.description ? (
    <RichText data={block.description} className={styles.sidebarDescription} />
  ) : null

  // Build asset metadata + pre-render per-asset descriptions server-side
  const assets: AssetMeta[] = (block.assets ?? []).map((asset, i) => {
    const media = asset.image && typeof asset.image !== 'number' ? (asset.image as Media) : null
    return {
      id: asset.id ?? String(i),
      imageUrl: media?.url ?? null,
      imageWidth: media?.width ?? null,
      imageHeight: media?.height ?? null,
      imageAlt: media?.alt ?? '',
      downloadUrl: media?.url ?? null,
    }
  })

  const assetDescriptions = (block.assets ?? []).map((asset, i) =>
    asset.assetDescription ? (
      <RichText key={i} data={asset.assetDescription} className={styles.assetDescription} />
    ) : null,
  )

  return (
    <CollectionDetailViewer
      title={block.title}
      label={block.label ?? null}
      sidebarDescription={sidebarDescription}
      assetDescriptions={assetDescriptions}
      downloadFileId={downloadFileId}
      assets={assets}
    />
  )
}
