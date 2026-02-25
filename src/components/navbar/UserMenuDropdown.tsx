/**
 * UserMenuDropdown — Whales Market wallet/user menu panel
 * Figma: node 36144:62631
 *
 * Extracted specs:
 *  Shell:      bg-bg-02 (#1b1b1c), rounded-2xl (12px), shadow 0 0 32px rgba(0,0,0,0.2), overflow-hidden
 *
 *  Section 1 (user info, border-b):
 *    gap: 12px | padding: 16px
 *    Avatar:      size-40 rounded-full, border-2 border-bg-01, bg-bg-03, wrapper p-2
 *    Address:     16px / medium / lh-24 / text-01
 *    Copy slot:   p-4px → icon size-24px (Copy2Line)
 *    Explorer:    border-b border-border-02, 14px / regular / text-02
 *    Arrow slot:  p-2px → icon size-24px (ArrowRightUpLine)
 *
 *  Section 2 (nav items, border-b):
 *    gap: 4px | padding: 8px
 *    Item: gap-8px px-8px py-6px rounded-lg (8px)
 *    Icon slot: p-2px → icon size-24px | Label: 14px / medium / text-01
 *    Hover: bg-bg-03
 *
 *  Section 3 (disconnect, no border):
 *    padding: 8px
 *    Same item layout, text + icon = text-danger (#fd5e67)
 */

