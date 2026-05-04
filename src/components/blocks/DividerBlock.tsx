import type { ContentPage } from '@/payload-types'
import styles from './Blocks.module.css'

type Block = Extract<NonNullable<ContentPage['layout']>[number], { blockType: 'dividerBlock' }>

export function DividerBlock({ block }: { block: Block }) {
  return (
    <hr className={`${styles.divider} ${block.variant === 'short' ? styles.dividerShort : styles.dividerLong}`} />
  )
}
