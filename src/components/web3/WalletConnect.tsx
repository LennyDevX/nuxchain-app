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
import { SOLANA_NETWORKS, type SolanaNetwork } from '../../constants/solana'

function WalletConnect() {
  // EVM Wallet
  const { address, isConnected, chain } = useAccount()
  const { connectAsync, connectors } = useConnect()
  const { disconnect: disconnectEVM } = useDisconnect()
  const { switchChain } = useSwitchChain()

  // Solana Wallet
  const solanaWallet = useSolanaWallet()
  const { publicKey: solanaPublicKey, wallet: solanaWalletName } = useWallet()
  const { disconnect: disconnectSolana, select: selectSolanaWallet, wallets } = useWallet()
  const { hasPhantom } = useSolanaWalletDetection()

  // Global Network Context
  const { activeNetwork, setActiveNetwork, solanaNetwork, setSolanaNetwork } = useNetworkContext()

  // State
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeTab, setActiveTab] = useState<'evm' | 'solana'>('evm')
  const [touchStartY, setTouchStartY] = useState(0)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  
  const isMobile = useIsMobile()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Nuevos hooks para mejoras
  const { ensName } = useENSResolution(address)
  const { gasPrice, gasLevel } = useGasPrice()
  const { transactions } = useTransactionHistory(3)

  // Caching de balance usando useCallback
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
    if (solanaPublicKey && !address) {
      setActiveNetwork('solana')
      setActiveTab('solana')
    } else if (address && !solanaPublicKey) {
      setActiveNetwork('evm')
      setActiveTab('evm')
    }
  }, [solanaPublicKey, address, setActiveNetwork])

  // Log successful connection
  useEffect(() => {
    if (activeNetwork === 'evm' && isConnected && address) {
      setShowDropdown(false)
      setIsConnecting(false)
      setConnectionError(null)

      console.log(`✅ [EVM Wallet] Connected successfully!`, {
        address: `${address.slice(0, 6)}...${address.slice(-4)}`,
        chain: chain?.name,
        balance: balance ? `${formatUnits(balance.value, balance.decimals)} ${balance.symbol}` : 'Loading...',
      })
    } else if (activeNetwork === 'solana' && solanaPublicKey) {
      setShowDropdown(false)
      setIsConnecting(false)
      setConnectionError(null)

      console.log(`✅ [Solana Wallet] Connected successfully!`, {
        address: solanaPublicKey.toBase58().slice(0, 6) + '...' + solanaPublicKey.toBase58().slice(-4),
        wallet: solanaWalletName,
        network: solanaNetwork,
        balance: solanaWallet.balance ? `${solanaWallet.balance} SOL` : 'Loading...',
      })
    }
  }, [isConnected, address, solanaPublicKey, activeNetwork, chain, balance, solanaWalletName, solanaNetwork, solanaWallet.balance])

  useEffect(() => {
    if (!showDropdown) return;

    function handleClickOutside(event: MouseEvent) {
      if (isConnecting) return;

      const target = event.target as Node;
      if (buttonRef.current?.contains(target)) {
        return;
      }
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [showDropdown, isConnecting]);

  useEffect(() => {
    if (!isConnecting) return;

    const timeoutId = setTimeout(() => {
      console.warn('[WalletConnect] Connection timeout - resetting state')
      setIsConnecting(false)
    }, 60000);

    return () => clearTimeout(timeoutId);
  }, [isConnecting]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isMobile && e.changedTouches[0].clientY - touchStartY > 100) {
      setShowDropdown(false)
    }
  }

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const isPolygonNetwork = chain?.id === polygon.id

  const formatFixed = (value: string, digits: number) => {
    const [whole, frac = ''] = value.split('.')
    const trimmedWhole = whole.length ? whole : '0'
    const trimmedFrac = frac.padEnd(digits, '0').slice(0, digits)
    return `${trimmedWhole}.${trimmedFrac}`
  }

  const getEVMBalanceLabel = () => {
    const symbol = balance?.symbol || chain?.nativeCurrency?.symbol || 'POL'
    if (!balance) return `0.0000 ${symbol}`
    const formatted = formatUnits(balance.value, balance.decimals)
    return `${formatFixed(formatted, 4)} ${symbol}`
  }

  const getSolanaBalanceLabel = () => {
    if (!solanaWallet.balance) return '0.0000 SOL'
    return `${solanaWallet.balance.toFixed(4)} SOL`
  }

  const getConnectorKey = (connector: unknown) => {
    const name = (connector as { name?: string }).name?.toLowerCase() ?? ''
    const id = (connector as { id?: string }).id?.toLowerCase() ?? ''
    const haystack = `${id} ${name}`
    if (haystack.includes('metamask')) return 'metamask'
    if (haystack.includes('walletconnect')) return 'walletconnect'
    if (haystack.includes('okx')) return 'okx'
    if (haystack.includes('injected')) return 'injected'
    return 'unknown'
  }

  const getConnectorSubtitle = (key: string) => {
    switch (key) {
      case 'injected':
        return 'Browser wallet extension'
      case 'metamask':
        return 'MetaMask extension / mobile'
      case 'walletconnect':
        return 'Scan QR with WalletConnect'
      case 'okx':
        return 'OKX Wallet extension - supports EVM & Solana'
      default:
        return 'Wallet connector'
    }
  }

  const getConnectorDisabledReason = (connector: unknown) => {
    const key = getConnectorKey(connector)
    if (key === 'walletconnect' && !walletConnectProjectId) {
      return 'Missing WalletConnect Project ID'
    }
    const ready = (connector as { ready?: boolean }).ready
    if (ready === false) {
      return 'Not available in this browser'
    }
    return null
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatGasPrice = (gas: bigint | null) => {
    if (!gas) return 'N/A'
    return (Number(gas) / 1e9).toFixed(2)
  }

  const getGasLevelLabel = (level: 'low' | 'normal' | 'high') => {
    switch (level) {
      case 'low':
        return 'Low'
      case 'normal':
        return 'Normal'
      case 'high':
        return 'High'
    }
  }

  // Display connected state
  if ((isConnected && address) || (solanaPublicKey)) {
    return (
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setShowDropdown(!showDropdown)}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
          <span>
            {activeNetwork === 'evm' && address ? formatAddress(address) : solanaPublicKey ? formatAddress(solanaPublicKey.toBase58()) : 'Connect'}
          </span>
        </button>
        {showDropdown && (
          <>
            {isMobile && (
              <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
                onClick={() => setShowDropdown(false)}
              />
            )}
            <div
              ref={dropdownRef}
              onClick={handleDropdownClick}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className={`absolute z-[999] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent ${isMobile
                  ? 'fixed bottom-0 left-0 right-0 bg-black rounded-t-2xl shadow-2xl max-h-[90vh] max-w-full'
                  : 'right-0 mt-2 w-96 bg-black rounded-xl shadow-xl border border-gray-800'
                }`}
            >
              {/* Tabs para cambiar entre EVM y Solana */}
              <div className="bg-gray-900 border-b border-gray-800 flex">
                <button
                  onClick={() => {
                    setActiveTab('evm')
                    setActiveNetwork('evm')
                  }}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'evm'
                      ? 'text-purple-400 border-b-2 border-purple-400 bg-black/50'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  EVM (Polygon)
                </button>
                <button
                  onClick={() => {
                    setActiveTab('solana')
                    setActiveNetwork('solana')
                  }}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'solana'
                      ? 'text-purple-400 border-b-2 border-purple-400 bg-black/50'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Solana
                </button>
              </div>

              {/* EVM Tab Content */}
              {activeTab === 'evm' && isConnected && address && (
                <>
                  <div className="bg-gradient-to-br from-purple-900/30 via-gray-900 to-gray-900 p-6 border-b border-purple-500/20">
                    {isMobile && (
                      <button
                        onClick={() => setShowDropdown(false)}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-800/80 flex items-center justify-center text-gray-300 hover:bg-gray-700 transition-colors"
                      >
                        ✕
                      </button>
                    )}

                    <div className="text-center mb-4">
                      <p className="text-xs text-gray-400 mb-1">Total Balance</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {getEVMBalanceLabel()}
                      </p>
                    </div>

                    <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                      {ensName && (
                        <p className="text-sm text-purple-400 font-medium mb-1">{ensName}</p>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-gray-300 font-mono truncate">{address}</p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(address)
                          }}
                          className="px-2 py-1 text-xs bg-white/5 hover:bg-white/10 text-purple-400 rounded transition-colors flex-shrink-0"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Network</p>
                          <p className="text-sm font-semibold text-white">{chain?.name || 'Unknown'}</p>
                        </div>
                        {!isPolygonNetwork && (
                          <button
                            onClick={() => switchChain({ chainId: polygon.id })}
                            className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded-lg transition-colors font-medium"
                          >
                            Switch
                          </button>
                        )}
                      </div>
                      {!isPolygonNetwork && (
                        <div className="mt-2 p-2 bg-orange-500/10 border border-orange-500/30 rounded text-orange-400 text-xs">
                          ⚠️ Switch to Polygon for full features
                        </div>
                      )}
                    </div>

                    <div className={`rounded-lg p-3 border ${gasLevel === 'low'
                        ? 'bg-green-500/10 border-green-500/20'
                        : gasLevel === 'high'
                          ? 'bg-red-500/10 border-red-500/20'
                          : 'bg-yellow-500/10 border-yellow-500/20'
                      }`}>
                      <p className="text-xs text-gray-400 mb-2">Network Congestion</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-400">Gas Price</p>
                          <p className={`text-sm font-bold ${gasLevel === 'low' ? 'text-green-400' : gasLevel === 'high' ? 'text-red-400' : 'text-yellow-400'
                            }`}>
                            {formatGasPrice(gasPrice)} Gwei
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${gasLevel === 'low'
                            ? 'bg-green-500/20 text-green-400'
                            : gasLevel === 'high'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                          {getGasLevelLabel(gasLevel)}
                        </span>
                      </div>
                    </div>

                    {transactions.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-400 mb-2">Recent Activity</p>
                        <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                          {transactions.map((tx) => (
                            <a
                              key={tx.hash}
                              href={`https://polygonscan.com/tx/${tx.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-mono text-gray-300 group-hover:text-purple-400">
                                  {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                                </span>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${tx.status === 'confirmed'
                                    ? 'bg-green-500/20 text-green-400'
                                    : tx.status === 'pending'
                                      ? 'bg-yellow-500/20 text-yellow-400'
                                      : 'bg-red-500/20 text-red-400'
                                  }`}>
                                  {tx.status === 'confirmed' ? '✓' : tx.status === 'pending' ? '⏱' : '✕'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{tx.type}</p>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Solana Tab Content */}
              {activeTab === 'solana' && solanaPublicKey && (
                <>
                  <div className="bg-gradient-to-br from-purple-900/30 via-gray-900 to-gray-900 p-6 border-b border-purple-500/20">
                    {isMobile && (
                      <button
                        onClick={() => setShowDropdown(false)}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-800/80 flex items-center justify-center text-gray-300 hover:bg-gray-700 transition-colors"
                      >
                        ✕
                      </button>
                    )}

                    <div className="text-center mb-4">
                      <p className="text-xs text-gray-400 mb-1">Solana Balance</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {getSolanaBalanceLabel()}
                      </p>
                    </div>

                    <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                      <p className="text-sm text-purple-400 font-medium mb-1">{typeof solanaWalletName === 'string' ? solanaWalletName : solanaWalletName?.adapter?.name || 'Solana Wallet'}</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-gray-300 font-mono truncate">{solanaPublicKey.toBase58()}</p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(solanaPublicKey.toBase58())
                          }}
                          className="px-2 py-1 text-xs bg-white/5 hover:bg-white/10 text-purple-400 rounded transition-colors flex-shrink-0"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Network</p>
                          <p className="text-sm font-semibold text-white">{SOLANA_NETWORKS[solanaNetwork as keyof typeof SOLANA_NETWORKS].label}</p>
                        </div>
                        <select
                          value={solanaNetwork}
                          onChange={(e) => {
                            setSolanaNetwork(e.target.value as SolanaNetwork)
                            solanaWallet.switchNetwork(e.target.value as SolanaNetwork)
                          }}
                          className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg transition-colors font-medium cursor-pointer"
                        >
                          <option value="mainnet-beta">Mainnet</option>
                          <option value="devnet">Devnet</option>
                        </select>
                      </div>
                      {SOLANA_NETWORKS[solanaNetwork as keyof typeof SOLANA_NETWORKS].isTestnet && (
                        <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-400 text-xs">
                          ℹ️ Using Solana Devnet (testnet)
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={() => {
                  if (activeTab === 'evm') {
                    disconnectEVM()
                  } else {
                    disconnectSolana()
                  }
                  setShowDropdown(false)
                }}
                className={`w-full text-left text-red-400 hover:bg-red-900/30 transition-all duration-200 font-medium border-t border-gray-800 ${isMobile ? 'px-6 py-4 text-base' : 'px-4 py-3 text-sm'
                  }`}
              >
                Disconnect Wallet
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setShowDropdown(!showDropdown)}
        className="btn-primary w-full"
      >
        Connect Wallet
      </button>
      {showDropdown && (
        <>
          {isMobile && (
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
              onClick={() => setShowDropdown(false)}
            />
          )}
          <div
            ref={dropdownRef}
            onClick={handleDropdownClick}
            className={`absolute z-50 overflow-hidden ${isMobile
                ? 'fixed bottom-0 left-0 right-0 bg-black rounded-t-2xl shadow-2xl'
                : 'right-0 mt-2 w-56 bg-black rounded-lg shadow-lg border border-gray-800'
              }`}
          >
            {/* Tabs */}
            <div className="bg-gray-900 border-b border-gray-800 flex">
              <button
                onClick={() => {
                  setActiveTab('evm')
                  setActiveNetwork('evm')
                }}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'evm'
                    ? 'text-purple-400 border-b-2 border-purple-400 bg-black/50'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                EVM
              </button>
              <button
                onClick={() => {
                  setActiveTab('solana')
                  setActiveNetwork('solana')
                }}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'solana'
                    ? 'text-purple-400 border-b-2 border-purple-400 bg-black/50'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Solana
              </button>
            </div>

            <div className={`border-b ${isMobile
                ? 'p-6 border-gray-800 bg-gray-900'
                : 'p-3 border-gray-800 bg-gray-900'
              }`}>
              {isMobile && (
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white">
                    {activeTab === 'evm' ? 'Connect EVM Wallet' : 'Connect Solana Wallet'}
                  </h3>
                  <button
                    onClick={() => setShowDropdown(false)}
                    className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}
              <p className={`font-medium ${isMobile ? 'text-base text-white' : 'text-sm text-white'
                }`}>Select Wallet</p>
            </div>

            <div className={isMobile ? 'p-4 space-y-3' : 'p-2'}>
              {connectionError && (
                <div className={`rounded-lg p-3 bg-yellow-500/10 border border-yellow-500/30 ${isMobile ? 'text-sm' : 'text-xs'}`}>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">ℹ️</span>
                    <div>
                      <p className="text-yellow-300 font-medium">
                        {connectionError}
                      </p>
                      <p className="text-yellow-200/60 mt-1 text-xs">
                        Select another wallet to try again
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* EVM Wallets */}
              {activeTab === 'evm' && (
                <>
                  {connectors.map((connector) => {
                    const disabledReason = getConnectorDisabledReason(connector)
                    const isDisabled = Boolean(disabledReason)
                    const key = getConnectorKey(connector)
                    const title = (connector as { name?: string }).name || key

                    return (
                      <button
                        key={connector.uid}
                        onClick={async () => {
                          try {
                            if (isDisabled) return

                            setConnectionError(null)
                            setShowDropdown(false)
                            setIsConnecting(true)

                            if (key === 'walletconnect') {
                              console.log(`✅ [WalletConnect] Opening QR modal for WalletConnect...`)
                            } else {
                              console.log(`🔌 [Connector] Attempting to connect with: ${key}`)
                            }

                            await connectAsync({ connector: connector as Connector })

                            console.log(`✅ [WalletConnect] Successfully connected with: ${key}`)
                          } catch (error) {
                            const errorMessage = error instanceof Error ? error.message : String(error)
                            console.error(`❌ [WalletConnect] Error connecting with ${key}:`, errorMessage)

                            let friendlyMessage = 'Connection failed. Please try again.'

                            if (errorMessage.includes('rejected') || errorMessage.includes('denied')) {
                              friendlyMessage = 'You cancelled the connection'
                            } else if (errorMessage.includes('reset') || errorMessage.includes('closed')) {
                              friendlyMessage = 'Connection was closed. Please try again.'
                            } else if (errorMessage.includes('timeout')) {
                              friendlyMessage = 'Connection timed out. Please try again.'
                            } else if (errorMessage.includes('network')) {
                              friendlyMessage = 'Network error. Please check your connection.'
                            }

                            setConnectionError(friendlyMessage)
                          } finally {
                            setTimeout(() => setIsConnecting(false), 500)
                          }
                        }}
                        disabled={isDisabled}
                        className={`w-full text-left rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isMobile
                            ? 'px-4 py-4 text-base text-white bg-gray-800 hover:bg-gray-700 border border-gray-700'
                            : 'px-3 py-2 text-sm text-white/80 hover:bg-gray-700'
                          }`}
                      >
                        <div className="flex flex-col">
                          <div className="font-medium text-white">{title}</div>
                          <div className="text-xs text-white/60 mt-0.5">
                            {disabledReason ?? getConnectorSubtitle(key)}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </>
              )}

              {/* Solana Wallets */}
              {activeTab === 'solana' && (
                <>
                  {/* Phantom - Conexión directa */}
                  {hasPhantom && (
                    <button
                      onClick={async () => {
                        try {
                          setConnectionError(null)
                          setShowDropdown(false)
                          setIsConnecting(true)

                          // Intentar conexión directa con window.phantom.solana
                          const phantom = (window as unknown as { phantom?: { solana?: { connect: () => Promise<unknown> } } }).phantom?.solana
                          if (phantom && typeof phantom.connect === 'function') {
                            const response = await phantom.connect()
                            console.log('✅ [Phantom] Connected:', response)
                            setActiveNetwork('solana')
                          } else {
                            // Fallback a selectSolanaWallet si está disponible
                            const phantomWallet = wallets?.find(w => w.adapter.name === 'Phantom')
                            if (phantomWallet) {
                              await selectSolanaWallet?.(phantomWallet.adapter.name)
                              setActiveNetwork('solana')
                            } else {
                              throw new Error('Phantom wallet not found')
                            }
                          }
                        } catch (error) {
                          const errorMessage = error instanceof Error ? error.message : String(error)
                          console.error(`❌ [Phantom] Error connecting:`, errorMessage)

                          let friendlyMessage = 'Connection failed. Please try again.'
                          if (errorMessage.includes('rejected') || errorMessage.includes('denied')) {
                            friendlyMessage = 'You cancelled the connection'
                          }

                          setConnectionError(friendlyMessage)
                        } finally {
                          setTimeout(() => setIsConnecting(false), 500)
                        }
                      }}
                      className={`w-full text-left rounded transition-colors ${isMobile
                          ? 'px-4 py-4 text-base text-white bg-gray-800 hover:bg-gray-700 border border-gray-700'
                          : 'px-3 py-2 text-sm text-white/80 hover:bg-gray-700'
                        }`}
                    >
                      <div className="flex flex-col">
                        <div className="font-medium text-white">Phantom</div>
                        <div className="text-xs text-white/60 mt-0.5">
                          Solana wallet - Auto-detected
                        </div>
                      </div>
                    </button>
                  )}

                  {/* Otros wallets Solana */}
                  {wallets?.filter(w => w.readyState === 'Installed' && w.adapter.name !== 'Phantom').map((wallet) => (
                    <button
                      key={wallet.adapter.name}
                      onClick={async () => {
                        try {
                          setConnectionError(null)
                          setShowDropdown(false)
                          setIsConnecting(true)

                          await selectSolanaWallet?.(wallet.adapter.name)

                          console.log(`✅ [Solana] Connected with ${wallet.adapter.name}`)
                        } catch (error) {
                          const errorMessage = error instanceof Error ? error.message : String(error)
                          console.error(`❌ [Solana] Error connecting with ${wallet.adapter.name}:`, errorMessage)

                          let friendlyMessage = 'Connection failed. Please try again.'
                          if (errorMessage.includes('rejected') || errorMessage.includes('denied')) {
                            friendlyMessage = 'You cancelled the connection'
                          }

                          setConnectionError(friendlyMessage)
                        } finally {
                          setTimeout(() => setIsConnecting(false), 500)
                        }
                      }}
                      className={`w-full text-left rounded transition-colors ${isMobile
                          ? 'px-4 py-4 text-base text-white bg-gray-800 hover:bg-gray-700 border border-gray-700'
                          : 'px-3 py-2 text-sm text-white/80 hover:bg-gray-700'
                        }`}
                    >
                      <div className="flex flex-col">
                        <div className="font-medium text-white">{wallet.adapter.name}</div>
                        <div className="text-xs text-white/60 mt-0.5">
                          Solana wallet
                        </div>
                      </div>
                    </button>
                  ))}

                  {/* OKX Wallet - Conexión directa */}
                  {typeof window !== 'undefined' && (window as unknown as { okxwallet?: { solana?: unknown } }).okxwallet?.solana && (
                    <div className="border-t border-gray-700 pt-3 mt-3">
                      <p className="text-xs text-gray-400 mb-2 px-2">OKX Wallet</p>
                      <button
                        onClick={async () => {
                          try {
                            setConnectionError(null)
                            setShowDropdown(false)
                            setIsConnecting(true)

                            // Conectar directamente con OKX Solana
                            const okxSolana = (window as unknown as { okxwallet?: { solana?: { connect: () => Promise<unknown> } } }).okxwallet?.solana
                            if (okxSolana && typeof okxSolana.connect === 'function') {
                              await okxSolana.connect()
                              console.log('✅ [OKX] Connected to Solana')
                              setActiveNetwork('solana')
                            } else {
                              throw new Error('OKX Wallet Solana provider not available')
                            }
                          } catch (error) {
                            const errorMessage = error instanceof Error ? error.message : String(error)
                            console.error(`❌ [OKX] Error connecting:`, errorMessage)

                            let friendlyMessage = 'Connection failed. Please try again.'
                            if (errorMessage.includes('rejected') || errorMessage.includes('denied')) {
                              friendlyMessage = 'You cancelled the connection'
                            } else if (errorMessage.includes('not available')) {
                              friendlyMessage = 'OKX Wallet Solana module not found. Please ensure OKX Wallet is installed.'
                            }

                            setConnectionError(friendlyMessage)
                          } finally {
                            setTimeout(() => setIsConnecting(false), 500)
                          }
                        }}
                        className={`w-full text-left rounded transition-colors ${isMobile
                            ? 'px-4 py-4 text-base text-white bg-green-900/30 hover:bg-green-900/50 border border-green-700'
                            : 'px-3 py-2 text-sm text-white/80 hover:bg-green-900/30 border border-green-700/30'
                          }`}
                      >
                        <div className="flex flex-col">
                          <div className="font-medium text-green-400">OKX Wallet - Solana</div>
                          <div className="text-xs text-green-300/60 mt-0.5">
                            Connect to Solana network
                          </div>
                        </div>
                      </button>
                    </div>
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

export default WalletConnect
