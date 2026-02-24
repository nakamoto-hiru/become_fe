/**
 * ResourcesDropdown — Navbar "Resources" mega-menu panel
 * Figma: node 43412:118786
 *
 * Shell:   bg-bg-02, rounded-2xl (12px), p-4, gap-4, shadow-modal, overflow-hidden
 * Item:    flex gap-2 items-start — anchor with group hover states
 *   Icon slot:  p-[2px] wrapper (mascot: p-[2px] size-4 | icon: size-4 | image: size-4 rounded-full)
 *   Content:    flex-1 flex-col gap-1 pb-4 border-b border-02 (no border on last)
 *   Title row:  14px/medium/lh-20
 *     default → text-01  |  hover → text-green
 *     ArrowRightLine size-4: opacity-0 default → opacity-100 on hover
 *   Description: 12px/regular/lh-16/text-03
 *
 * Items: About (mascot img) · Docs (Book2Line) · Dune Dashboard (rounded-full img)
 * All items are external links (target="_blank")
 */

import { type ComponentType } from 'react'
import { cn } from '@/lib/utils'
import { Book2Fill, ArrowRightLine } from '@mingcute/react'

// ─── Items config ─────────────────────────────────────────────────────────────

type ResourceIcon =
  | { type: 'icon';   Icon: ComponentType<{ className?: string }> }
  | { type: 'mascot'; src:  string }
  | { type: 'image';  src:  string }

interface ResourceItem {
  id:          string
  label:       string
  description: string
  href:        string
  icon:        ResourceIcon
}

const RESOURCE_ITEMS: ResourceItem[] = [
  {
    id:          'about',
    label:       'About',
    description: 'Secure. Stake. Earn.',
    href:        'https://whales.market',
    icon:        { type: 'mascot', src: '/assets/wm-mascot.svg' },
  },
  {
    id:          'docs',
    label:       'Docs',
    description: 'Do more. Get more.',
    href:        'https://docs.whales.market',
    icon:        { type: 'icon', Icon: Book2Fill },
  },
  {
    id:          'dune',
    label:       'Dune Dashboard',
    description: 'Bring users. Share gains.',
    href:        'https://dune.com/whale_market',
    icon:        { type: 'image', src: '/assets/dune-logo.png' },
  },
]

// ─── IconSlot ─────────────────────────────────────────────────────────────────

function IconSlot({ icon }: { icon: ResourceIcon }) {
  const wrapCls = 'p-0.5 shrink-0 transition-colors duration-150'

  if (icon.type === 'icon') {
    return (
      <span className={cn(wrapCls, 'text-[var(--wm-icon-02)] group-hover:text-[var(--wm-text-green)]')}>
        <icon.Icon className="size-4" />
      </span>
    )
  }

  if (icon.type === 'mascot') {
    return (
      <span className={cn(wrapCls, 'opacity-90 group-hover:opacity-100')}>
        <img
          src={icon.src}
          alt=""
          draggable={false}
          className="size-4 object-contain pointer-events-none"
        />
      </span>
    )
  }

  // type === 'image' — rounded-full (e.g. Dune logo)
  return (
    <span className={wrapCls}>
      <img
        src={icon.src}
        alt=""
        draggable={false}
        className="size-4 rounded-full object-cover pointer-events-none"
      />
    </span>
  )
}

// ─── ResourcesDropdown ────────────────────────────────────────────────────────

export default function ResourcesDropdown({ onClose, isExiting = false }: { onClose: () => void; isExiting?: boolean }) {
  return (
    <div
      className={cn(
        // Shell — right-aligned since Resources is near the right edge of nav
        'absolute top-[calc(100%+4px)] right-0 z-50',
        'w-[260px]',
        'bg-[var(--wm-bg-02)] rounded-[var(--radius-2xl,12px)]',
        'shadow-[0_0_32px_rgba(0,0,0,0.2)] overflow-hidden',
        'flex flex-col gap-4 p-4',
        // Enter / exit animation
        isExiting
          ? 'animate-out fade-out zoom-out-95 duration-150 origin-top-right'
          : 'animate-in fade-in zoom-in-95 duration-150 origin-top-right',
      )}
    >
      {RESOURCE_ITEMS.map((item, idx) => {
        const isLast = idx === RESOURCE_ITEMS.length - 1
        return (
          <a
            key={item.id}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="group flex gap-2 items-start w-full outline-none"
          >
            {/* ── Icon slot ──────────────────────────────────────────── */}
            <IconSlot icon={item.icon} />

            {/* ── Content ────────────────────────────────────────────── */}
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
          </a>
        )
      })}
    </div>
  )
}
