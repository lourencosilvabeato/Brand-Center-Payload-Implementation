import Link from 'next/link'
import type { SiblingItem } from '@/lib/navigation'
import styles from './SiblingNav.module.css'

interface SiblingNavProps {
  prev: SiblingItem | null
  next: SiblingItem | null
}

export function SiblingNav({ prev, next }: SiblingNavProps) {
  if (!prev && !next) return null

  return (
    <nav className={styles.nav} aria-label="Sibling navigation">
      <div className={styles.inner}>
        {prev ? (
          <Link href={prev.href} className={`${styles.btn} ${styles.prev}`}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{prev.label}</span>
          </Link>
        ) : (
          <span />
        )}

        {next ? (
          <Link href={next.href} className={`${styles.btn} ${styles.next}`}>
            <span>{next.label}</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M7.5 15L12.5 10L7.5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        ) : (
          <span />
        )}
      </div>
    </nav>
  )
}
