/**
 * HeroSection — Premarket landing hero
 * Figma: node 46180:852087 (img frame) + 46913:41806 (button)
 *
 * Extracted values:
 *   Button:  pl-[24px] pr-[12px] py-[12px]  gap-[10px]  radius-2xl(12px)
 *            text-label-lg (18/28 Medium)  bg-inv  icon size-[24px]
 *   Right panel: 656×656  rounded-[16px]  overflow-clip  flex center gap-[24px]
 *   Trade panel: w-[384px]  bg-[#0a0a0b]  border-b-[4px] border-[#1b1b1c]  pb-[24px]  gap-[16px]
 *   Play btn:   p-[10px]  rounded-[var(--radius-xl,10px)]  bg-[#f9f9fa]  centered absolute
 *   Glow:       211px circle centered  (imgEllipse inset-[-23.7%])
 *
 * Coin assets (Figma MCP — 7-day CDN, download to /public/assets/ for production):
 *   coinLeft:       inset-[32.62%_86.01%_57.11%_4.73%]
 *   coinTopRight:   top-[7.93%] left-[75%] right-[15.24%] bottom-[83.27%]
 *   coinBottomRight:top-[75%]   left-[84.91%] right-[9.87%] bottom-[17.71%]
 */

import { RightLine, PlayFill } from '@mingcute/react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'

// ─── Asset paths ──────────────────────────────────────────────────────────────

const ASSETS = {
  // All local SVGs (from Figma export)
  coinLeft:       '/assets/hero-coin-left.svg',
  coinTopRight:   '/assets/hero-coin-right-top.svg',
  coinBottomRight:'/assets/hero-coin-right-bot.svg',
  dotBg:          '/assets/hero-dot-bg.svg',
  tradePanel:     '/assets/hero-trade-panel.svg',
  // Glow ellipse — Figma CDN (replace with local if needed)
  ellipseGlow:    'https://www.figma.com/api/mcp/asset/0cda4b8b-af18-42e8-8f68-29250f561987',
} as const

// ─── Decorative Coins (separated layer — future: float keyframe animation) ────
// Each coin is an independent component so keyframes can be applied individually.

function CoinLeft() {
  return (
    <img
      src={ASSETS.coinLeft}
      alt=""
      aria-hidden="true"
      className="absolute pointer-events-none select-none coin-float-a"
      style={{ inset: '32.62% 86.01% 57.11% 4.73%', objectFit: 'contain' }}
    />
  )
}

function CoinTopRight() {
  return (
    <img
      src={ASSETS.coinTopRight}
      alt=""
      aria-hidden="true"
      className="absolute pointer-events-none select-none coin-float-b"
      style={{ top: '7.93%', left: '75%', right: '15.24%', bottom: '83.27%', objectFit: 'contain' }}
    />
  )
}

function CoinBottomRight() {
  return (
    <img
      src={ASSETS.coinBottomRight}
      alt=""
      aria-hidden="true"
      className="absolute pointer-events-none select-none coin-float-c"
      style={{ top: '75%', left: '84.91%', right: '9.87%', bottom: '17.71%', objectFit: 'contain' }}
    />
  )
}

// ─── Trade Panel Image ─────────────────────────────────────────────────────────
// Replaced HTML reconstruction with actual Figma SVG export (392×488)

function TradePanel() {
  return (
    <img
      src={ASSETS.tradePanel}
      alt="Whales Market trade panel preview"
      className="relative shrink-0 select-none"
      style={{ width: '392px', height: '488px' }}
      draggable={false}
    />
  )
}

// ─── Play Button ───────────────────────────────────────────────────────────────
// Figma: node 46180:853654 — bg-[#f9f9fa] p-[10px] rounded-[10px] centered absolute

function PlayButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Watch product demo"
      className={cn(
        'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
        'flex items-center justify-center',
        // Circle shape (rounded-full overrides Figma's rounded-xl per user request)
        'p-2.5 rounded-full',
        'bg-wm-bg-inv',
        'shadow-[0_4px_20px_rgba(0,0,0,0.4)]',
        'transition-all duration-300 ease-out',
        // Hover responds to OUTER panel's group/play (no group/play on self)
        'group-hover/play:scale-110 group-hover/play:shadow-[0_8px_40px_rgba(0,0,0,0.6)]',
        'cursor-pointer',
      )}
    >
      {/* span holds text color so PlayFill inherits currentColor correctly */}
      <span className="p-0.5 text-wm-text-inv">
        <PlayFill className="size-6" />
      </span>
    </button>
  )
}

// ─── Video Modal ───────────────────────────────────────────────────────────────

function VideoModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cn(
          'relative w-full max-w-[900px] mx-4',
          'rounded-[16px] overflow-hidden',
          'bg-[var(--wm-bg-02)] border border-[var(--wm-border-02)]',
          'shadow-[0_32px_80px_rgba(0,0,0,0.7)]',
          'animate-in fade-in zoom-in-95 duration-200',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero demo video */}
        <video
          src="/assets/videoHero.mp4"
          className="w-full aspect-video block bg-[var(--wm-bg-03)]"
          autoPlay
          muted
          loop
          controls
          playsInline
        />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className={cn(
            'absolute top-3 right-3 size-8 rounded-full flex items-center justify-center cursor-pointer',
            'bg-[var(--wm-bg-03)] text-[var(--wm-text-02)] opacity-60',
            'hover:bg-[var(--wm-bg-03)] hover:text-[var(--wm-text-01)] hover:opacity-100',
            'transition-colors duration-150',
          )}
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

