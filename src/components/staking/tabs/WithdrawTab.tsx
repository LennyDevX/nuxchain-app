import { memo } from 'react';
import { formatEther } from 'viem';
import { motion } from 'framer-motion';

interface WithdrawalStatus {
  canWithdraw: boolean;
  dailyLimitRemaining: string;
  lockedUntilFormatted?: string;
}

interface WithdrawTabProps {
  userStaked: bigint | undefined;
  pendingRewards: bigint | undefined;
  withdrawalStatus: WithdrawalStatus | null;
  loadingWithdrawal: boolean;
  lockedDeposits: number;
  isPending: boolean;
  isConfirming: boolean;
  onWithdraw: () => void;
}

const WithdrawTab = memo(({
  userStaked,
  pendingRewards,
  withdrawalStatus,
  loadingWithdrawal,
  lockedDeposits,
  isPending,
  isConfirming,
  onWithdraw,
}: WithdrawTabProps) => {
  return (
    <div className="space-y-6">
      {/* Withdrawal Status Info from Contract */}
      {!loadingWithdrawal && withdrawalStatus && (
        <motion.div
          className={`p-4 rounded-lg border ${withdrawalStatus.canWithdraw
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : 'bg-amber-500/10 border-amber-500/30'
            }`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/70 text-sm">Withdrawal Status</span>
            <span className={`text-sm font-semibold ${withdrawalStatus.canWithdraw ? 'text-emerald-400' : 'text-amber-400'
              }`}>
              {withdrawalStatus.canWithdraw ? '✅ Available' : '⏳ Pending'}
            </span>
          </div>
          {withdrawalStatus.dailyLimitRemaining !== '0.00' && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/50">Daily Limit Remaining</span>
              <span className="text-white/80">{withdrawalStatus.dailyLimitRemaining} POL</span>
            </div>
          )}
          {!withdrawalStatus.canWithdraw && withdrawalStatus.lockedUntilFormatted && (
            <p className="text-amber-300/80 text-xs mt-2">
              🔒 Next unlock: {withdrawalStatus.lockedUntilFormatted}
            </p>
          )}
        </motion.div>
      )}

      {lockedDeposits > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
          <p className="text-amber-400 text-sm">
            ⚠️ You have {lockedDeposits} locked deposit(s) that may incur penalties if withdrawn early
          </p>
        </div>
      )}

      <div className="text-center">
        <p className="text-white/80 mb-4">
          Withdraw all your staked amount and accumulated rewards
        </p>
        <p className="text-2xl font-bold text-white mb-6">
          Total: {userStaked ? `${parseFloat(formatEther(userStaked)).toFixed(6)} POL` : '0 POL'} (Staked)
        </p>
        <p className="text-lg text-yellow-400 mb-6">
          + {pendingRewards ? `${parseFloat(formatEther(pendingRewards)).toFixed(6)} POL` : '0 POL'} (Rewards)
        </p>
      </div>

      <button
        onClick={onWithdraw}
        disabled={isPending || isConfirming}
        className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg"
      >
        {isPending || isConfirming ? 'Processing...' : 'Withdraw All (Stake + Rewards)'}
      </button>
    </div>
  );
});

WithdrawTab.displayName = 'WithdrawTab';
export default WithdrawTab;