import { type ComponentType, useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import {
  Copy2Line,
  CheckFill,
  ArrowRightUpLine,
  BillFill,
  PigMoneyFill,
  UserAdd2Fill,
  ExitDoorLine,
} from '@mingcute/react'
import { TooltipPortal } from '@/components/Tooltip'
import { useLanguage } from '@/contexts/LanguageContext'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserMenuDropdownProps {
  address:      string
  avatarSrc?:   string
  onDisconnect: () => void
  onClose:      () => void
}

type NavItemDef =
  | { id: string; labelKey: string; type: 'icon';  Icon: ComponentType<{ className?: string }> }
  | { id: string; labelKey: string; type: 'image'; imgSrc: string }

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItemDef[] = [
  { id: 'dashboard',  labelKey: 'menu.dashboard',  type: 'icon',  Icon: BillFill                         },
  { id: 'staking',    labelKey: 'menu.staking',    type: 'icon',  Icon: PigMoneyFill                     },
  { id: 'incentives', labelKey: 'menu.incentives', type: 'image', imgSrc: '/assets/incentive-token.svg'  },
  { id: 'referral',   labelKey: 'menu.referral',   type: 'icon',  Icon: UserAdd2Fill                     },
]

// ─── UserMenuDropdown ─────────────────────────────────────────────────────────

export default function UserMenuDropdown({
  address,
  avatarSrc,
  onDisconnect,
  onClose,
}: UserMenuDropdownProps) {

  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)
  const copyTimerRef        = useRef<ReturnType<typeof setTimeout> | null>(null)
  const copyBtnRef          = useRef<HTMLDivElement>(null)

  function handleCopyAddress() {
    navigator.clipboard.writeText(address).catch(() => {})
    setCopied(true)
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={cn(
        'flex flex-col w-[220px]',
        'bg-[var(--wm-bg-02)] rounded-[var(--radius-2xl,12px)]',
        'shadow-[0_0_32px_rgba(0,0,0,0.2)] overflow-hidden',
      )}
    >

      {/* ── Section 1: User info ─────────────────────────────────────── */}
      <div className="flex items-center gap-3 p-4 border-b border-[var(--wm-border-02)]">

        {/* Avatar — wrapper p-[2px], inner size-10, rounded-full, border-2 border-bg-01 */}
        <div className="p-0.5 shrink-0">
          <div className="size-10 rounded-full overflow-hidden bg-[var(--wm-bg-03)] border-2 border-[var(--wm-bg-01)]">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="User avatar"
                className="size-full object-cover pointer-events-none"
              />
            ) : (
              <div className="size-full flex items-center justify-center text-sm font-bold text-[var(--wm-text-01)]">
                W
              </div>
            )}
          </div>
        </div>

        {/* Wallet info */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">

          {/* Address row */}
          <div className="flex items-center gap-1 min-w-0">
            <span
              className="text-base font-medium leading-6 text-[var(--wm-text-01)] truncate"
              style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
            >
              {address}
            </span>
            {/* Copy icon — switches to CheckFill + portal tooltip for 2s */}
            <div ref={copyBtnRef} className="shrink-0">
              <button
                onClick={handleCopyAddress}
                aria-label="Copy address"
                className={cn(
                  'p-0.5 transition-colors duration-150 cursor-pointer outline-none',
                  copied
                    ? 'text-[var(--wm-text-green)]'
                    : 'text-[var(--wm-icon-03)] hover:text-[var(--wm-icon-01)]',
                )}
              >
                {copied
                  ? <CheckFill className="size-4" />
                  : <Copy2Line className="size-4" />
                }
              </button>
              <TooltipPortal
                content={t('tooltip.copied')}
                visible={copied}
                anchorRef={copyBtnRef}
                arrowSide="bottom"
              />
            </div>
          </div>

          {/* Open in Explorer link */}
          <button
            onClick={(e) => { e.preventDefault(); onClose() }}
            aria-label="Open in Explorer"
            className="inline-flex items-center gap-0 border-b border-[var(--wm-border-02)] w-fit group outline-none cursor-pointer"
          >
            <span className="text-xs leading-4 text-[var(--wm-text-03)] whitespace-nowrap group-hover:text-[var(--wm-text-01)] transition-colors duration-150">
              {t('menu.openExplorer')}
            </span>
            {/* Arrow slot — p-[2px], icon size-6 (24px) */}
            <span className="p-0.5 text-[var(--wm-icon-03)] group-hover:text-[var(--wm-icon-01)] transition-colors duration-150">
              <ArrowRightUpLine className="size-4" />
            </span>
          </button>

        </div>
      </div>

      {/* ── Section 2: Nav items ─────────────────────────────────────── */}
      <div className="flex flex-col gap-1 p-2 border-b border-[var(--wm-border-02)]">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={onClose}
            className={cn(
              'flex items-center gap-2 w-full',
              'px-2 py-1.5 rounded-[var(--radius-lg,8px)]',
              'text-sm font-medium leading-5 text-[var(--wm-text-01)]',
              'hover:bg-[var(--wm-bg-03)] active:bg-[var(--wm-bg-04)]',
              'transition-colors duration-150 cursor-pointer outline-none',
            )}
          >
            {/* Icon slot — p-[2px] wrapper, icon/image size-4 (16px) */}
            <span className="p-0.5 shrink-0 text-[var(--wm-icon-02)]">
              {item.type === 'icon' ? (
                <item.Icon className="size-4" />
              ) : (
                <img
                  src={item.imgSrc}
                  alt=""
                  draggable="false"
                  className="size-4 rounded-[var(--radius-sm,4px)] object-cover"
                />
              )}
            </span>
            <span className="flex-1 text-left">{t(item.labelKey as Parameters<typeof t>[0])}</span>
          </button>
        ))}
      </div>

      {/* ── Section 3: Disconnect ────────────────────────────────────── */}
      <div className="p-2">
        <button
          onClick={() => { onDisconnect(); onClose() }}
          className={cn(
            'flex items-center gap-2 w-full',
            'px-2 py-1.5 rounded-[var(--radius-lg,8px)]',
            'text-sm font-medium leading-5 text-[var(--wm-text-danger)]',
            'hover:bg-[var(--wm-bg-danger-muted-5)] active:bg-[var(--wm-bg-danger-muted-10)]',
            'transition-colors duration-150 cursor-pointer outline-none',
          )}
        >
          {/* Icon slot — p-[2px] wrapper, size-4 */}
          <span className="p-0.5 shrink-0 text-[var(--wm-icon-danger)]">
            <ExitDoorLine className="size-4" />
          </span>
          <span className="flex-1 text-left">{t('menu.disconnect')}</span>
        </button>
      </div>

    </div>
  )
}
