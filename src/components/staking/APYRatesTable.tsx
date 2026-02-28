/**
 * APYRatesTable - On-chain APY table for all staking periods v6.2.0
 * NEVER hardcodes APY values — always reads from getStakingRatesInfo() on-chain.
 * Shows personalized boosted APY when wallet is connected with active skills.
 */

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useStakingV620 } from '../../hooks/staking/useStakingV620';

const PERIOD_EMOJIS = ['⚡', '🗓️', '📅', '🔐', '💎'];
const POPULAR_INDEX = 2; // 90 days

const APYRatesTable = memo(() => {
  const { isConnected } = useAccount();
  const { stakingRates, skillSummary } = useStakingV620();

  const rows = useMemo(() => {
    if (!stakingRates) return [];
    return stakingRates.annualAPY.map((apyBps, i) => {
      const baseAPY = Number(apyBps) / 100;
      const boostedBps = skillSummary?.boostedAPYs?.[i];
      const boostedAPY = boostedBps ? Number(boostedBps) / 100 : null;
      const hasBoost = boostedAPY !== null && boostedAPY > baseAPY;
      const lockDays = Number(stakingRates.lockupPeriods[i] ?? 0n);
      const reducedSecs = skillSummary?.reducedLockTimes?.[i];
      const reducedDays = reducedSecs ? Math.round(lockDays - Number(reducedSecs) / 86400) : null;

      return {
        index: i,
        name: stakingRates.periodNames[i] ?? `Period ${i}`,
        emoji: PERIOD_EMOJIS[i] ?? '📌',
        lockDays,
        baseAPY,
        boostedAPY,
        hasBoost,
        apyDisplay: hasBoost ? boostedAPY!.toFixed(2) : baseAPY.toFixed(2),
        baseDisplay: baseAPY.toFixed(2),
        reducedDays,
        isPopular: i === POPULAR_INDEX,
      };
    });
  }, [stakingRates, skillSummary]);

  if (!stakingRates) {
    return (
      <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6 animate-pulse">
        <div className="h-5 bg-white/10 rounded w-32 mb-4" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-white/5 rounded mb-2" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="jersey-15-regular text-white font-semibold text-xl lg:text-2xl">Staking Rates</h3>
        {isConnected && skillSummary && (
          <span className="jersey-20-regular text-xs text-purple-400 bg-purple-400/10 border border-purple-400/20 px-2 py-0.5 rounded-full">
            ⚡ Boosted
          </span>
        )}
      </div>

      {/* Sub-header */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/5">
        <span className="jersey-20-regular text-white/30 text-xs">Period / Lock</span>
        <span className="jersey-20-regular text-white/30 text-xs">
          {isConnected ? 'Your APY' : 'APY'}
        </span>
      </div>

      {/* Rows */}
      {rows.map((row, i) => (
        <motion.div
          key={row.index}
          className={`relative flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-0 ${
            row.isPopular ? 'bg-orange-500/5' : 'hover:bg-white/2'
          } transition-colors`}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06, duration: 0.3 }}
        >
          {/* Popular left accent bar */}
          {row.isPopular && (
            <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-orange-400/70 rounded-r" />
          )}

          {/* Left: emoji + name + lock */}
          <div className="flex items-center gap-3">
            <span className="text-xl lg:text-2xl">{row.emoji}</span>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="jersey-15-regular text-white text-base lg:text-lg leading-none">{row.name}</p>
                {row.isPopular && (
                  <span className="jersey-20-regular text-orange-400 text-xs">🔥</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="jersey-20-regular text-white/40 text-xs lg:text-sm">
                  {row.lockDays === 0 ? 'No lock' : `${row.lockDays}d lock`}
                </span>
                {row.reducedDays !== null && row.reducedDays > 0 && (
                  <span className="jersey-20-regular text-purple-400 text-xs">
                    −{row.reducedDays}d
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: APY number prominent */}
          <div className="text-right">
            <motion.p
              className={`jersey-15-regular font-bold text-2xl lg:text-3xl leading-none ${
                row.hasBoost ? 'text-purple-400' : row.isPopular ? 'text-orange-400' : 'text-emerald-400'
              }`}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.06 + 0.12, duration: 0.25 }}
            >
              {row.apyDisplay}%
            </motion.p>
            {row.hasBoost ? (
              <p className="jersey-20-regular text-white/30 text-xs line-through mt-0.5">{row.baseDisplay}%</p>
            ) : (
              <p className="jersey-20-regular text-white/25 text-xs mt-0.5">annual</p>
            )}
          </div>
        </motion.div>
      ))}

      <div className="px-4 py-2">
        <p className="jersey-20-regular text-white/20 text-xs">
          Live from contract · never cached
        </p>
      </div>
    </div>
  );
});

APYRatesTable.displayName = 'APYRatesTable';
export default APYRatesTable;
