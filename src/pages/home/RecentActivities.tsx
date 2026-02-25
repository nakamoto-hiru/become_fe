import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { recentActivities, type RecentActivity } from '@/mock-data/home'
import { ArrowRightUpFill, Filter2Fill, DownFill, CheckFill } from '@mingcute/react'
import { Button } from '@/components/Button'
import { Skeleton } from '@/components/Skeleton'
import { useLanguage } from '@/contexts/LanguageContext'
import type { TranslationKey } from '@/i18n/translations'

const TNUM = { fontFeatureSettings: "'lnum' 1, 'tnum' 1" } as const

/* ── Simulated new-trade generator ─────────────────────────────────── */

const TOKEN_POOL = [
  { name: 'GRASS', logo: '/assets/tokens/grass.png', chain: '/assets/tokens/chain-solana.png' },
  { name: 'SKATE', logo: '/assets/tokens/skate.png', chain: '/assets/tokens/chain-solana.png' },
  { name: 'ERA', logo: '/assets/tokens/era.png', chain: '/assets/tokens/chain-ethereum.png' },
  { name: 'IKA', logo: '/assets/tokens/era.png', chain: '/assets/tokens/chain-ethereum.png' },
  { name: 'PENGU', logo: '/assets/tokens/skate.png', chain: '/assets/tokens/chain-solana.png' },
  { name: 'LOUD', logo: '/assets/tokens/loud.png', chain: '/assets/tokens/chain-solana.png' },
  { name: 'MMT', logo: '/assets/tokens/mmt.png', chain: '/assets/tokens/chain-solana.png' },
] as const

const COLLATERAL_TOKENS = ['/assets/tokens/usdc.svg', '/assets/tokens/usdt.svg'] as const

const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]
const rand = (min: number, max: number) => min + Math.random() * (max - min)

const getTier = (col: number): RecentActivity['tier'] => {
  if (col >= 5000) return 'whale'
  if (col >= 1000) return 'shark'
  if (col >= 500) return 'dolphin'
  if (col >= 100) return 'fish'
  return 'shrimp'
}

let nextId = 100

function generateTrade(): RecentActivity {
  const token = pick(TOKEN_POOL)
  const side = Math.random() > 0.4 ? 'Buy' : 'Sell'
  const orderType = Math.random() > 0.25 ? 'Filled' : 'Open'
  const price = parseFloat(rand(0.003, 0.15).toFixed(4))
  const collateral = parseFloat(
    pick([3, 10, 50, 100, 200, 250, 500, 1000, 2000, 5000, 8500].map(Number)).toFixed(2),
  )
  const amount = parseFloat((collateral / price).toFixed(2))

  return {
    id: String(++nextId),
    time: '',                        // computed dynamically via relativeTime()
    createdAt: Date.now(),
    orderType,
    side,
    tokenName: token.name,
    tokenLogoUrl: token.logo,
    chainLogoUrl: token.chain,
    isRs: Math.random() > 0.75,
    price,
    amount,
    collateral,
    collateralTokenLogoUrl: pick(COLLATERAL_TOKENS),
    tier: getTier(collateral),
  }
}

/** Relative time label from epoch timestamp */
const relativeTime = (ms: number): string => {
  const sec = Math.floor((Date.now() - ms) / 1000)
  if (sec < 10) return 'just now'
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  return `${hr}h ago`
}

/** Display time: use createdAt if available, else static string */
const displayTime = (a: RecentActivity): string =>
  a.createdAt ? relativeTime(a.createdAt) : a.time

/** Max rows visible in the table */
const MAX_ROWS = 12

/* ── Sort icon (filled triangles) ────────────────────────────────── */
const SortIcon = ({ dir }: { dir: SortDir }) => (
  <svg viewBox="0 0 16 16" className="size-4 shrink-0">
    <path d="M5 7L8 3L11 7Z" fill="currentColor" className={dir === 'asc' ? 'text-wm-text-01' : 'text-wm-text-03'} />
    <path d="M5 9L8 13L11 9Z" fill="currentColor" className={dir === 'desc' ? 'text-wm-text-01' : 'text-wm-text-03'} />
  </svg>
)

/* ── Sort types ──────────────────────────────────────────────────── */
type SortKey = 'time' | 'price' | 'amount' | 'collateral' | 'txId'
type SortDir = 'asc' | 'desc' | null

