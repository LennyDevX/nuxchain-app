import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStakingAnalytics } from '../../hooks/staking/useStakingAnalytics';

interface UserRewardsProjectionProps {
  className?: string;
}

/**
 * UserRewardsProjection - Compact & Professional Rewards Display
 * Uses getUserRewardsProjection() from the contract
 */
const UserRewardsProjection: React.FC<UserRewardsProjectionProps> = memo(({ 
  className = '' 
}) => {
  const { rewardsProjection, loadingProjection } = useStakingAnalytics();
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1); // Default: Daily

  // Time periods with abbreviated labels
  const periods = [
    { key: '1h', label: '1h', value: rewardsProjection?.hourly || '0.00' },
    { key: '1d', label: '1d', value: rewardsProjection?.daily || '0.00' },
    { key: '1w', label: '1w', value: rewardsProjection?.weekly || '0.00' },
    { key: '1m', label: '1m', value: rewardsProjection?.monthly || '0.00' },
    { key: '1y', label: '1y', value: rewardsProjection?.yearly || '0.00' },
  ];

  // Loading state
  if (loadingProjection) {
    return (
      <div className={`card-unified rounded-xl p-5 border border-white/10 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-5 bg-white/10 rounded w-32"></div>
            <div className="h-4 bg-white/10 rounded w-20"></div>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-8 w-10 bg-white/10 rounded-lg"></div>
            ))}
          </div>
          <div className="h-12 bg-white/10 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!rewardsProjection) {
    return (
      <motion.div 
        className={`card-unified rounded-xl p-5 border border-white/10 ${className}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-purple-400">📊</span>
          <h4 className="text-sm font-semibold text-white">Rewards Projection</h4>
        </div>
        <p className="text-white/50 text-xs">
          Stake POL to see your projected earnings
        </p>
      </motion.div>
    );
  }

  const currentValue = periods[selectedPeriod].value;
  const pendingRewards = rewardsProjection.pending || '0.00';

  return (
    <motion.div 
      className={`card-unified rounded-xl p-5 border border-white/10 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-purple-400 text-lg">📊</span>
          <h4 className="text-sm font-semibold text-white">Rewards Projection</h4>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
          <span className="text-emerald-400 text-xs font-medium">{pendingRewards} POL</span>
        </div>
      </div>

      {/* Period Selector - Compact Pills */}
      <div className="flex gap-1.5 mb-4 p-1 bg-white/5 rounded-lg">
        {periods.map((period, index) => (
          <button
            key={period.key}
            onClick={() => setSelectedPeriod(index)}
            className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all duration-200 ${
              selectedPeriod === index
                ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Main Value Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedPeriod}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
          className="bg-white/5 rounded-lg p-4 border border-white/5"
        >
          <div className="flex items-end justify-between">
            <div>
              <p className="text-white/40 text-xs mb-1">
                Est. {periods[selectedPeriod].key === '1h' ? 'Hourly' : 
                       periods[selectedPeriod].key === '1d' ? 'Daily' :
                       periods[selectedPeriod].key === '1w' ? 'Weekly' :
                       periods[selectedPeriod].key === '1m' ? 'Monthly' : 'Yearly'}
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-white">{currentValue}</span>
                <span className="text-sm text-white/50">POL</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs">Annual</p>
              <p className="text-emerald-400 font-semibold text-sm">{periods[4].value} POL</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Quick Stats Row */}
      <div className="flex justify-between mt-3 pt-3 border-t border-white/5">
        <div className="flex gap-4">
          {periods.slice(0, 3).map((p, i) => (
            <div key={p.key} className={`text-center ${selectedPeriod === i ? 'opacity-40' : ''}`}>
              <p className="text-white/70 text-xs font-medium">{p.value}</p>
              <p className="text-white/30 text-[10px]">{p.label}</p>
            </div>
          ))}
        </div>
        <div className="text-right">
          <p className="text-[10px] text-white/30">Based on current stake</p>
        </div>
      </div>
    </motion.div>
  );
});

UserRewardsProjection.displayName = 'UserRewardsProjection';

export default UserRewardsProjection;
