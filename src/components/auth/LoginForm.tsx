'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './LoginForm.module.css'

interface LoginFormProps {
  ssoUrl: string
  subtitle?: string | null
  ssoError?: boolean
}

type FieldErrors = {
  email?: string
  password?: string
}

export function LoginForm({ ssoUrl, subtitle, ssoError = false }: LoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState<string | null>(
    ssoError ? 'An unexpected error occurred. Please try again shortly.' : null,
  )
  const [isLoading, setIsLoading] = useState(false)

  function validate(): boolean {
    const errors: FieldErrors = {}

    if (!email.trim()) {
      errors.email = 'This field is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.'
    }

    if (!password) {
      errors.password = 'This field is required.'
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
      const res = await fetch('/api/externalUsers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, rememberMe }),
      })

      if (res.ok) {
        router.push('/')
        router.refresh()
        return
      }

      if (res.status === 401 || res.status === 400) {
        setServerError(
          'Invalid credentials. Please check your email and password and try again.',
        )
        return
      }

      try {
        const data = (await res.json()) as {
          errors?: { message: string }[]
          message?: string
        }
        const msg = data?.errors?.[0]?.message ?? data?.message ?? ''
        if (
          msg.toLowerCase().includes('not found') ||
          msg.toLowerCase().includes('email') ||
          msg.toLowerCase().includes('password')
        ) {
          setServerError(
            'Invalid credentials. Please check your email and password and try again.',
          )
        } else {
          setServerError('An unexpected error occurred. Please try again shortly.')
        }
      } catch {
        setServerError('An unexpected error occurred. Please try again shortly.')
      }
    } catch {
      setServerError('An unexpected error occurred. Please try again shortly.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}

      <div className={styles.field}>
        <input
          className={`${styles.input}${fieldErrors.email ? ` ${styles.inputError}` : ''}`}
          type="email"
          id="email"
          name="email"
          placeholder="E-mail"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }))
          }}
        />
        {fieldErrors.email && (
          <span className={styles.fieldError} role="alert">
            {fieldErrors.email}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <input
          className={`${styles.input}${fieldErrors.password ? ` ${styles.inputError}` : ''}`}
          type="password"
          id="password"
          name="password"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }))
          }}
        />
        {fieldErrors.password && (
          <span className={styles.fieldError} role="alert">
            {fieldErrors.password}
          </span>
        )}
      </div>

      <div className={styles.optionsRow}>
        <label className={styles.checkboxLabel}>
          <input
            className={styles.checkbox}
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span>Remember me</span>
        </label>

        <Link href="/reset-password" className={styles.forgotLink}>
          Forgot password?
        </Link>
      </div>

      {serverError && (
        <p className={styles.serverError} role="alert">
          {serverError}
        </p>
      )}

      <button className={styles.submitBtn} type="submit" disabled={isLoading}>
        {isLoading ? 'Entering...' : 'Enter'}
      </button>

      <div className={styles.divider}>
        <span className={styles.dividerLine} aria-hidden="true" />
        <span className={styles.dividerText}>Team member? Please, login here:</span>
        <span className={styles.dividerLine} aria-hidden="true" />
      </div>

      <a className={styles.ssoBtn} href={ssoUrl}>
        <MicrosoftIcon />
        <span>Login with Ascendum account</span>
      </a>
    </form>
  )
}

function MicrosoftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 21 21"
      width="21"
      height="21"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  )
}
