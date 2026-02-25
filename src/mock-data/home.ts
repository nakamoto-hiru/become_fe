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
  createdAt?: number              // epoch ms — used for live relative time
  orderType: 'Filled' | 'Open'
  side: 'Buy' | 'Sell'
  tokenName: string
  tokenLogoUrl: string
  chainLogoUrl: string
  isRs?: boolean
  price: number
  amount: number
  collateral: number
  collateralTokenLogoUrl: string
  tier: 'shrimp' | 'fish' | 'dolphin' | 'shark' | 'whale'
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
    settleDate: new Date(Date.now() + 3.5 * 86_400_000).toISOString(),
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
    logoUrl: '/assets/tokens/skate-2.png',
    chainLogoUrl: '/assets/tokens/chain-solana.png',
    chain: 'solana',
    lastPrice: 0.119,
    priceChange: 63.8,
    liqVol24h: 445.86,
    liqVolChange: 1159.36,
    totalVol: 21904.26,
    totalVolChange: 19.12,
    impliedFdv: 48.3e3,
    settleTime: new Date(Date.now() + 18.6 * 3600_000).toISOString(),
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
    logoUrl: '/assets/tokens/loud.png',
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
    logoUrl: '/assets/tokens/mmt.png',
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
    price: 0.055,
    amount: 3.64e3,
    collateral: 200.0,
    collateralTokenLogoUrl: '/assets/tokens/usdc.svg',
    tier: 'fish',          // $200 → fish ($100–500)
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
    amount: 18.18e3,
    collateral: 1.0e3,
    collateralTokenLogoUrl: '/assets/tokens/usdc.svg',
    tier: 'shark',         // $1,000 → shark ($1K–5K)
  },
  {
    id: '3',
    time: '9m ago',
    orderType: 'Filled',
    side: 'Buy',
    tokenName: 'IKA',
    tokenLogoUrl: '/assets/tokens/era.png',
    chainLogoUrl: '/assets/tokens/chain-ethereum.png',
    isRs: true,
    price: 0.119,
    amount: 4.2e3,
    collateral: 500.0,
    collateralTokenLogoUrl: '/assets/tokens/usdt.svg',
    tier: 'dolphin',       // $500 → dolphin ($500–1K)
  },
  {
    id: '4',
    time: '12m ago',
    orderType: 'Open',
    side: 'Buy',
    tokenName: 'PENGU',
    tokenLogoUrl: '/assets/tokens/skate.png',
    chainLogoUrl: '/assets/tokens/chain-solana.png',
    isRs: true,
    price: 0.005,
    amount: 85.35e3,
    collateral: 3.0,
    collateralTokenLogoUrl: '/assets/tokens/usdc.svg',
    tier: 'shrimp',        // $3 → shrimp (< $100)
  },
  {
    id: '5',
    time: '14m ago',
    orderType: 'Filled',
    side: 'Buy',
    tokenName: 'GRASS',
    tokenLogoUrl: '/assets/tokens/grass.png',
    chainLogoUrl: '/assets/tokens/chain-solana.png',
    price: 0.069,
    amount: 3.62e3,
    collateral: 250.0,
    collateralTokenLogoUrl: '/assets/tokens/usdc.svg',
    tier: 'fish',          // $250 → fish ($100–500)
  },
  {
    id: '6',
    time: '16m ago',
    orderType: 'Filled',
    side: 'Buy',
    tokenName: 'SKATE',
    tokenLogoUrl: '/assets/tokens/skate.png',
    chainLogoUrl: '/assets/tokens/chain-solana.png',
    price: 0.005,
    amount: 100.0e3,
    collateral: 500.0,
    collateralTokenLogoUrl: '/assets/tokens/usdc.svg',
    tier: 'dolphin',       // $500 → dolphin ($500–1K)
  },
  {
    id: '7',
    time: '38m ago',
    orderType: 'Open',
    side: 'Buy',
    tokenName: 'SKATE',
    tokenLogoUrl: '/assets/tokens/skate.png',
    chainLogoUrl: '/assets/tokens/chain-solana.png',
    price: 0.005,
    amount: 40.0e3,
    collateral: 200.0,
    collateralTokenLogoUrl: '/assets/tokens/usdc.svg',
    tier: 'fish',          // $200 → fish ($100–500)
  },
  {
    id: '8',
    time: '42m ago',
    orderType: 'Filled',
    side: 'Buy',
    tokenName: 'SKATE',
    tokenLogoUrl: '/assets/tokens/skate.png',
    chainLogoUrl: '/assets/tokens/chain-solana.png',
    price: 0.005,
    amount: 100.0e3,
    collateral: 8.5e3,
    collateralTokenLogoUrl: '/assets/tokens/usdc.svg',
    tier: 'whale',         // $8,500 → whale (> $5K)
  },
  {
    id: '9',
    time: '1h ago',
    orderType: 'Filled',
    side: 'Buy',
    tokenName: 'SKATE',
    tokenLogoUrl: '/assets/tokens/skate.png',
    chainLogoUrl: '/assets/tokens/chain-solana.png',
    price: 0.0613,
    amount: 3.62e3,
    collateral: 50.0,
    collateralTokenLogoUrl: '/assets/tokens/usdc.svg',
    tier: 'shrimp',        // $50 → shrimp (< $100)
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
    amount: 1.82e3,
    collateral: 100.0,
    collateralTokenLogoUrl: '/assets/tokens/usdc.svg',
    tier: 'fish',          // $100 → fish ($100–500)
  },
]

