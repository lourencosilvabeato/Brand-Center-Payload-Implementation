import type { ContentPage } from '@/payload-types'
import styles from './Blocks.module.css'

type Block = Extract<NonNullable<ContentPage['layout']>[number], { blockType: 'sectionBlock' }>

export function SectionBlock({ block }: { block: Block }) {
  return (
    <section id={block.anchorName} className={styles.sectionBlock}>
      <h2 className={styles.sectionTitle}>{block.label}</h2>
    </section>
  )
}
