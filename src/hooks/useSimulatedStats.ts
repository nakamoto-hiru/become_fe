import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * useSimulatedStats — returns stats that change periodically for demo purposes.
 *
 * Each tick (6-9s), picks 1 random stat and nudges its numeric value.
 * The `raw` string changes (e.g. "330M+" → "332M+"), which lets the consumer
 * use `key={raw}` to re-trigger slot-machine animations.
 */

interface SimStat {
  raw: string
  labelKey:
    | 'stats.volume'
    | 'stats.users'
    | 'stats.settled'
    | 'stats.blockchain'
}

interface StatSeed {
  value: number
  suffix: string
  min: number
  max: number
  delta: [number, number] // [minDelta, maxDelta]
  labelKey: SimStat['labelKey']
}

const SEEDS: StatSeed[] = [
  { value: 330, suffix: 'M+', min: 300, max: 380, delta: [1, 4], labelKey: 'stats.volume' },
  { value: 200, suffix: 'K+', min: 180, max: 240, delta: [1, 3], labelKey: 'stats.users' },
  { value: 251, suffix: '',   min: 240, max: 280, delta: [1, 2], labelKey: 'stats.settled' },
  { value: 24,  suffix: '',   min: 20,  max: 30,  delta: [0, 1], labelKey: 'stats.blockchain' },
]

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function buildStats(values: number[]): SimStat[] {
  return SEEDS.map((seed, i) => ({
    raw: `${values[i]}${seed.suffix}`,
    labelKey: seed.labelKey,
  }))
}

export function useSimulatedStats() {
  const [values, setValues] = useState<number[]>(() => SEEDS.map((s) => s.value))
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const tick = useCallback(() => {
    setValues((prev) => {
      const next = [...prev]
      // Pick 1 random stat to change
      const idx = randInt(0, SEEDS.length - 1)
      const seed = SEEDS[idx]
      const [dMin, dMax] = seed.delta
      const delta = randInt(dMin, dMax) * (Math.random() > 0.5 ? 1 : -1)
      next[idx] = Math.max(seed.min, Math.min(seed.max, prev[idx] + delta))
      return next
    })

    // Schedule next tick with jitter
    timerRef.current = setTimeout(tick, 6000 + Math.random() * 3000)
  }, [])

  useEffect(() => {
    // Initial delay before first tick so the page has time to load
    timerRef.current = setTimeout(tick, 8000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [tick])

  return { stats: buildStats(values) }
}
