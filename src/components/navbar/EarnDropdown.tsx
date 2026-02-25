/**
 * EarnDropdown — Navbar "Earn" mega-menu panel
 * Figma: node 36144:61841
 *
 * Shell:   bg-bg-02, rounded-2xl (12px), p-4, gap-4, shadow-modal, overflow-hidden
 * Item:    flex gap-2 items-start — Link with group hover states
 *   Icon slot:  p-[2px] wrapper, icon size-5
 *   Content:    flex-1 flex-col gap-1 pb-4 border-b border-02 (no border on last)
 *   Title row:  14px/medium/lh-20
 *     default → text-01  |  hover → text-green
 *     ArrowRightLine size-4: opacity-0 default → opacity-100 on hover
 *   Description: 12px/regular/lh-16/text-03
 *
 * States: default · hover · active (via group on Link)
 */

import { Link } from 'react-router-dom'
import { type ComponentType } from 'react'
import { cn } from '@/lib/utils'
import { BillFill, PigMoneyFill, Gift2Fill, UserAdd2Fill, ArrowRightLine } from '@mingcute/react'

// ─── Items config ─────────────────────────────────────────────────────────────

interface EarnItem {
  id:          string
  label:       string
  description: string
  href:        string
  Icon:        ComponentType<{ className?: string }>
}

const EARN_ITEMS: EarnItem[] = [
  {
    id:          'dashboard',
    label:       'Dashboard',
    description: 'Track your portfolio.',
    href:        '/dashboard',
    Icon:        BillFill,
  },
  {
    id:          'staking',
    label:       'Staking',
    description: 'Secure. Stake. Earn.',
    href:        '/earn/staking',
    Icon:        PigMoneyFill,
  },
  {
    id:          'incentives',
    label:       'Incentives',
    description: 'Do more. Get more.',
    href:        '/earn/incentives',
    Icon:        Gift2Fill,
  },
  {
    id:          'referral',
    label:       'Referral',
    description: 'Bring users. Share gains.',
    href:        '/earn/referral',
    Icon:        UserAdd2Fill,
  },
]

// ─── EarnDropdown ─────────────────────────────────────────────────────────────

export default function EarnDropdown({ onClose, isExiting = false }: { onClose: () => void; isExiting?: boolean }) {
  return (
    <div
      className={cn(
        // Shell
        'absolute top-[calc(100%+4px)] left-0 z-50',
        'w-[260px]',
        'bg-[var(--wm-bg-02)] rounded-[var(--radius-2xl,12px)]',
        'shadow-[0_0_32px_rgba(0,0,0,0.2)] overflow-hidden',
        'flex flex-col gap-4 p-4',
        // Enter / exit animation
        isExiting
          ? 'animate-out fade-out zoom-out-95 duration-150 origin-top-left'
          : 'animate-in fade-in zoom-in-95 duration-150 origin-top-left',
      )}
    >
      {EARN_ITEMS.map((item, idx) => {
        const isLast = idx === EARN_ITEMS.length - 1
        return (
          <Link
            key={item.id}
            to={item.href}
            onClick={onClose}
            className="group flex gap-2 items-start w-full outline-none"
          >
            {/* ── Icon slot — p-[2px] wrapper, icon size-5 ──────────── */}
            <span
              className={cn(
                'p-0.5 shrink-0',
                'text-[var(--wm-icon-02)]',
                'group-hover:text-[var(--wm-text-green)]',
                'transition-colors duration-150',
              )}
            >
              <item.Icon className="size-4" />
            </span>

            {/* ── Content ───────────────────────────────────────────── */}
            <div
              className={cn(
                'flex-1 min-w-0 flex flex-col gap-1',
                !isLast && 'pb-4 border-b border-[var(--wm-border-02)]',
              )}
            >
              {/* Title row */}
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    'text-sm font-medium leading-5 shrink-0',
                    'text-[var(--wm-text-01)]',
                    'group-hover:text-[var(--wm-text-green)]',
                    'transition-colors duration-150',
                  )}
                  style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
                >
                  {item.label}
                </span>

                {/* Arrow — hidden by default, slides in on hover */}
                <ArrowRightLine
                  className={cn(
                    'size-4 shrink-0',
                    'text-[var(--wm-text-green)]',
                    'opacity-0 -translate-x-1',
                    'group-hover:opacity-100 group-hover:translate-x-0',
                    'transition-[opacity,transform] duration-150',
                  )}
                />
              </div>

              {/* Description */}
              <p
                className="text-xs leading-4 text-[var(--wm-text-03)]"
                style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
              >
                {item.description}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
