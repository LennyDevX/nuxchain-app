import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain } from 'wagmi'
import { useState } from 'react'
import { polygon } from 'wagmi/chains'

function WalletConnect() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const [showDropdown, setShowDropdown] = useState(false)
  
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
          <div className="absolute right-0 mt-2 w-64 bg-gray-200 rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
              <p className="text-sm font-semibold text-black">Wallet</p>
              <p className="text-xs text-black break-all font-mono">{address}</p>
              
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-sm font-semibold text-black">Network:</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-black">{chain?.name || 'Unknown'}</p>
                  {!isPolygonNetwork && (
                    <button
                      onClick={() => switchChain({ chainId: polygon.id })}
                      className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded transition-colors"
                    >
                      Switch to Polygon
                    </button>
                  )}
                </div>
                {!isPolygonNetwork && (
                  <div className="mt-1 p-2 bg-orange-100 border border-orange-300 rounded text-xs text-orange-800">
                    ⚠️ Please switch to Polygon network for full functionality
                  </div>
                )}
              </div>
              
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-sm font-semibold text-black">Balance:</p>
                <p className="text-lg font-bold text-purple-600">
                  {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : `0.0000 ${chain?.nativeCurrency?.symbol || 'ETH'}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                disconnect()
                setShowDropdown(false)
              }}
              className="w-full text-left px-4 py-3 text-sm text-red-700 hover:bg-red-50 transition-all duration-200 font-medium"
            >
              Disconnect
            </button>
          </div>
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
        <div className="absolute right-0 mt-2 w-56 bg-black/80 backdrop-blur-md rounded-lg shadow-lg border border-white/20 z-50">
            <div className="p-3 border-b border-white/20">
              <p className="text-sm font-medium text-white">Select Wallet</p>
            </div>
          <div className="p-2">
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => {
                  connect({ connector })
                  setShowDropdown(false)
                }}
                disabled={isPending}
                className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Connecting...' : connector.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default WalletConnect