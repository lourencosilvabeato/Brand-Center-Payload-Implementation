import type { ContentPage } from '@/payload-types'
import styles from './Blocks.module.css'

type Block = Extract<NonNullable<ContentPage['layout']>[number], { blockType: 'checkmarksBlock' }>

export function CheckmarksBlock({ block }: { block: Block }) {
  if (!block.items || block.items.length === 0) return null
  return (
    <ul className={styles.checkList}>
      {block.items.map((item, i) => (
        <li key={item.id ?? i} className={styles.checkItem}>
          {item.text}
        </li>
      ))}
    </ul>
  )
}
