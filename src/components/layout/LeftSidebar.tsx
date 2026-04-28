import Link from 'next/link'
import type { SiblingItem } from '@/lib/navigation'
import styles from './LeftSidebar.module.css'

interface LeftSidebarProps {
  siblings: SiblingItem[]
  currentHref: string
}

export function LeftSidebar({ siblings, currentHref }: LeftSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <nav aria-label="Section navigation">
        <ul className={styles.list}>
          {siblings.map((item) => {
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

      <div className={styles.extras}>
        <Link href="/navigation-tips" className={styles.extraLink}>
          Navigation Tips
        </Link>
        <Link href="/faqs" className={styles.extraLink}>
          FAQs
        </Link>
      </div>
    </aside>
  )
}
