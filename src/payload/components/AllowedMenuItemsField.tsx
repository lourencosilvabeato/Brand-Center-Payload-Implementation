'use client'

import { useField } from '@payloadcms/ui'
import { useState, useEffect, useCallback } from 'react'
import { buildPermissionsNavTree } from '@/lib/navigation'
import type { PermissionsNavItem } from '@/lib/navigation'
import type { Navigation } from '@/payload-types'

interface AllowedMenuItemsFieldProps {
  path: string
}

export function AllowedMenuItemsField({ path }: AllowedMenuItemsFieldProps) {
  const { value, setValue } = useField<unknown>({ path })
  const [navTree, setNavTree] = useState<PermissionsNavItem[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  const checked = new Set(Array.isArray(value) ? (value as string[]) : [])

  useEffect(() => {
    fetch('/api/globals/navigation?depth=1')
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json() as Promise<{ items?: Navigation['items'] }>
      })
      .then((data) => {
        setNavTree(buildPermissionsNavTree(data.items))
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false))
  }, [])

  const toggle = useCallback(
    (slug: string) => {
      const next = new Set(Array.isArray(value) ? (value as string[]) : [])
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      setValue(Array.from(next))
    },
    [value, setValue],
  )

  return (
    <div style={{ marginBottom: '1rem' }}>
      <p style={labelStyle}>Page access</p>
      <p style={{ fontSize: '0.75rem', color: 'var(--theme-elevation-450)', marginBottom: '0.625rem', marginTop: '0.25rem' }}>
        Select which pages users with this role can access. Leave everything unticked for unrestricted
        access. Each item is independent — ticking a parent does not auto-tick its children.
      </p>

      {loading && (
        <p style={{ fontSize: '0.875rem', color: 'var(--theme-elevation-450)' }}>
          Loading navigation…
        </p>
      )}

      {fetchError && (
        <p style={{ fontSize: '0.875rem', color: 'var(--theme-error-500)' }}>
          Failed to load navigation items.
        </p>
      )}

      {!loading && !fetchError && navTree.length === 0 && (
        <p style={{ fontSize: '0.875rem', color: 'var(--theme-elevation-450)' }}>
          No navigation items found. Add pages to the Navigation global first.
        </p>
      )}

      {!loading && !fetchError && navTree.length > 0 && (
        <div
          style={{
            border: '1px solid var(--theme-border-color)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          {navTree.map((item, idx) => (
            <NavTreeRow
              key={idx}
              item={item}
              checked={item.slug !== null && checked.has(item.slug)}
              onToggle={item.canSelect && item.slug ? () => toggle(item.slug!) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface NavTreeRowProps {
  item: PermissionsNavItem
  checked: boolean
  onToggle?: () => void
}

function NavTreeRow({ item, checked, onToggle }: NavTreeRowProps) {
  const indent = (item.level - 1) * 24
  const isHeader = !item.canSelect

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        padding: `0.5rem 1rem 0.5rem ${1 + indent / 16}rem`,
        borderBottom: '1px solid var(--theme-border-color)',
        background: item.level === 1 ? 'var(--theme-elevation-50)' : 'transparent',
        cursor: onToggle ? 'pointer' : 'default',
      }}
      onClick={onToggle}
      role={onToggle ? 'checkbox' : undefined}
      aria-checked={onToggle ? checked : undefined}
      tabIndex={onToggle ? 0 : undefined}
      onKeyDown={
        onToggle
          ? (e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault()
                onToggle()
              }
            }
          : undefined
      }
    >
      {!isHeader ? (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '16px',
            height: '16px',
            borderRadius: '3px',
            border: `2px solid ${checked ? 'var(--theme-success-500)' : 'var(--theme-elevation-300)'}`,
            background: checked ? 'var(--theme-success-500)' : 'transparent',
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          {checked && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path
                d="M1 4L3.5 6.5L9 1"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      ) : (
        <span style={{ width: '16px', flexShrink: 0 }} aria-hidden="true" />
      )}

      <span
        style={{
          fontSize: item.level === 1 ? '0.9375rem' : '0.875rem',
          fontWeight: item.level === 1 ? 600 : 400,
          color: isHeader ? 'var(--theme-elevation-450)' : 'var(--theme-text)',
          fontStyle: isHeader ? 'italic' : 'normal',
          userSelect: 'none',
        }}
      >
        {item.label}
        {isHeader && (
          <span
            style={{
              marginLeft: '0.5rem',
              fontSize: '0.75rem',
              fontStyle: 'normal',
              color: 'var(--theme-elevation-400)',
            }}
          >
            (no page — structural header)
          </span>
        )}
      </span>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: 'var(--theme-text)',
  margin: 0,
}
