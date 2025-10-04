import React, { useState, useEffect } from 'react';
import { useStakingAnalysis } from '../../hooks/analytics/useStakingAnalysis';
import { formatEther } from 'viem';
import AIAnalysisWelcome from './AIAnalysisWelcome';
import '../../styles/ai-analysis-animations.css';

const ProfileAIAnalysis: React.FC = () => {
  const { score, recommendations, metrics, isLoading, refreshAnalysis } = useStakingAnalysis();
  const [showWelcome, setShowWelcome] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check if user has seen the tutorial
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('ai-analysis-tutorial-seen');
    if (!hasSeenTutorial) {
      setShowWelcome(true);
    }
  }, []);

  // Handle refresh with animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAnalysis();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Obtener color basado en el nivel de score
  const getScoreLevelColor = (level: string) => {
    switch (level) {
      case 'Master':
        return 'from-yellow-400 via-amber-500 to-orange-500';
      case 'Expert':
        return 'from-purple-400 via-violet-500 to-purple-600';
      case 'Advanced':
        return 'from-blue-400 via-indigo-500 to-blue-600';
      case 'Intermediate':
        return 'from-green-400 via-emerald-500 to-green-600';
      default:
        return 'from-gray-400 via-gray-500 to-gray-600';
    }
  };

  // Obtener color para la barra de progreso
  const getProgressColor = (value: number) => {
    if (value >= 20) return 'bg-gradient-to-r from-green-500 to-emerald-600';
    if (value >= 15) return 'bg-gradient-to-r from-blue-500 to-indigo-600';
    if (value >= 10) return 'bg-gradient-to-r from-yellow-500 to-orange-600';
    return 'bg-gradient-to-r from-red-500 to-pink-600';
  };

  // Obtener color de prioridad
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      default:
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    }
  };

  // Obtener icono de categoría
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'optimization':
        return '⚡';
      case 'strategy':
        return '🎯';
      case 'risk':
        return '⚠️';
      case 'opportunity':
        return '💎';
      default:
        return '📊';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-gray-400">Analyzing your staking performance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 transition-opacity duration-500 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
      {/* Welcome Tutorial */}
      {showWelcome && <AIAnalysisWelcome onClose={() => setShowWelcome(false)} />}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gradient">AI Analysis</h2>
          <p className="text-gray-400 mt-1">Smart insights for your staking performance</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className={isRefreshing ? 'animate-spin inline-block' : ''}>🔄</span>
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Score Overview Card */}
      <div className="card-unified p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Score Circle */}
          <div className="flex-shrink-0">
            <div className="relative w-48 h-48">
              {/* Background Circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="rgba(139, 92, 246, 0.1)"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="url(#scoreGradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(score.overallScore / 100) * 552} 552`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="50%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Score Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-white">{score.overallScore}</span>
                <span className="text-sm text-gray-400 mt-1">/ 100</span>
              </div>
            </div>
          </div>

          {/* Score Details */}
          <div className="flex-1 space-y-4">
            <div>
              <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${getScoreLevelColor(score.scoreLevel)} text-white font-bold text-lg shadow-lg`}>
                {score.scoreLevel} Staker
              </div>
              <p className="text-gray-400 mt-2">
                Top <span className="text-purple-400 font-bold">{score.percentile}%</span> of all stakers
              </p>
            </div>

            {/* Strengths */}
            <div>
              <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                <span>✨</span> Your Strengths
              </h4>
              <div className="flex flex-wrap gap-2">
                {score.strengths.map((strength, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm"
                  >
                    {strength}
                  </span>
                ))}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-gray-400 text-sm">Total Staked</p>
                <p className="text-white font-bold text-lg">{formatEther(metrics.totalStaked)} POL</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Current APY</p>
                <p className="text-purple-400 font-bold text-lg">{metrics.apy.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="card-unified p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span>📊</span> Score Breakdown
        </h3>
        
        <div className="space-y-4">
          {Object.entries(score.breakdown).map(([key, value]) => {
            const maxValue = key === 'amountScore' || key === 'rewardsScore' ? 25 : 
                           key === 'consistencyScore' ? 20 : 15;
            const percentage = (value / maxValue) * 100;
            const label = key
              .replace('Score', '')
              .replace(/([A-Z])/g, ' $1')
              .trim()
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');

            return (
              <div key={key}>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300 font-medium">{label}</span>
                  <span className="text-white font-bold">{value.toFixed(1)} / {maxValue}</span>
                </div>
                <div className="w-full bg-gray-700/30 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full ${getProgressColor(value)} transition-all duration-1000 ease-out rounded-full`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="card-unified p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span>🎯</span> Smart Recommendations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, index) => (
            <div
              key={rec.id}
              className={`p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all hover:border-purple-500/30 group ${
                recommendations.length === 5 && index === 4 ? 'md:col-span-2' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getCategoryIcon(rec.category)}</span>
                    <h4 className="text-white font-bold text-lg group-hover:text-purple-400 transition-colors">
                      {rec.title}
                    </h4>
                  </div>
                  <p className="text-gray-400 mb-3">{rec.description}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(rec.priority)}`}>
                      {rec.priority.toUpperCase()} PRIORITY
                    </span>
                    <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-400 text-xs font-semibold">
                      {rec.impact}
                    </span>
                    {rec.actionable && (
                      <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-xs font-semibold">
                        ✓ ACTIONABLE
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {recommendations.length === 0 && (
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">🏆</span>
            <p className="text-gray-400">
              Perfect! You're following all best practices. Keep up the excellent work!
            </p>
          </div>
        )}
      </div>

      {/* Improvement Areas */}
      {score.improvements.length > 0 && (
        <div className="card-unified p-6 border-orange-500/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🚀</span> Areas for Growth
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {score.improvements.map((improvement, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg"
              >
                <span className="text-orange-400">→</span>
                <p className="text-gray-300 text-sm">{improvement}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileAIAnalysis;
