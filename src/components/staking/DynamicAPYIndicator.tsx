import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useDynamicAPY } from '../../hooks/apy/useDynamicAPY';

interface DynamicAPYIndicatorProps {
  currentTVL?: bigint;
  skillBoostBps?: number; // User's total skill boost in basis points
  className?: string;
}

/**
 * CircularProgress - SVG circular progress indicator for TVL milestones
 */
const CircularProgress: React.FC<{
  progress: number;
  total: number;
  filled: boolean;
  label: string;
  index: number;
}> = ({ progress, total, filled, label, index }) => {
  const radius = 36;
  const stroke = 6;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
    >
      <div className="relative w-20 h-20">
        {/* Background circle */}
        <svg
          height="80"
          width="80"
          className="absolute top-0 left-0 transform -rotate-90"
        >
          <circle
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={stroke}
            fill="transparent"
            r={normalizedRadius}
            cx="40"
            cy="40"
          />
          {/* Progress circle */}
          <circle
            stroke={filled ? '#10b981' : '#06b6d4'}
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            r={normalizedRadius}
            cx="40"
            cy="40"
            className="transition-all duration-500"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`jersey-20-regular text-2xl lg:text-3xl font-bold ${filled ? 'text-emerald-400' : 'text-white'}`}>
            {filled ? '✓' : '○'}
          </span>
          <span className="jersey-20-regular text-base lg:text-lg text-white/50">{label}</span>
        </div>

        {/* Filled indicator glow */}
        {filled && (
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-pulse" />
        )}
      </div>
      
      {/* Label below */}
      <div className="mt-2 text-center">
        <p className={`jersey-20-regular text-base lg:text-lg font-semibold ${filled ? 'text-emerald-400' : 'text-white/70'}`}>
          {total >= 1000 ? `${total/1000}M` : total} POL
        </p>
        {filled && <p className="jersey-20-regular text-sm lg:text-base text-emerald-400/70">APY Adj</p>}
      </div>
    </motion.div>
  );
};
const DynamicAPYIndicator: React.FC<DynamicAPYIndicatorProps> = memo(({ 
  currentTVL, 
  skillBoostBps = 0, 
  className = '' 
}) => {
  const { 
    isEnabled, 
    multiplier, 
    isLoading,
    hasData,
  } = useDynamicAPY(currentTVL);

  // Calculate TVL milestones (3 milestones: 1M, 2M, 4M)
  const tvlMilestones = useMemo(() => {
    const tvlInPol = currentTVL ? Number(currentTVL) / 1e18 : 0;
    const milestones = [1000, 2000, 4000]; // 3 milestones in thousands
    
    return milestones.map((target, index) => {
      const previousTarget = index === 0 ? 0 : milestones[index - 1];
      const progressInThisMilestone = Math.max(0, Math.min(tvlInPol - previousTarget, target - previousTarget));
      const progressPercent = (progressInThisMilestone / (target - previousTarget)) * 100;
      const isFilled = tvlInPol >= target;
      const isActive = tvlInPol > previousTarget && tvlInPol < target;
      
      return {
        target,
        progress: isFilled ? 100 : progressPercent,
        filled: isFilled,
        active: isActive,
        label: isFilled ? (target === 1000 ? 'Full APY' : `${(1000/target).toFixed(1)}x APY`) : isActive ? 'Filling' : 'Pending',
      };
    });
  }, [currentTVL]);

  const totalTVL = useMemo(() => {
    return currentTVL ? (Number(currentTVL) / 1e18).toLocaleString() : '0';
  }, [currentTVL]);

  // Check if APY is currently being reduced (TVL > 1M)
  const isAPYReducing = useMemo(() => {
    const tvlInPol = currentTVL ? Number(currentTVL) / 1e18 : 0;
    return tvlInPol > 1000000;
  }, [currentTVL]);

  // Determine multiplier quality
  const multiplierInfo = useMemo(() => {
    const mul = parseFloat(multiplier);
    if (mul >= 0.9) return { label: 'Optimal', color: 'text-emerald-400' };
    if (mul >= 0.7) return { label: 'Active', color: 'text-cyan-400' };
    if (mul >= 0.5) return { label: 'Scaled', color: 'text-blue-400' };
    return { label: 'Compressed', color: 'text-orange-400' };
  }, [multiplier]);

  if (isLoading) {
    return (
      <div className={`card-unified rounded-xl p-4 border border-white/10 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-white/10 rounded w-full"></div>
          <div className="flex justify-between gap-3">
            {[1,2,3].map(i => <div key={i} className="w-16 h-16 bg-white/10 rounded-full"></div>)}
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
            <span className="text-cyan-400 text-xl lg:text-2xl">⚡</span>
            <h4 className="jersey-15-regular text-2xl lg:text-3xl font-semibold text-white">Dynamic APY</h4>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full jersey-20-regular text-[10px] lg:text-xs bg-amber-500/10 text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            {isNotDeployed ? 'Not Deployed' : 'Connecting...'}
          </div>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="jersey-20-regular text-white/40 text-xs lg:text-sm text-center">
            {isNotDeployed 
              ? '⚠️ DynamicAPYCalculator contract pending deployment.'
              : 'Loading contract data...'
            }
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`card-unified rounded-xl border border-white/10 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-cyan-400 text-xl">⚡</span>
            </div>
            <div>
              <h4 className="jersey-15-regular text-2xl lg:text-3xl font-semibold text-white leading-none">Dynamic APY</h4>
              <p className="jersey-20-regular text-white/40 text-xs lg:text-sm mt-0.5">TVL-based scaling · treasury protection</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full jersey-20-regular text-xs font-medium border flex-shrink-0 ${
            isEnabled
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
            {isEnabled ? 'Live' : 'Static'}
          </div>
        </div>

        {/* Hero Row: Multiplier + TVL */}
        <div className="flex items-end justify-between">
          {/* Multiplier — hero number */}
          <div>
            <p className="jersey-20-regular text-white/40 text-xs mb-0.5">Current Multiplier</p>
            <motion.p
              className={`jersey-15-regular font-bold text-4xl lg:text-5xl leading-none ${multiplierInfo.color}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {multiplier}
            </motion.p>
            <p className={`jersey-20-regular text-sm mt-0.5 ${multiplierInfo.color}`}>{multiplierInfo.label}</p>
          </div>

          {/* TVL */}
          <div className="text-right">
            <p className="jersey-20-regular text-white/40 text-xs mb-0.5">Total TVL</p>
            <p className="jersey-15-regular text-2xl lg:text-3xl text-cyan-400 font-bold leading-none">{totalTVL}</p>
            <p className="jersey-20-regular text-white/40 text-xs mt-0.5">POL</p>
          </div>
        </div>
      </div>

      {/* TVL Milestones */}
      <div className="px-4 pt-3 pb-3">
        <div className="flex items-center justify-between mb-3">
          <p className="jersey-20-regular text-white/50 text-xs lg:text-sm">
            APY milestones · reduces after 1M POL
          </p>
          <span className="jersey-20-regular text-xs text-cyan-400">
            {tvlMilestones.filter(m => m.filled).length}/3
          </span>
        </div>

        {/* Circular Progress Row */}
        <div className="flex items-start justify-between gap-2">
          {tvlMilestones.map((milestone, index) => (
            <CircularProgress
              key={milestone.target}
              progress={milestone.progress}
              total={milestone.target}
              filled={milestone.filled}
              label={milestone.label}
              index={index}
            />
          ))}
        </div>

        {/* Circular TVL Progress Arc */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-4">
          {/* SVG Ring */}
          <div className="relative flex-shrink-0 w-16 h-16">
            <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
              {/* Track */}
              <circle
                cx="32" cy="32" r="26"
                fill="none"
                stroke="rgba(255,255,255,0.07)"
                strokeWidth="7"
              />
              {/* Progress */}
              <motion.circle
                cx="32" cy="32" r="26"
                fill="none"
                stroke={isAPYReducing ? '#f59e0b' : '#10b981'}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 26}
                initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                animate={{
                  strokeDashoffset:
                    2 * Math.PI * 26 *
                    (1 - Math.min(parseFloat(totalTVL.replace(/,/g, '')) / 4000000, 1))
                }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="jersey-15-regular text-[11px] font-bold text-white leading-none">
                {Math.round(Math.min(parseFloat(totalTVL.replace(/,/g, '')) / 4000000 * 100, 100))}%
              </span>
            </div>
          </div>

          {/* Labels */}
          <div className="flex-1">
            <p className={`jersey-15-regular text-sm font-semibold ${isAPYReducing ? 'text-orange-400' : 'text-emerald-400'}`}>
              {isAPYReducing ? '⚠ APY Reducing' : '✓ Full APY Active'}
            </p>
            <p className="jersey-20-regular text-white/30 text-xs mt-0.5">
              {totalTVL} / 4,000,000 POL
            </p>
          </div>
        </div>
      </div>

      {/* Skill Boost */}
      {skillBoostBps > 0 && (
        <div className="px-4 pb-4">
          <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎮</span>
              <span className="jersey-20-regular text-purple-300 text-sm lg:text-base">Skill Boost Active</span>
            </div>
            <span className="jersey-15-regular text-purple-400 text-lg lg:text-xl font-bold">+{(skillBoostBps / 100).toFixed(1)}%</span>
          </div>
        </div>
      )}
    </motion.div>
  );
});

DynamicAPYIndicator.displayName = 'DynamicAPYIndicator';

export default DynamicAPYIndicator;
