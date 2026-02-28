import { motion } from 'framer-motion';
import { LAUNCHPAD_CONFIG, getTierStatus } from '../../constants/launchpad';
import type { TierId } from '../../constants/launchpad';
import CountdownTimer from './CountdownTimer';

interface TierCardProps {
  tierId: TierId;
  stats?: { nuxSold: number; solRaised: number; participants: number };
  onBuy?: () => void;
  isActiveTier: boolean;
}

const COLOR_MAP = {
  emerald: {
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/10',
    badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    bar: 'bg-gradient-to-r from-emerald-500 to-green-400',
    btn: 'from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400',
    text: 'text-emerald-400',
    ring: 'ring-emerald-500/40',
  },
  blue: {
    border: 'border-blue-500/30',
    glow: 'shadow-blue-500/10',
    badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    bar: 'bg-gradient-to-r from-blue-500 to-cyan-400',
    btn: 'from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400',
    text: 'text-blue-400',
    ring: 'ring-blue-500/40',
  },
  purple: {
    border: 'border-purple-500/30',
    glow: 'shadow-purple-500/10',
    badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    bar: 'bg-gradient-to-r from-purple-500 to-pink-400',
    btn: 'from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400',
    text: 'text-purple-400',
    ring: 'ring-purple-500/40',
  },
};

export default function TierCard({ tierId, stats, onBuy, isActiveTier }: TierCardProps) {
  const tier = LAUNCHPAD_CONFIG.tiers[tierId];
  const status = getTierStatus(tierId);
  const colors = COLOR_MAP[tier.color as keyof typeof COLOR_MAP];
  const isLP = tierId === 3;
  const progress = tier.cap && stats ? Math.min((stats.nuxSold / tier.cap) * 100, 100) : 0;

  const statusLabel = {
    upcoming: '⏳ UPCOMING',
    live: '🟢 LIVE',
    ended: '✅ ENDED',
  }[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative card-unified border ${colors.border} shadow-xl ${colors.glow} flex flex-col gap-4 p-5
        ${isActiveTier ? `ring-2 ${colors.ring}` : 'opacity-90'}
      `}
    >
      {/* Live pulse */}
      {isActiveTier && status === 'live' && (
        <span className="absolute top-3 right-3 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className={`jersey-20-regular text-lg border px-2 py-0.5 rounded-full ${colors.badge}`}>
            {tier.badge}
          </span>
          <h3 className={`jersey-15-regular text-3xl md:text-4xl mt-1 ${colors.text}`}>{tier.label}</h3>
        </div>
        <span className="jersey-20-regular text-lg text-slate-500 bg-white/5 px-2 py-1 rounded-full border border-white/10">
          {statusLabel}
        </span>
      </div>

      {/* Price */}
      <div className="flex items-end gap-2 flex-wrap">
        <span className="jersey-15-regular text-white text-4xl md:text-5xl">{tier.price.toFixed(6)}</span>
        <span className="jersey-20-regular text-slate-400 text-xl md:text-2xl mb-1">SOL / NUX</span>
        {!isLP && (
          <span className={`jersey-20-regular text-lg ml-auto ${colors.badge} border px-2 py-0.5 rounded-full`}>
            {tier.discount}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="jersey-20-regular text-slate-400 text-xl leading-relaxed">{tier.description}</p>

      {/* Progress bar (Tier 1 & 2 only) */}
      {!isLP && tier.cap && (
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="jersey-20-regular text-xl text-slate-500">Progress</span>
            <span className={`jersey-15-regular text-xl md:text-2xl ${colors.text}`}>
              {stats ? Math.round(progress) : '—'}%
            </span>
          </div>
          <div className="h-3 md:h-4 bg-black/40 rounded-full overflow-hidden border border-white/5">
            <motion.div
              className={`h-full rounded-full ${colors.bar}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="jersey-20-regular text-lg text-slate-600">
              {stats ? (stats.nuxSold / 1_000_000).toFixed(2) + 'M' : '—'} NUX sold
            </span>
            <span className="jersey-20-regular text-xl text-slate-500">
              {(tier.cap / 1_000_000).toFixed(0)}M cap
            </span>
          </div>
        </div>
      )}

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-2 text-xl">
        {!isLP && (
          <>
            <div className="bg-black/20 rounded-lg p-2 border border-white/5">
              <p className="jersey-20-regular text-slate-500 text-xl">Min Buy</p>
              <p className={`jersey-15-regular text-xl ${colors.text}`}>
                {tier.minBuy?.toLocaleString()} NUX
              </p>
            </div>
            <div className="bg-black/20 rounded-lg p-2 border border-white/5">
              <p className="jersey-20-regular text-slate-500 text-xl">Participants</p>
              <p className={`jersey-15-regular text-xl ${colors.text}`}>
                {stats?.participants ?? '—'}
              </p>
            </div>
          </>
        )}
        <div className="bg-black/20 rounded-lg p-2 border border-white/5">
          <p className="jersey-20-regular text-slate-500 text-xl">Start</p>
          <p className="jersey-15-regular text-white text-xl">
            {tier.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
        {tier.end && (
          <div className="bg-black/20 rounded-lg p-2 border border-white/5">
          <p className="jersey-20-regular text-slate-500 text-xl">End</p>
          <p className="jersey-15-regular text-white text-xl">
              {tier.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
        )}
      </div>

      {/* Countdown for upcoming */}
      {status === 'upcoming' && (
        <div className="flex justify-center pt-1 border-t border-white/5">
          <CountdownTimer targetDate={tier.start} label="Starts in" />
        </div>
      )}

      {/* CTA Button */}
      {!isLP ? (
        <button
          onClick={onBuy}
          disabled={status !== 'live'}
          className={`w-full py-3 rounded-xl jersey-20-regular text-xl text-white font-medium transition-all duration-200
            ${status === 'live'
              ? `bg-gradient-to-r ${colors.btn} shadow-lg active:scale-95`
              : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/10'
            }`}
        >
          {status === 'upcoming' ? 'Not Open Yet' : status === 'ended' ? 'Phase Ended' : `Buy ${tier.label} →`}
        </button>
      ) : (
        <a
          href="https://raydium.io/liquidity/"
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full py-3 rounded-xl jersey-20-regular text-xl text-white font-medium text-center block transition-all duration-200
            ${status === 'live'
              ? `bg-gradient-to-r ${colors.btn} shadow-lg`
              : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/10'
            }`}
        >
          {status === 'upcoming' ? 'Coming Mar 24 on Raydium' : 'Trade on Raydium →'}
        </a>
      )}
    </motion.div>
  );
}
