/**
 * Input (InputField) — Whales Market Design System
 *
 * Figma: https://www.figma.com/design/ievx5gIqlhh6fUQoaOp5rH?node-id=31375-266
 *
 * size   → md | lg
 * status → default | invalid | success | loading
 *
 * Box background per state (Figma-extracted):
 *  default   → bg-02 (#1b1b1c)
 *  hover     → bg-03 (#252527)   via :hover + :focus-within on box wrapper
 *  focus     → bg-03             ^^^
 *  typing    → bg-03             ^^^
 *  has-value → bg-overlay        (rgba 255,255,255,0.05) — JS-derived when blurred + non-empty
 *  invalid   → bg-danger-muted-10 (rgba 255,59,70,0.1)   — hover/focus do NOT override
 *  success   → bg-success-muted-10 (rgba 22,194,132,0.1)  — hover/focus do NOT override
 *  loading   → bg-02 + Loading3Fill spinner trailing
 *  disabled  → bg-02, opacity-40 on outer wrapper
 *  read-only → bg-02, no hover/focus change
 *
 * Structure:
 *  [header]  label + optional "*"
 *  [box]     [leading icon?] input [status icon?]
 *  [footer]  helper/status message (flex-1) + char counter (shrink-0)
 */

import {
  type InputHTMLAttributes,
  type ReactNode,
  useEffect,
  useId,
  useState,
} from 'react'
import { AlertFill, CheckCircleFill, Loading3Fill } from '@mingcute/react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export type InputStatus = 'default' | 'invalid' | 'success' | 'loading'
export type InputSize   = 'md' | 'lg'

export interface InputFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?:           InputSize
  label?:          string
  required?:       boolean
  helperText?:     string
  /** status overrides the visual style + footer message */
  status?:         InputStatus
  /** Custom footer message for invalid/success — falls back to helperText */
  statusMessage?:  string
  /** Optional leading icon node */
  leadingIcon?:    ReactNode
  /** Show character counter in footer */
  showCharCount?:  boolean
  /** Whether to render the label header */
  showHeader?:     boolean
  /** Whether to render the footer (helper text + char counter) */
  showFooter?:     boolean
  wrapperClassName?: string
}

// ─── Size specs ───────────────────────────────────────────────────────────────
// Box padding extracted from Figma nodes:
//   md text-only: pl-12px pr-8px py-8px → pl-3 pr-2 py-2
//   md icon-*   : p-8px all            → p-2
//   lg text-only: pl-12px pr-8px py-12px → pl-3 pr-2 py-3
//   lg icon-*   : p-10px all           → p-[10px]
// Gap between box items (icon ↔ input): gap-8px = gap-2

interface SizeSpec {
  boxPadText: string  // padding when no leading icon
  boxPadIcon: string  // padding when leading icon present
  textClass:  string  // font size for input text
  gap:        string  // gap between flex items in the box
}

