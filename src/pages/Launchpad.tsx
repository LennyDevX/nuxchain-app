import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '../hooks/mobile';
import { LAUNCHPAD_CONFIG, getActiveTier } from '../constants/launchpad';
import type { TierId } from '../constants/launchpad';
import TierCard from '../components/launchpad/TierCard';
import BuyModal from '../components/launchpad/BuyModal';
import LaunchpadStats from '../components/launchpad/LaunchpadStats';
import CountdownTimer from '../components/launchpad/CountdownTimer';

interface RawStats {
  tier1: { nuxSold: number; solRaised: number; participants: number };
  tier2: { nuxSold: number; solRaised: number; participants: number };
  total: { nuxSold: number; solRaised: number; participants: number };
}

export default function Launchpad() {
  const isMobile = useIsMobile();
  const [stats, setStats] = useState<RawStats | null>(null);
  const [buyTier, setBuyTier] = useState<TierId | null>(null);
  const activeTier = getActiveTier();

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/launchpad/stats');
      if (res.ok) setStats(await res.json());
    } catch {
      // Silent fail - stats will remain null
    }
  }, []);

  // Fetch stats on mount and every 30s
  useEffect(() => {
    const timeoutId = setTimeout(fetchStats, 0);
    const intervalId = setInterval(fetchStats, 30_000);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [fetchStats]);

  // Date of next upcoming event
  const now = new Date();
  const tier1Start = LAUNCHPAD_CONFIG.tiers[1].start;
  const nextEventDate = now < tier1Start ? tier1Start : null;

  return (
    <>
      <div className={`relative z-10 max-w-5xl mx-auto px-4 pb-24 ${isMobile ? 'pt-6' : 'pt-10'}`}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 space-y-3"
        >
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="relative w-45 h-45">
              <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-xl animate-pulse" />
              <img
                src="/assets/tokens/NuxLogo.png"
                alt="NUX Token"
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]"
              />
            </div>
          </div>

          <div>
            <span className="jersey-20-regular text-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 px-3 py-1 rounded-full uppercase tracking-widest">
              Token Launch
            </span>
          </div>

          <h1 className="jersey-15-regular text-5xl md:text-8xl bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            NUX Token Sale
          </h1>

          <p className="jersey-20-regular text-slate-400 text-xl md:text-3xl max-w-lg mx-auto">
            The official presale of the NUX token — powering the NuxChain cross-chain ecosystem.
            Whitelist participants get the best price.
          </p>

          {/* Countdown to Whitelist */}
          {nextEventDate && (
            <div className="flex justify-center pt-2">
              <div className="bg-black/30 border border-white/10 text-2xl md:text-4xl rounded-2xl px-6 py-3">
                <CountdownTimer targetDate={nextEventDate} label="Whitelist Opens in" />
              </div>
            </div>
          )}

          {/* Timeline progress */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {([1, 2, 3] as TierId[]).map((id) => {
              const isActive = activeTier === id;
              const isPast = activeTier !== null && id < activeTier;
              return (
                <div key={id} className="flex items-center gap-2">
                  <div className={`h-2 rounded-full transition-all duration-500 ${
                    isActive ? 'w-8 bg-purple-400 shadow-lg shadow-purple-500/50 animate-pulse' :
                    isPast ? 'w-4 bg-emerald-500' : 'w-4 bg-white/10'
                  }`} />
                  {id < 3 && <div className="w-6 h-px bg-white/10" />}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <LaunchpadStats stats={stats} />
        </motion.div>

        {/* Tier Cards */}
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {([1, 2, 3] as TierId[]).map((id, i) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
            >
              <TierCard
                tierId={id}
                stats={id === 1 ? stats?.tier1 : id === 2 ? stats?.tier2 : undefined}
                isActiveTier={activeTier === id}
                onBuy={() => setBuyTier(id as TierId)}
              />
            </motion.div>
          ))}
        </div>

        {/* LP explanation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 card-unified border border-white/5 p-4 text-center"
        >
          <div className="space-y-3">
            {/* Liquidity lock highlight */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">🔒</span>
              <span className="jersey-15-regular text-xl md:text-7xl text-amber-300">
                50% of LP liquidity permanently locked at launch
              </span>
              <span className="text-xl">🔒</span>
            </div>
            <p className="jersey-20-regular text-slate-500 text-xl md:text-2xl leading-relaxed max-w-xl mx-auto">
              💡 <span className="text-slate-400">Tier 3 (LP)</span> price of{' '}
              <span className="text-purple-400">0.00004 SOL</span> is the{' '}
              <em>initial</em> liquidity pool price on NuxChain. After launch, the market moves freely.
              {' '}SOL raised in Tier 1 &amp; 2 will bootstrap the NuxChain pool — <span className="text-amber-300">50% of the LP tokens are locked permanently</span>, the rest supports operations.
            </p>
          </div>
        </motion.div>

        {/* Airdrop CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 flex justify-center"
        >
          <a
            href="/airdrop"
            className="jersey-20-regular text-sm text-slate-400 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2.5 rounded-xl transition-all duration-200 bg-white/5 hover:bg-white/10"
          >
            🎁 Not whitelisted? Register for the Airdrop →
          </a>
        </motion.div>

      </div>

      {/* Buy Modal */}
      {buyTier && (
        <BuyModal
          tierId={buyTier}
          onClose={() => setBuyTier(null)}
          onSuccess={() => fetchStats()}
        />
      )}
    </>
  );
}
