import { useActiveNetwork } from '../../hooks/web3/useActiveNetwork'
import { useState } from 'react'

function shortenAddress(address: string | null) {
  if (!address) {
    return null
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function NetworkAlert() {
  const {
    activeNetwork,
    setActiveNetwork,
    isSolanaConnected,
    solanaAddress,
  } = useActiveNetwork()
  
  const [dismissed, setDismissed] = useState(false)

  if (activeNetwork !== 'solana' || isSolanaConnected || dismissed) {
    return null
  }

  const walletHint = shortenAddress(solanaAddress)

  return (
    <div className="fixed top-20 left-0 right-0 z-40 flex justify-center px-4 md:px-6 pointer-events-none">
      <div className="w-full max-w-2xl bg-gradient-to-r from-amber-500/90 to-orange-500/90 backdrop-blur-xl border border-amber-300/60 rounded-xl shadow-2xl pointer-events-auto">
        <div className="flex items-center gap-3 px-4 py-3 md:py-3">
          {/* Alert Icon */}
          <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-white/15">
            <svg className="w-5 h-5 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>

          {/* Message */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">
              <span className="inline-block">Solana Network:</span>{' '}
              <span className="inline-block">No wallet connected</span>
            </p>
            <p className="text-xs text-white/85 mt-0.5">
              {walletHint ? `Last wallet: ${walletHint}` : 'Connect a wallet to continue'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0 flex gap-2">
            <button
              type="button"
              onClick={() => setActiveNetwork('evm')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-lg transition-all duration-200"
            >
              <span>→ Polygon</span>
            </button>
            
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-all"
              aria-label="Dismiss alert"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}