/* ── Upcoming Market Types ────────────────────────────────────────── */

export interface UpcomingMarketItem {
  id: string
  slug: string
  name: string
  symbol: string
  protocol: string
  logoUrl: string
  chainLogoUrl: string
  chain: 'solana' | 'ethereum' | 'sui'
  watchers: number
  investorAvatars: string[]   // paths to backer avatar PNGs
  investorExtra: number       // "+N" count, 0 if none shown
  narratives: string[]        // e.g. ['GAMEFI', 'NFT']
  narrativeExtra: number      // "+24" extra count, 0 if none
  moniScore: number
  isNew?: boolean
}

/* Real backer images exported from Figma node 44194:82013 */
const B1 = '/assets/backers/backer-1.png' // Ellipse3
const B2 = '/assets/backers/backer-2.png' // Ellipse4
const B3 = '/assets/backers/backer-3.png' // Ellipse5
const B4 = '/assets/backers/backer-4.png' // Ellipse6
const B5 = '/assets/backers/backer-5.png' // Ellipse7

/* ── Upcoming Market Data — Figma node 44194:81995 ───────────────── */

export const upcomingMarketItems: UpcomingMarketItem[] = [
  {
    id: 'u1',
    slug: 'skate-upcoming',
    name: 'SKATE',
    symbol: 'SKATE',
    protocol: 'SKATEON',
    logoUrl: '/assets/tokens/skate.png',
    chainLogoUrl: '/assets/tokens/chain-solana.png',
    chain: 'solana',
    watchers: 4572,
    investorAvatars: [B1, B2, B3, B4, B5],
    investorExtra: 24,
    narratives: ['GAMEFI', 'NFT'],
    narrativeExtra: 24,
    moniScore: 10844,
  },
  {
    id: 'u2',
    slug: 'shake-upcoming',
    name: 'SKATE',
    symbol: 'SKATE',
    protocol: 'Skate Chain',
    logoUrl: '/assets/tokens/skate-2.png',
    chainLogoUrl: '/assets/tokens/chain-solana.png',
    chain: 'solana',
    watchers: 2381,
    investorAvatars: [],
    investorExtra: 0,
    narratives: ['GAMEFI', 'NFT'],
    narrativeExtra: 0,
    moniScore: 24396,
  },
  {
    id: 'u3',
    slug: 'era-upcoming',
    name: 'ERA',
    symbol: 'ERA',
    protocol: 'Caldera',
    logoUrl: '/assets/tokens/era.png',
    chainLogoUrl: '/assets/tokens/chain-ethereum.png',
    chain: 'ethereum',
    watchers: 7215,
    investorAvatars: [B2, B3, B1, B5],
    investorExtra: 0,
    narratives: [],
    narrativeExtra: 0,
    moniScore: 11732,
  },
  {
    id: 'u4',
    slug: 'grass-upcoming',
    name: 'GRASS',
    symbol: 'GRASS',
    protocol: 'Grass',
    logoUrl: '/assets/tokens/grass.png',
    chainLogoUrl: '/assets/tokens/chain-solana.png',
    chain: 'solana',
    watchers: 5893,
    investorAvatars: [B4, B5, B3, B1, B2],
    investorExtra: 16,
    narratives: ['GAMEFI'],
    narrativeExtra: 0,
    moniScore: 18283,
  },
  {
    id: 'u5',
    slug: 'loud-upcoming',
    name: 'LOUD',
    symbol: 'LOUD',
    protocol: 'Loud',
    logoUrl: '/assets/tokens/loud.png',
    chainLogoUrl: '/assets/tokens/chain-solana.png',
    chain: 'solana',
    watchers: 1847,
    investorAvatars: [B3, B1, B2, B4, B5],
    investorExtra: 27,
    narratives: ['GAMEFI', 'NFT'],
    narrativeExtra: 0,
    moniScore: 32195,
  },
  {
    id: 'u6',
    slug: 'mmt-upcoming',
    name: 'MMT',
    symbol: 'MMT',
    protocol: 'Momentum',
    logoUrl: '/assets/tokens/mmt.png',
    chainLogoUrl: '/assets/tokens/chain-sui.svg',
    chain: 'sui',
    watchers: 3164,
    investorAvatars: [B2, B3, B1],
    investorExtra: 0,
    narratives: ['GAMEFI', 'NFT'],
    narrativeExtra: 0,
    moniScore: 14572,
    isNew: true,
  },
]

