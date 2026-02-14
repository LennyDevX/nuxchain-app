import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useAdvancedStaking } from '../../hooks/staking/useAdvancedStaking';

interface AdvancedUserStatsProps {
  className?: string;
}

/**
 * AdvancedUserStats - Deep analytics using previously unused View functions
 * Displays earnings breakdown, portfolio summary, user level/skills, and withdrawal readiness
 */
const AdvancedUserStats: React.FC<AdvancedUserStatsProps> = memo(({ className = '' }) => {
  const { userStats, earnings, withdrawable, nextUnlock, portfolio, isLoading } = useAdvancedStaking();

  if (isLoading) {
    return (
      <div className={`card-unified rounded-xl p-5 border border-white/10 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-white/10 rounded w-44"></div>
          <div className="grid grid-cols-3 gap-2">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-white/10 rounded"></div>)}
          </div>
          <div className="h-12 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (!earnings && !userStats && !portfolio) {
    return (
      <motion.div
        className={`card-unified rounded-xl p-5 border border-white/10 ${className}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-violet-400">📈</span>
          <h4 className="text-sm font-semibold text-white">Advanced Analytics</h4>
        </div>
        <p className="text-white/50 text-xs">Stake tokens to unlock advanced analytics</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`card-unified rounded-xl p-5 border border-white/10 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header + Level Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-violet-400 text-lg">📊</span>
          <h4 className="text-sm font-semibold text-white">Advanced Analytics</h4>
        </div>
        {userStats && (
          <div className="flex items-center gap-2">
            {userStats.hasAutoCompound && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-500/20 text-green-400 border border-green-500/30">
                🔄 Auto
              </span>
            )}
            <div className="px-2.5 py-1 rounded-full text-xs font-bold bg-violet-500/20 border border-violet-500/30 text-violet-300">
              Lv.{userStats.userLevel}
            </div>
          </div>
        )}
      </div>

      {/* Earnings Breakdown */}
      {earnings && (
        <div className="mb-4">
          <p className="text-white/40 text-[10px] mb-2 uppercase tracking-wide">Earnings Breakdown</p>
          <div className="grid grid-cols-3 gap-2">
            <motion.div
              className="bg-white/5 rounded-lg p-2.5 border border-white/5 text-center"
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            >
              <p className="text-white/40 text-[10px]">Daily</p>
              <p className="text-green-400 font-bold text-sm">{earnings.dailyEarnings}</p>
              <p className="text-white/20 text-[9px]">POL</p>
            </motion.div>
            <motion.div
              className="bg-white/5 rounded-lg p-2.5 border border-white/5 text-center"
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            >
              <p className="text-white/40 text-[10px]">Monthly</p>
              <p className="text-blue-400 font-bold text-sm">{earnings.monthlyEarnings}</p>
              <p className="text-white/20 text-[9px]">POL</p>
            </motion.div>
            <motion.div
              className="bg-white/5 rounded-lg p-2.5 border border-white/5 text-center"
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            >
              <p className="text-white/40 text-[10px]">Annual</p>
              <p className="text-purple-400 font-bold text-sm">{earnings.annualEarnings}</p>
              <p className="text-white/20 text-[9px]">POL</p>
            </motion.div>
          </div>
        </div>
      )}

      {/* Portfolio & Skills Row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Portfolio Value */}
        {portfolio && (
          <div className="bg-gradient-to-br from-white/5 to-white/0 rounded-lg p-3 border border-white/5">
            <p className="text-white/40 text-[10px] mb-1">Portfolio Value</p>
            <p className="text-white font-bold text-lg">{portfolio.totalValue}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-white/30 text-[10px]">Efficiency:</span>
              <span className={`text-[10px] font-bold ${
                portfolio.rewardEfficiency >= 70 ? 'text-emerald-400' :
                portfolio.rewardEfficiency >= 40 ? 'text-yellow-400' : 'text-orange-400'
              }`}>
                {portfolio.rewardEfficiency}%
              </span>
            </div>
          </div>
        )}

        {/* Skills Summary */}
        {userStats && (
          <div className="bg-gradient-to-br from-white/5 to-white/0 rounded-lg p-3 border border-white/5">
            <p className="text-white/40 text-[10px] mb-1">Active Skills</p>
            <div className="flex items-baseline gap-1">
              <p className="text-white font-bold text-lg">{userStats.activeSkillsCount}</p>
              <p className="text-white/30 text-xs">/ {userStats.maxActiveSkills}</p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {userStats.stakingBoostTotal > 0 && (
                <span className="text-emerald-400 text-[10px] font-medium">
                  +{(userStats.stakingBoostTotal / 100).toFixed(1)}% boost
                </span>
              )}
              {userStats.feeDiscountTotal > 0 && (
                <span className="text-blue-400 text-[10px] font-medium">
                  -{(userStats.feeDiscountTotal / 100).toFixed(1)}% fee
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Withdrawal Status + Next Unlock */}
      <div className="flex items-stretch gap-3">
        {/* Withdrawable */}
        {withdrawable && (
          <motion.div
            className={`flex-1 rounded-lg p-3 border ${
              withdrawable.withdrawableCount > 0
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : 'bg-white/5 border-white/5'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-white/40 text-[10px] mb-0.5">Ready to Withdraw</p>
            <div className="flex items-baseline gap-1">
              <span className={`font-bold text-sm ${withdrawable.withdrawableCount > 0 ? 'text-emerald-400' : 'text-white/50'}`}>
                {withdrawable.withdrawableCount}
              </span>
              <span className="text-white/30 text-[10px]">
                deposit{withdrawable.withdrawableCount !== 1 ? 's' : ''}
              </span>
            </div>
            {withdrawable.withdrawableCount > 0 && (
              <p className="text-emerald-400/70 text-[10px] mt-0.5">
                {withdrawable.withdrawableAmount} POL
              </p>
            )}
          </motion.div>
        )}

        {/* Next Unlock */}
        {nextUnlock && (
          <motion.div
            className={`flex-1 rounded-lg p-3 border ${
              nextUnlock.hasLockedDeposits
                ? 'bg-amber-500/10 border-amber-500/20'
                : 'bg-emerald-500/10 border-emerald-500/20'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-white/40 text-[10px] mb-0.5">Next Unlock</p>
            <p className={`font-bold text-sm ${nextUnlock.hasLockedDeposits ? 'text-amber-400' : 'text-emerald-400'}`}>
              {nextUnlock.formattedCountdown}
            </p>
            {nextUnlock.nextUnlockTime && (
              <p className="text-white/30 text-[10px] mt-0.5">
                {nextUnlock.nextUnlockTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </motion.div>
        )}
      </div>

      {/* User XP Bar */}
      {userStats && userStats.userLevel > 0 && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/40 text-[10px]">XP Progress</span>
            <span className="text-violet-400 text-[10px] font-medium">{userStats.userXP} XP</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
              style={{ width: `${Math.min(100, (Number(userStats.userXP) % 1000) / 10)}%` }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
});

AdvancedUserStats.displayName = 'AdvancedUserStats';

export default AdvancedUserStats;
