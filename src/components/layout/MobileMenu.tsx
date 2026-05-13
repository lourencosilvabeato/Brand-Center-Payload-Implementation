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

function getDirectSlug(page: NonNullable<NavL2['children']>[number]['page']): string | null {
  if (!page || typeof page === 'number') return null
  return (page as ContentPage).slug ?? null
}

interface MobileMenuProps {
  items: Navigation['items']
  role: 'admin' | 'localAdmin' | 'internal' | 'external'
  displayName: string | null
  avatarUrl: string | null
  onClose: () => void
}

export function MobileMenu({ items, role, displayName, avatarUrl, onClose }: MobileMenuProps) {
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
              {role === 'localAdmin' && (
                <Link href="/invite" className={styles.bottomItem} onClick={onClose}>
                  <InviteIcon />
                  <span>Invite new user</span>
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

            <ul className={styles.navList}>
              {(activeL1.children ?? []).map((l2) => {
                const l2Slug = getPolySlug(l2.page)
                const l1Slug = getPolySlug(activeL1.page)

                return (
                  <li key={l2.id ?? l2.label}>
                    {l2.children && l2.children.length > 0 ? (
                      <div className={styles.l2Group}>
                        <div className={styles.l2Header}>
                          {l2Slug && l1Slug ? (
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
                        </div>
                        <ul className={styles.l3List}>
                          {l2.children.map((l3) => {
                            const l3Slug = getDirectSlug(l3.page)
                            const l3Href =
                              l1Slug && l2Slug && l3Slug
                                ? `/${l1Slug}/${l2Slug}/${l3Slug}`
                                : null

                            return (
                              <li key={l3.id ?? l3.label} className={styles.navItem}>
                                {l3Href ? (
                                  <Link
                                    href={l3Href}
                                    className={styles.navLink}
                                    onClick={onClose}
                                  >
                                    <span>{l3.label}</span>
                                  </Link>
                                ) : (
                                  <span className={styles.navLink}>{l3.label}</span>
                                )}
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    ) : (
                      <div className={styles.navItem}>
                        {l2Slug && l1Slug ? (
                          <Link
                            href={`/${l1Slug}/${l2Slug}`}
                            className={styles.navLink}
                            onClick={onClose}
                          >
                            <span>{l2.label}</span>
                          </Link>
                        ) : (
                          <span className={styles.navLink}>{l2.label}</span>
                        )}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
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

function LogoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M7.5 17.5H3.75C3.41848 17.5 3.10054 17.3683 2.86612 17.1339C2.6317 16.8995 2.5 16.5815 2.5 16.25V3.75C2.5 3.41848 2.6317 3.10054 2.86612 2.86612C3.10054 2.6317 3.41848 2.5 3.75 2.5H7.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.75 14.1667L17.5 10.4167L13.75 6.66667" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.5 10.4167H7.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
