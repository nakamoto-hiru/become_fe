import { marketListItems, type MarketListItem } from '@/mock-data/home'
import type { MarketTab } from './MarketTabs'

/* ── Mini sparkline chart ──────────────────────────────────────────── */
const MiniChart = ({ direction }: { direction: 'up' | 'down' }) => {
  const color = direction === 'up' ? 'var(--wm-text-green)' : 'var(--wm-text-danger)'
  const path =
    direction === 'up'
      ? 'M0 35 C10 33, 20 28, 30 25 C40 22, 50 30, 60 18 C70 6, 80 12, 96 4'
      : 'M0 8 C10 10, 20 15, 30 18 C40 21, 50 14, 60 25 C70 37, 80 32, 96 38'
  return (
    <svg viewBox="0 0 96 44" fill="none" className="w-24 h-11">
      <path d={`${path} L96 44 L0 44 Z`} fill={color} fillOpacity="0.1" />
      <path d={path} stroke={color} strokeWidth="1.5" fill="none" />
    </svg>
  )
}

/* ── Sort icon ─────────────────────────────────────────────────────── */
const SortIcon = () => (
  <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-wm-text-03">
    <path d="M5 6L8 3L11 6" stroke="currentColor" strokeWidth="1.2" fill="none" />
    <path d="M5 10L8 13L11 10" stroke="currentColor" strokeWidth="1.2" fill="none" />
  </svg>
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

/* ── Status badge ──────────────────────────────────────────────────── */
const StatusBadge = ({ item }: { item: MarketListItem }) => {
  if (item.status === 'settling') {
    return (
      <div className="flex flex-col items-end gap-1">
        <span
          className="text-label-sm text-wm-text-warning"
          style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
        >
          3h : 34m : 59s
        </span>
        <span className="px-2 py-1 rounded-full text-[10px] leading-[12px] font-medium uppercase bg-wm-bg-warning-muted-10 text-wm-text-warning">
          Settling
        </span>
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

/* ── Column headers ────────────────────────────────────────────────── */
const COLUMNS = [
  { label: 'Token', width: 'flex-[1_1_0] min-w-[200px]', align: '' },
  { label: '', width: 'flex-[0_0_96px]', align: '' },
  { label: 'Last Price ($)', width: 'w-[168px]', align: 'text-right', sort: true },
  { label: '24h Vol. ($)', width: 'w-[168px]', align: 'text-right', sort: true },
  { label: 'Total Vol. ($)', width: 'w-[168px]', align: 'text-right', sort: true },
  { label: 'Implied FDV ($)', width: 'w-[168px]', align: 'text-right', sort: true },
  { label: 'Settle Time (UTC)', width: 'w-[168px]', align: 'text-right', dashed: true },
]

/* ── Market row ────────────────────────────────────────────────────── */
const MarketRow = ({ item }: { item: MarketListItem }) => {
  const priceChg = fmtChange(item.priceChange)
  const liqChg = fmtChange(item.liqVolChange)
  const totalChg = fmtChange(item.totalVolChange)

  return (
    <div className="flex items-center px-2 border-t border-wm-border-01 hover:bg-wm-overlay-3 transition-colors cursor-pointer">
      {/* Token */}
      <div className="flex-[1_1_0] min-w-[200px] flex items-center gap-3 py-4">
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
            {item.isNew && (
              <span className="px-2 py-1 rounded-full text-[10px] leading-[12px] font-medium uppercase bg-wm-bg-info-muted-10 text-wm-text-info">
                New Market
              </span>
            )}
          </div>
          <span className="text-body-sm text-wm-text-03" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
            {item.protocol}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="w-24 py-3 shrink-0">
        <MiniChart direction={item.chartDirection} />
      </div>

      {/* Last Price */}
      <div className="w-[168px] shrink-0 flex flex-col items-end gap-1 py-3">
        <span className="text-label-sm text-wm-text-01" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
          {fmtPrice(item.lastPrice)}
        </span>
        <span className={`text-body-sm ${priceChg.cls}`} style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
          {priceChg.text}
        </span>
      </div>

      {/* 24h Vol */}
      <div className="w-[168px] shrink-0 flex flex-col items-end gap-1 py-3">
        <span className="text-label-sm text-wm-text-01" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
          {fmt(item.liqVol24h)}
        </span>
        <span className={`text-body-sm ${liqChg.cls}`} style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
          {liqChg.text}
        </span>
      </div>

      {/* Total Vol */}
      <div className="w-[168px] shrink-0 flex flex-col items-end gap-1 py-3">
        <span className="text-label-sm text-wm-text-01" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
          {fmt(item.totalVol)}
        </span>
        <span className={`text-body-sm ${totalChg.cls}`} style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
          {totalChg.text}
        </span>
      </div>

      {/* Implied FDV */}
      <div className="w-[168px] shrink-0 flex flex-col items-end gap-1 py-3">
        <span className="text-label-sm text-wm-text-01" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
          {fmt(item.impliedFdv, 1)}
        </span>
      </div>

      {/* Settle Time */}
      <div className="w-[168px] shrink-0 flex flex-col items-end py-3">
        <StatusBadge item={item} />
      </div>
    </div>
  )
}

/* ── MarketTable ───────────────────────────────────────────────────── */
interface MarketTableProps {
  activeTab: MarketTab
}

const MarketTable = ({ activeTab }: MarketTableProps) => {
  const filtered = marketListItems.filter((m) => {
    if (activeTab === 'live') return m.status === 'live' || m.status === 'settling'
    if (activeTab === 'upcoming') return m.status === 'upcoming'
    return m.status === 'ended'
  })

  return (
    <div className="flex flex-col pb-8">
      {/* Header */}
      <div className="flex items-center px-2">
        {COLUMNS.map((col) => (
          <div
            key={col.label || 'chart'}
            className={`${col.width} shrink-0 flex items-center gap-0.5 py-2 ${col.align}`}
          >
            {col.label && (
              <span
                className={`text-body-xs text-wm-text-03 ${col.dashed ? 'border-b border-dashed border-wm-border-03 pb-0.5' : ''} ${col.align}`}
                style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
              >
                {col.label}
              </span>
            )}
            {col.sort && <SortIcon />}
          </div>
        ))}
      </div>

      {/* Rows */}
      {filtered.map((item) => (
        <MarketRow key={item.id} item={item} />
      ))}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="py-16 text-center text-wm-text-03 text-body-sm">
          No markets found for this tab.
        </div>
      )}
    </div>
  )
}

export default MarketTable
