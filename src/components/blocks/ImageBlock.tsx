import type { ContentPage, Media } from '@/payload-types'
import styles from './Blocks.module.css'

type Block = Extract<NonNullable<ContentPage['layout']>[number], { blockType: 'imageBlock' }>

export function ImageBlock({ block }: { block: Block }) {
  const media = typeof block.image !== 'number' ? (block.image as Media) : null
  const src = media?.url ?? null
  const alt = block.alt ?? media?.filename ?? ''

  if (!src) return null

  return (
    <figure className={styles.imageBlock}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} />
      {block.caption && (
        <figcaption className={styles.imageCaption}>{block.caption}</figcaption>
      )}
    </figure>
  )
}
