import type { ContentPage, Media } from '@/payload-types'
import styles from './Blocks.module.css'

type Block = Extract<NonNullable<ContentPage['layout']>[number], { blockType: 'collectionCardBlock' }>

export function CollectionCardBlock({ block }: { block: Block }) {
  const media = block.image && typeof block.image !== 'number' ? (block.image as Media) : null

  return (
    <a href={block.link} className={styles.collectionCard}>
      {media?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media.url} alt={block.title} className={styles.collectionCardImage} />
      ) : (
        <div className={styles.collectionCardImage} aria-hidden="true" />
      )}
      <span className={styles.collectionCardTitle}>{block.title}</span>
    </a>
  )
}
