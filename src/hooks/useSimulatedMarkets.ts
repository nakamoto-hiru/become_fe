import { useCallback, useEffect, useRef, useState } from 'react'
import {
  liveMarkets as initialLive,
  upcomingMarkets as initialUpcoming,
} from '@/mock-data/premarket'
import type { LiveMarketItem, UpcomingMarketItem } from '@/mock-data/premarket'

/**
 * useSimulatedMarkets — returns live & upcoming market data that
 * changes periodically to simulate a real-time trading feed.
 *
 * Live markets:  price random-walks ±0.5-2%, volume only increases.  (every 4-6s)
 * Upcoming:      watchers slowly increase, backersExtra occasionally +1. (every 10-15s)
 */

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

// ── Deep-clone helpers (simple objects, no circular refs) ──────────────────

function cloneLive(items: LiveMarketItem[]): LiveMarketItem[] {
  return items.map((item) => ({ ...item }))
}

function cloneUpcoming(items: UpcomingMarketItem[]): UpcomingMarketItem[] {
  return items.map((item) => ({ ...item, backerAvatarUrls: [...item.backerAvatarUrls] }))
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useSimulatedMarkets() {
  // Keep initial values as refs so we can compute % change from original
  const initialLiveRef = useRef(cloneLive(initialLive))
  const [liveData, setLiveData] = useState<LiveMarketItem[]>(() => cloneLive(initialLive))
  const [upcomingData, setUpcomingData] = useState<UpcomingMarketItem[]>(() => cloneUpcoming(initialUpcoming))

  const liveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const upcomingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Live market tick — updates ONE random row per tick ────────────────

  const tickLive = useCallback(() => {
    setLiveData((prev) => {
      // Pick a single random row to update
      const idx = Math.floor(Math.random() * prev.length)
      return prev.map((item, i) => {
        if (i !== idx) return item

        const initial = initialLiveRef.current[i]

        // Price: random walk ±0.5-2%, capped at ±20% from initial
        const pctDrift = rand(0.005, 0.02) * (Math.random() > 0.5 ? 1 : -1)
        const newPrice = clamp(
          item.price * (1 + pctDrift),
          initial.price * 0.8,
          initial.price * 1.2,
        )
        const newPriceChange = ((newPrice - initial.price) / initial.price) * 100

        // Volume: always increases
        const volBump = rand(20, 350)
        const newVolume = item.totalVolume + volBump
        const newVolumeChange = ((newVolume - initial.totalVolume) / initial.totalVolume) * 100

        return {
          ...item,
          price: newPrice,
          priceChange: newPriceChange,
          totalVolume: newVolume,
          volumeChange: newVolumeChange,
        }
      })
    })

    // Shorter interval since only 1 row updates per tick
    liveTimerRef.current = setTimeout(tickLive, 2000 + Math.random() * 2000)
  }, [])

  // ── Upcoming market tick — updates ONE random row per tick ────────────

  const tickUpcoming = useCallback(() => {
    setUpcomingData((prev) => {
      const idx = Math.floor(Math.random() * prev.length)
      return prev.map((item, i) => {
        if (i !== idx) return item

        const watcherBump = Math.floor(rand(1, 15))
        const backerBump = Math.random() < 0.2 ? 1 : 0

        return {
          ...item,
          watchers: item.watchers + watcherBump,
          backersExtra: item.backersExtra + backerBump,
        }
      })
    })

    upcomingTimerRef.current = setTimeout(tickUpcoming, 6000 + Math.random() * 4000)
  }, [])

  // ── Mount / cleanup ───────────────────────────────────────────────────

  useEffect(() => {
    liveTimerRef.current = setTimeout(tickLive, 4000 + Math.random() * 2000)
    upcomingTimerRef.current = setTimeout(tickUpcoming, 10000 + Math.random() * 5000)

    return () => {
      if (liveTimerRef.current) clearTimeout(liveTimerRef.current)
      if (upcomingTimerRef.current) clearTimeout(upcomingTimerRef.current)
    }
  }, [tickLive, tickUpcoming])

  return { liveData, upcomingData }
}
