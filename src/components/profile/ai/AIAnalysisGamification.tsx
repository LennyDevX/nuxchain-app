/**
 * AIAnalysisGamification - Componente de analisis de gamificacion
 * Datos reales de LevelingSystem, GameifiedMarketplaceQuests y CollaboratorBadgeRewards
 */

import React from 'react';
import { useAccount } from 'wagmi';
import { useAIAnalysis } from './useAIAnalysis';
import {
  useGamificationData,
  QUEST_TYPE_LABELS,
  QUEST_TYPE_ICONS,
  getXPRequiredForLevel,
} from '../../../hooks/marketplace/useGamificationData';

const AIAnalysisGamification: React.FC = () => {
  const { isMobile } = useAIAnalysis();
  const { isConnected } = useAccount();
  const g = useGamificationData();

  if (!isConnected) {
    return (
      <div className="card-unified p-12 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
          <span className="text-4xl">🎮</span>
        </div>
        <h4 className="jersey-15-regular text-2xl font-bold text-white mb-2">Connect Wallet</h4>
        <p className="jersey-20-regular text-slate-400 text-lg max-w-md mx-auto">
          Connect your wallet to see your real on-chain gamification progress.
        </p>
      </div>
    );
  }

  if (g.isLoading) {
    return (
      <div className="card-unified p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center animate-pulse">
          <span className="text-3xl">🎮</span>
        </div>
        <p className="jersey-20-regular text-slate-400 text-lg">Loading on-chain data...</p>
      </div>
    );
  }

  const xpPerLevel = getXPRequiredForLevel(g.level + 1);

  // Personalized tips based on real on-chain data
  const tips: { icon: string; title: string; desc: string }[] = [];
  if (g.nftsCreated === 0) {
    tips.push({ icon: '🎨', title: 'Create your first NFT', desc: 'Earn 10 XP per NFT created. Start minting to unlock Create quests.' });
  }
  if (g.socialActions < 10) {
    tips.push({ icon: '💬', title: 'Engage with the community', desc: 'Like and comment on NFTs to progress Social quests and earn XP.' });
  }
  if (g.activeQuests.length > 0) {
    const closest = [...g.activeQuests].sort((a, b) => b.progressPct - a.progressPct)[0];
    const typeLabel = QUEST_TYPE_LABELS[closest.questType] ?? 'action';
    tips.push({
      icon: QUEST_TYPE_ICONS[closest.questType] ?? '⚔️',
      title: `Finish "${closest.title}"`,
      desc: `${closest.progressPct}% done  ${closest.requirement - closest.currentProgress} more ${typeLabel.toLowerCase()}(s) needed for +${closest.xpReward} XP.`,
    });
  }
  if (g.nftsSold === 0) {
    tips.push({ icon: '📈', title: 'Make your first sale', desc: 'Selling NFTs earns XP and progresses Trading quests.' });
  }
  if (tips.length === 0) {
    tips.push({ icon: '🚀', title: 'Keep it up!', desc: "You're doing great. Complete more quests to reach the next level." });
  }

  return (
    <div className="space-y-6">

      {/* Section 1: Level & XP */}
      <div className="card-unified p-6 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-indigo-500/5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-15 h-16 rounded-full bg-gradient-to-br from-pink-500/30 to-purple-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-4xl mb-2">🎮</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`jersey-15-regular text-white font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              Level {g.level}
              {g.level >= 40 && <span className="ml-2 text-yellow-400">⭐</span>}
            </h4>
            <p className="jersey-20-regular text-slate-400 text-base">
              {g.totalXP.toLocaleString()} / 7,500 XP total &middot; {xpPerLevel} XP per level
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className={`jersey-20-regular font-bold text-white ${isMobile ? 'text-2xl' : 'text-3xl'}`}>{g.xpProgress}%</p>
            <p className="jersey-20-regular text-slate-400 text-sm">to Level {g.level + 1}</p>
            <p className="jersey-20-regular text-purple-400 text-sm">+{g.nextLevelRewardPOL} POL reward</p>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="jersey-20-regular text-slate-400 text-base">XP Progress</span>
            <span className="jersey-20-regular text-slate-400 text-base">{g.xpInCurrentLevel} / {g.xpForNextLevel} XP</span>
          </div>
          <div className="relative w-full bg-gray-700/30 rounded-full h-5 overflow-hidden border border-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-700"
              style={{ width: `${g.xpProgress}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="jersey-20-regular text-white text-sm font-bold drop-shadow-lg">{g.xpProgress}%</span>
            </div>
          </div>
        </div>

        {/* NFT & Social stats */}
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
          {[
            { label: 'NFTs Created', value: g.nftsCreated, color: 'text-pink-400', icon: '🎨' },
            { label: 'NFTs Sold',    value: g.nftsSold,    color: 'text-green-400', icon: '📈' },
            { label: 'NFTs Bought',  value: g.nftsBought,  color: 'text-blue-400',  icon: '🛒' },
            { label: 'Social Actions', value: g.socialActions, color: 'text-yellow-400', icon: '💬' },
          ].map((s) => (
            <div key={s.label} className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
              <p className="text-xl mb-1">{s.icon}</p>
              <p className={`jersey-20-regular text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="jersey-20-regular text-slate-400 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Active Quests with real progress */}
      <div className="card-unified p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className={`jersey-15-regular text-white font-bold flex items-center gap-2 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            <span>⚔️</span> Active Quests
          </h4>
          <div className="flex gap-4">
            <span className="jersey-20-regular text-slate-400 text-base">{g.totalQuestsCompleted} completed</span>
            {g.totalQuestsInProgress > 0 && (
              <span className="jersey-20-regular text-purple-400 text-base">{g.totalQuestsInProgress} in progress</span>
            )}
          </div>
        </div>

        {g.activeQuests.length === 0 ? (
          <div className="text-center py-8 bg-white/3 rounded-xl border border-white/8">
            <span className="text-3xl">🎯</span>
            <p className="jersey-20-regular text-slate-400 text-base mt-2">No active quests found on-chain.</p>
            <p className="jersey-20-regular text-slate-500 text-sm mt-1">Check back after the admin creates new quests.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {g.activeQuests.map((quest) => {
              const barColor = quest.completed ? '#22c55e' : quest.progressPct >= 75 ? '#eab308' : '#8b5cf6';
              return (
                <div
                  key={quest.questId}
                  className={`p-4 rounded-xl border transition-colors ${
                    quest.completed
                      ? 'border-green-500/30 bg-green-500/5'
                      : quest.progressPct >= 75
                      ? 'border-yellow-500/25 bg-yellow-500/5'
                      : 'border-white/10 bg-white/3'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{QUEST_TYPE_ICONS[quest.questType] ?? '⚔️'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className={`jersey-20-regular font-bold text-white truncate ${isMobile ? 'text-base' : 'text-lg'}`}>
                          {quest.title}
                        </p>
                        {quest.completed ? (
                          <span className="flex-shrink-0 px-2 py-0.5 rounded text-xs font-bold bg-green-500/20 text-green-400 jersey-20-regular">Done</span>
                        ) : (
                          <span className="flex-shrink-0 jersey-20-regular text-purple-400 font-bold text-base">+{quest.xpReward} XP</span>
                        )}
                      </div>
                      <p className="jersey-20-regular text-slate-500 text-sm mb-2 line-clamp-1">{quest.description}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-700/40 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${quest.progressPct}%`, backgroundColor: barColor }}
                          />
                        </div>
                        <span className="jersey-20-regular text-slate-400 text-sm flex-shrink-0">
                          {quest.currentProgress}/{quest.requirement} {QUEST_TYPE_LABELS[quest.questType]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 3: Quest Stats */}
      <div className="card-unified p-6">
        <h4 className={`jersey-15-regular text-white font-bold mb-4 flex items-center gap-2 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
          <span>📊</span> Quest Statistics
        </h4>
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
          {[
            { label: 'Completed',   value: g.totalQuestsCompleted,    color: '#22c55e', icon: '✅' },
            { label: 'In Progress', value: g.totalQuestsInProgress,   color: '#8b5cf6', icon: '⏳' },
            { label: 'XP Earned',   value: g.totalXPEarnedFromQuests, color: '#f97316', icon: '⭐' },
            { label: 'Completion',  value: `${g.questCompletionRate}%`, color: '#3b82f6', icon: '📈' },
          ].map((s) => (
            <div key={s.label} className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
              <p className="text-xl mb-1">{s.icon}</p>
              <p className={`jersey-20-regular text-2xl font-bold`} style={{ color: s.color }}>{s.value}</p>
              <p className="jersey-20-regular text-slate-400 text-sm">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Favorite quest type */}
        {g.totalQuestsCompleted > 0 && (
          <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
            <span className="text-2xl">{QUEST_TYPE_ICONS[g.favoriteQuestType] ?? '⚔️'}</span>
            <div>
              <p className="jersey-20-regular text-slate-400 text-sm">Favorite Quest Type</p>
              <p className="jersey-20-regular text-white font-bold text-base">{QUEST_TYPE_LABELS[g.favoriteQuestType] ?? 'Unknown'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Section 4: Collaborator Badge Rewards */}
      {g.badgeRewardsAvailable && (
        <div className="card-unified p-6 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border border-yellow-500/20">
          <h4 className={`jersey-15-regular text-white font-bold mb-4 flex items-center gap-2 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            <span>🏅</span> Collaborator Badge Rewards
          </h4>

          {/* Pending rewards */}
          <div className={`grid gap-3 mb-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <div className={`p-4 rounded-xl border text-center ${
              g.hasPendingRewards ? 'border-yellow-500/40 bg-yellow-500/10' : 'border-white/10 bg-white/5'
            }`}>
              <p className="jersey-20-regular text-slate-400 text-base mb-1">Pending Rewards</p>
              <p className={`jersey-20-regular text-3xl font-bold ${g.hasPendingRewards ? 'text-yellow-400' : 'text-slate-500'}`}>
                {g.pendingRewardsPOL} POL
              </p>
              {g.hasPendingRewards && (
                <p className="jersey-20-regular text-yellow-500 text-sm mt-1">Ready to claim!</p>
              )}
            </div>
            <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-center">
              <p className="jersey-20-regular text-slate-400 text-base mb-1">Badge Quests Active</p>
              <p className="jersey-20-regular text-3xl font-bold text-orange-400">{g.collaboratorQuests.length}</p>
              <p className="jersey-20-regular text-slate-500 text-sm mt-1">POL rewards per completion</p>
            </div>
          </div>

          {/* Active collaborator quests */}
          {g.collaboratorQuests.length > 0 && (
            <div className="space-y-2">
              {g.collaboratorQuests.map((cq) => {
                const endDate = new Date(cq.endTime * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                return (
                  <div key={cq.questId} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/8">
                    <span className="text-xl flex-shrink-0">🏅</span>
                    <div className="flex-1 min-w-0">
                      <p className="jersey-20-regular text-slate-300 text-base truncate">{cq.description}</p>
                      <p className="jersey-20-regular text-slate-500 text-sm">Ends {endDate} · {cq.completionCount}/{cq.maxCompletions > 0 ? cq.maxCompletions : '∞'} completions</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="jersey-20-regular text-yellow-400 font-bold text-base">{cq.rewardAmount} POL</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Section 5: Personalized Level Up Tips */}
      <div className="card-unified p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
        <h4 className={`jersey-15-regular text-white font-bold mb-4 flex items-center gap-2 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
          <span>🚀</span> Level Up Faster
        </h4>
        <div className="space-y-3">
          {tips.slice(0, 4).map((tip, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/8">
              <span className="text-xl flex-shrink-0">{tip.icon}</span>
              <div>
                <p className={`jersey-20-regular text-white font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>{tip.title}</p>
                <p className="jersey-20-regular text-slate-400 text-base">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AIAnalysisGamification;
