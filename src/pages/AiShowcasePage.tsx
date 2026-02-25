/**
 * AiShowcasePage — Gallery page for AI workflow screenshots.
 *
 * Purpose:  Demo page for judges — showcases AI-assisted development process.
 * Route:    /ai-showcase (outside the main product layout)
 *
 * Features:
 *  - Responsive gallery grid: 4 cols → 3 → 2 → 1
 *  - Click image → lightbox with zoom, close, prev/next navigation
 *  - Keyboard nav: Esc to close, ← → to navigate
 *  - "Back to Product" button
 */

import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeftLine,
  ArrowLeftFill,
  ArrowRightFill,
  CloseLine,
} from '@mingcute/react'
import { cn } from '@/lib/utils'

// ─── Image data ──────────────────────────────────────────────────────────────

interface ShowcaseImage {
  id: number
  src: string
  alt: string
}

const SHOWCASE_IMAGES: ShowcaseImage[] = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  src: `/assets/ai-showcase/showcase-${String(i).padStart(2, '0')}.png`,
  alt: `AI Showcase ${i + 1}`,
}))

// ─── Lightbox Component ──────────────────────────────────────────────────────

function Lightbox({
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: {
  images: ShowcaseImage[]
  currentIndex: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const image = images[currentIndex]

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, onPrev, onNext])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex items-center justify-center size-10 rounded-lg bg-wm-overlay-10 hover:bg-wm-overlay-20 text-wm-text-01 transition-colors cursor-pointer"
        aria-label="Close lightbox"
      >
        <CloseLine className="size-6" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-label-sm text-wm-text-03">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Prev button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onPrev()
        }}
        className={cn(
          'absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center size-12 rounded-full bg-wm-overlay-10 hover:bg-wm-overlay-20 text-wm-text-01 transition-colors cursor-pointer',
          currentIndex === 0 && 'opacity-30 pointer-events-none',
        )}
        disabled={currentIndex === 0}
        aria-label="Previous image"
      >
        <ArrowLeftFill className="size-6" />
      </button>

      {/* Next button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onNext()
        }}
        className={cn(
          'absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center size-12 rounded-full bg-wm-overlay-10 hover:bg-wm-overlay-20 text-wm-text-01 transition-colors cursor-pointer',
          currentIndex === images.length - 1 && 'opacity-30 pointer-events-none',
        )}
        disabled={currentIndex === images.length - 1}
        aria-label="Next image"
      >
        <ArrowRightFill className="size-6" />
      </button>

      {/* Image */}
      <div
        className="flex items-center justify-center max-w-[90vw] max-h-[85vh] px-16"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.src}
          alt={image.alt}
          className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl select-none"
          draggable={false}
        />
      </div>
    </div>
  )
}

// ─── Gallery Card ────────────────────────────────────────────────────────────

function GalleryCard({
  image,
  onClick,
}: {
  image: ShowcaseImage
  onClick: () => void
}) {
  const [loaded, setLoaded] = useState(false)

  return (
    <button
      onClick={onClick}
      className="group relative rounded-xl overflow-hidden bg-wm-bg-02 hover:bg-wm-bg-03 transition-all duration-200 cursor-pointer border border-transparent hover:border-wm-border-02"
    >
      <div className="relative aspect-video overflow-hidden bg-wm-bg-03">
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-wm-bg-03" />
        )}
        <img
          src={image.src}
          alt={image.alt}
          onLoad={() => setLoaded(true)}
          className={cn(
            'w-full h-full object-cover object-top transition-all duration-300',
            'group-hover:scale-[1.03]',
            loaded ? 'opacity-100' : 'opacity-0',
          )}
          loading="lazy"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
          <span className="text-label-sm text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">
            Click to zoom
          </span>
        </div>
      </div>
    </button>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AiShowcasePage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null)
  }, [])

  const goToPrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null && prev > 0 ? prev - 1 : prev,
    )
  }, [])

  const goToNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null && prev < SHOWCASE_IMAGES.length - 1 ? prev + 1 : prev,
    )
  }, [])

  return (
    <div className="min-h-screen bg-wm-bg-01 text-wm-text-01">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-wm-border-01 bg-wm-bg-01/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-label-sm text-wm-text-03 hover:text-wm-text-01 transition-colors"
          >
            <ArrowLeftLine className="size-5" />
            Back to Product
          </Link>

          <div className="flex items-center gap-3">
            <div className="size-6 rounded-full bg-wm-primary flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="size-3.5 text-wm-bg-01" fill="currentColor">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-label-md text-wm-text-01">AI Showcase</span>
          </div>

          <div className="w-[120px]" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pt-12 pb-8">
        <div className="flex flex-col items-center text-center gap-4">
          <h1 className="text-display-md text-wm-text-01">
            AI-Powered Development
          </h1>
          <p className="text-body-md text-wm-text-03 max-w-2xl">
            A visual showcase of the AI-assisted workflow used to build Whales Market.
            From Figma design tokens extraction to pixel-perfect React components — every
            step powered by Claude Code.
          </p>

        </div>
      </section>

      {/* ── Gallery grid ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {SHOWCASE_IMAGES.map((image, index) => (
            <GalleryCard
              key={image.id}
              image={image}
              onClick={() => openLightbox(index)}
            />
          ))}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-wm-border-01 py-8">
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
          <p className="text-body-xs text-wm-text-03">
            Built with Claude Code &times; Figma MCP &times; React + TypeScript + Tailwind
          </p>
          <Link
            to="/"
            className="text-label-xs text-wm-primary hover:underline"
          >
            View Product →
          </Link>
        </div>
      </footer>

      {/* ── Lightbox ────────────────────────────────────────────────────── */}
      {lightboxIndex !== null && (
        <Lightbox
          images={SHOWCASE_IMAGES}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={goToPrev}
          onNext={goToNext}
        />
      )}
    </div>
  )
}
