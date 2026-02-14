import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useTreasuryStats } from '../../hooks/treasury/useTreasuryStats';

interface TreasuryHealthCardProps {
  className?: string;
}

/**
 * TreasuryHealthCard - Treasury transparency widget
 * Shows reserve health, fund allocations, and distribution stats
 */
const TreasuryHealthCard: React.FC<TreasuryHealthCardProps> = memo(({ className = '' }) => {
  const { stats, allocations, reserve, isLoading } = useTreasuryStats();

  if (isLoading) {
    return (
      <div className={`card-unified rounded-xl p-5 border border-white/10 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-white/10 rounded w-36"></div>
          <div className="h-20 bg-white/10 rounded"></div>
          <div className="h-12 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (!stats && !reserve) {
    return (
      <motion.div
        className={`card-unified rounded-xl p-5 border border-white/10 ${className}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-amber-400">🏦</span>
          <h4 className="text-sm font-semibold text-white">Treasury Status</h4>
        </div>
        <p className="text-white/50 text-xs">Treasury data unavailable</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`card-unified rounded-xl p-5 border border-white/10 bg-gradient-to-br from-amber-500/5 to-orange-500/5 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-lg">🏦</span>
          <h4 className="text-sm font-semibold text-white">Treasury Health</h4>
        </div>
        {reserve && (
          <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${reserve.healthColor} bg-white/5 border border-white/10`}>
            {reserve.healthLevel}
          </div>
        )}
      </div>

      {/* Key Metrics */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/5 rounded-lg p-3 border border-white/5">
            <p className="text-white/40 text-[10px] mb-0.5">Treasury Balance</p>
            <p className="text-white font-bold text-base">{stats.currentBalance}</p>
            <p className="text-white/30 text-[10px]">POL</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/5">
            <p className="text-white/40 text-[10px] mb-0.5">Total Distributed</p>
            <p className="text-emerald-400 font-bold text-base">{stats.totalDistributed}</p>
            <p className="text-white/30 text-[10px]">POL to date</p>
          </div>
        </div>
      )}

      {/* Reserve Health Bar */}
      {reserve && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-white/50 text-xs">Reserve Fund</span>
            <span className={`text-xs font-medium ${reserve.healthColor}`}>
              {reserve.currentBalance} POL
            </span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/10">
            <motion.div
              className={`h-2 rounded-full bg-gradient-to-r ${
                reserve.healthLevel === 'Excellent' ? 'from-emerald-500 to-green-400' :
                reserve.healthLevel === 'Healthy' ? 'from-green-500 to-emerald-400' :
                reserve.healthLevel === 'Moderate' ? 'from-yellow-500 to-amber-400' :
                reserve.healthLevel === 'Low' ? 'from-orange-500 to-amber-400' :
                'from-red-500 to-rose-400'
              }`}
              style={{
                width: `${Math.min(100, Math.max(5, reserve.allocationPercentage))}%`
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          {reserve.isEnabled && (
            <p className="text-white/30 text-[10px] mt-1">
              Auto-accumulation active · {reserve.allocationPercentage}% allocation
            </p>
          )}
        </div>
      )}

      {/* Allocation Breakdown - Mini Bars */}
      {allocations && allocations.items.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-white/40 text-[10px] font-medium uppercase tracking-wide">Fund Allocations</p>
          {allocations.items.map((item, index) => (
            <motion.div
              key={item.name}
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <span className="text-sm w-5 text-center">{item.emoji}</span>
              <span className="text-white/60 text-[11px] w-24 truncate">{item.name}</span>
              <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className={`h-1.5 rounded-full bg-gradient-to-r ${item.color}`}
                  style={{ width: `${(item.percentage / (allocations.total || 100)) * 100}%` }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                />
              </div>
              <span className="text-white/40 text-[10px] font-medium w-8 text-right">
                {item.percentage}%
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Auto-distribution status */}
      {stats && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/30">
              {stats.autoDistEnabled ? '🔄 Auto-distribution active' : '⏸️ Manual distribution'}
            </span>
            {stats.lastDistribution && (
              <span className="text-[10px] text-white/30">
                Last: {stats.lastDistribution.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
});

TreasuryHealthCard.displayName = 'TreasuryHealthCard';

export default TreasuryHealthCard;
