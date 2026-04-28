'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import type { Navigation, ChannelPage, ContentPage } from '@/payload-types'
import styles from './MegaMenu.module.css'

type NavL1 = NonNullable<Navigation['items']>[number]
type NavL2 = NonNullable<NavL1['children']>[number]

function getPolySlug(page: NavL1['page'] | NavL2['page']): string | null {
  if (!page) return null
  const val = page.value
  if (typeof val === 'number') return null
  return (val as ChannelPage | ContentPage).slug ?? null
}

function getDirectSlug(page: NonNullable<NavL2['children']>[number]['page']): string | null {
  if (!page || typeof page === 'number') return null
  return (page as ContentPage).slug ?? null
}

interface MegaMenuProps {
  l1Item: NavL1
  l1Slug: string
  onClose: () => void
  onMouseLeave: () => void
}

const MAX_LINES_PER_COL = 8

function buildColumns(l2Items: NavL2[]): NavL2[][] {
  const columns: NavL2[][] = []
  let currentCol: NavL2[] = []
  let currentLines = 0

  for (const item of l2Items) {
    const groupLines = 1 + (item.children?.length ?? 0)
    if (currentLines + groupLines > MAX_LINES_PER_COL && currentCol.length > 0) {
      columns.push(currentCol)
      currentCol = []
      currentLines = 0
    }
    currentCol.push(item)
    currentLines += groupLines
  }
  if (currentCol.length > 0) columns.push(currentCol)

  return columns
}

export function MegaMenu({ l1Item, l1Slug, onClose, onMouseLeave }: MegaMenuProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const columns = buildColumns(l1Item.children ?? [])

  if (columns.length === 0) return null

  return (
    <div
      className={styles.overlay}
      onMouseLeave={onMouseLeave}
      role="region"
      aria-label="Navigation menu"
    >
      <div className={styles.inner}>
        {columns.map((col, colIdx) => (
          <div key={colIdx} className={styles.column}>
            {col.map((l2) => {
              const l2Slug = getPolySlug(l2.page)
              const l2Href = l2Slug ? `/${l1Slug}/${l2Slug}` : undefined

              return (
                <div key={l2.id ?? l2.label} className={styles.group}>
                  <div className={styles.l2Title}>
                    {l2Href ? (
                      <Link href={l2Href} className={styles.l2Link} onClick={onClose}>
                        {l2.label}
                      </Link>
                    ) : (
                      <span className={styles.l2Label}>{l2.label}</span>
                    )}
                  </div>

                  {l2.children && l2.children.length > 0 && (
                    <ul className={styles.l3List}>
                      {l2.children.map((l3) => {
                        const l3Slug = getDirectSlug(l3.page)
                        const l3Href = l3Slug ? `/${l1Slug}/${l2Slug}/${l3Slug}` : undefined

                        return (
                          <li key={l3.id ?? l3.label}>
                            {l3Href ? (
                              <Link href={l3Href} className={styles.l3Link} onClick={onClose}>
                                {l3.label}
                              </Link>
                            ) : (
                              <span className={styles.l3Text}>{l3.label}</span>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
