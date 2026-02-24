/**
 * ConnectWalletModal — Whales Market Connect Wallet Dialog
 * Figma: node 39380:377032
 *
 * Extracted specs:
 *  - Dialog:       bg-bg-02 (#1b1b1c), p-24, radius-5xl (24px), shadow 0 0 32px rgba(0,0,0,0.2)
 *  - Header:       h-36, title 18px/medium/text-01 centered, close btn p-2 radius-full
 *  - Network tabs: border border-border-02 radius-xl (10px) p-1, active bg-bg-04, inactive opacity-40
 *  - Wallet list:  flex-wrap gap-16, each item w-[calc(50%-8px)] border p-16 gap-16 radius-2xl (12px)
 *  - Wallet icon:  size-36 radius-lg (8px)
 *  - Wallet name:  16px/medium/text-01 flex-1
 *  - Install btn:  bg-bg-01 px-12 py-6 radius-md (6px) text-12px/medium
 */

import { useState, useEffect } from 'react'
import { CloseFill } from '@mingcute/react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface NetworkDef {
  id:   string
  name: string
  icon: string
}

interface WalletDef {
  id:        string
  name:      string
  icon:      string   // path to /assets/wallets/*.svg|png
  bgColor:   string   // fallback bg while image loads
  installed: boolean
}

// ─── Mock data ────────────────────────────────────────────────────────────────

// Same CDN source as mock-data/chains.ts — one icon per chain, consistent everywhere
const llama = (slug: string) => `https://icons.llamao.fi/icons/chains/rsz_${slug}`

const NETWORKS: NetworkDef[] = [
  { id: 'solana',   name: 'Solana',   icon: llama('solana')   },
  { id: 'ethereum', name: 'Ethereum', icon: llama('ethereum') },
  { id: 'bsc',      name: 'BNB',      icon: '/assets/chains/chain-bnb.png' },
  { id: 'arbitrum', name: 'Arbitrum', icon: llama('arbitrum') },
  { id: 'base',     name: 'Base',     icon: llama('base')     },
  { id: 'avax',     name: 'AVAX',     icon: '/assets/chains/chain-avax.png' },
]

const WALLETS_SOLANA: WalletDef[] = [
  { id: 'phantom',  name: 'Phantom',      icon: '/assets/wallets/phantom.svg',  bgColor: '#4e44ce', installed: true  },
  { id: 'solflare', name: 'Solflare',     icon: '/assets/wallets/solflare.svg', bgColor: '#fc662b', installed: true  },
  { id: 'backpack', name: 'Backpack',     icon: '/assets/wallets/backpack.svg', bgColor: '#e33b3b', installed: false },
  { id: 'glow',     name: 'Glow Wallet', icon: '/assets/wallets/glow.svg',     bgColor: '#2dd4bf', installed: false },
  { id: 'slope',    name: 'Slope',       icon: '/assets/wallets/slope.svg',    bgColor: '#6c5ce7', installed: false },
]

const WALLETS_EVM: WalletDef[] = [
  { id: 'metamask', name: 'MetaMask',        icon: '/assets/wallets/metamask.svg',      bgColor: '#f6851b', installed: true  },
  { id: 'wc',       name: 'WalletConnect',   icon: '/assets/wallets/walletconnect.svg', bgColor: '#3b99fc', installed: true  },
  { id: 'coinbase', name: 'Coinbase Wallet', icon: '/assets/wallets/coinbase.svg',      bgColor: '#0052ff', installed: false },
  { id: 'rabby',    name: 'Rabby Wallet',    icon: '/assets/wallets/rabby.svg',         bgColor: '#7b61ff', installed: false },
  { id: 'okx',      name: 'OKX Wallet',      icon: '/assets/wallets/okx.svg',           bgColor: '#111111', installed: false },
]

