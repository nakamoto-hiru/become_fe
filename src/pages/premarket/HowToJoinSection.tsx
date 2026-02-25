import { Fragment, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Step } from '@/mock-data/premarket'

// Figma: node 46139:855193 (Buy) / 46153:848476 (Sell) — sec-markets / How to join Premarket trading
//
// Container: max-w-1440 px-48 py-24  flex-col gap-64 items-center
// block-title: flex-col gap-32 items-center max-w-720 w-full
//   Text: flex-col gap-16 text-center
//   Tab:  bg-[#0a0a0b] border-[#1b1b1c] p-[4px] rounded-[16px]
//         buy  active: px-20 py-12 rounded-12 bg-primary-20       text-green   text-label-md
//         sell active: px-20 py-12 rounded-12 bg-danger-20        text-danger  text-label-md
//         inactive:    px-20 py-12 rounded-10 text-03             text-label-md
// Content (sliding): both panels in DOM — flex siblings → equal height auto
//   Slider: width:200% translateX(0) [buy] | translateX(-50%) [sell]
//   Panel:  width:50%  flex items-center
//   [card-wrapper: flex flex-1 self-stretch] [Arrow: w-96 shrink-0] [card-wrapper] [Arrow] [card-wrapper]
//   ↑ Arrows are SIBLINGS of card wrappers — NOT children
// Card (buy):  backdrop-blur-16 bg-overlay-5 border-overlay-10 rounded-16 p-0  flex-1 w-full
// Card (sell): backdrop-blur-8  bg-overlay-5 border-overlay-10 rounded-16 p-0  flex-1 w-full
//   body: flex-col gap-16 p-24 shrink-0
//     badge: bg-overlay-5 px-24 py-12 rounded-12 shrink-0 overflow-clip
//            text-label-lg text-01 whitespace-nowrap  fontFeatureSettings
//     tokens: flex-col gap-8
//       title: 20/28M text-01  fontFeatureSettings
//       desc:  16/24R text-02  fontFeatureSettings

/* ── Arrow connector — sibling of card wrappers, centered vertically ── */
const StepArrow = () => (
  <div className="w-24 shrink-0 self-center flex items-center justify-center">
    <svg width="96" height="15" viewBox="0 0 96 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0.666667 7.36401C0.666666 10.3095 3.05448 12.6973 6 12.6973C8.94552 12.6973 11.3333 10.3095 11.3333 7.36401C11.3333 4.4185 8.94552 2.03068 6 2.03068C3.05448 2.03068 0.666667 4.41849 0.666667 7.36401ZM94.7071 8.07113C95.0976 7.6806 95.0976 7.04744 94.7071 6.65691L88.3431 0.292953C87.9526 -0.0975714 87.3195 -0.0975714 86.9289 0.292953C86.5384 0.683477 86.5384 1.31664 86.9289 1.70717L92.5858 7.36402L86.9289 13.0209C86.5384 13.4114 86.5384 14.0446 86.9289 14.4351C87.3195 14.8256 87.9526 14.8256 88.3431 14.4351L94.7071 8.07113ZM6 7.36401L6 8.36401L8 8.36401L8 7.36401L8 6.36401L6 6.36401L6 7.36401ZM12 7.36401L12 8.36401L16 8.36401L16 7.36401L16 6.36401L12 6.36401L12 7.36401ZM20 7.36401L20 8.36401L24 8.36402L24 7.36402L24 6.36402L20 6.36401L20 7.36401ZM28 7.36402L28 8.36402L32 8.36402L32 7.36402L32 6.36402L28 6.36402L28 7.36402ZM36 7.36402L36 8.36402L40 8.36402L40 7.36402L40 6.36402L36 6.36402L36 7.36402ZM44 7.36402L44 8.36402L48 8.36402L48 7.36402L48 6.36402L44 6.36402L44 7.36402ZM52 7.36402L52 8.36402L56 8.36402L56 7.36402L56 6.36402L52 6.36402L52 7.36402ZM60 7.36402L60 8.36402L64 8.36402L64 7.36402L64 6.36402L60 6.36402L60 7.36402ZM68 7.36402L68 8.36402L72 8.36402L72 7.36402L72 6.36402L68 6.36402L68 7.36402ZM76 7.36402L76 8.36402L80 8.36402L80 7.36402L80 6.36402L76 6.36402L76 7.36402ZM84 7.36402L84 8.36402L88 8.36402L88 7.36402L88 6.36402L84 6.36402L84 7.36402ZM92 7.36402L92 8.36402L94 8.36402L94 7.36402L94 6.36402L92 6.36402L92 7.36402Z" fill="#44444B"/>
    </svg>
  </div>
)

