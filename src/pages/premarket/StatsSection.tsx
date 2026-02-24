/**
 * StatsSection — Figma node 46202:822286
 *
 * Animation: slot-machine reel per digit.
 *   Each reel contains REPEATS×10 + final digit rows stacked vertically.
 *   On trigger: translateY animates from 0 → finalY with sharp ease-out
 *   cubic-bezier → looks like a reel spinning fast then snapping to a stop.
 *   Each digit within a number settles 130ms after the previous (left → right).
 *   Each stat column starts 90ms after the previous column.
 */

import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSimulatedStats } from '@/hooks/useSimulatedStats'

// ─── Reel geometry ─────────────────────────────────────────────────────────────
const DIGIT_H = 64    // visible window height (px) — one digit visible at a time
const REEL_W  = 30    // reel width (px) — snug fit for 48px tabular digits (~28px wide)
const REPEATS = 4     // extra full 0-9 rotations before the final digit

// ─── SlotReel ─────────────────────────────────────────────────────────────────
// One vertical reel. Clips to DIGIT_H × REEL_W.
// On `started`, CSS transition snaps the strip to the target digit row.

function SlotReel({
  target,
  started,
  duration = 1700,
  delay = 0,
}: {
  target:   number    // final digit 0–9
  started:  boolean
  duration?: number
  delay?:   number
}) {
  // Strip layout: rows 0,1,...,9 repeated (REPEATS+1) times.
  // We aim for the LAST copy's occurrence of `target`.
  //   finalY = -(REPEATS × 10 + target) × DIGIT_H
  const totalRows = (REPEATS + 1) * 10
  const finalY    = -((REPEATS * 10 + target) * DIGIT_H)

  return (
    <div
      style={{
        height: DIGIT_H,
        width:  REEL_W,
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          transform:  started ? `translateY(${finalY}px)` : 'translateY(0px)',
          // Fast spin → smooth decelerate → slight overshoot snap
          transition: started
            ? `transform ${duration}ms cubic-bezier(0.12, 0.9, 0.28, 1) ${delay}ms`
            : 'none',
          willChange: 'transform',
        }}
      >
        {Array.from({ length: totalRows }, (_, i) => (
          <div
            key={i}
            style={{
              height:         DIGIT_H,
              lineHeight:     `${DIGIT_H}px`,
              fontSize:       48,
              fontWeight:     500,
              textAlign:      'center',
              color:          'var(--wm-text-01)',
              letterSpacing:  '-1px',
              userSelect:     'none',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {i % 10}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── SlotNumber ────────────────────────────────────────────────────────────────
// Row of SlotReels + static suffix ("M+", "K+", "").

function SlotNumber({
  targetStr,
  suffix,
  started,
  colDelay = 0,
}: {
  targetStr: string
  suffix:    string
  started:   boolean
  colDelay?: number
}) {
  const digits = targetStr.split('').map(Number)

  return (
    <div
      style={{
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        gap:             0,
      }}
    >
      {digits.map((d, i) => (
        <SlotReel
          key={i}
          target={d}
          started={started}
          duration={1700}
          // Digits settle left → right, 130ms apart
          delay={colDelay + i * 130}
        />
      ))}

      {suffix && (
        <span
          style={{
            fontSize:      48,
            fontWeight:    500,
            lineHeight:    `${DIGIT_H}px`,
            color:         'var(--wm-text-01)',
            letterSpacing: '-1px',
            marginLeft:    2,
            userSelect:    'none',
          }}
        >
          {suffix}
        </span>
      )}
    </div>
  )
}

// ─── StatItem ──────────────────────────────────────────────────────────────────

function StatItem({
  raw,
  label,
  colDelay,
}: {
  raw:      string
  label:    string
  colDelay: number
}) {
  const m         = raw.match(/^(\d+)(.*)$/)
  const targetStr = m?.[1] ?? '0'
  const suffix    = m?.[2] ?? ''

  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true) },
      { threshold: 0.35 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [started])

  return (
    <div ref={ref} className="flex flex-[1_0_0] flex-col gap-5 items-center text-center">
      <SlotNumber
        targetStr={targetStr}
        suffix={suffix}
        started={started}
        colDelay={colDelay}
      />
      <p
        className="text-label-lg text-[var(--wm-text-02)] w-full"
        style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
      >
        {label}
      </p>
    </div>
  )
}

// ─── Gradient Divider ──────────────────────────────────────────────────────────

function StatDivider() {
  return (
    <div className="shrink-0 flex items-center justify-center" style={{ width: 1, height: 88 }}>
      <div
        className="w-px h-full"
        style={{
          background:
            'linear-gradient(to bottom, var(--wm-border-02) 0%, var(--wm-border-02) 30%, var(--wm-border-02) 70%, var(--wm-border-02) 100%)',
        }}
      />
    </div>
  )
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const STAT_KEYS = [
  { raw: '330M+', labelKey: 'stats.volume'     as const },
  { raw: '200K+', labelKey: 'stats.users'      as const },
  { raw: '251',   labelKey: 'stats.settled'     as const },
  { raw: '24',    labelKey: 'stats.blockchain'  as const },
]

// ─── Section ───────────────────────────────────────────────────────────────────

const StatsSection = () => {
  const { t } = useLanguage()
  const { stats } = useSimulatedStats()

  return (
    <section className="border-t border-b border-wm-border-02">
      <div className="max-w-[1440px] mx-auto px-12 py-16">
        <div className="flex items-start justify-between">
          {stats.map(({ raw, labelKey }, i) => (
            <div key={labelKey} className="flex items-center flex-1">
              {i > 0 && <StatDivider />}
              {/* key={raw} forces remount when value changes → slot animation replays */}
              <StatItem key={raw} raw={raw} label={t(labelKey)} colDelay={i * 90} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsSection
