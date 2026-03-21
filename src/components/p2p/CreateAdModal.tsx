import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import type { CreateAdFormData, MarketplaceState } from '../../types/p2p'
import { lamportsToSol } from '../../constants/p2p'

interface CreateAdModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateAdFormData) => Promise<boolean>
  marketplace: MarketplaceState | null
  loading: boolean
  error: string | null
}

const MAX_DESC = 200

export default function CreateAdModal({
  isOpen,
  onClose,
  onSubmit,
  marketplace,
  loading,
  error,
}: CreateAdModalProps) {
  const { publicKey } = useWallet()
  const [form, setForm] = useState<CreateAdFormData>({
    nuxAmount: '',
    pricePerNux: '',
    description: '',
  })
  const [validationError, setValidationError] = useState<string | null>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)

  // Autofocus when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 100)
    } else {
      setForm({ nuxAmount: '', pricePerNux: '', description: '' })
      setValidationError(null)
    }
  }, [isOpen])

  const refPrice = marketplace ? lamportsToSol(marketplace.referencePriceLamports) : null
  const nuxAmountNum = parseFloat(form.nuxAmount) || 0
  const priceNum = parseFloat(form.pricePerNux) || 0
  const totalSol = nuxAmountNum * priceNum
  const feePct = marketplace ? marketplace.feeBasisPoints / 100 : 2
  const platformFee = totalSol * (feePct / 100)
  const sellerReceives = totalSol - platformFee

  function validate(): boolean {
    if (!publicKey) { setValidationError('Please connect your wallet first.'); return false }
    if (!form.nuxAmount || nuxAmountNum <= 0) { setValidationError('Enter a valid NUX amount.'); return false }
    if (!form.pricePerNux || priceNum <= 0) { setValidationError('Enter a valid price per NUX.'); return false }
    if (form.description.length > MAX_DESC) { setValidationError(`Description max ${MAX_DESC} characters.`); return false }
    setValidationError(null)
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    const ok = await onSubmit(form)
    if (ok) onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-md bg-[#0d0d1a] border border-purple-500/30 rounded-3xl p-6 shadow-[0_0_40px_rgba(168,85,247,0.2)]"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
          {/* Title */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="jersey-15-regular text-2xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Post Sell Ad
              </h2>
              <p className="text-white/40 text-xs mt-0.5">
                Your NUX will be held in a secure on-chain escrow.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Reference price hint */}
          {refPrice !== null && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <p className="text-blue-300 text-xs jersey-20-regular">
                Reference price: {refPrice.toFixed(9)} SOL / NUX
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NUX Amount */}
            <div>
              <label className="block text-white/60 text-xs mb-1.5 jersey-20-regular">
                NUX Amount to Sell
              </label>
              <div className="relative">
                <input
                  ref={firstInputRef}
                  type="number"
                  min="0"
                  step="0.000001"
                  value={form.nuxAmount}
                  onChange={e => setForm(f => ({ ...f, nuxAmount: e.target.value }))}
                  placeholder="e.g. 10000"
                  className="w-full bg-white/5 border border-white/10 focus:border-purple-500/50 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors placeholder-white/20"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 text-sm jersey-20-regular">
                  NUX
                </span>
              </div>
            </div>

            {/* Price per NUX */}
            <div>
              <label className="block text-white/60 text-xs mb-1.5 jersey-20-regular">
                Price per NUX (SOL)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.pricePerNux}
                  onChange={e => setForm(f => ({ ...f, pricePerNux: e.target.value }))}
                  placeholder="e.g. 0.000000025"
                  className="w-full bg-white/5 border border-white/10 focus:border-purple-500/50 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors placeholder-white/20"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400 text-sm jersey-20-regular">
                  SOL
                </span>
              </div>
              {refPrice !== null && priceNum > 0 && (
                <p className={`text-xs mt-1 ${priceNum > refPrice * 1.1 ? 'text-red-400' : priceNum < refPrice * 0.9 ? 'text-green-400' : 'text-white/40'}`}>
                  {priceNum > refPrice * 1.1 ? '↑ Above reference price' : priceNum < refPrice * 0.9 ? '↓ Below reference price' : '≈ Near reference price'}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-white/60 text-xs mb-1.5 jersey-20-regular">
                Description (optional, max {MAX_DESC} chars)
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Why are you selling? Any notes for the buyer..."
                rows={3}
                maxLength={MAX_DESC}
                className="w-full bg-white/5 border border-white/10 focus:border-purple-500/50 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors placeholder-white/20 resize-none"
              />
              <p className="text-right text-white/30 text-xs mt-1">
                {form.description.length}/{MAX_DESC}
              </p>
            </div>

            {/* Summary */}
            {nuxAmountNum > 0 && priceNum > 0 && (
              <div className="bg-white/5 rounded-xl p-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/50">Buyer pays</span>
                  <span className="text-white jersey-20-regular">{totalSol.toFixed(6)} SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Platform fee ({feePct}%)</span>
                  <span className="text-white/60">−{platformFee.toFixed(6)} SOL</span>
                </div>
                <div className="h-px bg-white/10 my-1" />
                <div className="flex justify-between">
                  <span className="text-green-400">You receive</span>
                  <span className="text-green-400 jersey-20-regular">{sellerReceives.toFixed(6)} SOL</span>
                </div>
              </div>
            )}

            {/* Errors */}
            {(validationError || error) && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2"
              >
                {validationError ?? error}
              </motion.p>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white jersey-20-regular text-lg transition-all duration-200 disabled:opacity-50 shadow-[0_0_16px_rgba(168,85,247,0.35)]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Depositing NUX to Escrow...
                </span>
              ) : 'Post Sell Ad'}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
