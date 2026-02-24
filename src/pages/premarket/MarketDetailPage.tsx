import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeftLine } from '@mingcute/react'
import { liveMarkets, upcomingMarkets } from '@/mock-data/premarket'

/* ── Stat card ────────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
  <div className="flex flex-col gap-1">
    <p className="text-body-xs text-wm-text-03">{label}</p>
    <p
      className="text-label-md text-wm-text-01"
      style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
    >
      {value}
    </p>
    {sub && <p className="text-body-xs text-wm-text-green">{sub}</p>}
  </div>
)

/* ── Order row ────────────────────────────────────────────────────────────── */
const OrderRow = ({
  price,
  amount,
  total,
  side,
}: {
  price: string
  amount: string
  total: string
  side: 'buy' | 'sell'
}) => (
  <div className="flex items-center gap-2 px-4 py-2 text-[13px] leading-[20px] hover:bg-white/[0.03] transition-colors">
    <span
      className="flex-1"
      style={{ color: side === 'buy' ? 'var(--wm-text-green)' : 'var(--wm-text-danger)' }}
    >
      {price}
    </span>
    <span className="flex-1 text-right text-wm-text-02">{amount}</span>
    <span className="flex-1 text-right text-wm-text-03">{total}</span>
  </div>
)

/* ── Mock order book data ─────────────────────────────────────────────────── */
const SELL_ORDERS = [
  { price: '$0.3720', amount: '12,450', total: '$4,630' },
  { price: '$0.3680', amount: '8,200',  total: '$3,018' },
  { price: '$0.3650', amount: '5,340',  total: '$1,949' },
  { price: '$0.3620', amount: '9,870',  total: '$3,573' },
  { price: '$0.3600', amount: '3,210',  total: '$1,156' },
]
const BUY_ORDERS = [
  { price: '$0.3499', amount: '15,600', total: '$5,459' },
  { price: '$0.3450', amount: '7,890',  total: '$2,722' },
  { price: '$0.3410', amount: '4,560',  total: '$1,555' },
  { price: '$0.3380', amount: '11,230', total: '$3,796' },
  { price: '$0.3350', amount: '6,780',  total: '$2,271' },
]

