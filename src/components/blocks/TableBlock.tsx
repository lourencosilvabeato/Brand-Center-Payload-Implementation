import type { ContentPage } from '@/payload-types'
import styles from './Blocks.module.css'

type Block = Extract<NonNullable<ContentPage['layout']>[number], { blockType: 'tableBlock' }>

export function TableBlock({ block }: { block: Block }) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <tbody>
          {block.rows.map((row, ri) => (
            <tr key={row.id ?? ri}>
              {row.cells.map((cell, ci) => {
                const Tag = cell.isHeader ? 'th' : 'td'
                return (
                  <Tag key={cell.id ?? ci} scope={cell.isHeader ? 'col' : undefined}>
                    {cell.content ?? ''}
                  </Tag>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