function getWallets(networkId: string): WalletDef[] {
  return networkId === 'solana' ? WALLETS_SOLANA : WALLETS_EVM
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12" cy="12" r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray="56.5"
        strokeDashoffset="42"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ─── ConnectWalletModal ───────────────────────────────────────────────────────

export interface ConnectWalletModalProps {
  onClose:           () => void
  onConnect:         (networkId: string) => void  // passes back the selected network
  initialNetworkId?: string   // pre-select this network tab when modal opens
}

export default function ConnectWalletModal({ onClose, onConnect, initialNetworkId }: ConnectWalletModalProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkDef>(
    () => NETWORKS.find((n) => n.id === initialNetworkId) ?? NETWORKS[0],
  )
  const [connectingId, setConnectingId]       = useState<string | null>(null)
  // ── Slide direction for wallet grid transition ────────────────────────────
  const [slideDir,  setSlideDir]  = useState<'left' | 'right'>('right')
  const [walletKey, setWalletKey] = useState(0)   // bump to remount & replay animation

  // ── Close on Escape ──────────────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !connectingId) onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose, connectingId])

  // ── Lock body scroll ─────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // ── Wallet click → simulate connect ─────────────────────────────────────
  async function handleWalletClick(wallet: WalletDef) {
    if (connectingId) return
    setConnectingId(wallet.id)
    await new Promise<void>((resolve) => setTimeout(resolve, 800 + Math.random() * 400))
    onConnect(selectedNetwork.id)
  }

  function handleNetworkSelect(network: NetworkDef) {
    if (network.id === selectedNetwork.id) return
    const currentIdx = NETWORKS.findIndex((n) => n.id === selectedNetwork.id)
    const nextIdx    = NETWORKS.findIndex((n) => n.id === network.id)
    setSlideDir(nextIdx > currentIdx ? 'right' : 'left')
    setWalletKey((k) => k + 1)
    setSelectedNetwork(network)
    setConnectingId(null)
  }

  const wallets = getWallets(selectedNetwork.id)

  return (
    // ── Backdrop ──────────────────────────────────────────────────────────
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-200"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !connectingId) onClose() }}
    >
      {/* ── Dialog ───────────────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Connect Wallet"
        className={cn(
          'relative flex flex-col gap-6 w-full max-w-[672px]',
          'bg-[var(--wm-bg-02)] rounded-[var(--radius-5xl,24px)]',
          'p-6 shadow-[0_0_32px_rgba(0,0,0,0.2)]',
          'animate-in fade-in zoom-in-95 duration-200',
        )}
      >

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="relative flex items-center justify-center h-9 shrink-0">
          <h2
            className="text-lg font-medium leading-7 text-[var(--wm-text-01)]"
            style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
          >
            Connect Wallet
          </h2>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            disabled={!!connectingId}
            className={cn(
              'absolute right-0 top-1/2 -translate-y-1/2',
              'flex items-center justify-center p-2',
              'bg-[var(--wm-bg-03)] rounded-full',
              'hover:bg-[var(--wm-bg-04)] active:bg-[var(--wm-bg-04)]',
              'transition-colors duration-150 cursor-pointer outline-none',
              'disabled:opacity-30 disabled:cursor-not-allowed',
            )}
          >
            <CloseFill className="size-4 text-[var(--wm-icon-03)]" />
          </button>
        </div>

        {/* ── Body ────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6 items-center w-full">

          {/* Network selector tabs */}
          <div className="flex items-center w-full border border-[var(--wm-border-02)] rounded-[var(--radius-xl,10px)] p-1 gap-1">
            {NETWORKS.map((network) => {
              const isActive = network.id === selectedNetwork.id
              return (
                <button
                  key={network.id}
                  onClick={() => handleNetworkSelect(network)}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2',
                    'h-11 px-3 py-3 rounded-[var(--radius-lg,8px)]',
                    'text-sm font-medium text-[var(--wm-text-01)]',
                    'transition-all duration-150 cursor-pointer outline-none',
                    isActive
                      ? 'bg-[var(--wm-bg-04)]'
                      : 'opacity-40 hover:opacity-60',
                  )}
                >
                  <img
                    src={network.icon}
                    alt={network.name}
                    className="size-5 rounded-[var(--radius-sm,4px)] object-cover shrink-0"
                  />
                  <span>{network.name}</span>
                </button>
              )
            })}
          </div>

          {/* Wallet section */}
          <div className="flex flex-col gap-4 w-full overflow-hidden">

            {/* Title row */}
            <div className="flex items-center justify-between shrink-0">
              <p className="text-sm font-medium text-[var(--wm-text-03)]">Choose Wallet</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--wm-text-green)]">
                  Selected to {selectedNetwork.name}
                </span>
                <img
                  src={selectedNetwork.icon}
                  alt=""
                  className="size-4 rounded-[var(--radius-sm,4px)] object-cover shrink-0"
                />
              </div>
            </div>

            {/* Wallet items — 2-column grid (slides on network switch) */}
            <div
              key={walletKey}
              className={cn(
                'flex flex-wrap gap-4',
                slideDir === 'right'
                  ? 'animate-in slide-in-from-right-4 fade-in duration-200'
                  : 'animate-in slide-in-from-left-4 fade-in duration-200',
              )}
            >
              {wallets.map((wallet) => {
                const isConnecting = connectingId === wallet.id
                const isOther      = !!connectingId && !isConnecting

                return (
                  <button
                    key={wallet.id}
                    onClick={() => handleWalletClick(wallet)}
                    disabled={!!connectingId}
                    className={cn(
                      'group flex items-center gap-4 p-4 text-left',
                      'w-[calc(50%-8px)]',
                      'border rounded-[var(--radius-2xl,12px)]',
                      'transition-all duration-150 cursor-pointer outline-none',
                      isConnecting
                        ? 'border-[var(--wm-border-primary-muted)] bg-[var(--wm-bg-primary-muted-5)]'
                        : 'border-[var(--wm-border-02)] hover:border-[var(--wm-border-03)] hover:bg-[var(--wm-bg-03)]',
                      isOther && 'opacity-40',
                      connectingId && 'cursor-default',
                    )}
                  >
                    {/* Wallet icon — real logo image */}
                    <div
                      className="size-9 rounded-[var(--radius-lg,8px)] shrink-0 overflow-hidden flex items-center justify-center select-none"
                      style={{ backgroundColor: wallet.bgColor }}
                    >
                      <img
                        src={wallet.icon}
                        alt={wallet.name}
                        draggable="false"
                        className="size-full object-cover"
                        onError={(e) => {
                          // Fallback: hide img on error (bgColor shows through)
                          ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>

                    {/* Wallet name */}
                    <span
                      className={cn(
                        'flex-1 text-base font-medium text-left leading-6',
                        isConnecting ? 'text-[var(--wm-text-green)]' : 'text-[var(--wm-text-01)]',
                      )}
                      style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
                    >
                      {isConnecting ? 'Connecting…' : wallet.name}
                    </span>

                    {/* Install badge */}
                    {!wallet.installed && !connectingId && (
                      <span className="px-3 py-1.5 rounded-[var(--radius-md,6px)] bg-[var(--wm-bg-03)] text-xs font-medium text-[var(--wm-text-03)] shrink-0 whitespace-nowrap group-hover:bg-[var(--wm-bg-01)] group-hover:text-[var(--wm-text-01)] transition-colors transition-all duration-150">
                        Install
                      </span>
                    )}

                    {/* Connecting spinner */}
                    {isConnecting && (
                      <Spinner className="size-5 text-[var(--wm-text-green)] shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
