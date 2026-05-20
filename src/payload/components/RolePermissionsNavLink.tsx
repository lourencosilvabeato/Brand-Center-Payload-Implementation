'use client'

import { useAuth } from '@payloadcms/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type AuthUser = {
  role?: string
  [key: string]: unknown
}

export function RolePermissionsNavLink() {
  const { user } = useAuth()
  const pathname = usePathname()
  const typedUser = user as AuthUser | null

  if (!typedUser || typedUser.role !== 'admin') return null

  const isActive = pathname === '/admin/role-permissions'

  return (
    <div
      style={{
        padding: '0 var(--nav-group-padding, 12px)',
        marginTop: '8px',
      }}
    >
      <p
        style={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--theme-elevation-400)',
          padding: '8px 8px 4px',
          margin: 0,
        }}
      >
        Brand Center
      </p>
      <Link
        href="/admin/role-permissions"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 8px',
          borderRadius: '4px',
          fontSize: '0.875rem',
          color: isActive ? 'var(--theme-text)' : 'var(--theme-elevation-500)',
          background: isActive ? 'var(--theme-elevation-100)' : 'transparent',
          textDecoration: 'none',
          fontWeight: isActive ? 500 : 400,
          transition: 'background 0.15s',
        }}
      >
        <PermissionsIcon />
        Role Permissions
      </Link>
    </div>
  )
}

function PermissionsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M9 1.5L2.25 4.5V9C2.25 12.7275 5.1675 16.2075 9 17.25C12.8325 16.2075 15.75 12.7275 15.75 9V4.5L9 1.5Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.375 9L8.25 10.875L11.625 7.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
