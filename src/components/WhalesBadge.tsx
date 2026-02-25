/**
 * WhalesBadge — Figma node 35275:4731
 *
 * Universal badge component with 30+ variants.
 * Structure: rounded-full pill, px-2 py-1, text-label-2xs uppercase.
 * Color combos driven by a config map → no raw hex anywhere.
 */

export type BadgeVariant =
  | 'buy' | 'sell' | 'fee' | 'ongoing' | 'full-fill' | 'position'
  | 'discount' | 'discount-neutral' | 'upcomg-settle' | 'settling'
  | 'ended' | 'by-me' | 'open' | 'exiting' | 'exited' | 'settled'
  | 'canceled' | 'partial-fill' | 'amount-active' | 'amount-neutral'
  | 'amount-primary' | 'closed' | 'waiting' | 'overdue' | 'TBA'
  | 'not-started' | 'ineligible' | 'eligible' | 'soon' | 'new'
  | 'filled' | 'created' | 'lead' | 'member'

interface BadgeStyle {
  bg: string
  text: string
}

/* ── Color map — Figma-matched (Tailwind class ↔ --color-wm-* tokens)
 *
 * ⚠ WARNING & INFO previously used `-muted-10` suffix which doesn't exist
 *   as a --color-* token. The correct Tailwind class uses just `-10`.
 *   amount-neutral text: Figma = text-neutral-secondary (#b4b4ba) → text-02
 * ──────────────────────────────────────────────────────────────────── */

const SUCCESS: BadgeStyle   = { bg: 'bg-wm-bg-success-10', text: 'text-wm-text-green' }
const DANGER: BadgeStyle    = { bg: 'bg-wm-bg-danger-10',  text: 'text-wm-text-danger' }
const WARNING: BadgeStyle   = { bg: 'bg-wm-bg-warning-10', text: 'text-wm-text-warning' }
const INFO: BadgeStyle      = { bg: 'bg-wm-bg-info-10',    text: 'text-wm-text-info' }
const NEUTRAL: BadgeStyle   = { bg: 'bg-wm-bg-02',       text: 'text-wm-text-03' }
const NEUTRAL_SEC: BadgeStyle = { bg: 'bg-wm-bg-02',     text: 'text-wm-text-02' }
const SECONDARY: BadgeStyle = { bg: 'bg-wm-bg-secondary-10', text: 'text-wm-text-03' }
const YELLOW_SOLID: BadgeStyle = { bg: 'bg-wm-bg-yellow',  text: 'text-wm-text-inv' }
const YELLOW_MUTED: BadgeStyle = { bg: 'bg-wm-bg-yellow-muted', text: 'text-wm-text-yellow' }
const LIME: BadgeStyle      = { bg: 'bg-wm-bg-lime-muted', text: 'text-wm-text-lime' }
const PINK: BadgeStyle      = { bg: 'bg-wm-bg-pink-muted', text: 'text-wm-text-pink' }
const PRIMARY_SOLID: BadgeStyle = { bg: 'bg-wm-bg-primary', text: 'text-wm-text-01' }

/** Default label per variant (can be overridden via `label` prop) */
const VARIANT_CONFIG: Record<BadgeVariant, { style: BadgeStyle; defaultLabel: string }> = {
  // Success / Green
  buy:             { style: SUCCESS, defaultLabel: 'Buy' },
  fee:             { style: SUCCESS, defaultLabel: '-0% Fee' },
  lead:            { style: SUCCESS, defaultLabel: 'Lead' },
  discount:        { style: SUCCESS, defaultLabel: '-10%' },
  'upcomg-settle': { style: SUCCESS, defaultLabel: 'Need Settle' },
  settled:         { style: SUCCESS, defaultLabel: 'Settled' },
  'amount-active': { style: SUCCESS, defaultLabel: '24' },

  // Danger / Red
  sell:            { style: DANGER, defaultLabel: 'Sell' },

  // Warning / Orange
  settling:        { style: WARNING, defaultLabel: 'Settling' },
  exiting:         { style: WARNING, defaultLabel: 'Exiting' },
  overdue:         { style: WARNING, defaultLabel: 'Overdue' },

  // Info / Blue
  ongoing:         { style: INFO, defaultLabel: 'Ongoing' },
  open:            { style: INFO, defaultLabel: 'Open' },
  'not-started':   { style: INFO, defaultLabel: 'Not Started' },
  new:             { style: INFO, defaultLabel: 'New' },
  filled:          { style: INFO, defaultLabel: 'Filled' },
  waiting:         { style: INFO, defaultLabel: 'Waiting Settle' },
  member:          { style: INFO, defaultLabel: 'Member' },

  // Neutral / Gray
  canceled:        { style: NEUTRAL, defaultLabel: 'Canceled' },
  closed:          { style: NEUTRAL, defaultLabel: 'Closed' },
  soon:            { style: NEUTRAL, defaultLabel: 'Soon' },
  TBA:             { style: NEUTRAL, defaultLabel: 'TBA' },
  'full-fill':     { style: NEUTRAL, defaultLabel: 'Full' },
  'partial-fill':  { style: NEUTRAL, defaultLabel: 'Partial' },
  'discount-neutral': { style: NEUTRAL, defaultLabel: '-10%' },
  'amount-neutral':   { style: NEUTRAL_SEC, defaultLabel: '24' },

  // Secondary / Subtle gray
  ended:           { style: SECONDARY, defaultLabel: 'Ended' },

  // Yellow
  position:        { style: YELLOW_SOLID, defaultLabel: 'RS' },
  exited:          { style: YELLOW_MUTED, defaultLabel: 'Exited' },

  // Lime
  eligible:        { style: LIME, defaultLabel: 'Eligible' },
  created:         { style: LIME, defaultLabel: 'Created' },

  // Pink
  ineligible:      { style: PINK, defaultLabel: 'Ineligible' },

  // Primary solid
  'amount-primary': { style: PRIMARY_SOLID, defaultLabel: '24' },

  // Special — icon-based (rendered as pill for now)
  'by-me':         { style: NEUTRAL, defaultLabel: '👤' },
}

/* ── Component ───────────────────────────────────────────────────── */

interface WhalesBadgeProps {
  badge: BadgeVariant
  label?: string
  className?: string
}

const WhalesBadge = ({ badge, label, className }: WhalesBadgeProps) => {
  const config = VARIANT_CONFIG[badge]
  const { bg, text } = config.style
  const displayLabel = label ?? config.defaultLabel

  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-label-2xs uppercase ${bg} ${text} ${className ?? ''}`}
      style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
    >
      {displayLabel}
    </span>
  )
}

export default WhalesBadge
