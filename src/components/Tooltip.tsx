/**
 * Tooltip — Whales Market design system
 * Figma: node 31356:7855
 *
 * Panel:  bg-03 (#252527), rounded-lg (8px), px-[12px] py-[8px]
 *         shadow-[0_0_8px_rgba(0,0,0,0.1)]
 * Text:   12px / regular / lh-16 / text-01
 * Arrow:  16×8 SVG triangle pointing toward the trigger
 *
 * Two variants:
 *   <Tooltip>       — absolute, for non-overflow contexts
 *   <TooltipPortal> — createPortal into body, escapes overflow:hidden parents
 *
 * arrowSide:
 *   "bottom" → tooltip ABOVE trigger, arrow points down  (default)
 *   "top"    → tooltip BELOW trigger, arrow points up
 *   "left"   → tooltip RIGHT of trigger, arrow points left
 *   "right"  → tooltip LEFT of trigger, arrow points right
 */

import { useLayoutEffect, useState, type CSSProperties, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TooltipArrowSide = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps {
  content:    string
  visible:    boolean
  arrowSide?: TooltipArrowSide
  className?: string
}

// ─── Arrow SVG ───────────────────────────────────────────────────────────────

function Arrow({ side }: { side: TooltipArrowSide }) {
  const configs: Record<TooltipArrowSide, { w: number; h: number; d: string }> = {
    bottom: { w: 16, h: 8, d: 'M0 0 L16 0 L8 8 Z'  }, // points down
    top:    { w: 16, h: 8, d: 'M0 8 L16 8 L8 0 Z'  }, // points up
    left:   { w: 8, h: 16, d: 'M8 0 L8 16 L0 8 Z'  }, // points left
    right:  { w: 8, h: 16, d: 'M0 0 L0 16 L8 8 Z'  }, // points right
  }
  const { w, h, d } = configs[side]
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0" aria-hidden="true">
      <path d={d} fill="var(--wm-bg-03)" />
    </svg>
  )
}

// ─── Shared panel + arrow markup ─────────────────────────────────────────────

function TooltipContent({
  content,
  arrowSide,
  extraCls,
}: {
  content:  string
  arrowSide: TooltipArrowSide
  extraCls?: string
}) {
  // flex direction so arrow is on the correct side
  const layoutCls: Record<TooltipArrowSide, string> = {
    bottom: 'flex-col',          // panel → arrow
    top:    'flex-col-reverse',  // arrow → panel
    left:   'flex-row-reverse',  // arrow → panel (arrow on left)
    right:  'flex-row',          // panel → arrow (arrow on right)
  }
  const originCls: Record<TooltipArrowSide, string> = {
    bottom: 'origin-bottom',
    top:    'origin-top',
    left:   'origin-left',
    right:  'origin-right',
  }
  return (
    <div
      role="tooltip"
      className={cn(
        'pointer-events-none flex items-center',
        layoutCls[arrowSide],
        'animate-in fade-in zoom-in-95 duration-150',
        originCls[arrowSide],
        extraCls,
      )}
    >
      <div className={cn(
        'bg-[var(--wm-bg-03)] rounded-[var(--radius-lg,8px)]',
        'px-3 py-2 whitespace-nowrap',
        'shadow-[0_0_8px_rgba(0,0,0,0.1)]',
        'text-xs leading-4 font-normal text-[var(--wm-text-01)]',
      )}>
        {content}
      </div>
      <Arrow side={arrowSide} />
    </div>
  )
}

// ─── Tooltip (absolute, no portal) ───────────────────────────────────────────
// Use this only when the parent has NO overflow:hidden ancestor

export function Tooltip({ content, visible, arrowSide = 'bottom', className }: TooltipProps) {
  if (!visible) return null

  const posCls: Record<TooltipArrowSide, string> = {
    bottom: 'bottom-[calc(100%+2px)] left-1/2 -translate-x-1/2',
    top:    'top-[calc(100%+2px)]    left-1/2 -translate-x-1/2',
    left:   'right-[calc(100%+2px)] top-1/2  -translate-y-1/2',
    right:  'left-[calc(100%+2px)]  top-1/2  -translate-y-1/2',
  }

  return (
    <div className={cn('absolute z-[200]', posCls[arrowSide], className)}>
      <TooltipContent content={content} arrowSide={arrowSide} />
    </div>
  )
}

// ─── TooltipPortal (portal into body, escapes overflow:hidden) ───────────────
// Use this when any ancestor has overflow:hidden (e.g. a modal, dropdown shell)

const GAP = 4 // px between anchor and tooltip

function getFixedStyle(rect: DOMRect, arrowSide: TooltipArrowSide): CSSProperties {
  switch (arrowSide) {
    case 'bottom': // tooltip above anchor
      return {
        position:  'fixed',
        bottom:    window.innerHeight - rect.top + GAP,
        left:      rect.left + rect.width / 2,
        transform: 'translateX(-50%)',
        zIndex:    9999,
      }
    case 'top': // tooltip below anchor
      return {
        position:  'fixed',
        top:       rect.bottom + GAP,
        left:      rect.left + rect.width / 2,
        transform: 'translateX(-50%)',
        zIndex:    9999,
      }
    case 'left': // tooltip to right of anchor
      return {
        position:  'fixed',
        top:       rect.top + rect.height / 2,
        left:      rect.right + GAP,
        transform: 'translateY(-50%)',
        zIndex:    9999,
      }
    case 'right': // tooltip to left of anchor
      return {
        position:  'fixed',
        top:       rect.top + rect.height / 2,
        left:      rect.left - GAP,
        transform: 'translate(-100%, -50%)',
        zIndex:    9999,
      }
  }
}

export interface TooltipPortalProps {
  content:    string
  visible:    boolean
  anchorRef:  RefObject<HTMLElement | null>
  arrowSide?: TooltipArrowSide
}

export function TooltipPortal({
  content,
  visible,
  anchorRef,
  arrowSide = 'bottom',
}: TooltipPortalProps) {
  const [style, setStyle] = useState<CSSProperties>({})

  // Measure anchor position synchronously before paint to avoid flicker
  useLayoutEffect(() => {
    if (!visible || !anchorRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    setStyle(getFixedStyle(rect, arrowSide))
  }, [visible, anchorRef, arrowSide])

  if (!visible) return null

  return createPortal(
    <div style={style}>
      <TooltipContent content={content} arrowSide={arrowSide} />
    </div>,
    document.body,
  )
}
