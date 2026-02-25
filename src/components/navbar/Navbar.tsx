/**
 * Navbar — Whales Market Global Navigation
 * Figma: node 46153:840182
 *
 * Layout:
 *   Left:  [Logo]  [Pre-market] [Dashboard] [Earn ▾] [Resources ▾]
 *   Right: [Chain ▾] [Fee] [Balance] [Avatar] | [?] [🌐]
 *
 * Shell:     border-b border-[#1b1b1c], sticky top-0, bg-[#0a0a0b]
 * Container: max-w-[1440px] mx-auto  px-[48px]  py-[12px]
 *
 * Figma-verified specs:
 *  - Nav font:      14px / lh-20px / font-medium / text-01
 *  - Nav padding:   px-[16px] py-[8px]  radius-lg (8px)
 *  - Dropdown nav:  pl-[16px] pr-[8px] py-[8px] gap-[6px]
 *  - Down icon:     size-[24px] (DownFill from @mingcute/react)
 *  - Chain btn:     p-[8px] gap-[6px] border border-02  radius-lg
 *  - Fee btn:       h-[36px] p-[8px] gap-[6px] border-02 radius-lg
 *  - Badge:         px-[8px] py-[4px] bg-primary-muted-10 radius-full  10px uppercase text-green
 *  - Balance btn:   pl-[8px] pr-[12px] py-[8px] gap-[6px] border-02  radius-lg
 *  - Avatar:        size-[32px] border-2 border-bg-01  bg-03  radius-full  p-[2px] wrapper
 *  - Divider:       w-[1px] h-[16px]  bg-border-02
 *  - Icon btns:     p-[8px]  bg-02  radius-full  icon size-[24px]
 */

import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { DownFill, QuestionLine, World2Line, MenuLine, CloseLine } from '@mingcute/react'
import { cn } from '@/lib/utils'
import ConnectWalletModal from './ConnectWalletModal'
import UserMenuDropdown from './UserMenuDropdown'
import { useToast } from '@/components/Toast'
import EarnDropdown from './EarnDropdown'
import ResourcesDropdown from './ResourcesDropdown'
import LanguageDropdown from './LanguageDropdown'
import ChainDropdown from './ChainDropdown'
import { LANGUAGES } from '@/mock-data/languages'
import { CHAINS } from '@/mock-data/chains'
import type { Chain } from '@/mock-data/chains'
import { useLanguage } from '@/contexts/LanguageContext'
import { TRANSLATIONS, type TranslationKey } from '@/i18n/translations'

// ─── Nav items config ─────────────────────────────────────────────────────────

interface DropdownItem  { label: string; href: string }
interface NavItemConfig {
  labelKey:  TranslationKey
  href:      string
  dropdown?: DropdownItem[]
  panel?:    'earn' | 'resources'   // custom rich panel (replaces dropdown)
}

const NAV_ITEMS: NavItemConfig[] = [
  { labelKey: 'nav.premarket', href: '/premarket'  },
  { labelKey: 'nav.dashboard', href: '/dashboard' },
  { labelKey: 'nav.earn',      href: '/earn',     panel: 'earn' },
  { labelKey: 'nav.resources', href: '/resources', panel: 'resources' },
]

// ─── Shared hook: animated panel (enter + exit) ───────────────────────────────

/**
 * Tracks render + exit state for a dropdown panel.
 * Keeps the element mounted for `delay`ms after `open` goes false so exit
 * animation can play before the DOM node is removed.
 */
function useAnimatedPanel(open: boolean, delay = 150) {
  const [rendered, setRendered] = useState(false)
  const [exiting, setExiting]   = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    clearTimeout(timerRef.current)
    if (open) {
      setRendered(true)
      setExiting(false)
    } else {
      // Only animate-out if it was actually rendered
      setRendered(prev => {
        if (!prev) return false
        setExiting(true)
        timerRef.current = setTimeout(() => {
          setRendered(false)
          setExiting(false)
        }, delay)
        return true // keep rendered=true during exit
      })
    }
    return () => clearTimeout(timerRef.current)
  }, [open, delay])

  return { rendered, exiting }
}

// ─── Shared hook: close on outside click ─────────────────────────────────────

function useOutsideClick(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [ref, onClose])
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <Link
      to="/"
      className="flex items-center shrink-0 p-1.5 hover:opacity-90 transition-opacity outline-none"
      aria-label="Whales Market home"
    >
      <img src="/logo.svg" alt="Whales Market" className="h-9 w-auto" />
    </Link>
  )
}

