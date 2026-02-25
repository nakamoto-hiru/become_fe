import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { RightLine, LivePhotoLine, RocketLine } from '@mingcute/react'
import type { LiveMarketItem, UpcomingMarketItem } from '@/mock-data/premarket'
import { useLanguage } from '@/contexts/LanguageContext'
import type { TranslationKey } from '@/i18n/translations'
import { useSimulatedMarkets } from '@/hooks/useSimulatedMarkets'

/* ── Keyframes for value-change flash ─────────────────────────────────────── */
const FlashStyles = () => (
  <style>{`
    @keyframes mkt-flash-green {
      0%   { color: var(--wm-text-green); }
      100% { color: var(--wm-text-01); }
    }
    @keyframes mkt-flash-red {
      0%   { color: var(--wm-text-danger); }
      100% { color: var(--wm-text-01); }
    }
  `}</style>
)

/* ── AnimatedValue — flashes green/red when value changes ─────────────────── */
const AnimatedValue = ({
  value,
  format,
  className = '',
}: {
  value: number
  format: (v: number) => string
  className?: string
}) => {
  const prevRef = useRef(value)
  const elRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const prev = prevRef.current
    prevRef.current = value

    if (prev === value || !elRef.current) return

    const dir = value > prev ? 'green' : 'red'
    const el = elRef.current
    // Remove existing animation so it can replay
    el.style.animation = 'none'
    // Force reflow
    void el.offsetWidth
    el.style.animation = `mkt-flash-${dir} 800ms ease-out forwards`
  }, [value])

  return (
    <p
      ref={elRef}
      className={`text-label-md text-wm-text-01 ${className}`}
    >
      {format(value)}
    </p>
  )
}

/* ── Token image slot ─────────────────────────────────────────────────────── */
// Figma: image-slot wrapper (p-[4px]) → inner image div (rounded-full size-[36px])
//        with img using absolute inset-0 size-full
//        chain badge: absolute bottom-0 left-0 image-slot → chain div (size-[16px] rounded-[4px] border-2)
const TokenImage = ({
  logoUrl,
  chainLogoUrl,
  name,
}: {
  logoUrl: string
  chainLogoUrl: string
  name: string
}) => (
  <div className="flex items-center justify-center p-1 relative shrink-0">
    {/* image wrapper */}
    <div className="relative rounded-full shrink-0 size-[36px]">
      <img
        src={logoUrl}
        alt={name}
        className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-full size-full"
      />
    </div>
    {/* chain badge image-slot */}
    <div className="absolute bottom-0 left-0 flex items-center">
      <div className="border-2 border-wm-bg-01 relative rounded-[4px] shrink-0 size-[16px]">
        <img
          src={chainLogoUrl}
          alt="chain"
          className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[4px] size-full"
        />
      </div>
    </div>
  </div>
)

/* ── See More button ─────────────────────────────────────────────────────── */
// Figma: bg-overlay, pl-12 pr-6 py-6, rounded-6, gap-4
//        trailing icon wrapped in icon-slot (p-[2px])
const SeeMoreBtn = ({ label }: { label: string }) => (
  <button
    className="flex items-center gap-1 overflow-clip pl-3 pr-1.5 py-1.5 rounded-[6px] bg-wm-overlay-5 transition-opacity hover:bg-wm-overlay-10 shrink-0 cursor-pointer"
  >
    <span
      className="text-label-xs text-wm-text-01 whitespace-nowrap"
      style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
    >
      {label}
    </span>
    {/* icon-slot wrapper: p-0.5 */}
    <div className="flex items-center p-0.5 shrink-0">
      <RightLine size={12} className="text-wm-text-01" />
    </div>
  </button>
)

/* ── Live card ────────────────────────────────────────────────────────────── */
const LiveCard = ({
  navigate,
  t,
  markets,
}: {
  navigate: (to: string) => void
  t: (key: TranslationKey) => string
  markets: LiveMarketItem[]
}) => (
  <div className="flex-1 rounded-[16px] overflow-hidden border border-wm-border-01 flex flex-col">
    {/* Header */}
    <div className="flex items-center gap-2 px-5 py-4 border-b border-wm-border-01">
      {/* icon-slot: p-0.5 — color on wrapper so SVG inherits via currentColor */}
      <div className="flex items-center p-0.5 shrink-0 text-wm-icon-green">
        <LivePhotoLine size={24} />
      </div>
      <span
        className="flex-1 text-heading-sm text-wm-text-01"
        style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
      >
        {t('market.live')}
      </span>
      <SeeMoreBtn label={t('market.seeMore')} />
    </div>

    {/* Body */}
    <div className="px-3 pt-4 pb-3">
      <div className="flex flex-col gap-1">

        {/* Column headers */}
        <div
          className="flex items-start gap-2 px-3 text-label-xs text-wm-text-03"
          style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
        >
          <div className="flex flex-col justify-center shrink-0 w-[180px]">{t('market.colMarket')}</div>
          <div className="flex flex-[1_0_0] flex-col justify-center min-h-px min-w-px text-right">{t('market.colVolume')}</div>
          <div className="flex flex-col justify-center shrink-0 text-right w-[180px]">{t('market.colPrice')}</div>
        </div>

        {/* Token rows */}
        {markets.map((item: LiveMarketItem) => (
          <div
            key={item.id}
            onClick={() => navigate(`/premarket/${item.slug}`)}
            className="flex items-center gap-2 p-3 rounded-[12px] cursor-pointer transition-colors"
            style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--wm-bg-02)'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
            }}
          >
            {/* image-slot */}
            <TokenImage logoUrl={item.logoUrl} chainLogoUrl={item.chainLogoUrl} name={item.name} />

            {/* Name */}
            <div className="flex flex-[1_0_0] flex-col gap-1 items-start justify-center min-h-px min-w-px">
              <p className="text-label-md text-wm-text-01 leading-none">{item.name}</p>
              <p className="text-body-xs text-wm-text-03">{item.protocol}</p>
            </div>

            {/* Volume — animated */}
            <div className="flex flex-[1_0_0] flex-col gap-1 items-end justify-center min-h-px min-w-px">
              <AnimatedValue
                value={item.totalVolume}
                format={(v) => v.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              />
              <div className={`flex items-center gap-0.5 text-body-xs ${item.volumeChange < 0 ? 'text-wm-text-danger' : 'text-wm-text-green'}`}>
                <span>{item.volumeChange < 0 ? '-' : '+'}</span>
                <span>{Math.abs(item.volumeChange).toFixed(2)}%</span>
              </div>
            </div>

            {/* Price — animated */}
            <div className="flex flex-[1_0_0] flex-col gap-1 items-end justify-center min-h-px min-w-px whitespace-nowrap">
              <AnimatedValue
                value={item.price}
                format={(v) => `$${v.toFixed(4)}`}
              />
              <div className={`flex items-center gap-0.5 text-body-xs ${item.priceChange >= 0 ? 'text-wm-text-green' : 'text-wm-text-danger'}`}>
                <span>{item.priceChange >= 0 ? '+' : '-'}</span>
                <span>{Math.abs(item.priceChange).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

/* ── Backer avatars stack ─────────────────────────────────────────────────── */
// Figma: overlapping size-[24px] images with mr-[-4px], +N pill w-[36px] h-[24px]
const BackerStack = ({
  avatarUrls,
  extra,
}: {
  avatarUrls: string[]
  extra: number
}) => (
  <div className="flex items-start pr-1">
    {avatarUrls.map((url, i) => (
      <div key={i} className="relative shrink-0 size-6 -mr-1">
        <img src={url} alt="" className="absolute block max-w-none size-full" />
      </div>
    ))}
    {extra > 0 && (
      <div
        className="flex items-center justify-center h-6 w-9 px-1.5 py-1 rounded-lg border border-wm-bg-01 text-[10px] leading-[12px] font-medium text-wm-text-01 text-center shrink-0 -mr-1"
        style={{ backgroundColor: 'var(--wm-bg-02)' }}
      >
        +{extra}
      </div>
    )}
  </div>
)

/* ── Upcoming card ────────────────────────────────────────────────────────── */
const UpcomingCard = ({
  navigate,
  t,
  markets,
}: {
  navigate: (to: string) => void
  t: (key: TranslationKey) => string
  markets: UpcomingMarketItem[]
}) => (
  <div className="flex-1 rounded-[16px] overflow-hidden border border-wm-border-01 flex flex-col">
    {/* Header — gap-4 per Figma */}
    <div className="flex items-center gap-2 px-5 py-4 border-b border-wm-border-01">
      {/* icon-slot: p-0.5 — color on wrapper so SVG inherits via currentColor */}
      <div className="flex items-center p-0.5 shrink-0 text-wm-icon-indigo">
        <RocketLine size={24} />
      </div>
      <span
        className="flex-1 text-heading-sm text-wm-text-01"
        style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
      >
        {t('market.upcoming')}
      </span>
      <SeeMoreBtn label={t('market.seeMore')} />
    </div>

    {/* Body */}
    <div className="px-3 pt-4 pb-3">
      <div className="flex flex-col gap-1">

        {/* Column headers */}
        <div
          className="flex items-start gap-2 px-3 text-label-xs text-wm-text-03"
          style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
        >
          <div className="flex flex-[1_0_0] flex-col justify-center min-h-px min-w-px">{t('market.colMarket')}</div>
          <div className="flex flex-col justify-center shrink-0 w-[164px]">{t('market.colBackers')}</div>
          <div className="flex flex-col justify-center shrink-0 text-right w-[164px]">{t('market.colWatchers')}</div>
        </div>

        {/* Token rows */}
        {markets.map((item: UpcomingMarketItem) => (
          <div
            key={item.id}
            onClick={() => navigate(`/premarket/${item.slug}`)}
            className="flex items-center gap-2 p-3 rounded-[12px] cursor-pointer transition-colors"
            style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--wm-bg-02)'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
            }}
          >
            {/* Name group: image-slot + name text together in flex-[1_0_0] */}
            <div className="flex flex-[1_0_0] gap-2 items-center min-h-px min-w-px">
              <TokenImage logoUrl={item.logoUrl} chainLogoUrl={item.chainLogoUrl} name={item.name} />
              <div className="flex flex-[1_0_0] flex-col gap-1 items-start justify-center min-h-px min-w-px">
                <p className="text-label-md text-wm-text-01 leading-none">{item.name}</p>
                <p className="text-body-xs text-wm-text-03">{item.protocol}</p>
              </div>
            </div>

            {/* Backers table-cell */}
            <div className="flex flex-row items-center self-stretch">
              <div className="flex flex-col h-full items-start justify-center w-[164px] shrink-0">
                <BackerStack avatarUrls={item.backerAvatarUrls} extra={item.backersExtra} />
              </div>
            </div>

            {/* Watchers table-cell — animated */}
            <div className="flex flex-row items-center self-stretch">
              <div className="flex flex-col h-full items-end justify-center w-[164px] shrink-0">
                <AnimatedValue
                  value={item.watchers}
                  format={(v) => v.toLocaleString('en-US')}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

/* ── Section ──────────────────────────────────────────────────────────────── */
const MarketTodaySection = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { liveData, upcomingData } = useSimulatedMarkets()

  return (
    <section className="py-8 md:py-12 bg-wm-bg-01">
      <FlashStyles />
      <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-4 md:py-6">

        {/* Title block */}
        <div className="text-center mb-8 md:mb-16 max-w-[720px] mx-auto flex flex-col gap-4">
          <h2
            className="text-display-sm md:text-display-md lg:text-display-lg text-wm-text-01"
            style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
          >
            {t('market.title')}
          </h2>
          <p className="text-body-sm md:text-body-lg text-wm-text-02">
            {t('market.desc')}
          </p>
        </div>

        {/* Cards — stack vertically on mobile/tablet, side by side on desktop */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <LiveCard navigate={navigate} t={t} markets={liveData} />
          <UpcomingCard navigate={navigate} t={t} markets={upcomingData} />
        </div>
      </div>
    </section>
  )
}

export default MarketTodaySection
