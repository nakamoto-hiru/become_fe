/**
 * UnderDevelopmentPage — Placeholder for pages not yet built
 * Figma: node 49690:174765 (layout reference)
 *
 * Specs:
 *   Page:       bg-bg-01, full height, flex items-center justify-center
 *   Inner card: max-w-[576px], gap-6, pb-10 pt-8 px-6
 *   Mascot:     size-[192px] + mascot-float animation
 *   Title:      28px / medium / lh-[36px] / text-01 / text-center
 *   Body:       16px / regular / lh-6 / text-02 / text-center
 *   CTA:        Button md / secondary / filled (default)
 */

import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'

// ─── UnderDevelopmentPage ─────────────────────────────────────────────────────

export default function UnderDevelopmentPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-10">

      {/* Inner card */}
      <div className="flex flex-col items-center gap-6 w-full max-w-[576px] pt-8 pb-10 px-6">

        {/* Mascot — SVG asset with float animation */}
        <img
          src="/assets/mascot.svg"
          alt="Whale mascot"
          draggable="false"
          className="mascot-float size-48 shrink-0 select-none"
        />

        {/* Text block */}
        <div className="flex flex-col items-center gap-3 text-center">

          {/* Title */}
          <h1
            className="text-[28px] font-medium leading-9 text-[var(--wm-text-01)]"
            style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
          >
            Under Development
          </h1>

          {/* Body */}
          <p className="text-sm leading-6 text-[var(--wm-text-03)] max-w-[400px]">
            This page is currently being built. Check back soon — something great is on its way.
          </p>

        </div>

        {/* CTA — secondary / filled / md (default) */}
        <Button
          variant="secondary"
          size="md"
          onClick={() => navigate('/')}
        >
          See what's working
        </Button>

      </div>
    </div>
  )
}
