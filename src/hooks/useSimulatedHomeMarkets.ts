import { useCallback, useEffect, useRef, useState } from 'react'
import {
  marketListItems as initialLiveData,
  upcomingMarketItems as initialUpcomingData,
  type MarketListItem,
  type UpcomingMarketItem,
} from '@/mock-data/home'

/**
 * useSimulatedHomeMarkets — returns live, upcoming & ended market data
 * that changes periodically to simulate a real-time trading feed.
 *
 * Each tick only updates 1-2 random rows (not all), for realism.
 *
 * Live:     price random-walk ±0.5-2%, volumes increase.          (every 3-5s)
 * Upcoming: watchers +1-15, moniScore nudges ±50-200.             (every 6-10s)
 * Ended:    last price small drift ±0.3-1%, totalVol slowly grows. (every 8-12s)
 */

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

/** Pick 1-2 random unique indices from [0, length) */
function pickIndices(length: number): Set<number> {
  const count = Math.random() < 0.6 ? 1 : 2 // 60% chance = 1 row, 40% = 2 rows
  const indices = new Set<number>()
  while (indices.size < Math.min(count, length)) {
    indices.add(Math.floor(Math.random() * length))
  }
  return indices
}

// ── Deep-clone helpers ──────────────────────────────────────────────

function cloneLive(items: MarketListItem[]): MarketListItem[] {
  return items.map((it) => ({ ...it }))
}

function cloneUpcoming(items: UpcomingMarketItem[]): UpcomingMarketItem[] {
  return items.map((it) => ({
    ...it,
    investorAvatars: [...it.investorAvatars],
    narratives: [...it.narratives],
  }))
}

// ── Hook ────────────────────────────────────────────────────────────

export function useSimulatedHomeMarkets() {
  // Keep initial values as refs so we can compute % change from original
  const initialLiveRef = useRef(cloneLive(initialLiveData))
  const [liveData, setLiveData] = useState<MarketListItem[]>(() => cloneLive(initialLiveData))
  const [upcomingData, setUpcomingData] = useState<UpcomingMarketItem[]>(() => cloneUpcoming(initialUpcomingData))

  const liveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const upcomingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Live market tick — update 1-2 random rows ─────────────────────

  const tickLive = useCallback(() => {
    setLiveData((prev) => {
      const touched = pickIndices(prev.length)
      return prev.map((item, i) => {
        if (!touched.has(i)) return item
        const initial = initialLiveRef.current[i]

        // Price: random walk ±0.5-2%, capped at ±20% from initial
        const pctDrift = rand(0.005, 0.02) * (Math.random() > 0.5 ? 1 : -1)
        const newPrice = clamp(
          item.lastPrice * (1 + pctDrift),
          initial.lastPrice * 0.8,
          initial.lastPrice * 1.2,
        )
        const newPriceChange = ((newPrice - initial.lastPrice) / initial.lastPrice) * 100

        // 24h Volume: increases by 20-350
        const liq24Bump = rand(20, 350)
        const newLiq24h = item.liqVol24h + liq24Bump
        const newLiqChange = ((newLiq24h - initial.liqVol24h) / (initial.liqVol24h || 1)) * 100

        // Total Volume: increases by 50-500
        const totalBump = rand(50, 500)
        const newTotalVol = item.totalVol + totalBump
        const newTotalChange = ((newTotalVol - initial.totalVol) / (initial.totalVol || 1)) * 100

        // Implied FDV: derived from price drift
        const fdvRatio = newPrice / initial.lastPrice
        const newFdv = initial.impliedFdv * fdvRatio

        return {
          ...item,
          lastPrice: newPrice,
          priceChange: newPriceChange,
          liqVol24h: newLiq24h,
          liqVolChange: newLiqChange,
          totalVol: newTotalVol,
          totalVolChange: newTotalChange,
          impliedFdv: newFdv,
        }
      })
    })

    liveTimerRef.current = setTimeout(tickLive, 3000 + Math.random() * 2000)
  }, [])

  // ── Upcoming market tick — update 1-2 random rows ─────────────────

  const tickUpcoming = useCallback(() => {
    setUpcomingData((prev) => {
      const touched = pickIndices(prev.length)
      return prev.map((item, i) => {
        if (!touched.has(i)) return item

        // Watchers: +1 to +15
        const watcherBump = Math.floor(rand(1, 15))

        // Moni score: ±50-200, capped [0, 40000]
        const moniDrift = Math.floor(rand(50, 200)) * (Math.random() > 0.4 ? 1 : -1)
        const newMoni = clamp(item.moniScore + moniDrift, 0, 40000)

        // Investor extra: occasionally +1 (15% chance)
        const investorBump = Math.random() < 0.15 ? 1 : 0

        return {
          ...item,
          watchers: item.watchers + watcherBump,
          moniScore: newMoni,
          investorExtra: item.investorExtra + investorBump,
        }
      })
    })

    upcomingTimerRef.current = setTimeout(tickUpcoming, 6000 + Math.random() * 4000)
  }, [])

  // ── Mount / cleanup ───────────────────────────────────────────────

  useEffect(() => {
    liveTimerRef.current = setTimeout(tickLive, 3000 + Math.random() * 2000)
    upcomingTimerRef.current = setTimeout(tickUpcoming, 6000 + Math.random() * 4000)

    return () => {
      if (liveTimerRef.current) clearTimeout(liveTimerRef.current)
      if (upcomingTimerRef.current) clearTimeout(upcomingTimerRef.current)
    }
  }, [tickLive, tickUpcoming])

  return { liveData, upcomingData }
}
