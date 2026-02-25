import { useLanguage } from '@/contexts/LanguageContext'
import type { TranslationKey } from '@/i18n/translations'

/* ── Whale logo — official brand SVG (167×48) ── */
const WhaleLogo = () => (
  <img
    src="/assets/logo.svg"
    alt="Whales Market"
    width={166}
    height={48}
    style={{ display: 'block' }}
  />
)

/* ──
 * Figma footer link column specs (node I46153:846288;45281:36591):
 *   column layout:      flex-col  gap-[16px]              (title → links-list)
 *   links list:         flex-col  gap-[8px]               (between each item)
 *   column title:       label/text-label-md  (16px/500/24) text-wm-text-01
 *   link default:       body/text-body-sm    (14px/400/20) text-wm-text-03
 *   link hover:         text-wm-text-01 + cursor-pointer
 * ── */

interface FooterLink {
  labelKey?: TranslationKey      // translated via t()
  labelRaw?: string              // used as-is (brand names: X, Telegram, Discord, email)
  href: string
}

interface FooterColumn {
  titleKey: TranslationKey
  links: FooterLink[]
}

const FOOTER_LINKS: FooterColumn[] = [
  {
    titleKey: 'footer.product',
    links: [
      { labelKey: 'footer.preMarkets',  href: '#' },
      { labelKey: 'footer.platformFee', href: '#' },
    ],
  },
  {
    titleKey: 'footer.resources',
    links: [
      { labelKey: 'footer.documentation', href: '#' },
      { labelKey: 'footer.faq',           href: '#' },
      { labelKey: 'footer.support',       href: '#' },
    ],
  },
  {
    titleKey: 'footer.connect',
    links: [
      { labelRaw: 'X',        href: 'https://x.com/whales_market' },
      { labelRaw: 'Telegram', href: 'https://t.me/whalesmarket'   },
      { labelRaw: 'Discord',  href: '#'                           },
    ],
  },
  {
    titleKey: 'footer.contact',
    links: [
      { labelRaw: 'team@whales.market', href: 'mailto:team@whales.market' },
    ],
  },
]

const Footer = () => {
  const { t } = useLanguage()

  return (
    <footer className="border-t bg-wm-bg-01 border-wm-border-01">
      <div className="max-w-[1440px] mx-auto px-4 py-8 md:p-12">
        <div className="flex flex-col md:flex-row gap-8">

          {/* ── Brand column ── */}
          <div className="flex flex-col gap-6 md:gap-8 w-full md:w-[400px] shrink-0 md:pr-16">
            <WhaleLogo />
            <div className="flex flex-col gap-4">
              <p className="text-body-sm text-wm-text-03">
                {t('footer.tagline')}
              </p>
              <p className="text-body-sm text-wm-text-03">
                {t('footer.copyright')}
              </p>
            </div>
          </div>

          {/* ── Link columns ── */}
          <div className="flex-1 grid grid-cols-2 md:flex gap-6 md:gap-8">
            {FOOTER_LINKS.map((col) => (
              <div key={col.titleKey} className="flex-1 flex flex-col gap-4">

                {/* Column title — label/text-label-md confirmed from Figma */}
                <p className="text-label-md shrink-0 text-wm-text-01">
                  {t(col.titleKey)}
                </p>

                {/* Links list — body/text-body-sm confirmed from Figma */}
                <div className="flex flex-col gap-2">
                  {col.links.map((link) => {
                    const label = link.labelKey ? t(link.labelKey) : link.labelRaw!
                    return (
                      <a
                        key={label}
                        href={link.href}
                        className="text-body-sm text-wm-text-03 transition-colors duration-150 cursor-pointer hover:text-wm-text-01 no-underline"
                      >
                        {label}
                      </a>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </footer>
  )
}

export default Footer
