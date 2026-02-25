import { useState, useEffect } from 'react'

/**
 * Generic media-query hook.
 * Returns `true` when the given CSS media query matches.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    setMatches(mql.matches) // sync on mount
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}

/** Below Tailwind `md` breakpoint (< 768px) */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)')
}

/** Below Tailwind `lg` breakpoint (< 1024px) */
export function useIsTablet(): boolean {
  return useMediaQuery('(max-width: 1023px)')
}