/* ── Filter types ─────────────────────────────────────────────────── */
type FilterType = 'all' | 'Open' | 'Filled'
type FilterSide = 'all' | 'Buy' | 'Sell'

const TYPE_OPTIONS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'Open', label: 'Open Order' },
  { id: 'Filled', label: 'Filled Order' },
]

const SIDE_OPTIONS: { id: FilterSide; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'Buy', label: 'Buy' },
  { id: 'Sell', label: 'Sell' },
]

/* ── Column definitions — Figma widths: 128/128/128/flex-1/168/168/168/168 ── */
const COLUMNS: { label: string; width: string; sortKey?: SortKey; align?: string }[] = [
  { label: 'Time', width: 'w-[128px]', sortKey: 'time' },
  { label: 'Order Type', width: 'w-[128px]' },
  { label: 'Side', width: 'w-[128px]' },
  { label: 'Token', width: 'flex-[1_0_0] min-w-[120px]' },
  { label: 'Price ($)', width: 'w-[168px]', sortKey: 'price', align: 'justify-end' },
  { label: 'Amount', width: 'w-[168px]', sortKey: 'amount', align: 'justify-end' },
  { label: 'Collateral', width: 'w-[168px]', sortKey: 'collateral', align: 'justify-end' },
  { label: 'Tx.ID', width: 'w-[168px]', align: 'justify-end' },
]

/* ── Time → sortable number ──────────────────────────────────────── */
const timeToMinutes = (t: string): number => {
  const m = t.match(/(\d+)\s*(m|h|d)/)
  if (!m) return 0
  const v = parseInt(m[1])
  if (m[2] === 'h') return v * 60
  if (m[2] === 'd') return v * 1440
  return v
}

