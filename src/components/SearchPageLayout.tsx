import { Fragment } from 'react'
import { SearchInput } from './SearchInput'
import styles from './SearchPageLayout.module.css'

export interface FilterOption {
  label: string
  slug: string
}

export interface SearchResult {
  id: number
  title: string
  slug: string
  excerpt: string | null
  href: string
  breadcrumbText: string | null
}

interface Props {
  query: string
  results: SearchResult[]
  filterOptions: FilterOption[]
  activeFilter: string
  totalResults: number
  currentPage: number
  totalPages: number
}

function buildUrl(
  query: string,
  activeFilter: string,
  overrides: { filter?: string; page?: string },
): string {
  const sp = new URLSearchParams()
  if (query) sp.set('q', query)
  const filterVal = overrides.filter !== undefined ? overrides.filter : activeFilter
  if (filterVal) sp.set('filter', filterVal)
  if (overrides.page) sp.set('page', overrides.page)
  return `/search?${sp.toString()}`
}

export function SearchPageLayout({
  query,
  results,
  filterOptions,
  activeFilter,
  totalResults,
  currentPage,
  totalPages,
}: Props) {
  const prevDisabled = currentPage <= 1
  const nextDisabled = currentPage >= totalPages || totalPages === 0

  return (
    <div className={styles.wrapper}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarInner}>
          <form action="/search" method="GET" className={styles.searchForm}>
            <SearchInput defaultValue={query} />
          </form>

          <nav className={styles.filterList} aria-label="Search filters">
            <a
              href={buildUrl(query, activeFilter, { filter: '', page: '1' })}
              className={`${styles.filterItem} ${!activeFilter ? styles.active : ''}`}
            >
              All content
            </a>
            {filterOptions.map((opt) => (
              <a
                key={opt.slug}
                href={buildUrl(query, activeFilter, { filter: opt.slug, page: '1' })}
                className={`${styles.filterItem} ${activeFilter === opt.slug ? styles.active : ''}`}
              >
                {opt.label}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className={styles.content}>
        <div className={styles.pageIntro}>
          <h1 className={styles.heading}>Search Results</h1>
          {query && (
            <p className={styles.resultCount}>
              {totalResults} results found for{' '}
              <strong className={styles.resultCountTerm}>&ldquo;{query}&rdquo;</strong>
            </p>
          )}
        </div>

        {results.length > 0 ? (
          <>
            <div className={styles.resultsList}>
              {results.map((result, i) => {
                const lastSlash = result.breadcrumbText?.lastIndexOf(' / ') ?? -1
                const breadcrumbParent =
                  lastSlash >= 0 ? result.breadcrumbText!.slice(0, lastSlash + 3) : ''
                const breadcrumbLast =
                  lastSlash >= 0
                    ? result.breadcrumbText!.slice(lastSlash + 3)
                    : (result.breadcrumbText ?? '')

                return (
                  <Fragment key={result.href}>
                    <a href={result.href} className={styles.result}>
                      <div className={styles.resultTitleRow}>
                        <span className={styles.resultTitle}>{result.title}</span>
                        <ChevronRight />
                      </div>
                      {result.excerpt && (
                        <p className={styles.resultExcerpt}>{result.excerpt}</p>
                      )}
                      {result.breadcrumbText && (
                        <p className={styles.resultBreadcrumb}>
                          {breadcrumbParent && (
                            <span className={styles.breadcrumbParent}>{breadcrumbParent}</span>
                          )}
                          <span className={styles.breadcrumbLast}>{breadcrumbLast}</span>
                        </p>
                      )}
                    </a>
                    {i < results.length - 1 && <hr className={styles.separator} />}
                  </Fragment>
                )
              })}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <a
                  href={
                    prevDisabled
                      ? undefined
                      : buildUrl(query, activeFilter, { page: String(currentPage - 1) })
                  }
                  className={`${styles.paginationBtn} ${prevDisabled ? styles.paginationBtnDisabled : ''}`}
                  aria-disabled={prevDisabled}
                  aria-label="Previous page"
                >
                  <ChevronLeft />
                </a>
                <span className={styles.paginationText}>
                  Página {currentPage} de {totalPages}
                </span>
                <a
                  href={
                    nextDisabled
                      ? undefined
                      : buildUrl(query, activeFilter, { page: String(currentPage + 1) })
                  }
                  className={`${styles.paginationBtn} ${nextDisabled ? styles.paginationBtnDisabled : ''}`}
                  aria-disabled={nextDisabled}
                  aria-label="Next page"
                >
                  <ChevronRight size={24} />
                </a>
              </div>
            )}
          </>
        ) : (
          query && <p className={styles.noResults}>No results found</p>
        )}
      </main>
    </div>
  )
}

function ChevronRight({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={styles.chevronIcon}
    >
      <path
        d="M7.5 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronLeft() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
