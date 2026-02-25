/**
 * StatsSection — Figma node 46202:822286
 *
 * Animation: slot-machine reel per digit.
 *   Each reel contains REPEATS×10 + final digit rows stacked vertically.
 *   On trigger: translateY animates from 0 → finalY with sharp ease-out
 *   cubic-bezier → looks like a reel spinning fast then snapping to a stop.
 *   Each digit within a number settles 130ms after the previous (left → right).
 *   Each stat column starts 90ms after the previous column.
 *
 * Responsive sizes (Figma):
 *   mobile/tablet (<1024): 28px/36px digits, 18px reel width
 *   desktop (≥1024):       48px/64px digits, 30px reel width
 */

import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSimulatedStats } from '@/hooks/useSimulatedStats'

// ─── Reel geometry ─────────────────────────────────────────────────────────────
const REPEATS = 4 // extra full 0-9 rotations before the final digit

// Responsive size presets — Figma sm: 28/36, lg: 48/64
const SIZES = {
  sm: { digitH: 36, fontSize: 28, reelW: 18 },
  lg: { digitH: 64, fontSize: 48, reelW: 30 },
} as const

type ReelSize = (typeof SIZES)[keyof typeof SIZES]

// ─── useIsLg — matchMedia hook for ≥ 1024px ────────────────────────────────
function useIsLg() {
  const [isLg, setIsLg] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : false,
  )
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = (e: MediaQueryListEvent) => setIsLg(e.matches)
    mq.addEventListener('change', handler)
    setIsLg(mq.matches)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isLg
}

// ─── SlotReel ─────────────────────────────────────────────────────────────────
// One vertical reel. Clips to digitH × reelW.
// On `started`, CSS transition snaps the strip to the target digit row.

function SlotReel({
  target,
  started,
  duration = 1700,
  delay = 0,
  size,
}: {
  target: number // final digit 0–9
  started: boolean
  duration?: number
  delay?: number
  size: ReelSize
}) {
  const { digitH, fontSize, reelW } = size
  const totalRows = (REPEATS + 1) * 10
  const finalY = -((REPEATS * 10 + target) * digitH)

  return (
    <div
      style={{
        height: digitH,
        width: reelW,
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          transform: started ? `translateY(${finalY}px)` : 'translateY(0px)',
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
              height: digitH,
              lineHeight: `${digitH}px`,
              fontSize,
              fontWeight: 500,
              textAlign: 'center',
              color: 'var(--wm-text-01)',
              letterSpacing: '-1px',
              userSelect: 'none',
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
  size,
}: {
  targetStr: string
  suffix: string
  started: boolean
  colDelay?: number
  size: ReelSize
}) {
  const digits = targetStr.split('').map(Number)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
      }}
    >
      {digits.map((d, i) => (
        <SlotReel
          key={i}
          target={d}
          started={started}
          duration={1700}
          delay={colDelay + i * 130}
          size={size}
        />
      ))}

      {suffix && (
        <span
          style={{
            fontSize: size.fontSize,
            fontWeight: 500,
            lineHeight: `${size.digitH}px`,
            color: 'var(--wm-text-01)',
            letterSpacing: '-1px',
            marginLeft: 2,
            userSelect: 'none',
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
  size,
}: {
  raw: string
  label: string
  colDelay: number
  size: ReelSize
}) {
  const m = raw.match(/^(\d+)(.*)$/)
  const targetStr = m?.[1] ?? '0'
  const suffix = m?.[2] ?? ''

  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true)
      },
      { threshold: 0.35 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [started])

  return (
    <div ref={ref} className="flex flex-[1_0_0] flex-col gap-2 items-center text-center">
      <SlotNumber
        targetStr={targetStr}
        suffix={suffix}
        started={started}
        colDelay={colDelay}
        size={size}
      />
      <p
        className="text-label-sm lg:text-label-lg text-[var(--wm-text-02)] w-full"
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
    <div
      className="hidden md:flex shrink-0 items-center justify-center"
      style={{ width: 1, height: 88 }}
    >
      <div
        className="w-px h-full"
        style={{ backgroundColor: 'var(--wm-border-02)' }}
      />
    </div>
  )
}

// ─── Section ───────────────────────────────────────────────────────────────────

const StatsSection = () => {
  const { t } = useLanguage()
  const { stats } = useSimulatedStats()
  const isLg = useIsLg()
  const size = isLg ? SIZES.lg : SIZES.sm

  return (
    <section className="border-t border-b border-wm-border-02">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-12 py-8 lg:py-16">
        {/* Mobile: 2×2 grid */}
        <div className="grid grid-cols-2 gap-6 md:hidden">
          {stats.map(({ raw, labelKey }, i) => (
            <StatItem key={raw} raw={raw} label={t(labelKey)} colDelay={i * 90} size={size} />
          ))}
        </div>
        {/* Tablet+Desktop: horizontal row with dividers */}
        <div className="hidden md:flex items-center justify-between gap-0">
          {stats.map(({ raw, labelKey }, i) => (
            <div key={labelKey} className="flex items-center flex-1">
              {i > 0 && <StatDivider />}
              <div className="flex-1">
                <StatItem key={raw} raw={raw} label={t(labelKey)} colDelay={i * 90} size={size} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsSection
