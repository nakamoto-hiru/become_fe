import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { RightLine, LivePhotoLine, RocketLine } from '@mingcute/react'
import { cn } from '@/lib/utils'
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
    @keyframes tab-slide-left {
      from { opacity: 0; transform: translateX(-16px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes tab-slide-right {
      from { opacity: 0; transform: translateX(16px); }
      to   { opacity: 1; transform: translateX(0); }
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
const SeeMoreBtn = ({ label, onClick }: { label: string; onClick?: () => void }) => (
  <button
    onClick={onClick}
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
    <div className="flex items-center gap-2 px-3 md:px-5 py-3 md:py-4 border-b border-wm-border-01">
      {/* icon-slot: p-0.5 — color on wrapper so SVG inherits via currentColor */}
      <div className="flex items-center p-0.5 shrink-0 text-wm-icon-green">
        <LivePhotoLine size={24} />
      </div>
      <span
        className="flex-1 text-label-md md:text-heading-sm text-wm-text-01"
        style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
      >
        {t('market.live')}
      </span>
      <SeeMoreBtn label={t('market.seeMore')} onClick={() => navigate('/?tab=live')} />
    </div>

    {/* Body */}
    <div className="px-3 pt-4 pb-3">
      <div className="flex flex-col gap-1">

        {/* Column headers */}
        <div
          className="flex items-start gap-2 px-2 md:px-3 text-label-xs text-wm-text-03"
          style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
        >
          <div className="flex flex-[1_0_0] md:flex-none md:w-[180px] flex-col justify-center min-h-px min-w-px">{t('market.colMarket')}</div>
          <div className="flex flex-[1_0_0] flex-col justify-center min-h-px min-w-px text-right">{t('market.colVolume')}</div>
          <div className="flex flex-[1_0_0] md:flex-none md:w-[180px] flex-col justify-center min-h-px min-w-px text-right">{t('market.colPrice')}</div>
        </div>

        {/* Token rows */}
        {markets.map((item: LiveMarketItem) => (
          <div
            key={item.id}
            onClick={() => navigate(`/premarket/${item.slug}`)}
            className="flex items-center gap-2 p-2 md:p-3 rounded-[12px] cursor-pointer transition-colors"
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
                <p className="text-label-sm md:text-label-md text-wm-text-01 leading-none">{item.name}</p>
                <p className="text-body-xs text-wm-text-03">{item.protocol}</p>
              </div>
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
    <div className="flex items-center gap-2 px-3 md:px-5 py-3 md:py-4 border-b border-wm-border-01">
      {/* icon-slot: p-0.5 — color on wrapper so SVG inherits via currentColor */}
      <div className="flex items-center p-0.5 shrink-0 text-wm-icon-indigo">
        <RocketLine size={24} />
      </div>
      <span
        className="flex-1 text-label-md md:text-heading-sm text-wm-text-01"
        style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
      >
        {t('market.upcoming')}
      </span>
      <SeeMoreBtn label={t('market.seeMore')} onClick={() => navigate('/?tab=upcoming')} />
    </div>

    {/* Body */}
    <div className="px-3 pt-4 pb-3">
      <div className="flex flex-col gap-1">

        {/* Column headers */}
        <div
          className="flex items-start gap-2 px-2 md:px-3 text-label-xs text-wm-text-03"
          style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
        >
          <div className="flex flex-[1_0_0] flex-col justify-center min-h-px min-w-px">{t('market.colMarket')}</div>
          <div className="hidden md:flex flex-none md:w-[164px] flex-col justify-center min-h-px min-w-px">{t('market.colBackers')}</div>
          <div className="flex flex-none w-[80px] md:w-[164px] flex-col justify-center min-h-px min-w-px text-right">{t('market.colWatchers')}</div>
        </div>

        {/* Token rows */}
        {markets.map((item: UpcomingMarketItem) => (
          <div
            key={item.id}
            onClick={() => navigate(`/premarket/${item.slug}`)}
            className="flex items-center gap-2 p-2 md:p-3 rounded-[12px] cursor-pointer transition-colors"
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
                <p className="text-label-sm md:text-label-md text-wm-text-01 leading-none">{item.name}</p>
                <p className="text-body-xs text-wm-text-03">{item.protocol}</p>
              </div>
            </div>

            {/* Backers table-cell — hidden on mobile */}
            <div className="hidden md:flex flex-row items-center self-stretch">
              <div className="flex flex-col h-full items-start justify-center flex-none md:w-[164px] min-h-px min-w-px shrink-0">
                <BackerStack avatarUrls={item.backerAvatarUrls} extra={item.backersExtra} />
              </div>
            </div>

            {/* Watchers table-cell — animated */}
            <div className="flex flex-row items-center self-stretch">
              <div className="flex flex-col h-full items-end justify-center flex-none w-[80px] md:w-[164px] min-h-px min-w-px shrink-0">
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

/* ── Mobile Tab Bar — Live/Upcoming toggle (Figma: 46357:710862) ────────── */
const MobileTabBar = ({
  activeTab,
  onTabChange,
  t,
}: {
  activeTab: 'live' | 'upcoming'
  onTabChange: (tab: 'live' | 'upcoming') => void
  t: (key: TranslationKey) => string
}) => (
  <div
    className="flex p-1 rounded-[16px] border overflow-hidden lg:hidden w-full md:w-fit md:self-center"
    style={{ backgroundColor: 'var(--wm-bg-01)', borderColor: 'var(--wm-border-01)' }}
  >
    {(['live', 'upcoming'] as const).map((tab) => (
      <button
        key={tab}
        onClick={() => onTabChange(tab)}
        className={cn(
          'flex-[1_0_0] md:flex-none md:shrink-0 px-5 py-3 text-label-sm md:text-label-md text-center transition-all duration-200 cursor-pointer outline-none whitespace-nowrap',
          activeTab === tab ? 'rounded-xl' : 'rounded-[10px]',
        )}
        style={{
          backgroundColor: activeTab === tab ? 'var(--wm-bg-primary-muted-20)' : 'transparent',
          color: activeTab === tab ? 'var(--wm-text-green)' : 'var(--wm-text-03)',
        }}
      >
        {tab === 'live' ? t('market.live') : t('market.upcoming')}
      </button>
    ))}
  </div>
)

/* ── Section ──────────────────────────────────────────────────────────────── */
const MarketTodaySection = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { liveData, upcomingData } = useSimulatedMarkets()
  const [mobileTab, setMobileTab] = useState<'live' | 'upcoming'>('live')

  /* ── Tab slide direction tracking ─────────────────────────────────── */
  const TAB_INDEX: Record<'live' | 'upcoming', number> = { live: 0, upcoming: 1 }
  const prevTabRef = useRef(mobileTab)
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('right')

  const switchMobileTab = (tab: 'live' | 'upcoming') => {
    setSlideDir(TAB_INDEX[tab] > TAB_INDEX[prevTabRef.current] ? 'right' : 'left')
    prevTabRef.current = tab
    setMobileTab(tab)
  }

  return (
    <section className="py-8 md:py-12 bg-wm-bg-01">
      <FlashStyles />
      <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-4 md:py-6">

        {/* Mobile: title + tab + card — matches HowToJoin spacing */}
        <div className="flex flex-col gap-8 md:gap-10 lg:gap-12 items-center lg:hidden">
          {/* Title + tab block */}
          <div className="flex flex-col gap-6 md:gap-8 items-center max-w-[720px] w-full">
            <div className="text-center flex flex-col gap-2 w-full">
              <h2
                className="text-heading-md md:text-display-md lg:text-display-lg text-wm-text-01"
                style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
              >
                {t('market.title')}
              </h2>
              <p className="text-body-sm md:text-body-lg text-wm-text-02">
                {t('market.desc')}
              </p>
            </div>
            <MobileTabBar activeTab={mobileTab} onTabChange={switchMobileTab} t={t} />
          </div>
          {/* Card — slide animation on tab switch */}
          <div
            key={mobileTab}
            className="w-full"
            style={{ animation: `tab-slide-${slideDir} 280ms ease-out both` }}
          >
            {mobileTab === 'live'
              ? <LiveCard navigate={navigate} t={t} markets={liveData} />
              : <UpcomingCard navigate={navigate} t={t} markets={upcomingData} />
            }
          </div>
        </div>

        {/* Desktop: title + both cards side by side */}
        <div className="hidden lg:block">
          <div className="text-center mb-16 max-w-[720px] mx-auto flex flex-col gap-2">
            <h2
              className="text-heading-md md:text-display-md lg:text-display-lg text-wm-text-01"
              style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
            >
              {t('market.title')}
            </h2>
            <p className="text-body-sm md:text-body-lg text-wm-text-02">
              {t('market.desc')}
            </p>
          </div>

          <div className="flex gap-8">
            <LiveCard navigate={navigate} t={t} markets={liveData} />
            <UpcomingCard navigate={navigate} t={t} markets={upcomingData} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default MarketTodaySection
