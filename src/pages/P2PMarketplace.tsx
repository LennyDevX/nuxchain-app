import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { useIsMobile } from '../hooks/mobile'
import {
  useMarketplaceState,
  useActiveAds,
  useCreateSellAd,
  useCancelAd,
  useFulfillAd,
} from '../hooks/useP2PEscrow'
import AdCard from '../components/p2p/AdCard'
import CreateAdModal from '../components/p2p/CreateAdModal'
import type { P2PAd } from '../types/p2p'
import { IS_P2P_DEPLOYED, lamportsToSol, rawNuxToDisplay } from '../constants/p2p'

const P2P_ICON = (
  <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
  </svg>
)

export default function P2PMarketplace() {
  const isMobile = useIsMobile()
  const { publicKey, connected } = useWallet()

  const { state: marketplace, refetch: refetchMkt } = useMarketplaceState()
  const { ads, loading: adsLoading, refetch: refetchAds } = useActiveAds()
  const { createAd, loading: createLoading, error: createError } = useCreateSellAd()
  const { cancelAd, loading: cancelLoading } = useCancelAd()
  const { fulfillAd, loading: fulfillLoading } = useFulfillAd()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeAdAction, setActiveAdAction] = useState<bigint | null>(null)

  const myAds = ads.filter(ad => publicKey && ad.creator.equals(publicKey))
  const otherAds = ads.filter(ad => !publicKey || !ad.creator.equals(publicKey))

  async function handleBuy(ad: P2PAd) {
    setActiveAdAction(ad.adId)
    const ok = await fulfillAd(ad)
    if (ok) { refetchAds(); refetchMkt() }
    setActiveAdAction(null)
  }

  async function handleCancel(ad: P2PAd) {
    setActiveAdAction(ad.adId)
    const ok = await cancelAd(ad)
    if (ok) { refetchAds(); refetchMkt() }
    setActiveAdAction(null)
  }

  const refPrice = marketplace ? lamportsToSol(marketplace.referencePriceLamports) : null
  const totalVolume = marketplace ? rawNuxToDisplay(marketplace.totalVolumeNux) : 0

  return (
    <div className={`min-h-screen bg-black text-white ${isMobile ? 'px-4 pb-24 pt-6' : 'px-8 pb-10 pt-10'}`}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto mb-8"
      >
        <div className={`flex ${isMobile ? 'flex-col gap-4' : 'items-end justify-between'}`}>
          <div className="flex items-center gap-3">
            {P2P_ICON}
            <div>
              <h1 className={`jersey-15-regular text-gradient bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 bg-clip-text text-transparent ${isMobile ? 'text-4xl' : 'text-6xl'}`}>
                P2P Market
              </h1>
              <p className="jersey-20-regular text-white/50 text-sm mt-0.5">
                Trade NUX directly with other users. Secured by on-chain escrow.
              </p>
            </div>
          </div>

          {/* Post Ad button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreateModal(true)}
            disabled={!connected}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white jersey-20-regular text-lg transition-all duration-200 disabled:opacity-40 shadow-[0_0_16px_rgba(168,85,247,0.3)]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Post Sell Ad
          </motion.button>
        </div>

        {!connected && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-amber-400/80 text-xs jersey-20-regular"
          >
            ⚡ Connect your Solana wallet to post or buy ads.
          </motion.p>
        )}
      </motion.div>

      {/* ── Stats Bar ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`max-w-4xl mx-auto grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-3 mb-8`}
      >
        {[
          {
            label: 'Reference Price',
            value: refPrice !== null ? `${refPrice.toFixed(9)} SOL` : '—',
            sub: 'Set by admin',
            color: 'text-blue-400',
          },
          {
            label: 'Active Listings',
            value: adsLoading ? '...' : ads.length.toString(),
            sub: 'Sell orders',
            color: 'text-purple-400',
          },
          {
            label: 'Total Volume',
            value: `${totalVolume.toLocaleString()} NUX`,
            sub: 'All time',
            color: 'text-green-400',
          },
          {
            label: 'Platform Fee',
            value: marketplace ? `${(marketplace.feeBasisPoints / 100).toFixed(1)}%` : '2%',
            sub: 'Per trade',
            color: 'text-amber-400',
          },
        ].map(stat => (
          <div
            key={stat.label}
            className="bg-white/5 border border-white/10 rounded-2xl p-4"
          >
            <p className="text-white/40 text-xs mb-1">{stat.label}</p>
            <p className={`jersey-20-regular text-lg ${stat.color}`}>{stat.value}</p>
            <p className="text-white/30 text-xs">{stat.sub}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Not yet deployed banner ─────────────────────────────────────────── */}
      {!IS_P2P_DEPLOYED && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-4xl mx-auto mb-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl p-6 text-center"
        >
          <div className="flex items-center justify-center mb-3">
            <svg className="w-10 h-10 text-purple-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h3 className="jersey-15-regular text-2xl text-purple-300 mb-2">
            Smart Contract Deploying
          </h3>
          <p className="text-white/50 text-sm max-w-md mx-auto">
            The NuxP2PEscrow program is being deployed to Solana.
            Once live, NUX holders will be able to trade here securely.
          </p>
          <p className="text-white/30 text-xs mt-3">
            See <code className="text-purple-400">programs/nux-p2p-escrow/DEPLOY.md</code> for deployment instructions.
          </p>
        </motion.div>
      )}

      {/* ── Ads Grid ───────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto">

        {/* My Ads section */}
        {myAds.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <h2 className="jersey-20-regular text-white/60 text-sm mb-3 uppercase tracking-wider">
              Your Active Ads
            </h2>
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'} gap-4`}>
              <AnimatePresence>
                {myAds.map(ad => (
                  <AdCard
                    key={ad.adId.toString()}
                    ad={ad}
                    isOwn
                    onCancel={handleCancel}
                    cancelLoading={cancelLoading && activeAdAction === ad.adId}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Market Ads section */}
        <div>
          <h2 className="jersey-20-regular text-white/60 text-sm mb-3 uppercase tracking-wider">
            Open Sell Orders
          </h2>

          {adsLoading && (
            <div className="flex items-center justify-center py-16 text-white/40">
              <svg className="animate-spin w-6 h-6 mr-3" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading ads...
            </div>
          )}

          {!adsLoading && otherAds.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 border border-dashed border-white/10 rounded-3xl"
            >
              <p className="text-white/30 jersey-20-regular text-xl mb-2">No active sell orders</p>
              <p className="text-white/20 text-sm">
                {connected ? 'Be the first to post a sell ad!' : 'Connect your wallet to start trading.'}
              </p>
            </motion.div>
          )}

          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'} gap-4`}>
            <AnimatePresence>
              {otherAds.map(ad => (
                <AdCard
                  key={ad.adId.toString()}
                  ad={ad}
                  isOwn={false}
                  onBuy={handleBuy}
                  buyLoading={fulfillLoading && activeAdAction === ad.adId}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Create Ad Modal ─────────────────────────────────────────────────── */}
      <CreateAdModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={async (data) => {
          const ok = await createAd(data)
          if (ok) { refetchAds(); refetchMkt() }
          return ok
        }}
        marketplace={marketplace}
        loading={createLoading}
        error={createError}
      />
    </div>
  )
}
