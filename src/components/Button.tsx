/**
 * Button — Whales Market Design System
 *
 * Figma: https://www.figma.com/design/ievx5gIqlhh6fUQoaOp5rH?node-id=31307-32608
 *
 * variant    → primary | secondary | danger | success
 * appearance → filled | tonal | outline | ghost | transparent (secondary only)
 * size       → sm (28px) | md (36px) | lg (44px) | xl (52px)
 *
 * Color values extracted from individual Figma symbol nodes via get_design_context.
 *
 * State implementation:
 *  - filled/tonal/transparent  → ::before overlay
 *      hover   → rgba(255,255,255,0.1)  (white +10%)
 *      pressed → rgba(0,0,0,0.4)        (black +40%)
 *  - outline/ghost → direct bg classes per variant (Figma spec: muted-20 bg on hover & pressed)
 *      hover & active → bg = muted-20 of that variant's color
 *      secondary/outline also swaps border to border-secondary-muted on hover
 *  - disabled → opacity: 0.4, pointer-events: none (all appearances)
 *  - loading  → spinner replaces content, same colors as default
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonVariant    = 'primary' | 'secondary' | 'danger' | 'success'
export type ButtonAppearance = 'filled' | 'tonal' | 'outline' | 'ghost' | 'transparent'
export type ButtonSize       = 'sm' | 'md' | 'lg' | 'xl'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:     ButtonVariant
  appearance?:  ButtonAppearance
  size?:        ButtonSize
  loading?:     boolean
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  /** Square icon-only mode — pass the icon as children */
  iconOnly?:    boolean
}

// ─── Color classes per variant × appearance ───────────────────────────────────
// Source: Figma get_design_context on individual sm/text-only/default nodes,
//         plus hover/pressed nodes for outline & ghost.
//
// For `outline` style: base border is included in the class string.
// For `outline` & `ghost`: hover:bg-* / active:bg-* are also included here;
//   ::before overlay is NOT applied to these two appearances (see useOverlay below).

const COLOR_MAP: Record<string, string> = {
  // ── PRIMARY ─────────────────────────────────────────────────────────────────
  // filled/transparent: ::before white+10% hover, black+40% pressed
  'primary-filled':
    'bg-[var(--wm-bg-primary)] text-[var(--wm-text-on-color)] ' +
    'hover:before:bg-white/10 active:before:bg-black/40',

  // tonal: ::before uses variant's own muted-20 color on hover & pressed
  'primary-tonal':
    'bg-[var(--wm-bg-primary-muted-20)] text-[var(--wm-text-green)] ' +
    'hover:before:bg-[var(--wm-bg-primary-muted-20)] active:before:bg-[var(--wm-bg-primary-muted-20)]',

  // hover/pressed: add muted-20 bg (border stays same rgba value)
  'primary-outline':
    'border border-[var(--wm-border-primary-muted)] text-[var(--wm-text-green)] ' +
    'hover:bg-[var(--wm-bg-primary-muted-20)] active:bg-[var(--wm-bg-primary-muted-20)]',

  // hover/pressed: add muted-20 bg (no border)
  'primary-ghost':
    'text-[var(--wm-text-green)] ' +
    'hover:bg-[var(--wm-bg-primary-muted-20)] active:bg-[var(--wm-bg-primary-muted-20)]',

  // ── SECONDARY ───────────────────────────────────────────────────────────────
  // secondary bg is white → white/10 is invisible; use black/10 for hover instead
  'secondary-filled':
    'bg-[var(--wm-bg-secondary)] text-[var(--wm-text-inv)] ' +
    'hover:before:bg-black/10 active:before:bg-black/40',

  // tonal: ::before secondary-muted-20 on hover & pressed
  'secondary-tonal':
    'bg-[var(--wm-bg-02)] text-[var(--wm-text-01)] ' +
    'hover:before:bg-[var(--wm-bg-secondary-muted-20)] active:before:bg-[var(--wm-bg-secondary-muted-20)]',

  // hover/pressed: add secondary-muted-20 bg, border swaps to secondary-muted
  'secondary-outline':
    'border border-[var(--wm-border-02)] text-[var(--wm-text-01)] ' +
    'hover:bg-[var(--wm-bg-secondary-muted-20)] hover:border-[var(--wm-border-secondary-muted)] ' +
    'active:bg-[var(--wm-bg-secondary-muted-20)] active:border-[var(--wm-border-secondary-muted)]',

  // hover/pressed: add secondary-muted-20 bg
  'secondary-ghost':
    'text-[var(--wm-text-01)] ' +
    'hover:bg-[var(--wm-bg-secondary-muted-20)] active:bg-[var(--wm-bg-secondary-muted-20)]',

  // bg-overlay is opaque-ish → ::before overlay applies
  'secondary-transparent':
    'bg-[var(--wm-bg-overlay)] text-[var(--wm-text-01)] ' +
    'hover:before:bg-white/10 active:before:bg-black/40',

  // ── DANGER ───────────────────────────────────────────────────────────────────
  'danger-filled':
    'bg-[var(--wm-bg-danger)] text-[var(--wm-text-on-color)] ' +
    'hover:before:bg-white/10 active:before:bg-black/40',

  // tonal: ::before danger-muted-20 on hover & pressed
  'danger-tonal':
    'bg-[var(--wm-bg-danger-muted-20)] text-[var(--wm-text-danger)] ' +
    'hover:before:bg-[var(--wm-bg-danger-muted-20)] active:before:bg-[var(--wm-bg-danger-muted-20)]',

  // hover/pressed: add danger-muted-20 bg (border stays same rgba value)
  'danger-outline':
    'border border-[var(--wm-border-danger-muted)] text-[var(--wm-text-danger)] ' +
    'hover:bg-[var(--wm-bg-danger-muted-20)] active:bg-[var(--wm-bg-danger-muted-20)]',

  // hover/pressed: add danger-muted-20 bg
  'danger-ghost':
    'text-[var(--wm-text-danger)] ' +
    'hover:bg-[var(--wm-bg-danger-muted-20)] active:bg-[var(--wm-bg-danger-muted-20)]',

  // ── SUCCESS ──────────────────────────────────────────────────────────────────
  'success-filled':
    'bg-[var(--wm-bg-success)] text-[var(--wm-text-on-color)] ' +
    'hover:before:bg-white/10 active:before:bg-black/40',

  // tonal: ::before success-muted-20 on hover & pressed
  'success-tonal':
    'bg-[var(--wm-bg-success-muted-20)] text-[var(--wm-text-green)] ' +
    'hover:before:bg-[var(--wm-bg-success-muted-20)] active:before:bg-[var(--wm-bg-success-muted-20)]',

  // hover/pressed: add success-muted-20 bg (border stays same rgba value)
  'success-outline':
    'border border-[var(--wm-border-success-muted)] text-[var(--wm-text-green)] ' +
    'hover:bg-[var(--wm-bg-success-muted-20)] active:bg-[var(--wm-bg-success-muted-20)]',

  // hover/pressed: add success-muted-20 bg
  'success-ghost':
    'text-[var(--wm-text-green)] ' +
    'hover:bg-[var(--wm-bg-success-muted-20)] active:bg-[var(--wm-bg-success-muted-20)]',
}

