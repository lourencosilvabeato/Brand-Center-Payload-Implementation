'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import styles from './LogoutButton.module.css'

interface LogoutButtonProps {
  className?: string
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  async function handleLogout() {
    if (isPending) return
    setIsPending(true)
    try {
      await fetch('/api/logout', { method: 'POST' })
    } finally {
      router.push('/login')
    }
  }

  return (
    <button
      type="button"
      className={`${styles.btn}${className ? ` ${className}` : ''}`}
      onClick={handleLogout}
      disabled={isPending}
    >
      <LogoutIcon className={styles.icon} />
      <span>{isPending ? 'Logging out…' : 'Logout'}</span>
    </button>
  )
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M7.5 17.5H3.75C3.41848 17.5 3.10054 17.3683 2.86612 17.1339C2.6317 16.8995 2.5 16.5815 2.5 16.25V3.75C2.5 3.41848 2.6317 3.10054 2.86612 2.86612C3.10054 2.6317 3.41848 2.5 3.75 2.5H7.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.75 14.1667L17.5 10.4167L13.75 6.66667"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 10.4167H7.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
