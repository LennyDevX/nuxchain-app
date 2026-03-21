import { motion } from 'framer-motion'
import type { P2PAd } from '../../types/p2p'
import { rawNuxToDisplay, lamportsToSol } from '../../constants/p2p'

interface AdCardProps {
  ad: P2PAd
  isOwn: boolean
  onBuy?: (ad: P2PAd) => void
  onCancel?: (ad: P2PAd) => void
  buyLoading?: boolean
  cancelLoading?: boolean
}

function abbreviate(pubkey: string) {
  return `${pubkey.slice(0, 4)}...${pubkey.slice(-4)}`
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000) - timestamp
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function AdCard({ ad, isOwn, onBuy, onCancel, buyLoading, cancelLoading }: AdCardProps) {
  const nuxAmount = rawNuxToDisplay(ad.nuxAmount)
  const pricePerNux = lamportsToSol(ad.priceLamportsPerNux)
  const totalSol = nuxAmount * pricePerNux

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 280, damping: 25 }}
      className="relative bg-black/60 border border-white/10 hover:border-purple-500/40 rounded-2xl p-4 backdrop-blur-sm transition-colors duration-200"
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {ad.creator.toBase58().slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="text-white/60 text-xs jersey-20-regular">
              {abbreviate(ad.creator.toBase58())}
              {isOwn && (
                <span className="ml-2 px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                  You
                </span>
              )}
            </p>
            <p className="text-white/40 text-xs">{formatTimeAgo(ad.createdAt)}</p>
          </div>
        </div>

        {/* Sell badge */}
        <span className="px-2 py-0.5 bg-green-500/15 text-green-400 border border-green-500/30 rounded-full text-xs jersey-20-regular">
          SELL
        </span>
      </div>

      {/* Price and amount */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-white/50 text-xs mb-0.5">Amount</p>
          <p className="jersey-15-regular text-2xl text-white">
            {nuxAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            <span className="text-purple-400 ml-1">NUX</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-white/50 text-xs mb-0.5">Price / NUX</p>
          <p className="jersey-20-regular text-lg text-amber-400">
            {pricePerNux.toFixed(8)} SOL
          </p>
        </div>
      </div>

      {/* Total cost */}
      <div className="bg-white/5 rounded-xl px-3 py-2 mb-3 flex justify-between items-center">
        <span className="text-white/50 text-xs">Total cost</span>
        <span className="jersey-20-regular text-white text-sm">
          {totalSol.toFixed(6)} SOL
        </span>
      </div>

      {/* Description */}
      {ad.description && (
        <p className="text-white/50 text-xs mb-3 leading-relaxed line-clamp-2">
          {ad.description}
        </p>
      )}

      {/* Action button */}
      {isOwn ? (
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => onCancel?.(ad)}
          disabled={cancelLoading}
          className="w-full py-2 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 jersey-20-regular text-base transition-colors duration-200 disabled:opacity-50"
        >
          {cancelLoading ? 'Cancelling...' : 'Cancel Ad'}
        </motion.button>
      ) : (
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => onBuy?.(ad)}
          disabled={buyLoading}
          className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white jersey-20-regular text-base transition-all duration-200 disabled:opacity-50 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
        >
          {buyLoading ? 'Processing...' : `Buy ${nuxAmount.toLocaleString()} NUX`}
        </motion.button>
      )}
    </motion.div>
  )
}
