import React, { memo, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSkillsManagement, type ActiveSkillDetail } from '../../hooks/staking/useSkillsManagement';
import { gamificationToasts } from '../../utils/toasts/gamificationToasts';
import { formatSkillBoost } from '../../utils/staking/formatters';
import { validateSkillActivation } from '../../utils/staking/validators';

interface SkillsManagerProps {
  className?: string;
}

/**
 * SkillsManager - Display active skills, activate/deactivate, show boost impact
 * Uses useSkillsManagement hook for all contract interactions
 */
const SkillsManager: React.FC<SkillsManagerProps> = memo(({ className = '' }) => {
  const {
    activeSkills,
    skillEffectiveness,
    availableSkills,
    totalBoost,
    activeCount,
    maxSlots,
    hasAutoCompound,
    activateSkill,
    deactivateSkill,
    isPending,
    isConfirming,
    isConfirmed,
    isLoading,
    refetch,
  } = useSkillsManagement();

  const skillToastRef = useRef<string | undefined>(undefined);

  // Loading → success toast pattern
  useEffect(() => {
    if (isPending && !skillToastRef.current) {
      skillToastRef.current = gamificationToasts.txPending('Processing skill transaction');
    }
    if (isConfirmed) {
      gamificationToasts.txConfirmed(skillToastRef.current);
      skillToastRef.current = undefined;
      const timer = setTimeout(() => refetch(), 2000);
      return () => clearTimeout(timer);
    }
  }, [isPending, isConfirmed, refetch]);

  // Calculate boost limit info
  const MAX_STAKING_BOOST = 3750; // 37.5%
  const boostUsagePercent = Math.min(100, (totalBoost / MAX_STAKING_BOOST) * 100);
  const remainingBoostBps = MAX_STAKING_BOOST - totalBoost;

  // Preview: what would APY be if user activates a skill
  const previewSkillActivation = useMemo(() => {
    return (skillEffect: number) => {
      const validation = validateSkillActivation(
        totalBoost,
        skillEffect,
        activeCount,
        maxSlots
      );
      return {
        ...validation,
        projectedBoost: totalBoost + skillEffect,
        projectedPercent: ((totalBoost + skillEffect) / 100).toFixed(2),
      };
    };
  }, [totalBoost, activeCount, maxSlots]);

  // Handle skill activation with validation & toast
  const handleActivate = (tokenId: bigint, _skillName: string, effectValue: number) => {
    const validation = validateSkillActivation(totalBoost, effectValue, activeCount, maxSlots);
    if (!validation.isValid) {
      gamificationToasts.boostLimitReached();
      return;
    }
    activateSkill(tokenId);
  };

  // Handle skill deactivation with toast
  const handleDeactivate = (tokenId: bigint) => {
    deactivateSkill(tokenId);
  };

  if (isLoading) {
    return (
      <div className={`card-unified rounded-xl p-5 border border-white/10 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-white/10 rounded w-32" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-white/10 rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`card-unified rounded-xl border border-white/10 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <div>
              <h3 className="jersey-15-regular text-2xl lg:text-3xl font-semibold text-white">Skills Manager</h3>
              <p className="jersey-20-regular text-white/40 text-base lg:text-lg">Activate NFT skills to boost rewards</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasAutoCompound && (
              <span className="px-3 py-1 rounded-full jersey-20-regular text-sm lg:text-base bg-green-500/20 text-green-400 border border-green-500/30">
                🔄 Auto
              </span>
            )}
            <span className="px-4 py-2 rounded-full jersey-15-regular text-base lg:text-lg font-bold bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">
              {activeCount}/{maxSlots} Slots
            </span>
          </div>
        </div>

        {/* Skill Effectiveness Summary */}
        {skillEffectiveness && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/5 rounded-lg p-4 text-center border border-white/5">
              <p className="jersey-20-regular text-white/40 text-sm lg:text-base">Base Rewards</p>
              <p className="jersey-20-regular text-white/70 font-semibold text-lg lg:text-xl">{skillEffectiveness.baseRewards}</p>
              <p className="jersey-20-regular text-white/30 text-sm lg:text-base">POL/day</p>
            </div>
            <div className="bg-emerald-500/10 rounded-lg p-4 text-center border border-emerald-500/20">
              <p className="jersey-20-regular text-emerald-400/60 text-sm lg:text-base">Boosted</p>
              <p className="jersey-20-regular text-emerald-400 font-bold text-lg lg:text-xl">{skillEffectiveness.boostedRewards}</p>
              <p className="jersey-20-regular text-emerald-400/30 text-sm lg:text-base">POL/day</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center border border-white/5">
              <p className="jersey-20-regular text-white/40 text-sm lg:text-base">Total Boost</p>
              <p className="jersey-20-regular text-purple-400 font-bold text-lg lg:text-xl">+{(totalBoost / 100).toFixed(1)}%</p>
              {skillEffectiveness.feeDiscount > 0 && (
                <p className="jersey-20-regular text-blue-400 text-sm lg:text-base">-{skillEffectiveness.feeDiscount}% fee</p>
              )}
            </div>
          </div>
        )}

        {/* Boost Limit Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="jersey-20-regular text-white/40 text-base lg:text-lg">Staking Boost Limit</span>
            <span className={`jersey-15-regular text-base lg:text-lg font-medium ${
              boostUsagePercent >= 90 ? 'text-red-400' :
              boostUsagePercent >= 70 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {(totalBoost / 100).toFixed(1)}% / 37.5%
            </span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
            <motion.div
              className={`h-3 rounded-full ${
                boostUsagePercent >= 90 ? 'bg-gradient-to-r from-red-500 to-red-400' :
                boostUsagePercent >= 70 ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                'bg-gradient-to-r from-indigo-500 to-purple-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${boostUsagePercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="jersey-20-regular text-white/30 text-sm lg:text-base mt-1">
            Remaining: +{(remainingBoostBps / 100).toFixed(2)}% available
          </p>
        </div>
      </div>

      {/* Active Skills */}
      <div className="px-5 pb-4">
        <p className="jersey-15-regular text-white/40 text-base lg:text-lg uppercase tracking-wide mb-3">Active Skills</p>
        {activeSkills.length === 0 ? (
          <div className="bg-white/5 rounded-lg p-6 text-center border border-dashed border-white/10">
            <p className="jersey-20-regular text-white/40 text-lg lg:text-xl">No active skills</p>
            <p className="jersey-20-regular text-white/30 text-base lg:text-lg mt-2">Purchase skill NFTs from the marketplace to activate boosts</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {activeSkills.map((skill) => (
                <SkillCard
                  key={skill.tokenId.toString()}
                  skill={skill}
                  onDeactivate={(tokenId) => handleDeactivate(tokenId)}
                  isTransacting={isPending || isConfirming}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Available Skills to Activate */}
      {availableSkills.length > 0 && activeCount < maxSlots && (
        <div className="px-5 pb-5 pt-3 border-t border-white/5">
          <p className="jersey-15-regular text-white/40 text-base lg:text-lg uppercase tracking-wide mb-3">Available Skills</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableSkills.filter(s => s.isEnabled).slice(0, 6).map((skill) => {
              const preview = previewSkillActivation(skill.defaultEffect);
              const canActivate = preview.isValid;
              return (
                <motion.button
                  key={skill.skillType}
                  className={`rounded-lg p-4 border text-left transition-all group ${
                    canActivate
                      ? 'bg-white/5 hover:bg-white/10 border-white/10'
                      : 'bg-red-500/5 border-red-500/15 opacity-60 cursor-not-allowed'
                  }`}
                  whileHover={canActivate ? { scale: 1.02 } : {}}
                  whileTap={canActivate ? { scale: 0.98 } : {}}
                  disabled={isPending || isConfirming || !canActivate}
                  onClick={() => handleActivate(BigInt(skill.skillType), skill.skillName, skill.defaultEffect)}
                >
                  <p className="jersey-15-regular text-white text-base lg:text-lg font-medium">{skill.skillName}</p>
                  <p className="jersey-20-regular text-white/40 text-sm lg:text-base">{formatSkillBoost(skill.defaultEffect)} boost</p>
                  {canActivate ? (
                    <span className="jersey-20-regular text-blue-400 text-sm lg:text-base opacity-0 group-hover:opacity-100 transition-opacity">
                      → Total: +{preview.projectedPercent}%
                    </span>
                  ) : (
                    <span className="jersey-20-regular text-red-400 text-sm lg:text-base">
                      Exceeds limit
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Transaction Status */}
      {(isPending || isConfirming) && (
        <div className="px-5 pb-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span className="jersey-20-regular text-blue-400 text-base lg:text-lg">
              {isPending ? 'Confirm in wallet...' : 'Processing transaction...'}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
});

// ============================================
// SKILL CARD SUBCOMPONENT
// ============================================

interface SkillCardProps {
  skill: ActiveSkillDetail;
  onDeactivate: (tokenId: bigint) => void;
  isTransacting: boolean;
}

const SkillCard: React.FC<SkillCardProps> = memo(({ skill, onDeactivate, isTransacting }) => {
  const rarityBg = {
    'text-gray-400': 'from-gray-500/10 to-gray-500/5 border-gray-500/20',
    'text-green-400': 'from-green-500/10 to-green-500/5 border-green-500/20',
    'text-blue-400': 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
    'text-purple-400': 'from-purple-500/10 to-purple-500/5 border-purple-500/20',
    'text-orange-400': 'from-orange-500/10 to-orange-500/5 border-orange-500/20',
  }[skill.rarityColor] || 'from-white/5 to-white/0 border-white/10';

  // Format time remaining - use daysRemaining from skill data
  const formatTimeRemaining = () => {
    if (skill.isExpired) return '⚠️ Expired';
    if (!skill.expiresAt) return 'Permanent';
    
    // Use pre-calculated daysRemaining, show hours only for last day
    if (skill.daysRemaining <= 1) {
      const hoursRemaining = Math.max(0, skill.daysRemaining * 24);
      return `${hoursRemaining}h left`;
    }
    return `${skill.daysRemaining}d left`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-gradient-to-r ${rarityBg} rounded-lg p-4 border`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Skill Name and Badge Row */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="jersey-15-regular text-white text-base lg:text-lg font-medium truncate">{skill.skillName}</span>
            <span className={`${skill.rarityColor} jersey-15-regular text-sm lg:text-base font-bold px-2 py-0.5 rounded-full bg-white/5`}>
              {skill.rarityName}
            </span>
            <span className="jersey-20-regular text-white/40 text-sm lg:text-base">Lv.{skill.level}</span>
          </div>
          
          {/* Effect and Time Row */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="jersey-20-regular text-emerald-400 text-sm lg:text-base font-medium">+{(skill.effectValue / 100).toFixed(1)}% boost</span>
            {skill.expiresAt && (
              <span className={`jersey-15-regular text-sm lg:text-base px-2 py-0.5 rounded-full ${
                skill.isExpired 
                  ? 'bg-red-500/20 text-red-400' 
                  : skill.daysRemaining <= 3 
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-white/10 text-white/50'
              }`}>
                {formatTimeRemaining()}
              </span>
            )}
          </div>
          
          {/* Applied Date */}
          <p className="jersey-20-regular text-white/25 text-sm lg:text-base mt-1">
            Activated: {skill.appliedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-2 ml-3">
          <motion.button
            className="px-4 py-2 rounded-lg jersey-15-regular text-sm lg:text-base font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isTransacting}
            onClick={() => onDeactivate(skill.tokenId)}
          >
            Deactivate
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

SkillCard.displayName = 'SkillCard';
SkillsManager.displayName = 'SkillsManager';

export default SkillsManager;
