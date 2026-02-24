/**
 * Toast — Whales Market notification toast
 * Figma: node 31367:6674
 *
 * Variants: neutral | success | danger | warning | info | in-progress
 *
 * Shell:     w-[360px] bg-bg-02 rounded-xl p-3 gap-2 shadow-toast overflow-hidden
 * Icon:      size-6 — semantic color per type
 * Label:     14px/medium/lh-20/text-01
 * Body:      12px/regular/lh-16/text-02
 * Actions:   flex gap-2 pb-2 — primary (bg-primary) + optional secondary (border-02)
 *            px-3 py-[6px] rounded-md text-xs/medium
 * Close:     CloseFill size-6 p-[2px] wrapper
 * Timer bar: absolute bottom-0 left-0 h-[2px] — color per type
 *
 * Timer bar colors:
 *   neutral/in-progress → #16c284 (primary green)
 *   success             → #16c284
 *   danger              → #ff3b46
 *   warning             → #f97316
 *   info                → #3b82f6
 */

import {
  createContext, useContext, useCallback, useState, useEffect,
  type ReactNode,
} from 'react'
import {
  CheckCircleFill,
  AlertFill,
  WarningFill,
  InformationFill,
  Loading3Fill,
  CloseFill,
} from '@mingcute/react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = 'neutral' | 'success' | 'danger' | 'warning' | 'info' | 'in-progress'

export interface ToastAction {
  label:    string
  onClick:  () => void
  variant?: 'primary' | 'secondary'   // default: 'primary'
}

export interface ToastData {
  id:        string
  type?:     ToastType        // default: 'neutral'
  title:     string
  body?:     string
  actions?:  ToastAction[]    // up to 2 action buttons
  duration?: number           // ms — default 4000
}

interface ToastContextValue {
  push: (t: Omit<ToastData, 'id'>) => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue>({ push: () => {} })

export function useToast(): ToastContextValue {
  return useContext(ToastContext)
}

// ─── Type → icon + colors config ─────────────────────────────────────────────

interface TypeConfig {
  Icon:     React.ComponentType<{ className?: string }>
  iconCls:  string
  timerCls: string
}

const TYPE_CONFIG: Record<ToastType, TypeConfig> = {
  neutral: {
    Icon:     InformationFill,
    iconCls:  'text-[var(--wm-icon-02)]',
    timerCls: 'bg-wm-bg-primary',
  },
  success: {
    Icon:     CheckCircleFill,
    iconCls:  'text-wm-text-green-dark',
    timerCls: 'bg-wm-bg-primary',
  },
  danger: {
    Icon:     AlertFill,
    iconCls:  'text-wm-text-danger-dark',
    timerCls: 'bg-wm-bg-danger',
  },
  warning: {
    Icon:     WarningFill,
    iconCls:  'text-wm-text-warning-dark',
    timerCls: 'bg-wm-bg-warning',
  },
  info: {
    Icon:     InformationFill,
    iconCls:  'text-wm-text-info-dark',
    timerCls: 'bg-wm-bg-info',
  },
  'in-progress': {
    Icon:     Loading3Fill,
    iconCls:  'text-wm-text-green-dark',
    timerCls: 'bg-wm-bg-primary',
  },
}

// ─── Single Toast item ────────────────────────────────────────────────────────

const EXIT_DURATION = 200   // ms — matches CSS animate-out duration

function ToastItem({
  toast,
  onDismiss,
}: {
  toast:     ToastData
  onDismiss: () => void
}) {
  const [leaving, setLeaving] = useState(false)
  const duration = toast.duration ?? 4000
  const type     = toast.type ?? 'neutral'
  const { Icon, iconCls, timerCls } = TYPE_CONFIG[type]

  // ── Auto-dismiss after duration ──────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => startLeave(), duration)
    return () => clearTimeout(timer)
  }, [duration]) // eslint-disable-line react-hooks/exhaustive-deps

  function startLeave() {
    setLeaving(true)
    setTimeout(onDismiss, EXIT_DURATION)
  }

  function handleAction(action: ToastAction) {
    action.onClick()
    startLeave()
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        // Shell
        'relative w-[360px] overflow-hidden',
        'bg-[var(--wm-bg-02)] rounded-[var(--radius-xl,10px)]',
        'shadow-[0_0_8px_rgba(0,0,0,0.1)]',
        // Layout
        'flex items-start gap-2 p-3',
        // Enter / exit animation
        leaving
          ? 'animate-out fade-out slide-out-to-bottom-4 duration-200 fill-mode-forwards'
          : 'animate-in  fade-in  slide-in-from-bottom-4 duration-200',
      )}
    >
      {/* ── Leading icon ─────────────────────────────────────────────────── */}
      <Icon
        className={cn(
          'size-6 shrink-0 mt-0.5',
          iconCls,
          type === 'in-progress' && 'animate-spin',
        )}
        aria-hidden="true"
      />

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <p
            className="text-sm font-medium leading-5 text-[var(--wm-text-01)]"
            style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
          >
            {toast.title}
          </p>
          {toast.body && (
            <p className="text-xs leading-4 text-[var(--wm-text-02)]">
              {toast.body}
            </p>
          )}
        </div>

        {/* ── Action buttons ─────────────────────────────────────────────── */}
        {toast.actions && toast.actions.length > 0 && (
          <div className="flex gap-2 items-center pb-2">
            {toast.actions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleAction(action)}
                className={cn(
                  'shrink-0 px-3 py-1.5 rounded-[var(--radius-md,6px)]',
                  'text-xs font-medium leading-4',
                  'transition-colors duration-150 cursor-pointer outline-none',
                  action.variant === 'secondary'
                    ? 'border border-[var(--wm-border-02)] text-[var(--wm-text-01)] hover:bg-[var(--wm-bg-03)]'
                    : 'bg-[var(--wm-bg-primary)] text-wm-text-01 hover:opacity-90',
                )}
                style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Close button ─────────────────────────────────────────────────── */}
      <button
        onClick={startLeave}
        aria-label="Dismiss notification"
        className="p-0.5 shrink-0 text-[var(--wm-icon-02)] hover:text-[var(--wm-icon-01)] transition-colors duration-150 cursor-pointer outline-none"
      >
        <CloseFill className="size-4" />
      </button>

      {/* ── Timer bar ────────────────────────────────────────────────────── */}
      {!leaving && (
        <div
          className={cn('toast-progress absolute bottom-0 left-0 h-0.5', timerCls)}
          style={{ animationDuration: `${duration}ms` }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

// ─── Toast Container ──────────────────────────────────────────────────────────

function ToastContainer({
  items,
  onDismiss,
}: {
  items:     ToastData[]
  onDismiss: (id: string) => void
}) {
  if (items.length === 0) return null

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-6 left-6 z-[200] flex flex-col-reverse gap-3 items-start pointer-events-none"
    >
      {items.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem
            toast={toast}
            onDismiss={() => onDismiss(toast.id)}
          />
        </div>
      ))}
    </div>
  )
}

// ─── ToastProvider ────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastData[]>([])

  const push = useCallback((t: Omit<ToastData, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
    setItems((prev) => [...prev, { ...t, id }])
  }, [])

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <ToastContainer items={items} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}
