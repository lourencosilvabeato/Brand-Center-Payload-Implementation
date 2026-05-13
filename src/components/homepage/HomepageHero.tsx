'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './HomepageHero.module.css'

export interface SearchFilter {
  label: string
  value: string
}

interface HomepageHeroProps {
  heroImageUrl: string | null
  heroHeadline: string
  heroIntroText?: string | null
  searchFilters: SearchFilter[]
}

function ChevronDown() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13 13L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function HomepageHero({
  heroImageUrl,
  heroHeadline,
  heroIntroText,
  searchFilters,
}: HomepageHeroProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<SearchFilter>(
    searchFilters[0] ?? { label: 'All content', value: '' },
  )
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e?: FormEvent) => {
    e?.preventDefault()
    if (!query.trim()) {
      setError('Please enter a search term.')
      return
    }
    setError('')
    const params = new URLSearchParams({ q: query.trim() })
    if (selectedFilter.value) params.set('filter', selectedFilter.value)
    router.push(`/search?${params.toString()}`)
  }

  const selectFilter = (filter: SearchFilter) => {
    setSelectedFilter(filter)
    setIsOpen(false)
  }

  const filterList = searchFilters.length > 0 ? searchFilters : [{ label: 'All content', value: '' }]

  return (
    <section className={styles.hero}>
      {heroImageUrl && (
        <Image
          src={heroImageUrl}
          alt=""
          fill
          className={styles.heroImage}
          priority
          sizes="100vw"
        />
      )}
      <div className={styles.heroOverlay} />

      <div className={styles.heroContent}>
        <h1 className={styles.heroHeadline}>{heroHeadline}</h1>
        {heroIntroText && <p className={styles.heroIntroText}>{heroIntroText}</p>}
      </div>

      <form
        ref={formRef}
        className={styles.searchBar}
        onSubmit={handleSearch}
        noValidate
        role="search"
      >
        {/* Desktop: connected pill (dropdown + input) + separate button */}
        <div className={styles.searchPillDesktop}>
          <div className={styles.dropdownWrap}>
            <button
              type="button"
              className={styles.dropdownTrigger}
              onClick={() => setIsOpen(!isOpen)}
              aria-haspopup="listbox"
              aria-expanded={isOpen}
            >
              <span>{selectedFilter.label}</span>
              <ChevronDown />
            </button>
            {isOpen && (
              <ul role="listbox" className={styles.dropdownList}>
                {filterList.map((f) => (
                  <li key={f.value} role="option" aria-selected={f.value === selectedFilter.value}>
                    <button
                      type="button"
                      className={styles.dropdownItem}
                      onClick={() => selectFilter(f)}
                    >
                      {f.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search all you need..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setError('')
            }}
            aria-label="Search"
          />
        </div>
        <button
          type="submit"
          className={styles.searchBtnDesktop}
          aria-label="Search"
          onClick={() => handleSearch()}
        >
          <SearchIcon />
        </button>

        {/* Mobile: stacked — dropdown pill then input+icon pill */}
        <div className={styles.dropdownWrapMobile}>
          <button
            type="button"
            className={styles.dropdownTriggerMobile}
            onClick={() => setIsOpen(!isOpen)}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <span>{selectedFilter.label}</span>
            <ChevronDown />
          </button>
          {isOpen && (
            <ul role="listbox" className={styles.dropdownListMobile}>
              {filterList.map((f) => (
                <li key={f.value} role="option" aria-selected={f.value === selectedFilter.value}>
                  <button
                    type="button"
                    className={styles.dropdownItem}
                    onClick={() => selectFilter(f)}
                  >
                    {f.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={styles.searchInputWrapMobile}>
          <input
            type="search"
            className={styles.searchInputMobile}
            placeholder="Search all you need..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setError('')
            }}
            aria-label="Search"
          />
          <button type="submit" className={styles.searchBtnMobile} aria-label="Search">
            <SearchIcon />
          </button>
        </div>

        {error && (
          <p className={styles.searchError} role="alert">
            {error}
          </p>
        )}
      </form>

      <div className={styles.scrollIndicator} aria-hidden="true">
        <ChevronDown />
      </div>
    </section>
  )
}
