import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain, type Connector } from 'wagmi'
import { useState, useRef, useEffect } from 'react'
import { polygon } from 'wagmi/chains'
import { formatUnits } from 'viem'
import { useIsMobile } from '../../hooks/mobile'
import { useENSResolution } from '../../hooks/web3/useENSResolution'
import { useGasPrice } from '../../hooks/web3/useGasPrice'
import { useTransactionHistory } from '../../hooks/web3/useTransactionHistory'

function WalletConnect() {
  const { address, isConnected, chain } = useAccount()
  const { connectAsync, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const [showDropdown, setShowDropdown] = useState(false)
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
      enabled: Boolean(address && isConnected),
    },
  })

  const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined

  // Log successful connection
  useEffect(() => {
    if (isConnected && address) {
      // Close dropdown when successfully connected
      setShowDropdown(false)
      setIsConnecting(false)
      setConnectionError(null)
      
      console.log(`✅ [Wallet] Connected successfully!`, {
        address: `${address.slice(0, 6)}...${address.slice(-4)}`,
        chain: chain?.name,
        balance: balance ? `${formatUnits(balance.value, balance.decimals)} ${balance.symbol}` : 'Loading...',
      })
    }
  }, [isConnected, address, chain, balance])

  useEffect(() => {
    if (!showDropdown) return;
    
    function handleClickOutside(event: MouseEvent) {
      // Don't close while connecting
      if (isConnecting) return;
      
      const target = event.target as Node;
      // Permitir clicks dentro del dropdown o en el botón
      if (buttonRef.current?.contains(target)) {
        return;
      }
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setShowDropdown(false);
      }
    }
    
    function handleTouchOutside(event: TouchEvent) {
      // Don't close while connecting
      if (isConnecting) return;
      
      const target = event.target as Node;
      if (buttonRef.current?.contains(target)) {
        return;
      }
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setShowDropdown(false);
      }
    }
    
    // Usar capture phase para detectar clicks fuera
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('touchstart', handleTouchOutside, true);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleTouchOutside, true);
    };
  }, [showDropdown, isConnecting]);

  // Reset connecting state after timeout to prevent stuck state
  useEffect(() => {
    if (!isConnecting) return;
    
    const timeoutId = setTimeout(() => {
      console.warn('[WalletConnect] Connection timeout - resetting state')
      setIsConnecting(false)
    }, 60000); // 60 seconds timeout
    
    return () => clearTimeout(timeoutId);
  }, [isConnecting]);

  // Monitor for modal close events and prevent dropdown reopening
  useEffect(() => {
    const handleVisibilityChange = () => {
      // When modal closes, ensure dropdown stays closed
      if (document.visibilityState === 'visible' && isConnecting) {
        setTimeout(() => {
          setShowDropdown(false)
        }, 100)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isConnecting]);

  // Swipe-to-close en mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isMobile && e.changedTouches[0].clientY - touchStartY > 100) {
      setShowDropdown(false)
    }
  }

  // Prevenir propagación de clicks dentro del dropdown
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

  const getBalanceLabel = () => {
    const symbol = balance?.symbol || chain?.nativeCurrency?.symbol || 'POL'
    if (!balance) return `0.0000 ${symbol}`
    // In wagmi 3.x, balance no longer has 'formatted' - we need to format manually
    const formatted = formatUnits(balance.value, balance.decimals)
    return `${formatFixed(formatted, 4)} ${symbol}`
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
        return 'OKX Wallet extension'
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

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setShowDropdown(!showDropdown)}
          className="btn-primary w-full flex items-center justify-center space-x-2  "
        >
          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
          <span>{formatAddress(address)}</span>
        </button>
        {showDropdown && (
          <>
            {/* Backdrop para móvil - z-40 para estar debajo del dropdown z-50 */}
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
              className={`absolute z-[999] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent ${
                isMobile
                  ? 'fixed bottom-0 left-0 right-0 bg-black rounded-t-2xl shadow-2xl max-h-[90vh] max-w-full'
                  : 'right-0 mt-2 w-96 bg-black rounded-xl shadow-xl border border-gray-800'
              }`}
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-purple-900/30 via-gray-900 to-gray-900 p-6 border-b border-purple-500/20">
                {isMobile && (
                  <button
                    onClick={() => setShowDropdown(false)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-800/80 flex items-center justify-center text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    ✕
                  </button>
                )}
                
                {/* Balance destacado */}
                <div className="text-center mb-4">
                  <p className="text-xs text-gray-400 mb-1">Total Balance</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {getBalanceLabel()}
                  </p>
                </div>

                {/* Wallet Address */}
                <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                  {ensName && (
                    <p className="text-sm text-purple-400 font-medium mb-1">{ensName}</p>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-gray-300 font-mono truncate">{address}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(address)
                        // Optional: show toast
                      }}
                      className="px-2 py-1 text-xs bg-white/5 hover:bg-white/10 text-purple-400 rounded transition-colors flex-shrink-0"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Network */}
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

                {/* Network Status */}
                <div className={`rounded-lg p-3 border ${
                  gasLevel === 'low' 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : gasLevel === 'high'
                    ? 'bg-red-500/10 border-red-500/20'
                    : 'bg-yellow-500/10 border-yellow-500/20'
                }`}>
                  <p className="text-xs text-gray-400 mb-2">Network Congestion</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Gas Price</p>
                      <p className={`text-sm font-bold ${
                        gasLevel === 'low' ? 'text-green-400' : gasLevel === 'high' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {formatGasPrice(gasPrice)} Gwei
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      gasLevel === 'low' 
                        ? 'bg-green-500/20 text-green-400' 
                        : gasLevel === 'high'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {getGasLevelLabel(gasLevel)}
                    </span>
                  </div>
                </div>

                {/* Recent Transactions */}
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
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              tx.status === 'confirmed' 
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

              <button
                onClick={() => {
                  disconnect()
                  setShowDropdown(false)
                }}
                className={`w-full text-left text-red-400 hover:bg-red-900/30 transition-all duration-200 font-medium border-t border-gray-800 ${
                  isMobile ? 'px-6 py-4 text-base' : 'px-4 py-3 text-sm'
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
          {/* Backdrop para móvil */}
          {isMobile && (
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
              onClick={() => setShowDropdown(false)}
            />
          )}
          <div
            ref={dropdownRef}
            onClick={handleDropdownClick}
            className={`absolute z-50 overflow-hidden ${
              isMobile
                ? 'fixed bottom-0 left-0 right-0 bg-black rounded-t-2xl shadow-2xl'
                : 'right-0 mt-2 w-56 bg-black rounded-lg shadow-lg border border-gray-800'
            }`}
          >
            <div className={`border-b ${
              isMobile
                ? 'p-6 border-gray-800 bg-gray-900'
                : 'p-3 border-gray-800 bg-gray-900'
            }`}>
              {isMobile && (
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white">Connect Wallet</h3>
                  <button
                    onClick={() => setShowDropdown(false)}
                    className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}
              <p className={`font-medium ${
                isMobile ? 'text-base text-white' : 'text-sm text-white'
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
                        
                        // Clear any previous errors
                        setConnectionError(null)
                        
                        // Close dropdown BEFORE attempting connection
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
                        
                        // Make error message user-friendly
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
                        
                        // DON'T re-open dropdown on error - user needs to click "Connect Wallet" again
                        // This prevents the modal from repeatedly opening
                      } finally {
                        // Delay resetting isConnecting to prevent immediate re-trigger
                        setTimeout(() => setIsConnecting(false), 500)
                      }
                    }}
                    disabled={isDisabled}
                    className={`w-full text-left rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isMobile
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
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default WalletConnect