'use client'

import { useState, useEffect, type FormEvent } from 'react'
import styles from './InviteForm.module.css'

interface PendingInvite {
  id: string
  email: string
  expiresAt: string | null | undefined
}

export function InviteForm() {
  const [email, setEmail] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([])
  const [cancelMessage, setCancelMessage] = useState<string | null>(null)

  async function fetchPending() {
    try {
      const res = await fetch('/api/invite')
      if (res.ok) {
        const data = (await res.json()) as { invitations: PendingInvite[] }
        setPendingInvites(data.invitations)
      }
    } catch {
      // silently fail — list will remain stale
    }
  }

  useEffect(() => {
    void fetchPending()
  }, [])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldError(null)
    setServerError(null)
    setSuccessMessage(null)
    setCancelMessage(null)

    const trimmed = email.trim()

    if (!trimmed) {
      setFieldError('This field is required.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setFieldError('Please enter a valid email address.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      })

      const data = (await res.json()) as { success?: boolean; field?: string; error?: string }

      if (res.ok) {
        setEmail('')
        await fetchPending()
        setSuccessMessage(`Invitation sent to ${trimmed}.`)
        return
      }

      if (data.field === 'email') {
        setFieldError(data.error ?? 'An unexpected error occurred. Please try again shortly.')
      } else {
        setServerError(data.error ?? 'An unexpected error occurred. Please try again shortly.')
      }
    } catch {
      setServerError('An unexpected error occurred. Please try again shortly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCancel(id: string) {
    setSuccessMessage(null)
    setCancelMessage(null)
    setServerError(null)

    try {
      const res = await fetch(`/api/invite/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPendingInvites((prev) => prev.filter((inv) => inv.id !== id))
        setCancelMessage('Invitation successfully cancelled.')
      } else {
        setServerError('An unexpected error occurred. Please try again shortly.')
      }
    } catch {
      setServerError('An unexpected error occurred. Please try again shortly.')
    }
  }

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="invite-email" className={styles.label}>
            New user e-mail
          </label>
          <input
            className={`${styles.input}${fieldError ? ` ${styles.inputError}` : ''}`}
            type="email"
            id="invite-email"
            name="email"
            placeholder="name@company.com"
            autoComplete="off"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (fieldError) setFieldError(null)
            }}
          />
          {fieldError && (
            <span className={styles.fieldError} role="alert">
              {fieldError}
            </span>
          )}
        </div>

        {serverError && (
          <p className={styles.serverError} role="alert">
            {serverError}
          </p>
        )}

        {successMessage && (
          <p className={styles.successMessage} role="status">
            {successMessage}
          </p>
        )}

        {cancelMessage && (
          <p className={styles.successMessage} role="status">
            {cancelMessage}
          </p>
        )}

        <button className={styles.submitBtn} type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send invite'}
        </button>
      </form>

      {pendingInvites.length > 0 && (
        <div className={styles.pendingList}>
          <h4 className={styles.pendingTitle}>
            Pending invites ({pendingInvites.length})
          </h4>
          <ul className={styles.list}>
            {pendingInvites.map((inv) => (
              <li key={inv.id} className={styles.listItem}>
                <span className={styles.inviteEmail}>{inv.email}</span>
                <button
                  className={styles.cancelBtn}
                  type="button"
                  onClick={() => void handleCancel(inv.id)}
                  aria-label={`Cancel invitation for ${inv.email}`}
                >
                  <XIcon />
                  <span>Cancel invite</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
