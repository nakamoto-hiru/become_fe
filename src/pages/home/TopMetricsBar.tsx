import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  topMetrics,
  type TopMetricVolume,
  type TopMetricFearGreed,
  type TopMetricAltcoinSeason,
  type TopMetricSettlement,
} from '@/mock-data/home'

/* ── Chart data types & generator ────────────────────────────────────── */

interface ChartPoint {
  time: Date
  mktCap: number   // $M
  volume: number   // $K
}

/**
 * 12 hand-crafted data points (every 2h) — shape traced from Figma reference:
 * low-left → gentle bump → dip → flat → steep rise → small pullback at end
 */
const VOLUME_CHART_DATA: ChartPoint[] = (() => {
  const now = new Date()
  //                  0h    2h    4h    6h    8h   10h   12h   14h   16h   18h   20h   22h
  const shape = [0.25, 0.30, 0.22, 0.18, 0.28, 0.20, 0.35, 0.55, 0.48, 0.70, 0.85, 0.78]
  return shape.map((v, i) => {
    const time = new Date(now)
    time.setHours(now.getHours() - (11 - i) * 2, 0, 0, 0)
    return {
      time,
      mktCap: 3.6 + v * 0.8,          // $3.6M – $4.4M
      volume: 100 + v * 200,           // $100K – $300K
    }
  })
})()

/* ── Shared card wrapper ───────────────────────────────────────────── */
const MetricCard = ({ children }: { children: React.ReactNode }) => (
  <div className="w-[324px] shrink-0 flex flex-col gap-2 bg-wm-overlay-3 rounded-[10px] pt-4 pb-5 px-5 overflow-hidden">
    {children}
  </div>
)

const MetricLabel = ({ text }: { text: string }) => (
  <p
    className="text-label-xs text-wm-text-03"
    style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
  >
    {text}
  </p>
)

/* ── Interactive mini-chart ───────────────────────────────────────── */

const VW = 284   // svg viewBox width  (matches card inner: 324 - 20*2 = 284)
const VH = 48    // svg viewBox height

