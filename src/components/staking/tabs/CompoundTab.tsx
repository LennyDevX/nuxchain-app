import { memo, useCallback } from 'react';
import { formatEther } from 'viem';
import { STAKING_PERIODS } from '../../../constants/stakingConstants';

interface CompoundTabProps {
  pendingRewards: bigint | undefined;
  userStaked: bigint | undefined;
  compoundLockupDuration: string;
  setCompoundLockupDuration: (value: string) => void;
  isPending: boolean;
  isConfirming: boolean;
  onCompound: () => void;
}

const CompoundTab = memo(({
  pendingRewards,
  userStaked,
  compoundLockupDuration,
  setCompoundLockupDuration,
  isPending,
  isConfirming,
  onCompound,
}: CompoundTabProps) => {
  const handlePeriodClick = useCallback((value: string) => {
    setCompoundLockupDuration(value);
  }, [setCompoundLockupDuration]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-white/80 mb-4">
          Automatically reinvest your rewards to maximize earnings
        </p>
        <p className="text-2xl font-bold text-white mb-2">
          {pendingRewards ? `${parseFloat(formatEther(pendingRewards)).toFixed(6)} POL` : '0 POL'}
        </p>
        <p className="text-sm text-white/60">
          Available to compound
        </p>
        {userStaked && userStaked > 0n && (
          <p className="text-sm text-emerald-400 mt-2">
            New total after compound: {pendingRewards ? `${parseFloat(formatEther(userStaked + pendingRewards)).toFixed(6)} POL` : '0 POL'}
          </p>
        )}
      </div>

      {/* Period Selector Grid for Compound */}
      <div className="space-y-3">
        <label className="text-white/80 text-sm font-medium">Lockup Period for Compounded Rewards</label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {STAKING_PERIODS.map((period) => (
            <button
              key={period.value}
              type="button"
              onClick={() => handlePeriodClick(period.value)}
              className={`
                relative p-3 rounded-lg border-2 transition-all duration-200
                ${compoundLockupDuration === period.value
                  ? 'border-emerald-500 bg-emerald-500/20'
                  : 'border-white/10 bg-white/5 hover:border-white/30'
                }
              `}
            >
              <div className="text-center">
                <p className={`text-sm font-bold mb-1 ${
                  compoundLockupDuration === period.value ? 'text-emerald-400' : 'text-white'
                }`}>
                  {period.label}
                </p>
                <p className="text-xs text-white/60">{period.roi.annual}</p>
              </div>
              {compoundLockupDuration === period.value && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onCompound}
        disabled={isPending || isConfirming || !pendingRewards || pendingRewards === 0n}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg"
      >
        {isPending || isConfirming ? 'Processing...' : 'Compound Now'}
      </button>
    </div>
  );
});

CompoundTab.displayName = 'CompoundTab';
export default CompoundTab;
