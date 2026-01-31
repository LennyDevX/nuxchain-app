import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain, type Connector } from 'wagmi'
import { useState, useRef, useEffect } from 'react'
import { polygon } from 'wagmi/chains'
import { formatUnits } from 'viem'
import { useWallet } from '@solana/wallet-adapter-react'
import { useIsMobile } from '../../hooks/mobile'
import { useENSResolution } from '../../hooks/web3/useENSResolution'
import { useGasPrice } from '../../hooks/web3/useGasPrice'
import { useTransactionHistory } from '../../hooks/web3/useTransactionHistory'
import { useSolanaWallet, useSolanaWalletDetection } from '../../hooks/web3/useSolanaWallet'
import { useNetworkContext } from '../../hooks/web3/useNetworkContext'
import { useMarketPrices } from '../../hooks/web3/useMarketPrices'
import { useSolanaGasPrice } from '../../hooks/web3/useSolanaGasPrice'

// Iconos oficiales de las Wallets
const METAMASK_LOGO = '/MetaMaskLogo.png'
const PHANTOM_LOGO = '/PhantomLogo.png'
const WALLETCONNECT_LOGO = '/WalletConnect.png'
const OKX_LOGO = '/OKXLogo.webp'

function WalletConnect() {
  // EVM Wallet
  const { address, isConnected, chain, connector: activeConnector } = useAccount()
  const { connectAsync, connectors } = useConnect()
  const { disconnect: disconnectEVM } = useDisconnect()
  const { switchChain } = useSwitchChain()

  // Solana Wallet
  const solanaWallet = useSolanaWallet()
  const { publicKey: solanaPublicKey, wallet: solanaWalletName, disconnect: disconnectSolana, select: selectSolanaWallet, wallets, connect: connectSolanaWallet } = useWallet()
  useSolanaWalletDetection()

  // Global Network Context
  const { activeNetwork, setActiveNetwork, solanaNetwork } = useNetworkContext()

  // State
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeTab, setActiveTab] = useState<'evm' | 'solana'>('evm')
  const [touchStartY, setTouchStartY] = useState(0)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const isMobile = useIsMobile()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Hooks
  const { ensName } = useENSResolution(address)
  const { gasPrice, gasLevel } = useGasPrice()
  const { prioritizationFee, gasLevel: solanaGasLevel } = useSolanaGasPrice(solanaNetwork)
  const { transactions } = useTransactionHistory(3)
  const { prices } = useMarketPrices()

  const { data: balance } = useBalance({
    address: address,
    query: {
      enabled: Boolean(address && isConnected && activeNetwork === 'evm'),
      staleTime: 120000,
      gcTime: 300000,
    },
  })

  const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined

  // Update active network based on connections
  useEffect(() => {
    if (solanaPublicKey && !address && activeNetwork !== 'solana') {
      setActiveNetwork('solana')
      setActiveTab('solana')
    } else if (address && !solanaPublicKey && activeNetwork !== 'evm') {
      setActiveNetwork('evm')
      setActiveTab('evm')
    }
  }, [solanaPublicKey, address, setActiveNetwork])

  // Log successful connection & Close dropdown
  useEffect(() => {
    if ((activeNetwork === 'evm' && isConnected && address) || (activeNetwork === 'solana' && solanaPublicKey)) {
      setShowDropdown(false)
      setIsConnecting(false)
      setConnectionError(null)
    }
  }, [isConnected, address, solanaPublicKey, activeNetwork])

  useEffect(() => {
    if (!showDropdown) return
    function handleClickOutside(event: MouseEvent) {
      if (isConnecting) return
      const target = event.target as Node
      if (buttonRef.current?.contains(target)) return
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside, true)
    return () => document.removeEventListener('mousedown', handleClickOutside, true)
  }, [showDropdown, isConnecting])

  const handleTouchStart = (e: React.TouchEvent) => setTouchStartY(e.touches[0].clientY)
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isMobile && e.changedTouches[0].clientY - touchStartY > 100) {
      setShowDropdown(false)
    }
  }
  const handleDropdownClick = (e: React.MouseEvent) => e.stopPropagation()

  const isPolygonNetwork = chain?.id === polygon.id

  const formatFixed = (value: string, digits: number) => {
    const [whole, frac = ''] = value.split('.')
    return `${whole || '0'}.${frac.padEnd(digits, '0').slice(0, digits)}`
  }

  const getEVMBalanceLabel = () => {
    const symbol = balance?.symbol || chain?.nativeCurrency?.symbol || 'POL'
    if (!balance) return `0.0000 ${symbol}`
    return `${formatFixed(formatUnits(balance.value, balance.decimals), 4)} ${symbol}`
  }

  const getSolanaBalanceLabel = () => {
    if (!solanaWallet.balance) return '0.0000 SOL'
    return `${solanaWallet.balance.toFixed(4)} SOL`
  }

  const getUSDBalanceLabel = () => {
    if (activeNetwork === 'evm' && balance && prices.pol?.usd) {
      const usdValue = Number(formatUnits(balance.value, balance.decimals)) * prices.pol.usd
      return `$${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    if (activeNetwork === 'solana' && solanaWallet.balance && prices.sol?.usd) {
      const usdValue = solanaWallet.balance * prices.sol.usd
      return `$${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return null
  }

  const getWalletIcon = (key: string) => {
    switch (key) {
      case 'metamask': return METAMASK_LOGO
      case 'phantom': return PHANTOM_LOGO
      case 'walletconnect': return WALLETCONNECT_LOGO
      case 'okx': return OKX_LOGO
      default: return null
    }
  }

  const getConnectorKey = (connector: unknown) => {
    const name = (connector as { name?: string }).name?.toLowerCase() ?? ''
    const id = (connector as { id?: string }).id?.toLowerCase() ?? ''
    const haystack = `${id} ${name}`
    if (haystack.includes('metamask')) return 'metamask'
    if (haystack.includes('phantom')) return 'phantom'
    if (haystack.includes('walletconnect')) return 'walletconnect'
    if (haystack.includes('okx')) return 'okx'
    if (haystack.includes('injected')) return 'injected'
    return 'unknown'
  }

  const getConnectorSubtitle = (key: string) => {
    switch (key) {
      case 'injected': return 'Browser wallet extension'
      case 'metamask': return 'MetaMask extension / mobile'
      case 'phantom': return 'Phantom extension / mobile'
      case 'walletconnect': return 'Scan QR with WalletConnect'
      case 'okx': return 'Official OKX Wallet - EVM & Solana'
      default: return 'Wallet connector'
    }
  }

  const getConnectorDisabledReason = (connector: unknown) => {
    const key = getConnectorKey(connector)
    if (key === 'walletconnect' && !walletConnectProjectId) return 'Missing WalletConnect Project ID'
    // Relaxed check: Only disable if explicitly false
    if ((connector as any).ready === false) return 'Extension not found'
    return null
  }

  const formatGasPrice = (gas: bigint | null) => {
    if (!gas) return 'N/A'
    return (Number(gas) / 1e9).toFixed(2)
  }

  const getGasLevelLabel = (level: 'low' | 'normal' | 'high') => {
    switch (level) {
      case 'low': return 'Low'
      case 'normal': return 'Normal'
      case 'high': return 'High'
      default: return 'Normal'
    }
  }

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  const renderEVMWallets = (dense = false) => (
    <div className="space-y-2">
      {connectors.map((connector) => {
        const disabledReason = getConnectorDisabledReason(connector)
        const key = getConnectorKey(connector)
        const title = (connector as { name?: string }).name || key
        return (
          <button
            key={connector.uid}
            onClick={async () => {
              try {
                if (disabledReason) return
                setConnectionError(null)
                setIsConnecting(true)
                await connectAsync({ connector: connector as Connector })
              } catch (error) {
                setConnectionError('Connection failed')
              } finally {
                setTimeout(() => setIsConnecting(false), 500)
              }
            }}
            disabled={!!disabledReason}
            className={`w-full text-left rounded-lg transition-colors flex items-center gap-3 border border-white/5 ${dense ? 'px-3 py-2 text-sm' : 'px-4 py-4 text-base'
              } bg-white/5 hover:bg-white/10 disabled:opacity-50`}
          >
            {getWalletIcon(key) && <img src={getWalletIcon(key)!} alt={title} className="w-8 h-8 rounded-lg bg-white/5 p-1 object-contain" />}
            <div className="flex flex-col">
              <span className="font-medium text-white">{title}</span>
              <span className="text-[10px] text-white/40">{disabledReason || getConnectorSubtitle(key)}</span>
            </div>
          </button>
        )
      })}
    </div>
  )

  const renderSolanaWallets = (dense = false) => (
    <div className="space-y-2">
      {/* OKX Prioridad */}
      <button
        onClick={async () => {
          try {
            setConnectionError(null)
            setIsConnecting(true)
            const okxSolana = (window as any).okxwallet?.solana
            if (okxSolana) {
              await okxSolana.connect()
              setActiveNetwork('solana')
            } else {
              const adapter = wallets?.find(w => w.adapter.name.toLowerCase().includes('okx'))
              if (adapter) await selectSolanaWallet?.(adapter.adapter.name)
            }
          } catch (error) {
            setConnectionError('OKX Solana failed')
          } finally {
            setTimeout(() => setIsConnecting(false), 500)
          }
        }}
        className={`w-full text-left rounded-lg transition-colors flex items-center gap-3 border border-white/5 ${dense ? 'px-3 py-2 text-sm' : 'px-4 py-4 text-base'
          } bg-white/5 hover:bg-white/10`}
      >
        <img src={OKX_LOGO} alt="OKX" className="w-8 h-8 rounded-lg bg-white/5 p-1 object-contain" />
        <div className="flex flex-col">
          <span className="font-medium text-white">OKX Wallet</span>
          <span className="text-[10px] text-white/40">Multi-chain support</span>
        </div>
      </button>

      {/* Phantom */}
      <button
        onClick={async () => {
          try {
            setConnectionError(null)
            setIsConnecting(true)
            const phantom = (window as any).phantom?.solana
            if (phantom) {
              await phantom.connect()
              setActiveNetwork('solana')
            } else {
              const adapter = wallets?.find(w => w.adapter.name === 'Phantom')
              if (adapter) await selectSolanaWallet?.(adapter.adapter.name)
            }
          } catch (error) {
            setConnectionError('Phantom failed')
          } finally {
            setTimeout(() => setIsConnecting(false), 500)
          }
        }}
        className={`w-full text-left rounded-lg transition-colors flex items-center gap-3 border border-white/5 ${dense ? 'px-3 py-2 text-sm' : 'px-4 py-4 text-base'
          } bg-white/5 hover:bg-white/10`}
      >
        <img src={PHANTOM_LOGO} alt="Phantom" className="w-8 h-8 rounded-lg bg-white/5 p-1 object-contain" />
        <div className="flex flex-col">
          <span className="font-medium text-white">Phantom</span>
          <span className="text-[10px] text-white/40">Solana & EVM wallet</span>
        </div>
      </button>
    </div>
  )

  const isAnyConnected = address || solanaPublicKey

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setShowDropdown(!showDropdown)}
        className="btn-primary w-full flex items-center justify-center space-x-2"
      >
        {isAnyConnected && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
        <span>
          {isAnyConnected
            ? activeNetwork === 'evm' && address ? formatAddress(address) : solanaPublicKey ? formatAddress(solanaPublicKey.toBase58()) : 'Connected'
            : 'Connect Wallet'
          }
        </span>
      </button>

      {showDropdown && (
        <>
          {isMobile && <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={() => setShowDropdown(false)} />}
          <div
            ref={dropdownRef}
            onClick={handleDropdownClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className={`absolute z-[999] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent ${isMobile
              ? 'fixed bottom-0 left-0 right-0 bg-black rounded-t-2xl shadow-2xl max-h-[90vh]'
              : 'right-0 mt-2 w-80 bg-black rounded-xl shadow-xl border border-gray-800'
              }`}
          >
            {/* Tabs */}
            <div className="bg-gray-900 border-b border-gray-800 flex sticky top-0 z-10">
              <button
                onClick={() => { setActiveTab('evm'); setActiveNetwork('evm') }}
                className={`flex-1 px-4 py-3 text-xs font-bold transition-all ${activeTab === 'evm' ? 'text-purple-400 border-b-2 border-purple-400 bg-white/5' : 'text-gray-500 hover:text-white'}`}
              >
                POLYGON
              </button>
              <button
                onClick={() => { setActiveTab('solana'); setActiveNetwork('solana') }}
                className={`flex-1 px-4 py-3 text-xs font-bold transition-all ${activeTab === 'solana' ? 'text-purple-400 border-b-2 border-purple-400 bg-white/5' : 'text-gray-500 hover:text-white'}`}
              >
                SOLANA
              </button>
            </div>

            {/* Error Message */}
            {connectionError && (
              <div className="m-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-xs text-red-400 font-medium">{connectionError}</p>
              </div>
            )}

            {/* Content: EVM */}
            {activeTab === 'evm' && (
              address ? (
                <div className="p-4 space-y-4">
                  <div className="text-center py-4 bg-gradient-to-b from-purple-500/10 to-transparent rounded-xl">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Total Balance</p>
                    <p className="text-2xl font-bold text-white">{getEVMBalanceLabel()}</p>
                    {getUSDBalanceLabel() && <p className="text-xs text-gray-400 mt-1">{getUSDBalanceLabel()} USD</p>}
                  </div>

                  <div className="p-3 bg-white/5 border border-white/5 rounded-lg flex items-center justify-between">
                    <div className="flex flex-col truncate mr-2">
                      {ensName && <span className="text-[10px] text-purple-400 font-medium mb-0.5">{ensName}</span>}
                      <span className="text-xs font-mono text-gray-400 truncate">{address}</span>
                    </div>
                    <button onClick={() => navigator.clipboard.writeText(address)} className="text-[10px] text-purple-400 hover:text-white transition-colors">Copy</button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs px-1">
                      <span className="text-gray-500">Network</span>
                      <span className="text-white font-medium">{chain?.name || 'Polygon'}</span>
                    </div>
                    {gasPrice && (
                      <div className="flex items-center justify-between text-xs px-1">
                        <span className="text-gray-500">Gas Price</span>
                        <span className={`font-medium ${gasLevel === 'high' ? 'text-red-400' : 'text-green-400'}`}>
                          {formatGasPrice(gasPrice)} Gwei ({getGasLevelLabel(gasLevel)})
                        </span>
                      </div>
                    )}
                    {!isPolygonNetwork && (
                      <button onClick={() => switchChain({ chainId: polygon.id })} className="w-full py-2 bg-orange-500/20 text-orange-400 text-xs rounded-lg border border-orange-500/20 hover:bg-orange-500/30 transition-all">Switch to Polygon</button>
                    )}
                  </div>

                  {transactions.length > 0 && (
                    <div className="pt-2 border-t border-white/5">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Recent Activity</p>
                      <div className="space-y-2">
                        {transactions.map(tx => (
                          <div key={tx.hash} className="flex items-center justify-between p-2 bg-white/5 rounded-lg text-[10px]">
                            <span className="text-gray-300 font-mono">{tx.hash.slice(0, 8)}...</span>
                            <span className={tx.status === 'confirmed' ? 'text-green-400' : 'text-yellow-400'}>{tx.type} ({tx.status === 'confirmed' ? '✓' : '⏱'})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4">
                  {/* Sync Logic for Multi-Chain Wallets (Solana -> EVM) */}
                  {solanaPublicKey && (getConnectorKey({ name: solanaWalletName?.adapter?.name }) === 'okx' || getConnectorKey({ name: solanaWalletName?.adapter?.name }) === 'phantom') ? (
                    <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-center">
                      <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-2">Sync with {getConnectorKey({ name: solanaWalletName?.adapter?.name }) === 'okx' ? 'OKX' : 'Phantom'}</p>
                      <button
                        onClick={async () => {
                          try {
                            const walletKey = getConnectorKey({ name: solanaWalletName?.adapter?.name })
                            setConnectionError(null)
                            setIsConnecting(true)
                            const connector = connectors.find(c => getConnectorKey(c) === walletKey)
                            if (connector) {
                              await connectAsync({ connector })
                              setActiveNetwork('evm')
                              setActiveTab('evm')
                            } else {
                              throw new Error(`${walletKey} EVM connector not found`)
                            }
                          } catch (err) {
                            setConnectionError('Sync failed. Please use manual selection.')
                          } finally {
                            setTimeout(() => setIsConnecting(false), 500)
                          }
                        }}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        Quick Connect Polygon
                      </button>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                        <span className="text-[10px] text-white/20">or select manually</span>
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 text-center">
                      <p className="text-xs font-bold text-purple-400">Connect EVM Wallet</p>
                      <p className="text-[10px] text-gray-500">Manage Polygon assets</p>
                    </div>
                  )}
                  {renderEVMWallets(true)}
                </div>
              )
            )}

            {/* Content: Solana */}
            {activeTab === 'solana' && (
              solanaPublicKey ? (
                <div className="p-4 space-y-4">
                  <div className="text-center py-4 bg-gradient-to-b from-purple-500/10 to-transparent rounded-xl">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Total Balance</p>
                    <p className="text-2xl font-bold text-white">{getSolanaBalanceLabel()}</p>
                    {getUSDBalanceLabel() && <p className="text-xs text-gray-400 mt-1">{getUSDBalanceLabel()} USD</p>}
                  </div>

                  <div className="p-3 bg-white/5 border border-white/5 rounded-lg flex items-center justify-between">
                    <div className="flex flex-col truncate mr-2">
                      <span className="text-[10px] text-purple-400 font-medium mb-0.5">{solanaWalletName?.adapter?.name || 'Solana'}</span>
                      <span className="text-xs font-mono text-gray-400 truncate">{solanaPublicKey.toBase58()}</span>
                    </div>
                    <button onClick={() => navigator.clipboard.writeText(solanaPublicKey.toBase58())} className="text-[10px] text-purple-400 hover:text-white transition-colors">Copy</button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs px-1">
                      <span className="text-gray-500">Network</span>
                      <span className="text-white font-medium">
                        {solanaNetwork === 'mainnet-beta' ? 'Solana Mainnet' : 'Solana Devnet'}
                      </span>
                    </div>
                    {prioritizationFee !== null && (
                      <div className="flex items-center justify-between text-xs px-1">
                        <span className="text-gray-500">Gas Price (Fee)</span>
                        <span className={`font-medium ${solanaGasLevel === 'high' ? 'text-red-400' : 'text-green-400'}`}>
                          {solanaGasLevel.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  {/* Sync Logic for Multi-Chain Wallets */}
                  {isConnected && activeConnector && (getConnectorKey(activeConnector) === 'okx' || getConnectorKey(activeConnector) === 'phantom') ? (
                    <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-center">
                      <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-2">Sync with {getConnectorKey(activeConnector) === 'okx' ? 'OKX' : 'Phantom'}</p>
                      <button
                        onClick={async () => {
                          try {
                            const walletKey = getConnectorKey(activeConnector)
                            setConnectionError(null)
                            setIsConnecting(true)

                            const adapter = wallets.find(w =>
                              w.adapter.name.toLowerCase().includes(walletKey === 'okx' ? 'okx' : 'phantom')
                            )

                            if (adapter) {
                              await selectSolanaWallet(adapter.adapter.name)
                              // Attempt to connect immediately via the adapter
                              try {
                                await adapter.adapter.connect()
                              } catch (connectErr) {
                                console.warn('[Solana Sync] Adapter connect failed, falling back to Context connect', connectErr)
                                await connectSolanaWallet()
                              }
                            } else {
                              // Fallback direct provider
                              const provider = walletKey === 'okx' ? (window as any).okxwallet?.solana : (window as any).phantom?.solana
                              if (provider) await provider.connect()
                              else throw new Error(`${walletKey} Solana module not found`)
                            }

                            setActiveNetwork('solana')
                            setActiveTab('solana')
                          } catch (err) {
                            setConnectionError('Sync failed. Please use manual selection.')
                          } finally {
                            setTimeout(() => setIsConnecting(false), 500)
                          }
                        }}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        Quick Connect Solana
                      </button>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                        <span className="text-[10px] text-white/20">or select manually</span>
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 text-center">
                      <p className="text-xs font-bold text-purple-400">Connect Solana Wallet</p>
                      <p className="text-[10px] text-gray-500">Manage SOL assets</p>
                    </div>
                  )}
                  {renderSolanaWallets(true)}
                </div>
              )
            )}

            {/* Action Area */}
            <div className="p-2 border-t border-white/5 bg-gray-900/50">
              <button
                onClick={() => {
                  if (activeTab === 'evm' && address) disconnectEVM()
                  else if (activeTab === 'solana' && solanaPublicKey) disconnectSolana()
                  else setShowDropdown(false)
                }}
                className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all ${(activeTab === 'evm' && address) || (activeTab === 'solana' && solanaPublicKey)
                  ? 'text-red-400 hover:bg-red-500/10'
                  : 'text-gray-500 hover:text-white'
                  }`}
              >
                {(activeTab === 'evm' && address) || (activeTab === 'solana' && solanaPublicKey) ? 'Disconnect Wallet' : 'Close'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default WalletConnect
