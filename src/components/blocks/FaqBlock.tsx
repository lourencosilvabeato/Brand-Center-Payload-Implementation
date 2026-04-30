'use client'

import { useState } from 'react'
import type { ContentPage } from '@/payload-types'
import styles from './Blocks.module.css'

type Block = Extract<NonNullable<ContentPage['layout']>[number], { blockType: 'faqBlock' }>

function CaretIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
        <span>{question}</span>
        <CaretIcon className={`${styles.faqCaret} ${open ? styles.faqCaretOpen : ''}`} />
      </button>
      {open && (
        <p className={styles.faqAnswer}>{answer}</p>
      )}
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
