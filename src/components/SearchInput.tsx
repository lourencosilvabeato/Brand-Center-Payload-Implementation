'use client'

import { useState } from 'react'
import styles from './SearchInput.module.css'

interface Props {
  defaultValue: string
}

export function SearchInput({ defaultValue }: Props) {
  const [value, setValue] = useState(defaultValue)

  return (
    <div className={styles.wrapper}>
      <input
        type="text"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={styles.input}
        placeholder="Search..."
        autoComplete="off"
        aria-label="Search"
      />
      {value && (
        <button
          type="button"
          className={styles.clearBtn}
          onClick={() => setValue('')}
          aria-label="Clear search"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  )
}
