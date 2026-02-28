/**
 * ReinvestmentSettings — Slider to set auto-reinvestment percentage
 * Reads: StakingContext.reinvestmentPercentage
 * Writes: useStakingV620().setReinvestmentPercentage(pct)
 */

import { memo, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStakingContext } from '../../context/useStakingContext';
import { useStakingV620 } from '../../hooks/staking/useStakingV620';

function formatPOL(wei: bigint, decimals = 2): string {
  return (Number(wei) / 1e18).toLocaleString('en-US', { maximumFractionDigits: decimals });
}

interface Props {
  pendingRewardsWei?: bigint;
}

const ReinvestmentSettings = memo(({ pendingRewardsWei = 0n }: Props) => {
  const { reinvestmentPercentage } = useStakingContext();
  const {
    setReinvestmentPercentage,
    isTxPending,
    isConfirmed,
    resetTx,
  } = useStakingV620();

  // Slider value is 0-100 (%). Contract stores as bps (/100).
  const currentPct = Math.round(Number(reinvestmentPercentage ?? 0n) / 100);
  const [sliderValue, setSliderValue] = useState(currentPct);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setSliderValue(currentPct);
    setIsDirty(false);
  }, [currentPct]);

  useEffect(() => {
    if (isConfirmed) { resetTx(); setIsDirty(false); }
  }, [isConfirmed, resetTx]);

  const handleChange = useCallback((v: number) => {
    setSliderValue(v);
    setIsDirty(v !== currentPct);
  }, [currentPct]);

  const handleSave = useCallback(() => {
    setReinvestmentPercentage(sliderValue);
  }, [setReinvestmentPercentage, sliderValue]);

  // Calculate preview inline using slider value (not stored on-chain value)
  const sliderBps = BigInt(sliderValue * 100);
  const toReinvest = pendingRewardsWei > 0n ? (pendingRewardsWei * sliderBps) / 10000n : 0n;
  const toClaim = pendingRewardsWei - toReinvest;

  return (
    <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">🔄</span>
        <h3 className="jersey-15-regular text-white font-semibold text-lg">Auto-Reinvestment</h3>
      </div>

      <p className="jersey-20-regular text-white/50 text-sm">
        Choose what percentage of each reward claim is automatically re-staked.
      </p>

      {/* Slider */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="jersey-20-regular text-white/60 text-xs">Reinvest</span>
          <span className="jersey-15-regular text-white font-bold text-sm">{sliderValue}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={sliderValue}
          onChange={e => handleChange(Number(e.target.value))}
          className="w-full h-2 rounded-full accent-emerald-400 cursor-pointer"
        />
        <div className="flex justify-between mt-1">
          <span className="jersey-20-regular text-white/30 text-xs">0% — Full Claim</span>
          <span className="jersey-20-regular text-white/30 text-xs">100% — Full Reinvest</span>
        </div>
      </div>

      {/* Preview */}
      {pendingRewardsWei > 0n && (
        <motion.div
          key={sliderValue}
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <p className="jersey-15-regular text-emerald-400 font-bold text-base">
              {formatPOL(toReinvest)} POL
            </p>
            <p className="jersey-20-regular text-white/40 text-xs mt-0.5">Will reinvest</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <p className="jersey-15-regular text-white font-bold text-base">
              {formatPOL(toClaim)} POL
            </p>
            <p className="jersey-20-regular text-white/40 text-xs mt-0.5">Will receive</p>
          </div>
        </motion.div>
      )}

      {/* Save button */}
      {isDirty && (
        <motion.button
          onClick={handleSave}
          disabled={isTxPending}
          className="jersey-15-regular w-full py-2.5 rounded-xl text-sm font-bold transition-all bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {isTxPending ? '⏳ Saving...' : `Save — Set to ${sliderValue}%`}
        </motion.button>
      )}

      {!isDirty && (
        <p className="jersey-20-regular text-white/30 text-xs text-center">
          Current: {currentPct}% reinvestment per claim
        </p>
      )}
    </div>
  );
});

ReinvestmentSettings.displayName = 'ReinvestmentSettings';
export default ReinvestmentSettings;
