/**
 * AIAnalysisSkills - Componente de análisis de Skills NFTs
 * Muestra skills activos, estrategia, distribución por rareza y recomendaciones
 */

import React from 'react';
import { useAIAnalysis } from './useAIAnalysis';

const AIAnalysisSkills: React.FC = () => {
  const { 
    analysis,
    isMobile,
    getRarityColor,
    getPriorityColor,
  } = useAIAnalysis();

  const { skillAnalysis, skillStrategy, enhancedAPY } = analysis;

  if (!skillAnalysis) {
    return (
      <div className="card-unified p-12 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <span className="text-4xl">⚡</span>
        </div>
        <h4 className="jersey-15-regular text-2xl font-bold text-white mb-2">Skills Analysis Loading</h4>
        <p className="jersey-20-regular text-slate-400 text-lg mb-6 max-w-md mx-auto">
          Connect your wallet to see your skills analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Skills Overview Cards */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
        <div className="card-unified p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-600/20 flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <span className="jersey-20-regular text-purple-400 text-base font-medium">Skills</span>
          </div>
          <p className="jersey-20-regular text-slate-400 text-base mb-2">Active Skills</p>
          <p className="jersey-20-regular text-4xl font-bold text-white mb-1">{skillAnalysis.activeSkills}</p>
          <p className="jersey-20-regular text-slate-500 text-sm">active skills</p>
        </div>

        <div className="card-unified p-6 bg-gradient-to-br from-green-500/10 to-green-600/5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/30 to-green-600/20 flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
            <span className="jersey-20-regular text-green-400 text-base font-medium">Boost</span>
          </div>
          <p className="jersey-20-regular text-slate-400 text-base mb-2">Total APY Boost</p>
          <p className="jersey-20-regular text-4xl font-bold text-green-400 mb-1">+{skillAnalysis.totalSkillBoost}%</p>
          <p className="jersey-20-regular text-slate-500 text-sm">Applied to staking rewards</p>
        </div>

        <div className="card-unified p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/20 flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <span className="jersey-20-regular text-blue-400 text-base font-medium">Efficiency</span>
          </div>
          <p className="jersey-20-regular text-slate-400 text-base mb-2">Skill Utilization</p>
          <p className="jersey-20-regular text-4xl font-bold text-blue-400 mb-1">{skillAnalysis.skillUtilization}%</p>
          <p className="jersey-20-regular text-slate-500 text-sm">Efficiency rating</p>
        </div>
      </div>

      {/* Strategy Score */}
      {skillStrategy && (
        <div className="card-unified p-6 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-purple-500/5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <span className="text-3xl">🧠</span>
            </div>
            <div className="flex-1">
              <h4 className="jersey-15-regular text-white font-bold text-2xl">Skill Strategy</h4>
              <p className="jersey-20-regular text-slate-400 text-base">{skillStrategy.rating}</p>
            </div>
            <div className="text-right">
              <p className="jersey-20-regular text-3xl font-bold text-white">{skillStrategy.score}</p>
              <p className="jersey-20-regular text-slate-400 text-sm">/100</p>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="jersey-20-regular text-slate-400 text-base">Strategy Effectiveness</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                skillStrategy.score >= 70 ? 'bg-green-500/20 text-green-400' :
                skillStrategy.score >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {skillStrategy.score >= 70 ? 'Excellent' : skillStrategy.score >= 50 ? 'Good' : 'Needs Work'}
              </span>
            </div>
            <p className="jersey-20-regular text-slate-300 text-base leading-relaxed">{skillStrategy.feedback}</p>
          </div>
        </div>
      )}

      {/* Enhanced APY Display */}
      <div className="card-unified p-6 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-green-500/10 border border-green-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="jersey-15-regular text-white font-bold text-2xl mb-1">Enhanced APY</h4>
            <p className="jersey-20-regular text-slate-400 text-base">Your total APY with skill boosts</p>
          </div>
          <div className="text-right">
            <p className="jersey-20-regular text-4xl font-bold text-green-400">{enhancedAPY.toFixed(1)}%</p>
            <p className="jersey-20-regular text-green-400/60 text-base">+{skillAnalysis.totalSkillBoost}% from skills</p>
          </div>
        </div>
      </div>

      {/* Rarity Distribution */}
      {skillAnalysis.rarityDistribution && Object.keys(skillAnalysis.rarityDistribution).length > 0 && (
        <div className="card-unified p-6">
          <h4 className="jersey-15-regular text-white font-bold text-2xl mb-4 flex items-center gap-2">
            <span>💎</span> Skills by Rarity
          </h4>
          <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-3 md:grid-cols-5'}`}>
            {Object.entries(skillAnalysis.rarityDistribution).map(([rarity, count]) => (
              <div 
                key={rarity}
                className={`p-4 rounded-xl border border-white/10 bg-gradient-to-br ${getRarityColor(rarity)} bg-opacity-10`}
              >
                <p className="jersey-20-regular text-white font-bold text-2xl mb-1">{count}</p>
                <p className="jersey-20-regular text-slate-400 text-sm capitalize">{rarity.toLowerCase()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skill Recommendations */}
      {skillAnalysis.recommendations.length > 0 && (
        <div className="card-unified p-6">
          <h4 className="jersey-15-regular text-white font-bold text-2xl mb-4 flex items-center gap-2">
            <span>💡</span> Skill Recommendations
          </h4>
          <div className="space-y-3">
            {skillAnalysis.recommendations.map((rec, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-xl border transition-all hover:scale-[1.01] ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="jersey-15-regular font-bold text-white text-lg">{rec.title}</h5>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="jersey-20-regular text-slate-400 text-base">{rec.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="jersey-20-regular text-green-400 font-bold text-lg">+{rec.estimatedImpact.toFixed(1)}%</span>
                    <p className="jersey-20-regular text-slate-500 text-sm">boost</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Skills Message */}
      {skillAnalysis.activeSkills === 0 && (
        <div className="card-unified p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <span className="text-4xl">⚡</span>
          </div>
          <h4 className="jersey-15-regular text-2xl font-bold text-white mb-2">No Active Skills Yet</h4>
          <p className="jersey-20-regular text-slate-400 text-lg mb-6 max-w-md mx-auto">
            Purchase and activate Skill NFTs to boost your staking rewards and unlock special features!
          </p>
          <a href="/skills" className="btn-primary inline-flex items-center gap-2">
            <span>🛒</span>
            <span>Browse Skill NFTs</span>
          </a>
        </div>
      )}
    </div>
  );
};

export default AIAnalysisSkills;