// ─── Nav dropdown panel ───────────────────────────────────────────────────────

function DropdownPanel({
  items,
  onClose,
  isExiting = false,
}: {
  items:     DropdownItem[]
  onClose:   () => void
  isExiting?: boolean
}) {
  return (
    <div
      className={cn(
        'absolute top-[calc(100%+4px)] left-0 z-50 min-w-[176px]',
        'bg-[var(--wm-bg-02)] border border-[var(--wm-border-02)]',
        'rounded-[var(--radius-lg,8px)] py-1 shadow-xl',
        isExiting
          ? 'animate-out fade-out zoom-out-95 duration-150 origin-top-left'
          : 'animate-in fade-in zoom-in-95 duration-150 origin-top-left',
      )}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          onClick={onClose}
          className="block px-4 py-2 text-sm font-medium leading-5 text-[var(--wm-text-01)] hover:bg-[var(--wm-bg-02)] transition-colors duration-100"
        >
          {item.label}
        </Link>
      ))}
    </div>
  )
}

// ─── Nav item ─────────────────────────────────────────────────────────────────

function NavItem({ item, isActive, label }: { item: NavItemConfig; isActive: boolean; label: string }) {
  const [open, setOpen] = useState(false)
  const ref             = useRef<HTMLDivElement>(null)
  const closePanel      = useCallback(() => setOpen(false), [])
  useOutsideClick(ref, closePanel)

  // Animate-in + animate-out for the panel
  const panel = useAnimatedPanel(open && !!(item.dropdown || item.panel))

  const textColor = isActive ? 'text-[var(--wm-text-green)]' : 'text-[var(--wm-text-01)]'
  const hoverBg   = 'hover:bg-[var(--wm-bg-02)] active:bg-[var(--wm-bg-03)]'

  if (item.dropdown || item.panel) {
    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'group flex items-center gap-1.5 pl-4 pr-2 py-2',
            'rounded-[var(--radius-lg,8px)] shrink-0',
            'text-sm font-medium leading-5 lining-nums tabular-nums whitespace-nowrap',
            'transition-colors duration-150 cursor-pointer outline-none',
            hoverBg,
          )}
        >
          <span className={textColor}>{label}</span>
          {/* Wrap in span so DownFill's inline style="color:currentColor"
              inherits from span's color (inline style wins over className) */}
          <span
            className={cn(
              'inline-flex shrink-0',
              'transition-all duration-200',
              isActive
                ? 'text-[var(--wm-text-green)]'
                : 'text-[var(--wm-icon-03)] group-hover:text-[var(--wm-icon-01)]',
              open ? 'rotate-180' : 'rotate-0',
            )}
          >
            <DownFill className="size-4" />
          </span>
        </button>

        {/* Rich Earn panel */}
        {panel.rendered && item.panel === 'earn' && (
          <EarnDropdown onClose={closePanel} isExiting={panel.exiting} />
        )}

        {/* Rich Resources panel */}
        {panel.rendered && item.panel === 'resources' && (
          <ResourcesDropdown onClose={closePanel} isExiting={panel.exiting} />
        )}

        {/* Default simple panel */}
        {panel.rendered && item.dropdown && (
          <DropdownPanel items={item.dropdown} onClose={closePanel} isExiting={panel.exiting} />
        )}
      </div>
    )
  }

  return (
    <Link
      to={item.href}
      className={cn(
        'flex items-center px-4 py-2',
        'rounded-[var(--radius-lg,8px)] shrink-0',
        'text-sm font-medium leading-5 lining-nums tabular-nums whitespace-nowrap',
        'transition-colors duration-150 outline-none',
        hoverBg, textColor,
      )}
    >
      {label}
    </Link>
  )
}

// ─── WhalesBadge  (-0% Fee) ───────────────────────────────────────────────────

function WhalesBadge() {
  return (
    <span
      className="flex items-center justify-center px-2 py-1 rounded-full shrink-0 bg-[var(--wm-bg-primary-muted-10)]"
    >
      <span
        className="text-[10px] font-medium leading-3 uppercase text-[var(--wm-text-green)] lining-nums tabular-nums"
        style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
      >
        -0% Fee
      </span>
    </span>
  )
}

// ─── Chain selector ──────────────────────────────────────────────────────────

// Networks supported directly by ConnectWalletModal — others fall back to 'ethereum'
const MODAL_NETWORK_IDS = new Set(['solana', 'ethereum', 'bsc', 'arbitrum', 'base', 'avax'])

