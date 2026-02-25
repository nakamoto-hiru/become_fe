import { useMemo, useState } from 'react'
import { DownLine } from '@mingcute/react'
import { cn } from '@/lib/utils'
import type { FaqItem } from '@/mock-data/premarket'
import { useLanguage } from '@/contexts/LanguageContext'

/* ── Single FAQ item ── */
const FaqRow = ({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem
  isOpen: boolean
  onToggle: () => void
}) => (
  /* Figma faq-item: border-t, p-[24px] all sides */
  <div
    className="cursor-pointer select-none border-t border-wm-border-02 p-4 md:p-6 flex flex-col hover:bg-wm-bg-02/60 transition-all duration-100 ease-[cubic-bezier(0.4,0,0.2,1)]"
    onClick={onToggle}
  >
    {/* Question row */}
    <div className="flex items-center gap-4">
      <span className="flex-1 text-label-md md:text-heading-sm text-wm-text-01">
        {item.question}
      </span>

      {/* Single icon — rotates 180° when open, matching navbar DownFill pattern */}
      <span
        className={cn(
          'inline-flex shrink-0',
          'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          isOpen ? 'rotate-180 text-wm-text-01' : 'rotate-0 text-wm-text-03',
        )}
      >
        <DownLine size={24} />
      </span>
    </div>

    {/* Answer — smooth grid-rows height animation (no max-height hack) */}
    <div
      className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
    >
      {/* overflow-hidden clips content + padding when row collapses to 0 */}
      <div className="overflow-hidden">
        <p className="text-body-sm md:text-body-md text-wm-text-02 max-w-[768px] pt-3">
          {item.answer}
        </p>
      </div>
    </div>
  </div>
)

/* ── FAQ IDs — used to build items from t() ── */
const FAQ_IDS = ['1', '2', '3', '4', '5', '6', '7'] as const

/* ── Section ── */
const FaqSection = () => {
  const [openId, setOpenId] = useState<string>('1')
  const toggle = (id: string) => setOpenId(openId === id ? '' : id)
  const { t } = useLanguage()

  const faqItems: FaqItem[] = useMemo(
    () => FAQ_IDS.map((id) => ({
      id,
      question: t(`faq.${id}.q` as Parameters<typeof t>[0]),
      answer:   t(`faq.${id}.a` as Parameters<typeof t>[0]),
    })),
    [t],
  )

  return (
    <section className="bg-wm-bg-01">
      <div className="max-w-[1440px] mx-auto px-4 py-8 md:p-12">
        <div className="py-4 md:py-6 flex flex-col gap-8 md:gap-16">

          {/* Title block */}
          <div className="text-center max-w-[720px] mx-auto flex flex-col gap-2">
            <h2 className="text-heading-md md:text-display-md lg:text-display-lg text-wm-text-01">
              {t('faq.title')}
            </h2>
            <p className="text-body-sm md:text-body-lg text-wm-text-02">
              {t('faq.desc')}
            </p>
          </div>

          {/* Accordion */}
          <div>
            {faqItems.map((item: FaqItem) => (
              <FaqRow
                key={item.id}
                item={item}
                isOpen={openId === item.id}
                onToggle={() => toggle(item.id)}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}

export default FaqSection