const fmt = (n: number): string => {
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`
  return n.toFixed(2)
}

/* ── 5 tier icons — whale > shark > dolphin > fish > shrimp ──────── */
const TIER_IMG: Record<string, string> = {
  shrimp: '/assets/icons/tier-shrimp.svg',
  fish: '/assets/icons/tier-fish.svg',
  dolphin: '/assets/icons/tier-dolphin.svg',
  shark: '/assets/icons/tier-shark.svg',
  whale: '/assets/icons/tier-whale.svg',
}

/* ── Mock Solscan URL for Tx link ────────────────────────────────── */
const SOLSCAN_URL = 'https://solscan.io/token/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

/* ── Skeleton row — Figma node 40123:174250 ──────────────────────── */
const SkeletonRow = ({ index }: { index: number }) => (
  <div className="flex items-center px-2 border-t border-wm-border-01" style={{ animationDelay: `${index * 80}ms` }}>
    <div className="w-[128px] shrink-0 py-4"><Skeleton w={44} h={20} /></div>
    <div className="w-[128px] shrink-0 py-4"><Skeleton w={44} h={20} /></div>
    <div className="w-[128px] shrink-0 py-4"><Skeleton w={44} h={20} /></div>
    <div className="flex-[1_0_0] min-w-[120px] flex items-center gap-2 py-4">
      <Skeleton w={16} h={16} circle />
      <Skeleton w={44} h={20} />
    </div>
    <div className="w-[168px] shrink-0 flex justify-end py-4"><Skeleton w={44} h={20} /></div>
    <div className="w-[168px] shrink-0 flex justify-end py-4"><Skeleton w={44} h={20} /></div>
    <div className="w-[168px] shrink-0 flex items-center justify-end gap-2 py-4">
      <Skeleton w={44} h={20} />
      <Skeleton w={16} h={16} circle />
      <Skeleton w={16} h={16} circle />
    </div>
    <div className="w-[168px] shrink-0 flex justify-end py-4">
      <div className="p-1.5 border border-wm-border-02 rounded-md">
        <Skeleton w={12} h={12} />
      </div>
    </div>
  </div>
)

/* ── Mobile activity card — Figma node 44740:769576 ──────────────── */
const MobileActivityRow = ({ a, isNew, t }: { a: RecentActivity; isNew: boolean; t: (key: TranslationKey) => string }) => {
  const cardContent = (
    <div
      className="flex flex-col gap-3 py-4 border-t border-wm-border-01"
      onClick={() => window.open(SOLSCAN_URL, '_blank', 'noopener,noreferrer')}
    >
      {/* Row 1: "Filled Order  Sell  🟢 GRASS"  +  "1m ago" */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <span className="text-label-sm text-wm-text-01 whitespace-nowrap" style={TNUM}>
            {a.orderType}
          </span>
          <span
            className={`text-label-sm whitespace-nowrap ${
              a.side === 'Buy' ? 'text-wm-text-green' : 'text-wm-text-danger'
            }`}
            style={TNUM}
          >
            {a.side}
          </span>
          {a.isRs && (
            <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-[#eab308] text-[10px] font-medium leading-3 text-wm-text-inv uppercase" style={TNUM}>
              RS
            </span>
          )}
          <img src={a.tokenLogoUrl} alt={a.tokenName} className="size-4 rounded-full object-cover shrink-0 ml-1" />
          <span className="text-label-sm text-wm-text-01" style={TNUM}>
            {a.tokenName}
          </span>
        </div>
        <span className="text-body-xs text-wm-text-03 shrink-0 ml-2" style={TNUM}>
          {displayTime(a)}
        </span>
      </div>

      {/* Row 2-3: Price + Amount/Collateral + Tx button */}
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          {/* Price */}
          <div className="flex items-center gap-1">
            <span className="text-body-xs text-wm-text-03" style={TNUM}>{t('home.price')}</span>
            <span className="text-body-xs text-wm-text-01" style={TNUM}>
              ${a.price.toFixed(4)}
            </span>
          </div>
          {/* Amount / Collateral */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-body-xs text-wm-text-03" style={TNUM}>{t('home.amount')}</span>
            <span className="text-body-xs text-wm-text-03" style={TNUM}>/</span>
            <span className="text-body-xs text-wm-text-03" style={TNUM}>{t('home.collateral')}</span>
            <span className="text-body-xs text-wm-text-01" style={TNUM}>
              {fmt(a.amount)}
            </span>
            <span className="text-body-xs text-wm-text-03" style={TNUM}>/</span>
            <span className="text-body-xs text-wm-text-01" style={TNUM}>
              {fmt(a.collateral)}
            </span>
            <span className="text-body-xs text-wm-text-01" style={TNUM}>
              USDC
            </span>
            <img src={a.collateralTokenLogoUrl} alt="" className="size-4 rounded-full object-cover shrink-0" />
          </div>
        </div>
        {/* Tx button */}
        <div className="flex items-center justify-center p-1.5 border border-wm-border-02 rounded-md shrink-0 ml-2">
          <ArrowRightUpFill size={12} className="text-wm-text-03" />
        </div>
      </div>
    </div>
  )

  return isNew ? (
    <div className="recent-row-enter">
      <div className="recent-row-inner">{cardContent}</div>
    </div>
  ) : (
    <div>{cardContent}</div>
  )
}

/* ── Mobile skeleton row ──────────────────────────────────────────── */
const MobileSkeletonRow = ({ index }: { index: number }) => (
  <div className="flex flex-col gap-3 py-4 border-t border-wm-border-01" style={{ animationDelay: `${index * 80}ms` }}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Skeleton w={60} h={20} />
        <Skeleton w={24} h={20} />
        <Skeleton w={16} h={16} circle />
        <Skeleton w={40} h={20} />
      </div>
      <Skeleton w={36} h={16} />
    </div>
    <div className="flex items-end justify-between">
      <div className="flex flex-col gap-1">
        <Skeleton w={80} h={16} />
        <Skeleton w={200} h={16} />
      </div>
      <Skeleton w={28} h={28} />
    </div>
  </div>
)

const RecentActivities = () => {
  const { t } = useLanguage()
  const [showFilter, setShowFilter] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)

  /* ── Simulated loading (800–1200ms, slightly after MarketSection) ── */
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const delay = 800 + Math.random() * 400
    const timer = setTimeout(() => setLoading(false), delay)
    return () => clearTimeout(timer)
  }, [])

  /* ── Tick counter — forces re-render every 10s to update relative times ── */
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 10_000)
    return () => clearInterval(id)
  }, [])

  /* ── Live data with simulated new trades ─────────────────────────── */
  const [liveData, setLiveData] = useState<RecentActivity[]>(() => [...recentActivities])
  const [newId, setNewId] = useState<string | null>(null)

  /** Add a single new trade at the top, cap list at MAX_ROWS */
  const addNewTrade = useCallback(() => {
    const trade = generateTrade()
    setLiveData((prev) => [trade, ...prev].slice(0, MAX_ROWS))
    setNewId(trade.id)

    // Clear animation flag after animation completes
    setTimeout(() => setNewId(null), 1000)
  }, [])

  /**
   * Random interval with high variance to feel organic.
   * Min gap = 1.2s (animation duration) to avoid overlap.
   */
  useEffect(() => {
    if (loading) return

    let timer: ReturnType<typeof setTimeout>

    const nextDelay = (): number => {
      const r = Math.random()
      if (r < 0.15) return rand(2000, 4000)    // 15% — quick
      if (r < 0.65) return rand(6000, 12000)   // 50% — medium
      return rand(14000, 25000)                 // 35% — long pause
    }

    const scheduleNext = (isFirst: boolean) => {
      const delay = isFirst ? rand(3000, 5000) : nextDelay()
      timer = setTimeout(() => {
        addNewTrade()
        scheduleNext(false)
      }, delay)
    }

    scheduleNext(true)
    return () => clearTimeout(timer)
  }, [loading, addNewTrade])

  /* ── Filter state ───────────────────────────────────────────────── */
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [filterSide, setFilterSide] = useState<FilterSide>('all')
  const [draftType, setDraftType] = useState<FilterType>('all')
  const [draftSide, setDraftSide] = useState<FilterSide>('all')

  /* ── Click outside to close ─────────────────────────────────────── */
  const filterRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!showFilter) return
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showFilter])

  /* ── Open dropdown → sync draft with applied filter ─────────────── */
  const toggleFilter = () => {
    if (!showFilter) {
      setDraftType(filterType)
      setDraftSide(filterSide)
    }
    setShowFilter(!showFilter)
  }

  const handleApply = () => {
    setFilterType(draftType)
    setFilterSide(draftSide)
    setShowFilter(false)
  }

  const handleReset = () => {
    setDraftType('all')
    setDraftSide('all')
  }

  const isFiltered = filterType !== 'all' || filterSide !== 'all'

  /* ── Toggle sort ──────────────────────────────────────────────── */
  const handleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir('asc')
    } else if (sortDir === 'asc') {
      setSortDir('desc')
    } else {
      setSortKey(null)
      setSortDir(null)
    }
  }

  /* ── Filtered + sorted data ─────────────────────────────────────── */
  const sortedData = useMemo(() => {
    let list = [...liveData]

    /* Apply filters */
    if (filterType !== 'all') {
      list = list.filter((a) => a.orderType === filterType)
    }
    if (filterSide !== 'all') {
      list = list.filter((a) => a.side === filterSide)
    }

    /* Apply sort */
    if (sortKey && sortDir) {
      const mul = sortDir === 'asc' ? 1 : -1
      list.sort((a: RecentActivity, b: RecentActivity) => {
        switch (sortKey) {
          case 'time': {
            // createdAt items: newer = smaller minutes-ago value
            const aMin = a.createdAt ? (Date.now() - a.createdAt) / 60_000 : timeToMinutes(a.time)
            const bMin = b.createdAt ? (Date.now() - b.createdAt) / 60_000 : timeToMinutes(b.time)
            return mul * (aMin - bMin)
          }
          case 'price': return mul * (a.price - b.price)
          case 'amount': return mul * (a.amount - b.amount)
          case 'collateral': return mul * (a.collateral - b.collateral)
          case 'txId': return mul * (parseInt(a.id) - parseInt(b.id))
          default: return 0
        }
      })
    }

    return list
  }, [liveData, sortKey, sortDir, filterType, filterSide])

  return (
    <div className="flex flex-col pb-4">
      {/* Title bar — Figma: border-t, h-60px, "Recent Activities" 20/28 Medium */}
      <div className="flex items-center justify-between h-15">
        <h2 className="text-label-md lg:text-heading-sm text-wm-text-01" style={TNUM}>
          <span className="lg:hidden">{t('home.recentTrades')}</span>
          <span className="hidden lg:inline">{t('home.recentActivities')}</span>
        </h2>

        {/* Filter button + dropdown — relative wrapper */}
        <div ref={filterRef} className="relative">
          <button
            onClick={toggleFilter}
            className={`group/filter flex gap-1.5 items-center overflow-clip p-2 rounded-lg transition-colors cursor-pointer ${
              showFilter || isFiltered ? 'bg-wm-bg-03' : 'bg-wm-bg-02 hover:bg-wm-bg-03'
            }`}
          >
            <div className="flex items-center p-0.5 shrink-0">
              <Filter2Fill className="size-4 text-wm-text-01" />
            </div>
            <span className="text-label-sm text-wm-text-01 whitespace-nowrap" style={TNUM}>
              {t('home.filter')}
            </span>
            {isFiltered && (
              <span className="flex items-center justify-center size-5 rounded-full bg-wm-bg-primary text-[10px] font-medium leading-none text-wm-text-01">
                {(filterType !== 'all' ? 1 : 0) + (filterSide !== 'all' ? 1 : 0)}
              </span>
            )}
            <div className={`flex items-center p-0.5 shrink-0 transition-colors ${
              showFilter ? 'text-wm-text-01' : 'text-wm-text-03 group-hover/filter:text-wm-text-01'
            }`}>
              <DownFill className={`size-4 transition-transform ${showFilter ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* ── Filter dropdown panel — Figma node 44687:771603 ───── */}
          {showFilter && (
            <div className="absolute right-0 top-full mt-2 w-[240px] bg-wm-bg-02 rounded-[10px] shadow-[0_0_32px_rgba(0,0,0,0.2)] z-50 overflow-clip">
              {/* Type filter group */}
              <div className="flex flex-col gap-1 p-2 border-b border-wm-border-02">
                <div className="flex items-center px-2 py-1">
                  <span className="text-label-xs text-wm-text-03" style={TNUM}>{t('home.filterType')}</span>
                </div>
                {TYPE_OPTIONS.map((opt) => {
                  const isSelected = draftType === opt.id
                  const typeLabels: Record<FilterType, TranslationKey> = { all: 'home.filterAll', Open: 'home.filterOpen', Filled: 'home.filterFilled' }
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setDraftType(opt.id)}
                      className={`flex gap-2 items-center overflow-clip px-2 py-2 rounded-lg w-full transition-colors cursor-pointer ${
                        isSelected ? 'bg-wm-bg-03' : 'hover:bg-wm-bg-03'
                      }`}
                    >
                      <span className="flex-1 min-w-0 text-left text-label-sm text-wm-text-01" style={TNUM}>
                        {t(typeLabels[opt.id])}
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

              {/* Side filter group */}
              <div className="flex flex-col gap-1 p-2">
                <div className="flex items-center px-2 py-1">
                  <span className="text-label-xs text-wm-text-03" style={TNUM}>{t('home.filterSide')}</span>
                </div>
                {SIDE_OPTIONS.map((opt) => {
                  const isSelected = draftSide === opt.id
                  const sideLabels: Record<FilterSide, TranslationKey> = { all: 'home.filterAll', Buy: 'home.filterBuy', Sell: 'home.filterSell' }
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setDraftSide(opt.id)}
                      className={`flex gap-2 items-center overflow-clip px-2 py-2 rounded-lg w-full transition-colors cursor-pointer ${
                        isSelected ? 'bg-wm-bg-03' : 'hover:bg-wm-bg-03'
                      }`}
                    >
                      <span className="flex-1 min-w-0 text-left text-label-sm text-wm-text-01" style={TNUM}>
                        {t(sideLabels[opt.id])}
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

              {/* Bottom actions — Reset + Apply */}
              <div className="flex items-center gap-2 px-4 py-3 border-t border-wm-border-02">
                <Button
                  variant="secondary"
                  appearance="outline"
                  size="md"
                  onClick={handleReset}
                  className="flex-1"
                >
                  {t('home.reset')}
                </Button>
                <Button
                  variant="primary"
                  appearance="filled"
                  size="md"
                  onClick={handleApply}
                  className="flex-1"
                >
                  {t('home.apply')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Desktop scrollable table ──────────────────────────────── */}
      <div className="hidden lg:block overflow-x-auto scrollbar-styled">
        <div className="min-w-fit">
          {/* Table header */}
          <div className="flex items-center px-2">
            {COLUMNS.map((col) => (
              <div
                key={col.label}
                className={`${col.width} shrink-0 flex items-center gap-0.5 py-2 ${col.align || ''} ${col.sortKey ? 'cursor-pointer select-none' : ''}`}
                onClick={col.sortKey ? () => handleSort(col.sortKey!) : undefined}
              >
                <span className="text-body-xs text-wm-text-03" style={TNUM}>
                  {col.label}
                </span>
                {col.sortKey && <SortIcon dir={sortKey === col.sortKey ? sortDir : null} />}
              </div>
            ))}
          </div>

          {/* Desktop rows */}
          <div className="min-h-[520px]">
      {loading
        ? Array.from({ length: 10 }, (_, i) => <SkeletonRow key={`skel-${i}`} index={i} />)
        : sortedData.map((a) => {
          const isNew = a.id === newId
          const rowContent = (
            <div
              className="group/row flex items-center px-2 border-t border-wm-border-01 hover:bg-wm-overlay-3 transition-colors cursor-pointer"
              onClick={() => window.open(SOLSCAN_URL, '_blank', 'noopener,noreferrer')}
            >
              {/* Time */}
              <div className="w-[128px] shrink-0 py-4">
                <span className="text-body-sm text-wm-text-03" style={TNUM}>
                  {displayTime(a)}
                </span>
              </div>

              {/* Order Type */}
              <div className="w-[128px] shrink-0 py-4">
                <span className="text-label-sm text-wm-text-01" style={TNUM}>
                  {a.orderType}
                </span>
              </div>

              {/* Side — plain colored text + optional RS badge */}
              <div className="w-[128px] shrink-0 flex items-center gap-2 py-4">
                <span
                  className={`text-label-sm ${
                    a.side === 'Buy' ? 'text-wm-text-green' : 'text-wm-text-danger'
                  }`}
                  style={TNUM}
                >
                  {a.side}
                </span>
                {a.isRs && (
                  <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-[#eab308] text-[10px] font-medium leading-3 text-wm-text-inv uppercase" style={TNUM}>
                    RS
                  </span>
                )}
              </div>

              {/* Token — 16px icon + name */}
              <div className="flex-[1_0_0] min-w-[120px] flex items-center gap-2 py-4">
                <img src={a.tokenLogoUrl} alt={a.tokenName} className="size-4 rounded-full object-cover shrink-0" />
                <span className="text-label-sm text-wm-text-01" style={TNUM}>
                  {a.tokenName}
                </span>
              </div>

              {/* Price */}
              <div className="w-[168px] shrink-0 flex justify-end py-4">
                <span className="text-label-sm text-wm-text-01" style={TNUM}>
                  {a.price.toFixed(4)}
                </span>
              </div>

              {/* Amount */}
              <div className="w-[168px] shrink-0 flex justify-end py-4">
                <span className="text-label-sm text-wm-text-01" style={TNUM}>
                  {fmt(a.amount)}
                </span>
              </div>

              {/* Collateral — amount + currency icon + tier icon */}
              <div className="w-[168px] shrink-0 flex items-center justify-end gap-2 py-4">
                <span className="text-label-sm text-wm-text-01" style={TNUM}>
                  {fmt(a.collateral)}
                </span>
                <img src={a.collateralTokenLogoUrl} alt="" className="size-4 rounded-full object-cover shrink-0" />
                <img src={TIER_IMG[a.tier]} alt={a.tier} className="size-4 shrink-0" />
              </div>

              {/* Tx.ID — arrow button, hover state follows row hover */}
              <div className="w-[168px] shrink-0 flex items-center justify-end py-4">
                <div className="flex items-center justify-center p-1.5 border border-wm-border-02 rounded-md transition-colors group-hover/row:bg-wm-overlay-5 group-hover/row:border-wm-border-03">
                  <ArrowRightUpFill size={12} className="text-wm-text-03 transition-colors group-hover/row:text-wm-text-01" />
                </div>
              </div>
            </div>
          )

          /* New rows: grid slide-open wrapper; existing rows: render directly */
          return isNew ? (
            <div key={a.id} className="recent-row-enter">
              <div className="recent-row-inner">{rowContent}</div>
            </div>
          ) : (
            <div key={a.id}>{rowContent}</div>
          )
        })
      }
          </div>
        </div>
      </div>

      {/* ── Mobile card rows ─────────────────────────────────────── */}
      <div className="lg:hidden">
        {loading
          ? Array.from({ length: 6 }, (_, i) => <MobileSkeletonRow key={`mskel-${i}`} index={i} />)
          : sortedData.map((a) => (
              <MobileActivityRow key={a.id} a={a} isNew={a.id === newId} t={t} />
            ))
        }
      </div>
    </div>
  )
}

export default RecentActivities
