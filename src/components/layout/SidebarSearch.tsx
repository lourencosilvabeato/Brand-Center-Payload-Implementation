'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { SiblingItem } from '@/lib/navigation'
import styles from './LeftSidebar.module.css'

interface SidebarSearchProps {
  siblings: SiblingItem[]
  currentHref: string
}

export function SidebarSearch({ siblings, currentHref }: SidebarSearchProps) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? siblings.filter((s) => s.label.toLowerCase().includes(query.toLowerCase()))
    : siblings

  return (
    <>
      <div className={styles.searchSection}>
        <div className={styles.searchInputWrapper}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Filter navigation"
          />
          {query && (
            <button
              type="button"
              className={styles.searchClear}
              onClick={() => setQuery('')}
              aria-label="Clear"
            >
              <CloseIcon />
            </button>
          )}
        </div>
      </div>

      <nav aria-label="Section navigation">
        <ul className={styles.list}>
          {filtered.map((item) => {
            const isActive = item.href === currentHref
            return (
              <li key={item.id || item.href}>
                <Link
                  href={item.href}
                  className={`${styles.item} ${isActive ? styles.active : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
