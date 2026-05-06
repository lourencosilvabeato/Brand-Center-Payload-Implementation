'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import styles from './ResetPasswordForm.module.css'

type State = 'request' | 'sent'

export function ResetPasswordForm() {
  const [state, setState] = useState<State>('request')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  function validate(): boolean {
    if (!email.trim()) {
      setEmailError('This field is required.')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Please enter a valid email address.')
      return false
    }
    return true
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setServerError(null)
    if (!validate()) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/reset-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = (await res.json()) as { error?: string; field?: string }

      if (res.ok) {
        setState('sent')
        return
      }

      if (data.field === 'email') {
        setEmailError(data.error ?? 'Invalid email.')
      } else {
        setServerError(data.error ?? 'An unexpected error occurred. Please try again shortly.')
      }
    } catch {
      setServerError('An unexpected error occurred. Please try again shortly.')
    } finally {
      setIsLoading(false)
    }
  }

  if (state === 'sent') {
    return (
      <div className={styles.form}>
        <p className={styles.subtitle}>E-mail sent!</p>
        <p className={styles.confirmMessage}>
          If an account exists for this email, you will receive password reset instructions
          shortly. Please check your spam folder.
        </p>
        <Link href="/login" className={styles.submitBtn}>
          Back to Login
        </Link>
      </div>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <p className={styles.subtitle}>Reset password</p>

      <div className={styles.field}>
        <input
          className={`${styles.input}${emailError ? ` ${styles.inputError}` : ''}`}
          type="email"
          id="email"
          name="email"
          placeholder="E-mail"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (emailError) setEmailError(null)
          }}
        />
        {emailError && (
          <span className={styles.fieldError} role="alert">
            {emailError}
          </span>
        )}
      </div>

      {serverError && (
        <p className={styles.serverError} role="alert">
          {serverError}
        </p>
      )}

      <button className={styles.submitBtn} type="submit" disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Reset password'}
      </button>

      <Link href="/login" className={styles.backLink}>
        Back to Login
      </Link>
    </form>
  )
}
