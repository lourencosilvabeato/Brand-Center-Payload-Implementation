import type { ContentPage } from '@/payload-types'
import styles from './Blocks.module.css'

type Block = Extract<NonNullable<ContentPage['layout']>[number], { blockType: 'quoteBlock' }>

export function QuoteBlock({ block }: { block: Block }) {
  return (
    <figure className={styles.quoteBlock}>
      <div className={styles.quoteTextRow}>
        <span className={styles.quoteMark} aria-hidden="true">&ldquo;</span>
        <blockquote className={styles.quoteText}>{block.text}</blockquote>
      </div>
      {block.attribution && (
        <figcaption className={styles.quoteAttribution}>{block.attribution}</figcaption>
      )}
      <span className={styles.quoteMarkClose} aria-hidden="true">&rdquo;</span>
    </figure>
  )
}