function resolveModalNetworkId(chainId: string): string {
  return MODAL_NETWORK_IDS.has(chainId) ? chainId : 'ethereum'
}

interface ChainSelectorProps {
  chain:    Chain
  onSelect: (chain: Chain) => void
}

function ChainSelector({ chain, onSelect }: ChainSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref             = useRef<HTMLDivElement>(null)
  useOutsideClick(ref, () => setOpen(false))

  return (
    <div ref={ref} className="relative shrink-0">
      {/* ── Trigger button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'group flex items-center gap-1.5 px-2 h-9 rounded-[var(--radius-lg,8px)] shrink-0',
          'border border-[var(--wm-border-02)]',
          'hover:bg-[var(--wm-bg-02)] active:bg-[var(--wm-bg-03)]',
          'transition-colors duration-150 cursor-pointer outline-none',
        )}
      >
        {/* Current chain icon — 16×16 */}
        <img
          src={chain.icon}
          alt={chain.name}
          className="size-4 rounded-[var(--radius-sm,4px)] object-cover shrink-0]"
          onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0' }}
        />
        {/* Wrap in span — same fix as NavItem; DownFill's inline style="color:currentColor"
            inherits color from the span, so Tailwind text-* classes work correctly */}
        <span
          className={cn(
            'inline-flex shrink-0',
            'transition-[color,transform] duration-200 ease-in-out',
            open
              ? 'rotate-180 text-[var(--wm-icon-01)]'
              : 'rotate-0 text-[var(--wm-icon-03)] group-hover:text-[var(--wm-icon-01)]',
          )}
        >
          <DownFill className="size-4" />
        </span>
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <ChainDropdown
          currentChain={chain}
          onSelect={(c) => { onSelect(c); setOpen(false) }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}

// ─── Tooltip wrapper ─────────────────────────────────────────────────────────

function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="relative group/tip shrink-0">
      {children}
      {/* Tooltip panel — appears below on hover */}
      <div
        className={cn(
          'absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 z-50',
          'pointer-events-none whitespace-nowrap',
          'px-2 py-1 rounded-[var(--radius-md,6px)]',
          'bg-[var(--wm-bg-04)] text-[var(--wm-text-01)]',
          'text-xs font-medium leading-4',
          'shadow-[0_2px_8px_rgba(0,0,0,0.3)]',
          // Visibility
          'opacity-0 group-hover/tip:opacity-100',
          'translate-y-1 group-hover/tip:translate-y-0',
          'transition-[opacity,transform] duration-150',
        )}
      >
        {label}
      </div>
    </div>
  )
}

// ─── Fee block ───────────────────────────────────────────────────────────────

function FeeBlock() {
  const { t } = useLanguage()
  return (
    <Tooltip label={t('tooltip.xwhalesBalance')}>
      <div
        className={cn(
          'flex items-center gap-1.5 h-9 px-2 rounded-[var(--radius-lg,8px)] shrink-0',
          'border border-[var(--wm-border-02)]',
        )}
      >
        <span className="flex items-center p-0.5">
          <img
            src="/assets/coin-fee.png"
            alt=""
            className="size-4 rounded-full object-cover shrink-0"
          />
        </span>
        <span
          className="text-sm font-medium leading-5 text-[var(--wm-text-01)] lining-nums tabular-nums whitespace-nowrap"
          style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
        >
          0.00
        </span>
        <WhalesBadge />
      </div>
    </Tooltip>
  )
}

// ─── Balance block ───────────────────────────────────────────────────────────

function BalanceBlock() {
  const { t } = useLanguage()
  return (
    <Tooltip label={t('tooltip.walletBalance')}>
      <div
        className={cn(
          'flex items-center h-9 gap-1.5 rounded-[var(--radius-lg,8px)] shrink-0',
          'border border-[var(--wm-border-02)]',
          'pl-2 pr-3',
        )}
      >
        <span className="flex items-center p-0.5">
          <img
            src="/assets/coin-balance.png"
            alt=""
            className="size-4 rounded-full object-cover shrink-0"
          />
        </span>
        <span
          className="text-sm font-medium leading-5 text-[var(--wm-text-01)] lining-nums tabular-nums whitespace-nowrap"
          style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
        >
          18.32
        </span>
      </div>
    </Tooltip>
  )
}

// ─── Avatar button ────────────────────────────────────────────────────────────

function AvatarButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="User menu"
      aria-haspopup="true"
      className="flex items-center p-0.5 rounded-full cursor-pointer hover:opacity-80 transition-opacity outline-none shrink-0"
    >
      <div
        className="size-8 rounded-full overflow-hidden bg-[var(--wm-bg-03)] border-2 border-[var(--wm-bg-01)] shrink-0"
      >
        <img
          src="/assets/avatar.png"
          alt="User avatar"
          className="size-full object-cover pointer-events-none"
        />
      </div>
    </button>
  )
}

// ─── Vertical divider ─────────────────────────────────────────────────────────

function VerticalDivider() {
  return <div className="w-px h-4 bg-[var(--wm-border-02)] shrink-0" />
}

// ─── Round icon button (? and 🌐) ─────────────────────────────────────────────

function RoundIconBtn({ icon, label, onClick }: { icon: ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        // p-2 (8px) + size-5 (20px) icon = 36px total — matches other right-side buttons
        'flex items-center justify-center p-2 rounded-full shrink-0',
        'bg-[var(--wm-bg-02)]',
        'hover:bg-[var(--wm-bg-03)] active:bg-[var(--wm-bg-04)]',
        'transition-colors duration-150 cursor-pointer outline-none',
      )}
    >
      <span className="size-5 flex items-center justify-center shrink-0">
        {icon}
      </span>
    </button>
  )
}

// ─── Connect button (disconnected state) ─────────────────────────────────────

function ConnectButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden',
        'h-9 px-4 py-2 shrink-0',
        'bg-[var(--wm-bg-secondary)] text-[var(--wm-text-inv)]',
        'rounded-[var(--radius-lg,8px)]',
        'text-sm font-medium lining-nums tabular-nums',
        // ::before overlay for hover/active (secondary-filled style)
        'before:absolute before:inset-0 before:content-[""] before:pointer-events-none before:rounded-[inherit]',
        'before:transition-colors before:duration-150',
        'hover:before:bg-black/10 active:before:bg-black/40',
        'transition-colors duration-150 cursor-pointer outline-none',
        'btn-pop',
      )}
    >
      {label}
    </button>
  )
}

// ─── Hamburger button (mobile only) ──────────────────────────────────────────

function HamburgerButton({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      className={cn(
        'flex md:hidden items-center justify-center p-2 rounded-[var(--radius-lg,8px)] shrink-0',
        'hover:bg-[var(--wm-bg-02)] active:bg-[var(--wm-bg-03)]',
        'transition-colors duration-150 cursor-pointer outline-none',
      )}
    >
      {isOpen ? (
        <CloseLine className="size-6 text-[var(--wm-text-01)]" />
      ) : (
        <MenuLine className="size-6 text-[var(--wm-text-01)]" />
      )}
    </button>
  )
}

// ─── Mobile Drawer (rendered via createPortal to escape page-fade-in) ────────

