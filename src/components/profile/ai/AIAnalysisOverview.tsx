/**
 * AIAnalysisOverview - Componente de vista general del análisis
 * Muestra score, breakdown y recomendaciones principales
 */

import React from 'react';
import { useAIAnalysis, useAIWalletBalance } from './useAIAnalysis';

const AIAnalysisOverview: React.FC = () => {
  const { 
    analysis,
    isMobile,
    getScoreLevelColor,
    getProgressColor,
    getPriorityColor,
    getCategoryIcon,
  } = useAIAnalysis();

  const { balance, recommendations: balanceRecs, opportunityScore } = useAIWalletBalance();

  const { overallScore, recommendations } = analysis;

  return (
    <>
      {/* Enhanced Score Card */}
      <div className="card-unified p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
        
        <div className={`relative grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-2 gap-8'}`}>
          {/* Score Circle */}
          <div className="flex flex-col items-center justify-center">
            <div className={`relative w-${isMobile ? '40' : '48'} h-${isMobile ? '40' : '48'}`}>
              {/* Outer ring */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-gray-700"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="42"
                  cx="50"
                  cy="50"
                />
                <circle
                  className={`text-transparent bg-gradient-to-r ${getScoreLevelColor(overallScore.scoreLevel)}`}
                  strokeWidth="8"
                  strokeDasharray={`${overallScore.overallScore * 2.64} 264`}
                  strokeLinecap="round"
                  stroke="url(#scoreGradient)"
                  fill="transparent"
                  r="42"
                  cx="50"
                  cy="50"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="50%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Score text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`${isMobile ? 'text-4xl' : 'text-5xl'} font-black text-white`}>
                  {overallScore.overallScore}
                </span>
                <span className="text-gray-400 text-sm mt-1">/ 100</span>
              </div>
            </div>
            
            {/* Level badge */}
            <div className={`mt-4 px-4 py-2 rounded-full bg-gradient-to-r ${getScoreLevelColor(overallScore.scoreLevel)} text-white font-bold shadow-lg`}>
              {overallScore.scoreLevel} Staker
            </div>
            
            {/* Percentile */}
            {overallScore.percentile && (
              <p className="mt-2 text-gray-400 text-sm">
                Top {100 - overallScore.percentile}% of all stakers
              </p>
            )}
          </div>

          {/* Metrics Grid */}
          <div className="space-y-4">
            {/* Enhanced APY */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Enhanced APY</span>
                <span className="text-2xl font-bold text-green-400">
                  {analysis.enhancedAPY.toFixed(1)}%
                </span>
              </div>
              {analysis.skillAnalysis && analysis.skillAnalysis.totalSkillBoost > 0 && (
                <p className="text-xs text-green-400/60 mt-1">
                  +{(analysis.enhancedAPY - parseFloat(String(analysis.overallScore.breakdown.rewardsScore || '0'))).toFixed(1)}% from skills
                </p>
              )}
            </div>

            {/* Active Skills */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-violet-500/5 border border-purple-500/20">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Active Skills</span>
                <span className="text-2xl font-bold text-purple-400">
                  {analysis.skillAnalysis?.activeSkills || 0}
                </span>
              </div>
              <p className="text-xs text-purple-400/60 mt-1">
                +{analysis.skillAnalysis?.totalSkillBoost || 0}% total boost
              </p>
            </div>

            {/* Level Progress */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-pink-500/10 to-rose-500/5 border border-pink-500/20">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Level</span>
                <span className="text-2xl font-bold text-pink-400">
                  {analysis.gamificationAnalysis?.levelProgress.currentLevel || 0}
                </span>
              </div>
              <p className="text-xs text-pink-400/60 mt-1">
                {analysis.gamificationAnalysis?.levelProgress.xpProgress.toFixed(0) || 0}% to next level
              </p>
            </div>

            {/* Portfolio Score */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/5 border border-blue-500/20">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Portfolio Health</span>
                <span className="text-2xl font-bold text-blue-400">
                  {analysis.portfolioAnalysis?.diversificationScore || 0}
                </span>
              </div>
              <p className="text-xs text-blue-400/60 mt-1">
                {analysis.portfolioAnalysis?.riskLevel || 'N/A'} risk level
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Balance Opportunity Card */}
      {balance.canStake && opportunityScore > 20 && (
        <div className="card-unified p-6 border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 to-green-500/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>💰</span> Staking Opportunity
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Score:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                opportunityScore >= 70 ? 'bg-green-500/20 text-green-400' :
                opportunityScore >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {opportunityScore}/100
              </span>
            </div>
          </div>

          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-3 mb-4`}>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Available</p>
              <p className="text-lg font-bold text-emerald-400">{balance.balanceFormatted.toFixed(2)}</p>
              <p className="text-xs text-gray-500">{balance.symbol}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">For Staking</p>
              <p className="text-lg font-bold text-blue-400">{balance.availableForStaking.toFixed(2)}</p>
              <p className="text-xs text-gray-500">(after gas)</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Conservative</p>
              <p className="text-lg font-bold text-green-400">{balance.suggestedAmounts.conservative.toFixed(0)}</p>
              <p className="text-xs text-gray-500">25% of balance</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Aggressive</p>
              <p className="text-lg font-bold text-orange-400">{balance.suggestedAmounts.aggressive.toFixed(0)}</p>
              <p className="text-xs text-gray-500">75% of balance</p>
            </div>
          </div>

          {/* Top Balance Recommendation */}
          {balanceRecs.length > 0 && (
            <div className={`p-4 rounded-xl border ${
              balanceRecs[0].priority === 'high' ? 'border-green-500/30 bg-green-500/5' :
              balanceRecs[0].priority === 'medium' ? 'border-yellow-500/30 bg-yellow-500/5' :
              'border-blue-500/30 bg-blue-500/5'
            }`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">
                  {balanceRecs[0].action === 'stake' ? '📈' : balanceRecs[0].action === 'add-funds' ? '💳' : '⏳'}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-white">
                      {balanceRecs[0].action === 'stake' ? 'Recommended Stake' : 'Action Needed'}
                    </h4>
                    {balanceRecs[0].expectedAPY > 0 && (
                      <span className="text-emerald-400 font-bold">{balanceRecs[0].expectedAPY.toFixed(1)}% APY</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{balanceRecs[0].reasoning}</p>
                  {balanceRecs[0].suggestedAmount > 0 && (
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-500">Amount: <span className="text-white font-medium">{balanceRecs[0].suggestedAmount.toFixed(2)} POL</span></span>
                      {balanceRecs[0].suggestedLockup >= 0 && (
                        <span className="text-gray-500">Lock: <span className="text-white font-medium">{balanceRecs[0].suggestedLockup === 0 ? 'Flexible' : `${balanceRecs[0].suggestedLockup} days`}</span></span>
                      )}
                      {balanceRecs[0].projectedMonthlyReward > 0 && (
                        <span className="text-gray-500">Monthly: <span className="text-emerald-400 font-medium">+{balanceRecs[0].projectedMonthlyReward.toFixed(2)} POL</span></span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Low Balance Alert */}
      {!balance.canStake && balance.balanceFormatted > 0 && (
        <div className="card-unified p-4 border-orange-500/30 bg-gradient-to-r from-orange-500/5 to-amber-500/5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-bold text-orange-400">Low Wallet Balance</h4>
              <p className="text-gray-400 text-sm">
                You have {balance.balanceFormatted.toFixed(4)} {balance.symbol}. Need at least 5 POL to stake. 
                Add {(5 - balance.availableForStaking).toFixed(2)} more POL to start earning rewards.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Score Breakdown */}
      <div className={`card-unified ${isMobile ? 'p-4' : 'p-6'}`}>
        <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white ${isMobile ? 'mb-4' : 'mb-6'} flex items-center gap-2`}>
          <span>📊</span> Score Breakdown
        </h3>
        
        <div className={isMobile ? 'space-y-3' : 'space-y-4'}>
          {Object.entries(overallScore.breakdown).map(([key, value]) => {
            const numValue = Number(value);
            const safeValue = isFinite(numValue) ? numValue : 0;
            return (
              <div key={key} className="group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 capitalize group-hover:text-white transition-colors">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-white font-bold">{safeValue.toFixed(1)}/25</span>
                </div>
                <div className="relative w-full bg-gray-700/30 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${getProgressColor(safeValue)}`}
                    style={{ width: `${(safeValue / 25) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className={`card-unified ${isMobile ? 'p-4' : 'p-6'}`}>
        <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white ${isMobile ? 'mb-4' : 'mb-6'} flex items-center gap-2`}>
          <span>🎯</span> Smart Recommendations
        </h3>
        
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`p-4 rounded-xl border transition-all hover:scale-[1.02] ${getPriorityColor(rec.priority)}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getCategoryIcon(rec.category)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-white truncate">{rec.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2">{rec.description}</p>
                  {rec.impact && (
                    <p className="text-xs mt-2 text-green-400 font-medium">
                      Impact: {rec.impact}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {recommendations.length === 0 && (
          <div className="text-center py-8">
            <span className="text-4xl">🎉</span>
            <p className="text-gray-400 mt-2">
              Great job! You're following best practices.
            </p>
          </div>
        )}
      </div>

      {/* Improvement Areas */}
      {overallScore.improvements.length > 0 && (
        <div className={`card-unified ${isMobile ? 'p-4' : 'p-6'} border-orange-500/20`}>
          <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white mb-4 flex items-center gap-2`}>
            <span>🚀</span> Areas for Growth
          </h3>
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'md:grid-cols-2 gap-3'}`}>
            {overallScore.improvements.map((improvement: string, idx: number) => (
              <div 
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20"
              >
                <span className="text-orange-400">💡</span>
                <span className="text-gray-300 text-sm">{improvement}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default AIAnalysisOverview;
