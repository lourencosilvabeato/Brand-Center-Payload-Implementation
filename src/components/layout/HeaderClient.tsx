'use client'

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
}

export function HeaderClient({ items, role, displayName, avatarUrl }: HeaderClientProps) {
  const [megaMenuL1, setMegaMenuL1] = useState<NavL1 | null>(null)
  const [megaMenuL1Slug, setMegaMenuL1Slug] = useState<string | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const openMegaMenu = useCallback((item: NavL1, slug: string) => {
    setMegaMenuL1(item)
    setMegaMenuL1Slug(slug)
    setProfileOpen(false)
  }, [])

  const closeMegaMenu = useCallback(() => {
    setMegaMenuL1(null)
    setMegaMenuL1Slug(null)
  }, [])

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQuery.trim()
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`)
      setSearchQuery('')
    }
  }

  const firstLetter = displayName?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          {/* Logo */}
          <Link href="/" className={styles.logo} aria-label="Ascendum Brand Center home">
            <Image
              src="/logo.svg"
              alt="Ascendum"
              width={140}
              height={32}
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className={styles.nav} aria-label="Main navigation">
            <ul className={styles.navList}>
              {(items ?? []).map((item) => {
                const slug = getPolySlug(item.page)
                const isActive = megaMenuL1?.id === item.id

                return (
                  <li key={item.id ?? item.label} className={styles.navItem}>
                    {item.children && item.children.length > 0 ? (
                      <button
                        type="button"
                        className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                        onMouseEnter={() => slug && openMegaMenu(item, slug)}
                        onClick={() => {
                          if (isActive) {
                            closeMegaMenu()
                          } else if (slug) {
                            openMegaMenu(item, slug)
                          }
                        }}
                        aria-expanded={isActive}
                      >
                        {item.label}
                      </button>
                    ) : slug ? (
                      <Link
                        href={`/${slug}`}
                        className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                        onMouseEnter={closeMegaMenu}
                        onClick={closeMegaMenu}
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

          {/* Search */}
          <form className={styles.searchForm} onSubmit={handleSearchSubmit} role="search">
            <label htmlFor="header-search" className={styles.srOnly}>
              Search
            </label>
            <div className={styles.searchWrap}>
              <input
                ref={searchRef}
                id="header-search"
                type="search"
                className={styles.searchInput}
                placeholder="Search…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={closeMegaMenu}
              />
              <button type="submit" className={styles.searchBtn} aria-label="Submit search">
                <SearchIcon />
              </button>
            </div>
          </form>

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
                <img
                  src={avatarUrl}
                  alt=""
                  width={40}
                  height={40}
                  className={styles.avatar}
                />
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
              <ProfileDropdown
                role={role}
                onClose={() => setProfileOpen(false)}
              />
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
            onMouseLeave={closeMegaMenu}
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
        />
      )}
    </>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
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