function MobileDrawer({
  isOpen,
  onClose,
  navItems,
  isActive,
  t,
  onConnectClick,
  isConnected,
}: {
  isOpen: boolean
  onClose: () => void
  navItems: NavItemConfig[]
  isActive: (href: string) => boolean
  t: (key: TranslationKey) => string
  onConnectClick: () => void
  isConnected: boolean
}) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer panel — slide from left */}
      <div
        className={cn(
          'absolute top-0 left-0 bottom-0 w-[280px]',
          'bg-[var(--wm-bg-01)] border-r border-[var(--wm-border-01)]',
          'flex flex-col',
          'animate-in slide-in-from-left duration-250',
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--wm-border-01)]">
          <Link to="/" onClick={onClose} className="flex items-center shrink-0">
            <img src="/logo.svg" alt="Whales Market" className="h-8 w-auto" />
          </Link>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className={cn(
              'flex items-center justify-center p-2 rounded-full shrink-0',
              'hover:bg-[var(--wm-bg-02)]',
              'transition-colors duration-150 cursor-pointer outline-none',
            )}
          >
            <CloseLine className="size-5 text-[var(--wm-text-02)]" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col py-2" aria-label="Mobile navigation">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-5 py-3.5',
                  'text-label-md transition-colors duration-150',
                  active
                    ? 'text-[var(--wm-text-green)] bg-[var(--wm-bg-02)]'
                    : 'text-[var(--wm-text-01)] hover:bg-[var(--wm-bg-02)]',
                )}
              >
                {t(item.labelKey)}
              </Link>
            )
          })}
        </nav>

        {/* Bottom actions */}
        <div className="mt-auto px-5 py-4 border-t border-[var(--wm-border-01)]">
          {!isConnected && (
            <button
              onClick={() => { onConnectClick(); onClose() }}
              className={cn(
                'w-full flex items-center justify-center',
                'h-10 px-4 py-2',
                'bg-[var(--wm-bg-secondary)] text-[var(--wm-text-inv)]',
                'rounded-[var(--radius-lg,8px)]',
                'text-sm font-medium',
                'transition-colors duration-150 cursor-pointer outline-none',
              )}
            >
              {t('nav.connect')}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export default function Navbar() {
  const { pathname } = useLocation()

  // ── Scroll-aware glassmorphism ────────────────────────────────────────────
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
    onScroll() // initial check
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Mobile drawer state
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Wallet connection state — persisted in localStorage
  const [isConnected,  setIsConnected]  = useState(() => localStorage.getItem('wm_connected') === '1')
  const [showModal,    setShowModal]    = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuAnim = useAnimatedPanel(showUserMenu)

  // Selected chain — lifted from ChainSelector so we can open modal on chain switch
  const [selectedChain,   setSelectedChain]   = useState<Chain>(CHAINS[0])
  const [modalNetworkId,  setModalNetworkId]  = useState<string | undefined>()

  // Language state from context (shared with whole app)
  const { lang: currentLang, setLang: setCurrentLang, t } = useLanguage()
  const [showLang, setShowLang] = useState(false)

  const toast = useToast()

  // Close user menu on outside click
  const avatarMenuRef = useRef<HTMLDivElement>(null)
  useOutsideClick(avatarMenuRef, () => setShowUserMenu(false))

  // Close language dropdown on outside click
  const langMenuRef = useRef<HTMLDivElement>(null)
  useOutsideClick(langMenuRef, () => setShowLang(false))

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  function handleConnect(networkId: string) {
    // Sync chain selector to the network that was connected through
    const connectedChain = CHAINS.find((c) => c.id === networkId)
    if (connectedChain) setSelectedChain(connectedChain)
    setIsConnected(true)
    localStorage.setItem('wm_connected', '1')
    setShowModal(false)
  }

  function handleLangSelect(code: string) {
    if (code === currentLang) { setShowLang(false); return }
    const prevCode  = currentLang
    const newLabel  = LANGUAGES.find((l) => l.code === code)?.label  ?? code
    const prevLabel = LANGUAGES.find((l) => l.code === prevCode)?.label ?? prevCode
    setCurrentLang(code)   // context handles localStorage
    setShowLang(false)
    // Toast always in English (default) so user can read regardless of new lang
    const en = TRANSLATIONS['en']!
    toast.push({
      type:    'success',
      title:   `Language: ${newLabel}`,
      body:    en['toast.langUpdated'] ?? 'Interface language updated.',
      actions: [
        {
          label:   en['toast.revert'] ?? 'Revert',
          variant: 'secondary',
          onClick: () => {
            setCurrentLang(prevCode)
            toast.push({
              type:  'neutral',
              title: `Language: ${prevLabel}`,
              body:  en['toast.langReverted'] ?? 'Reverted to previous language.',
            })
          },
        },
      ],
    })
  }

  function handleDisconnect() {
    setIsConnected(false)
    setShowUserMenu(false)
    localStorage.removeItem('wm_connected')
    toast.push({
      title: t('toast.walletDisconnected'),
      body:  t('toast.walletDisconnectedBody'),
    })
  }

  // Called when user picks a chain from ChainDropdown while connected
  function handleChainSelect(chain: Chain) {
    setSelectedChain(chain)
    // Open ConnectWalletModal pre-selected to the matching network tab
    setModalNetworkId(resolveModalNetworkId(chain.id))
    setShowModal(true)
  }

  return (
    <>
      <header
        className={cn(
          'w-full sticky top-0 z-40',
          'border-b border-[var(--wm-border-01)]',
        )}
        style={{
          backgroundColor: scrolled ? 'rgba(0, 0, 0, 0.8)' : 'var(--wm-bg-01)',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
          transition: 'background-color 300ms ease, backdrop-filter 300ms ease, -webkit-backdrop-filter 300ms ease',
        }}
      >
        {/* Inner container — max-w-[1440px], px-4 mobile / px-12 desktop, py-3 */}
        <div className="flex items-center w-full max-w-[1440px] mx-auto px-4 md:px-12 py-3">

          {/* ── Left: hamburger (mobile) + logo + nav (desktop) ────── */}
          <div className="flex flex-1 items-center gap-2 min-w-0">

            {/* Hamburger — mobile only */}
            <HamburgerButton isOpen={drawerOpen} onClick={() => setDrawerOpen((v) => !v)} />

            <Logo />

            {/* Desktop nav — hidden on mobile */}
            <nav className="hidden md:flex items-center" aria-label="Main navigation">
              {NAV_ITEMS.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  label={t(item.labelKey)}
                  isActive={isActive(item.href)}
                />
              ))}
            </nav>
          </div>

          {/* ── Right: wallet + utility ────────────────────────────── */}
          <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
            {isConnected ? (
              /* ── Connected state ─────────────────────────────────── */
              <>
                <ChainSelector chain={selectedChain} onSelect={handleChainSelect} />
                <span className="hidden md:flex"><FeeBlock /></span>
                <BalanceBlock />

                {/* Avatar + user menu dropdown */}
                <div ref={avatarMenuRef} className="relative shrink-0">
                  <AvatarButton onClick={() => setShowUserMenu((v) => !v)} />

                  {userMenuAnim.rendered && (
                    <div
                      className={cn(
                        'absolute top-[calc(100%+8px)] right-0 z-50',
                        userMenuAnim.exiting
                          ? 'animate-out fade-out zoom-out-95 duration-150 origin-top-right'
                          : 'animate-in fade-in zoom-in-95 duration-150 origin-top-right',
                      )}
                    >
                      <UserMenuDropdown
                        address="GQ98...iA5Y"
                        avatarSrc="/assets/avatar.png"
                        onDisconnect={handleDisconnect}
                        onClose={() => setShowUserMenu(false)}
                      />
                    </div>
                  )}
                </div>

                <span className="hidden md:flex items-center"><VerticalDivider /></span>
                <span className="hidden md:flex">
                  <RoundIconBtn
                    label={t('tooltip.help')}
                    onClick={() => window.open('https://whales.market/blog/', '_blank', 'noopener,noreferrer')}
                    icon={<QuestionLine className="size-full text-[var(--wm-text-02)]" />}
                  />
                </span>
                {/* Language selector — connected state, hidden on mobile */}
                <div ref={langMenuRef} className="relative shrink-0 hidden md:flex">
                  <RoundIconBtn
                    label={t('tooltip.language')}
                    onClick={() => setShowLang((v) => !v)}
                    icon={
                      <World2Line
                        className={cn(
                          'size-full transition-colors duration-150',
                          showLang ? 'text-[var(--wm-text-green)]' : 'text-[var(--wm-text-02)]',
                        )}
                      />
                    }
                  />
                  {showLang && (
                    <LanguageDropdown
                      currentLang={currentLang}
                      onSelect={handleLangSelect}
                      onClose={() => setShowLang(false)}
                    />
                  )}
                </div>
              </>
            ) : (
              /* ── Disconnected state (default) ────────────────────── */
              <>
                <span className="hidden md:flex">
                  <ConnectButton onClick={() => setShowModal(true)} label={t('nav.connect')} />
                </span>
                {/* Language selector — disconnected state, hidden on mobile */}
                <div ref={langMenuRef} className="relative shrink-0 hidden md:flex">
                  <RoundIconBtn
                    label={t('tooltip.language')}
                    onClick={() => setShowLang((v) => !v)}
                    icon={
                      <World2Line
                        className={cn(
                          'size-full transition-colors duration-150',
                          showLang ? 'text-[var(--wm-text-green)]' : 'text-[var(--wm-text-02)]',
                        )}
                      />
                    }
                  />
                  {showLang && (
                    <LanguageDropdown
                      currentLang={currentLang}
                      onSelect={handleLangSelect}
                      onClose={() => setShowLang(false)}
                    />
                  )}
                </div>
              </>
            )}
          </div>

        </div>
      </header>

      {/* ── Mobile Drawer ──────────────────────────────────────────── */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navItems={NAV_ITEMS}
        isActive={isActive}
        t={t}
        onConnectClick={() => setShowModal(true)}
        isConnected={isConnected}
      />

      {/* ── Connect Wallet Modal ───────────────────────────────────── */}
      {showModal && (
        <ConnectWalletModal
          onClose={() => { setShowModal(false); setModalNetworkId(undefined) }}
          onConnect={handleConnect}
          initialNetworkId={modalNetworkId}
        />
      )}
    </>
  )
}
