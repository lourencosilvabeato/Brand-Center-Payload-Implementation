import Link from 'next/link'
import styles from './HomepageHelpButtons.module.css'

interface HelpButton {
  id: string
  label: string
  url: string
  newTab?: boolean
}

interface HomepageHelpButtonsProps {
  buttons: HelpButton[]
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M7.5 5L12.5 10L7.5 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function HomepageHelpButtons({ buttons }: HomepageHelpButtonsProps) {
  if (buttons.length === 0) return null

  return (
    <div className={styles.container}>
      {buttons.map((btn) => (
        <Link
          key={btn.id}
          href={btn.url}
          className={styles.button}
          target={btn.newTab ? '_blank' : undefined}
          rel={btn.newTab ? 'noopener noreferrer' : undefined}
        >
          <span className={styles.label}>{btn.label}</span>
          <ChevronRight />
        </Link>
      ))}
    </div>
  )
}