const InteractiveVolumeChart = () => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  /* compute SVG path + point coords from data (stable) */
  const { linePath, areaPath, pts } = useMemo(() => {
    const vals = VOLUME_CHART_DATA.map((d) => d.mktCap)
    const min = Math.min(...vals)
    const max = Math.max(...vals)
    const range = max - min || 1

    const points = VOLUME_CHART_DATA.map((_, i) => ({
      x: (i / (VOLUME_CHART_DATA.length - 1)) * VW,
      y: VH - ((vals[i] - min) / range) * (VH - 6) - 3,
    }))

    // smooth cubic bezier
    let d = `M${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      const cpx = (points[i - 1].x + points[i].x) / 2
      d += ` C${cpx} ${points[i - 1].y}, ${cpx} ${points[i].y}, ${points[i].x} ${points[i].y}`
    }

    const area = `${d} L${VW} ${VH} L0 ${VH} Z`
    return { linePath: d, areaPath: area, pts: points }
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      const xRatio = (e.clientX - rect.left) / rect.width
      const idx = Math.round(xRatio * (pts.length - 1))
      setHoverIdx(Math.max(0, Math.min(pts.length - 1, idx)))
    },
    [pts],
  )

  const activePoint = hoverIdx !== null ? pts[hoverIdx] : null
  const activeData  = hoverIdx !== null ? VOLUME_CHART_DATA[hoverIdx] : null

  return (
    <div className="relative h-12 w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VW} ${VH}`}
        fill="none"
        className="w-full h-full cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--wm-text-green)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--wm-text-green)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* area fill */}
        <path d={areaPath} fill="url(#volGrad)" />
        {/* line */}
        <path d={linePath} stroke="var(--wm-text-green)" strokeWidth="1.5" />

        {/* hover decorations */}
        {activePoint && (
          <>
            <line
              x1={activePoint.x} y1={0}
              x2={activePoint.x} y2={VH}
              stroke="var(--wm-text-03)"
              strokeWidth="0.5"
              strokeDasharray="2 2"
            />
            <circle
              cx={activePoint.x}
              cy={activePoint.y}
              r="3"
              fill="var(--wm-text-green)"
              stroke="var(--wm-bg-01)"
              strokeWidth="1.5"
            />
          </>
        )}
      </svg>

      {/* tooltip */}
      {activePoint && activeData && (
        <div
          className="absolute z-10 pointer-events-none bg-wm-bg-02 border border-wm-border-01 rounded-lg px-3 py-2 shadow-lg"
          style={{
            left: `${(activePoint.x / VW) * 100}%`,
            top: '-4px',
            transform: `translate(${activePoint.x > VW * 0.65 ? '-100%' : '0'}, -100%)`,
          }}
        >
          <div
            className="flex flex-col gap-0.5 whitespace-nowrap text-body-xs"
            style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
          >
            <div className="flex justify-between gap-4">
              <span className="text-wm-text-03">Time:</span>
              <span className="text-wm-text-01">
                {activeData.time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}{' '}
                {activeData.time.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-wm-text-03">Mkt Cap:</span>
              <span className="text-wm-text-01">${activeData.mktCap.toFixed(2)}M</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-wm-text-03">Volume:</span>
              <span className="text-wm-text-01">${activeData.volume.toFixed(1)}K</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── 1. Volume card ────────────────────────────────────────────────── */
const VolumeCard = ({ data }: { data: TopMetricVolume }) => (
  <MetricCard>
    <MetricLabel text={data.label} />
    <div className="flex flex-col gap-2 h-[88px]">
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
      {/* Interactive chart with hover tooltip */}
      <InteractiveVolumeChart />
    </div>
  </MetricCard>
)

/* ── 2. Fear & Greed card — real-time simulation ─────────────────────── */

/** Derive sentiment label from score (standard crypto Fear & Greed ranges) */
const getSentiment = (score: number): string => {
  if (score <= 24) return 'Extreme Fear'
  if (score <= 44) return 'Fear'
  if (score <= 55) return 'Neutral'
  if (score <= 74) return 'Greed'
  return 'Extreme Greed'
}


const FearGreedCard = ({ data }: { data: TopMetricFearGreed }) => {
  const [score, setScore] = useState(data.score)

  /* Real-time simulation: nudge score ±1–2 every 8–12s */
  useEffect(() => {
    const tick = () => {
      setScore((prev) => {
        const meanPull = (50 - prev) * 0.02
        const delta = (Math.random() - 0.5) * 4 + meanPull
        return Math.max(0, Math.min(100, Math.round(prev + delta)))
      })
    }
    const id = setInterval(tick, 8000 + Math.random() * 4000)
    return () => clearInterval(id)
  }, [])

  const sentiment = getSentiment(score)

  /*
   * Indicator dot on the arc midline
   * Arc center: (72, 72), midline radius ≈ 68 (between inner ~64 and outer 72)
   * Angle: π * (1 − score/100)  → 0%=left(π), 100%=right(0)
   */
  const R = 68
  const ang = Math.PI * (1 - score / 100)
  const dotCx = 72 + R * Math.cos(ang)
  const dotCy = 72 - R * Math.sin(ang)

  return (
    <MetricCard>
      <MetricLabel text={data.label} />
      {/* Data container — Figma: h-88 w-284 relative */}
      <div className="relative h-[88px] w-[284px]">
        {/* Gauge SVG — exact Figma export, 144×72, centered at top-16px */}
        <svg
          viewBox="0 0 144 144"
          fill="none"
          overflow="visible"
          className="absolute top-4 left-1/2 -translate-x-1/2 size-[144px]"
        >
          <defs>
            <linearGradient
              id="gaugeGrad"
              x1="3.51437" y1="72" x2="140.314" y2="72"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#EC4899" />
              <stop offset="0.5" stopColor="#FDBA74" />
              <stop offset="1" stopColor="#16C284" />
            </linearGradient>
          </defs>

          {/* Filled arc path — traced from Figma SVG export */}
          <path
            d="M3.51437 72C1.52614 72 -0.0950165 70.3872 0.00434875 68.4015C0.41597 60.1757 2.23645 52.0723 5.39503 44.4468C9.01338 35.7113 14.3169 27.7741 21.0027 21.0883C27.6885 14.4025 35.6257 9.09901 44.3612 5.48067C53.0966 1.86233 62.4592 -4.13299e-07 71.9144 0C81.3695 4.13299e-07 90.7321 1.86234 99.4676 5.48068C108.203 9.09901 116.14 14.4025 122.826 21.0883C129.512 27.7741 134.815 35.7114 138.434 44.4468C141.592 52.0723 143.413 60.1757 143.824 68.4015C143.924 70.3872 142.303 72 140.314 72C138.326 72 136.725 70.3869 136.614 68.4018C136.21 61.1221 134.578 53.954 131.782 47.2021C128.525 39.3402 123.752 32.1967 117.735 26.1795C111.718 20.1623 104.574 15.3891 96.7123 12.1326C88.8504 8.87611 80.424 7.20001 71.9144 7.2C63.4047 7.2 54.9784 8.87611 47.1165 12.1326C39.2546 15.3891 32.1111 20.1622 26.0938 26.1795C20.0766 32.1967 15.3035 39.3402 12.047 47.2021C9.25027 53.954 7.61919 61.1221 7.21434 68.4018C7.10394 70.3869 5.50259 72 3.51437 72Z"
            fill="url(#gaugeGrad)"
          />

          {/* Indicator dot — 16×16 white fill + 4px outside border (bg-02) to "cut" the arc */}
          <circle
            cx={dotCx}
            cy={dotCy}
            r="10"
            fill="white"
            stroke="var(--wm-bg-02)"
            strokeWidth="4"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Score + sentiment — absolute bottom, full-width centered per Figma */}
        <div className="absolute bottom-0 left-0 w-full flex flex-col items-center">
          <p
            className="text-heading-lg text-wm-text-01"
            style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
          >
            {score}
          </p>
          <p
            className="text-body-xs text-wm-text-03"
            style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
          >
            {sentiment}
          </p>
        </div>
      </div>
    </MetricCard>
  )
}

/* ── 3. Altcoin Season card — real-time simulation ─────────────────── */
const AltcoinSeasonCard = ({ data }: { data: TopMetricAltcoinSeason }) => {
  const [score, setScore] = useState(data.score)

  /* Real-time simulation: nudge score ±1–3 every 10–15s, mean-revert toward 65 */
  useEffect(() => {
    const tick = () => {
      setScore((prev) => {
        const meanPull = (65 - prev) * 0.03
        const delta = (Math.random() - 0.5) * 6 + meanPull
        return Math.max(0, Math.min(100, Math.round(prev + delta)))
      })
    }
    const id = setInterval(tick, 10000 + Math.random() * 5000)
    return () => clearInterval(id)
  }, [])

  const pct = (score / data.total) * 100

  return (
    <MetricCard>
      <MetricLabel text={data.label} />
      <div className="flex flex-col gap-4">
        <div className="flex items-center">
          <p
            className="text-heading-md text-wm-text-01 transition-all duration-500"
            style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
          >
            {score}
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
          {/* Bar + dot — dot outside overflow-clip bar (Figma: chart h-16, bar h-8) */}
          <div className="relative h-4 flex items-center">
            <div className="h-2 w-full rounded-lg overflow-hidden">
              <div
                className="h-full"
                style={{
                  background: 'linear-gradient(to right, #fff, var(--wm-bg-primary))',
                }}
              />
            </div>
            {/* Indicator dot — 16×16 white + 4px outside border (bg-01) to cut the bar */}
            <div
              className="absolute top-1/2 size-4 rounded-full bg-white transition-[left] duration-700 ease-out"
              style={{
                left: `${pct}%`,
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 0 4px var(--wm-bg-01)',
              }}
            />
          </div>
        </div>
      </div>
    </MetricCard>
  )
}

/* ── Mini slot reel for countdown digits ─────────────────────────── */

const MINI_DH = 20      // digit cell height = text-label-sm line-height
const MINI_REPS = 3     // full 0-9 spins before settling

const MiniSlotReel = ({
  target,
  delay = 0,
}: {
  target: number
  delay?: number
}) => {
  const phaseRef = useRef<'init' | 'spin' | 'live'>('init')
  const [, forceRender] = useState(0)

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      phaseRef.current = 'spin'
      forceRender((n) => n + 1)
    })
    const tid = setTimeout(() => {
      phaseRef.current = 'live'
      forceRender((n) => n + 1)
    }, 1200 + delay)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(tid)
    }
  }, [delay])

  const totalRows = (MINI_REPS + 1) * 10
  const idx = MINI_REPS * 10 + target
  const y = -(idx * MINI_DH)
  const phase = phaseRef.current

  return (
    <div style={{ height: MINI_DH, overflow: 'hidden' }}>
      <div
        style={{
          transform: phase !== 'init' ? `translateY(${y}px)` : 'translateY(0px)',
          transition:
            phase === 'spin'
              ? `transform 1000ms cubic-bezier(0.12, 0.9, 0.28, 1) ${delay}ms`
              : phase === 'live'
                ? 'transform 300ms ease-out'
                : 'none',
          willChange: 'transform',
        }}
      >
        {Array.from({ length: totalRows }, (_, i) => (
          <div
            key={i}
            className="text-label-sm text-wm-text-01 text-center select-none"
            style={{
              height: MINI_DH,
              lineHeight: `${MINI_DH}px`,
              fontVariantNumeric: 'tabular-nums',
              fontFeatureSettings: "'lnum' 1, 'tnum' 1",
            }}
          >
            {i % 10}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Split a number into individual digits */
const toDigits = (n: number): number[] =>
  String(n).split('').map(Number)

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

  /* Calculate staggered delays: each digit 80ms apart, boxes 120ms apart */
  let globalIdx = 0
  const boxes = [
    { val: countdown.d, unit: 'd' },
    { val: countdown.h, unit: 'h' },
    { val: countdown.m, unit: 'm' },
    { val: countdown.s, unit: 's' },
  ].map((b) => {
    const digits = toDigits(b.val)
    const mapped = digits.map((d, di) => ({
      digit: d,
      delay: (globalIdx + di) * 80,
    }))
    globalIdx += digits.length
    return { ...b, digits: mapped }
  })

  return (
    <MetricCard>
      <MetricLabel text={data.label} />
      <div className="flex flex-col gap-4 items-center justify-center">
        {/* Token info — Figma: image-slot 44px, image 36px, gap-8 */}
        <div className="flex items-center gap-2 w-full justify-center">
          <div className="flex items-center justify-center size-[44px] shrink-0">
            <img
              src={data.tokenLogoUrl}
              alt={data.tokenName}
              className="size-9 rounded-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
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
                hour12: false,
                timeZone: 'UTC',
              })}{' '}
              (UTC)
            </p>
          </div>
        </div>
        {/* Countdown boxes — slot reel animation */}
        <div className="flex gap-2 w-full whitespace-nowrap">
          {boxes.map((b) => (
            <div
              key={b.unit}
              className="flex-1 flex items-baseline justify-center gap-0.5 bg-wm-overlay-3 rounded-lg px-2 py-1"
            >
              <div className="flex">
                {b.digits.map((d, i) => (
                  <MiniSlotReel key={i} target={d.digit} delay={d.delay} />
                ))}
              </div>
              <span
                className="text-body-xs text-wm-text-03"
                style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
              >
                {b.unit}
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
  <div className="flex gap-4 py-2">
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
