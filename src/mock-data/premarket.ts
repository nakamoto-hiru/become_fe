export interface LiveMarketItem {
  id: string
  slug: string
  name: string
  symbol: string
  protocol: string
  logoUrl: string
  chainLogoUrl: string
  chain: 'solana' | 'ethereum'
  totalVolume: number
  volumeChange: number
  price: number
  priceChange: number
}

export interface UpcomingMarketItem {
  id: string
  slug: string
  name: string
  symbol: string
  protocol: string
  logoUrl: string
  chainLogoUrl: string
  chain: 'solana' | 'ethereum'
  backerCount: number
  backersExtra: number
  backerAvatarUrls: string[]
  watchers: number
}

export interface FaqItem {
  id: string
  question: string
  answer: string
}

export interface Step {
  number: string
  title: string
  description: string
}

export interface StatItem {
  value: string
  label: string
}

export const stats: StatItem[] = [
  { value: '330M+', label: 'Total pre-market volume' },
  { value: '200K+', label: 'Total users' },
  { value: '251',   label: 'Total token settled' },
  { value: '24',    label: 'Supported blockchain' },
]

export const liveMarkets: LiveMarketItem[] = [
  {
    id:           'skate',
    slug:         'skate',
    name:         'SKATE',
    symbol:       'SKATE',
    protocol:     'SKATEON',
    logoUrl:      '/assets/tokens/skate.png',
    chainLogoUrl: '/assets/tokens/chain-solana.png',
    chain:        'solana',
    totalVolume:  7375.62,
    volumeChange: -16.18,
    price:        0.3499,
    priceChange:  10.0,
  },
  {
    id:           'era',
    slug:         'era',
    name:         'ERA',
    symbol:       'ERA',
    protocol:     'Caldera',
    logoUrl:      '/assets/tokens/era.png',
    chainLogoUrl: '/assets/tokens/chain-ethereum.png',
    chain:        'ethereum',
    totalVolume:  11056.21,
    volumeChange: -16.18,
    price:        0.3499,
    priceChange:  10.0,
  },
  {
    id:           'grass',
    slug:         'grass',
    name:         'GRASS',
    symbol:       'GRASS',
    protocol:     'Grass',
    logoUrl:      '/assets/tokens/grass.png',
    chainLogoUrl: '/assets/tokens/chain-solana.png',
    chain:        'solana',
    totalVolume:  33768.12,
    volumeChange: -16.18,
    price:        0.3499,
    priceChange:  10.0,
  },
]

export const upcomingMarkets: UpcomingMarketItem[] = [
  {
    id:              'skate',
    slug:            'skate',
    name:            'SKATE',
    symbol:          'SKATE',
    protocol:        'SKATEON',
    logoUrl:         '/assets/tokens/skate.png',
    chainLogoUrl:    '/assets/tokens/chain-solana.png',
    chain:           'solana',
    backerCount:     5,
    backersExtra:    24,
    backerAvatarUrls: [
      '/assets/backers/backer-1.png',
      '/assets/backers/backer-2.png',
      '/assets/backers/backer-3.png',
      '/assets/backers/backer-4.png',
      '/assets/backers/backer-5.png',
    ],
    watchers:        4572,
  },
  {
    id:              'era',
    slug:            'era',
    name:            'ERA',
    symbol:          'ERA',
    protocol:        'Caldera',
    logoUrl:         '/assets/tokens/era.png',
    chainLogoUrl:    '/assets/tokens/chain-ethereum.png',
    chain:           'ethereum',
    backerCount:     4,
    backersExtra:    0,
    backerAvatarUrls: [
      '/assets/backers/backer-6.png',
      '/assets/backers/backer-7.png',
      '/assets/backers/backer-8.png',
      '/assets/backers/backer-9.png',
    ],
    watchers:        178622,
  },
  {
    id:              'grass',
    slug:            'grass',
    name:            'GRASS',
    symbol:          'GRASS',
    protocol:        'Grass',
    logoUrl:         '/assets/tokens/grass.png',
    chainLogoUrl:    '/assets/tokens/chain-solana.png',
    chain:           'solana',
    backerCount:     3,
    backersExtra:    0,
    backerAvatarUrls: [
      '/assets/backers/backer-6.png',
      '/assets/backers/backer-7.png',
      '/assets/backers/backer-8.png',
    ],
    watchers:        40964,
  },
]

export const faqItems: FaqItem[] = [
  {
    id: '1',
    question: 'What is premarket trading?',
    answer:
      'Premarket trading is an OTC (over-the-counter) service pioneered by Whales Market in the crypto market. It enables buyers and sellers to trade token allocations before official CEX listings.',
  },
  {
    id: '2',
    question: 'What are the advantages of pre-market trading?',
    answer:
      'Pre-market trading allows you to access tokens before they are listed on major exchanges, potentially at better prices. It provides early access to promising projects and allows for price discovery before official listings.',
  },
  {
    id: '3',
    question: 'How do I buy tokens on Whales Market?',
    answer:
      'Connect your wallet, browse the available tokens in the pre-market section, and place a buy order at your desired price. Once matched with a seller, commit your collateral to complete the trade.',
  },
  {
    id: '4',
    question: 'How do I sell tokens on Whales Market?',
    answer:
      'Connect your wallet and navigate to the pre-market section. Create a sell order with your desired price and quantity. When matched with a buyer, your tokens will be locked as collateral until settlement.',
  },
  {
    id: '5',
    question: 'When will i receive my tokens?',
    answer:
      "Tokens are delivered on the official settlement date (TGE — Token Generation Event). The exact date depends on the project's launch timeline.",
  },
  {
    id: '6',
    question: 'Is it safe to trade on Whales Market?',
    answer:
      'Yes, Whales Market uses smart contracts to secure all trades. Collateral is locked on-chain and automatically settled, ensuring no intermediaries can interfere with your trades.',
  },
  {
    id: '7',
    question: 'Which blockchains does Whales Market support for pre-market trading?',
    answer:
      'Whales Market currently supports 24 blockchains including Ethereum, Solana, Base, Arbitrum, and many more. The list is continuously growing.',
  },
]

export const buySteps: Step[] = [
  {
    number:      '01',
    title:       'Place a Buy Order',
    description: 'Create a new order or match an existing sell order.',
  },
  {
    number:      '02',
    title:       'Commit Your Collateral',
    description: 'Commit collateral based on your price and quantity.',
  },
  {
    number:      '03',
    title:       'Receive Tokens on Settlement',
    description:
      "On settlement date (token listing/TGE), receive the tokens. If the seller defaults, you receive the seller's collateral as compensation.",
  },
]

export const sellSteps: Step[] = [
  {
    number:      '01',
    title:       'Place a Sell Order',
    description: 'Create a new order or match an existing buy order.',
  },
  {
    number:      '02',
    title:       'Commit Your Collateral',
    description: 'Commit collateral based on your price and quantity.',
  },
  {
    number:      '03',
    title:       'Deliver on Settlement',
    description:
      "On settlement date (token listing/TGE), settle the tokens to the buyer. Receive your collateral back and buyer's collateral.",
  },
]
