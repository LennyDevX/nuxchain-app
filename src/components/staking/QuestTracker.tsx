import React, { memo, useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuestManagement } from '../../hooks/staking/useQuestManagement';
import { useDepositManagement } from '../../hooks/staking/useDepositManagement';
import { gamificationToasts } from '../../utils/toasts/gamificationToasts';
import { formatBadge, formatLevel, formatXP } from '../../utils/staking/formatters';
import { levelUpReward } from '../../utils/staking/calculations';

interface QuestTrackerProps {
  className?: string;
}

type TabType = 'quests' | 'achievements' | 'badges';

/**
 * QuestTracker - Display quests, achievements, badges, XP progress, auto-compound toggle
 * Uses useQuestManagement hook for gamification contract interactions
 */
const QuestTracker: React.FC<QuestTrackerProps> = memo(({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<TabType>('quests');
  const {
    questRewards,
    achievementRewards,
    userXP,
    badges,
    badgeCount,
    autoCompoundConfig,
    enableAutoCompound,
    disableAutoCompound,
    claimQuestReward,
    claimAchievementReward,
    isPending,
    isConfirming,
    isConfirmed,
    isLoading: isLoadingQuests,
    refetch,
  } = useQuestManagement();

  // Get deposit data for quest progress calculation
  const { totalDeposits, isLoading: isLoadingDeposits } = useDepositManagement();
  const isLoading = isLoadingQuests || isLoadingDeposits;

  // Track previous level for level-up detection
  const prevLevelRef = useRef(userXP?.currentLevel ?? 0);
  const prevBadgeCountRef = useRef(badgeCount);
  const pendingToastRef = useRef<string | null>(null);

  // Consolidated transaction effect: handles pending toast, confirmed toast, and refetch
  useEffect(() => {
    // Show pending toast when transaction starts
    if (isPending && !pendingToastRef.current) {
      pendingToastRef.current = gamificationToasts.txPending('Processing claim');
    }
    
    // Handle confirmed transaction
    if (isConfirmed) {
      if (pendingToastRef.current) {
        gamificationToasts.txConfirmed(pendingToastRef.current);
        pendingToastRef.current = null;
      }
      const timer = setTimeout(() => refetch(), 2000);
      return () => clearTimeout(timer);
    }
  }, [isPending, isConfirmed, refetch]);

  // Detect level-up and badge unlocks - consolidated detection effect
  useEffect(() => {
    // Level-up detection
    if (userXP && userXP.currentLevel > prevLevelRef.current && prevLevelRef.current > 0) {
      const reward = levelUpReward(userXP.currentLevel);
      gamificationToasts.levelUp(userXP.currentLevel, reward);
    }
    if (userXP) prevLevelRef.current = userXP.currentLevel;
    
    // Badge detection
    if (badgeCount > prevBadgeCountRef.current && prevBadgeCountRef.current > 0) {
      const newest = badges[badges.length - 1];
      if (newest) gamificationToasts.badgeUnlocked(newest.badgeId);
    }
    prevBadgeCountRef.current = badgeCount;
  }, [userXP, badgeCount, badges]);

  // Calculate deposit-based quest progress
  const depositQuestProgress = useMemo(() => {
    const targetDeposits = 3;
    const currentDeposits = totalDeposits;
    const progress = Math.min(100, (currentDeposits / targetDeposits) * 100);
    const isComplete = currentDeposits >= targetDeposits;
    
    return {
      targetDeposits,
      currentDeposits,
      progress,
      isComplete,
      remaining: Math.max(0, targetDeposits - currentDeposits),
    };
  }, [totalDeposits]);

  const unclaimedQuests = questRewards.filter(q => !q.isClaimed && !q.isExpired);
  const unclaimedAchievements = achievementRewards.filter(a => !a.isClaimed && !a.isExpired);
  const isTransacting = isPending || isConfirming;

  // Claim handlers with toast feedback
  const handleClaimQuest = (questId: number) => {
    claimQuestReward(questId);
  };

  const handleClaimAchievement = (achievementId: number) => {
    claimAchievementReward(achievementId);
  };

  const handleToggleAutoCompound = () => {
    if (autoCompoundConfig?.isEnabled) {
      disableAutoCompound();
      gamificationToasts.autoCompoundDisabled();
    } else {
      enableAutoCompound(1000000000000000000n);
      gamificationToasts.autoCompoundEnabled('1.00');
    }
  };

  if (isLoading) {
    return (
      <div className={`card-unified rounded-xl p-5 border border-white/10 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-white/10 rounded w-28" />
          <div className="h-3 bg-white/10 rounded-full w-full" />
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/10 rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`card-unified rounded-xl border border-white/10 bg-gradient-to-br from-amber-500/5 to-orange-500/5 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header + XP Bar */}
      <div className="p-5 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <h3 className="jersey-15-regular text-lg lg:text-xl font-semibold text-white">Quests & Achievements</h3>
              <p className="jersey-20-regular text-white/40 text-sm lg:text-base">Complete tasks to earn XP and rewards</p>
            </div>
          </div>
          {userXP && (() => {
            const { title, color } = formatLevel(userXP.currentLevel);
            return (
              <div className="flex items-center gap-2">
                <span className={`jersey-20-regular text-xs lg:text-sm ${color}`}>{title}</span>
                <div className="px-3 py-1.5 rounded-full jersey-15-regular text-sm lg:text-base font-bold bg-amber-500/20 border border-amber-500/30 text-amber-300">
                  Lv.{userXP.currentLevel}
                </div>
              </div>
            );
          })()}
        </div>

        {/* XP Progress Bar */}
        {userXP && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="jersey-20-regular text-white/40 text-sm lg:text-base">XP Progress</span>
              <span className="jersey-20-regular text-amber-400 text-sm lg:text-base font-medium">
                {formatXP(userXP.currentXP)} / {formatXP(userXP.xpForNextLevel)}
              </span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                initial={{ width: 0 }}
                animate={{ width: `${userXP.xpProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="jersey-20-regular text-white/30 text-xs lg:text-sm">
                Total earned: {userXP.totalXPEarned.toString()} XP
              </span>
              <span className="jersey-20-regular text-white/30 text-xs lg:text-sm">
                {badgeCount} badge{badgeCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {/* Auto-Compound Toggle */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/5 mb-5 flex items-center justify-between">
          <div>
            <p className="jersey-15-regular text-white text-sm lg:text-base font-medium">Auto-Compound</p>
            <p className="jersey-20-regular text-white/40 text-xs lg:text-sm">
              {autoCompoundConfig?.isEnabled
                ? `Active • Min: ${autoCompoundConfig.minAmount} POL`
                : 'Automatically reinvest rewards'}
            </p>
          </div>
          <button
            onClick={handleToggleAutoCompound}
            disabled={isTransacting}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              autoCompoundConfig?.isEnabled
                ? 'bg-emerald-500'
                : 'bg-white/20'
            } ${isTransacting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <motion.div
              className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md"
              animate={{ x: autoCompoundConfig?.isEnabled ? 20 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {(['quests', 'achievements', 'badges'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 jersey-15-regular text-sm lg:text-base font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {tab}
              {tab === 'quests' && unclaimedQuests.length > 0 && (
                <span className="ml-1.5 px-2 py-0.5 rounded-full jersey-20-regular text-xs bg-amber-500/20 text-amber-400">
                  {unclaimedQuests.length}
                </span>
              )}
              {tab === 'achievements' && unclaimedAchievements.length > 0 && (
                <span className="ml-1.5 px-2 py-0.5 rounded-full jersey-20-regular text-xs bg-purple-500/20 text-purple-400">
                  {unclaimedAchievements.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-5 pt-4">
        <AnimatePresence mode="wait">
          {/* Quests Tab */}
          {activeTab === 'quests' && (
            <motion.div
              key="quests"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3"
            >
              {questRewards.length === 0 ? (
                <div className="bg-white/5 rounded-lg p-6 text-center border border-dashed border-white/10">
                  <span className="text-4xl mb-3 block">📋</span>
                  <p className="jersey-20-regular text-white/60 text-base lg:text-lg font-medium">
                    {depositQuestProgress.isComplete ? 'Quest Complete!' : 'Active Deposit Quest'}
                  </p>
                  <p className="jersey-20-regular text-white/40 text-sm lg:text-base mt-2">
                    {depositQuestProgress.isComplete 
                      ? 'You have completed 3 deposits! Great job!'
                      : `Complete ${depositQuestProgress.targetDeposits} deposits to earn rewards`}
                  </p>
                  
                  {/* Deposit quest progress */}
                  <div className="mt-4 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="jersey-15-regular text-amber-300 text-sm lg:text-base font-medium">
                        {depositQuestProgress.isComplete ? '✅ Quest Completed!' : 'Deposit Progress'}
                      </span>
                      <span className="jersey-20-regular text-white font-bold text-sm lg:text-base">
                        {depositQuestProgress.currentDeposits} / {depositQuestProgress.targetDeposits}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <motion.div 
                        className={`h-3 rounded-full ${depositQuestProgress.isComplete ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${depositQuestProgress.progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className="jersey-20-regular text-white/50 text-xs lg:text-sm mt-2">
                      {depositQuestProgress.isComplete 
                        ? 'You\'ve unlocked the deposit quest achievement!'
                        : `${depositQuestProgress.remaining} more deposit${depositQuestProgress.remaining !== 1 ? 's' : ''} needed`}
                    </p>
                  </div>
                </div>
              ) : (
                questRewards.map((quest) => (
                  <div
                    key={quest.questId}
                    className={`bg-white/5 rounded-lg p-4 border flex items-center justify-between ${
                      quest.isClaimed ? 'border-white/5 opacity-50' :
                      quest.isExpired ? 'border-red-500/20 opacity-60' :
                      'border-amber-500/20'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="jersey-15-regular text-white text-sm lg:text-base font-medium">Quest #{quest.questId}</span>
                        {quest.isClaimed && (
                          <span className="jersey-20-regular text-xs lg:text-sm text-emerald-400">✓ Claimed</span>
                        )}
                        {quest.isExpired && !quest.isClaimed && (
                          <span className="jersey-20-regular text-xs lg:text-sm text-red-400">Expired</span>
                        )}
                      </div>
                      <p className="jersey-20-regular text-white/50 text-xs lg:text-sm mt-1">Reward: {quest.rewardAmount} POL</p>
                      {quest.expiresAt && !quest.isClaimed && !quest.isExpired && (
                        <p className="jersey-20-regular text-white/30 text-xs lg:text-sm mt-1">
                          Expires: {quest.expiresAt.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {!quest.isClaimed && !quest.isExpired && (
                      <motion.button
                        className="px-4 py-2 rounded-lg jersey-15-regular text-xs lg:text-sm font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isTransacting}
                        onClick={() => handleClaimQuest(quest.questId)}
                      >
                        Claim
                      </motion.button>
                    )}
                  </div>
                ))
              )}
            </motion.div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3"
            >
              {achievementRewards.length === 0 ? (
                <div className="bg-white/5 rounded-lg p-6 text-center border border-dashed border-white/10">
                  <span className="text-4xl mb-3 block">🎯</span>
                  <p className="jersey-20-regular text-white/60 text-base lg:text-lg font-medium">No achievements unlocked yet</p>
                  <p className="jersey-20-regular text-white/40 text-sm lg:text-base mt-2">Keep staking to unlock achievements!</p>
                </div>
              ) : (
                achievementRewards.map((achievement) => (
                  <div
                    key={achievement.achievementId}
                    className={`bg-white/5 rounded-lg p-4 border flex items-center justify-between ${
                      achievement.isClaimed ? 'border-white/5 opacity-50' :
                      'border-purple-500/20'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="jersey-15-regular text-white text-sm lg:text-base font-medium">
                          Achievement #{achievement.achievementId}
                        </span>
                        {achievement.isClaimed && (
                          <span className="jersey-20-regular text-xs lg:text-sm text-emerald-400">✓ Claimed</span>
                        )}
                      </div>
                      <p className="jersey-20-regular text-white/50 text-xs lg:text-sm mt-1">Reward: {achievement.rewardAmount} POL</p>
                    </div>
                    {!achievement.isClaimed && !achievement.isExpired && (
                      <motion.button
                        className="px-4 py-2 rounded-lg jersey-15-regular text-xs lg:text-sm font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isTransacting}
                        onClick={() => handleClaimAchievement(achievement.achievementId)}
                      >
                        Claim
                      </motion.button>
                    )}
                  </div>
                ))
              )}
            </motion.div>
          )}

          {/* Badges Tab */}
          {activeTab === 'badges' && (
            <motion.div
              key="badges"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              {badges.length === 0 ? (
                <div className="bg-white/5 rounded-lg p-6 text-center border border-dashed border-white/10">
                  <span className="text-4xl mb-3 block">🏅</span>
                  <p className="jersey-20-regular text-white/60 text-base lg:text-lg font-medium">No badges earned yet</p>
                  <p className="jersey-20-regular text-white/40 text-sm lg:text-base mt-2">Complete quests and achievements to earn badges!</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {badges.map((badge) => {
                    const meta = formatBadge(badge.badgeId);
                    return (
                      <motion.div
                        key={badge.badgeId}
                        className="bg-white/5 rounded-lg p-4 border border-white/10 text-center group relative"
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.08)' }}
                      >
                        <span className="text-3xl block mb-2">{meta.icon}</span>
                        <p className="jersey-15-regular text-white text-xs lg:text-sm font-medium truncate">{meta.name}</p>
                        <p className="jersey-20-regular text-white/30 text-xs">
                          {badge.earnedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                          <div className="bg-gray-900 border border-white/20 rounded-lg px-3 py-2 text-xs text-white whitespace-nowrap shadow-xl">
                            <p className="jersey-15-regular font-medium">{meta.name}</p>
                            <p className="jersey-20-regular text-white/60">{meta.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Transaction Status */}
      {isTransacting && (
        <div className="px-5 pb-4">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span className="jersey-20-regular text-amber-400 text-sm lg:text-base">
              {isPending ? 'Confirm in wallet...' : 'Processing transaction...'}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
});

QuestTracker.displayName = 'QuestTracker';

export default QuestTracker;
