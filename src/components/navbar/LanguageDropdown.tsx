/**
 * LanguageDropdown — Navbar language selector panel
 * Figma: node 43412:74633
 *
 * Shell:   w-[256px] max-h-[320px] bg-bg-02 rounded-2xl shadow-modal overflow-hidden
 *
 * Search row  (shrink-0, border-b):
 *   px-3 py-[10px] gap-2
 *   Icon: SearchLine size-6 text-icon-03  (p-[2px] wrapper)
 *   Input: text-xs lh-16 text-01  placeholder text-03
 *   Clear button (x) appears when text present
 *
 * List section (flex-1, overflow-y-auto, custom scrollbar):
 *   px-3 py-2  gap-1
 *   Each item: px-[8px] py-[6px] rounded-lg text-sm/medium/lh-20 text-01
 *     default  → no bg
 *     hover    → bg-bg-03
 *     selected → bg-bg-03 + CheckFill green on right
 *   No-results: text-xs text-03 centered
 *   Bottom gradient mask fades out the last item (indicates more below)
 */

import { useState, useEffect, useRef } from 'react'
import { SearchLine, CheckFill, CloseCircleLine } from '@mingcute/react'
import { cn } from '@/lib/utils'
import { LANGUAGES } from '@/mock-data/languages'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  currentLang: string
  onSelect:    (code: string) => void
  onClose:     () => void
}

// ─── LanguageDropdown ─────────────────────────────────────────────────────────

export default function LanguageDropdown({ currentLang, onSelect, onClose }: Props) {
  const [query, setQuery]     = useState('')
  const [focused, setFocused] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(false)
  const inputRef              = useRef<HTMLInputElement>(null)
  const listRef               = useRef<HTMLDivElement>(null)

  // Check if the list is scrolled to the bottom (hide mask when it is)
  function checkAtBottom() {
    const el = listRef.current
    if (!el) return
    setIsAtBottom(el.scrollHeight - el.scrollTop <= el.clientHeight + 1)
  }

  // Auto-focus the search input when dropdown opens
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [])

  // Scroll the selected language into view on open, then re-check bottom state
  useEffect(() => {
    const selected = listRef.current?.querySelector('[data-selected="true"]')
    selected?.scrollIntoView({ block: 'nearest' })
    checkAtBottom()
  }, [])

  // Re-check when filtered results change (search reduces list → may already be at bottom)
  useEffect(() => {
    checkAtBottom()
  }, [query])

  const filtered = query.trim()
    ? LANGUAGES.filter((l) =>
        l.label.toLowerCase().includes(query.toLowerCase()) ||
        l.code.toLowerCase().includes(query.toLowerCase()),
      )
    : LANGUAGES

  function handleSelect(code: string) {
    onSelect(code)
    onClose()
  }

  return (
    <div
      className={cn(
        // Shell — right-aligned, near the right edge of nav
        'absolute top-[calc(100%+4px)] right-0 z-50',
        'w-[256px] max-h-[320px]',
        'bg-[var(--wm-bg-02)] rounded-[var(--radius-2xl,12px)]',
        'shadow-[0_0_32px_rgba(0,0,0,0.2)] overflow-hidden',
        'flex flex-col',  // 'absolute' already creates a containing block — no 'relative' needed
        // Enter animation
        'animate-in fade-in zoom-in-95 duration-150 origin-top-right',
      )}
    >
      {/* ── Search row ───────────────────────────────────────────────────────── */}
      <div
        className={cn(
          'shrink-0 flex items-center gap-2 px-3 py-2.5',
          'border-b transition-colors duration-150',
          // bg-02 (#1b1b1c) is the dropdown background.
          // border-01/#1b1b1c and border-02/#252527 are both invisible against it.
          // Use border-03 (#2e2e34) default → border-04 (#44444b) focused for visible separator.
          focused
            ? 'border-[var(--wm-border-02)]'
            : 'border-[var(--wm-border-02)]',
        )}
      >
        {/* Search icon */}
        <span className="p-0.5 shrink-0">
          <SearchLine
            className={cn(
              'size-[20px] transition-colors duration-150',
              focused || query
                ? 'text-[var(--wm-icon-02)]'
                : 'text-[var(--wm-icon-03)]',
            )}
          />
        </span>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search language"
          className={cn(
            'flex-1 min-w-0 bg-transparent outline-none',
            'text-sm leading-4 font-normal',
            'text-[var(--wm-text-01)]',
            'placeholder:text-[var(--wm-text-03)]',
          )}
          style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
        />

        {/* Clear button — visible only when query is non-empty */}
        {query && (
          <button
            onMouseDown={(e) => e.preventDefault()} // keep focus on input
            onClick={() => { setQuery(''); inputRef.current?.focus() }}
            className="p-0.5 shrink-0 text-[var(--wm-icon-03)] hover:text-[var(--wm-icon-01)] transition-colors duration-150 cursor-pointer outline-none"
            aria-label="Clear search"
          >
            <CloseCircleLine className="size-4" />
          </button>
        )}
      </div>

      {/* ── Language list ─────────────────────────────────────────────────────
           overflow-y-auto directly on flex-1 min-h-0 — no nested h-full needed.
           Gradient mask is absolute to the SHELL (which has overflow-hidden),
           so it always sticks at the visible bottom regardless of scroll position.
      ─────────────────────────────────────────────────────────────────────── */}
      <div
        ref={listRef}
        onScroll={checkAtBottom}
        className="flex-1 min-h-0 overflow-y-auto lang-scrollbar"
      >
        <div className="flex flex-col gap-1 px-3 py-2">
          {filtered.length > 0 ? (
            filtered.map((lang) => {
              const isSelected = lang.code === currentLang
              return (
                <button
                  key={lang.code}
                  data-selected={isSelected}
                  onClick={() => handleSelect(lang.code)}
                  className={cn(
                    'flex items-center gap-2 w-full text-left',
                    'px-2 py-1.5 rounded-[var(--radius-lg,8px)]',
                    'text-sm font-medium leading-5 text-[var(--wm-text-01)]',
                    'transition-colors duration-100 cursor-pointer outline-none',
                    isSelected
                      ? 'bg-[var(--wm-bg-03)]'
                      : 'hover:bg-[var(--wm-bg-03)]',
                  )}
                  style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
                >
                  <span className="flex-1">{lang.label}</span>

                  {/* Checkmark for selected item */}
                  {isSelected && (
                    <span className="p-0.5 shrink-0">
                      <CheckFill className="size-4 text-[var(--wm-text-green)]" />
                    </span>
                  )}
                </button>
              )
            })
          ) : (
            /* No results state */
            <div className="py-6 flex flex-col items-center gap-1">
              <p className="text-xs leading-4 text-[var(--wm-text-03)]">
                No language found for
              </p>
              <p className="text-xs leading-4 font-medium text-[var(--wm-text-02)]">
                "{query}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Gradient mask — hidden when scrolled to the bottom of the list */}
      {filtered.length > 0 && !isAtBottom && (
        <div
          className="absolute bottom-0 left-0 right-0 h-9 pointer-events-none rounded-b-[var(--radius-2xl,12px)] transition-opacity duration-150"
          style={{
            background: 'linear-gradient(to bottom, transparent, var(--wm-bg-02))',
          }}
        />
      )}
    </div>
  )
}
