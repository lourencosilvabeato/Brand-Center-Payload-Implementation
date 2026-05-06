'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import styles from './ChangePasswordForm.module.css'

const PASSWORD_HINT =
  'Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.'
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/

type FieldErrors = {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export function ChangePasswordForm() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function validate(): boolean {
    const errors: FieldErrors = {}

    if (!currentPassword) errors.currentPassword = 'This field is required.'

    if (!newPassword) {
      errors.newPassword = 'This field is required.'
    } else if (!PASSWORD_REGEX.test(newPassword)) {
      errors.newPassword = PASSWORD_HINT
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'This field is required.'
    } else if (newPassword && newPassword !== confirmPassword) {
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
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      })

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => router.push('/'), 1500)
        return
      }

      const data = (await res.json()) as { error?: string; field?: string }

      if (data.field === 'currentPassword') {
        setFieldErrors((prev) => ({ ...prev, currentPassword: data.error }))
      } else if (data.field === 'newPassword') {
        setFieldErrors((prev) => ({ ...prev, newPassword: data.error }))
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

  if (success) {
    return (
      <p className={styles.successMessage} role="status">
        Password changed successfully
      </p>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="currentPassword">
          Old password
        </label>
        <input
          className={`${styles.input}${fieldErrors.currentPassword ? ` ${styles.inputError}` : ''}`}
          type="password"
          id="currentPassword"
          name="currentPassword"
          placeholder="Insert your old password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value)
            if (fieldErrors.currentPassword)
              setFieldErrors((prev) => ({ ...prev, currentPassword: undefined }))
          }}
        />
        {fieldErrors.currentPassword && (
          <span className={styles.fieldError} role="alert">
            {fieldErrors.currentPassword}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="newPassword">
          New password
        </label>
        <input
          className={`${styles.input}${fieldErrors.newPassword ? ` ${styles.inputError}` : ''}`}
          type="password"
          id="newPassword"
          name="newPassword"
          placeholder="Insert your new password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value)
            if (fieldErrors.newPassword)
              setFieldErrors((prev) => ({ ...prev, newPassword: undefined }))
          }}
        />
        <p className={styles.hint}>{PASSWORD_HINT}</p>
        {fieldErrors.newPassword && (
          <span className={styles.fieldError} role="alert">
            {fieldErrors.newPassword}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="confirmPassword">
          Confirm new password
        </label>
        <input
          className={`${styles.input}${fieldErrors.confirmPassword ? ` ${styles.inputError}` : ''}`}
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Confirm your new password"
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
        {isLoading ? 'Saving…' : 'Save password'}
      </button>
    </form>
  )
}
