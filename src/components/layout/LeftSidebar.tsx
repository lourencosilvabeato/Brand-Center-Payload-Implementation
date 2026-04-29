import Link from 'next/link'
import type { SiblingItem } from '@/lib/navigation'
import { SidebarSearch } from './SidebarSearch'
import styles from './LeftSidebar.module.css'

interface LeftSidebarProps {
  siblings: SiblingItem[]
  currentHref: string
}

export function LeftSidebar({ siblings, currentHref }: LeftSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <SidebarSearch siblings={siblings} currentHref={currentHref} />
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
