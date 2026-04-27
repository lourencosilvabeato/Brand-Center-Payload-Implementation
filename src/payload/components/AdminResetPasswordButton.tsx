'use client'

import { useState } from 'react'
import { toast, useAuth, useDocumentInfo } from '@payloadcms/ui'

type AuthUser = {
  role?: string
  [key: string]: unknown
}

export function AdminResetPasswordButton() {
  const { id } = useDocumentInfo()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const typedUser = user as AuthUser | null
  if (!typedUser || typedUser.role !== 'admin') return null
  if (!id) return null

  async function handleReset() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id }),
      })

      if (res.ok) {
        toast.success('Password reset email sent successfully.')
      } else {
        const data = (await res.json()) as { error?: string }
        toast.error(data.error ?? 'Failed to send reset email.')
      }
    } catch {
      toast.error('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleReset}
      disabled={isLoading}
      style={{
        padding: '0 12px',
        height: '38px',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        background: 'transparent',
        color: 'var(--theme-text)',
        fontSize: '14px',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        opacity: isLoading ? 0.6 : 1,
        whiteSpace: 'nowrap',
      }}
    >
      {isLoading ? 'Sending…' : 'Send Reset Email'}
    </button>
  )
}
