import type { ContentPage } from '@/payload-types'
import styles from './Blocks.module.css'

type Block = Extract<NonNullable<ContentPage['layout']>[number], { blockType: 'noteBlock' }>

export function NoteBlock({ block }: { block: Block }) {
  const isWarning = block.type === 'warning'
  const prefix = isWarning ? 'Warning' : 'Note'

  return (
    <div className={`${styles.noteBlock} ${isWarning ? styles.noteWarning : styles.noteInfo}`}>
      <p className={styles.noteText}>
        <strong className={styles.noteBold}>{prefix}:</strong> {block.text}
      </p>
    </div>
  )
}
