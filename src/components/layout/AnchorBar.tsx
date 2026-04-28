'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './AnchorBar.module.css'

export interface AnchorItem {
  id: string
  label: string
}

interface AnchorBarProps {
  anchors: AnchorItem[]
}

export function AnchorBar({ anchors }: AnchorBarProps) {
  const [activeId, setActiveId] = useState<string>(anchors[0]?.id ?? '')
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (anchors.length === 0) return

    const headings = anchors
      .map((a) => document.getElementById(a.id))
      .filter(Boolean) as HTMLElement[]

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting)
        if (visible) setActiveId(visible.target.id)
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 },
    )

    headings.forEach((el) => observerRef.current!.observe(el))

    return () => observerRef.current?.disconnect()
  }, [anchors])

  if (anchors.length === 0) return null

  return (
    <aside className={styles.bar}>
      <nav aria-label="Page sections">
        <ul className={styles.list}>
          {anchors.map((anchor) => (
            <li key={anchor.id}>
              <a
                href={`#${anchor.id}`}
                className={`${styles.link} ${activeId === anchor.id ? styles.active : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(anchor.id)?.scrollIntoView({ behavior: 'smooth' })
                  setActiveId(anchor.id)
                }}
              >
                {anchor.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
