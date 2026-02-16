import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useDynamicAPY } from '../../hooks/apy/useDynamicAPY';

interface DynamicAPYIndicatorProps {
  currentTVL?: bigint;
  skillBoostBps?: number; // User's total skill boost in basis points
  className?: string;
}

/**
 * DynamicAPYIndicator - Real-time APY display with TVL-based multiplier
 * Shows dynamic rates, multiplier badge, and APY curve preview
 */
const DynamicAPYIndicator: React.FC<DynamicAPYIndicatorProps> = memo(({ currentTVL, skillBoostBps = 0, className = '' }) => {
  const { 
    isEnabled, 
    multiplier, 
    dynamicRates, 
    apyPreview, 
    targetTVL, 
    minMultiplier, 
    maxMultiplier, 
    treasuryHealthMultiplier,
    treasuryHealthStatus,
    treasuryHealthMessage,
    payoutRatio,
    isLoading,
    hasData,
  } = useDynamicAPY(currentTVL);

  // Determine multiplier quality
  const multiplierInfo = useMemo(() => {
    const mul = parseFloat(multiplier);
    if (mul >= 1.3) return { label: 'Boosted', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' };
    if (mul >= 1.1) return { label: 'Active', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' };
    if (mul >= 1.0) return { label: 'Standard', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' };
    return { label: 'Reduced', color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' };
  }, [multiplier]);

  // Treasury health styling
  const treasuryHealthInfo = useMemo(() => {
    switch (treasuryHealthStatus) {
      case 'Critical':
        return { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: '🚨' };
      case 'Warning':
        return { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: '⚠️' };
      case 'Moderate':
        return { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: '⚡' };
      case 'Healthy':
        return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: '✅' };
      default:
        return { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30', icon: '•' };
    }
  }, [treasuryHealthStatus]);

  if (isLoading) {
    return (
      <div className={`card-unified rounded-xl p-5 border border-white/10 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-white/10 rounded w-40"></div>
          <div className="h-16 bg-white/10 rounded"></div>
          <div className="grid grid-cols-5 gap-2">
            {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-white/10 rounded"></div>)}
          </div>
        </div>
      </div>
    );
  }

  // Show fallback with base rates when contract data is unavailable
  if (!hasData) {
    const contractAddr = import.meta.env.VITE_DYNAMIC_APY_CALCULATOR_ADDRESS as string | undefined;
    const isNotDeployed = !contractAddr || contractAddr === 'undefined';
    
    return (
      <motion.div
        className={`card-unified rounded-xl p-5 border border-white/10 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 ${className}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 text-lg">⚡</span>
            <h4 className="text-sm font-semibold text-white">Dynamic APY</h4>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            {isNotDeployed ? 'Not Deployed' : 'Connecting...'}
          </div>
        </div>
        <div className="grid grid-cols-5 gap-1.5 mb-3">
          {dynamicRates.map((rate) => (
            <div key={rate.periodName} className="text-center p-2 bg-white/5 rounded-lg border border-white/5">
              <p className="text-white/40 text-[10px] mb-0.5">{rate.days === 0 ? 'Flex' : `${rate.days}d`}</p>
              <p className="text-white font-bold text-sm">{rate.baseAPY.toFixed(1)}%</p>
              <p className="text-white/30 text-[9px]">base</p>
            </div>
          ))}
        </div>
        <p className="text-white/30 text-[10px] text-center">
          {isNotDeployed 
            ? '⚠️ DynamicAPYCalculator contract pending deployment. Showing base rates only.'
            : 'Dynamic APY rates loading from contract...'
          }
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`card-unified rounded-xl p-5 border border-white/10 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 text-lg">⚡</span>
          <h4 className="text-sm font-semibold text-white">Dynamic APY</h4>
        </div>
        <div className="flex items-center gap-2">
          {/* Multiplier Badge */}
          <motion.div
            className={`px-2.5 py-1 rounded-full text-xs font-bold ${multiplierInfo.bg} ${multiplierInfo.border} border ${multiplierInfo.color}`}
            whileHover={{ scale: 1.05 }}
          >
            {multiplier}
          </motion.div>
          {/* Status */}
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${isEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`}></span>
            {isEnabled ? 'Live' : 'Static'}
          </div>
        </div>
      </div>

      {/* Dynamic Rates Grid */}
      <div className="grid grid-cols-5 gap-1.5 mb-4">
        {dynamicRates.map((rate, index) => {
          const effectiveAPY = skillBoostBps > 0
            ? rate.dynamicAPY * (1 + skillBoostBps / 10000)
            : rate.dynamicAPY;
          return (
            <motion.div
              key={rate.periodName}
              className="text-center p-2 bg-white/5 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-colors"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}
            >
              <p className="text-white/40 text-[10px] mb-0.5">{rate.days === 0 ? 'Flex' : `${rate.days}d`}</p>
              <p className="text-white font-bold text-sm">{rate.dynamicAPY.toFixed(1)}%</p>
              {skillBoostBps > 0 && (
                <p className="text-purple-400 text-[10px] font-medium">
                  → {effectiveAPY.toFixed(1)}%
                </p>
              )}
              {rate.boost !== 0 && !skillBoostBps && (
                <p className={`text-[10px] font-medium ${rate.boost > 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                  {rate.boost > 0 ? '+' : ''}{rate.boost.toFixed(1)}%
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Skill Boost Summary */}
      {skillBoostBps > 0 && (
        <div className="mb-3 p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <span className="text-purple-300 text-[10px]">🎮 Skill Boost Active</span>
            <span className="text-purple-400 text-xs font-bold">+{(skillBoostBps / 100).toFixed(1)}%</span>
          </div>
          <p className="text-white/30 text-[9px] mt-0.5">
            Your effective APY includes skill multiplier on all rates
          </p>
        </div>
      )}

      {/* Treasury Health Warning - Only show if not Healthy */}
      {treasuryHealthStatus !== 'Healthy' && (
        <motion.div
          className={`mb-3 p-2.5 rounded-lg border ${treasuryHealthInfo.bg} ${treasuryHealthInfo.border}`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start gap-2">
            <span className="text-sm">{treasuryHealthInfo.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-[11px] font-medium ${treasuryHealthInfo.color} leading-tight`}>
                {treasuryHealthMessage}
              </p>
              {payoutRatio > 0 && (
                <p className="text-[10px] text-white/40 mt-1">
                  Payout ratio: {(payoutRatio * 100).toFixed(1)}% · Treasury adjustment: {treasuryHealthMultiplier.toFixed(2)}x
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* APY Curve Preview - Mini Bar Chart */}
      {apyPreview && apyPreview.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/40 text-[10px]">APY by TVL Level</span>
            <span className="text-white/30 text-[10px]">Target: {targetTVL} POL</span>
          </div>
          <div className="flex items-end gap-1 h-12">
            {apyPreview.map((point, i) => {
              const maxAPY = Math.max(...apyPreview.map(p => p.apy));
              const heightPercent = maxAPY > 0 ? (point.apy / maxAPY) * 100 : 0;
              return (
                <motion.div
                  key={i}
                  className="flex-1 group relative"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  style={{ transformOrigin: 'bottom' }}
                >
                  <div
                    className="w-full bg-gradient-to-t from-cyan-500/40 to-cyan-400/20 rounded-t-sm border-t border-cyan-400/50 hover:from-cyan-500/60 hover:to-cyan-400/40 transition-colors cursor-help"
                    style={{ height: `${Math.max(heightPercent, 8)}%` }}
                  ></div>
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                    <div className="bg-gray-900 border border-white/20 rounded px-2 py-1 text-[10px] text-white whitespace-nowrap">
                      {point.tvl}: {point.apy.toFixed(1)}%
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-white/20 text-[8px]">{apyPreview[0]?.tvl}</span>
            <span className="text-white/20 text-[8px]">{apyPreview[apyPreview.length - 1]?.tvl}</span>
          </div>
        </div>
      )}

      {/* Info Footer */}
      <div className="pt-2 border-t border-white/5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-white/30">TVL Range: {minMultiplier} – {maxMultiplier}</span>
          <span className={`text-[10px] font-medium ${multiplierInfo.color}`}>{multiplierInfo.label}</span>
        </div>
        {treasuryHealthMultiplier < 1.0 && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/40">Treasury Health:</span>
            <span className={`text-[10px] font-bold ${treasuryHealthInfo.color}`}>
              {treasuryHealthInfo.icon} {treasuryHealthStatus} ({treasuryHealthMultiplier.toFixed(2)}x)
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
});

DynamicAPYIndicator.displayName = 'DynamicAPYIndicator';

export default DynamicAPYIndicator;
