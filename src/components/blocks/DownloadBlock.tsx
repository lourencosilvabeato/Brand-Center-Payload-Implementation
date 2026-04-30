import type { ContentPage, ProtectedFile } from '@/payload-types'
import styles from './Blocks.module.css'

type Block = Extract<NonNullable<ContentPage['layout']>[number], { blockType: 'downloadBlock' }>

function DownloadIcon() {
  return (
    <svg className={styles.downloadIcon} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3.33334 13.3333V15C3.33334 15.4420 3.50893 15.8659 3.82150 16.1785C4.13406 16.4911 4.55798 16.6667 5.00001 16.6667H15C15.442 16.6667 15.866 16.4911 16.1785 16.1785C16.4911 15.8659 16.6667 15.4420 16.6667 15V13.3333"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 3.33334V12.5M6.66667 9.16667L10 12.5L13.3333 9.16667"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function DownloadBlock({ block }: { block: Block }) {
  const file = typeof block.file !== 'number' ? (block.file as ProtectedFile) : null
  const fileId = file?.id ?? (typeof block.file === 'number' ? block.file : null)
  const href = fileId ? `/api/download/${fileId}` : '#'

  return (
    <a
      href={href}
      className={styles.downloadBlock}
      download
    >
      <DownloadIcon />
      <span className={styles.downloadLabel}>{block.label}</span>
    </a>
  )
}
