'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './SetPasswordForm.module.css'

interface SetPasswordFormProps {
  token: string
}

const PASSWORD_HINT =
  'Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.'
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/

type FieldErrors = {
  password?: string
  confirmPassword?: string
}

export function SetPasswordForm({ token }: SetPasswordFormProps) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  function validate(): boolean {
    const errors: FieldErrors = {}

    if (!password) {
      errors.password = 'This field is required.'
    } else if (!PASSWORD_REGEX.test(password)) {
      errors.password = PASSWORD_HINT
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'This field is required.'
    } else if (password && password !== confirmPassword) {
      errors.confirmPassword =
        'The new passwords do not match. Please ensure both fields are identical.'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setServerError(null)
    if (!validate()) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      })

      if (res.ok) {
        router.push('/login')
        return
      }

      const data = (await res.json()) as { error?: string; field?: string }

      if (res.status === 410 || data.error === 'expired') {
        router.push('/expired-link')
        return
      }

      if (data.field === 'password') {
        setFieldErrors((prev) => ({ ...prev, password: data.error }))
      } else if (data.field === 'confirmPassword') {
        setFieldErrors((prev) => ({ ...prev, confirmPassword: data.error }))
      } else {
        setServerError(data.error ?? 'An unexpected error occurred. Please try again shortly.')
      }
    } catch {
      setServerError('An unexpected error occurred. Please try again shortly.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <p className={styles.subtitle}>Define your password</p>

      <div className={styles.field}>
        <input
          className={`${styles.input}${fieldErrors.password ? ` ${styles.inputError}` : ''}`}
          type="password"
          id="password"
          name="password"
          placeholder="Enter new password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }))
          }}
        />
        <p className={styles.hint}>{PASSWORD_HINT}</p>
        {fieldErrors.password && (
          <span className={styles.fieldError} role="alert">
            {fieldErrors.password}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <input
          className={`${styles.input}${fieldErrors.confirmPassword ? ` ${styles.inputError}` : ''}`}
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Confirm new password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            if (fieldErrors.confirmPassword)
              setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }))
          }}
        />
        {fieldErrors.confirmPassword && (
          <span className={styles.fieldError} role="alert">
            {fieldErrors.confirmPassword}
          </span>
        )}
      </div>

      {serverError && (
        <p className={styles.serverError} role="alert">
          {serverError}
        </p>
      )}

      <button className={styles.submitBtn} type="submit" disabled={isLoading}>
        {isLoading ? 'Confirming...' : 'Confirm'}
      </button>

      <Link href="/login" className={styles.backLink}>
        Back to Login
      </Link>
    </form>
  )
}
