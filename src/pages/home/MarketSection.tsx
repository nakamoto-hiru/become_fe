import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  marketListItems,
  upcomingMarketItems,
  endedMarketItems,
  type MarketListItem,
  type UpcomingMarketItem,
  type EndedMarketItem,
  NETWORK_OPTIONS,
} from '@/mock-data/home'
import { useSimulatedHomeMarkets } from '@/hooks/useSimulatedHomeMarkets'
import WhalesBadge from '@/components/WhalesBadge'
import { TooltipPortal } from '@/components/Tooltip'
import { SearchLine, Filter2Fill, DownFill, CheckFill, CloseLine } from '@mingcute/react'
import { Skeleton } from '@/components/Skeleton'
import { useLanguage } from '@/contexts/LanguageContext'
import type { TranslationKey } from '@/i18n/translations'

/* ── Flash + tab slide animation styles — injected once ────────────── */
const FlashStyles = () => (
  <style>{`
    @keyframes mkt-flash-green {
      0%   { color: var(--wm-text-green); }
      40%  { color: var(--wm-text-green); }
      100% { color: inherit; }
    }
    @keyframes mkt-flash-red {
      0%   { color: var(--wm-text-danger); }
      40%  { color: var(--wm-text-danger); }
      100% { color: inherit; }
    }
    @keyframes tab-slide-left {
      from { opacity: 0; transform: translateX(-16px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes tab-slide-right {
      from { opacity: 0; transform: translateX(16px); }
      to   { opacity: 1; transform: translateX(0); }
    }
  `}</style>
)

/* ── AnimatedValue — flashes green/red when a numeric value changes ── */
const AnimatedValue = ({
  value,
  format,
  className = '',
}: {
  value: number
  format: (v: number) => string
  className?: string
}) => {
  const ref = useRef<HTMLSpanElement>(null)
  const prevRef = useRef(value)

  useEffect(() => {
    const prev = prevRef.current
    prevRef.current = value
    if (prev === value) return
    const el = ref.current
    if (!el) return
    const dir = value > prev ? 'green' : 'red'
    el.style.animation = 'none'
    void el.offsetWidth // force reflow
    el.style.animation = `mkt-flash-${dir} 1500ms ease-out forwards`
  }, [value])

  return (
    <span
      ref={ref}
      className={className}
      style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
    >
      {format(value)}
    </span>
  )
}

/* ── Types ─────────────────────────────────────────────────────────── */

export type MarketTab = 'live' | 'upcoming' | 'ended'

const TABS: { id: MarketTab; labelKey: TranslationKey }[] = [
  { id: 'live', labelKey: 'home.liveMarket' },
  { id: 'upcoming', labelKey: 'home.upcoming' },
  { id: 'ended', labelKey: 'home.ended' },
]

const getCount = (tab: MarketTab): number => {
  if (tab === 'live') return marketListItems.filter((m) => m.status === 'live' || m.status === 'settling').length
  if (tab === 'upcoming') return upcomingMarketItems.length
  return endedMarketItems.length
}

/* ── Seeded PRNG for deterministic random per item ────────────────── */
const seededRng = (seed: string) => {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0
  return () => {
    h = (h * 1664525 + 1013904223) | 0
    return (h >>> 0) / 4294967296
  }
}

/*
 * Chart shape presets — each creates a very different "personality".
 * Shape fn receives t ∈ [0,1] and returns y ∈ [0,1] (0 = top, 1 = bottom).
 * For "up" charts the value is inverted so 0→bottom, 1→top.
 */
type ShapeFn = (t: number, rand: () => number) => number

const SHAPES: ShapeFn[] = [
  /* 0: Pump late — flat then sharp rise */
  (t) => t < 0.6 ? 0.85 - t * 0.15 : 0.85 - 0.15 * 0.6 - (t - 0.6) * 1.6,
  /* 1: V-shape dip — drops mid then recovers */
  (t) => {
    const mid = 0.4
    return t < mid ? t / mid * 0.7 : 0.7 - (t - mid) / (1 - mid) * 0.7
  },
  /* 2: Staircase — two plateaus with a step */
  (t) => t < 0.45 ? 0.75 : t < 0.55 ? 0.75 - (t - 0.45) / 0.1 * 0.45 : 0.3,
  /* 3: Spike then fade — big peak early, slow decline */
  (t) => {
    if (t < 0.2) return 0.8 - t / 0.2 * 0.8
    return (t - 0.2) / 0.8 * 0.55
  },
  /* 4: Gradual wave — sine oscillation with trend */
  (t) => 0.7 - t * 0.5 + Math.sin(t * Math.PI * 3) * 0.15,
  /* 5: W-shape — double dip */
  (t) => {
    const v = Math.sin(t * Math.PI * 2) * 0.35
    return 0.5 + v - t * 0.25
  },
  /* 6: Consolidation then breakout */
  (t) => t < 0.7 ? 0.65 + Math.sin(t * 14) * 0.08 : 0.65 - (t - 0.7) / 0.3 * 0.55,
  /* 7: Steady climb with pullback */
  (t) => {
    const base = 0.85 - t * 0.75
    const pullback = t > 0.5 && t < 0.7 ? (t - 0.5) * 1.5 : t >= 0.7 ? 0.3 - (t - 0.7) * 1 : 0
    return base + pullback
  },
]

/* ── Generate unique sparkline path per item ─────────────────────── */
const generateChartPath = (seed: string, direction: 'up' | 'down'): string => {
  const rand = seededRng(seed)
  const shapeIdx = Math.floor(rand() * SHAPES.length)
  const shape = SHAPES[shapeIdx]
  const n = 12 + Math.floor(rand() * 6)        // 12-17 points
  const volatility = 0.04 + rand() * 0.1        // per-chart noise amount
  const pts: [number, number][] = []

  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const x = t * 96
    let v = shape(t, rand) + (rand() - 0.5) * volatility
    v = Math.max(0, Math.min(1, v))
    /* v=0 → price high (y=3), v=1 → price low (y=41) */
    let y = 3 + v * 38
    if (direction === 'up') y = 44 - y          // flip for uptrend
    y = Math.max(2, Math.min(42, y))
    pts.push([x, y])
  }

  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1]
    const [cx, cy] = pts[i]
    const dx = (cx - px) * 0.35
    d += ` C${(px + dx).toFixed(1)} ${py.toFixed(1)}, ${(cx - dx).toFixed(1)} ${cy.toFixed(1)}, ${cx.toFixed(1)} ${cy.toFixed(1)}`
  }
  return d
}

