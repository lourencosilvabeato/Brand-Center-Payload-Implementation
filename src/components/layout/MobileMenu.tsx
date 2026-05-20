'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Navigation, ChannelPage, ContentPage } from '@/payload-types'
import styles from './MobileMenu.module.css'

type NavL1 = NonNullable<Navigation['items']>[number]
type NavL2 = NonNullable<NavL1['children']>[number]

function getPolySlug(page: NavL1['page'] | NavL2['page']): string | null {
  if (!page) return null
  const val = page.value
  if (typeof val === 'number') return null
  return (val as ChannelPage | ContentPage).slug ?? null
}

function getDirectSlug(page: NonNullable<NavL2['l3Items']>[number]['page']): string | null {
  if (!page || typeof page === 'number') return null
  return (page as ContentPage).slug ?? null
}

interface MobileMenuProps {
  items: Navigation['items']
  role: 'admin' | 'localAdmin' | 'internal' | 'external'
  displayName: string | null
  avatarUrl: string | null
  onClose: () => void
  allowedSlugs: string[] | null
}

export function MobileMenu({ items, role, displayName, avatarUrl, onClose, allowedSlugs }: MobileMenuProps) {
  const [activeL1, setActiveL1] = useState<NavL1 | null>(null)
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Navigation menu">
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.profile}>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className={styles.avatar} width={32} height={32} />
          ) : (
            <div className={styles.avatarFallback} aria-hidden="true">
              {displayName?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
          )}
          <span className={styles.welcome}>
            Welcome{displayName ? `, ${displayName.split(' ')[0]}` : ''}
          </span>
        </div>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
          <span className={styles.closeText}>Close</span>
          <CloseIcon />
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {activeL1 === null ? (
          /* Level 1 */
          <>
            <ul className={styles.navList}>
              {(items ?? []).map((item) => {
                const slug = getPolySlug(item.page)
                const hasChildren = (item.children?.length ?? 0) > 0

                return (
                  <li key={item.id ?? item.label} className={styles.navItem}>
                    {hasChildren ? (
                      <button
                        type="button"
                        className={styles.navBtn}
                        onClick={() => setActiveL1(item)}
                      >
                        <span>{item.label}</span>
                        <ChevronRightIcon />
                      </button>
                    ) : slug ? (
                      <Link href={`/${slug}`} className={styles.navLink} onClick={onClose}>
                        <span>{item.label}</span>
                      </Link>
                    ) : (
                      <span className={styles.navLink}>{item.label}</span>
                    )}
                  </li>
                )
              })}
            </ul>

            <div className={styles.bottom}>
              {role === 'admin' && (
                <a href="/admin" className={styles.bottomItem} onClick={onClose}>
                  <AdminIcon />
                  <span>Go to management panel</span>
                </a>
              )}
              {role === 'localAdmin' && (
                <Link href="/invite" className={styles.bottomItem} onClick={onClose}>
                  <InviteIcon />
                  <span>Invite new user</span>
                </Link>
              )}
              {role === 'external' && (
                <Link href="/change-password" className={styles.bottomItem} onClick={onClose}>
                  <PasswordIcon />
                  <span>Change password</span>
                </Link>
              )}
              <button type="button" className={styles.bottomItem} onClick={handleLogout}>
                <LogoutIcon />
                <span>Logout</span>
              </button>
            </div>
          </>
        ) : (
          /* Level 2 */
          <>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => setActiveL1(null)}
            >
              <ChevronLeftIcon />
              <span>{activeL1.label}</span>
            </button>

            <div>
              {(activeL1.children ?? []).map((l2) => {
                const l2Slug = getPolySlug(l2.page)
                const l1Slug = getPolySlug(activeL1.page)

                return (
                  <div key={l2.id ?? l2.label} className={styles.l2Group}>
                    {l2Slug && l1Slug && (!allowedSlugs || allowedSlugs.includes(l2Slug)) ? (
                      <Link
                        href={`/${l1Slug}/${l2Slug}`}
                        className={styles.l2Title}
                        onClick={onClose}
                      >
                        {l2.label}
                      </Link>
                    ) : (
                      <span className={styles.l2Title}>{l2.label}</span>
                    )}

                    {l2.l3Items && l2.l3Items.length > 0 && (
                      <ul className={styles.l3List}>
                        {l2.l3Items.map((l3) => {
                          const l3Slug = getDirectSlug(l3.page)
                          const l3Href =
                            l1Slug && l2Slug && l3Slug
                              ? `/${l1Slug}/${l2Slug}/${l3Slug}`
                              : null

                          return (
                            <li key={l3.id ?? l3.label}>
                              {l3Href ? (
                                <Link href={l3Href} className={styles.l3Link} onClick={onClose}>
                                  {l3.label}
                                </Link>
                              ) : (
                                <span className={styles.l3Link}>{l3.label}</span>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function CloseIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M24 8L8 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 8L24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function InviteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M13.75 17.5V15.8333C13.75 14.9493 13.3989 14.1014 12.7738 13.4763C12.1487 12.8512 11.3007 12.5 10.4167 12.5H4.58333C3.69928 12.5 2.85143 12.8512 2.22631 13.4763C1.60119 14.1014 1.25 14.9493 1.25 15.8333V17.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 9.16667C9.34095 9.16667 10.8333 7.67428 10.8333 5.83333C10.8333 3.99238 9.34095 2.5 7.5 2.5C5.65905 2.5 4.16667 3.99238 4.16667 5.83333C4.16667 7.67428 5.65905 9.16667 7.5 9.16667Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.25 6.66667V11.6667" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.75 9.16667H18.75" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function AdminIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M8.825 17.917h2.35l.525-2.1c.408-.108.783-.267 1.133-.467l1.884 1.05 1.65-1.65-1.05-1.883c.2-.35.358-.725.466-1.134l2.1-.525v-2.35l-2.1-.525a5.8 5.8 0 0 0-.466-1.133l1.05-1.883-1.65-1.65-1.884 1.05A5.76 5.76 0 0 0 11.7 4.25l-.525-2.1h-2.35L8.3 4.25a5.76 5.76 0 0 0-1.134.466L5.283 3.667l-1.65 1.65 1.05 1.883a5.8 5.8 0 0 0-.466 1.134l-2.1.525v2.35l2.1.525c.108.408.266.783.466 1.133l-1.05 1.884 1.65 1.65 1.883-1.05c.35.2.725.358 1.134.466l.525 2.1Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  )
}

function PasswordIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.5" y="9.16667" width="15" height="9.16667" rx="1.25" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.83333 9.16667V5.83333C5.83333 4.94928 6.18452 4.10143 6.80964 3.47631C7.43476 2.85119 8.28261 2.5 9.16667 2.5H10.8333C11.7174 2.5 12.5652 2.85119 13.1904 3.47631C13.8155 4.10143 14.1667 4.94928 14.1667 5.83333V9.16667" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M7.5 17.5H3.75C3.41848 17.5 3.10054 17.3683 2.86612 17.1339C2.6317 16.8995 2.5 16.5815 2.5 16.25V3.75C2.5 3.41848 2.6317 3.10054 2.86612 2.86612C3.10054 2.6317 3.41848 2.5 3.75 2.5H7.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.75 14.1667L17.5 10.4167L13.75 6.66667" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.5 10.4167H7.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
