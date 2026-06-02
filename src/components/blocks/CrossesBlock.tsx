import type { ContentPage } from '@/payload-types'
import styles from './Blocks.module.css'

type Block = Extract<NonNullable<ContentPage['layout']>[number], { blockType: 'crossesBlock' }>

export function CrossesBlock({ block }: { block: Block }) {
  if (!block.items || block.items.length === 0) return null
  return (
    <ul className={styles.crossList}>
      {block.items.map((item, i) => (
        <li key={item.id ?? i} className={styles.crossItem}>
          {item.text}
        </li>
      ))}
    </ul>
  )
}
