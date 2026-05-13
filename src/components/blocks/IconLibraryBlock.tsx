'use client'

import { useState, useMemo } from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { ContentPage, Media, ProtectedFile } from '@/payload-types'
import styles from './Blocks.module.css'

type Block = Extract<NonNullable<ContentPage['layout']>[number], { blockType: 'iconLibraryBlock' }>
type IconItem = Block['items'][number]

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 1.5V9M7 9L4.5 6.5M7 9L9.5 6.5M1.5 11H12.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconCard({ item }: { item: IconItem }) {
  const media = item.icon && typeof item.icon !== 'number' ? (item.icon as Media) : null
  const fileId =
    item.iconFile && typeof item.iconFile !== 'number'
      ? (item.iconFile as ProtectedFile).id
      : typeof item.iconFile === 'number'
        ? item.iconFile
        : null

  return (
    <div className={styles.iconCard}>
      <div className={styles.iconCardImageWrap}>
        {media?.url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={media.url} alt={item.name} />
        )}
      </div>
      <span className={styles.iconCardName}>{item.name}</span>
      {fileId && (
        <a
          href={`/api/download/${fileId}`}
          className={styles.iconCardDownload}
          aria-label={`Download ${item.name}`}
        >
          <DownloadIcon />
        </a>
      )}
    </div>
  )
}

export function IconLibraryBlock({ block }: { block: Block }) {
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const downloadFileId =
    block.downloadFile && typeof block.downloadFile !== 'number'
      ? (block.downloadFile as ProtectedFile).id
      : typeof block.downloadFile === 'number'
        ? block.downloadFile
        : null

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
      const matchesTag = !activeTag || (item.tags ?? []).some((t) => t.tag === activeTag)
      return matchesSearch && matchesTag
    })
  }, [block.items, search, activeTag])

  return (
    <div className={styles.iconLibrary}>
      {block.title && <h3 className={styles.iconLibraryTitle}>{block.title}</h3>}

      {block.description && (
        <div className={styles.iconLibraryDescription}>
          <RichText data={block.description} />
        </div>
      )}

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

      {downloadFileId && (
        <div className={styles.iconLibraryFooter}>
          <a href={`/api/download/${downloadFileId}`} className={styles.iconLibraryDownloadAll}>
            <DownloadIcon />
            <span>Download all</span>
          </a>
        </div>
      )}
    </div>
  )
}
