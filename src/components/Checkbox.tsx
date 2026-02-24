/**
 * Checkbox — Whales Market Design System
 *
 * Figma: https://www.figma.com/design/ievx5gIqlhh6fUQoaOp5rH?node-id=31357-15191
 *
 * value         → unchecked | checked | indeterminate
 * state         → default | hover (CSS) | disabled
 * labelPosition → right | left
 *
 * Box background per state:
 *  unchecked  default  → bg-03 (#252527) + border-2 border-04 (#44444b)
 *  unchecked  hover    → bg-03 + white/10 overlay + border-05 (#57575d)
 *  checked    default  → bg-primary (#16c284), no border, CheckFill icon
 *  checked    hover    → bg-primary + white/10 overlay
 *  indeterminate       → bg-primary, MinimizeFill icon (same as checked)
 *  disabled            → opacity-40 on the slot only
 *
 * Structure:
 *  <label group>
 *    [slot]  flex items-center p-[2px] → box 16×16 (relative overflow-hidden)
 *    [label] flex flex-col gap-1 → label (text-sm medium) + description (text-xs)
 */

import {
  forwardRef,
  useId,
  useRef,
  useEffect,
  type InputHTMLAttributes,
} from 'react'
import { CheckFill, MinimizeFill } from '@mingcute/react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Optional label text shown next to the checkbox */
  label?:          string
  /** Optional secondary description text below the label */
  description?:    string
  /** Position of the label relative to the checkbox box */
  labelPosition?:  'right' | 'left'
  /** Indeterminate state (dash icon, overrides checked visually) */
  indeterminate?:  boolean
  /** Additional className for the outer wrapper <label> */
  wrapperClassName?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      label,
      description,
      labelPosition    = 'right',
      indeterminate    = false,
      disabled,
      checked,
      defaultChecked,
      onChange,
      id,
      className,
      wrapperClassName,
      ...props
    },
    ref,
  ) {
    const generatedId = useId()
    const inputId = id ?? generatedId

    // Allow external ref + internal ref for indeterminate property
    const internalRef = useRef<HTMLInputElement>(null)
    const resolvedRef = (ref as React.RefObject<HTMLInputElement>) ?? internalRef

    // Sync indeterminate DOM prop (not an HTML attribute, must be set via JS)
    useEffect(() => {
      if (resolvedRef.current) {
        resolvedRef.current.indeterminate = indeterminate
      }
    }, [indeterminate, resolvedRef])

    // ── Determine visual state ─────────────────────────────────────────────
    // "active" = filled box (checked OR indeterminate)
    const isActive = !!(checked ?? defaultChecked) || indeterminate

    // ── Box classes ───────────────────────────────────────────────────────
    const boxClass = cn(
      // Base layout & shape
      'relative flex items-center justify-center',
      'size-4 rounded-[var(--radius-sm,4px)] shrink-0 overflow-hidden',
      'transition-colors duration-150',
      // Per-state background
      isActive
        ? 'bg-[var(--wm-bg-primary)]'
        : 'bg-[var(--wm-bg-03)] border-2 border-[var(--wm-border-04)]',
      // Hover border (unchecked only — for active, bg change via overlay)
      !isActive && 'group-hover:border-[var(--wm-border-05)]',
    )

    // ── Slot (wraps box + hidden input) ───────────────────────────────────
    const slot = (
      <div
        className={cn(
          'relative flex items-center justify-center p-0.5 shrink-0',
          disabled && 'opacity-40',
        )}
      >
        {/* Hidden native input — click target for accessibility */}
        <input
          ref={resolvedRef}
          type="checkbox"
          id={inputId}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={onChange}
          className={cn(
            'absolute inset-0 opacity-0 size-full',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer',
            className,
          )}
          {...props}
        />

        {/* Visual checkbox box */}
        <div className={boxClass}>
          {/* Hover overlay (white +10%) */}
          <span
            className={cn(
              'absolute inset-0 bg-white/10',
              'opacity-0 group-hover:opacity-100',
              'transition-opacity duration-150 pointer-events-none',
            )}
            aria-hidden="true"
          />

          {/* Check / indeterminate icon */}
          {isActive && (
            <span
              className="relative z-10 flex items-center justify-center text-white"
              aria-hidden="true"
            >
              {indeterminate
                ? <MinimizeFill className="size-3" />
                : <CheckFill className="size-3" />
              }
            </span>
          )}
        </div>
      </div>
    )

    // ── Label content ─────────────────────────────────────────────────────
    const labelContent = (label || description) ? (
      <div className="flex flex-1 flex-col gap-1 items-start min-w-0">
        {label && (
          <span
            className={cn(
              'text-sm font-medium leading-5 lining-nums tabular-nums w-full',
              disabled
                ? 'text-[var(--wm-text-01)] opacity-40'
                : 'text-[var(--wm-text-01)]',
            )}
          >
            {label}
          </span>
        )}
        {description && (
          <span
            className={cn(
              'text-xs font-normal leading-4 lining-nums tabular-nums w-full',
              disabled
                ? 'text-[var(--wm-text-03)] opacity-40'
                : 'text-[var(--wm-text-03)]',
            )}
          >
            {description}
          </span>
        )}
      </div>
    ) : null

    return (
      <label
        htmlFor={inputId}
        className={cn(
          'group inline-flex gap-2 items-start',
          disabled ? 'pointer-events-none cursor-default' : 'cursor-pointer',
          wrapperClassName,
        )}
      >
        {labelPosition === 'right' ? (
          <>{slot}{labelContent}</>
        ) : (
          <>{labelContent}{slot}</>
        )}
      </label>
    )
  },
)

export default Checkbox
