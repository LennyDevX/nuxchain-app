import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain, type Connector } from 'wagmi'
import { useState, useRef, useEffect } from 'react'
import { polygon } from 'wagmi/chains'
import { formatUnits } from 'viem'
import { useWallet } from '@solana/wallet-adapter-react'
import { useIsMobile } from '../../hooks/mobile'
import { useENSResolution } from '../../hooks/web3/useENSResolution'
import { useGasPrice } from '../../hooks/web3/useGasPrice'
import { useSolanaWallet, useSolanaWalletDetection } from '../../hooks/web3/useSolanaWallet'
import { useNetworkContext } from '../../hooks/web3/useNetworkContext'
import { SOLANA_NETWORKS } from '../../constants/solana'
import './WalletConnect.css'

interface WalletConnectProps {
  className?: string;
}

function WalletConnect({ className }: WalletConnectProps) {
  // EVM Wallet
  const { address, isConnected, chain } = useAccount()
  const { connectAsync, connectors } = useConnect()
  const { disconnect: disconnectEVM } = useDisconnect()
  const { switchChain } = useSwitchChain()

  // Solana Wallet
  const solanaWallet = useSolanaWallet()
  const {
    publicKey: solanaPublicKey,
    wallet: solanaWalletName,
    disconnect: disconnectSolana,
    select: selectSolanaWallet,
    connect: connectSolana,
    wallets: solanaWallets
  } = useWallet()
  const { hasPhantom } = useSolanaWalletDetection()

  // Global Network Context
  const { activeNetwork, setActiveNetwork, solanaNetwork } = useNetworkContext()

  // State
  const [showDropdown, setShowDropdown] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [activeTab, setActiveTab] = useState<'evm' | 'solana'>('evm')
  const [touchStartY, setTouchStartY] = useState(0)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [lastUsedWallet, setLastUsedWallet] = useState<string | null>(null)

  const isMobile = useIsMobile()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Load last used wallet from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nuxchain_last_wallet')
    setLastUsedWallet(saved)
  }, [])

  // Save wallet in localStorage when connected
  const saveWalletUsage = (_chain: 'evm' | 'solana', walletKey: string) => {
    localStorage.setItem('nuxchain_last_wallet', walletKey)
    localStorage.setItem('nuxchain_last_chain', _chain)
    setLastUsedWallet(walletKey)
  }

  // New hooks for enhancements
  const { ensName } = useENSResolution(address)
  const { gasPrice, gasLevel } = useGasPrice()

  // Balance caching using useCallback
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
  // Intentionally exclude 'balance' and 'solanaWallet.balance' from dependencies to prevent
  // infinite reconnection loops when balance updates.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, solanaPublicKey, activeNetwork, chain, solanaWalletName, solanaNetwork])

  useEffect(() => {
    if (!showDropdown && !isClosing) return;

    function handleClickOutside(event: MouseEvent) {
      if (isConnecting) return;

      const target = event.target as Node;
      if (buttonRef.current?.contains(target)) {
        return;
      }
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        closeDropdownWithAnimation();
      }
    }

    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [showDropdown, isClosing, isConnecting]);

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
      closeDropdownWithAnimation()
    }
  }

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  // Close dropdown with animation
  const closeDropdownWithAnimation = () => {
    setIsClosing(true)
    setTimeout(() => {
      setShowDropdown(false)
      setIsClosing(false)
    }, 350) // Duration of slideOutDown animation
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
    if (haystack.includes('phantom')) return 'phantom'
    if (haystack.includes('walletconnect')) return 'walletconnect'
    if (haystack.includes('okx')) return 'okx'
    if (haystack.includes('injected')) return 'injected'
    return 'unknown'
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

  // Main Return Block (Unified)
  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setShowDropdown(!showDropdown)}
        className={`transition-all duration-300 ${(isConnected && address) || solanaPublicKey
            ? 'bg-black/40 border border-white/10 hover:border-purple-500/50 px-4 py-2 rounded-2xl flex items-center justify-between gap-3 group shadow-xl whitespace-nowrap'
            : 'btn-primary flex items-center justify-center px-4 py-2 rounded-xl whitespace-nowrap'
          } ${className || ''}`}
      >
        {((isConnected && address) || solanaPublicKey) ? (
          <>
            <div className="flex flex-col items-start translate-y-[1px]">
              <span className="jersey-15-regular text-[10px] uppercase tracking-[0.2em] text-purple-400/80 leading-none mb-1 group-hover:text-purple-400 transition-colors">
                {activeTab === 'evm' ? (isConnected ? 'EVM Connected' : 'Connect EVM') : (solanaPublicKey ? 'SOL Connected' : 'Connect SOL')}
              </span>
              <span className="jersey-20-regular text-lg text-white tracking-tighter leading-none">
                {activeTab === 'evm'
                  ? (address ? (ensName || `${address.slice(0, 6)}...${address.slice(-4)}`) : 'Tap to connect')
                  : (solanaPublicKey ? `${solanaPublicKey.toBase58().slice(0, 4)}...${solanaPublicKey.toBase58().slice(-4)}` : 'Tap to connect')
                }
              </span>
            </div>
            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] transition-all duration-500 ${(activeTab === 'evm' && isConnected) || (activeTab === 'solana' && solanaPublicKey)
              ? 'bg-purple-500 shadow-purple-500/80'
              : 'bg-white/20 shadow-transparent'
              }`} />
          </>
        ) : (
          <span className="jersey-20-regular text-lg font-bold">Connect Wallet</span>
        )}
      </button>

      {showDropdown && (
        <>
          {isMobile && (
            <div
              className={`wallet-backdrop ${isClosing ? 'wallet-backdrop-exit' : 'wallet-backdrop-enter'
                } fixed inset-0 bg-black/70 backdrop-blur-sm z-40`}
              onClick={() => closeDropdownWithAnimation()}
            />
          )}
          <div
            ref={dropdownRef}
            onClick={handleDropdownClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className={`wallet-dropdown ${isClosing ? 'wallet-dropdown-exit' : 'wallet-dropdown-enter'
              } absolute z-[999] overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent ${isMobile
                ? 'fixed bottom-0 left-0 right-0 bg-[#080808] rounded-t-[2.5rem] shadow-2xl max-h-[92vh] max-w-full pb-safe-bottom'
                : 'right-0 mt-3 w-[440px] bg-[#050505] rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 ring-1 ring-white/5'
              }`}
          >
            {isMobile && (
              <div className="w-full flex justify-center pt-3 pb-1">
                <div className="w-12 h-1.5 rounded-full bg-white/10" />
              </div>
            )}
            {/* Header Section (Consolidated Switcher) */}
            <div className={`bg-gradient-to-b from-gray-900/40 to-transparent backdrop-blur-3xl border-b border-white/5 ${isMobile ? 'px-6 pt-2 pb-0' : 'p-5 pb-0'}`}>
              <div className={`flex flex-col gap-1 ${isMobile ? 'mb-4 mt-0 ml-0 text-center' : 'mb-6 mt-1 ml-1'}`}>
                <p className={`jersey-15-regular ${isMobile ? 'text-3xl' : 'text-3xl'} text-white tracking-tighter leading-none uppercase italic`}>Multichain Hub</p>
                <p className="jersey-15-regular text-xl text-purple-400/60 uppercase tracking-[0.3em] mb-1">Select Network to Manage</p>
              </div>

              <div className="flex gap-1.5 p-1 bg-black/60 rounded-2xl border border-white/5 mb-6 relative group/switcher">
                <div
                  className={`absolute top-1 bottom-1 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) bg-white/10 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/5 ${activeTab === 'evm' ? 'left-1 w-[calc(50%-4px)]' : 'left-[calc(50%+1px)] w-[calc(50%-4px)]'
                    }`}
                />

                <button
                  onClick={() => {
                    setActiveTab('evm')
                    if (!address) setActiveNetwork('evm')
                  }}
                  className={`flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl relative z-10 transition-all duration-300 ${activeTab === 'evm' ? 'text-white' : 'text-white/20 hover:text-white/40'
                    }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${activeTab === 'evm' ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]' : 'bg-white/5'}`} />
                  <span className="jersey-20-regular text-2xl tracking-[0.2em] uppercase">EVM</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('solana')
                    if (!solanaPublicKey) setActiveNetwork('solana')
                  }}
                  className={`flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl relative z-10 transition-all duration-300 ${activeTab === 'solana' ? 'text-white' : 'text-white/20 hover:text-white/40'
                    }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${activeTab === 'solana' ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]' : 'bg-white/5'}`} />
                  <span className="jersey-20-regular text-2xl tracking-[0.2em] uppercase">Solana</span>
                </button>
              </div>
            </div>

            {/* EVM Tab Content */}
            {activeTab === 'evm' && (
              isConnected && address ? (
                <>
                  <div className="bg-gradient-to-br from-purple-900/20 via-gray-900 to-gray-900 p-6 border-b border-white/5">
                    {isMobile && (
                      <button
                        onClick={() => closeDropdownWithAnimation()}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-800/80 flex items-center justify-center text-gray-300 hover:bg-gray-700 transition-colors"
                      >
                        ✕
                      </button>
                    )}

                    <div className="text-center mb-5">
                      <p className="jersey-15-regular text-xl text-gray-500 uppercase tracking-[0.2em] mb-2 italic">Total Balance</p>
                      <p className="jersey-20-regular text-4xl bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                        {getEVMBalanceLabel()}
                      </p>
                    </div>

                    <div className="bg-black/60 rounded-2xl p-4 border border-white/5 shadow-inner">
                      {ensName && (
                        <p className="jersey-20-regular text-sm text-purple-400 mb-1.5 tracking-tight">{ensName}</p>
                      )}
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[13px] text-gray-400 font-mono truncate tracking-tight">{address}</p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(address)
                          }}
                          className="jersey-20-regular px-3 py-1.5 text-[11px] bg-white/5 hover:bg-white/10 text-white/80 rounded-lg transition-all uppercase tracking-wider border border-white/5"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-4 pb-12">
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 shadow-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="jersey-15-regular text-xl text-gray-500 uppercase tracking-widest mb-1">Active Network</p>
                          <p className="jersey-20-regular text-sm text-white tracking-wide">{chain?.name || 'Unknown'}</p>
                        </div>
                        {!isPolygonNetwork && (
                          <button
                            onClick={() => switchChain({ chainId: polygon.id })}
                            className="jersey-20-regular px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-2xl rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-purple-900/40"
                          >
                            Switch
                          </button>
                        )}
                      </div>
                      {!isPolygonNetwork && (
                        <div className="jersey-20-regular mt-3 py-2 px-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400 text-[11px] italic">
                          ⚠️ Switch to Polygon for full feature access
                        </div>
                      )}
                    </div>

                    <div className={`rounded-2xl p-4 border shadow-xl ${gasLevel === 'low'
                      ? 'bg-green-500/5 border-green-500/10'
                      : gasLevel === 'high'
                        ? 'bg-red-500/5 border-red-500/10'
                        : 'bg-yellow-500/5 border-yellow-500/10'
                      }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="jersey-15-regular text-xl text-gray-500 uppercase tracking-widest mb-1">Network Traffic</p>
                          <p className={`jersey-20-regular text-base tracking-tight ${gasLevel === 'low' ? 'text-green-400' : gasLevel === 'high' ? 'text-red-400' : 'text-yellow-400'
                            }`}>
                            {formatGasPrice(gasPrice)} Gwei
                          </p>
                        </div>
                        <span className={`jersey-20-regular px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.15em] ${gasLevel === 'low'
                          ? 'bg-green-500/20 text-green-400 shadow-[0_0_12px_rgba(34,197,94,0.2)]'
                          : gasLevel === 'high'
                            ? 'bg-red-500/20 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                            : 'bg-yellow-500/20 text-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.2)]'
                          }`}>
                          {getGasLevelLabel(gasLevel)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        disconnectEVM()
                        closeDropdownWithAnimation()
                      }}
                      className="jersey-20-regular w-full text-center text-red-400/40 hover:text-red-400 hover:bg-red-500/5 transition-all duration-300 uppercase tracking-[0.3em] text-2xl border-t border-white/5 py-6 mt-2"
                    >
                      Disconnect EVM Wallet
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-5 pb-10">
                  {/* Render EVM Wallet List (Reuse connection logic) */}
                  <div className="flex items-center gap-4 mb-4 px-1">
                    <p className="jersey-15-regular text-xl text-gray-500 uppercase tracking-[0.2em] whitespace-nowrap">Connect EVM Wallet</p>
                    <div className="h-px w-full bg-white/5" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {connectors.map((connector) => {
                      const disabledReason = getConnectorDisabledReason(connector)
                      const isWC = getConnectorKey(connector) === 'walletconnect'
                      const isDisabled = Boolean(disabledReason) && !isWC
                      const key = getConnectorKey(connector)
                      const title = (connector as { name?: string }).name || key
                      const walletLogos: Record<string, string> = {
                        metamask: '/assets/wallets/MetaMaskLogo.png',
                        phantom: '/assets/wallets/PhantomLogo.png',
                        okx: '/assets/wallets/OKXLogo.webp',
                        walletconnect: '/assets/wallets/WalletConnect.png',
                        injected: '💼'
                      }
                      const logoUrl = walletLogos[key]
                      // Si el usuario ya conectó OKX en Solana, sugerimos OKX aquí
                      // Priorizar WalletConnect en móvil si no hay OKX sugerido
                      const isRecommended = (lastUsedWallet === 'okx' && key === 'okx') || (isMobile && key === 'walletconnect' && lastUsedWallet !== 'okx')

                      return (
                        <button
                          key={connector.uid}
                          onClick={async () => {
                            try {
                              if (isDisabled) return
                              setConnectionError(null)
                              setIsConnecting(true)
                              // Si es móvil y no es WalletConnect, y falla la conexión normal,
                              // advertimos al usuario que use WalletConnect
                              await connectAsync({ connector: connector as Connector })
                              saveWalletUsage('evm', key)
                              setShowDropdown(false)
                            } catch {
                              if (isMobile && key !== 'walletconnect') {
                                setConnectionError('Mobile browser limitation: Try using the "WalletConnect" option below for a direct app link.')
                              } else {
                                setConnectionError('Connection failed. Please try again.')
                              }
                            } finally {
                              setIsConnecting(false)
                            }
                          }}
                          disabled={isDisabled}
                          className={`rounded-2xl transition-all duration-300 p-3 flex flex-col items-center text-center ${isRecommended && !isDisabled
                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:bg-purple-500/30'
                            : 'bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-purple-500/30 hover:scale-[1.02]'
                            }`}
                        >
                          <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center p-1.5 bg-black/40 rounded-xl border border-white/10 mb-2">
                            {logoUrl && logoUrl.startsWith('/') ? (
                              <img src={logoUrl} alt={title} className="w-7 h-7 object-contain" />
                            ) : (
                              <span className="text-xl">{logoUrl || '💼'}</span>
                            )}
                          </div>
                          <span className="font-black text-white text-xs tracking-tight line-clamp-1">{title}</span>
                          {isRecommended && (
                            <span className="text-[8px] uppercase font-black tracking-[0.08em] bg-purple-600 text-white px-1.5 py-0.5 rounded-full shadow-lg shadow-purple-900/40 italic mt-1">
                              {isWC ? 'Universal' : 'Best'}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            )}

            {/* Solana Tab Content */}
            {activeTab === 'solana' && (
              solanaPublicKey ? (
                <>
                  <div className="bg-gradient-to-br from-purple-900/20 via-gray-900 to-gray-900 p-6 border-b border-white/5">
                    {isMobile && (
                      <button
                        onClick={() => closeDropdownWithAnimation()}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-800/80 flex items-center justify-center text-gray-300 hover:bg-gray-700 transition-colors"
                      >
                        ✕
                      </button>
                    )}

                    <div className="text-center mb-5">
                      <p className="jersey-15-regular text-xl text-gray-500 uppercase tracking-[0.2em] mb-2 italic">Solana Balance</p>
                      <p className="jersey-20-regular text-4xl bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                        {getSolanaBalanceLabel()}
                      </p>
                    </div>

                    <div className="bg-black/60 rounded-2xl p-4 border border-white/5 shadow-inner">
                      <p className="jersey-20-regular text-sm text-purple-400 mb-1.5 tracking-tight">{typeof solanaWalletName === 'string' ? solanaWalletName : solanaWalletName?.adapter?.name || 'Solana'}</p>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[13px] text-gray-400 font-mono truncate tracking-tight">{solanaPublicKey.toBase58()}</p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(solanaPublicKey.toBase58())
                          }}
                          className="jersey-20-regular px-3 py-1.5 text-[11px] bg-white/5 hover:bg-white/10 text-white/80 rounded-lg transition-all uppercase tracking-wider border border-white/5"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pb-12">
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 shadow-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="jersey-15-regular text-xl text-gray-500 uppercase tracking-widest mb-1">Network</p>
                          <p className="jersey-20-regular text-sm text-white tracking-wide">{SOLANA_NETWORKS[solanaNetwork as keyof typeof SOLANA_NETWORKS].label}</p>
                        </div>
                      </div>
                      {SOLANA_NETWORKS[solanaNetwork as keyof typeof SOLANA_NETWORKS].isTestnet && (
                        <div className="jersey-20-regular mt-3 py-2 px-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-[11px] italic">
                          ⚠️ Currently using Solana Devnet (Testnet)
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        disconnectSolana()
                        closeDropdownWithAnimation()
                      }}
                      className="jersey-20-regular w-full text-center text-red-400/40 hover:text-red-400 hover:bg-red-500/5 transition-all duration-300 uppercase tracking-[0.3em] text-2xl border-t border-white/5 py-6 mt-4"
                    >
                      Disconnect Solana Wallet
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-5 pb-12 space-y-4">
                  {/* Multichain Suggestion logic when on Solana tab but not connected */}
                  {address && lastUsedWallet === 'okx' && (
                    <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-purple-600/30 via-pink-600/10 to-transparent border border-purple-400/50 shadow-2xl animate-pulse-slow text-center">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <span className="text-xl">✨</span>
                        <p className="jersey-15-regular text-xl text-white uppercase tracking-wider italic">Smart Sync</p>
                      </div>
                      <p className="jersey-20-regular text-[13px] text-purple-200/90 leading-relaxed">
                        You're using <span className="text-white">OKX Wallet</span> on Polygon. Press the button below to sync with Solana!
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-4 px-1">
                    <p className="jersey-15-regular text-xl text-gray-500 uppercase tracking-[0.2em] whitespace-nowrap">Solana Wallets</p>
                    <div className="h-px w-full bg-white/5" />
                  </div>

                  {/* Solana Wallets Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Phantom / Solflare / Trust / OKX (Solana list - copy from original) */}
                    {/* Phantom Inline */}
                    {(hasPhantom || isMobile) && (
                      <button
                        onClick={async () => {
                          try {
                            setConnectionError(null); setIsConnecting(true)
                            const phantomAdapter = solanaWallets.find(w => w.adapter.name === 'Phantom')
                            if (phantomAdapter) {
                              selectSolanaWallet(phantomAdapter.adapter.name)
                              await connectSolana()
                              saveWalletUsage('solana', 'phantom')
                              setActiveNetwork('solana')
                              setShowDropdown(false)
                            } else {
                              // Fallback direct window if adapter not found (unlikely but safe)
                              const win = window as unknown as { phantom?: { solana?: { connect: () => Promise<void> } } }
                              if (win.phantom?.solana?.connect) {
                                await win.phantom.solana.connect()
                                saveWalletUsage('solana', 'phantom')
                                setActiveNetwork('solana')
                                setShowDropdown(false)
                              } else if (isMobile) {
                                window.open('https://phantom.app/ul/browse/' + window.location.host + window.location.pathname, '_blank')
                              }
                            }
                          } catch {
                            setConnectionError('Phantom failed to connect. Ensure the app is installed.')
                          } finally {
                            setIsConnecting(false)
                          }
                        }}
                        className={`rounded-2xl transition-all duration-300 p-3 flex flex-col items-center text-center bg-gradient-to-br from-purple-600/10 to-indigo-600/5 border border-purple-500/30 hover:scale-[1.02]`}
                      >
                        <img src="/assets/wallets/PhantomLogo.png" className="w-10 h-10 mb-2" />
                        <span className="font-black text-white text-xs tracking-tight">Phantom</span>
                        <span className="text-[8px] bg-purple-600 text-white px-1.5 py-0.5 rounded-full uppercase mt-1">Popular</span>
                      </button>
                    )}

                    {/* OKX Solana Sync */}
                    <button
                      onClick={async () => {
                        try {
                          setConnectionError(null); setIsConnecting(true)
                          const okxAdapter = solanaWallets.find(w => w.adapter.name.toLowerCase().includes('okx'))
                          if (okxAdapter && okxAdapter.readyState === 'Installed') {
                            selectSolanaWallet(okxAdapter.adapter.name)
                            await connectSolana()
                            saveWalletUsage('solana', 'okx')
                            setActiveNetwork('solana')
                            setShowDropdown(false)
                          } else {
                            const win = window as unknown as { okxwallet?: { solana?: { connect: () => Promise<void> } } }
                            if (win.okxwallet?.solana?.connect) {
                              await win.okxwallet.solana.connect()
                              saveWalletUsage('solana', 'okx')
                              setActiveNetwork('solana')
                              setShowDropdown(false)
                            } else if (isMobile) {
                              // En móvil, si no se detecta, sugerimos usar WalletConnect en la pestaña EVM 
                              // ya que OKX Solana se sincroniza mejor así o vía deep link
                              setConnectionError('OKX App not detected. Tip: Use "WalletConnect" in the EVM tab to link OKX Wallet on mobile.')
                            }
                          }
                        } catch {
                          setConnectionError('OKX Solana sync failed. Is the app open?')
                        } finally {
                          setIsConnecting(false)
                        }
                      }}
                      className={`rounded-2xl transition-all duration-300 p-3 flex flex-col items-center text-center bg-black border ${address && lastUsedWallet === 'okx' ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)] ring-1 ring-purple-500/50' : 'border-white/10'} hover:scale-[1.02]`}
                    >
                      <img src="/assets/wallets/OKXLogo.webp" className="w-10 h-10 mb-2" />
                      <span className="font-black text-white text-xs tracking-tight">OKX Wallet</span>
                      {address && lastUsedWallet === 'okx' && <span className="text-[8px] bg-purple-600 text-white px-1.5 py-0.5 rounded-full uppercase italic mt-1">Sync</span>}
                    </button>

                    {/* Solflare */}
                    <button
                      onClick={async () => {
                        try {
                          setConnectionError(null); setIsConnecting(true)
                          const solflare = solanaWallets.find(w => w.adapter.name === 'Solflare')
                          if (solflare && solflare.readyState === 'Installed') {
                            selectSolanaWallet(solflare.adapter.name)
                            await connectSolana()
                            saveWalletUsage('solana', 'solflare')
                            setActiveNetwork('solana')
                            setShowDropdown(false)
                          } else if (isMobile) {
                            window.open('https://solflare.com/ul/v1/browse/' + window.location.host + window.location.pathname, '_blank')
                          }
                        } catch {
                          setConnectionError('Solflare connection failed')
                        } finally {
                          setIsConnecting(false)
                        }
                      }}
                      className={`rounded-2xl transition-all duration-300 p-3 flex flex-col items-center text-center bg-white/[0.03] border border-white/5 hover:scale-[1.02]`}
                    >
                      <div className="w-10 h-10 flex items-center justify-center bg-orange-500/20 rounded-lg mb-2 text-lg">☀️</div>
                      <span className="font-black text-white text-xs tracking-tight">Solflare</span>
                      <p className="text-[10px] text-white/40 italic font-bold mt-1">Fast & secure</p>
                    </button>
                  </div>
                </div>
              )
            )}

            {/* Error Display */}
            {connectionError && (
              <div className="mx-5 mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <p className="jersey-15-regular text-xl text-red-400 uppercase tracking-wider mb-1">Connection Error</p>
                <p className="jersey-20-regular text-[12px] text-red-300/80">
                  {connectionError}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default WalletConnect
