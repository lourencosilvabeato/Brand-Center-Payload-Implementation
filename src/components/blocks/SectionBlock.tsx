import { RichText } from '@payloadcms/richtext-lexical/react'
import type { ContentPage, ProtectedFile } from '@/payload-types'
import styles from './Blocks.module.css'
import richTextStyles from './RichText.module.css'

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
      {/* Left column: label + title */}
      <div className={styles.sectionLeft}>
        {block.label && <p className={styles.sectionLabel}>{block.label}</p>}
        <h2 className={styles.sectionTitle}>{block.title}</h2>
      </div>

      {/* Right column: body + buttons */}
      <div className={styles.sectionRight}>
        {block.body && (
          <RichText data={block.body} className={richTextStyles.richText} />
        )}
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
      </div>
    </section>
  )
}
