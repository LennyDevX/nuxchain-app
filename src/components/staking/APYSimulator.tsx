/**
 * APYSimulator - Deposit simulator with real-time APY calculation via simulateAPY()
 * Shows: effectiveAPY (with DynamicAPY + skills), expected annual rewards, compound info.
 */

import { memo, useState, useCallback } from 'react';
import { useStakingV620 } from '../../hooks/staking/useStakingV620';
import { useStakingContext } from '../../context/useStakingContext';

const PERIOD_OPTIONS = [
  { label: 'Flexible', days: 0,   index: 0, emoji: '⚡' },
  { label: '30 Days',  days: 30,  index: 1, emoji: '🗓️' },
  { label: '90 Days',  days: 90,  index: 2, emoji: '📅' },
  { label: '180 Days', days: 180, index: 3, emoji: '🔐' },
  { label: '365 Days', days: 365, index: 4, emoji: '💎' },
];

const APYSimulator = memo(() => {
  const [amount, setAmount] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(2); // 90 days default
  const { simulateAPY, simulating, simulatedResult, skillSummary } = useStakingV620();
  const { stakingRates } = useStakingContext();

  const handleAmountChange = useCallback((v: string) => {
    setAmount(v);
    simulateAPY(v, selectedIndex);
  }, [selectedIndex, simulateAPY]);

  const handlePeriodChange = useCallback((idx: number) => {
    setSelectedIndex(idx);
    if (amount) simulateAPY(amount, idx);
  }, [amount, simulateAPY]);

  const selectedPeriod = PERIOD_OPTIONS[selectedIndex];
  const feeDiscountPct = skillSummary ? Number(skillSummary.effectiveFeeDiscount) / 100 : 0;
  const reducedLockSecs = skillSummary?.reducedLockTimes?.[selectedIndex];
  const reducedDays = reducedLockSecs
    ? Math.round(selectedPeriod.days - Number(reducedLockSecs) / 86400)
    : selectedPeriod.days;

  // Base APY from on-chain rates (fallback while simulating)
  const baseAPYBps = stakingRates?.annualAPY?.[selectedIndex] ?? 0n;
  const baseAPYPct = Number(baseAPYBps) / 100;
  const boostedAPYBps = skillSummary?.boostedAPYs?.[selectedIndex];
  const boostedAPYPct = boostedAPYBps ? Number(boostedAPYBps) / 100 : baseAPYPct;

  const hasValidAmount = !!amount && parseFloat(amount) > 0;

  return (
    <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="jersey-15-regular text-white font-semibold text-xl lg:text-2xl">💡 Deposit Simulator</h3>
        <span className="jersey-20-regular text-white/40 text-sm lg:text-base">Live APY preview</span>
      </div>

      {/* Amount Input */}
      <div>
        <label className="jersey-20-regular text-white/60 text-base lg:text-lg mb-2 block">Amount (POL)</label>
        <div className="relative">
          <input
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="Enter amount..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3.5 text-white jersey-20-regular text-lg placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 jersey-20-regular text-white/40 text-base">POL</span>
        </div>
      </div>

      {/* Period Selector */}
      <div>
        <label className="jersey-20-regular text-white/60 text-base lg:text-lg mb-2 block">Lock Period</label>
        <div className="grid grid-cols-5 gap-1.5">
          {PERIOD_OPTIONS.map((p) => (
            <button
              key={p.index}
              onClick={() => handlePeriodChange(p.index)}
              className={`flex flex-col items-center py-2.5 px-1 rounded-lg border transition-all text-center ${
                selectedIndex === p.index
                  ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
              }`}
            >
              <span className="text-lg mb-1">{p.emoji}</span>
              <span className="jersey-20-regular text-xs lg:text-sm">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results — always reserve space to prevent layout jump */}
      <div className="min-h-[220px]">
        {/* APY Breakdown — always visible once a period is selected */}
        <div className="bg-white/5 rounded-lg p-4 space-y-2.5 mb-3">
          <div className="flex justify-between items-center">
            <span className="jersey-20-regular text-white/60 text-base lg:text-lg">Base APY</span>
            <span className="jersey-20-regular text-white/80 text-base lg:text-lg">{baseAPYPct.toFixed(2)}%</span>
          </div>
          {boostedAPYPct > baseAPYPct && (
            <div className="flex justify-between items-center">
              <span className="jersey-20-regular text-purple-400 text-base lg:text-lg">⚡ Skill Boost</span>
              <span className="jersey-20-regular text-purple-400 text-base lg:text-lg">+{(boostedAPYPct - baseAPYPct).toFixed(2)}%</span>
            </div>
          )}
          <div className="flex justify-between items-center border-t border-white/10 pt-2.5">
            <span className="jersey-15-regular text-white font-semibold text-base lg:text-lg">
              {simulatedResult ? 'Effective APY' : 'Estimated APY'}
            </span>
            <span className="jersey-15-regular text-emerald-400 font-bold text-2xl lg:text-3xl">
              {simulating ? '...' : simulatedResult ? simulatedResult.effectiveAPYPct : `${boostedAPYPct.toFixed(2)}%`}
            </span>
          </div>
        </div>

        {/* Annual Rewards */}
        <div className={`bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 mb-3 transition-opacity duration-200 ${
          hasValidAmount && simulatedResult ? 'opacity-100' : 'opacity-30 pointer-events-none'
        }`}>
          <p className="jersey-20-regular text-white/60 text-base lg:text-lg">You'd earn approximately</p>
          <p className="jersey-15-regular text-emerald-400 text-3xl lg:text-4xl font-bold">
            {hasValidAmount && simulatedResult
              ? `${parseFloat(simulatedResult.annualRewardsFmt).toFixed(4)} POL`
              : '0.0000 POL'}
            <span className="text-base text-white/40 font-normal ml-2">/ year</span>
          </p>
          <p className="jersey-20-regular text-white/40 text-sm lg:text-base mt-1">
            ≈ {hasValidAmount && simulatedResult
              ? `${(parseFloat(simulatedResult.annualRewardsFmt) / 365).toFixed(4)}`
              : '0.0000'} POL / day
          </p>
        </div>

        {/* Lock info */}
        {selectedPeriod.days > 0 && (
          <div className={`rounded-lg p-3.5 ${
            reducedDays < selectedPeriod.days
              ? 'bg-purple-500/5 border border-purple-500/20'
              : 'bg-white/5 border border-white/10'
          }`}>
            <p className="jersey-20-regular text-white/70 text-base lg:text-lg">
              🔒 Lock period:{' '}
              <span className="text-white">
                {reducedDays < selectedPeriod.days
                  ? `${reducedDays} days (reduced from ${selectedPeriod.days}d by skills)`
                  : `${selectedPeriod.days} days`}
              </span>
            </p>
          </div>
        )}

        {/* Commission info */}
        {feeDiscountPct > 0 && (
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3.5 mt-3">
            <p className="jersey-20-regular text-blue-400 text-base lg:text-lg">
              💳 Commission: <span className="line-through text-white/40">6%</span>{' '}
              → {(6 - feeDiscountPct * 6 / 100).toFixed(2)}% (−{feeDiscountPct.toFixed(1)}% discount from skills)
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

APYSimulator.displayName = 'APYSimulator';
export default APYSimulator;
