import { useEffect, useRef, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useAccount, useBalance, useConnect, useDisconnect, useSwitchChain, type Connector } from 'wagmi'
import { polygon } from 'wagmi/chains'
import { formatUnits } from 'viem'
import { useIsMobile } from '../../hooks/mobile'
import { SOLANA_NETWORKS } from '../../constants/solana'
import { useENSResolution } from '../../hooks/web3/useENSResolution'
import { useGasPrice } from '../../hooks/web3/useGasPrice'
import { useNetworkContext } from '../../hooks/web3/useNetworkContext'
import { useSolanaWallet } from '../../hooks/web3/useSolanaWallet'

type WalletConnectProps = {
  className?: string
}

function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatBalanceLabel(value: bigint | undefined, decimals: number | undefined, symbol: string | undefined) {
  if (!value || decimals === undefined) {
    return `0.0000 ${symbol || 'POL'}`
  }

  const formatted = formatUnits(value, decimals)
  const [whole, fraction = ''] = formatted.split('.')
  return `${whole}.${fraction.padEnd(4, '0').slice(0, 4)} ${symbol || 'POL'}`
}

export default function WalletConnect({ className = '' }: WalletConnectProps) {
  const isMobile = useIsMobile()
  const { setVisible: setSolanaModalVisible } = useWalletModal()
  const { address, chain, isConnected } = useAccount()
  const { connectAsync, connectors, isPending } = useConnect()
  const { disconnect: disconnectEvm } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const { ensName } = useENSResolution(address)
  const { gasPrice, gasLevel } = useGasPrice()

  const {
    publicKey,
    wallet,
    wallets,
    disconnect: disconnectSolana,
  } = useWallet()

  const solanaWallet = useSolanaWallet()
  const {
    activeNetwork,
    setActiveNetwork,
    solanaNetwork,
  } = useNetworkContext()

  const [showDropdown, setShowDropdown] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [activeTab, setActiveTab] = useState<'evm' | 'solana'>(activeNetwork)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const { data: balance } = useBalance({
    address,
    query: {
      enabled: Boolean(address && isConnected),
      staleTime: 120000,
      gcTime: 300000,
    },
  })

  useEffect(() => {
    if (!showDropdown && !isClosing) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (buttonRef.current?.contains(target) || dropdownRef.current?.contains(target)) {
        return
      }

      setIsClosing(true)
      setTimeout(() => {
        setShowDropdown(false)
        setIsClosing(false)
      }, 300)
    }

    document.addEventListener('mousedown', handleClickOutside, true)
    return () => document.removeEventListener('mousedown', handleClickOutside, true)
  }, [showDropdown, isClosing])

  useEffect(() => {
    if (publicKey && !address) {
      setActiveNetwork('solana')
      setActiveTab('solana')
      setShowDropdown(false)
      setConnectionError(null)
    } else if (address && !publicKey) {
      setActiveNetwork('evm')
      setActiveTab('evm')
      setShowDropdown(false)
      setConnectionError(null)
    }
  }, [address, publicKey, setActiveNetwork])

  const closeDropdown = () => {
    setIsClosing(true)
    setTimeout(() => {
      setShowDropdown(false)
      setIsClosing(false)
    }, 300)
  }

  const getConnectorKey = (connector: Connector) => {
    const haystack = `${connector.id} ${connector.name}`.toLowerCase()
    if (haystack.includes('metamask')) return 'metamask'
    if (haystack.includes('walletconnect')) return 'walletconnect'
    if (haystack.includes('okx')) return 'okx'
    if (haystack.includes('injected')) return 'browser'
    return 'wallet'
  }

  const getConnectorSubtitle = (connector: Connector) => {
    switch (getConnectorKey(connector)) {
      case 'metamask':
        return 'MetaMask extension or mobile'
      case 'walletconnect':
        return 'Open QR modal for mobile and desktop wallets'
      case 'okx':
        return 'OKX Wallet extension'
      case 'browser':
        return 'Injected browser wallet'
      default:
        return 'EVM wallet connector'
    }
  }

  const getGasTone = () => {
    if (gasLevel === 'low') return 'text-green-400 border-green-500/20 bg-green-500/10'
    if (gasLevel === 'high') return 'text-red-400 border-red-500/20 bg-red-500/10'
    return 'text-amber-300 border-amber-500/20 bg-amber-500/10'
  }

  const handleConnectEvm = async (connector: Connector) => {
    try {
      setConnectionError(null)
      closeDropdown()
      await connectAsync({ connector })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (message.toLowerCase().includes('reject') || message.toLowerCase().includes('denied')) {
        setConnectionError('You cancelled the EVM wallet connection.')
        return
      }
      setConnectionError('Failed to connect the EVM wallet. Try another connector.')
    }
  }

  const handleOpenSolanaModal = () => {
    setConnectionError(null)
    closeDropdown()
    setTimeout(() => setSolanaModalVisible(true), 120)
  }

  const connectedLabel = activeTab === 'solana' && publicKey
    ? formatAddress(publicKey.toBase58())
    : address
      ? (ensName || formatAddress(address))
      : 'Connect Wallet'

  const solanaWalletNames = wallets
    .filter((item) => item.readyState === 'Installed' || item.readyState === 'Loadable')
    .map((item) => item.adapter.name)

  return (
    <div className={`relative ${className}`.trim()}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setActiveTab(activeNetwork)
          setShowDropdown((current) => !current)
        }}
        className={`transition-all duration-300 ${
          isConnected || publicKey
            ? 'flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/40 px-5 py-2 shadow-xl hover:border-cyan-400/35'
            : 'btn-primary jersey-20-regular w-full whitespace-nowrap rounded-xl px-6 py-2.5 text-lg'
        }`}
      >
        {isConnected || publicKey ? (
          <>
            <div className="flex min-w-0 flex-col items-start">
              <span className="jersey-15-regular mb-1 text-[10px] uppercase tracking-[0.22em] text-cyan-300/70">
                {activeTab === 'solana' ? 'Solana Wallet' : 'Polygon Wallet'}
              </span>
              <span className="jersey-20-regular truncate text-lg leading-none text-white">
                {connectedLabel}
              </span>
            </div>
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.85)]" />
          </>
        ) : (
          'Connect Wallet'
        )}
      </button>

      {showDropdown && (
        <>
          {isMobile && (
            <div
              className={`wallet-backdrop-${isClosing ? 'exit' : 'enter'} fixed inset-0 z-40 bg-black/70 backdrop-blur-sm`}
              onClick={closeDropdown}
            />
          )}

          <div
            ref={dropdownRef}
            className={`wallet-dropdown-${isClosing ? 'exit' : 'enter'} absolute z-[999] overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent ${
              isMobile
                ? 'fixed bottom-0 left-0 right-0 max-h-[92vh] rounded-t-[2rem] bg-[#050505] pb-safe-bottom shadow-2xl'
                : 'right-0 mt-3 w-[430px] rounded-[1.75rem] border border-white/10 bg-[#050505] shadow-[0_24px_56px_rgba(0,0,0,0.55)]'
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            {isMobile && (
              <div className="flex justify-center pb-1 pt-3">
                <div className="h-1.5 w-12 rounded-full bg-white/10" />
              </div>
            )}

            <div className={`${isMobile ? 'px-6 pt-2' : 'p-5'} border-b border-white/5 bg-gradient-to-b from-slate-900/80 to-transparent`}>
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="jersey-15-regular text-3xl uppercase italic tracking-tight text-white">Multichain Hub</p>
                  <p className="jersey-15-regular mt-1 text-xl uppercase tracking-[0.26em] text-cyan-300/55">Manage Polygon + Solana</p>
                </div>
                {isMobile && (
                  <button
                    type="button"
                    onClick={closeDropdown}
                    className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="flex gap-1 rounded-2xl border border-white/5 bg-black/60 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('evm')
                    setActiveNetwork('evm')
                  }}
                  className={`jersey-20-regular flex-1 rounded-xl px-4 py-3 text-lg transition ${
                    activeTab === 'evm'
                      ? 'bg-white/10 text-white shadow-[0_0_18px_rgba(255,255,255,0.06)]'
                      : 'text-white/35 hover:text-white/70'
                  }`}
                >
                  Polygon
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('solana')
                    setActiveNetwork('solana')
                  }}
                  className={`jersey-20-regular flex-1 rounded-xl px-4 py-3 text-lg transition ${
                    activeTab === 'solana'
                      ? 'bg-white/10 text-white shadow-[0_0_18px_rgba(255,255,255,0.06)]'
                      : 'text-white/35 hover:text-white/70'
                  }`}
                >
                  Solana
                </button>
              </div>
            </div>

            <div className={`${isMobile ? 'p-6' : 'p-5'} space-y-4`}>
              {connectionError && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-200">
                  {connectionError}
                </div>
              )}

              {activeTab === 'evm' && (
                <>
                  {isConnected && address ? (
                    <>
                      <div className="rounded-2xl border border-purple-500/15 bg-gradient-to-br from-purple-500/10 to-cyan-500/5 p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-white/45">Balance</p>
                        <p className="mt-2 text-3xl font-semibold text-white">
                          {formatBalanceLabel(balance?.value, balance?.decimals, balance?.symbol || chain?.nativeCurrency?.symbol)}
                        </p>
                        <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3">
                          {ensName && <p className="mb-1 text-sm text-cyan-300">{ensName}</p>}
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate font-mono text-xs text-white/70">{address}</p>
                            <button
                              type="button"
                              onClick={() => navigator.clipboard.writeText(address)}
                              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-cyan-300 transition hover:bg-white/10"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-blue-500/15 bg-blue-500/5 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-white/45">Network</p>
                            <p className="mt-1 text-sm font-semibold text-white">{chain?.name || 'Unknown network'}</p>
                          </div>
                          {chain?.id !== polygon.id && (
                            <button
                              type="button"
                              onClick={() => switchChain({ chainId: polygon.id })}
                              className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-400"
                            >
                              Switch To Polygon
                            </button>
                          )}
                        </div>
                      </div>

                      <div className={`rounded-2xl border p-4 ${getGasTone()}`}>
                        <p className="text-xs uppercase tracking-[0.22em] text-white/45">Network Congestion</p>
                        <div className="mt-2 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold">{gasPrice ? `${(Number(gasPrice) / 1e9).toFixed(2)} Gwei` : 'N/A'}</p>
                          </div>
                          <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
                            {gasLevel}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          disconnectEvm()
                          closeDropdown()
                        }}
                        className="w-full rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-left text-sm font-semibold text-red-300 transition hover:bg-red-500/15"
                      >
                        Disconnect Polygon Wallet
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="rounded-2xl border border-white/8 bg-white/5 p-4 text-sm text-white/65">
                        Choose an EVM wallet to connect on Polygon.
                      </div>

                      {connectors.map((connector) => {
                        const disabled = getConnectorKey(connector) === 'walletconnect' && !import.meta.env.VITE_WALLETCONNECT_PROJECT_ID
                        return (
                          <button
                            key={connector.uid}
                            type="button"
                            disabled={disabled || isPending}
                            onClick={() => handleConnectEvm(connector)}
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-white">{connector.name}</p>
                                <p className="mt-1 text-xs text-white/45">{disabled ? 'WalletConnect Project ID missing' : getConnectorSubtitle(connector)}</p>
                              </div>
                              <span className="text-xs uppercase tracking-[0.18em] text-cyan-300/70">EVM</span>
                            </div>
                          </button>
                        )
                      })}
                    </>
                  )}
                </>
              )}

              {activeTab === 'solana' && (
                <>
                  {publicKey ? (
                    <>
                      <div className="rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-white/45">Balance</p>
                        <p className="mt-2 text-3xl font-semibold text-white">
                          {solanaWallet.balance !== null ? `${solanaWallet.balance.toFixed(4)} SOL` : 'Loading...'}
                        </p>
                        <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3">
                          <p className="mb-1 text-sm text-cyan-300">{wallet?.adapter.name || 'Solana Wallet'}</p>
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate font-mono text-xs text-white/70">{publicKey.toBase58()}</p>
                            <button
                              type="button"
                              onClick={() => navigator.clipboard.writeText(publicKey.toBase58())}
                              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-cyan-300 transition hover:bg-white/10"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-white/45">Network</p>
                        <p className="mt-2 text-sm font-semibold text-white">
                          {SOLANA_NETWORKS[solanaNetwork].label}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          await disconnectSolana()
                          closeDropdown()
                        }}
                        className="w-full rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-left text-sm font-semibold text-red-300 transition hover:bg-red-500/15"
                      >
                        Disconnect Solana Wallet
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="rounded-2xl border border-white/8 bg-white/5 p-4 text-sm text-white/65">
                        Open the Solana wallet modal to connect Phantom, Solflare, Trust Wallet or OKX.
                      </div>

                      <button
                        type="button"
                        onClick={handleOpenSolanaModal}
                        className="w-full rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-500/15 to-emerald-500/10 px-4 py-3 text-left transition hover:from-cyan-500/20 hover:to-emerald-500/15"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">Open Solana Wallets</p>
                            <p className="mt-1 text-xs text-white/45">Use the native Solana wallet picker and dropdown menu.</p>
                          </div>
                          <span className="text-xs uppercase tracking-[0.18em] text-emerald-300/75">SOL</span>
                        </div>
                      </button>

                      <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-white/45">Detected Wallets</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {solanaWalletNames.length > 0 ? (
                            solanaWalletNames.map((name) => (
                              <span key={name} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                                {name}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-white/50">No installed Solana wallet detected. Install Phantom, Solflare, Trust Wallet or OKX.</span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}