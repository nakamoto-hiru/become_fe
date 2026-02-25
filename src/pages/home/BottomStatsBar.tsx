/**
 * BottomStatsBar — Home page footer bar
 *
 * Figma: node 44644:766859 "bottom-stats"
 *
 * Layout: flex, gap-16, items-center, px-16, py-0
 * Left  (flex-1): LIVE DATA indicator + Total Vol + Vol 24h
 * Right (shrink): Links (Docs, Dune, Link3 — underlined + arrow) + Social (X, Discord)
 *
 * Typography: text-label-xs (12/16 Medium) for "LIVE DATA"
 *             text-body-xs  (12/16 Regular) for everything else
 * Colors:     labels → text-wm-text-02 (#b4b4ba)
 *             values → text-wm-text-01 (#f9f9fa)
 *             "LIVE DATA" → text-wm-text-green
 */

import { bottomStats } from '@/mock-data/home'

const TNUM = { fontFeatureSettings: "'lnum' 1, 'tnum' 1" } as const

const fmt = (n: number): string =>
  n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

/* ── Icons ─────────────────────────────────────────────────────────────── */

/**
 * live_photo_fill — concentric-circles broadcast icon (24px)
 * Radar-pulse animation: two waves emanate from center, staggered
 */
function LiveIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0"
      aria-hidden="true"
    >
      {/* Static reference rings (very faint) */}
      <circle cx="12" cy="12" r="5.5" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.15" />
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.08" />

      {/* Animated pulse wave 1 */}
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0">
        <animate attributeName="r" from="3" to="11" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0.3;0" keyTimes="0;0.5;1" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="stroke-width" from="1.5" to="0.5" dur="2.4s" repeatCount="indefinite" />
      </circle>

      {/* Animated pulse wave 2 (staggered 1.2s) */}
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0">
        <animate attributeName="r" from="3" to="11" dur="2.4s" begin="1.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0.3;0" keyTimes="0;0.5;1" dur="2.4s" begin="1.2s" repeatCount="indefinite" />
        <animate attributeName="stroke-width" from="1.5" to="0.5" dur="2.4s" begin="1.2s" repeatCount="indefinite" />
      </circle>

      {/* Solid center dot (always on top) */}
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  )
}

/** arrow_right_up_line — external-link arrow (24px viewBox, ~14px path) */
function ArrowUpRightIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0"
      aria-hidden="true"
    >
      <path
        d="M9 5.5H18.5V15M18.15 5.85L5.5 18.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** X (Twitter) logo */
function XIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="shrink-0"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

/** Discord logo */
function DiscordIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="shrink-0"
      aria-hidden="true"
    >
      <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.175 13.175 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
    </svg>
  )
}

/* ── Data ───────────────────────────────────────────────────────────────── */

const LINKS = [
  { label: 'Docs', href: 'https://docs.whales.market' },
  { label: 'Dune', href: 'https://dune.com/whalesmarket' },
  { label: 'Link3', href: 'https://link3.to/whalesmarket' },
]

/* ── Component ─────────────────────────────────────────────────────────── */

const BottomStatsBar = () => (
  <div className="flex items-center gap-4 h-[44px]">
    {/* ── Left: live data stats (flex-1) ─────────────────────────────── */}
    <div className="flex flex-1 items-center gap-4">
      {/* Live indicator: icon + text */}
      <div className="flex items-center gap-1">
        <span className="flex items-center p-0.5 text-wm-text-green">
          <LiveIcon />
        </span>
        <span className="text-label-xs text-wm-text-green" style={TNUM}>
          LIVE DATA
        </span>
      </div>

      {/* Total Vol */}
      <div className="flex items-center gap-1" style={TNUM}>
        <span className="text-body-xs text-wm-text-02">Total Vol</span>
        <span className="text-body-xs text-wm-text-01">
          ${fmt(bottomStats.totalVol)}
        </span>
      </div>

      {/* Vol 24h */}
      <div className="flex items-center gap-1" style={TNUM}>
        <span className="text-body-xs text-wm-text-02">Vol 24h</span>
        <span className="text-body-xs text-wm-text-01">
          ${fmt(bottomStats.vol24h)}
        </span>
      </div>
    </div>

    {/* ── Right: links + social ──────────────────────────────────────── */}
    <div className="flex items-center gap-4 shrink-0">
      {/* Links: border-bottom + arrow icon */}
      <div className="flex items-center gap-4">
        {LINKS.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-0.5 border-b border-wm-border-02 text-body-xs text-wm-text-02 hover:text-wm-text-01 transition-colors"
            style={TNUM}
          >
            <span className="leading-4">{l.label}</span>
            <span className="flex items-center p-0.5">
              <ArrowUpRightIcon />
            </span>
          </a>
        ))}
      </div>

      {/* Social buttons */}
      <div className="flex items-center gap-2">
        <a
          href="https://twitter.com/WhalesMarket"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center bg-wm-bg-02 p-1.5 rounded-full text-wm-text-01 hover:bg-wm-overlay-10 transition-colors"
          aria-label="X (Twitter)"
        >
          <span className="flex items-center p-0.5">
            <XIcon />
          </span>
        </a>
        <a
          href="https://discord.gg/whalesmarket"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center bg-wm-bg-02 p-1.5 rounded-full text-wm-text-01 hover:bg-wm-overlay-10 transition-colors"
          aria-label="Discord"
        >
          <span className="flex items-center p-0.5">
            <DiscordIcon />
          </span>
        </a>
      </div>
    </div>
  </div>
)

export default BottomStatsBar
