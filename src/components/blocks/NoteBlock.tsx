import { RichText } from '@payloadcms/richtext-lexical/react'
import type { ContentPage } from '@/payload-types'
import styles from './Blocks.module.css'

type Block = Extract<NonNullable<ContentPage['layout']>[number], { blockType: 'noteBlock' }>

export function NoteBlock({ block }: { block: Block }) {
  const isWarning = block.type === 'warning'

  return (
    <div className={`${styles.noteBlock} ${isWarning ? styles.noteWarning : styles.noteInfo}`}>
      {block.title && (
        <p className={styles.noteTitle}>
          <strong className={styles.noteBold}>{block.title}</strong>
        </p>
      )}
      <RichText data={block.content} className={styles.noteContent} />
    </div>
  )
}