/* ── Page ─────────────────────────────────────────────────────────────────── */
const MarketDetailPage = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate  = useNavigate()
  const [side, setSide]     = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState('')

  /* Merge live + upcoming, pick by slug */
  const token =
    liveMarkets.find((t) => t.slug === slug) ??
    upcomingMarkets.find((t) => t.slug === slug)

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center flex flex-col gap-4">
          <p className="text-display-lg text-wm-text-01">Token not found</p>
          <button
            onClick={() => navigate('/')}
            className="text-wm-text-green hover:opacity-80 transition-opacity text-label-sm"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    )
  }

  const isLive     = liveMarkets.some((t) => t.slug === slug)
  const liveData   = liveMarkets.find((t) => t.slug === slug)
  const price      = liveData?.price ?? 0
  const change     = liveData?.priceChange ?? 0
  const volume     = liveData?.totalVolume ?? 0

  return (
    <div className="min-h-screen bg-wm-bg-01">
      <div className="max-w-[1440px] mx-auto px-12 py-8 flex flex-col gap-8">

        {/* ── Back button ── */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-wm-text-03 hover:text-wm-text-01 transition-colors self-start"
        >
          <ArrowLeftLine size={16} />
          <span className="text-body-sm">Pre-Market</span>
        </button>

        {/* ── Token header ── */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0 p-1" style={{ width: 64, height: 64 }}>
            <img
              src={token.logoUrl}
              alt={token.name}
              className="rounded-full object-cover block"
              style={{ width: 56, height: 56 }}
            />
            <img
              src={token.chainLogoUrl}
              alt="chain"
              className="absolute bottom-0 left-0 rounded-[4px] border-2 border-wm-bg-01 object-cover block"
              style={{ width: 20, height: 20 }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-heading-sm text-wm-text-01" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
                {token.name}
              </h1>
              <span
                className="px-2 py-0.5 rounded-[4px] text-[11px] leading-[16px] font-medium"
                style={{
                  backgroundColor: isLive ? 'rgba(22,194,132,0.15)' : 'rgba(255,255,255,0.08)',
                  color: isLive ? 'var(--wm-text-green)' : 'var(--wm-text-03)',
                }}
              >
                {isLive ? 'Live' : 'Upcoming'}
              </span>
            </div>
            <p className="text-body-xs text-wm-text-03">{token.protocol}</p>
          </div>

          {/* Price block */}
          {isLive && (
            <div className="ml-auto flex items-end gap-2">
              <p
                className="text-[32px] leading-[40px] font-medium text-wm-text-01"
                style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
              >
                ${price.toFixed(4)}
              </p>
              <p className="text-label-sm text-wm-text-green pb-1">
                +{change.toFixed(1)}%
              </p>
            </div>
          )}
        </div>

        {/* ── Stats row ── */}
        {isLive && (
          <div className="grid grid-cols-6 gap-px rounded-[16px] border border-wm-border-01 overflow-hidden">
            {[
              { label: '24h Volume',    value: `$${volume.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
              { label: '24h Change',    value: `-${Math.abs(liveData?.volumeChange ?? 0).toFixed(2)}%` },
              { label: 'Market Cap',    value: '$124.5M' },
              { label: 'Total Supply',  value: '1,000,000,000' },
              { label: 'Circulating',   value: '210,000,000' },
              { label: 'Holders',       value: '28,432' },
            ].map((s) => (
              <div key={s.label} className="flex flex-col gap-1 px-5 py-4 bg-wm-bg-02">
                <p className="text-body-xs text-wm-text-03">{s.label}</p>
                <p
                  className="text-label-md text-wm-text-01"
                  style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Main content: Order book + Trade form ── */}
        <div className="flex gap-6 items-start">

          {/* Order book */}
          <div className="flex-1 rounded-[16px] border border-wm-border-01 bg-wm-bg-02 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3.5 border-b border-wm-border-01">
              <p className="text-label-sm text-wm-text-01">Order Book</p>
            </div>

            {/* Column labels */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-wm-border-01">
              {['Price', 'Amount', 'Total'].map((col, i) => (
                <span
                  key={col}
                  className="flex-1 text-label-xs text-wm-text-03"
                  style={{ textAlign: i === 0 ? 'left' : 'right' }}
                >
                  {col}
                </span>
              ))}
            </div>

            {/* Sell orders */}
            {[...SELL_ORDERS].reverse().map((o, i) => (
              <OrderRow key={`s${i}`} {...o} side="sell" />
            ))}

            {/* Spread */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-y border-wm-border-02">
              <span
                className="text-label-md"
                style={{ color: 'var(--wm-text-green)', fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
              >
                $0.3499
              </span>
              <span className="text-body-xs text-wm-text-03">Spread: $0.0101 (2.88%)</span>
            </div>

            {/* Buy orders */}
            {BUY_ORDERS.map((o, i) => (
              <OrderRow key={`b${i}`} {...o} side="buy" />
            ))}
          </div>

          {/* Trade form */}
          <div
            className="w-[384px] shrink-0 rounded-[16px] border border-wm-border-01 bg-wm-bg-02 overflow-hidden"
          >
            {/* Buy / Sell tabs */}
            <div className="flex border-b border-wm-border-01">
              {(['buy', 'sell'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSide(tab)}
                  className="flex-1 py-3.5 text-label-sm transition-colors capitalize"
                  style={{
                    color: side === tab
                      ? (tab === 'buy' ? 'var(--wm-text-green)' : 'var(--wm-text-danger)')
                      : 'var(--wm-text-03)',
                    borderBottom: side === tab
                      ? `2px solid ${tab === 'buy' ? 'var(--wm-text-green)' : 'var(--wm-text-danger)'}`
                      : '2px solid transparent',
                  }}
                >
                  {tab === 'buy' ? 'Buy' : 'Sell'} {token.name}
                </button>
              ))}
            </div>

            <div className="p-5 flex flex-col gap-4">
              {/* Price */}
              <div className="flex flex-col gap-2">
                <label className="text-body-xs text-wm-text-03">Price (USDC)</label>
                <div className="flex items-center px-3 py-2.5 rounded-[8px] border border-wm-border-02 bg-wm-bg-01 gap-2">
                  <input
                    type="number"
                    placeholder="0.00"
                    defaultValue={price.toFixed(4)}
                    className="flex-1 bg-transparent text-wm-text-01 text-label-sm outline-none placeholder:text-wm-text-03"
                    style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
                  />
                  <span className="text-body-xs text-wm-text-03 shrink-0">USDC</span>
                </div>
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-2">
                <label className="text-body-xs text-wm-text-03">
                  Amount ({token.symbol})
                </label>
                <div className="flex items-center px-3 py-2.5 rounded-[8px] border border-wm-border-02 bg-wm-bg-01 gap-2">
                  <input
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 bg-transparent text-wm-text-01 text-label-sm outline-none placeholder:text-wm-text-03"
                    style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
                  />
                  <span className="text-body-xs text-wm-text-03 shrink-0">{token.symbol}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between px-3 py-2.5 rounded-[8px] bg-wm-bg-03">
                <span className="text-body-xs text-wm-text-03">Total</span>
                <span
                  className="text-label-sm text-wm-text-01"
                  style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
                >
                  {amount
                    ? `$${(parseFloat(amount) * price).toFixed(2)}`
                    : '$0.00'}
                </span>
              </div>

              {/* Submit */}
              <button
                className="w-full py-3.5 rounded-[12px] text-label-sm font-medium text-white transition-opacity hover:opacity-90 active:scale-[0.99]"
                style={{
                  backgroundColor: side === 'buy' ? 'var(--wm-bg-primary)' : 'var(--wm-text-danger)',
                }}
              >
                {side === 'buy' ? `Buy ${token.name}` : `Sell ${token.name}`}
              </button>

              {/* Disclaimer */}
              <p className="text-[11px] leading-[16px] text-wm-text-03 text-center">
                By placing an order you agree to our{' '}
                <span className="text-wm-text-01 cursor-pointer hover:underline">Terms of Service</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarketDetailPage
