import Link from 'next/link'
import type { BreadcrumbItem } from '@/lib/navigation'
import styles from './Breadcrumb.module.css'

interface BreadcrumbProps {
  trail: BreadcrumbItem[]
}

function ChevronRight() {
  return (
    <svg
      className={styles.separator}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 4L10 8L6 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronLeft() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 4L6 8L10 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Breadcrumb({ trail }: BreadcrumbProps) {
  if (trail.length === 0) return null

  // Prepend Home; the trail from buildBreadcrumb() starts at L1
  const allItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/', current: false },
    ...trail,
  ]

  // The item immediately before current — used as mobile back target
  const mobileParent = allItems[allItems.length - 2] as BreadcrumbItem

  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
      {/* Desktop: full trail */}
      <ol className={styles.list}>
        {allItems.map((item, index) => (
          <li key={item.href} className={styles.item}>
            {index > 0 && <ChevronRight />}
            {item.current ? (
              <span className={styles.current} aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className={styles.link}>
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>

      {/* Mobile: single parent back link */}
      <Link href={mobileParent.href} className={styles.mobileBack}>
        <ChevronLeft />
        <span>{mobileParent.label}</span>
      </Link>
    </nav>
  )
}
