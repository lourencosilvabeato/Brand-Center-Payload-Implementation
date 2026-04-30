import type { ContentPage, ProtectedFile } from '@/payload-types'
import styles from './Blocks.module.css'

type Block = Extract<NonNullable<ContentPage['layout']>[number], { blockType: 'downloadBlock' }>

export function DownloadBlock({ block }: { block: Block }) {
  const file = typeof block.file !== 'number' ? (block.file as ProtectedFile) : null
  const href = file?.url ?? '#'

  return (
    <a
      href={href}
      className={styles.downloadBlock}
      download={file?.filename ?? true}
      target="_blank"
      rel="noreferrer"
    >
      <svg className={styles.downloadIcon} viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M3.75 13.75V15.625C3.75 16.3154 4.30964 16.875 5 16.875H15C15.6904 16.875 16.25 16.3154 16.25 15.625V13.75"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 3.125V12.5 M6.25 9.375L10 13.125L13.75 9.375"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={styles.downloadLabel}>{block.label}</span>
    </a>
  )
}
