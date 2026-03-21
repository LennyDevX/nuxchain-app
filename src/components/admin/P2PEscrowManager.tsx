import { useState, useCallback } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { motion } from 'framer-motion'
import {
  IS_P2P_DEPLOYED,
  getMarketplacePDA,
  P2P_PROGRAM_ID,
} from '../../constants/p2p'

interface MarketplaceInfo {
  admin: string
  feeBasisPoints: number
  referencePriceSol: number
  minAdAmount: string
  totalAds: string
  totalVolumeNux: string
  paused: boolean
}

export default function P2PEscrowManager() {
  const { publicKey } = useWallet()
  const { connection } = useConnection()

  const [info] = useState<MarketplaceInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state for updating reference price
  const [newPriceSol, setNewPriceSol] = useState('')
  const [newFeeBp, setNewFeeBp] = useState('')

  const fetchState = useCallback(async () => {
    if (!IS_P2P_DEPLOYED) return
    setLoading(true)
    setError(null)
    try {
      const [pda] = getMarketplacePDA()
      const account = await connection.getAccountInfo(pda)
      if (!account) {
        setError('Marketplace not initialized on-chain yet. Deploy and initialize first.')
        return
      }
      // TODO: Decode using @coral-xyz/anchor BorshAccountsCoder once installed
      setError('Install @coral-xyz/anchor (npm install @coral-xyz/anchor) to read live data.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch state')
    } finally {
      setLoading(false)
    }
  }, [connection])

  async function handleUpdatePrice() {
    if (!publicKey) { setError('Connect admin wallet'); return }
    const price = parseFloat(newPriceSol)
    if (!price || price <= 0) { setError('Enter a valid price'); return }
    setActionLoading(true)
    setError(null)
    setSuccess(null)
    try {
      // TODO: Build & send Anchor instruction once @coral-xyz/anchor is installed:
      // const program = getAnchorProgram(connection, wallet)
      // await program.methods.updateReferencePrice(new BN(solToLamports(price).toString()))
      //   .accounts({ marketplace: getMarketplacePDA()[0], admin: publicKey })
      //   .rpc()
      setError('Install @coral-xyz/anchor to send transactions.')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleUpdateFee() {
    if (!publicKey) { setError('Connect admin wallet'); return }
    const bp = parseInt(newFeeBp)
    if (isNaN(bp) || bp < 0 || bp > 1000) { setError('Fee must be 0–1000 basis points'); return }
    setActionLoading(true)
    setError(null)
    setSuccess(null)
    try {
      // TODO: Build & send Anchor instruction once @coral-xyz/anchor is installed
      setError('Install @coral-xyz/anchor to send transactions.')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleTogglePause(_pause: boolean) {
    if (!publicKey) { setError('Connect admin wallet'); return }
    setActionLoading(true)
    setError(null)
    try {
      // TODO: Build & send Anchor setPaused instruction
      setError('Install @coral-xyz/anchor to send transactions.')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="bg-black/40 border border-purple-500/20 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 bg-purple-500/20 rounded-xl flex items-center justify-center">
          <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </div>
        <div>
          <h3 className="jersey-20-regular text-white text-lg">P2P Market Controls</h3>
          <p className="text-white/40 text-xs">Manage reference price, fees, and marketplace status</p>
        </div>
        <button
          onClick={fetchState}
          disabled={loading}
          className="ml-auto text-white/40 hover:text-white transition-colors text-xs px-3 py-1 border border-white/10 rounded-lg"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Deployment status */}
      {!IS_P2P_DEPLOYED && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4">
          <p className="text-amber-400 text-xs jersey-20-regular">
            ⚠️ Contract not yet deployed. Follow{' '}
            <code className="text-amber-300">programs/nux-p2p-escrow/DEPLOY.md</code>
          </p>
          <p className="text-amber-400/60 text-xs mt-1">
            Set <code>VITE_P2P_PROGRAM_ID</code> and <code>VITE_P2P_DEPLOYED=true</code> in .env after deployment.
          </p>
        </div>
      )}

      {/* Program ID display */}
      <div className="bg-white/5 rounded-xl p-3 mb-4">
        <p className="text-white/40 text-xs mb-1">Program ID</p>
        <p className="text-white/70 text-xs font-mono break-all">{P2P_PROGRAM_ID.toBase58()}</p>
      </div>

      {info && (
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          {[
            { label: 'Admin', value: `${info.admin.slice(0, 8)}...` },
            { label: 'Status', value: info.paused ? '🔴 Paused' : '🟢 Active' },
            { label: 'Reference Price', value: `${info.referencePriceSol.toFixed(9)} SOL` },
            { label: 'Fee', value: `${info.feeBasisPoints / 100}%` },
            { label: 'Total Ads', value: info.totalAds },
            { label: 'Volume', value: `${info.totalVolumeNux} NUX` },
          ].map(item => (
            <div key={item.label} className="bg-white/5 rounded-lg p-2">
              <p className="text-white/40">{item.label}</p>
              <p className="text-white jersey-20-regular">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {/* Update Reference Price */}
        <div>
          <label className="block text-white/60 text-xs mb-1.5 jersey-20-regular">
            Set Reference Price (SOL per NUX)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="any"
              value={newPriceSol}
              onChange={e => setNewPriceSol(e.target.value)}
              placeholder="e.g. 0.000000025"
              className="flex-1 bg-white/5 border border-white/10 focus:border-purple-500/50 rounded-xl px-3 py-2 text-white text-sm outline-none"
            />
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleUpdatePrice}
              disabled={actionLoading || !IS_P2P_DEPLOYED}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm jersey-20-regular transition-colors disabled:opacity-40"
            >
              Update
            </motion.button>
          </div>
        </div>

        {/* Update Fee */}
        <div>
          <label className="block text-white/60 text-xs mb-1.5 jersey-20-regular">
            Platform Fee (basis points, 100 = 1%, max 1000)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              max="1000"
              value={newFeeBp}
              onChange={e => setNewFeeBp(e.target.value)}
              placeholder="e.g. 200 (= 2%)"
              className="flex-1 bg-white/5 border border-white/10 focus:border-purple-500/50 rounded-xl px-3 py-2 text-white text-sm outline-none"
            />
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleUpdateFee}
              disabled={actionLoading || !IS_P2P_DEPLOYED}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm jersey-20-regular transition-colors disabled:opacity-40"
            >
              Update
            </motion.button>
          </div>
        </div>

        {/* Pause / Unpause */}
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => handleTogglePause(true)}
            disabled={actionLoading || !IS_P2P_DEPLOYED}
            className="flex-1 py-2 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 jersey-20-regular text-sm transition-colors disabled:opacity-40"
          >
            🔴 Pause Market
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => handleTogglePause(false)}
            disabled={actionLoading || !IS_P2P_DEPLOYED}
            className="flex-1 py-2 rounded-xl border border-green-500/40 text-green-400 hover:bg-green-500/10 jersey-20-regular text-sm transition-colors disabled:opacity-40"
          >
            🟢 Unpause Market
          </motion.button>
        </div>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2"
        >
          {error}
        </motion.p>
      )}
      {success && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2"
        >
          ✓ {success}
        </motion.p>
      )}
    </div>
  )
}
