import { useState } from 'react'
import { recentActivities } from '@/mock-data/home'
import { ArrowRightUpLine } from '@mingcute/react'

/* ── Filter icon ───────────────────────────────────────────────────── */
const FilterIcon = () => (
  <svg viewBox="0 0 16 16" className="size-4" fill="none">
    <path
      d="M2 4h12M4 8h8M6 12h4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

/* ── Sort icon ─────────────────────────────────────────────────────── */
const SortIcon = () => (
  <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-wm-text-03">
    <path d="M5 6L8 3L11 6" stroke="currentColor" strokeWidth="1.2" fill="none" />
    <path d="M5 10L8 13L11 10" stroke="currentColor" strokeWidth="1.2" fill="none" />
  </svg>
)

const TNUM = { fontFeatureSettings: "'lnum' 1, 'tnum' 1" } as const

const COLUMNS = [
  { label: 'Time', width: 'w-[100px]', sort: true },
  { label: 'Order Type', width: 'w-[100px]' },
  { label: 'Side', width: 'w-[80px]' },
  { label: 'Token', width: 'flex-[1_1_0] min-w-[120px]' },
  { label: 'Price (S)', width: 'w-[120px]', sort: true, align: 'text-right' },
  { label: 'Amount #', width: 'w-[120px]', align: 'text-right' },
  { label: 'Collateral $', width: 'w-[120px]', align: 'text-right' },
  { label: 'Tx #', width: 'w-[80px]', align: 'text-right' },
]

const fmt = (n: number): string => {
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`
  return n.toFixed(2)
}

const RecentActivities = () => {
  const [showFilter, setShowFilter] = useState(false)

  return (
    <div className="flex flex-col">
      {/* Title + Filter */}
      <div className="flex items-center justify-between py-4">
        <h2
          className="text-heading-sm text-wm-text-01"
          style={TNUM}
        >
          Recent Activities
        </h2>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-wm-border-02 text-label-sm text-wm-text-01 hover:bg-wm-overlay-5 transition-colors"
        >
          <FilterIcon />
          Filter
        </button>
      </div>

      {/* Table header */}
      <div className="flex items-center px-2">
        {COLUMNS.map((col) => (
          <div
            key={col.label}
            className={`${col.width} shrink-0 flex items-center gap-0.5 py-2 ${col.align || ''}`}
          >
            <span className="text-body-xs text-wm-text-03" style={TNUM}>
              {col.label}
            </span>
            {col.sort && <SortIcon />}
          </div>
        ))}
      </div>

      {/* Rows */}
      {recentActivities.map((a) => (
        <div
          key={a.id}
          className="flex items-center px-2 border-t border-wm-border-01 hover:bg-wm-overlay-3 transition-colors"
        >
          {/* Time */}
          <div className="w-[100px] shrink-0 py-3">
            <span className="text-body-sm text-wm-text-03" style={TNUM}>
              {a.time}
            </span>
          </div>

          {/* Order Type */}
          <div className="w-[100px] shrink-0 py-3">
            <span className="text-label-sm text-wm-text-01" style={TNUM}>
              {a.orderType}
            </span>
          </div>

          {/* Side */}
          <div className="w-[80px] shrink-0 py-3">
            <span
              className={`inline-flex px-2 py-0.5 rounded text-label-xs ${
                a.side === 'Buy'
                  ? 'bg-wm-bg-primary-20 text-wm-text-green'
                  : 'bg-[rgba(253,94,103,0.1)] text-wm-text-danger'
              }`}
              style={TNUM}
            >
              {a.side}
            </span>
            {a.isVip && (
              <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-wm-bg-warning-muted-10 text-wm-text-warning font-medium">
                VIP
              </span>
            )}
          </div>

          {/* Token */}
          <div className="flex-[1_1_0] min-w-[120px] shrink-0 flex items-center gap-2 py-3">
            <div className="relative shrink-0">
              <img src={a.tokenLogoUrl} alt={a.tokenName} className="size-6 rounded-full object-cover" />
              <img
                src={a.chainLogoUrl}
                alt=""
                className="absolute -bottom-0.5 -left-0.5 size-3 rounded-[2px] border border-wm-bg-01 object-cover"
              />
            </div>
            <span className="text-label-sm text-wm-text-01" style={TNUM}>
              {a.tokenName}
            </span>
          </div>

          {/* Price */}
          <div className="w-[120px] shrink-0 text-right py-3">
            <span className="text-label-sm text-wm-text-01" style={TNUM}>
              {a.price < 0.01 ? a.price.toFixed(4) : a.price.toFixed(2)}
            </span>
          </div>

          {/* Amount */}
          <div className="w-[120px] shrink-0 text-right py-3">
            <span className="text-label-sm text-wm-text-01" style={TNUM}>
              {fmt(a.amount)}
            </span>
          </div>

          {/* Collateral */}
          <div className="w-[120px] shrink-0 text-right py-3">
            <span className="text-label-sm text-wm-text-01" style={TNUM}>
              {fmt(a.collateral)}
            </span>
          </div>

          {/* Tx */}
          <div className="w-[80px] shrink-0 flex items-center justify-end gap-1 py-3">
            <ArrowRightUpLine size={14} className="text-wm-text-03 hover:text-wm-text-01 cursor-pointer transition-colors" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default RecentActivities