// ─── Size specs ───────────────────────────────────────────────────────────────
// Verified against Figma get_design_context on each size node (text-only, primary/filled/default):
//   sm (28px):  px=spacing-12 (12px), py=spacing-6  (6px),  gap=gap-4  (4px),  radius=radius-md  (6px)
//   md (36px):  px=spacing-16 (16px), py=spacing-8  (8px),  gap=gap-6  (6px),  radius=radius-lg  (8px)
//   lg (44px):  px=spacing-20 (20px), py=spacing-10 (10px), gap=gap-8  (8px),  radius=radius-xl  (10px)
//   xl (52px):  px=spacing-24 (24px), py=spacing-12 (12px), gap=gap-10 (10px), radius=radius-2xl (12px)

interface SizeSpec {
  height:    string  // Tailwind h-* class
  px:        string  // horizontal padding for text/icon+label buttons
  py:        string  // vertical padding for text/icon+label buttons
  pSquare:   string  // equal padding for icon-only (square) buttons
  textSize:  string  // Tailwind text-* class
  gap:       string  // gap between icon and label
  iconClass: string  // icon wrapper size class
  radius:    string  // border-radius (per-size, increases with size)
}

const SIZE_MAP: Record<ButtonSize, SizeSpec> = {
  sm: {
    height:    'h-7',
    px:        'px-3',          // spacing-12 = 12px
    py:        'py-1.5',        // spacing-6  = 6px
    pSquare:   'p-1.5',
    textSize:  'text-xs',       // 12px / lh 16px
    gap:       'gap-1',         // gap-4 = 4px
    iconClass: 'size-4',        // 16px
    radius:    'rounded-[var(--radius-md,6px)]',
  },
  md: {
    height:    'h-9',
    px:        'px-4',          // spacing-16 = 16px
    py:        'py-2',          // spacing-8  = 8px
    pSquare:   'p-2',
    textSize:  'text-sm',       // 14px / lh 20px
    gap:       'gap-1.5',       // gap-6 = 6px
    iconClass: 'size-5',        // 20px
    radius:    'rounded-[var(--radius-lg,8px)]',
  },
  lg: {
    height:    'h-11',
    px:        'px-5',          // spacing-20 = 20px
    py:        'py-2.5',        // spacing-10 = 10px
    pSquare:   'p-2.5',
    textSize:  'text-base',     // 16px / lh 24px
    gap:       'gap-2',         // gap-8 = 8px
    iconClass: 'size-5',        // 20px
    radius:    'rounded-[var(--radius-xl,10px)]',
  },
  xl: {
    height:    'h-[52px]',
    px:        'px-6',          // spacing-24 = 24px
    py:        'py-3',          // spacing-12 = 12px
    pSquare:   'p-3',
    textSize:  'text-lg',       // 18px / lh 28px
    gap:       'gap-2.5',       // gap-10 = 10px
    iconClass: 'size-6',        // 24px
    radius:    'rounded-[var(--radius-2xl,12px)]',
  },
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12" cy="12" r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray="56.5"
        strokeDashoffset="42"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ─── Icon slot ────────────────────────────────────────────────────────────────

function IconSlot({
  children,
  sizeClass,
}: {
  children: ReactNode
  sizeClass: string
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center [&_svg]:size-full',
        sizeClass,
      )}
      aria-hidden="true"
    >
      {children}
    </span>
  )
}

