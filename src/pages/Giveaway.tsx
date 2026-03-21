import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useWallet } from '@solana/wallet-adapter-react';
import { useIsMobile } from '../hooks/mobile/useIsMobile';
import { useGiveawayTracker } from '../hooks/useGiveawayTracker';
import { isMaintenanceMode } from '../config/maintenance';
import GiveawayMaintenance from './GiveawayMaintenance';

const FOLLOW_URL = 'https://x.com/nuxchain';
const TWEET_TEXT_RAW =
  'Trading NUX on NuxChain P2P Market! Earning giveaway entries with every trade - 2 winners get 1 SOL each! Join now and start trading. #Nuxchain #Solana #NUX #Giveaway #Web3 #P2P';
const TWEET_URL = 'https://x.com/intent/post?text=' + encodeURIComponent(TWEET_TEXT_RAW);

const TIER_CONFIGS = [
  { min: 1, max: 4, level: 1, label: 'Trader', multiplier: 1, color: 'slate' },
  { min: 5, max: 14, level: 2, label: 'Active Trader', multiplier: 2, color: 'blue' },
  { min: 15, max: 29, level: 3, label: 'Power Trader', multiplier: 3, color: 'purple' },
  { min: 30, max: Infinity, level: 4, label: 'Elite Trader', multiplier: 5, color: 'amber' },
];

