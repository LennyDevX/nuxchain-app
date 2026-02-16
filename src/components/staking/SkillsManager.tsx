import React, { memo, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSkillsManagement, type ActiveSkillDetail } from '../../hooks/staking/useSkillsManagement';
import { gamificationToasts } from '../../utils/toasts/gamificationToasts';
import { RARITY_DISPLAY, formatSkillBoost } from '../../utils/staking/formatters';
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

  // Refetch after confirmed transaction + toast
  useEffect(() => {
    if (isConfirmed) {
      gamificationToasts.txConfirmed();
      const timer = setTimeout(() => refetch(), 2000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, refetch]);

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
  const handleActivate = (tokenId: bigint, skillName: string, effectValue: number) => {
    const validation = validateSkillActivation(totalBoost, effectValue, activeCount, maxSlots);
    if (!validation.isValid) {
      gamificationToasts.boostLimitReached();
      return;
    }
    activateSkill(tokenId);
    gamificationToasts.skillActivated(skillName, effectValue / 100);
  };

  // Handle skill deactivation with toast
  const handleDeactivate = (tokenId: bigint, skillName: string) => {
    deactivateSkill(tokenId);
    gamificationToasts.skillDeactivated(skillName);
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
              <h3 className="text-sm font-semibold text-white">Skills Manager</h3>
              <p className="text-white/40 text-[10px]">Activate NFT skills to boost rewards</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasAutoCompound && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-500/20 text-green-400 border border-green-500/30">
                🔄 Auto
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">
              {activeCount}/{maxSlots} Slots
            </span>
          </div>
        </div>

        {/* Skill Effectiveness Summary */}
        {skillEffectiveness && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-white/5 rounded-lg p-2.5 text-center border border-white/5">
              <p className="text-white/40 text-[10px]">Base Rewards</p>
              <p className="text-white/70 font-semibold text-sm">{skillEffectiveness.baseRewards}</p>
              <p className="text-white/20 text-[9px]">POL/day</p>
            </div>
            <div className="bg-emerald-500/10 rounded-lg p-2.5 text-center border border-emerald-500/20">
              <p className="text-emerald-400/60 text-[10px]">Boosted</p>
              <p className="text-emerald-400 font-bold text-sm">{skillEffectiveness.boostedRewards}</p>
              <p className="text-emerald-400/30 text-[9px]">POL/day</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2.5 text-center border border-white/5">
              <p className="text-white/40 text-[10px]">Total Boost</p>
              <p className="text-purple-400 font-bold text-sm">+{(totalBoost / 100).toFixed(1)}%</p>
              {skillEffectiveness.feeDiscount > 0 && (
                <p className="text-blue-400 text-[9px]">-{skillEffectiveness.feeDiscount}% fee</p>
              )}
            </div>
          </div>
        )}

        {/* Boost Limit Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/40 text-[10px]">Staking Boost Limit</span>
            <span className={`text-[10px] font-medium ${
              boostUsagePercent >= 90 ? 'text-red-400' :
              boostUsagePercent >= 70 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {(totalBoost / 100).toFixed(1)}% / 37.5%
            </span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
            <motion.div
              className={`h-2 rounded-full ${
                boostUsagePercent >= 90 ? 'bg-gradient-to-r from-red-500 to-red-400' :
                boostUsagePercent >= 70 ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                'bg-gradient-to-r from-indigo-500 to-purple-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${boostUsagePercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-white/25 text-[9px] mt-0.5">
            Remaining: +{(remainingBoostBps / 100).toFixed(2)}% available
          </p>
        </div>
      </div>

      {/* Active Skills */}
      <div className="px-5 pb-3">
        <p className="text-white/40 text-[10px] uppercase tracking-wide mb-2">Active Skills</p>
        {activeSkills.length === 0 ? (
          <div className="bg-white/5 rounded-lg p-4 text-center border border-dashed border-white/10">
            <p className="text-white/40 text-xs">No active skills</p>
            <p className="text-white/25 text-[10px] mt-1">Purchase skill NFTs from the marketplace to activate boosts</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {activeSkills.map((skill) => (
                <SkillCard
                  key={skill.tokenId.toString()}
                  skill={skill}
                  onDeactivate={(tokenId) => handleDeactivate(tokenId, skill.skillName)}
                  isTransacting={isPending || isConfirming}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Available Skills to Activate */}
      {availableSkills.length > 0 && activeCount < maxSlots && (
        <div className="px-5 pb-5 pt-2 border-t border-white/5">
          <p className="text-white/40 text-[10px] uppercase tracking-wide mb-2">Available Skills</p>
          <div className="grid grid-cols-2 gap-2">
            {availableSkills.filter(s => s.isEnabled).slice(0, 6).map((skill) => {
              const preview = previewSkillActivation(skill.defaultEffect);
              const canActivate = preview.isValid;
              return (
                <motion.button
                  key={skill.skillType}
                  className={`rounded-lg p-3 border text-left transition-all group ${
                    canActivate
                      ? 'bg-white/5 hover:bg-white/10 border-white/10'
                      : 'bg-red-500/5 border-red-500/15 opacity-60 cursor-not-allowed'
                  }`}
                  whileHover={canActivate ? { scale: 1.02 } : {}}
                  whileTap={canActivate ? { scale: 0.98 } : {}}
                  disabled={isPending || isConfirming || !canActivate}
                  onClick={() => handleActivate(BigInt(skill.skillType), skill.skillName, skill.defaultEffect)}
                >
                  <p className="text-white text-xs font-medium">{skill.skillName}</p>
                  <p className="text-white/40 text-[10px]">{formatSkillBoost(skill.defaultEffect)} boost</p>
                  {canActivate ? (
                    <span className="text-blue-400 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                      → Total: +{preview.projectedPercent}%
                    </span>
                  ) : (
                    <span className="text-red-400 text-[10px]">
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
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-blue-400 text-xs">
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
  const rarityInfo = RARITY_DISPLAY[skill.rarity as keyof typeof RARITY_DISPLAY] || RARITY_DISPLAY[0];
  const rarityBg = {
    'text-gray-400': 'from-gray-500/10 to-gray-500/5 border-gray-500/20',
    'text-green-400': 'from-green-500/10 to-green-500/5 border-green-500/20',
    'text-blue-400': 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
    'text-purple-400': 'from-purple-500/10 to-purple-500/5 border-purple-500/20',
    'text-orange-400': 'from-orange-500/10 to-orange-500/5 border-orange-500/20',
  }[skill.rarityColor] || 'from-white/5 to-white/0 border-white/10';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-gradient-to-r ${rarityBg} rounded-lg p-3 border flex items-center justify-between`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-white text-xs font-medium truncate">{skill.skillName}</span>
          <span className={`${skill.rarityColor} text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/5`}>
            {skill.rarityName} ({rarityInfo.multiplier})
          </span>
          <span className="text-white/30 text-[10px]">Lv.{skill.level}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-emerald-400 text-[10px]">+{(skill.effectValue / 100).toFixed(1)}% boost</span>
          {skill.expiresAt && (
            <span className={`text-[10px] ${skill.daysRemaining <= 3 ? 'text-red-400' : 'text-white/30'}`}>
              {skill.isExpired ? '⚠️ Expired' : `${skill.daysRemaining}d left`}
            </span>
          )}
        </div>
      </div>
      <motion.button
        className="ml-3 px-3 py-1.5 rounded-lg text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={isTransacting}
        onClick={() => onDeactivate(skill.tokenId)}
      >
        Deactivate
      </motion.button>
    </motion.div>
  );
});

SkillCard.displayName = 'SkillCard';
SkillsManager.displayName = 'SkillsManager';

export default SkillsManager;
