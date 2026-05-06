import Link from 'next/link'
import Image from 'next/image'
import styles from './HomepageCardGrid.module.css'

export interface HomepageCardItem {
  id: string
  title: string
  imageUrl: string | null
  imageAlt: string
  href?: string | null
  newTab?: boolean
}

interface HomepageCardGridProps {
  items: HomepageCardItem[]
}

export function HomepageCardGrid({ items }: HomepageCardGridProps) {
  if (items.length === 0) return null

  return (
    <div className={styles.grid}>
      {items.map((item) => {
        const inner = (
          <>
            {item.imageUrl && (
              <Image
                src={item.imageUrl}
                alt={item.imageAlt}
                fill
                className={styles.cardImage}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
            <div className={styles.cardOverlay} />
            <p className={styles.cardTitle}>{item.title}</p>
          </>
        )

        return item.href ? (
          <Link
            key={item.id}
            href={item.href}
            className={styles.card}
            target={item.newTab ? '_blank' : undefined}
            rel={item.newTab ? 'noopener noreferrer' : undefined}
          >
            {inner}
          </Link>
        ) : (
          <div key={item.id} className={styles.card}>
            {inner}
          </div>
        )
      })}
    </div>
  )
}