export default function Giveaway() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const { tradeCount, tier } = useGiveawayTracker();
  const [followed, setFollowed] = useState(false);
  const [shared, setShared] = useState(false);

  if (isMaintenanceMode('giveaway')) return <GiveawayMaintenance />;

  const isEligible = followed && shared && tradeCount >= 1;

  useEffect(() => {
    const stored = localStorage.getItem('nux_giveaway_steps_v2');
    if (stored) {
      try {
        const { followed: f, shared: s } = JSON.parse(stored);
        setFollowed(f);
        setShared(s);
      } catch { }
    }
  }, []);

  const handleFollowClick = () => {
    window.open(FOLLOW_URL, '_blank', 'noreferrer');
  };

  const handleShareClick = async () => {
    try {
      await navigator.clipboard.writeText(TWEET_TEXT_RAW);
      toast.success('Tweet text copied!', { icon: '📋' });
    } catch { }
    window.open(TWEET_URL, '_blank');
  };

  const toggleFollowed = (checked: boolean) => {
    setFollowed(checked);
    localStorage.setItem('nux_giveaway_steps_v2', JSON.stringify({ followed: checked, shared }));
  };

  const toggleShared = (checked: boolean) => {
    setShared(checked);
    localStorage.setItem('nux_giveaway_steps_v2', JSON.stringify({ followed, shared: checked }));
  };

  return (
    <div className={`min-h-screen bg-black/40 ${isMobile ? 'pb-32' : ''}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">

        {/* HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 25 }}
          className="relative overflow-hidden rounded-4xl border border-purple-500/20 bg-gradient-to-br from-purple-950/40 via-black/50 to-blue-950/30 p-8 sm:p-12 lg:p-16"
        >
          {/* Gradient background effects */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-[100px]" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-[80px]" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
            {/* Left: Logo + Prize */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col items-center lg:items-start gap-6 flex-1"
            >
              {/* Solana Logo */}
              <motion.img
                src="/assets/tokens/SolanaLogo.png"
                alt="Solana"
                className={`${isMobile ? 'w-20 h-20' : 'w-32 h-32'} drop-shadow-[0_0_20px_rgba(159,122,234,0.5)]`}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Prize amount */}
              <div className="text-center lg:text-left">
                <p className="jersey-20-regular text-purple-300 text-sm uppercase tracking-[0.3em] mb-2">Total Prize Pool</p>
                <h1 className={`jersey-15-regular text-gradient ${isMobile ? 'text-6xl' : 'text-7xl lg:text-8xl'} leading-none font-black mb-3`}>
                  2 SOL
                </h1>
                <p className="jersey-20-regular text-white/60 text-base sm:text-lg max-w-sm mx-auto lg:mx-0">
                  Two winners will each receive 1 SOL from our community rewards.
                </p>
              </div>

              {/* Badge pills */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3">
                <span className="jersey-20-regular px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm">
                  2 Winners
                </span>
                <span className="jersey-20-regular px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs sm:text-sm">
                  1 SOL Each
                </span>
                <span className="jersey-20-regular px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs sm:text-sm">
                  P2P Powered
                </span>
              </div>
            </motion.div>

            {/* Right: Tagline + CTA */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex-1 text-center lg:text-right"
            >
              <div className="space-y-5">
                <h2 className={`jersey-15-regular ${isMobile ? 'text-3xl' : 'text-4xl lg:text-5xl'} leading-tight text-white`}>
                  Trade NUX &
                  <br />
                  <span className="text-gradient">Win SOL</span>
                </h2>
                <p className="jersey-20-regular text-white/50 text-base lg:text-lg leading-relaxed">
                  Every trade on the NuxChain P2P Market automatically earns you entries into our giveaway. The more you trade, the better your chances!
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigate('/p2p-market')}
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white jersey-20-regular text-base sm:text-lg font-bold shadow-lg shadow-purple-900/50 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  Start Trading Now
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ENTRIES SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="grid lg:grid-cols-2 gap-6"
        >
          {/* Entries Card */}
          <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-900/40 via-black/60 to-purple-950/30 p-6 sm:p-8">
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-purple-600/10 rounded-full blur-[60px]" />
            <div className="relative z-10">
              <p className="jersey-20-regular text-white/50 text-xs uppercase tracking-widest mb-3">Your Trade Entries</p>
              <div className="flex items-end gap-4 mb-6">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={tradeCount}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`jersey-15-regular ${isMobile ? 'text-6xl' : 'text-7xl'} leading-none text-gradient font-black`}
                  >
                    {tradeCount}
                  </motion.span>
                </AnimatePresence>
                <span className="jersey-20-regular text-white/40 text-base mb-2">/ 50 max</span>
              </div>

              {/* Tier badge */}
              {tier && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-${tier.color}-500/30 bg-${tier.color}-500/10 text-${tier.color}-300 jersey-20-regular text-sm font-semibold mb-4`}
                >
                  <span>Level {tier.level}:</span>
                  <span>{tier.name}</span>
                  <span className="text-xs opacity-60">x{TIER_CONFIGS.find(t => t.level === tier.level)?.multiplier} weight</span>
                </motion.div>
              )}

              {!tier && publicKey && (
                <p className="jersey-20-regular text-white/40 text-sm mb-4">Complete your first trade to earn an entry automatically!</p>
              )}

              {!publicKey && (
                <p className="jersey-20-regular text-white/40 text-sm mb-4">Connect your wallet to get started.</p>
              )}

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((tradeCount / 50) * 100, 100)}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
                <p className="jersey-20-regular text-white/30 text-xs text-right">
                  {50 - tradeCount} more trades for max entries
                </p>
              </div>
            </div>
          </div>

          {/* Eligibility Card */}
          <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/40 via-black/60 to-emerald-950/20 p-6 sm:p-8">
            <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-emerald-600/10 rounded-full blur-[60px]" />
            <div className="relative z-10">
              <p className="jersey-20-regular text-white/50 text-xs uppercase tracking-widest mb-4">Eligibility Checklist</p>

              {/* Step 1: Follow */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-4"
              >
                <div className="flex items-start gap-3 mb-2">
                  <motion.div
                    className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      followed
                        ? 'bg-emerald-500/30 border-emerald-500/60'
                        : 'border-white/20 bg-white/5'
                    }`}
                  >
                    {followed && <span className="text-emerald-300 text-sm font-bold">✓</span>}
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="jersey-20-regular text-white text-sm font-semibold">Follow @nuxchain</p>
                      <button
                        onClick={() => {
                          handleFollowClick();
                          setTimeout(() => toggleFollowed(true), 1500);
                        }}
                        className="text-emerald-400 hover:text-emerald-300 text-xs underline transition-colors"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 2: Trade */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="mb-4"
              >
                <div className="flex items-start gap-3 mb-2">
                  <motion.div
                    className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      tradeCount >= 1
                        ? 'bg-blue-500/30 border-blue-500/60'
                        : 'border-white/20 bg-white/5'
                    }`}
                  >
                    {tradeCount >= 1 && <span className="text-blue-300 text-sm font-bold">✓</span>}
                  </motion.div>
                  <div className="flex-1">
                    <p className="jersey-20-regular text-white text-sm font-semibold">Make at least 1 P2P trade</p>
                    <p className="jersey-20-regular text-white/40 text-xs mt-0.5">
                      {tradeCount >= 1 ? `You have ${tradeCount} trades automatically tracked` : 'Trades are tracked automatically'}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Step 3: Share */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-start gap-3 mb-2">
                  <motion.div
                    className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      shared
                        ? 'bg-purple-500/30 border-purple-500/60'
                        : 'border-white/20 bg-white/5'
                    }`}
                  >
                    {shared && <span className="text-purple-300 text-sm font-bold">✓</span>}
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="jersey-20-regular text-white text-sm font-semibold">Share on X</p>
                      <button
                        onClick={() => {
                          handleShareClick();
                          setTimeout(() => toggleShared(true), 1500);
                        }}
                        className="text-purple-400 hover:text-purple-300 text-xs underline transition-colors"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Eligibility status */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
                className="mt-5 pt-5 border-t border-white/10"
              >
                {isEligible ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="jersey-20-regular text-emerald-300 text-sm font-semibold">You are eligible to win!</p>
                  </div>
                ) : (
                  <p className="jersey-20-regular text-white/40 text-sm">Complete all steps to be eligible</p>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* TIER BREAKDOWN */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="jersey-20-regular text-white/50 text-xs uppercase tracking-widest mb-4">Tier Multipliers</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TIER_CONFIGS.map((t, i) => (
              <motion.div
                key={t.level}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + i * 0.05 }}
                className={`relative p-4 rounded-2xl border transition-all ${
                  tradeCount >= t.min
                    ? `border-${t.color}-500/50 bg-${t.color}-500/10`
                    : 'border-white/10 bg-white/5 opacity-50'
                }`}
              >
                {tradeCount >= t.min && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
                <p className="jersey-20-regular text-white text-sm font-bold">{t.label}</p>
                <p className={`jersey-20-regular text-${t.color}-300 text-xs mt-1`}>
                  {t.min === 0 ? '0' : t.min}-{t.max === Infinity ? '50+' : t.max} trades
                </p>
                <p className="jersey-20-regular text-white/60 text-xs mt-2 font-semibold">x{t.multiplier} weight</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* RULES */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 space-y-4"
        >
          <h3 className="jersey-20-regular text-white text-base uppercase tracking-widest">Giveaway Rules</h3>
          <ul className="space-y-2.5">
            {[
              '2 winners selected from eligible participants.',
              'Each winner receives exactly 1 SOL to their wallet.',
              'Eligibility requires: following @nuxchain, making at least 1 P2P trade, and sharing on X.',
              'Each P2P trade automatically counts as 1 entry (max 50 entries per wallet).',
              'Tier multipliers increase your weighted chances of winning (Elite tier = 5x weight).',
              'The shared tweet must be public and mention @nuxchain.',
              'Winners will be announced on @nuxchain after the draw date.',
              'Nuxchain reserves the right to verify on-chain trade activity before distributing prizes.',
            ].map((rule, i) => (
              <li key={i} className="jersey-20-regular text-white/60 text-sm flex items-start gap-3">
                <span className="text-purple-400/60 shrink-0 mt-1">●</span>
                {rule}
              </li>
            ))}
          </ul>
        </motion.div>

      </div>
    </div>
  );
}
