/**
 * Skeleton — Whales Market Design System
 *
 * Figma: node 40123:170195 "8. Skeleton Loading"
 *
 * Loading-item: bg gradient #1b1b1c → #252527, rounded-lg (8px), shimmer animation
 * Circle variant: rounded-full (for image/avatar placeholders)
 *
 * Uses CSS class `skeleton-loading` defined in index.css
 */

import { cn } from '@/lib/utils'

interface SkeletonProps {
  /** Width in pixels or Tailwind class */
  w?: number | string
  /** Height in pixels or Tailwind class */
  h?: number | string
  /** Circle mode — uses rounded-full instead of rounded-lg */
  circle?: boolean
  className?: string
}

export function Skeleton({ w, h, circle, className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'skeleton-loading shrink-0 opacity-40',
        circle ? 'rounded-full' : 'rounded-lg',
        className,
      )}
      style={{
        ...(typeof w === 'number' ? { width: w } : {}),
        ...(typeof h === 'number' ? { height: h } : {}),
      }}
    />
  )
}

export default Skeleton
