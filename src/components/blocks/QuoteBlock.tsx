import type { ContentPage } from '@/payload-types'
import styles from './Blocks.module.css'

type Block = Extract<NonNullable<ContentPage['layout']>[number], { blockType: 'quoteBlock' }>

export function QuoteBlock({ block }: { block: Block }) {
  return (
    <blockquote className={styles.quoteBlock}>
      <p className={styles.quoteText}>{block.text}</p>
      {block.attribution && (
        <cite className={styles.quoteAttribution}>{block.attribution}</cite>
      )}
    </blockquote>
  )
}
