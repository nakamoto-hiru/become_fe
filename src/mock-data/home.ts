/* ── Types ─────────────────────────────────────────────────────────── */

export interface MarketListItem {
  id: string
  slug: string
  name: string
  symbol: string
  protocol: string
  logoUrl: string
  chainLogoUrl: string
  chain: 'solana' | 'ethereum' | 'sui'
  lastPrice: number
  priceChange: number
  liqVol24h: number
  liqVolChange: number
  totalVol: number
  totalVolChange: number
  impliedFdv: number
  settleTime: string | null
  status: 'settling' | 'upcoming' | 'live' | 'ended'
  isNew?: boolean
  chartDirection: 'up' | 'down'
}

export interface RecentActivity {
  id: string
  time: string
  orderType: 'Filled' | 'Open'
  side: 'Buy' | 'Sell'
  tokenName: string
  tokenLogoUrl: string
  chainLogoUrl: string
  isVip?: boolean
  price: number
  amount: number
  collateral: number
}

export interface TopMetricVolume {
  type: 'volume'
  label: string
  value: string
  change: string
}

export interface TopMetricFearGreed {
  type: 'fearGreed'
  label: string
  score: number
  sentiment: string
}

export interface TopMetricAltcoinSeason {
  type: 'altcoinSeason'
  label: string
  score: number
  total: number
}

export interface TopMetricSettlement {
  type: 'settlement'
  label: string
  tokenName: string
  tokenLogoUrl: string
  settleDate: string
}

export type TopMetric =
  | TopMetricVolume
  | TopMetricFearGreed
  | TopMetricAltcoinSeason
  | TopMetricSettlement

/* ── Top Metrics Data ──────────────────────────────────────────────── */

export const topMetrics: TopMetric[] = [
  {
    type: 'volume',
    label: 'Pre-market 24 vol.',
    value: '$4.2M',
    change: '+12.5%',
  },
  {
    type: 'fearGreed',
    label: 'Fear & Greed',
    score: 43,
    sentiment: 'Neutral',
  },
  {
    type: 'altcoinSeason',
    label: 'Altcoin season',
    score: 70,
    total: 100,
  },
  {
    type: 'settlement',
    label: 'Next settlement',
    tokenName: 'SKATE',
    tokenLogoUrl: '/assets/tokens/skate.png',
    settleDate: '2025-06-09T14:00:00Z',
  },
]

/* ── Market List Data ──────────────────────────────────────────────── */

export const marketListItems: MarketListItem[] = [
  {
    id: '1',
    slug: 'skate',
    name: 'SKATE',
    symbol: 'SKATE',
    protocol: 'SKATEON',
    logoUrl: '/assets/tokens/skate.png',
    chainLogoUrl: '/assets/tokens/chain-solana.png',
    chain: 'solana',
    lastPrice: 0.055,
    priceChange: 162.18,
    liqVol24h: 7375.62,
    liqVolChange: -16.18,
    totalVol: 25197.18,
    totalVolChange: 6.38,
    impliedFdv: 38.1e6,
    settleTime: null,
    status: 'settling',
    chartDirection: 'up',
  },
  {
    id: '2',
    slug: 'shake',
    name: 'SKATE',
    symbol: 'SKATE',
    protocol: 'Skate Chain',
    logoUrl: '/assets/tokens/skate.png',
    chainLogoUrl: '/assets/tokens/chain-solana.png',
    chain: 'solana',
    lastPrice: 0.119,
    priceChange: 63.8,
    liqVol24h: 445.86,
    liqVolChange: 1159.36,
    totalVol: 21904.26,
    totalVolChange: 19.12,
    impliedFdv: 48.3e3,
    settleTime: null,
    status: 'settling',
    chartDirection: 'up',
  },
  {
    id: '3',
    slug: 'era',
    name: 'ERA',
    symbol: 'ERA',
    protocol: 'Caldera',
    logoUrl: '/assets/tokens/era.png',
    chainLogoUrl: '/assets/tokens/chain-ethereum.png',
    chain: 'ethereum',
    lastPrice: 0.0464,
    priceChange: 98.31,
    liqVol24h: 418326.12,
    liqVolChange: -32.16,
    totalVol: 7483875.48,
    totalVolChange: 9.18,
    impliedFdv: 22.2e6,
    settleTime: '2025-05-30T13:00:00Z',
    status: 'live',
    chartDirection: 'up',
  },
  {
    id: '4',
    slug: 'grass',
    name: 'GRASS',
    symbol: 'GRASS',
    protocol: 'Grass',
    logoUrl: '/assets/tokens/grass.png',
    chainLogoUrl: '/assets/tokens/chain-solana.png',
    chain: 'solana',
    lastPrice: 0.11,
    priceChange: 124.52,
    liqVol24h: 10418.71,
    liqVolChange: 228.25,
    totalVol: 64110.29,
    totalVolChange: 0.81,
    impliedFdv: 36.1e6,
    settleTime: null,
    status: 'live',
    chartDirection: 'up',
  },
  {
    id: '5',
    slug: 'loud',
    name: 'LOUD',
    symbol: 'LOUD',
    protocol: 'Loud',
    logoUrl: '/assets/tokens/grass.png',
    chainLogoUrl: '/assets/tokens/chain-solana.png',
    chain: 'solana',
    lastPrice: 0.9638,
    priceChange: -22.6,
    liqVol24h: 18312.61,
    liqVolChange: 49.13,
    totalVol: 628875.43,
    totalVolChange: 8.42,
    impliedFdv: 8.3e6,
    settleTime: null,
    status: 'live',
    chartDirection: 'down',
  },
  {
    id: '6',
    slug: 'mmt',
    name: 'MMT',
    symbol: 'MMT',
    protocol: 'Momentum',
    logoUrl: '/assets/tokens/era.png',
    chainLogoUrl: '/assets/tokens/chain-solana.png',
    chain: 'solana',
    lastPrice: 0.65,
    priceChange: 48.32,
    liqVol24h: 0,
    liqVolChange: -100,
    totalVol: 7244.16,
    totalVolChange: 0,
    impliedFdv: 9.1e6,
    settleTime: null,
    status: 'live',
    isNew: true,
    chartDirection: 'up',
  },
]

/* ── Recent Activities Data ────────────────────────────────────────── */

export const recentActivities: RecentActivity[] = [
  {
    id: '1',
    time: '1m ago',
    orderType: 'Filled',
    side: 'Sell',
    tokenName: 'GRASS',
    tokenLogoUrl: '/assets/tokens/grass.png',
    chainLogoUrl: '/assets/tokens/chain-solana.png',
    price: 0.0569,
    amount: 3.84e3,
    collateral: 100.0,
  },
  {
    id: '2',
    time: '5m ago',
    orderType: 'Filled',
    side: 'Sell',
    tokenName: 'GRASS',
    tokenLogoUrl: '/assets/tokens/grass.png',
    chainLogoUrl: '/assets/tokens/chain-solana.png',
    price: 0.055,
    amount: 18.16e3,
    collateral: 1.0e3,
  },
  {
    id: '3',
    time: '8m ago',
    orderType: 'Filled',
    side: 'Buy',
    tokenName: 'KA',
    tokenLogoUrl: '/assets/tokens/era.png',
    chainLogoUrl: '/assets/tokens/chain-ethereum.png',
    isVip: true,
    price: 0.119,
    amount: 4.2e3,
    collateral: 500.0,
  },
  {
    id: '4',
    time: '12m ago',
    orderType: 'Open',
    side: 'Buy',
    tokenName: 'PENGU',
    tokenLogoUrl: '/assets/tokens/skate.png',
    chainLogoUrl: '/assets/tokens/chain-solana.png',
    isVip: true,
    price: 0.005,
    amount: 85.25e3,
    collateral: 3.0,
  },
  {
    id: '5',
    time: '14m ago',
    orderType: 'Filled',
    side: 'Buy',
    tokenName: 'GRASS',
    tokenLogoUrl: '/assets/tokens/grass.png',
    chainLogoUrl: '/assets/tokens/chain-solana.png',
    price: 0.0686,
    amount: 3.83e3,
    collateral: 250.0,
  },
  {
    id: '6',
    time: '18m ago',
    orderType: 'Filled',
    side: 'Buy',
    tokenName: 'SKATE',
    tokenLogoUrl: '/assets/tokens/skate.png',
    chainLogoUrl: '/assets/tokens/chain-solana.png',
    price: 0.005,
    amount: 100.0e3,
    collateral: 500.0,
  },
  {
    id: '7',
    time: '30m ago',
    orderType: 'Open',
    side: 'Buy',
    tokenName: 'SKATE',
    tokenLogoUrl: '/assets/tokens/skate.png',
    chainLogoUrl: '/assets/tokens/chain-solana.png',
    price: 0.003,
    amount: 40.0e3,
    collateral: 200.0,
  },
  {
    id: '8',
    time: '42m ago',
    orderType: 'Filled',
    side: 'Buy',
    tokenName: 'SKATE',
    tokenLogoUrl: '/assets/tokens/skate.png',
    chainLogoUrl: '/assets/tokens/chain-solana.png',
    price: 0.0035,
    amount: 100.0e3,
    collateral: 500.0,
  },
  {
    id: '9',
    time: '1h ago',
    orderType: 'Filled',
    side: 'Buy',
    tokenName: 'SKATE',
    tokenLogoUrl: '/assets/tokens/skate.png',
    chainLogoUrl: '/assets/tokens/chain-solana.png',
    price: 0.0013,
    amount: 3.82e3,
    collateral: 0.0,
  },
  {
    id: '10',
    time: '1h ago',
    orderType: 'Filled',
    side: 'Buy',
    tokenName: 'SKATE',
    tokenLogoUrl: '/assets/tokens/skate.png',
    chainLogoUrl: '/assets/tokens/chain-solana.png',
    price: 0.0055,
    amount: 1.83e3,
    collateral: 100.0,
  },
]

/* ── Bottom Stats ──────────────────────────────────────────────────── */

export const bottomStats = {
  totalVol: 3375052.31,
  vol24h: 203155.4,
}
