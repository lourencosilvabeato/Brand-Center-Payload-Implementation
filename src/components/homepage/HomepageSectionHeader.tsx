import styles from './HomepageSectionHeader.module.css'

interface HomepageSectionHeaderProps {
  title: string
  body?: string | null
}

export function HomepageSectionHeader({ title, body }: HomepageSectionHeaderProps) {
  return (
    <div className={styles.header}>
      <h2 className={styles.title}>{title}</h2>
      {body && <p className={styles.body}>{body}</p>}
    </div>
  )
}