/* ── Mini sparkline chart — unique per item ───────────────────────── */
const MiniChart = ({ direction, seed, colorOverride }: { direction: 'up' | 'down'; seed: string; colorOverride?: 'up' | 'down' }) => {
  const id = `mcg-${seed}`
  const effectiveColor = colorOverride ?? direction
  const color = effectiveColor === 'up' ? 'var(--wm-text-green)' : 'var(--wm-text-danger)'
  const path = generateChartPath(seed, direction)
  return (
    <svg viewBox="0 0 96 44" fill="none" className="w-24 h-11">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L96 44 L0 44 Z`} fill={`url(#${id})`} />
      <path d={path} stroke={color} strokeWidth="1.5" fill="none" />
    </svg>
  )
}

/* ── Sort types ────────────────────────────────────────────────────── */
type SortKey = 'lastPrice' | 'liqVol24h' | 'totalVol' | 'impliedFdv'
type SortDir = 'asc' | 'desc' | null

/* ── Sort icon — Figma node 35281:21856 ─────────────────────────────
 * Two small **filled** triangles (6×4 px each) inside a 16×16 box.
 * Up triangle: center-y = 50%−3 → y 3–7   Down triangle: center-y = 50%+3 → y 9–13
 * ──────────────────────────────────────────────────────────────────── */
const SortIcon = ({ dir }: { dir: SortDir }) => (
  <svg viewBox="0 0 16 16" className="size-4 shrink-0">
    {/* Up triangle — filled */}
    <path
      d="M5 7L8 3L11 7Z"
      fill="currentColor"
      className={dir === 'asc' ? 'text-wm-text-01' : 'text-wm-text-03'}
    />
    {/* Down triangle — filled */}
    <path
      d="M5 9L8 13L11 9Z"
      fill="currentColor"
      className={dir === 'desc' ? 'text-wm-text-01' : 'text-wm-text-03'}
    />
  </svg>
)

/* ── Settle Time tooltip content ───────────────────────────────────── */
const settleTooltipContent = (
  <div className="flex flex-col gap-2 text-left min-w-[168px]">
    <p>
      <span className="font-medium">Buyer:</span>{' '}
      From this time, the seller can start settling your order.
    </p>
    <p>
      <span className="font-medium">Seller:</span>{' '}
      Earliest time you can settle to deliver tokens.
    </p>
  </div>
)

/* ── Format helpers ────────────────────────────────────────────────── */
const fmt = (n: number, dec = 2): string => {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })
  return n.toFixed(dec)
}

const fmtPrice = (n: number): string => {
  if (n < 0.01) return `$${n.toFixed(4)}`
  if (n < 1) return `$${n.toFixed(3)}`
  return `$${n.toFixed(2)}`
}

const fmtChange = (n: number): { text: string; cls: string } => ({
  text: `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`,
  cls: n >= 0 ? 'text-wm-text-green' : 'text-wm-text-danger',
})