/* ── Step card — glassmorphism per Figma node 46153:842611 ── */
// blur: 16px for buy tab (node 46139:855193), 8px for sell tab (node 46153:848476)
const StepCard = ({ step, blur = '16px' }: { step: Step; blur?: string }) => (
  <div
    className="flex-1 rounded-[16px] flex flex-col"
    style={{
      backdropFilter: `blur(${blur})`,
      WebkitBackdropFilter: `blur(${blur})`,
      backgroundColor: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.10)',
    }}
  >
    {/* body — data-name="body": flex-col gap-16 p-24 shrink-0 */}
    <div className="flex flex-col gap-4 items-start p-6 w-full shrink-0">

      {/* badge — data-name="button": size-full bg-overlay px-24 py-12 rounded-12 overflow-clip */}
      <div
        className="flex items-center w-[52px] h-[52px] overflow-hidden rounded-full justify-center"
        style={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          fontFeatureSettings: "'lnum' 1, 'tnum' 1",
        }}
      >
        <span className="text-label-lg text-wm-text-01 whitespace-nowrap">
          {step.number}
        </span>
      </div>

      {/* tokens — data-name="tokens": flex-col gap-8 */}
      <div className="flex flex-col gap-2 w-full">
        <h3
          className="text-heading-sm text-wm-text-01"
          style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
        >
          {step.title}
        </h3>
        <p
          className="text-body-md text-wm-text-02"
          style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
        >
          {step.description}
        </p>
      </div>

    </div>
  </div>
)

/* ── Section ── */
const HowToJoinSection = () => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy')
  const { t } = useLanguage()

  const buySteps: Step[] = useMemo(() => [
    { number: '01', title: t('htj.buy1Title'), description: t('htj.buy1Desc') },
    { number: '02', title: t('htj.buy2Title'), description: t('htj.buy2Desc') },
    { number: '03', title: t('htj.buy3Title'), description: t('htj.buy3Desc') },
  ], [t])

  const sellSteps: Step[] = useMemo(() => [
    { number: '01', title: t('htj.sell1Title'), description: t('htj.sell1Desc') },
    { number: '02', title: t('htj.sell2Title'), description: t('htj.sell2Desc') },
    { number: '03', title: t('htj.sell3Title'), description: t('htj.sell3Desc') },
  ], [t])

  return (
    <section className="relative py-8 md:py-12 overflow-hidden bg-wm-bg-01">
      {/* ── Video background ─────────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-bottom"
        >
          <source src="/assets/howtojoin-bg.mp4" type="video/mp4" />
        </video>
        {/* Top gradient fade into section bg */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, var(--wm-bg-01) 5%, transparent 35%)',
          }}
        />
        {/* Bottom gradient fade */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, var(--wm-bg-01) 2%, transparent 5%)',
          }}
        />
      </div>

      {/* Container */}
      <div className="relative max-w-[1440px] mx-auto px-4 md:px-12 py-8 md:py-12 flex flex-col gap-8 md:gap-16 items-center">

        {/* block-title */}
        <div className="flex flex-col gap-6 md:gap-8 items-center max-w-[720px] w-full">

          {/* Text block */}
          <div className="flex flex-col gap-2 text-center w-full">
            <h2 className="text-heading-md md:text-display-md lg:text-display-lg text-wm-text-01">
              {t('htj.title')}
            </h2>
            <p className="text-body-sm md:text-body-lg text-wm-text-02">
              {t('htj.desc')}
            </p>
          </div>

          {/* Tab toggle — Figma node 46153:848847 */}
          <div
            className="flex p-1 rounded-[16px] border overflow-hidden w-full md:w-auto"
            style={{
              backgroundColor: 'var(--wm-bg-01)',
              borderColor: 'var(--wm-border-01)',
            }}
          >
            {(['buy', 'sell'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'shrink-0 px-5 py-3 text-label-sm md:text-label-md text-center transition-all duration-200 cursor-pointer outline-none whitespace-nowrap flex-[1_0_0] ',
                  activeTab === tab ? 'rounded-xl' : 'rounded-[10px]',
                )}
                style={{
                  backgroundColor:
                    activeTab === tab
                      ? tab === 'buy'
                        ? 'var(--wm-bg-primary-muted-20)'
                        : 'rgba(255,59,70,0.2)'
                      : 'transparent',
                  color:
                    activeTab === tab
                      ? tab === 'buy'
                        ? 'var(--wm-text-green)'
                        : '#fd5e67'
                      : 'var(--wm-text-03)',
                }}
              >
                {tab === 'buy' ? t('htj.tabBuy') : t('htj.tabSell')}
              </button>
            ))}
          </div>

        </div>

        {/* ── Sliding content area ──────────────────────────────────────────
            Both panels always in DOM so their heights are compared as flex
            siblings → cards are ALWAYS equal height across both tabs.
            translateX(0) = buy visible | translateX(-50%) = sell visible     */}
        <div className="w-full overflow-hidden">
          <div
            className="flex"
            style={{
              width: '200%',
              transform: activeTab === 'buy' ? 'translateX(0)' : 'translateX(-50%)',
              transition: 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >

            {/* ── Buy panel ── */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-0" style={{ width: '50%' }}>
              {buySteps.map((step, i) => (
                <Fragment key={step.number}>
                  <div className="flex flex-1 self-stretch">
                    <StepCard step={step} blur="16px" />
                  </div>
                  {i < buySteps.length - 1 && <div className="hidden lg:flex"><StepArrow /></div>}
                </Fragment>
              ))}
            </div>

            {/* ── Sell panel ── */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-0" style={{ width: '50%' }}>
              {sellSteps.map((step, i) => (
                <Fragment key={step.number}>
                  <div className="flex flex-1 self-stretch">
                    <StepCard step={step} blur="16px" />
                  </div>
                  {i < sellSteps.length - 1 && <div className="hidden lg:flex"><StepArrow /></div>}
                </Fragment>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}

export default HowToJoinSection
