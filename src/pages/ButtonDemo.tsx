/**
 * ButtonDemo — visual test for all Button variants × appearances × sizes × states
 * Route: /demo/buttons
 */
import Button from '@/components/Button'
import { ArrowRightLine, DownLine, Settings7Line } from '@mingcute/react'

const VARIANTS   = ['primary', 'secondary', 'danger', 'success'] as const
const APPEARANCES = ['filled', 'tonal', 'outline', 'ghost', 'transparent'] as const
const SIZES       = ['sm', 'md', 'lg', 'xl'] as const

type Variant    = typeof VARIANTS[number]
type Appearance = typeof APPEARANCES[number]

// transparent is secondary only
const isValid = (v: Variant, a: Appearance) =>
  !(a === 'transparent' && v !== 'secondary')

export default function ButtonDemo() {
  return (
    <div className="min-h-screen bg-wm-bg-01 p-8 font-sans">
      <h1 className="text-wm-text-01 text-2xl font-semibold mb-2">
        Button Component
      </h1>
      <p className="text-wm-text-03 text-sm mb-10">
        Figma node: 31307-32608 — all variants × appearances × sizes × states
      </p>

      {/* ── Sizes ──────────────────────────────────────────────────────── */}
      <Section title="Sizes (primary / filled)">
        <Row>
          {SIZES.map((size) => (
            <Button key={size} variant="primary" appearance="filled" size={size}>
              Button {size.toUpperCase()}
            </Button>
          ))}
        </Row>
      </Section>

      {/* ── Variants × Appearances ─────────────────────────────────────── */}
      {VARIANTS.map((variant) => (
        <Section key={variant} title={`variant="${variant}"`}>
          {APPEARANCES.filter((a) => isValid(variant, a)).map((appearance) => (
            <div key={appearance} className="mb-4">
              <p className="text-wm-text-03 text-xs mb-2 font-mono">
                appearance="{appearance}"
              </p>
              <Row>
                {/* Default */}
                <Button variant={variant} appearance={appearance} size="md">
                  Default
                </Button>
                {/* With leading icon */}
                <Button
                  variant={variant}
                  appearance={appearance}
                  size="md"
                  leadingIcon={<ArrowRightLine size={16} />}
                >
                  Leading Icon
                </Button>
                {/* With trailing icon */}
                <Button
                  variant={variant}
                  appearance={appearance}
                  size="md"
                  trailingIcon={<DownLine size={16} />}
                >
                  Trailing Icon
                </Button>
                {/* Icon only */}
                <Button
                  variant={variant}
                  appearance={appearance}
                  size="md"
                  iconOnly
                >
                  <Settings7Line size={16} />
                </Button>
                {/* Loading */}
                <Button
                  variant={variant}
                  appearance={appearance}
                  size="md"
                  loading
                >
                  Loading
                </Button>
                {/* Loading icon-only */}
                <Button
                  variant={variant}
                  appearance={appearance}
                  size="md"
                  iconOnly
                  loading
                >
                  <Settings7Line size={16} />
                </Button>
                {/* Disabled */}
                <Button
                  variant={variant}
                  appearance={appearance}
                  size="md"
                  disabled
                >
                  Disabled
                </Button>
                {/* Disabled icon-only */}
                <Button
                  variant={variant}
                  appearance={appearance}
                  size="md"
                  iconOnly
                  disabled
                >
                  <Settings7Line size={16} />
                </Button>
              </Row>
            </div>
          ))}
        </Section>
      ))}

      {/* ── All sizes × all variants ────────────────────────────────────── */}
      <Section title="Size comparison — all variants / filled">
        {VARIANTS.map((variant) => (
          <div key={variant} className="mb-4">
            <p className="text-wm-text-03 text-xs mb-2 font-mono">variant="{variant}" / filled</p>
            <Row>
              {SIZES.map((size) => (
                <Button
                  key={size}
                  variant={variant}
                  appearance="filled"
                  size={size}
                  leadingIcon={<ArrowRightLine size={ICON_SIZE_MAP[size]} />}
                >
                  {size.toUpperCase()}
                </Button>
              ))}
              {/* Icon-only row */}
              {SIZES.map((size) => (
                <Button
                  key={`icon-${size}`}
                  variant={variant}
                  appearance="filled"
                  size={size}
                  iconOnly
                >
                  <Settings7Line size={ICON_SIZE_MAP[size]} />
                </Button>
              ))}
            </Row>
          </div>
        ))}
      </Section>
    </div>
  )
}

const ICON_SIZE_MAP = { sm: 12, md: 16, lg: 20, xl: 24 }

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-10">
      <h2 className="text-wm-text-02 text-sm font-semibold mb-4 pb-2 border-b border-wm-border-02">
        {title}
      </h2>
      {children}
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3">{children}</div>
  )
}
