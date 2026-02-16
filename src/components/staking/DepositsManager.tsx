import React, { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDepositManagement, type DepositDetail } from '../../hooks/staking/useDepositManagement';

interface DepositsManagerProps {
  className?: string;
}

type FilterType = 'all' | 'flexible' | 'locked' | 'withdrawable';

/**
 * DepositsManager - Individual deposit management with per-deposit actions
 * Shows deposit breakdown by type, withdrawal status, and estimated rewards
 */
const DepositsManager: React.FC<DepositsManagerProps> = memo(({ className = '' }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const {
    deposits,
    depositsByType,
    withdrawalStatus,
    estimatedRewards,
    totalDeposits,
    withdrawableCount,
    lockedCount,
    withdrawDeposit,
    withdrawBoosted,
    isPending,
    isConfirming,
    isConfirmed,
    isLoading,
    refetch,
  } = useDepositManagement();

  // Refetch after confirmed transaction
  useEffect(() => {
    if (isConfirmed) {
      const timer = setTimeout(() => refetch(), 2000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, refetch]);

  const isTransacting = isPending || isConfirming;

  // Filter deposits
  const filteredDeposits = deposits.filter((d) => {
    switch (filter) {
      case 'flexible': return d.lockupDays === 0;
      case 'locked': return d.isLocked;
      case 'withdrawable': return d.isWithdrawable;
      default: return true;
    }
  });

  if (isLoading) {
    return (
      <div className={`card-unified rounded-xl p-5 border border-white/10 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-white/10 rounded w-36" />
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 bg-white/10 rounded-lg" />)}
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white/10 rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`card-unified rounded-xl border border-white/10 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📦</span>
            <div>
              <h3 className="text-sm font-semibold text-white">My Deposits</h3>
              <p className="text-white/40 text-[10px]">
                {totalDeposits} deposit{totalDeposits !== 1 ? 's' : ''} •{' '}
                {withdrawableCount} withdrawable • {lockedCount} locked
              </p>
            </div>
          </div>
        </div>

        {/* Deposit Distribution by Type */}
        {depositsByType && (
          <div className="grid grid-cols-5 gap-1.5 mb-4">
            {[
              { label: 'Flex', data: depositsByType.flexible, color: 'bg-emerald-500' },
              { label: '30D', data: depositsByType.locked30, color: 'bg-blue-500' },
              { label: '90D', data: depositsByType.locked90, color: 'bg-indigo-500' },
              { label: '180D', data: depositsByType.locked180, color: 'bg-purple-500' },
              { label: '365D', data: depositsByType.locked365, color: 'bg-orange-500' },
            ].map(({ label, data, color }) => (
              <div
                key={label}
                className="bg-white/5 rounded-lg p-2 text-center border border-white/5"
              >
                <div className={`w-2 h-2 rounded-full ${color} mx-auto mb-1`} />
                <p className="text-white/60 text-[9px]">{label}</p>
                <p className="text-white font-bold text-[11px]">{data.count}</p>
                <p className="text-white/30 text-[8px]">{data.totalAmount}</p>
              </div>
            ))}
          </div>
        )}

        {/* Estimated Rewards: Base vs Boosted */}
        {estimatedRewards && (
          <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-lg p-3 border border-emerald-500/15 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/40 text-[10px]">Estimated Daily Rewards</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-white/50 text-xs line-through">{estimatedRewards.baseEstimate}</span>
                  <span className="text-emerald-400 font-bold text-sm">{estimatedRewards.boostedEstimate} POL</span>
                </div>
              </div>
              {estimatedRewards.boostDifference !== '0.00' && (
                <span className="px-2 py-1 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400">
                  +{estimatedRewards.boostDifference} from skills
                </span>
              )}
            </div>
          </div>
        )}

        {/* Withdrawal Status */}
        {withdrawalStatus && (
          <div className="bg-white/5 rounded-lg p-3 border border-white/5 mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/40 text-[10px]">Daily Withdrawal Limit</span>
              <span className={`text-[10px] font-medium ${
                withdrawalStatus.canWithdraw ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {withdrawalStatus.canWithdraw ? '✓ Available' : '✕ Limit reached'}
              </span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  withdrawalStatus.dailyLimitUsedPercent > 80 ? 'bg-red-500' :
                  withdrawalStatus.dailyLimitUsedPercent > 50 ? 'bg-yellow-500' :
                  'bg-emerald-500'
                }`}
                style={{ width: `${withdrawalStatus.dailyLimitUsedPercent}%` }}
              />
            </div>
            <p className="text-white/30 text-[9px] mt-1">
              Remaining: {withdrawalStatus.dailyLimitRemaining} POL
            </p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex border-b border-white/10">
          {([
            { key: 'all' as FilterType, label: 'All', count: totalDeposits },
            { key: 'flexible' as FilterType, label: 'Flexible', count: deposits.filter(d => d.lockupDays === 0).length },
            { key: 'locked' as FilterType, label: 'Locked', count: lockedCount },
            { key: 'withdrawable' as FilterType, label: 'Ready', count: withdrawableCount },
          ]).map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                filter === key
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Deposits List */}
      <div className="p-5 pt-3 space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
        <AnimatePresence mode="popLayout">
          {filteredDeposits.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 rounded-lg p-6 text-center border border-dashed border-white/10"
            >
              <span className="text-2xl">📭</span>
              <p className="text-white/40 text-xs mt-2">
                {filter === 'all' ? 'No deposits found' : `No ${filter} deposits`}
              </p>
            </motion.div>
          ) : (
            filteredDeposits.map((deposit) => (
              <DepositCard
                key={deposit.index}
                deposit={deposit}
                onWithdraw={withdrawDeposit}
                onWithdrawBoosted={withdrawBoosted}
                isTransacting={isTransacting}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Transaction Status */}
      {isTransacting && (
        <div className="px-5 pb-4">
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-cyan-400 text-xs">
              {isPending ? 'Confirm in wallet...' : 'Processing withdrawal...'}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
});

// ============================================
// DEPOSIT CARD SUBCOMPONENT
// ============================================

interface DepositCardProps {
  deposit: DepositDetail;
  onWithdraw: (index: number) => void;
  onWithdrawBoosted: (index: number) => void;
  isTransacting: boolean;
}

const DepositCard: React.FC<DepositCardProps> = memo(({ deposit, onWithdraw, onWithdrawBoosted, isTransacting }) => {
  const statusColor = deposit.isWithdrawable
    ? 'border-emerald-500/20 bg-emerald-500/5'
    : deposit.isLocked
    ? 'border-amber-500/20 bg-amber-500/5'
    : 'border-white/10 bg-white/5';

  const lockupColor = {
    0: 'bg-emerald-500',
    30: 'bg-blue-500',
    90: 'bg-indigo-500',
    180: 'bg-purple-500',
    365: 'bg-orange-500',
  }[deposit.lockupDays] || 'bg-gray-500';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={`rounded-lg p-3 border ${statusColor}`}
    >
      {/* Top Row: Amount + Status */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${lockupColor}`} />
          <span className="text-white font-bold text-sm">{deposit.amount} POL</span>
          <span className="text-white/30 text-[10px]">#{deposit.index}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
            deposit.isWithdrawable
              ? 'bg-emerald-500/20 text-emerald-400'
              : deposit.isLocked
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-white/10 text-white/50'
          }`}>
            {deposit.isWithdrawable ? '✓ Ready' : deposit.isLocked ? `🔒 ${deposit.daysRemaining}d` : deposit.lockupType}
          </span>
        </div>
      </div>

      {/* Middle: Details */}
      <div className="flex items-center justify-between text-[10px] mb-2">
        <span className="text-white/40">
          {deposit.lockupType} • {deposit.depositDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
        </span>
        <span className="text-emerald-400/70">+{deposit.currentRewards} POL</span>
      </div>

      {/* Lock Progress Bar */}
      {deposit.lockupDays > 0 && (
        <div className="mb-2">
          <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
            <motion.div
              className={`h-1 rounded-full ${deposit.isWithdrawable ? 'bg-emerald-500' : 'bg-amber-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${deposit.progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-white/20 text-[8px]">Deposited</span>
            <span className="text-white/20 text-[8px]">
              {deposit.progressPercent}% • {deposit.unlockDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || 'Flexible'}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {deposit.isWithdrawable && (
        <div className="flex gap-2">
          <motion.button
            className="flex-1 py-1.5 rounded-lg text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isTransacting}
            onClick={() => onWithdraw(deposit.index)}
          >
            Withdraw
          </motion.button>
          <motion.button
            className="flex-1 py-1.5 rounded-lg text-[10px] font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isTransacting}
            onClick={() => onWithdrawBoosted(deposit.index)}
            title="Withdraw with skill-boosted rewards"
          >
            Boosted Withdraw
          </motion.button>
        </div>
      )}
    </motion.div>
  );
});

DepositCard.displayName = 'DepositCard';
DepositsManager.displayName = 'DepositsManager';

export default DepositsManager;
