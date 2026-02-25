/**
 * ChainDropdown — "Select Network" panel
 * Figma: navbar chain selector dropdown
 *
 * Shell:     w-[220px] max-h-[340px] bg-bg-02 rounded-2xl shadow overflow-hidden
 * Header:    px-3 pt-3 pb-1  "Select Network"  text-xs/medium/text-03
 * List:      flex-col gap-1 px-3 pb-3  overflow-y-auto
 * Item:      px-2 py-[6px] gap-2  size-6 icon (rounded-md)  text-sm/medium
 *   default  → no bg
 *   hover    → bg-bg-03
 *   selected → bg-bg-03 + CheckFill green
 * Gradient mask fades bottom — hidden when scrolled to end
 */

import { useState, useRef, useEffect } from 'react'
import { CheckFill } from '@mingcute/react'
import { cn } from '@/lib/utils'
import { CHAINS } from '@/mock-data/chains'
import type { Chain } from '@/mock-data/chains'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  currentChain: Chain
  onSelect:     (chain: Chain) => void
  onClose:      () => void
}

// ─── ChainDropdown ────────────────────────────────────────────────────────────

export default function ChainDropdown({ currentChain, onSelect, onClose }: Props) {
  const [isAtBottom, setIsAtBottom] = useState(false)
  const listRef                     = useRef<HTMLDivElement>(null)

  function checkAtBottom() {
    const el = listRef.current
    if (!el) return
    setIsAtBottom(el.scrollHeight - el.scrollTop <= el.clientHeight + 1)
  }

  // Scroll the selected chain into view on open, then check bottom state
  useEffect(() => {
    const selected = listRef.current?.querySelector('[data-selected="true"]')
    selected?.scrollIntoView({ block: 'nearest' })
    checkAtBottom()
  }, [])

  return (
    <div
      className={cn(
        'absolute top-[calc(100%+4px)] left-0 z-50',
        'w-[220px] max-h-[340px]',
        'bg-[var(--wm-bg-02)] rounded-[var(--radius-2xl,12px)]',
        'shadow-[0_0_32px_rgba(0,0,0,0.25)] overflow-hidden',
        'flex flex-col',
        // 'absolute' already creates a containing block — no 'relative' needed
        'animate-in fade-in zoom-in-95 duration-150 origin-top-left',
      )}
    >
      {/* ── "Select Network" header ────────────────────────────────────────── */}
      <div className="shrink-0 px-3 pt-3 pb-1">
        <p className="text-xs leading-4 font-medium text-[var(--wm-text-03)]">
          Select Network
        </p>
      </div>

      {/* ── Scrollable chain list ──────────────────────────────────────────── */}
      <div
        ref={listRef}
        onScroll={checkAtBottom}
        className="flex-1 min-h-0 overflow-y-auto lang-scrollbar"
      >
        <div className="flex flex-col gap-0.5 px-2 pb-3 pt-1">
          {CHAINS.map((chain) => {
            const isSelected = chain.id === currentChain.id
            return (
              <button
                key={chain.id}
                data-selected={isSelected}
                onClick={() => { onSelect(chain); onClose() }}
                className={cn(
                  'flex items-center gap-2 w-full text-left',
                  'px-2 py-2 rounded-[var(--radius-lg,8px)]',
                  'text-sm font-medium leading-5 text-[var(--wm-text-01)]',
                  'transition-colors duration-100 cursor-pointer outline-none',
                  isSelected
                    ? 'bg-[var(--wm-bg-03)]'
                    : 'hover:bg-[var(--wm-bg-03)]',
                )}
              >
                {/* Chain icon — 24×24 rounded-md */}
                <ChainIcon src={chain.icon} name={chain.name} />

                {/* Chain name */}
                <span className="flex-1 truncate">{chain.name}</span>

                {/* Selected checkmark */}
                {isSelected && (
                  <span className="p-0.5 shrink-0">
                    <CheckFill className="size-4 text-[var(--wm-text-green)]" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Gradient mask — hidden when scrolled to bottom ─────────────────── */}
      {!isAtBottom && (
        <div
          className="absolute bottom-0 left-0 right-0 h-9 pointer-events-none rounded-b-[var(--radius-2xl,12px)]"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--wm-bg-02))' }}
        />
      )}
    </div>
  )
}

// ─── ChainIcon — handles broken image with letter fallback ────────────────────

function ChainIcon({ src, name }: { src: string; name: string }) {
  const [err, setErr] = useState(false)

  if (err) {
    // Fallback: colored circle with first letter
    return (
      <span
        className="size-4 rounded-[var(--radius-md,6px)] shrink-0 flex items-center justify-center text-[10px] font-bold text-[var(--wm-text-02)] select-none"
      >
        {name[0]}
      </span>
    )
  }

  return (
    <span className="p-0.5">
    <img
      src={src}
      alt={name}
      onError={() => setErr(true)}
      className="size-4 rounded-[var(--radius-md,6px)] object-cover shrink-0"
    />
    </span>
  )
}
