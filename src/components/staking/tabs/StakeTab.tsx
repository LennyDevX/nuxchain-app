import { memo, useCallback } from 'react';
import { useBalance, useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { polygon } from 'wagmi/chains';
import { STAKING_PERIODS } from '../../../constants/stakingConstants';
import { getOptimizedFontSize } from '../../../utils/mobile/performanceOptimization';

interface StakeTabProps {
  depositAmount: string;
  setDepositAmount: (value: string) => void;
  lockupDuration: string;
  setLockupDuration: (value: string) => void;
  isMobile: boolean;
  isPending: boolean;
  isConfirming: boolean;
  isPaused: boolean;
  onDeposit: () => void;
}

const StakeTab = memo(({
  depositAmount,
  setDepositAmount,
  lockupDuration,
  setLockupDuration,
  isMobile,
  isPending,
  isConfirming,
  isPaused,
  onDeposit,
}: StakeTabProps) => {
  const { address } = useAccount();
  const { data: balance } = useBalance({
    address: address,
    chainId: polygon.id,
  });

  const fontSize = {
    label: getOptimizedFontSize(14, isMobile),
    hint: getOptimizedFontSize(12, isMobile),
  };

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDepositAmount(e.target.value);
  }, [setDepositAmount]);

  return (
    <div className="space-y-6">
      <div>
        <label
          className="block text-white/80 font-medium mb-2"
          style={{ fontSize: `${fontSize.label}px` }}
        >
          Amount to deposit (POL)
        </label>
        <div className="relative">
          <input
            type="number"
            value={depositAmount}
            onChange={handleAmountChange}
            placeholder="0.0"
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
          />
          {depositAmount && (
            <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-400" style={{ fontSize: `${fontSize.hint}px` }}>
                💡 6% Commission: {(parseFloat(depositAmount) * 0.06).toFixed(4)} POL
              </p>
              <p className="text-white/60" style={{ fontSize: `${fontSize.hint - 1}px` }}>
                Effective deposit amount: {(parseFloat(depositAmount) * 0.94).toFixed(4)} POL
              </p>
            </div>
          )}
          <div className="absolute right-3 top-3 text-white/60 text-sm">
            POL
          </div>
        </div>
        <div className="mt-2 text-sm text-white/60">
          Balance: {balance ? `${parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4)} ${balance.symbol}` : '0 POL'}
        </div>
      </div>

      {/* Period Selector Grid */}
      <div className="space-y-3">
        <label className="text-white/80 text-sm font-medium">Lockup Period</label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {STAKING_PERIODS.map((period) => (
            <button
              key={period.value}
              type="button"
              onClick={() => setLockupDuration(period.value)}
              className={`
                relative p-3 rounded-lg border-2 transition-all duration-200
                ${lockupDuration === period.value
                  ? 'border-emerald-500 bg-emerald-500/20'
                  : 'border-white/10 bg-white/5 hover:border-white/30'
                }
              `}
            >
              <div className="text-center">
                <p className={`text-sm font-bold mb-1 ${
                  lockupDuration === period.value ? 'text-emerald-400' : 'text-white'
                }`}>
                  {period.label}
                </p>
                <p className="text-xs text-white/60">{period.roi.annual}</p>
              </div>
              {lockupDuration === period.value && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onDeposit}
        disabled={!depositAmount || isPending || isConfirming || isPaused}
        className="w-full btn-primary"
      >
        {isPaused ? 'Contract Paused' : isPending || isConfirming ? 'Processing...' : 'Stake Now'}
      </button>
    </div>
  );
});

StakeTab.displayName = 'StakeTab';
export default StakeTab;
