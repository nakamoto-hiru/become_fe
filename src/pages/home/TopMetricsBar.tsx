import { useState, useEffect } from 'react'
import {
  topMetrics,
  type TopMetricVolume,
  type TopMetricFearGreed,
  type TopMetricAltcoinSeason,
  type TopMetricSettlement,
} from '@/mock-data/home'

/* ── Shared card wrapper ───────────────────────────────────────────── */
const MetricCard = ({ children }: { children: React.ReactNode }) => (
  <div className="flex-1 min-w-0 flex flex-col gap-2 bg-wm-overlay-3 rounded-[10px] pt-4 pb-5 px-5 overflow-hidden">
    {children}
  </div>
)

const MetricLabel = ({ text }: { text: string }) => (
  <p
    className="text-body-xs text-wm-text-03"
    style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
  >
    {text}
  </p>
)

/* ── 1. Volume card ────────────────────────────────────────────────── */
const VolumeCard = ({ data }: { data: TopMetricVolume }) => (
  <MetricCard>
    <MetricLabel text={data.label} />
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-1">
        <p
          className="text-heading-md text-wm-text-01"
          style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
        >
          {data.value}
        </p>
        <p
          className="text-body-xs text-wm-text-green"
          style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
        >
          {data.change}
        </p>
      </div>
      {/* Mini chart — simplified SVG area */}
      <div className="h-12 w-full overflow-hidden">
        <svg viewBox="0 0 287 48" fill="none" className="w-full h-full">
          <path
            d="M0 38 C20 35, 40 30, 60 28 C80 26, 100 32, 120 20 C140 8, 160 15, 180 12 C200 9, 220 18, 240 10 C260 2, 275 8, 287 4 L287 48 L0 48 Z"
            fill="url(#volumeGradient)"
          />
          <path
            d="M0 38 C20 35, 40 30, 60 28 C80 26, 100 32, 120 20 C140 8, 160 15, 180 12 C200 9, 220 18, 240 10 C260 2, 275 8, 287 4"
            stroke="var(--wm-text-green)"
            strokeWidth="1.5"
            fill="none"
          />
          <defs>
            <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--wm-text-green)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--wm-text-green)" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  </MetricCard>
)

/* ── 2. Fear & Greed card ──────────────────────────────────────────── */
const FearGreedCard = ({ data }: { data: TopMetricFearGreed }) => {
  const angle = (data.score / 100) * 180
  return (
    <MetricCard>
      <MetricLabel text={data.label} />
      <div className="relative h-[88px] flex flex-col items-center justify-end">
        {/* Semi-circle gauge */}
        <svg viewBox="0 0 120 65" className="absolute top-0 w-[144px]">
          {/* Background arc */}
          <path
            d="M10 60 A50 50 0 0 1 110 60"
            fill="none"
            stroke="var(--wm-border-02)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Gradient arc */}
          <defs>
            <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fd5e67" />
              <stop offset="30%" stopColor="#fb923c" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="70%" stopColor="#5bd197" />
              <stop offset="100%" stopColor="#16c284" />
            </linearGradient>
          </defs>
          <path
            d="M10 60 A50 50 0 0 1 110 60"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Indicator dot */}
          <circle
            cx={60 - 50 * Math.cos((angle * Math.PI) / 180)}
            cy={60 - 50 * Math.sin((angle * Math.PI) / 180)}
            r="6"
            fill="white"
            stroke="var(--wm-bg-01)"
            strokeWidth="2"
          />
        </svg>
        {/* Score + label */}
        <div className="flex flex-col items-center">
          <p
            className="text-[28px] leading-[36px] font-medium text-wm-text-01"
            style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
          >
            {data.score}
          </p>
          <p
            className="text-body-xs text-wm-text-03"
            style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
          >
            {data.sentiment}
          </p>
        </div>
      </div>
    </MetricCard>
  )
}

/* ── 3. Altcoin Season card ────────────────────────────────────────── */
const AltcoinSeasonCard = ({ data }: { data: TopMetricAltcoinSeason }) => {
  const pct = (data.score / data.total) * 100
  return (
    <MetricCard>
      <MetricLabel text={data.label} />
      <div className="flex flex-col gap-4">
        <div className="flex items-center">
          <p
            className="text-heading-md text-wm-text-01"
            style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
          >
            {data.score}
          </p>
          <p
            className="text-heading-md text-wm-text-03"
            style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
          >
            /{data.total}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-label-xs text-wm-text-01">
            <span style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>Bitcoin</span>
            <span style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>Altcoin</span>
          </div>
          <div className="relative h-2 rounded-lg overflow-hidden">
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                background: 'linear-gradient(to right, var(--wm-text-inv), var(--wm-bg-primary))',
              }}
            />
            {/* Indicator dot */}
            <div
              className="absolute top-1/2 -translate-y-1/2 size-4 rounded-full border-2 border-wm-bg-01 bg-white"
              style={{ left: `${pct}%`, transform: `translate(-50%, -50%)` }}
            />
          </div>
        </div>
      </div>
    </MetricCard>
  )
}

/* ── 4. Next Settlement card ───────────────────────────────────────── */
const SettlementCard = ({ data }: { data: TopMetricSettlement }) => {
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 })

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, new Date(data.settleDate).getTime() - Date.now())
      const s = Math.floor(diff / 1000)
      setCountdown({
        d: Math.floor(s / 86400),
        h: Math.floor((s % 86400) / 3600),
        m: Math.floor((s % 3600) / 60),
        s: s % 60,
      })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [data.settleDate])

  return (
    <MetricCard>
      <MetricLabel text={data.label} />
      <div className="flex flex-col gap-4 items-center justify-center">
        {/* Token info */}
        <div className="flex items-center gap-2 w-full justify-center">
          <img
            src={data.tokenLogoUrl}
            alt={data.tokenName}
            className="size-9 rounded-full object-cover"
          />
          <div className="flex flex-col gap-0.5">
            <p
              className="text-label-sm text-wm-text-01"
              style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
            >
              {data.tokenName}
            </p>
            <p
              className="text-body-xs text-wm-text-03"
              style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
            >
              {new Date(data.settleDate).toLocaleString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'UTC',
              })}{' '}
              (UTC)
            </p>
          </div>
        </div>
        {/* Countdown boxes */}
        <div className="flex gap-2 w-full whitespace-nowrap">
          {[
            { val: countdown.d, unit: 'd' },
            { val: countdown.h, unit: 'h' },
            { val: countdown.m, unit: 'm' },
            { val: countdown.s, unit: 's' },
          ].map((t) => (
            <div
              key={t.unit}
              className="flex-1 flex items-baseline justify-center gap-0.5 bg-wm-overlay-3 rounded-lg px-2 py-1"
            >
              <span
                className="text-label-sm text-wm-text-01"
                style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
              >
                {t.val}
              </span>
              <span
                className="text-body-xs text-wm-text-03"
                style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
              >
                {t.unit}
              </span>
            </div>
          ))}
        </div>
      </div>
    </MetricCard>
  )
}

/* ── TopMetricsBar ─────────────────────────────────────────────────── */
const TopMetricsBar = () => (
  <div className="flex gap-4 pt-4">
    {topMetrics.map((m, i) => {
      switch (m.type) {
        case 'volume':
          return <VolumeCard key={i} data={m} />
        case 'fearGreed':
          return <FearGreedCard key={i} data={m} />
        case 'altcoinSeason':
          return <AltcoinSeasonCard key={i} data={m} />
        case 'settlement':
          return <SettlementCard key={i} data={m} />
      }
    })}
  </div>
)

export default TopMetricsBar
