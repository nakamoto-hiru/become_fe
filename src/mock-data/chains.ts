/**
 * Chain mock data — 24 networks supported by Whales Market
 * Icons sourced from DeFiLlama CDN (icons.llamao.fi)
 */

export interface Chain {
  id:   string
  name: string
  icon: string
}

/** Helper — DeFiLlama chain icon CDN */
const llama = (slug: string) =>
  `https://icons.llamao.fi/icons/chains/rsz_${slug}`

export const CHAINS: Chain[] = [
  { id: 'bsc',         name: 'BNB',           icon: '/assets/chains/chain-bnb.png' },
  { id: 'ethereum',    name: 'Ethereum',      icon: llama('ethereum') },
  { id: 'solana',      name: 'Solana',        icon: llama('solana') },
  { id: 'base',        name: 'Base',          icon: llama('base') },
  { id: 'arbitrum',    name: 'Arbitrum',      icon: llama('arbitrum') },
  { id: 'abstract',    name: 'Abstract',      icon: llama('abstract') },
  { id: 'aptos',       name: 'Aptos',         icon: llama('aptos') },
  { id: 'avax',        name: 'AVAX',          icon: '/assets/chains/chain-avax.png' },
  { id: 'berachain',   name: 'Bera',          icon: llama('berachain') },
  { id: 'blast',       name: 'Blast',         icon: llama('blast') },
  { id: 'hyperliquid', name: 'HyperEVM',      icon: llama('hyperliquid') },
  { id: 'kinto',       name: 'Kinto',         icon: llama('kinto') },
  { id: 'linea',       name: 'Linea',         icon: llama('linea') },
  { id: 'manta',       name: 'Manta Pacific', icon: llama('manta') },
  { id: 'merlin',      name: 'Merlin',        icon: llama('merlin') },
  { id: 'mode',        name: 'Mode',          icon: llama('mode') },
  { id: 'monad',       name: 'Monad',         icon: llama('monad') },
  { id: 'morph',       name: 'Morph',         icon: llama('morph') },
  { id: 'optimism',    name: 'Optimism',      icon: llama('optimism') },
  { id: 'scroll',      name: 'Scroll',        icon: llama('scroll') },
  { id: 'sonic',       name: 'Sonic',         icon: llama('sonic') },
  { id: 'starknet',    name: 'Starknet',      icon: llama('starknet') },
  { id: 'sui',         name: 'SUI',           icon: llama('sui') },
  { id: 'taiko',       name: 'Taiko',         icon: llama('taiko') },
]
