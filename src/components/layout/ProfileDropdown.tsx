'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './ProfileDropdown.module.css'

interface ProfileDropdownProps {
  role: 'admin' | 'localAdmin' | 'internal' | 'external'
  onClose: () => void
}

export function ProfileDropdown({ role, onClose }: ProfileDropdownProps) {
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div ref={ref} className={styles.dropdown} role="menu">
      {role === 'admin' && (
        <a href="/admin" className={`${styles.item} ${styles.withBorder}`} role="menuitem">
          <AdminIcon className={styles.icon} />
          <span>Go to management panel</span>
        </a>
      )}

      {role === 'localAdmin' && (
        <Link href="/invite" className={styles.item} role="menuitem" onClick={onClose}>
          <InviteIcon className={styles.icon} />
          <span>Invite User</span>
        </Link>
      )}

      {role === 'external' && (
        <>
          <Link href="/change-password" className={`${styles.item} ${styles.withBorder}`} role="menuitem" onClick={onClose}>
            <PasswordIcon className={styles.icon} />
            <span>Change Password</span>
          </Link>
        </>
      )}

      <button type="button" className={styles.item} role="menuitem" onClick={handleLogout}>
        <LogoutIcon className={styles.icon} />
        <span>Logout</span>
      </button>
    </div>
  )
}

function AdminIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2.5L2.5 6.25V10C2.5 13.9844 5.8125 17.7187 10 18.75C14.1875 17.7187 17.5 13.9844 17.5 10V6.25L10 2.5Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function InviteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M13.75 17.5V15.8333C13.75 14.9493 13.3989 14.1014 12.7738 13.4763C12.1487 12.8512 11.3007 12.5 10.4167 12.5H4.58333C3.69928 12.5 2.85143 12.8512 2.22631 13.4763C1.60119 14.1014 1.25 14.9493 1.25 15.8333V17.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 9.16667C9.34095 9.16667 10.8333 7.67428 10.8333 5.83333C10.8333 3.99238 9.34095 2.5 7.5 2.5C5.65905 2.5 4.16667 3.99238 4.16667 5.83333C4.16667 7.67428 5.65905 9.16667 7.5 9.16667Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.25 6.66667V11.6667" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.75 9.16667H18.75" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PasswordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.5" y="9.16667" width="15" height="9.16667" rx="1.25" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.83333 9.16667V5.83333C5.83333 4.94928 6.18452 4.10143 6.80964 3.47631C7.43476 2.85119 8.28261 2.5 9.16667 2.5H10.8333C11.7174 2.5 12.5652 2.85119 13.1904 3.47631C13.8155 4.10143 14.1667 4.94928 14.1667 5.83333V9.16667" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M7.5 17.5H3.75C3.41848 17.5 3.10054 17.3683 2.86612 17.1339C2.6317 16.8995 2.5 16.5815 2.5 16.25V3.75C2.5 3.41848 2.6317 3.10054 2.86612 2.86612C3.10054 2.6317 3.41848 2.5 3.75 2.5H7.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.75 14.1667L17.5 10.4167L13.75 6.66667" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.5 10.4167H7.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
