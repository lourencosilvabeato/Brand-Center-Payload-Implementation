'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './CollectionDetail.module.css'

export interface AssetMeta {
  id: string
  imageUrl: string | null
  imageWidth: number | null
  imageHeight: number | null
  imageAlt: string
  downloadUrl: string | null
}

interface Props {
  title: string
  label: string | null
  sidebarDescription: React.ReactNode
  assetDescriptions: React.ReactNode[]
  downloadFileId: number | null
  assets: AssetMeta[]
}

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 2.5V11.5M9 11.5L5.5 8M9 11.5L12.5 8M2.5 14.5H15.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function CollectionDetailViewer({
  title,
  label,
  sidebarDescription,
  assetDescriptions,
  downloadFileId,
  assets,
}: Props) {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0)
  const thumbListRef = useRef<HTMLDivElement>(null)
  const activeThumbRef = useRef<HTMLButtonElement>(null)

  const total = assets.length
  const current = assets[activeIndex]
  const isHorizontal =
    current?.imageWidth != null && current?.imageHeight != null
      ? current.imageWidth >= current.imageHeight
      : true

  const prev = useCallback(() => {
    setActiveIndex(i => (i - 1 + total) % total)
  }, [total])

  const next = useCallback(() => {
    setActiveIndex(i => (i + 1) % total)
  }, [total])

  // Scroll active thumbnail into view
  useEffect(() => {
    activeThumbRef.current?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [activeIndex])

  return (
    <div className={styles.viewer}>
      {/* ── Left — preview area ─────────────────────────────── */}
      <div className={styles.previewArea}>
        <button className={styles.backBtn} onClick={() => router.back()} aria-label="Go back">
          <ChevronLeft />
        </button>

        {/* Stage: caption left + image right */}
        <div className={styles.stage}>
          <div className={styles.caption}>
            {assetDescriptions[activeIndex]}
          </div>

          <div className={`${styles.imageWrapper} ${isHorizontal ? styles.imageHorizontal : styles.imageVertical}`}>
            {current?.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.imageUrl}
                alt={current.imageAlt}
                className={styles.previewImage}
              />
            )}
            {current?.downloadUrl && (
              <a
                href={current.downloadUrl}
                download
                className={styles.assetDownloadBtn}
                aria-label="Download this asset"
              >
                <DownloadIcon />
              </a>
            )}
          </div>
        </div>

        {/* Counter */}
        <div className={styles.counter}>
          <button className={styles.navBtn} onClick={prev} aria-label="Previous asset">
            <ChevronLeft />
          </button>
          <span className={styles.counterText}>{activeIndex + 1} / {total}</span>
          <button className={styles.navBtn} onClick={next} aria-label="Next asset">
            <ChevronRight />
          </button>
        </div>

        {/* Thumbnail strip */}
        <div className={styles.thumbnailStrip}>
          <button className={styles.thumbNavBtn} onClick={prev} aria-label="Previous asset">
            <ChevronLeft />
          </button>
          <div className={styles.thumbList} ref={thumbListRef}>
            {assets.map((asset, i) => (
              <button
                key={asset.id}
                ref={i === activeIndex ? activeThumbRef : null}
                className={`${styles.thumb} ${i === activeIndex ? styles.thumbActive : ''}`}
                onClick={() => setActiveIndex(i)}
                aria-label={`View asset ${i + 1}`}
                aria-current={i === activeIndex ? true : undefined}
              >
                {asset.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={asset.imageUrl} alt="" />
                )}
              </button>
            ))}
          </div>
          <button className={styles.thumbNavBtn} onClick={next} aria-label="Next asset">
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* ── Right — sidebar ─────────────────────────────────── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarInner}>
          <h1 className={styles.sidebarTitle}>{title}</h1>
          <div className={styles.sidebarMeta}>
            {label && <span className={styles.sidebarLabel}>{label}</span>}
            <span className={styles.sidebarChip}>{total} assets</span>
          </div>
          {sidebarDescription}
        </div>

        {downloadFileId && (
          <a
            href={`/api/download/${downloadFileId}`}
            download
            className={styles.downloadCollectionBtn}
          >
            Download collection
          </a>
        )}
      </aside>
    </div>
  )
}
