import { useAccount, useSwitchChain } from 'wagmi'
import { polygon } from 'wagmi/chains'
import { useState } from 'react'
import '../../styles/network-alert.css'

/**
 * NetworkAlert Component
 * 
 * Floating alert that appears at the top of the page when the user is not connected
 * to Polygon network. Shows a smooth animation and includes a button to switch networks.
 */
export function NetworkAlert() {
  const { chain, isConnected } = useAccount()
  const { switchChain } = useSwitchChain()
  const [dismissed, setDismissed] = useState(false)

  const isPolygonNetwork = chain?.id === polygon.id
  
  // Show alert only if: connected, not on polygon, and not dismissed
  const shouldShow = isConnected && !isPolygonNetwork && !dismissed

  const handleClose = () => {
    setDismissed(true)
  }

  if (!shouldShow) return null

  return (
    <div
      className="network-alert-container network-alert-visible"
      role="alert"
      aria-live="polite"
    >
      <div className="network-alert-content">
        {/* Left Icon */}
        <div className="network-alert-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>

        {/* Alert Text */}
        <div className="network-alert-text">
          <div className="network-alert-title">
            Nuxchain works better with Polygon Network
          </div>
          <div className="network-alert-subtitle">
            Check your wallet to switch to Polygon for full features
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => switchChain({ chainId: polygon.id })}
          className="network-alert-button"
          aria-label="Switch to Polygon network"
        >
          <span>Switch Network</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="network-alert-close"
          aria-label="Dismiss alert"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Animated bottom border effect */}
      <div className="network-alert-border-effect" />
    </div>
  )
}

export default NetworkAlert