// ─── Right Panel (img frame) ───────────────────────────────────────────────────
// Figma: 656×656  rounded-[16px]  overflow-clip  flex gap-[24px] items-center justify-center
// Layer order: dotBg → tradePanel → coins → glow → playBtn

function HeroRightPanel() {
  const [videoOpen, setVideoOpen] = useState(false)

  return (
    <>
      <div
        className="group/play relative flex items-center justify-center shrink-0 rounded-[16px]"
        style={{ width: 'clamp(400px, 45vw, 656px)', aspectRatio: '1 / 1' }}
      >
        {/* Layer 1: Dot background SVG — CSS @keyframes embedded inside SVG.
            285 paths split into 5 groups (s1–s5), each group fades in/out with
            2s stagger → individual shapes twinkle, no rectangular-block effect.
            Fill the full panel so shape clusters from all 4 SVG corners are visible. */}
        <img
          src={ASSETS.dotBg}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-15"
          style={{ objectFit: 'fill' }}
        />

        {/* Layer 2: Trade panel SVG (Figma export, 392×488) */}
        <TradePanel />

        {/* Layer 3: Floating 3D coins (separated for future float animation) */}
        <CoinLeft />
        <CoinTopRight />
        <CoinBottomRight />

        {/* Layer 4: Glow ellipse behind play button */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ width: '211px', height: '211px' }}
          aria-hidden="true"
        >
          <img
            src={ASSETS.ellipseGlow}
            alt=""
            className="absolute max-w-none"
            style={{ inset: '-23.7%', objectFit: 'contain' }}
          />
        </div>

        {/* Layer 5: Play button (centered over everything) */}
        <PlayButton onClick={() => setVideoOpen(true)} />
      </div>

      {videoOpen && createPortal(
        <VideoModal onClose={() => setVideoOpen(false)} />,
        document.body,
      )}
    </>
  )
}

// ─── Get Started Button — size XL ─────────────────────────────────────────────
// Figma: pl-[24px] pr-[12px] py-[12px]  gap-[10px]  rounded-[12px]  text-label-lg  icon size-[24px]

function GetStartedButton({ label }: { label: string }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate('/')}
      className={cn(
        'group/btn relative flex items-center w-fit overflow-hidden',
        // Figma-exact padding and radius
        'pl-6 pr-3 py-3 gap-2',
        'rounded-[var(--radius-2xl,12px)]',
        'text-label-lg',
        // Colors — inverted (white bg, dark text)
        'bg-[var(--wm-bg-inv)] text-[var(--wm-text-inv)]',
        // Hover overlay
        'before:absolute before:inset-0 before:content-[""] before:rounded-[inherit]',
        'before:transition-colors before:duration-150',
        'hover:before:bg-black/10 active:before:bg-black/30',
        'transition-colors duration-150 cursor-pointer outline-none',
        'btn-pop',
      )}
    >
      <span className="relative font-medium">{label}</span>

      {/* Arrow icon — slides right on hover, p-[2px] wrapper per Figma */}
      <span
        className={cn(
          'relative flex items-center justify-center p-0.5',
          'transition-transform duration-200 ease-out',
          'group-hover/btn:translate-x-[2px]', // 2px — subtle nudge per spec
        )}
      >
        <RightLine className="size-6" />
      </span>
    </button>
  )
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

const HeroSection = () => {
  const { t } = useLanguage()

  return (
    <section
      className="relative w-full overflow-hidden bg-[var(--wm-bg-01)]"
    >
      {/* ── Radial glow ── */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 80% at 80% 50%, rgba(22,194,132,0.06) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* ── Bottom fade ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--wm-bg-01))' }}
        aria-hidden="true"
      />

      {/* ── Content ── */}
      <div
        className="relative max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-0 flex flex-col lg:flex-row items-center gap-8 lg:gap-12"
        style={{ minHeight: 'clamp(400px, 60vh, 656px)' }}
      >
        {/* Left — headline + description + CTA */}
        <div className="flex-1 flex flex-col gap-8 lg:gap-16 min-w-0 lg:pr-16 text-center lg:text-left items-center lg:items-start">
          <div className="flex flex-col gap-4 md:gap-6">
            <h1 className="text-display-sm md:text-display-md lg:text-display-lg text-[var(--wm-text-01)]">
              {t('hero.title')}
            </h1>
            <p className="text-body-sm md:text-body-md lg:text-body-lg text-[var(--wm-text-02)] max-w-[672px]">
              {t('hero.description')}
            </p>
          </div>

          <GetStartedButton label={t('hero.cta')} />
        </div>

        {/* Right — decorative illustration + play — hidden on mobile */}
        <div className="hidden md:block">
          <HeroRightPanel />
        </div>
      </div>
    </section>
  )
}

export default HeroSection
