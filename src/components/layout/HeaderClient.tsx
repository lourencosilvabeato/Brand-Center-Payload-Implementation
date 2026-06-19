'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Navigation } from '@/payload-types'
import type { ChannelPage, ContentPage } from '@/payload-types'
import { MegaMenu } from './MegaMenu'
import { ProfileDropdown } from './ProfileDropdown'
import { MobileMenu } from './MobileMenu'
import styles from './Header.module.css'

type NavL1 = NonNullable<Navigation['items']>[number]

function getPolySlug(page: NavL1['page']): string | null {
  if (!page) return null
  const val = page.value
  if (typeof val === 'number') return null
  return (val as ChannelPage | ContentPage).slug ?? null
}

interface HeaderClientProps {
  items: Navigation['items']
  role: 'admin' | 'localAdmin' | 'internal' | 'external'
  displayName: string | null
  avatarUrl: string | null
  allowedSlugs: string[] | null
}

export function HeaderClient({ items, role, displayName, avatarUrl, allowedSlugs }: HeaderClientProps) {
  const [megaMenuL1, setMegaMenuL1] = useState<NavL1 | null>(null)
  const [megaMenuL1Slug, setMegaMenuL1Slug] = useState<string | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const pathname = usePathname()

  const activeL1Slug = pathname.split('/').filter(Boolean)[0] ?? null

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const closeMegaMenu = useCallback(() => {
    setMegaMenuL1(null)
    setMegaMenuL1Slug(null)
  }, [])

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const scheduleClose = useCallback(() => {
    cancelClose()
    closeTimerRef.current = setTimeout(() => {
      closeMegaMenu()
    }, 200)
  }, [cancelClose, closeMegaMenu])

  // Stable callback — prevents ProfileDropdown's useEffect from re-running on every render
  const handleProfileClose = useCallback(() => setProfileOpen(false), [])

  const closeAll = useCallback(() => {
    setMegaMenuL1(null)
    setMegaMenuL1Slug(null)
    setProfileOpen(false)
  }, [])

  const openMegaMenu = useCallback((item: NavL1, slug: string) => {
    setMegaMenuL1(item)
    setMegaMenuL1Slug(slug)
    setProfileOpen(false)
  }, [])

  // Reset all overlay states on route change so the mobile menu never gets
  // stuck open (it is position:fixed z-index:300 and would cover the header)
  useEffect(() => {
    setMobileOpen(false)
    closeMegaMenu()
    setProfileOpen(false)
  }, [pathname, closeMegaMenu])

  // Single consolidated outside-click handler — closes both mega-menu and
  // profile dropdown when clicking anywhere outside the header
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        closeAll()
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [closeAll])

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeAll()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [closeAll])

  const firstLetter = displayName?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <>
      <header ref={headerRef} className={styles.header}>
        <div className={styles.inner}>
          {/* Logo */}
          <Link
            href="/"
            className={styles.logo}
            aria-label="Brand Center home"
            onClick={closeAll}
          >
            <Image src="/logo.svg" alt="Brand Center" width={140} height={32} priority />
          </Link>

          {/* Desktop nav */}
          <nav className={styles.nav} aria-label="Main navigation">
            <ul className={styles.navList}>
              {(items ?? []).map((item) => {
                const slug = getPolySlug(item.page)
                const isPathActive = slug !== null && slug === activeL1Slug
                const isMenuOpen = megaMenuL1?.id === item.id
                const isActive = isPathActive || isMenuOpen

                const hasChildren = !!(item.children && item.children.length > 0)

                return (
                  <li
                    key={item.id ?? item.label}
                    className={styles.navItem}
                    onMouseEnter={() => {
                      if (hasChildren && slug) {
                        cancelClose()
                        openMegaMenu(item, slug)
                        setProfileOpen(false)
                      }
                    }}
                    onMouseLeave={() => {
                      if (hasChildren) scheduleClose()
                    }}
                  >
                    {slug ? (
                      <Link
                        href={`/${slug}`}
                        className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                        onClick={closeAll}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className={styles.navLink}>{item.label}</span>
                    )}
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Profile */}
          <div className={styles.profileWrap}>
            <button
              type="button"
              className={styles.profileBtn}
              onClick={() => {
                setProfileOpen((v) => !v)
                closeMegaMenu()
              }}
              aria-expanded={profileOpen}
              aria-haspopup="true"
              aria-label="User menu"
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" width={40} height={40} className={styles.avatar} />
              ) : (
                <div className={styles.avatarFallback} aria-hidden="true">
                  {firstLetter}
                </div>
              )}
              <span className={styles.welcomeText}>
                Welcome{displayName ? `, ${displayName.split(' ')[0]}` : ''}
              </span>
              <CaretIcon className={`${styles.caret} ${profileOpen ? styles.caretOpen : ''}`} />
            </button>

            {profileOpen && (
              <ProfileDropdown role={role} onClose={handleProfileClose} />
            )}
          </div>

          {/* Hamburger (mobile only) */}
          <button
            type="button"
            className={styles.hamburger}
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <HamburgerIcon />
          </button>
        </div>

        {/* Mega-menu */}
        {megaMenuL1 && megaMenuL1Slug && (
          <MegaMenu
            l1Item={megaMenuL1}
            l1Slug={megaMenuL1Slug}
            onClose={closeMegaMenu}
            allowedSlugs={allowedSlugs}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          />
        )}
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <MobileMenu
          items={items}
          role={role}
          displayName={displayName}
          avatarUrl={avatarUrl}
          onClose={() => setMobileOpen(false)}
          allowedSlugs={allowedSlugs}
        />
      )}
    </>
  )
}

function CaretIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HamburgerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 12H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 6H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 18H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
