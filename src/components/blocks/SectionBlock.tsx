import { RichText } from '@payloadcms/richtext-lexical/react'
import type { ContentPage, ProtectedFile } from '@/payload-types'
import styles from './Blocks.module.css'

type Block = Extract<NonNullable<ContentPage['layout']>[number], { blockType: 'sectionBlock' }>

export function getSectionAnchorId(block: Block): string {
  if (block.anchorName) return block.anchorName
  return block.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function SectionBlock({ block }: { block: Block }) {
  const anchorId = getSectionAnchorId(block)

  return (
    <section id={anchorId} className={styles.sectionBlock}>
      {block.label && <p className={styles.sectionLabel}>{block.label}</p>}
      <h2 className={styles.sectionTitle}>{block.title}</h2>

      {block.buttons && block.buttons.length > 0 && (
        <div className={styles.sectionButtons}>
          {block.buttons.map((btn, i) => {
            const fileId =
              btn.file && typeof btn.file !== 'number'
                ? (btn.file as ProtectedFile).id
                : typeof btn.file === 'number'
                  ? btn.file
                  : null
            const href = btn.url ?? (fileId ? `/api/download/${fileId}` : '#')
            return (
              <a key={btn.id ?? i} href={href} className={styles.sectionBtn}>
                {btn.label}
              </a>
            )
          })}
        </div>
      )}

      {block.body && (
        <div className={styles.sectionBody}>
          <RichText data={block.body} />
        </div>
      )}
    </section>
  )
}