/* ── Live countdown — ticks every second ───────────────────────────── */
const CountdownTimer = ({ deadlineMs, colorCls = 'text-wm-text-warning' }: { deadlineMs: number; colorCls?: string }) => {
  const [now, setNow] = useState(Date.now)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const remaining = Math.max(0, deadlineMs - now)
  const totalSec = Math.floor(remaining / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60

  return (
    <div
      className={`flex items-center gap-0.5 text-label-sm ${colorCls}`}
      style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
    >
      <span>{h}h</span>
      <span className="opacity-60">:</span>
      <span>{String(m).padStart(2, '0')}m</span>
      <span className="opacity-60">:</span>
      <span>{String(s).padStart(2, '0')}s</span>
    </div>
  )
}

/* ── Settle time cell — Figma-matched countdown + badge ───────────── */
const SettleCell = ({ item }: { item: MarketListItem }) => {
  /* Stable mock deadline per settling item — created once, persisted across re-renders */
  const deadlineRef = useRef<number>(0)
  if (item.status === 'settling' && !item.settleTime && deadlineRef.current === 0) {
    // Each settling row gets a slightly different countdown for realism
    const offset = (parseInt(item.id, 10) * 1234567) % 7200 // up to 2h spread
    deadlineRef.current = Date.now() + (3 * 3600 + 34 * 60 + 59 + offset) * 1000
  }

  if (item.status === 'settling') {
    /* If settleTime exists → upcoming settlement (green badge)
       If no settleTime → active settling (orange badge) */
    const hasSettleTime = !!item.settleTime
    const deadline = hasSettleTime
      ? new Date(item.settleTime!).getTime()
      : deadlineRef.current

    return (
      <div className="flex flex-col items-end gap-1">
        <CountdownTimer deadlineMs={deadline} colorCls={hasSettleTime ? 'text-wm-text-green' : 'text-wm-text-warning'} />
        {hasSettleTime
          ? <WhalesBadge badge="upcomg-settle" label="Upcoming" />
          : <WhalesBadge badge="settling" />
        }
      </div>
    )
  }
  if (item.settleTime) {
    const d = new Date(item.settleTime)
    return (
      <div className="flex flex-col items-end gap-1">
        <span
          className="text-label-sm text-wm-text-01"
          style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
        >
          {d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </span>
        <span
          className="text-body-sm text-wm-text-03"
          style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
        >
          {d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
        </span>
      </div>
    )
  }
  return (
    <span
      className="text-body-sm text-wm-text-03"
      style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
    >
      TBA
    </span>
  )
}

/* ── Column headers — Figma: Token flex-1, rest w-168 ─────────────── */
interface ColDef {
  label: string
  labelKey?: TranslationKey
  width: string
  align: string
  sortKey?: SortKey
  tooltip?: boolean
}

const COLUMNS: ColDef[] = [
  { label: 'Token', labelKey: 'home.colToken', width: 'flex-1', align: '' },
  { label: '', width: 'flex-[1_0_0]', align: '' },           // chart — takes remaining
  { label: 'Last Price ($)', labelKey: 'home.colLastPrice', width: 'w-[168px]', align: 'text-right justify-end', sortKey: 'lastPrice' },
  { label: '24h Vol. ($)', width: 'w-[168px]', align: 'text-right justify-end', sortKey: 'liqVol24h' },
  { label: 'Total Vol. ($)', labelKey: 'home.colTotalVol', width: 'w-[168px]', align: 'text-right justify-end', sortKey: 'totalVol' },
  { label: 'Implied FDV ($)', labelKey: 'home.colImpliedFdv', width: 'w-[168px]', align: 'text-right justify-end', sortKey: 'impliedFdv' },
  { label: 'Settle Time (UTC)', labelKey: 'home.colSettleTime', width: 'w-[168px]', align: 'text-right justify-end', tooltip: true },
]

/* ── Market row — Figma node 44740:768247 ─────────────────────────── */
const MarketRow = ({ item, onClick }: { item: MarketListItem; onClick?: () => void }) => {
  const priceChg = fmtChange(item.priceChange)
  const liqChg = fmtChange(item.liqVolChange)
  const totalChg = fmtChange(item.totalVolChange)

  return (
    <div onClick={onClick} className="flex items-center px-2 border-t border-wm-border-01 hover:bg-wm-overlay-3 transition-colors cursor-pointer">
      {/* Token — Figma: w-384, gap-12, py-16 */}
      <div className="w-[384px] shrink-0 flex items-center gap-3 py-4">
        <div className="relative p-1 shrink-0">
          <img src={item.logoUrl} alt={item.name} className="size-9 rounded-full object-cover" />
          <img
            src={item.chainLogoUrl}
            alt={item.chain}
            className="absolute bottom-0 left-0 size-4 rounded-[4px] border-2 border-wm-bg-01 object-cover"
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-label-sm text-wm-text-01" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
              {item.name}
            </span>
            {item.isNew && <WhalesBadge badge="new" label="New Market" />}
          </div>
          <span className="text-body-sm text-wm-text-03" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
            {item.protocol}
          </span>
        </div>
      </div>

      {/* Chart — Figma: flex-1, py-12 */}
      <div className="flex-1 min-w-0 py-3 shrink-0">
        <MiniChart direction={item.chartDirection} seed={`${item.id}-${item.slug}-chart`} colorOverride={item.priceChange >= 0 ? 'up' : 'down'} />
      </div>

      {/* Last Price — Figma: w-168, gap-4, py-12 */}
      <div className="w-[168px] shrink-0 flex flex-col items-end gap-1 py-3">
        <AnimatedValue value={item.lastPrice} format={fmtPrice} className="text-label-sm text-wm-text-01" />
        <span className={`text-body-sm ${priceChg.cls}`} style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
          {priceChg.text}
        </span>
      </div>

      {/* 24h Vol */}
      <div className="w-[168px] shrink-0 flex flex-col items-end gap-1 py-3">
        <AnimatedValue value={item.liqVol24h} format={fmt} className="text-label-sm text-wm-text-01" />
        <span className={`text-body-sm ${liqChg.cls}`} style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
          {liqChg.text}
        </span>
      </div>

      {/* Total Vol */}
      <div className="w-[168px] shrink-0 flex flex-col items-end gap-1 py-3">
        <AnimatedValue value={item.totalVol} format={fmt} className="text-label-sm text-wm-text-01" />
        <span className={`text-body-sm ${totalChg.cls}`} style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
          {totalChg.text}
        </span>
      </div>

      {/* Implied FDV — Figma: hidden secondary line for alignment */}
      <div className="w-[168px] shrink-0 flex flex-col items-end gap-1 py-3">
        <AnimatedValue value={item.impliedFdv} format={(v) => fmt(v, 1)} className="text-label-sm text-wm-text-01" />
        <span className="text-body-sm text-wm-text-green opacity-0" aria-hidden="true">
          +0.00%
        </span>
      </div>

      {/* Settle Time */}
      <div className="w-[168px] shrink-0 flex flex-col items-end gap-1 py-3">
        <SettleCell item={item} />
      </div>
    </div>
  )
}

/* ── Settle Time header cell — with Tooltip ───────────────────────── */
const SettleTimeHeader = ({ col }: { col: ColDef }) => {
  const { t } = useLanguage()
  const [hovered, setHovered] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={anchorRef}
      className={`${col.width} shrink-0 flex items-center gap-0.5 py-2 ${col.align}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        className="text-body-xs text-wm-text-03 border-b border-dashed border-wm-border-03 pb-0.5 cursor-default"
        style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
      >
        {col.labelKey ? t(col.labelKey) : col.label}
      </span>
      <TooltipPortal
        content={settleTooltipContent}
        visible={hovered}
        anchorRef={anchorRef}
        arrowSide="bottom"
        multiline
      />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
 * UPCOMING TAB — Figma node 44194:81995
 * Completely different table: Watchers, Investors & Backers, Narrative, Moni Score
 * ════════════════════════════════════════════════════════════════════ */

/* ── Avatar stack — overlapping circles ────────────────────────────── */
const AvatarStack = ({ avatars, extra }: { avatars: string[]; extra: number }) => {
  if (avatars.length === 0) {
    return (
      <span className="text-label-sm text-wm-text-01" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
        -
      </span>
    )
  }
  return (
    <div className="flex items-start pr-1.5">
      {avatars.map((url, i) => (
        <div key={i} className="-mr-1.5 relative shrink-0 size-5">
          <img src={url} alt="" className="absolute block size-full rounded-full" />
        </div>
      ))}
      {extra > 0 && (
        <div className="bg-wm-bg-02 border border-wm-bg-01 flex flex-col items-center justify-center -mr-1.5 px-1.5 py-1 relative rounded-lg shrink-0 w-9">
          <span
            className="text-label-2xs text-wm-text-01 uppercase whitespace-nowrap"
            style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
          >
            +{extra}
          </span>
        </div>
      )}
    </div>
  )
}

/* ── Narrative badges ────────────────────────────────────────────── */
const NarrativeBadges = ({ narratives, extra }: { narratives: string[]; extra: number }) => {
  if (narratives.length === 0) {
    return (
      <span className="text-label-sm text-wm-text-01" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
        -
      </span>
    )
  }
  return (
    <div className="flex items-start gap-1">
      {narratives.map((n) => (
        <WhalesBadge key={n} badge="discount-neutral" label={n} />
      ))}
      {extra > 0 && (
        <div className="bg-wm-bg-02 border border-wm-bg-01 flex flex-col items-center justify-center px-1.5 py-1 rounded-lg shrink-0 w-9">
          <span
            className="text-label-2xs text-wm-text-01 uppercase whitespace-nowrap"
            style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
          >
            +{extra}
          </span>
        </div>
      )}
    </div>
  )
}

/* ── Moni Score — gradient bar + dot indicator + number ───────────── */
const MONI_MAX = 40000

const MoniScoreBar = ({ score }: { score: number }) => {
  const pct = Math.min(100, Math.max(0, (score / MONI_MAX) * 100))
  return (
    <div className="flex items-start gap-2 w-[192px]">
      {/* Bar track + indicator */}
      <div className="flex flex-1 flex-col h-4 items-start justify-center relative min-h-px min-w-px">
        <div className="flex h-1 items-center overflow-clip rounded-lg shrink-0 w-full">
          <div
            className="h-1 min-h-px min-w-px rounded-[999px]"
            style={{
              flex: '1 0 0',
              background: 'linear-gradient(to right, var(--wm-bg-inv), var(--wm-bg-primary))',
            }}
          />
        </div>
        {/* Score dot — 8×8 white circle + 4px outside stroke */}
        <div
          className="absolute size-2 -translate-x-1/2 -translate-y-1/2 top-1/2 rounded-full bg-wm-bg-inv shadow-[0_0_0_4px_var(--wm-bg-01)]"
          style={{ left: `${pct}%` }}
        />
      </div>
      {/* Score number */}
      <div className="flex h-4 items-center justify-center shrink-0 w-16">
        <span
          className="text-label-xs text-wm-text-01 shrink-0"
          style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
        >
          {score.toLocaleString('en-US')}
        </span>
      </div>
    </div>
  )
}

/* ── Upcoming column headers ─────────────────────────────────────── */
type UpcomingSortKey = 'watchers' | 'moniScore'

interface UpcomingColDef {
  label: string
  labelKey?: TranslationKey
  width: string
  align: string
  sortKey?: UpcomingSortKey
  tooltip?: boolean
}

const UPCOMING_COLUMNS: UpcomingColDef[] = [
  { label: 'Token', labelKey: 'home.colToken', width: 'flex-1', align: '' },
  { label: 'Watchers', labelKey: 'home.colWatchers', width: 'w-[192px]', align: '', sortKey: 'watchers' },
  { label: 'Investors & Backers', labelKey: 'home.colInvestors', width: 'w-[192px]', align: '', tooltip: true },
  { label: 'Narrative', labelKey: 'home.colNarrative', width: 'w-[192px]', align: '', tooltip: true },
  { label: 'Moni Score', labelKey: 'home.colMoniScore', width: 'w-[192px]', align: 'justify-end', tooltip: true },
]

/* ── Upcoming tooltip contents ───────────────────────────────────── */
const investorsTooltipContent = (
  <div className="flex flex-col gap-2 text-left min-w-[168px]">
    <p>Notable investors and backers of the project.</p>
  </div>
)
const narrativeTooltipContent = (
  <div className="flex flex-col gap-2 text-left min-w-[168px]">
    <p>Primary sector or category of the project.</p>
  </div>
)
const moniScoreTooltipContent = (
  <div className="flex flex-col gap-2 text-left min-w-[168px]">
    <p>Moni Score reflects community trust and project fundamentals.</p>
  </div>
)

const UPCOMING_TOOLTIPS: Record<string, React.ReactNode> = {
  'Investors & Backers': investorsTooltipContent,
  'Narrative': narrativeTooltipContent,
  'Moni Score': moniScoreTooltipContent,
}

/* ── Upcoming market row ─────────────────────────────────────────── */
const fmtWatchers = (v: number) => v.toLocaleString('en-US')

const UpcomingMarketRow = ({ item, onClick }: { item: UpcomingMarketItem; onClick?: () => void }) => (
  <div onClick={onClick} className="flex items-center px-2 border-t border-wm-border-01 hover:bg-wm-overlay-3 transition-colors cursor-pointer">
    {/* Token — flex-1, gap-12, py-16 */}
    <div className="flex-1 min-w-0 flex items-center gap-3 py-4">
      <div className="relative p-1 shrink-0">
        <img src={item.logoUrl} alt={item.name} className="size-9 rounded-full object-cover" />
        <img
          src={item.chainLogoUrl}
          alt={item.chain}
          className="absolute bottom-0 left-0 size-4 rounded-[4px] border-2 border-wm-bg-01 object-cover"
        />
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-label-sm text-wm-text-01" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
            {item.name}
          </span>
          {item.isNew && <WhalesBadge badge="new" label="New Market" />}
        </div>
        <span className="text-body-sm text-wm-text-03" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
          {item.protocol}
        </span>
      </div>
    </div>

    {/* Watchers — w-192, py-12 */}
    <div className="w-[192px] shrink-0 flex flex-col items-start justify-center py-3">
      <AnimatedValue value={item.watchers} format={fmtWatchers} className="text-label-sm text-wm-text-01" />
    </div>

    {/* Investors & Backers — w-192, py-12 */}
    <div className="w-[192px] shrink-0 flex flex-col items-start justify-center py-3">
      <AvatarStack avatars={item.investorAvatars} extra={item.investorExtra} />
    </div>

    {/* Narrative — w-192, py-12 */}
    <div className="w-[192px] shrink-0 flex flex-col items-start justify-center py-3">
      <NarrativeBadges narratives={item.narratives} extra={item.narrativeExtra} />
    </div>

    {/* Moni Score — w-192, py-12, items-end */}
    <div className="w-[192px] shrink-0 flex flex-col items-end justify-center py-3">
      <MoniScoreBar score={item.moniScore} />
    </div>
  </div>
)

/* ── Upcoming header cell with tooltip ─────────────────────────────── */
const UpcomingTooltipHeader = ({ col, sortDir, onSort }: {
  col: UpcomingColDef
  sortDir: SortDir
  onSort?: () => void
}) => {
  const { t } = useLanguage()
  const [hovered, setHovered] = useState(false)
  const tooltipContent = UPCOMING_TOOLTIPS[col.label]
  const anchorRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={anchorRef}
      className={`${col.width} shrink-0 flex items-center gap-0.5 py-2 ${col.align} ${
        col.sortKey ? 'cursor-pointer select-none group/sort' : ''
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSort}
    >
      <span
        className={`text-body-xs transition-colors ${
          sortDir ? 'text-wm-text-01' : 'text-wm-text-03 group-hover/sort:text-wm-text-02'
        } ${tooltipContent ? 'pb-0.5 border-b border-dashed border-wm-border-03' : ''} ${
          col.sortKey ? 'cursor-pointer' : 'cursor-default'
        }`}
        style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
      >
        {col.labelKey ? t(col.labelKey) : col.label}
      </span>
      {col.sortKey && <SortIcon dir={sortDir} />}
      {tooltipContent && (
        <TooltipPortal
          content={tooltipContent}
          visible={hovered}
          anchorRef={anchorRef}
          arrowSide="bottom"
          multiline
        />
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
 * ENDED TAB — Figma node 42540:728797
 * Search + Network filter + simpler table (no chart, no 24h vol)
 * ════════════════════════════════════════════════════════════════════ */

/* ── "All networks" icon — inline grid SVG ─────────────────────────── */
const AllNetworkIcon = () => (
  <svg viewBox="0 0 16 16" className="size-4" fill="currentColor">
    <circle cx="4.5" cy="4.5" r="2" />
    <circle cx="11.5" cy="4.5" r="2" />
    <circle cx="4.5" cy="11.5" r="2" />
    <circle cx="11.5" cy="11.5" r="2" />
  </svg>
)

/* ── Ended column definitions ──────────────────────────────────────── */
type EndedSortKey = 'lastPrice' | 'totalVol'

interface EndedColDef {
  label: string
  labelKey?: TranslationKey
  width: string
  align: string
  sortKey?: EndedSortKey
  tooltip?: boolean
}

const ENDED_COLUMNS: EndedColDef[] = [
  { label: 'Token', labelKey: 'home.colToken', width: 'flex-1', align: '' },
  { label: 'Last Price ($)', labelKey: 'home.colLastPrice', width: 'w-[192px]', align: 'text-right justify-end', sortKey: 'lastPrice' },
  { label: 'Total Vol. ($)', labelKey: 'home.colTotalVol', width: 'w-[192px]', align: 'text-right justify-end', sortKey: 'totalVol' },
  { label: 'Settle Starts (UTC)', labelKey: 'home.colSettleStarts', width: 'w-[192px]', align: 'text-right justify-end', tooltip: true },
  { label: 'Settle Ends (UTC)', labelKey: 'home.colSettleEnds', width: 'w-[192px]', align: 'text-right justify-end', tooltip: true },
]

/* ── Ended tooltip contents ────────────────────────────────────────── */
const settleStartTooltipContent = (
  <div className="flex flex-col gap-2 text-left min-w-[168px]">
    <p>The time when settlement begins for this market.</p>
  </div>
)
const settleEndTooltipContent = (
  <div className="flex flex-col gap-2 text-left min-w-[168px]">
    <p>The deadline by which settlement must be completed.</p>
  </div>
)

const ENDED_TOOLTIPS: Record<string, React.ReactNode> = {
  'Settle Starts (UTC)': settleStartTooltipContent,
  'Settle Ends (UTC)': settleEndTooltipContent,
}

/* ── Ended settle cell — date/time or TBA ──────────────────────────── */
const EndedSettleTimeCell = ({ time }: { time: string | null }) => {
  if (!time) {
    return (
      <span className="text-body-sm text-wm-text-03" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
        TBA
      </span>
    )
  }
  const d = new Date(time)
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-label-sm text-wm-text-01" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
        {d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
      </span>
      <span className="text-body-sm text-wm-text-03" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
        {d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
      </span>
    </div>
  )
}

/* ── Ended settle END cell — may show countdown if still settling ──── */
const EndedSettleEndCell = ({ item }: { item: EndedMarketItem }) => {
  if (item.isSettling && item.settleEndTime) {
    const d = new Date(item.settleEndTime)
    return (
      <div className="flex flex-col items-end gap-1">
        <span className="text-label-sm text-wm-text-01" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
          {d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </span>
        <CountdownTimer deadlineMs={d.getTime()} colorCls="text-wm-text-warning" />
      </div>
    )
  }
  return <EndedSettleTimeCell time={item.settleEndTime} />
}

/* ── Ended market row ──────────────────────────────────────────────── */
const EndedMarketRow = ({ item, onClick }: { item: EndedMarketItem; onClick?: () => void }) => (
  <div onClick={onClick} className="flex items-center px-2 border-t border-wm-border-01 hover:bg-wm-overlay-3 transition-colors cursor-pointer">
    {/* Token — flex-1 */}
    <div className="flex-1 min-w-0 flex items-center gap-3 py-4">
      <div className="relative p-1 shrink-0">
        <img src={item.logoUrl} alt={item.name} className="size-9 rounded-full object-cover" />
        <img src={item.chainLogoUrl} alt={item.chain} className="absolute bottom-0 left-0 size-4 rounded-[4px] border-2 border-wm-bg-01 object-cover" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-label-sm text-wm-text-01" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
          {item.name}
        </span>
        <span className="text-body-sm text-wm-text-03" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
          {item.protocol}
        </span>
      </div>
    </div>

    {/* Last Price — w-192 */}
    <div className="w-[192px] shrink-0 flex flex-col items-end justify-center py-3">
      <span className="text-label-sm text-wm-text-01" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
        {fmtPrice(item.lastPrice)}
      </span>
    </div>

    {/* Total Vol — w-192 */}
    <div className="w-[192px] shrink-0 flex flex-col items-end justify-center py-3">
      <span className="text-label-sm text-wm-text-01" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
        {fmt(item.totalVol)}
      </span>
    </div>

    {/* Settle Starts — w-192 */}
    <div className="w-[192px] shrink-0 flex flex-col items-end gap-1 py-3">
      <EndedSettleTimeCell time={item.settleStartTime} />
    </div>

    {/* Settle Ends — w-192 */}
    <div className="w-[192px] shrink-0 flex flex-col items-end gap-1 py-3">
      <EndedSettleEndCell item={item} />
    </div>
  </div>
)

/* ── Ended header cell with tooltip + sort ─────────────────────────── */
const EndedTooltipHeader = ({ col, sortDir, onSort }: {
  col: EndedColDef
  sortDir: SortDir
  onSort?: () => void
}) => {
  const { t } = useLanguage()
  const [hovered, setHovered] = useState(false)
  const tooltipContent = ENDED_TOOLTIPS[col.label]
  const anchorRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={anchorRef}
      className={`${col.width} shrink-0 flex items-center gap-0.5 py-2 ${col.align} ${
        col.sortKey ? 'cursor-pointer select-none group/sort' : ''
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSort}
    >
      <span
        className={`text-body-xs transition-colors ${
          sortDir ? 'text-wm-text-01' : 'text-wm-text-03 group-hover/sort:text-wm-text-02'
        } ${tooltipContent ? 'pb-0.5 border-b border-dashed border-wm-border-03' : ''} ${
          col.sortKey ? 'cursor-pointer' : 'cursor-default'
        }`}
        style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
      >
        {col.labelKey ? t(col.labelKey) : col.label}
      </span>
      {col.sortKey && <SortIcon dir={sortDir} />}
      {tooltipContent && (
        <TooltipPortal content={tooltipContent} visible={hovered} anchorRef={anchorRef} arrowSide="bottom" multiline />
      )}
    </div>
  )
}

/* ── Skeleton rows — Figma node 40123:170195 ─────────────────────── */
const MarketSkeletonRow = ({ index }: { index: number }) => (
  <div className="flex items-center px-2 border-t border-wm-border-01" style={{ animationDelay: `${index * 80}ms` }}>
    {/* Token cell */}
    <div className="w-[384px] shrink-0 flex items-center gap-3 py-4">
      <div className="relative p-1 shrink-0">
        <Skeleton w={36} h={36} circle />
        <div className="absolute bottom-0 right-0">
          <Skeleton w={16} h={16} circle />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Skeleton w={44} h={20} />
        <Skeleton w={68} h={20} />
      </div>
    </div>
    {/* Chart cell */}
    <div className="flex-[1_0_0] flex items-center py-4">
      <Skeleton w={96} h={44} />
    </div>
    {/* Last Price */}
    <div className="w-[168px] shrink-0 flex flex-col items-end gap-1 py-4">
      <Skeleton w={44} h={20} />
      <Skeleton w={68} h={20} />
    </div>
    {/* 24h Vol */}
    <div className="w-[168px] shrink-0 flex flex-col items-end gap-1 py-4">
      <Skeleton w={44} h={20} />
      <Skeleton w={68} h={20} />
    </div>
    {/* Total Vol */}
    <div className="w-[168px] shrink-0 flex flex-col items-end gap-1 py-4">
      <Skeleton w={44} h={20} />
      <Skeleton w={68} h={20} />
    </div>
    {/* Implied FDV */}
    <div className="w-[168px] shrink-0 flex justify-end py-4">
      <Skeleton w={44} h={20} />
    </div>
    {/* Settle Time */}
    <div className="w-[168px] shrink-0 flex justify-end py-4">
      <Skeleton w={44} h={20} />
    </div>
  </div>
)

/* ══════════════════════════════════════════════════════════════════════
 * MOBILE COMPONENTS — simplified rows for < lg breakpoint
 * ════════════════════════════════════════════════════════════════════ */

/* ── Mobile skeleton row ─────────────────────────────────────────── */
const MobileSkeletonRow = ({ index }: { index: number }) => (
  <div
    className="flex items-center justify-between px-2 border-t border-wm-border-01"
    style={{ animationDelay: `${index * 80}ms` }}
  >
    <div className="flex items-center gap-3 py-4">
      <div className="relative p-1 shrink-0">
        <Skeleton w={36} h={36} circle />
        <div className="absolute bottom-0 right-0">
          <Skeleton w={16} h={16} circle />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Skeleton w={60} h={20} />
        <Skeleton w={80} h={20} />
      </div>
    </div>
    <div className="flex flex-col items-end gap-1">
      <Skeleton w={56} h={20} />
      <Skeleton w={44} h={16} />
    </div>
  </div>
)

/* ── Mobile Live row — Token + Last Price ────────────────────────── */
const MobileLiveRow = ({ item, onClick }: { item: MarketListItem; onClick?: () => void }) => {
  const priceChg = fmtChange(item.priceChange)
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between px-2 border-t border-wm-border-01 hover:bg-wm-overlay-3 transition-colors cursor-pointer"
    >
      {/* Left: Token */}
      <div className="flex-1 min-w-0 flex items-center gap-3 py-4">
        <div className="relative p-1 shrink-0">
          <img src={item.logoUrl} alt={item.name} className="size-9 rounded-full object-cover" />
          <img
            src={item.chainLogoUrl}
            alt={item.chain}
            className="absolute bottom-0 left-0 size-4 rounded-[4px] border-2 border-wm-bg-01 object-cover"
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-label-sm text-wm-text-01" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
              {item.name}
            </span>
            {item.isNew && <WhalesBadge badge="new" label="New Market" />}
          </div>
          <span className="text-body-sm text-wm-text-03" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
            {item.protocol}
          </span>
        </div>
      </div>
      {/* Right: Price + Change */}
      <div className="shrink-0 flex flex-col items-end gap-1">
        <AnimatedValue value={item.lastPrice} format={fmtPrice} className="text-label-sm text-wm-text-01" />
        <span className={`text-body-sm ${priceChg.cls}`} style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
          {priceChg.text}
        </span>
      </div>
    </div>
  )
}

/* ── Mobile Upcoming row — Token + Watchers ──────────────────────── */
const MobileUpcomingRow = ({ item, onClick }: { item: UpcomingMarketItem; onClick?: () => void }) => (
  <div
    onClick={onClick}
    className="flex items-center justify-between px-2 border-t border-wm-border-01 hover:bg-wm-overlay-3 transition-colors cursor-pointer"
  >
    {/* Left: Token */}
    <div className="flex-1 min-w-0 flex items-center gap-3 py-4">
      <div className="relative p-1 shrink-0">
        <img src={item.logoUrl} alt={item.name} className="size-9 rounded-full object-cover" />
        <img
          src={item.chainLogoUrl}
          alt={item.chain}
          className="absolute bottom-0 left-0 size-4 rounded-[4px] border-2 border-wm-bg-01 object-cover"
        />
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-label-sm text-wm-text-01" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
            {item.name}
          </span>
          {item.isNew && <WhalesBadge badge="new" label="New Market" />}
        </div>
        <span className="text-body-sm text-wm-text-03" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
          {item.protocol}
        </span>
      </div>
    </div>
    {/* Right: Watchers */}
    <div className="shrink-0 flex flex-col items-end">
      <AnimatedValue value={item.watchers} format={fmtWatchers} className="text-label-sm text-wm-text-01" />
    </div>
  </div>
)

/* ── Mobile Ended row — Token + Last Price ───────────────────────── */
const MobileEndedRow = ({ item, onClick }: { item: EndedMarketItem; onClick?: () => void }) => (
  <div
    onClick={onClick}
    className="flex items-center justify-between px-2 border-t border-wm-border-01 hover:bg-wm-overlay-3 transition-colors cursor-pointer"
  >
    {/* Left: Token */}
    <div className="flex-1 min-w-0 flex items-center gap-3 py-4">
      <div className="relative p-1 shrink-0">
        <img src={item.logoUrl} alt={item.name} className="size-9 rounded-full object-cover" />
        <img
          src={item.chainLogoUrl}
          alt={item.chain}
          className="absolute bottom-0 left-0 size-4 rounded-[4px] border-2 border-wm-bg-01 object-cover"
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-label-sm text-wm-text-01" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
          {item.name}
        </span>
        <span className="text-body-sm text-wm-text-03" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
          {item.protocol}
        </span>
      </div>
    </div>
    {/* Right: Last Price */}
    <div className="shrink-0 flex flex-col items-end">
      <span className="text-label-sm text-wm-text-01" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
        {fmtPrice(item.lastPrice)}
      </span>
    </div>
  </div>
)

/* ── Mobile column header — 2-column: left label + right sortable ── */
const MobileColumnHeader = ({
  leftLabel,
  rightLabel,
  sortDir,
  onSort,
}: {
  leftLabel: string
  rightLabel: string
  sortDir: SortDir
  onSort?: () => void
}) => (
  <div className="flex items-center justify-between px-2 py-2">
    <span
      className="text-body-xs text-wm-text-03"
      style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
    >
      {leftLabel}
    </span>
    <div
      className={`flex items-center gap-0.5 ${onSort ? 'cursor-pointer select-none group/sort' : ''}`}
      onClick={onSort}
    >
      <span
        className={`text-body-xs transition-colors ${
          sortDir ? 'text-wm-text-01' : 'text-wm-text-03 group-hover/sort:text-wm-text-02'
        }`}
        style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
      >
        {rightLabel}
      </span>
      {onSort && <SortIcon dir={sortDir} />}
    </div>
  </div>
)

/* ── MarketSection — Tabs + Table unified ──────────────────────────── */

const MarketSection = () => {
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabFromUrl = searchParams.get('tab') as MarketTab | null
  const [activeTab, setActiveTab] = useState<MarketTab>(
    tabFromUrl && ['live', 'upcoming', 'ended'].includes(tabFromUrl) ? tabFromUrl : 'live',
  )

  const navigate = useNavigate()

  /* ── Tab slide direction tracking ─────────────────────────────────── */
  const TAB_INDEX: Record<MarketTab, number> = { live: 0, upcoming: 1, ended: 2 }
  const prevTabRef = useRef(activeTab)
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('right')

  /* ── Real-time simulated data (Live + Upcoming only; Ended is static) */
  const { liveData, upcomingData } = useSimulatedHomeMarkets()

  /* ── Simulated loading state (500–1200ms per CLAUDE.md rules) ────── */
  const [loading, setLoading] = useState(true)

  const triggerLoading = useCallback(() => {
    setLoading(true)
    const delay = 500 + Math.random() * 700
    const timer = setTimeout(() => setLoading(false), delay)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    return triggerLoading()
  }, [triggerLoading])

  /* ── Live tab sort state ─────────────────────────────────────────── */
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)

  const handleSort = (key: SortKey) => {
    if (sortKey !== key) { setSortKey(key); setSortDir('desc') }
    else if (sortDir === 'desc') { setSortDir('asc') }
    else { setSortKey(null); setSortDir(null) }
  }

  /* ── Upcoming tab sort state ────────────────────────────────────── */
  const [upcomingSortKey, setUpcomingSortKey] = useState<UpcomingSortKey | null>(null)
  const [upcomingSortDir, setUpcomingSortDir] = useState<SortDir>(null)

  const handleUpcomingSort = (key: UpcomingSortKey) => {
    if (upcomingSortKey !== key) { setUpcomingSortKey(key); setUpcomingSortDir('desc') }
    else if (upcomingSortDir === 'desc') { setUpcomingSortDir('asc') }
    else { setUpcomingSortKey(null); setUpcomingSortDir(null) }
  }

  /* ── Ended tab state ─────────────────────────────────────────────── */
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [networkFilter, setNetworkFilter] = useState('all')
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false)
  const [endedSortKey, setEndedSortKey] = useState<EndedSortKey | null>(null)
  const [endedSortDir, setEndedSortDir] = useState<SortDir>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const networkDropdownRef = useRef<HTMLDivElement>(null)

  const handleEndedSort = (key: EndedSortKey) => {
    if (endedSortKey !== key) { setEndedSortKey(key); setEndedSortDir('desc') }
    else if (endedSortDir === 'desc') { setEndedSortDir('asc') }
    else { setEndedSortKey(null); setEndedSortDir(null) }
  }

  /* Close network dropdown on outside click */
  useEffect(() => {
    if (!showNetworkDropdown) return
    const handler = (e: MouseEvent) => {
      if (networkDropdownRef.current && !networkDropdownRef.current.contains(e.target as Node)) {
        setShowNetworkDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showNetworkDropdown])

  /* Sync URL → state when navigated from another page with ?tab= */
  useEffect(() => {
    const t = searchParams.get('tab') as MarketTab | null
    if (t && ['live', 'upcoming', 'ended'].includes(t) && t !== activeTab) {
      setActiveTab(t)
    }
  }, [searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  /* Persist active tab in URL so refresh remembers position */
  const switchTab = (tab: MarketTab) => {
    setSlideDir(TAB_INDEX[tab] > TAB_INDEX[prevTabRef.current] ? 'right' : 'left')
    prevTabRef.current = tab
    setActiveTab(tab)
    triggerLoading()
    const next = new URLSearchParams(searchParams)
    if (tab === 'live') next.delete('tab')
    else next.set('tab', tab)
    setSearchParams(next, { replace: true })
  }

  /* ── Live tab data (from simulated hook) ────────────────────────── */
  const filtered = liveData.filter((m) => m.status === 'live' || m.status === 'settling')
  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey || !sortDir) return 0
    const av = a[sortKey]; const bv = b[sortKey]
    return sortDir === 'asc' ? av - bv : bv - av
  })

  /* ── Upcoming tab data (from simulated hook) ───────────────────── */
  const sortedUpcoming = [...upcomingData].sort((a, b) => {
    if (!upcomingSortKey || !upcomingSortDir) return 0
    const av = a[upcomingSortKey]; const bv = b[upcomingSortKey]
    return upcomingSortDir === 'asc' ? av - bv : bv - av
  })

  /* ── Ended tab data (static — market ended, only countdown ticks) ── */
  const filteredEnded = endedMarketItems.filter((item) => {
    if (networkFilter !== 'all' && item.chain !== networkFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return item.name.toLowerCase().includes(q) || item.protocol.toLowerCase().includes(q) || item.symbol.toLowerCase().includes(q)
    }
    return true
  })
  const sortedEnded = [...filteredEnded].sort((a, b) => {
    if (!endedSortKey || !endedSortDir) return 0
    const av = a[endedSortKey]; const bv = b[endedSortKey]
    return endedSortDir === 'asc' ? av - bv : bv - av
  })

  /* ── Search input bg — Figma states ──────────────────────────────── */
  const searchBgCls = searchFocused
    ? 'bg-wm-bg-03'
    : searchQuery
      ? 'bg-wm-overlay-5'
      : 'bg-wm-bg-02 hover:bg-wm-bg-03'

  /* ── Scroll into view when navigated from See More ────────────────── */
  const sectionRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const t = searchParams.get('tab')
    if (t && ['live', 'upcoming', 'ended'].includes(t)) {
      // Wait a tick for the DOM to render, then scroll
      requestAnimationFrame(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={sectionRef} id="market-section" className="flex flex-col pb-4 scroll-mt-20">
      <FlashStyles />
      {/* ── Tab bar ─────────────────────────────────────────────── */}
      <div className="py-3 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex items-center gap-4 lg:gap-6 flex-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            const count = getCount(tab.id)
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className="group flex items-center gap-1.5 lg:gap-2 h-9 shrink-0 cursor-pointer"
              >
                <span
                  className={`text-label-md lg:text-heading-sm transition-colors ${
                    isActive ? 'text-wm-text-01' : 'text-wm-text-03 group-hover:text-wm-text-01'
                  }`}
                  style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
                >
                  {t(tab.labelKey)}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-label-2xs uppercase ${
                    isActive ? 'bg-wm-bg-primary text-wm-text-01' : 'bg-wm-bg-02 text-wm-text-02'
                  }`}
                  style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* ── Search + Network filter (Ended tab only) — desktop: inline, mobile: stacked below ── */}
        {activeTab === 'ended' && (
          <div className="flex items-center gap-2">
            {/* Search Input — states: default(bg-02), hover(bg-03), focus(bg-03), has-value+blur(overlay-5) */}
            <div className={`flex gap-2 items-center overflow-clip p-2 rounded-lg flex-1 lg:flex-none lg:w-[360px] transition-colors ${searchBgCls}`}>
              <div className="flex items-center p-0.5 shrink-0">
                <SearchLine className="size-4 text-wm-text-03" />
              </div>
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder={t('home.search')}
                className="flex-1 min-w-0 bg-transparent outline-none text-body-sm text-wm-text-01 placeholder:text-wm-text-03"
                style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); searchRef.current?.focus() }}
                  className="flex items-center p-0.5 shrink-0 text-wm-text-03 hover:text-wm-text-01 transition-colors cursor-pointer"
                >
                  <CloseLine className="size-4" />
                </button>
              )}
            </div>

            {/* Network Filter Button + Dropdown */}
            <div className="relative" ref={networkDropdownRef}>
              {(() => {
                const selectedNet = NETWORK_OPTIONS.find((n) => n.id === networkFilter)
                const isFiltered = networkFilter !== 'all'
                return (
                  <button
                    onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
                    className={`group/net flex gap-1.5 items-center overflow-clip p-2 rounded-lg transition-colors cursor-pointer ${
                      showNetworkDropdown ? 'bg-wm-bg-03' : 'bg-wm-bg-02 hover:bg-wm-bg-03'
                    }`}
                  >
                    <div className="flex items-center p-0.5 shrink-0">
                      {isFiltered && selectedNet?.logoUrl ? (
                        <img src={selectedNet.logoUrl} alt={selectedNet.label} className="size-4 rounded-[4px] object-cover" />
                      ) : (
                        <Filter2Fill className="size-4 text-wm-text-01" />
                      )}
                    </div>
                    <span className="text-label-sm text-wm-text-01 whitespace-nowrap" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
                      {isFiltered && selectedNet ? selectedNet.label : t('home.network')}
                    </span>
                    <div className={`flex items-center p-0.5 shrink-0 transition-colors ${
                      showNetworkDropdown ? 'text-wm-text-01' : 'text-wm-text-03 group-hover/net:text-wm-text-01'
                    }`}>
                      <DownFill className={`size-4 transition-transform ${showNetworkDropdown ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                )
              })()}

              {/* Dropdown panel — Figma node 38214:311371 */}
              {showNetworkDropdown && (
                <div className="absolute right-0 top-full mt-2 bg-wm-bg-02 rounded-[10px] shadow-[0_0_32px_rgba(0,0,0,0.2)] w-[192px] z-50 overflow-clip">
                  <div className="flex flex-col gap-1 p-2">
                    {/* Title */}
                    <div className="flex items-center px-2 py-1">
                      <span className="text-label-xs text-wm-text-03" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
                        {t('home.filterByNetwork')}
                      </span>
                    </div>
                    {/* Options */}
                    {NETWORK_OPTIONS.map((net) => {
                      const isSelected = networkFilter === net.id
                      return (
                        <button
                          key={net.id}
                          onClick={() => { setNetworkFilter(net.id); setShowNetworkDropdown(false) }}
                          className={`flex gap-2 items-center overflow-clip px-2 py-2 rounded-lg w-full transition-colors cursor-pointer ${
                            isSelected ? 'bg-wm-bg-03' : 'hover:bg-wm-bg-03'
                          }`}
                        >
                          <div className="flex items-center p-0.5 shrink-0">
                            {net.logoUrl ? (
                              <img src={net.logoUrl} alt={net.label} className="size-4 rounded-[4px] object-cover" />
                            ) : (
                              <AllNetworkIcon />
                            )}
                          </div>
                          <span className="flex-1 min-w-0 text-left text-label-sm text-wm-text-01" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
                            {net.label}
                          </span>
                          {isSelected && (
                            <div className="flex items-center p-0.5 shrink-0">
                              <CheckFill className="size-4 text-wm-text-green" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Sliding tab content ──────────────────────────────── */}
      <div
        key={activeTab}
        style={{ animation: `tab-slide-${slideDir} 280ms ease-out both` }}
      >
        {/* ── LIVE TABLE ────────────────────────────────────── */}
        {activeTab === 'live' && (
          <>
            {/* Desktop scrollable table */}
            <div className="hidden lg:block overflow-x-auto scrollbar-styled">
              <div className="min-w-fit">
                <div className="flex items-center px-2">
                  {COLUMNS.map((col) => {
                    const isSortable = !!col.sortKey
                    const isActive = col.sortKey === sortKey
                    const dir: SortDir = isActive ? sortDir : null

                    if (col.tooltip) return <SettleTimeHeader key={col.label} col={col} />

                    return (
                      <div
                        key={col.label || 'chart'}
                        className={`${col.width} shrink-0 flex items-center gap-0.5 py-2 ${col.align} ${
                          isSortable ? 'cursor-pointer select-none group/sort' : ''
                        }`}
                        onClick={col.sortKey ? () => handleSort(col.sortKey!) : undefined}
                      >
                        {col.label && (
                          <span
                            className={`text-body-xs transition-colors ${
                              isActive ? 'text-wm-text-01' : 'text-wm-text-03 group-hover/sort:text-wm-text-02'
                            }`}
                            style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
                          >
                            {col.labelKey ? t(col.labelKey) : col.label}
                          </span>
                        )}
                        {isSortable && <SortIcon dir={dir} />}
                      </div>
                    )
                  })}
                </div>
                {loading
                  ? Array.from({ length: 3 }, (_, i) => <MarketSkeletonRow key={`skel-${i}`} index={i} />)
                  : sorted.map((item) => <MarketRow key={item.id} item={item} onClick={() => navigate(`/premarket/${item.slug}`)} />)
                }
              </div>
            </div>
            {/* Mobile header */}
            <div className="lg:hidden">
              <MobileColumnHeader
                leftLabel={t('home.colToken')}
                rightLabel={t('home.colLastPrice')}
                sortDir={sortKey === 'lastPrice' ? sortDir : null}
                onSort={() => handleSort('lastPrice')}
              />
            </div>
            {/* Mobile rows */}
            <div className="lg:hidden">
              {loading
                ? Array.from({ length: 5 }, (_, i) => <MobileSkeletonRow key={`mskel-${i}`} index={i} />)
                : sorted.map((item) => <MobileLiveRow key={item.id} item={item} onClick={() => navigate(`/premarket/${item.slug}`)} />)
              }
            </div>
            {!loading && sorted.length === 0 && (
              <div className="py-16 text-center text-wm-text-03 text-body-sm">No markets found for this tab.</div>
            )}
          </>
        )}

        {/* ── UPCOMING TABLE ────────────────────────────────── */}
        {activeTab === 'upcoming' && (
          <>
            {/* Desktop scrollable table */}
            <div className="hidden lg:block overflow-x-auto scrollbar-styled">
              <div className="min-w-fit">
                <div className="flex items-center px-2">
                  {UPCOMING_COLUMNS.map((col) => {
                    if (col.tooltip || col.sortKey) {
                      return (
                        <UpcomingTooltipHeader
                          key={col.label}
                          col={col}
                          sortDir={col.sortKey === upcomingSortKey ? upcomingSortDir : null}
                          onSort={col.sortKey ? () => handleUpcomingSort(col.sortKey!) : undefined}
                        />
                      )
                    }
                    return (
                      <div key={col.label} className={`${col.width} shrink-0 flex items-center gap-0.5 py-2 ${col.align}`}>
                        <span className="text-body-xs text-wm-text-03" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
                          {col.labelKey ? t(col.labelKey) : col.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
                {loading
                  ? Array.from({ length: 3 }, (_, i) => <MarketSkeletonRow key={`skel-${i}`} index={i} />)
                  : sortedUpcoming.map((item) => <UpcomingMarketRow key={item.id} item={item} onClick={() => navigate(`/premarket/${item.slug}`)} />)
                }
              </div>
            </div>
            {/* Mobile header */}
            <div className="lg:hidden">
              <MobileColumnHeader
                leftLabel={t('home.colToken')}
                rightLabel={t('home.colWatchers')}
                sortDir={upcomingSortKey === 'watchers' ? upcomingSortDir : null}
                onSort={() => handleUpcomingSort('watchers')}
              />
            </div>
            {/* Mobile rows */}
            <div className="lg:hidden">
              {loading
                ? Array.from({ length: 5 }, (_, i) => <MobileSkeletonRow key={`mskel-${i}`} index={i} />)
                : sortedUpcoming.map((item) => <MobileUpcomingRow key={item.id} item={item} onClick={() => navigate(`/premarket/${item.slug}`)} />)
              }
            </div>
          </>
        )}

        {/* ── ENDED TABLE ──────────────────────────────────── */}
        {activeTab === 'ended' && (
          <>
            {/* Desktop scrollable table */}
            <div className="hidden lg:block overflow-x-auto scrollbar-styled">
              <div className="min-w-fit">
                <div className="flex items-center px-2">
                  {ENDED_COLUMNS.map((col) => {
                    if (col.tooltip || col.sortKey) {
                      return (
                        <EndedTooltipHeader
                          key={col.label}
                          col={col}
                          sortDir={col.sortKey === endedSortKey ? endedSortDir : null}
                          onSort={col.sortKey ? () => handleEndedSort(col.sortKey!) : undefined}
                        />
                      )
                    }
                    return (
                      <div key={col.label} className={`${col.width} shrink-0 flex items-center gap-0.5 py-2 ${col.align}`}>
                        <span className="text-body-xs text-wm-text-03" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
                          {col.labelKey ? t(col.labelKey) : col.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
                {loading
                  ? Array.from({ length: 3 }, (_, i) => <MarketSkeletonRow key={`skel-${i}`} index={i} />)
                  : sortedEnded.map((item) => <EndedMarketRow key={item.id} item={item} onClick={() => navigate(`/premarket/${item.slug}`)} />)
                }
              </div>
            </div>
            {/* Mobile header */}
            <div className="lg:hidden">
              <MobileColumnHeader
                leftLabel={t('home.colToken')}
                rightLabel={t('home.colLastPrice')}
                sortDir={endedSortKey === 'lastPrice' ? endedSortDir : null}
                onSort={() => handleEndedSort('lastPrice')}
              />
            </div>
            {/* Mobile rows */}
            <div className="lg:hidden">
              {loading
                ? Array.from({ length: 5 }, (_, i) => <MobileSkeletonRow key={`mskel-${i}`} index={i} />)
                : sortedEnded.map((item) => <MobileEndedRow key={item.id} item={item} onClick={() => navigate(`/premarket/${item.slug}`)} />)
              }
            </div>

            {!loading && sortedEnded.length === 0 && (
              <div className="py-16 text-center text-wm-text-03 text-body-sm">
                {searchQuery || networkFilter !== 'all'
                  ? t('home.noEndedFiltered')
                  : t('home.noEndedFound')}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default MarketSection