const SIZE_MAP: Record<InputSize, SizeSpec> = {
  md: {
    boxPadText: 'pl-3 pr-2 py-2',
    boxPadIcon: 'p-2',
    textClass:  'text-sm',   // 14px / leading-5
    gap:        'gap-2',     // 8px
  },
  lg: {
    boxPadText: 'pl-3 pr-2 py-3',
    boxPadIcon: 'p-2.5',
    textClass:  'text-sm',   // 14px / leading-5
    gap:        'gap-2',     // 8px
  },
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InputField({
  size            = 'md',
  label,
  required        = false,
  helperText,
  status          = 'default',
  statusMessage,
  leadingIcon,
  showCharCount   = false,
  showHeader      = true,
  showFooter      = true,
  wrapperClassName,
  disabled,
  readOnly,
  value,
  defaultValue,
  onChange,
  className,
  maxLength,
  ...props
}: InputFieldProps) {
  const inputId = useId()
  const s       = SIZE_MAP[size]

  // ── hasValue state: drives the "has-value" bg (bg-overlay when blurred+filled)
  const [hasValue, setHasValue] = useState(
    () => !!(value ?? defaultValue),
  )
  const [charCount, setCharCount] = useState(() => {
    const initial = value ?? defaultValue
    return typeof initial === 'string' ? initial.length : 0
  })

  // Sync for controlled components
  useEffect(() => {
    if (value !== undefined) {
      const str = String(value)
      setHasValue(str.length > 0)
      setCharCount(str.length)
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const len = e.target.value.length
    setHasValue(len > 0)
    setCharCount(len)
    onChange?.(e)
  }

  // Whether the field can respond to hover/focus
  const isInteractive = !disabled && !readOnly && status !== 'loading'
  const hasLeadingIcon = !!leadingIcon

  // ── Box background class ─────────────────────────────────────────────────
  const boxBgClass = (() => {
    if (status === 'invalid') return 'bg-[var(--wm-bg-danger-muted-10)]'
    if (status === 'success') return 'bg-[var(--wm-bg-success-muted-10)]'
    if (!isInteractive)       return 'bg-[var(--wm-bg-02)]'

    // Interactive: default bg depends on value, hover/focus override to bg-03
    return cn(
      hasValue ? 'bg-[var(--wm-bg-overlay)]' : 'bg-[var(--wm-bg-02)]',
      'hover:bg-[var(--wm-bg-03)] focus-within:bg-[var(--wm-bg-03)]',
    )
  })()

  // ── Footer ───────────────────────────────────────────────────────────────
  const footerTextClass =
    status === 'invalid' ? 'text-[var(--wm-text-danger)]' :
    status === 'success' ? 'text-[var(--wm-text-green)]'  :
                           'text-[var(--wm-text-03)]'

  const footerMessage =
    status === 'invalid' ? (statusMessage ?? helperText) :
    status === 'success' ? (statusMessage ?? helperText) :
                           helperText

  // ── Trailing status icon ─────────────────────────────────────────────────
  const showStatusIcon =
    status === 'invalid' || status === 'success' || status === 'loading'

  return (
    <div
      className={cn(
        'flex flex-col gap-2 items-start',
        disabled && 'opacity-40 pointer-events-none',
        wrapperClassName,
      )}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      {showHeader && label && (
        <div className="flex gap-1 items-end shrink-0 w-full">
          <label
            htmlFor={inputId}
            className="text-sm font-medium leading-5 text-[var(--wm-text-01)] lining-nums tabular-nums shrink-0 cursor-pointer"
          >
            {label}
          </label>
          {required && (
            <span className="text-sm font-medium leading-5 text-[var(--wm-text-01)]">
              *
            </span>
          )}
        </div>
      )}

      {/* ── Input box ──────────────────────────────────────────────────── */}
      <div
        className={cn(
          // Layout
          'flex items-center overflow-hidden rounded-[var(--radius-lg,8px)] w-full shrink-0',
          // Gap between icon/text items
          s.gap,
          // Padding: asymmetric for text-only, equal for icon variant
          hasLeadingIcon ? s.boxPadIcon : s.boxPadText,
          // Background (state-driven)
          boxBgClass,
          // Transition
          'transition-colors duration-150',
        )}
      >
        {/* Leading icon */}
        {leadingIcon && (
          <span
            className="flex items-center p-0.5 shrink-0 text-[var(--wm-text-03)]"
            aria-hidden="true"
          >
            {leadingIcon}
          </span>
        )}

        {/* Native input */}
        <input
          id={inputId}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          className={cn(
            // Layout
            'flex-1 min-w-0 bg-transparent outline-none',
            // Typography
            s.textClass,
            'leading-5 font-normal lining-nums tabular-nums',
            // Text color
            'text-[var(--wm-text-01)]',
            // Placeholder color
            'placeholder:text-[var(--wm-text-03)] placeholder:font-normal',
            // Cursor
            readOnly  ? 'cursor-default'      : 'cursor-text',
            disabled  ? 'cursor-not-allowed'  : '',
            className,
          )}
          {...props}
        />

        {/* Trailing status icon */}
        {showStatusIcon && (
          <span
            className="flex items-center p-0.5 shrink-0"
            aria-hidden="true"
          >
            {status === 'invalid' && (
              <AlertFill className="size-6 text-[var(--wm-text-danger)]" />
            )}
            {status === 'success' && (
              <CheckCircleFill className="size-6 text-[var(--wm-text-green)]" />
            )}
            {status === 'loading' && (
              <Loading3Fill className="size-6 animate-spin text-[var(--wm-text-03)]" />
            )}
          </span>
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      {showFooter && (footerMessage || showCharCount) && (
        <div className="flex gap-2 items-center w-full shrink-0">
          {footerMessage && (
            <p
              className={cn(
                'flex-1 min-w-0 text-xs leading-4 font-normal lining-nums tabular-nums whitespace-pre-wrap',
                footerTextClass,
              )}
            >
              {footerMessage}
            </p>
          )}

          {showCharCount && (
            <p className="text-xs leading-4 font-medium shrink-0 text-[var(--wm-text-03)] lining-nums tabular-nums">
              {charCount}
              {maxLength ? `/${maxLength}` : ''}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default InputField
