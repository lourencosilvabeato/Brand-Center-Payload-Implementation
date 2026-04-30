import type { ContentPage, Media } from '@/payload-types'
import styles from './Blocks.module.css'

type Block = Extract<NonNullable<ContentPage['layout']>[number], { blockType: 'gridBlock' }>

const colClass: Record<string, string> = {
  '1': styles.gridCols1,
  '2': styles.gridCols2,
  '3': styles.gridCols3,
  '4': styles.gridCols4,
  '6': styles.gridCols6,
}

export function GridBlock({ block }: { block: Block }) {
  const isThumb = block.columns === '6'

  return (
    <div className={`${styles.grid} ${colClass[block.columns] ?? styles.gridCols3}`}>
      {block.items.map((item, i) => {
        const media = item.image && typeof item.image !== 'number' ? (item.image as Media) : null
        const imageWrapClass = `${styles.gridImageWrap} ${isThumb ? styles.gridImageWrapSquare : ''}`

        const inner = (
          <>
            <div className={imageWrapClass}>
              {media?.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={media.url} alt={item.title} />
              )}
            </div>
            <span className={styles.gridTitle}>{item.title}</span>
          </>
        )

        return item.url ? (
          <a key={item.id ?? i} href={item.url} className={styles.gridItem}>
            {inner}
          </a>
        ) : (
          <div key={item.id ?? i} className={styles.gridItem}>
            {inner}
          </div>
        )
      })}
    </div>
  )
}
