import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useStakingAnalytics } from '../../hooks/staking/useStakingAnalytics';

interface StakingEfficiencyCardProps {
  className?: string;
}

/**
 * StakingEfficiencyCard - Shows staking efficiency score and suggestions
 * Uses getStakingEfficiency() from the contract for gamification
 */
const StakingEfficiencyCard: React.FC<StakingEfficiencyCardProps> = memo(({ className = '' }) => {
  const { stakingEfficiency, loadingEfficiency } = useStakingAnalytics();

  if (loadingEfficiency) {
    return (
      <div className={`card-unified rounded-xl p-6 border border-white/20 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded w-48 mb-4"></div>
          <div className="h-24 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (!stakingEfficiency) {
    return (
      <motion.div 
        className={`card-unified rounded-xl p-6 border border-white/20 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-xl">⚡</span> Staking Efficiency
        </h3>
        <p className="text-white/60 text-sm">
          Connect your wallet and make a deposit to see your efficiency score and personalized suggestions.
        </p>
      </motion.div>
    );
  }

  const { score, level, suggestions, color } = stakingEfficiency;

  // Get gradient based on level
  const getGradient = () => {
    switch (level) {
      case 'Master': return 'from-yellow-500/20 via-amber-500/10 to-orange-500/20';
      case 'Excellent': return 'from-emerald-500/20 via-green-500/10 to-teal-500/20';
      case 'Good': return 'from-blue-500/20 via-indigo-500/10 to-purple-500/20';
      case 'Fair': return 'from-orange-500/20 via-amber-500/10 to-yellow-500/20';
      default: return 'from-red-500/20 via-rose-500/10 to-pink-500/20';
    }
  };

  // Get emoji for level
  const getLevelEmoji = () => {
    switch (level) {
      case 'Master': return '👑';
      case 'Excellent': return '🌟';
      case 'Good': return '✨';
      case 'Fair': return '📈';
      default: return '🎯';
    }
  };

  return (
    <motion.div 
      className={`card-unified rounded-xl p-6 border border-white/20 bg-gradient-to-br ${getGradient()} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-xl">⚡</span> Staking Efficiency
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-bold ${color} bg-white/10`}>
          {getLevelEmoji()} {level}
        </div>
      </div>

      {/* Score Display */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          {/* Background circle */}
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="12"
            />
            {/* Progress circle */}
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${score * 3.52} 352`}
              className={color}
              style={{ transition: 'stroke-dasharray 1s ease-out' }}
            />
          </svg>
          {/* Score text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${color}`}>{score}</span>
            <span className="text-white/60 text-xs">/ 100</span>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-white/80 text-sm font-semibold flex items-center gap-2">
            <span>💡</span> Suggestions to Improve
          </h4>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="text-purple-400 text-lg shrink-0">
                  {index === 0 ? '🎯' : index === 1 ? '📊' : '🚀'}
                </span>
                <p className="text-white/80 text-sm">{suggestion}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Perfect score message */}
      {score >= 90 && suggestions.length === 0 && (
        <div className="text-center p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
          <span className="text-3xl mb-2 block">🏆</span>
          <p className="text-emerald-400 font-semibold">Excellent Work!</p>
          <p className="text-white/60 text-sm mt-1">
            Your staking strategy is optimized for maximum returns.
          </p>
        </div>
      )}
    </motion.div>
  );
});

StakingEfficiencyCard.displayName = 'StakingEfficiencyCard';

export default StakingEfficiencyCard;