/* ── Ended Market Types ──────────────────────────────────────────── */

export interface EndedMarketItem {
  id: string
  slug: string
  name: string
  symbol: string
  protocol: string
  logoUrl: string
  chainLogoUrl: string
  chain: 'solana' | 'ethereum' | 'sui' | 'hyperliquid' | 'bnb'
  lastPrice: number
  totalVol: number
  settleStartTime: string | null  // ISO string, null = TBA
  settleEndTime: string | null    // ISO string, null = TBA
  isSettling?: boolean            // true = show countdown for settleEnd
}

/* ── Ended Market Data — Figma node 42540:728797 ───────────────────── */

export const endedMarketItems: EndedMarketItem[] = [
  {
    id: 'e1', slug: 'skate-ended', name: 'SKATE', symbol: 'SKATE', protocol: 'SKATEON',
    logoUrl: '/assets/tokens/skate.png', chainLogoUrl: '/assets/tokens/chain-solana.png', chain: 'solana',
    lastPrice: 0.055, totalVol: 25197.18,
    settleStartTime: '2025-05-30T13:00:00Z',
    settleEndTime: new Date(Date.now() + 3.3 * 3600_000).toISOString(),
    isSettling: true,
  },
  {
    id: 'e2', slug: 'skate2-ended', name: 'SKATE', symbol: 'SKATE', protocol: 'Skate Chain',
    logoUrl: '/assets/tokens/skate-2.png', chainLogoUrl: '/assets/tokens/chain-solana.png', chain: 'solana',
    lastPrice: 0.119, totalVol: 21904.26,
    settleStartTime: '2025-06-10T15:00:00Z', settleEndTime: '2025-06-10T19:00:00Z',
  },
  {
    id: 'e3', slug: 'era-ended', name: 'ERA', symbol: 'ERA', protocol: 'Caldera',
    logoUrl: '/assets/tokens/era.png', chainLogoUrl: '/assets/tokens/chain-ethereum.png', chain: 'ethereum',
    lastPrice: 0.0464, totalVol: 7483875.48,
    settleStartTime: null, settleEndTime: null,
  },
  {
    id: 'e4', slug: 'grass-ended', name: 'GRASS', symbol: 'GRASS', protocol: 'Grass',
    logoUrl: '/assets/tokens/grass.png', chainLogoUrl: '/assets/tokens/chain-solana.png', chain: 'solana',
    lastPrice: 0.11, totalVol: 64110.29,
    settleStartTime: null, settleEndTime: null,
  },
  {
    id: 'e5', slug: 'loud-ended', name: 'LOUD', symbol: 'LOUD', protocol: 'Loud',
    logoUrl: '/assets/tokens/loud.png', chainLogoUrl: '/assets/tokens/chain-solana.png', chain: 'solana',
    lastPrice: 0.9638, totalVol: 628875.43,
    settleStartTime: null, settleEndTime: null,
  },
  {
    id: 'e6', slug: 'mmt-ended', name: 'MMT', symbol: 'MMT', protocol: 'Momentum',
    logoUrl: '/assets/tokens/mmt.png', chainLogoUrl: '/assets/tokens/chain-sui.svg', chain: 'sui',
    lastPrice: 0.65, totalVol: 7244.16,
    settleStartTime: null, settleEndTime: null,
  },
  {
    id: 'e7', slug: 'pengu-ended', name: 'PENGU', symbol: 'PENGU', protocol: 'Pudgy Penguins',
    logoUrl: '/assets/tokens/skate.png', chainLogoUrl: '/assets/tokens/chain-ethereum.png', chain: 'ethereum',
    lastPrice: 0.012, totalVol: 1234567.89,
    settleStartTime: '2025-06-15T14:00:00Z', settleEndTime: '2025-06-15T18:00:00Z',
  },
  {
    id: 'e8', slug: 'jup-ended', name: 'JUP', symbol: 'JUP', protocol: 'Jupiter',
    logoUrl: '/assets/tokens/grass.png', chainLogoUrl: '/assets/tokens/chain-solana.png', chain: 'solana',
    lastPrice: 1.24, totalVol: 2345678.90,
    settleStartTime: '2025-06-20T10:00:00Z', settleEndTime: '2025-06-20T14:00:00Z',
  },
  {
    id: 'e9', slug: 'ondo-ended', name: 'ONDO', symbol: 'ONDO', protocol: 'Ondo Finance',
    logoUrl: '/assets/tokens/era.png', chainLogoUrl: '/assets/tokens/chain-ethereum.png', chain: 'ethereum',
    lastPrice: 0.87, totalVol: 567890.12,
    settleStartTime: null, settleEndTime: null,
  },
  {
    id: 'e10', slug: 'wen-ended', name: 'WEN', symbol: 'WEN', protocol: 'Wen',
    logoUrl: '/assets/tokens/loud.png', chainLogoUrl: '/assets/tokens/chain-solana.png', chain: 'solana',
    lastPrice: 0.00034, totalVol: 89456.78,
    settleStartTime: null, settleEndTime: null,
  },
]

/* ── Network filter options ────────────────────────────────────────── */

/** Uses same icon sources as navbar chain selector (chains.ts) for consistency */
const chainIcon = (slug: string) => `https://icons.llamao.fi/icons/chains/rsz_${slug}`

export const NETWORK_OPTIONS = [
  { id: 'all', label: 'All', logoUrl: null },
  { id: 'solana', label: 'Solana', logoUrl: chainIcon('solana') },
  { id: 'ethereum', label: 'Ethereum', logoUrl: chainIcon('ethereum') },
  { id: 'hyperliquid', label: 'Hyperliquid', logoUrl: chainIcon('hyperliquid') },
  { id: 'bnb', label: 'BNB Chain', logoUrl: '/assets/chains/chain-bnb.png' },
] as const

/* ── Bottom Stats ──────────────────────────────────────────────────── */

export const bottomStats = {
  totalVol: 3375052.31,
  vol24h: 203155.4,
}
