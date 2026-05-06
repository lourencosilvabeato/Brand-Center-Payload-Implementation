import type { ContentPage } from '@/payload-types'
import styles from './Blocks.module.css'

type Block = Extract<NonNullable<ContentPage['layout']>[number], { blockType: 'noteBlock' }>

export function NoteBlock({ block }: { block: Block }) {
  const isWarning = block.type === 'warning'

  return (
    <div className={`${styles.noteBlock} ${isWarning ? styles.noteWarning : styles.noteInfo}`}>
      <svg className={styles.noteIcon} viewBox="0 0 20 20" fill="none" aria-hidden="true">
        {isWarning ? (
          <path
            d="M10 2.5L1.25 17.5H18.75L10 2.5Z M10 8.75V11.25 M10 13.75V14.375"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M10 18.75C14.8325 18.75 18.75 14.8325 18.75 10C18.75 5.1675 14.8325 1.25 10 1.25C5.1675 1.25 1.25 5.1675 1.25 10C1.25 14.8325 5.1675 18.75 10 18.75Z M10 9.375V13.75 M10 6.25V6.875"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
      <p className={styles.noteText}>{block.text}</p>
    </div>
  )
}
