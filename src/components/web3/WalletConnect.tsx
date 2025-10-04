import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain } from 'wagmi'
import { useState, useRef, useEffect } from 'react'
import { polygon } from 'wagmi/chains'
import { useIsMobile } from '../../hooks/mobile'

function WalletConnect() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const [showDropdown, setShowDropdown] = useState(false)
  const isMobile = useIsMobile()
  const dropdownRef = useRef<HTMLDivElement>(null)
  // Cerrar el menú al hacer click fuera
  useEffect(() => {
    if (!showDropdown) return;
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);
  
  const isPolygonNetwork = chain?.id === polygon.id
  
  const { data: balance } = useBalance({
    address: address,
  })

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="bg-gradient-to-r from-red-400 to-purple-500 hover:from-red-700 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg flex items-center space-x-2"
        >
          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
          <span>{formatAddress(address)}</span>
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
              className={`absolute z-50 overflow-hidden ${
                isMobile
                  ? 'fixed bottom-0 left-0 right-0 bg-black rounded-t-2xl shadow-2xl max-h-[80vh]'
                  : 'right-0 mt-2 w-80 bg-black rounded-xl shadow-xl border border-gray-800'
              }`}
            >
              <div className={`border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800 ${
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
                <div className="space-y-3">
                  <div>
                    <p className={`font-semibold text-white ${
                      isMobile ? 'text-base' : 'text-sm'
                    }`}>Wallet Address</p>
                    <p className={`text-white break-all font-mono ${
                      isMobile ? 'text-sm' : 'text-xs'
                    }`}>{address}</p>
                  </div>
                  <div className="pt-2 border-t border-gray-700">
                    <p className={`font-semibold text-white ${
                      isMobile ? 'text-base' : 'text-sm'
                    }`}>Network</p>
                    <div className="flex items-center justify-between mt-1">
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
                  <div className="pt-2 border-t border-gray-700">
                    <p className={`font-semibold text-white ${
                      isMobile ? 'text-base' : 'text-sm'
                    }`}>Balance</p>
                    <p className={`font-bold text-purple-400 ${
                      isMobile ? 'text-xl' : 'text-lg'
                    }`}>
                      {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : `0.0000 ${chain?.nativeCurrency?.symbol || 'ETH'}`}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  disconnect()
                  setShowDropdown(false)
                }}
                className={`w-full text-left text-red-400 hover:bg-red-900/30 transition-all duration-200 font-medium ${
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
        onClick={() => setShowDropdown(!showDropdown)}
        className="btn-wallet"
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