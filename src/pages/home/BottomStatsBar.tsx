import { bottomStats } from '@/mock-data/home'

const TNUM = { fontFeatureSettings: "'lnum' 1, 'tnum' 1" } as const

const fmt = (n: number): string =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const BottomStatsBar = () => (
  <div className="border-t border-wm-border-01 py-3 flex items-center justify-between">
    {/* Left stats */}
    <div className="flex items-center gap-6">
      {/* Live indicator */}
      <div className="flex items-center gap-2">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-wm-text-green opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-wm-text-green" />
        </span>
        <span className="text-label-xs text-wm-text-green uppercase" style={TNUM}>
          Live Data
        </span>
      </div>

      {/* Total Vol */}
      <div className="flex items-center gap-1.5">
        <span className="text-body-xs text-wm-text-03">Total Vol</span>
        <span className="text-label-xs text-wm-text-01" style={TNUM}>
          ${fmt(bottomStats.totalVol)}
        </span>
      </div>

      {/* Vol 24h */}
      <div className="flex items-center gap-1.5">
        <span className="text-body-xs text-wm-text-03">Vol 24h</span>
        <span className="text-label-xs text-wm-text-01" style={TNUM}>
          ${fmt(bottomStats.vol24h)}
        </span>
      </div>
    </div>

    {/* Right — pagination + social */}
    <div className="flex items-center gap-4">
      <span className="text-body-xs text-wm-text-03">Data</span>
      <span className="text-body-xs text-wm-text-03">Base</span>
      <span className="text-body-xs text-wm-text-03">Link</span>
    </div>
  </div>
)

export default BottomStatsBar
