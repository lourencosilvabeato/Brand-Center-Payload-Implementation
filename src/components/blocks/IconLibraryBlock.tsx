'use client'

import { useState, useMemo } from 'react'
import type { ContentPage, Media } from '@/payload-types'
import styles from './Blocks.module.css'

type Block = Extract<NonNullable<ContentPage['layout']>[number], { blockType: 'iconLibraryBlock' }>
type IconItem = Block['items'][number]

function IconCard({ item }: { item: IconItem }) {
  const media = item.icon && typeof item.icon !== 'number' ? (item.icon as Media) : null

  return (
    <div className={styles.iconCard}>
      <div className={styles.iconCardImageWrap}>
        {media?.url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={media.url} alt={item.name} />
        )}
      </div>
      <span className={styles.iconCardName}>{item.name}</span>
    </div>
  )
}

export function IconLibraryBlock({ block }: { block: Block }) {
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    block.items.forEach((item) => {
      item.tags?.forEach((t) => tagSet.add(t.tag))
    })
    return Array.from(tagSet).sort()
  }, [block.items])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return block.items.filter((item) => {
      const matchesSearch = !q || item.name.toLowerCase().includes(q)
      const matchesTag =
        !activeTag || (item.tags ?? []).some((t) => t.tag === activeTag)
      return matchesSearch && matchesTag
    })
  }, [block.items, search, activeTag])

  return (
    <div className={styles.iconLibrary}>
      {block.title && <h3 className={styles.iconLibraryTitle}>{block.title}</h3>}

      <div className={styles.iconLibraryControls}>
        <input
          type="search"
          className={styles.iconLibrarySearch}
          placeholder="Search icons…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search icons"
        />

        {allTags.length > 0 && (
          <div className={styles.iconLibraryTags} role="group" aria-label="Filter by tag">
            <button
              type="button"
              className={`${styles.iconLibraryTag} ${!activeTag ? styles.iconLibraryTagActive : ''}`}
              onClick={() => setActiveTag(null)}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`${styles.iconLibraryTag} ${activeTag === tag ? styles.iconLibraryTagActive : ''}`}
                onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className={styles.iconGrid}>
          {filtered.map((item, i) => (
            <IconCard key={item.id ?? i} item={item} />
          ))}
        </div>
      ) : (
        <p className={styles.iconLibraryEmpty}>No icons match your search.</p>
      )}
    </div>
  )
}