// ─── Button ───────────────────────────────────────────────────────────────────

export function Button({
  variant    = 'primary',
  appearance = 'filled',
  size       = 'md',
  loading    = false,
  leadingIcon,
  trailingIcon,
  iconOnly   = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  const colorKey   = `${variant}-${appearance}`
  const colorClass = COLOR_MAP[colorKey] ?? COLOR_MAP['primary-filled']

  const s          = SIZE_MAP[size]
  const isDisabled = disabled || loading

  const paddingClass = iconOnly ? s.pSquare : cn(s.px, s.py)

  // outline & ghost use direct hover:bg-* classes in COLOR_MAP.
  // filled / tonal / transparent use ::before overlay instead.
  const useOverlay = appearance !== 'outline' && appearance !== 'ghost'

  return (
    <button
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        // ── Layout ──────────────────────────────────────────────────────────
        'relative inline-flex items-center justify-center',
        'overflow-hidden whitespace-nowrap select-none',

        // ── Typography ──────────────────────────────────────────────────────
        'font-medium lining-nums tabular-nums',

        // ── Colors (bg + text + optional border + hover/active) ─────────
        colorClass,

        // ── Size: height + text size + gap ───────────────────────────────
        s.height,
        s.textSize,
        s.gap,

        // ── Radius (grows with size: sm→6px md→8px lg→10px xl→12px) ────────
        s.radius,

        // ── Padding ─────────────────────────────────────────────────────────
        paddingClass,

        // ── Press animation (scale 0.95→1.02→1 on click) ────────────────────
        'btn-pop',

        // ── Cursor ──────────────────────────────────────────────────────────
        loading ? 'cursor-wait' : 'cursor-pointer',

        // ── Transition ──────────────────────────────────────────────────────
        'transition-[background-color,border-color,opacity] duration-150',

        // ── Hover / Pressed — ::before overlay ──────────────────────────────
        // Only for filled/tonal/transparent (opaque backgrounds).
        // outline/ghost handle hover/active via direct bg classes in COLOR_MAP.
        // Per-variant hover/active colors are embedded in COLOR_MAP entries:
        //   filled/transparent → hover:before:bg-white/10, active:before:bg-black/40
        //   tonal              → hover:before:bg-{variant}-muted-20, active:before:bg-{variant}-muted-20
        useOverlay && [
          'before:absolute before:inset-0 before:content-[""]',
          'before:pointer-events-none before:rounded-[inherit]',
          'before:transition-colors before:duration-150',
        ],

        // ── Disabled ────────────────────────────────────────────────────────
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',

        className,
      )}
      {...props}
    >
      {loading ? (
        // Loading: spinner fills the icon slot, no label
        <Spinner className={s.iconClass} />

      ) : iconOnly ? (
        // Icon-only: children IS the icon, centered in the square button
        <IconSlot sizeClass={s.iconClass}>{children}</IconSlot>

      ) : (
        // Normal: [leading icon] + label + [trailing icon]
        <>
          {leadingIcon && (
            <IconSlot sizeClass={s.iconClass}>{leadingIcon}</IconSlot>
          )}

          {children !== undefined && (
            <span className="relative leading-none">{children}</span>
          )}

          {trailingIcon && (
            <IconSlot sizeClass={s.iconClass}>{trailingIcon}</IconSlot>
          )}
        </>
      )}
    </button>
  )
}

export default Button
