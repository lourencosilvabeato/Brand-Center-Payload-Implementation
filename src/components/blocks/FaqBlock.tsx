'use client'

import { useState } from 'react'
import type { ContentPage } from '@/payload-types'
import styles from './Blocks.module.css'

type Block = Extract<NonNullable<ContentPage['layout']>[number], { blockType: 'faqBlock' }>

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={styles.faqItem}>
      <button
        type="button"
        className={styles.faqQuestion}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={styles.faqQuestionText}>{question}</span>
        <span className={`${styles.faqCaret} ${open ? styles.faqCaretOpen : ''}`}>
          <ChevronDownIcon />
        </span>
      </button>
      {open && <p className={styles.faqAnswer}>{answer}</p>}
    </div>
  )
}

export function FaqBlock({ block }: { block: Block }) {
  return (
    <div className={styles.faqList}>
      {block.items.map((item, i) => (
        <FaqItem key={item.id ?? i} question={item.question} answer={item.answer} />
      ))}
    </div>
  )
}
