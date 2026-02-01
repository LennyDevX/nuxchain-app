/**
 * AIAnalysisGamification - Componente de análisis de gamificación
 * Muestra progreso de nivel, XP, quests, achievements y engagement
 */

import React from 'react';
import { useAIAnalysis } from './useAIAnalysis';

const AIAnalysisGamification: React.FC = () => {
  const { 
    analysis,
    isMobile,
  } = useAIAnalysis();

  const { gamificationAnalysis } = analysis;

  if (!gamificationAnalysis) {
    return (
      <div className="card-unified p-12 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
          <span className="text-4xl">🎮</span>
        </div>
        <h4 className="text-xl font-bold text-white mb-2">Gamification Analysis Loading</h4>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Connect your wallet to see your progress and achievements.
        </p>
      </div>
    );
  }

  const { levelProgress, engagementScore, completionRates } = gamificationAnalysis;

  return (
    <div className="space-y-6">
      {/* Level & XP Progress */}
      <div className="card-unified p-6 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-pink-500/5">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
            <span className="text-4xl">🎮</span>
          </div>
          <div className="flex-1">
            <h4 className="text-white font-bold text-xl">Level {levelProgress.currentLevel}</h4>
            <p className="text-gray-400 text-sm">{Number(levelProgress.xpRequired).toLocaleString()} XP Required</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{levelProgress.xpProgress.toFixed(0)}%</p>
            <p className="text-gray-400 text-xs">to Level {levelProgress.nextLevel}</p>
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">XP Progress</span>
            <span className="text-gray-400 text-sm">{Number(levelProgress.xpToNextLevel).toLocaleString()} XP needed</span>
          </div>
          <div className="relative w-full bg-gray-700/30 rounded-full h-6 overflow-hidden border border-white/10">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-700"
              style={{ width: `${levelProgress.xpProgress}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-xs font-bold drop-shadow-lg">
                {levelProgress.xpProgress.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Level Stats */}
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
          <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-center">
            <p className="text-2xl font-bold text-pink-400">{levelProgress.currentLevel}</p>
            <p className="text-gray-400 text-xs">Current Level</p>
          </div>
          <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-400">{Number(levelProgress.xpRequired).toLocaleString()}</p>
            <p className="text-gray-400 text-xs">XP Required</p>
          </div>
          <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-center">
            <p className="text-2xl font-bold text-indigo-400">{Number(levelProgress.xpToNextLevel).toLocaleString()}</p>
            <p className="text-gray-400 text-xs">XP to Next</p>
          </div>
          <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-400">{engagementScore}</p>
            <p className="text-gray-400 text-xs">Engagement</p>
          </div>
        </div>
      </div>

      {/* Completion Rates */}
      <div className="card-unified p-6">
        <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <span>🏆</span> Achievement & Quest Progress
        </h4>
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {/* Achievements */}
          <div className="p-5 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/20 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">🏅</span>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                completionRates.achievements >= 75 ? 'bg-green-500/20 text-green-400' :
                completionRates.achievements >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {completionRates.achievements >= 75 ? 'Excellent' : completionRates.achievements >= 50 ? 'Good' : 'In Progress'}
              </span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{completionRates.achievements.toFixed(0)}%</p>
            <p className="text-gray-400 text-sm">Achievements Unlocked</p>
            <div className="mt-3 w-full bg-gray-700/30 rounded-full h-2">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"
                style={{ width: `${completionRates.achievements}%` }}
              />
            </div>
          </div>

          {/* Quests */}
          <div className="p-5 bg-gradient-to-br from-purple-500/10 to-indigo-500/5 border border-purple-500/20 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">⚔️</span>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                completionRates.quests >= 75 ? 'bg-green-500/20 text-green-400' :
                completionRates.quests >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {completionRates.quests >= 75 ? 'Excellent' : completionRates.quests >= 50 ? 'Good' : 'In Progress'}
              </span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{completionRates.quests.toFixed(0)}%</p>
            <p className="text-gray-400 text-sm">Quests Completed</p>
            <div className="mt-3 w-full bg-gray-700/30 rounded-full h-2">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                style={{ width: `${completionRates.quests}%` }}
              />
            </div>
          </div>

          {/* Overall */}
          <div className="p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">📊</span>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                completionRates.overall >= 75 ? 'bg-green-500/20 text-green-400' :
                completionRates.overall >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {completionRates.overall >= 75 ? 'Excellent' : completionRates.overall >= 50 ? 'Good' : 'In Progress'}
              </span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{completionRates.overall.toFixed(0)}%</p>
            <p className="text-gray-400 text-sm">Overall Progress</p>
            <div className="mt-3 w-full bg-gray-700/30 rounded-full h-2">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                style={{ width: `${completionRates.overall}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Insights */}
      <div className="card-unified p-6">
        <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <span>📊</span> Engagement Analysis
        </h4>
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400">Engagement Score</span>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                engagementScore >= 80 ? 'bg-green-500/20 text-green-400' :
                engagementScore >= 60 ? 'bg-blue-500/20 text-blue-400' :
                engagementScore >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {engagementScore >= 80 ? 'Highly Engaged' : 
                 engagementScore >= 60 ? 'Active' : 
                 engagementScore >= 40 ? 'Moderate' : 'Getting Started'}
              </span>
            </div>
            <p className="text-4xl font-bold text-white">{engagementScore}/100</p>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400">Activity Status</span>
              <span className="px-2 py-1 rounded text-xs font-bold bg-purple-500/20 text-purple-400">
                {engagementScore >= 70 ? 'Very Active' : engagementScore >= 40 ? 'Active' : 'New User'}
              </span>
            </div>
            <p className="text-4xl font-bold text-white">Level {levelProgress.currentLevel}</p>
            <p className="text-gray-400 text-xs mt-1">Current Progress</p>
          </div>
        </div>
      </div>

      {/* Level Up Tips */}
      <div className="card-unified p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
        <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <span>🚀</span> Level Up Faster
        </h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
            <span className="text-xl">⚔️</span>
            <div>
              <p className="text-white font-medium">Complete Daily Quests</p>
              <p className="text-gray-400 text-sm">Earn bonus XP by completing quests every day</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
            <span className="text-xl">🏅</span>
            <div>
              <p className="text-white font-medium">Unlock Achievements</p>
              <p className="text-gray-400 text-sm">Each achievement unlocked provides permanent XP bonus</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
            <span className="text-xl">💰</span>
            <div>
              <p className="text-white font-medium">Increase Staking</p>
              <p className="text-gray-400 text-sm">Larger stakes earn more XP from rewards</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {gamificationAnalysis.recommendations && gamificationAnalysis.recommendations.length > 0 && (
        <div className="card-unified p-6">
          <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <span>💡</span> Progress Recommendations
          </h4>
          <div className="space-y-3">
            {gamificationAnalysis.recommendations.slice(0, 5).map((rec, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <span className="text-2xl">
                  {rec.type === 'quest' ? '⚔️' : 
                   rec.type === 'achievement' ? '🏅' : 
                   rec.type === 'social' ? '👥' : '📈'}
                </span>
                <div className="flex-1">
                  <h5 className="font-bold text-white mb-1">{rec.title}</h5>
                  <p className="text-gray-400 text-sm">{rec.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-green-400 font-bold">+{rec.xpReward}</span>
                  <p className="text-gray-500 text-xs">XP</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysisGamification;
