'use client'

import { useState, useCallback } from 'react'
import type { PermissionsNavItem } from '@/lib/navigation'

interface RoleInfo {
  id: string
  name: string
  description: string | null
  allowedMenuItems: string[]
}

interface RolePermissionsClientProps {
  roles: RoleInfo[]
  navTree: PermissionsNavItem[]
}

type SaveState = { type: 'success' | 'error'; text: string } | null

export function RolePermissionsClient({ roles: initialRoles, navTree }: RolePermissionsClientProps) {
  const [roles, setRoles] = useState<RoleInfo[]>(initialRoles)
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [checkedSlugs, setCheckedSlugs] = useState<Set<string>>(new Set())

  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false)

  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const [isSaving, setIsSaving] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>(null)

  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? null

  const selectRole = useCallback(
    (id: string | null) => {
      setSelectedRoleId(id)
      setSaveState(null)
      const role = roles.find((r) => r.id === id)
      setCheckedSlugs(new Set(role?.allowedMenuItems ?? []))
      setDeleteConfirm(false)
    },
    [roles],
  )

  const toggleSlug = useCallback((slug: string) => {
    setCheckedSlugs((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
    setSaveState(null)
  }, [])

  async function handleCreate() {
    if (!newName.trim()) {
      setCreateError('Role name is required.')
      return
    }
    setIsSubmittingCreate(true)
    setCreateError(null)
    try {
      const res = await fetch('/api/customRoles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), description: newDescription.trim() || undefined }),
      })
      if (!res.ok) {
        const body = (await res.json()) as { errors?: Array<{ message: string }> }
        const msg = body.errors?.[0]?.message ?? 'Failed to create role.'
        setCreateError(msg)
        return
      }
      const created = (await res.json()) as { doc: { id: number; name: string; description?: string | null; allowedMenuItems?: unknown } }
      const newRole: RoleInfo = {
        id: String(created.doc.id),
        name: created.doc.name,
        description: created.doc.description ?? null,
        allowedMenuItems: [],
      }
      setRoles((prev) => [...prev, newRole])
      setIsCreating(false)
      setNewName('')
      setNewDescription('')
      selectRole(newRole.id)
    } catch {
      setCreateError('An unexpected error occurred.')
    } finally {
      setIsSubmittingCreate(false)
    }
  }

  async function handleDelete() {
    if (!selectedRoleId || !deleteConfirm) {
      setDeleteConfirm(true)
      return
    }
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/customRoles/${selectedRoleId}`, { method: 'DELETE' })
      if (!res.ok) {
        setSaveState({ type: 'error', text: 'Failed to delete role.' })
        return
      }
      setRoles((prev) => prev.filter((r) => r.id !== selectedRoleId))
      selectRole(null)
    } catch {
      setSaveState({ type: 'error', text: 'An unexpected error occurred.' })
    } finally {
      setIsDeleting(false)
      setDeleteConfirm(false)
    }
  }

  async function handleSave() {
    if (!selectedRoleId) return
    setIsSaving(true)
    setSaveState(null)
    try {
      const slugs = Array.from(checkedSlugs)
      const res = await fetch(`/api/customRoles/${selectedRoleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowedMenuItems: slugs }),
      })
      if (!res.ok) {
        setSaveState({ type: 'error', text: 'Failed to save permissions.' })
        return
      }
      setRoles((prev) =>
        prev.map((r) => (r.id === selectedRoleId ? { ...r, allowedMenuItems: slugs } : r)),
      )
      setSaveState({ type: 'success', text: 'Permissions saved. Changes take effect on next login.' })
    } catch {
      setSaveState({ type: 'error', text: 'An unexpected error occurred.' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--theme-text)' }}>
        Role Permissions
      </h1>
      <p style={{ color: 'var(--theme-elevation-450)', marginBottom: '2rem', fontSize: '0.875rem' }}>
        Create custom roles for external users and configure which pages each role can access.
        Empty permission list means unrestricted access. Changes take effect on the user&apos;s next login.
      </p>

      {/* ── Role selector ── */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={sectionHeadingStyle}>Role</h2>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', minWidth: '220px' }}>
            <label htmlFor="role-select" style={labelStyle}>Select role</label>
            <select
              id="role-select"
              value={selectedRoleId ?? ''}
              onChange={(e) => selectRole(e.target.value || null)}
              style={selectStyle}
            >
              <option value="">— choose a role —</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsCreating(true)
              setCreateError(null)
            }}
            style={{ ...btnStyle, ...btnSecondaryStyle }}
            disabled={isCreating}
          >
            + Create new role
          </button>

          {selectedRoleId && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              style={{
                ...btnStyle,
                background: deleteConfirm ? 'var(--theme-error-500)' : 'transparent',
                color: deleteConfirm ? '#fff' : 'var(--theme-error-500)',
                border: '1px solid var(--theme-error-500)',
              }}
            >
              {isDeleting
                ? 'Deleting…'
                : deleteConfirm
                ? 'Confirm delete'
                : 'Delete role'}
            </button>
          )}
          {deleteConfirm && (
            <button
              type="button"
              onClick={() => setDeleteConfirm(false)}
              style={{ ...btnStyle, ...btnSecondaryStyle }}
            >
              Cancel
            </button>
          )}
        </div>

        {deleteConfirm && (
          <p style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--theme-error-500)' }}>
            Warning: users assigned this role will revert to unrestricted external access.
          </p>
        )}

        {/* Create form */}
        {isCreating && (
          <div
            style={{
              marginTop: '1rem',
              padding: '1.25rem',
              border: '1px solid var(--theme-border-color)',
              borderRadius: '4px',
              background: 'var(--theme-elevation-50)',
            }}
          >
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--theme-text)' }}>
              Create new role
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label htmlFor="new-role-name" style={labelStyle}>Name <span style={{ color: 'var(--theme-error-500)' }}>*</span></label>
                <input
                  id="new-role-name"
                  type="text"
                  value={newName}
                  onChange={(e) => { setNewName(e.target.value); setCreateError(null) }}
                  placeholder="e.g. Agency Partner"
                  style={inputStyle}
                />
              </div>
              <div>
                <label htmlFor="new-role-desc" style={labelStyle}>Description</label>
                <input
                  id="new-role-desc"
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Optional internal note"
                  style={inputStyle}
                />
              </div>
              {createError && (
                <p style={{ color: 'var(--theme-error-500)', fontSize: '0.8125rem', margin: 0 }}>
                  {createError}
                </p>
              )}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={isSubmittingCreate}
                  style={{ ...btnStyle, ...btnPrimaryStyle }}
                >
                  {isSubmittingCreate ? 'Creating…' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsCreating(false); setNewName(''); setNewDescription(''); setCreateError(null) }}
                  style={{ ...btnStyle, ...btnSecondaryStyle }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Permissions tree ── */}
      {selectedRole && (
        <section>
          <h2 style={sectionHeadingStyle}>
            Page access for &ldquo;{selectedRole.name}&rdquo;
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--theme-elevation-450)', marginBottom: '1rem' }}>
            Tick the pages this role can access. Leave everything unticked for unrestricted access.
            Each item is independent — checking a parent does not auto-check its children.
          </p>

          {navTree.length === 0 ? (
            <p style={{ color: 'var(--theme-elevation-450)', fontSize: '0.875rem' }}>
              No navigation items found. Add pages to the Navigation global first.
            </p>
          ) : (
            <div
              style={{
                border: '1px solid var(--theme-border-color)',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '1rem',
              }}
            >
              {navTree.map((item, idx) => (
                <NavTreeRow
                  key={idx}
                  item={item}
                  checked={item.slug !== null && checkedSlugs.has(item.slug)}
                  onToggle={item.canSelect && item.slug ? () => toggleSlug(item.slug!) : undefined}
                />
              ))}
            </div>
          )}

          {saveState && (
            <p
              style={{
                marginBottom: '0.75rem',
                fontSize: '0.875rem',
                color: saveState.type === 'success' ? 'var(--theme-success-500)' : 'var(--theme-error-500)',
              }}
            >
              {saveState.text}
            </p>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            style={{ ...btnStyle, ...btnPrimaryStyle }}
          >
            {isSaving ? 'Saving…' : 'Save permissions'}
          </button>
        </section>
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
      onKeyDown={onToggle ? (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onToggle() } } : undefined}
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
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
          <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', fontStyle: 'normal', color: 'var(--theme-elevation-400)' }}>
            (no page — structural header)
          </span>
        )}
      </span>
    </div>
  )
}

// ── Shared styles ──

const sectionHeadingStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 600,
  color: 'var(--theme-text)',
  marginBottom: '0.875rem',
  paddingBottom: '0.5rem',
  borderBottom: '1px solid var(--theme-border-color)',
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.8125rem',
  fontWeight: 500,
  color: 'var(--theme-text)',
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: '0.25rem',
  padding: '0.5rem 0.75rem',
  border: '1px solid var(--theme-border-color)',
  borderRadius: '4px',
  background: 'var(--theme-input-bg)',
  color: 'var(--theme-text)',
  fontSize: '0.875rem',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  display: 'block',
  cursor: 'pointer',
}

const btnStyle: React.CSSProperties = {
  padding: '0 1rem',
  height: '38px',
  borderRadius: '4px',
  fontSize: '0.875rem',
  fontWeight: 500,
  cursor: 'pointer',
  border: 'none',
  whiteSpace: 'nowrap',
}

const btnPrimaryStyle: React.CSSProperties = {
  background: 'var(--theme-success-500)',
  color: '#fff',
}

const btnSecondaryStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--theme-border-color)',
  color: 'var(--theme-text)',
}
