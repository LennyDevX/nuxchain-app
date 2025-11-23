import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain } from 'wagmi'
import { useState, useRef, useEffect } from 'react'
import { polygon } from 'wagmi/chains'
import { useIsMobile } from '../../hooks/mobile'
import { useENSResolution } from '../../hooks/web3/useENSResolution'
import { useGasPrice } from '../../hooks/web3/useGasPrice'
import { useTransactionHistory } from '../../hooks/web3/useTransactionHistory'

function WalletConnect() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const [showDropdown, setShowDropdown] = useState(false)
  const [touchStartY, setTouchStartY] = useState(0)
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
  })

  useEffect(() => {
    if (!showDropdown) return;
    
    function handleClickOutside(event: MouseEvent) {
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
  }, [showDropdown]);

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
  
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatGasPrice = (gas: bigint | null) => {
    if (!gas) return 'N/A'
    return (Number(gas) / 1e9).toFixed(2)
  }

  const getGasLevelColor = (level: 'low' | 'normal' | 'high') => {
    switch (level) {
      case 'low':
        return 'text-green-400 bg-green-500/10 border-green-500/30'
      case 'normal':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
      case 'high':
        return 'text-red-400 bg-red-500/10 border-red-500/30'
    }
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
              <div className={`border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800 sticky top-0 ${
                isMobile ? 'p-6' : 'p-4'
              }`}>
                {isMobile && (
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">Wallet Details</h3>
                    <button
                      onClick={() => setShowDropdown(false)}
                      className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <div className="space-y-4">
                  {/* Wallet Address with ENS */}
                  <div>
                    <p className={`font-semibold text-white ${
                      isMobile ? 'text-base' : 'text-sm'
                    }`}>Wallet Address</p>
                    {ensName && (
                      <p className={`text-purple-400 font-medium ${
                        isMobile ? 'text-sm' : 'text-xs'
                      }`}>{ensName}</p>
                    )}
                    <p className={`text-white break-all font-mono ${
                      isMobile ? 'text-sm' : 'text-xs'
                    }`}>{address}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(address)
                      }}
                      className="text-xs text-gray-400 hover:text-white mt-1 transition-colors"
                    >
                      📋 Copy
                    </button>
                  </div>

                  {/* Network Info */}
                  <div className="pt-2 border-t border-gray-700">
                    <p className={`font-semibold text-white ${
                      isMobile ? 'text-base' : 'text-sm'
                    }`}>Network</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className={`text-white ${
                        isMobile ? 'text-sm' : 'text-sm'
                      }`}>{chain?.name || 'Unknown'}</p>
                      {!isPolygonNetwork && (
                        <button
                          onClick={() => switchChain({ chainId: polygon.id })}
                          className={`bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors ${
                            isMobile ? 'px-3 py-2 text-sm' : 'px-2 py-1 text-xs'
                          }`}
                        >
                          Switch to Polygon
                        </button>
                      )}
                    </div>
                    {!isPolygonNetwork && (
                      <div className={`mt-2 p-3 bg-orange-100 border border-orange-300 rounded text-orange-800 ${
                        isMobile ? 'text-sm' : 'text-xs'
                      }`}>
                        ⚠️ Please switch to Polygon network for full functionality
                      </div>
                    )}
                  </div>

                  {/* Balance */}
                  <div className="pt-2 border-t border-gray-700">
                    <p className={`font-semibold text-white ${
                      isMobile ? 'text-base' : 'text-sm'
                    }`}>Balance</p>
                    <p className={`font-bold text-purple-400 ${
                      isMobile ? 'text-xl' : 'text-lg'
                    }`}>
                      {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : `0.0000 ${chain?.nativeCurrency?.symbol || 'POL'}`}
                    </p>
                  </div>

                  {/* Gas Price Info */}
                  <div className="pt-2 border-t border-gray-700">
                    <p className={`font-semibold text-white mb-2 ${
                      isMobile ? 'text-base' : 'text-sm'
                    }`}>Network Status</p>
                    <div className={`flex items-center justify-between p-3 bg-white/5 border rounded-lg ${
                      getGasLevelColor(gasLevel)
                    }`}>
                      <div>
                        <p className={`text-xs opacity-80`}>Gas Price</p>
                        <p className="font-semibold">{formatGasPrice(gasPrice)} Gwei</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-xs opacity-80`}>Congestion</p>
                        <p className="font-semibold text-sm">{getGasLevelLabel(gasLevel)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Transactions */}
                  {transactions.length > 0 && (
                    <div className="pt-2 border-t border-gray-700">
                      <p className={`font-semibold text-white mb-2 ${
                        isMobile ? 'text-base' : 'text-sm'
                      }`}>Recent Transactions</p>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {transactions.map((tx) => (
                          <a
                            key={tx.hash}
                            href={`https://polygonscan.com/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors group"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs font-mono text-white group-hover:text-purple-400 transition-colors`}>
                                {tx.hash.slice(0, 10)}...
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                tx.status === 'confirmed' 
                                  ? 'bg-green-500/20 text-green-400'
                                  : tx.status === 'pending'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {tx.status === 'confirmed' ? '✓' : tx.status === 'pending' ? '⏱' : '✕'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400">{tx.type}</p>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => {
                    connect({ connector })
                    setShowDropdown(false)
                  }}
                  disabled={isPending}
                  className={`w-full text-left rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isMobile
                      ? 'px-4 py-4 text-base text-white bg-gray-800 hover:bg-gray-700 border border-gray-700'
                      : 'px-3 py-2 text-sm text-white/80 hover:bg-gray-700'
                  }`}
                >
                  <div className={`flex items-center ${
                    isMobile ? 'space-x-3' : 'space-x-2'
                  }`}>
                    <div className={`rounded-full bg-gradient-to-r from-blue-500 to-purple-500 ${
                      isMobile ? 'w-8 h-8' : 'w-6 h-6'
                    }`}></div>
                    <span className="font-medium">
                      {isPending ? 'Connecting...' : connector.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default WalletConnect