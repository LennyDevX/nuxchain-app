import React, { useState, useEffect } from 'react';
import { useStakingAnalysis } from '../../hooks/analytics/useStakingAnalysis';
import { formatEther } from 'viem';
import AIAnalysisWelcome from './AIAnalysisWelcome';
import '../../styles/ai-analysis-animations.css';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

const ProfileAIAnalysis: React.FC = () => {
  const { score, recommendations, metrics, isLoading, refreshAnalysis } = useStakingAnalysis();
  const [showWelcome, setShowWelcome] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useIsMobile();

  // Check if user has seen the tutorial
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('ai-analysis-tutorial-seen');
    if (!hasSeenTutorial) {
      // Use setTimeout to defer state update
      const timer = setTimeout(() => setShowWelcome(true), 0);
      return () => clearTimeout(timer);
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
    <div className={`space-y-${isMobile ? '4' : '6'} transition-opacity duration-500 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
      {/* Welcome Tutorial */}
      {showWelcome && <AIAnalysisWelcome onClose={() => setShowWelcome(false)} />}
      
      {/* Header */}
      <div className={`flex ${isMobile ? 'flex-col gap-4' : 'items-center justify-between'}`}>
        <div>
          <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gradient`}>AI Analysis</h2>
          <p className={`text-gray-400 mt-1 ${isMobile ? 'text-sm' : ''}`}>Smart insights for your staking performance</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          aria-label={isRefreshing ? 'Refreshing AI analysis' : 'Refresh AI analysis'}
          aria-busy={isRefreshing}
          className={`btn-primary ${isMobile ? 'w-full px-4 py-2 text-sm' : 'px-4 py-2'} rounded-lg flex items-center justify-center gap-2 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span className={isRefreshing ? 'animate-spin inline-block' : ''}>🔄</span>
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Score Overview Card */}
      <div className="card-unified p-${isMobile ? '6' : '8'} relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
        
        <div className={`relative flex ${isMobile ? 'flex-col' : 'flex-col md:flex-row'} items-center justify-between gap-${isMobile ? '6' : '8'}`}>
          {/* Score Circle */}
          <div className="flex-shrink-0">
            <div className={`relative ${isMobile ? 'w-32 h-32' : 'w-48 h-48'}`}>
              {/* Background Circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx={isMobile ? "64" : "96"}
                  cy={isMobile ? "64" : "96"}
                  r={isMobile ? "56" : "88"}
                  stroke="rgba(139, 92, 246, 0.1)"
                  strokeWidth={isMobile ? "8" : "12"}
                  fill="none"
                />
                <circle
                  cx={isMobile ? "64" : "96"}
                  cy={isMobile ? "64" : "96"}
                  r={isMobile ? "56" : "88"}
                  stroke="url(#scoreGradient)"
                  strokeWidth={isMobile ? "8" : "12"}
                  fill="none"
                  strokeDasharray={`${(score.overallScore / 100) * (isMobile ? 352 : 552)} ${isMobile ? 352 : 552}`}
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
                <span className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-bold text-white`}>{score.overallScore}</span>
                <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400 mt-1`}>/ 100</span>
              </div>
            </div>
          </div>

          {/* Score Details */}
          <div className={`flex-1 space-y-${isMobile ? '3' : '4'} ${isMobile ? 'w-full' : ''}`}>
            <div>
              <div className={`inline-block px-${isMobile ? '3' : '4'} py-2 rounded-full bg-gradient-to-r ${getScoreLevelColor(score.scoreLevel)} text-white font-bold ${isMobile ? 'text-base' : 'text-lg'} shadow-lg`}>
                {score.scoreLevel} Staker
              </div>
              <p className={`text-gray-400 mt-2 ${isMobile ? 'text-sm' : ''}`}>
                Top <span className="text-purple-400 font-bold">{score.percentile}%</span> of all stakers
              </p>
            </div>

            {/* Strengths */}
            <div>
              <h4 className={`text-green-400 font-semibold mb-2 flex items-center gap-2 ${isMobile ? 'text-sm' : ''}`}>
                <span>✨</span> Your Strengths
              </h4>
              <div className="flex flex-wrap gap-2">
                {score.strengths.map((strength, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 ${isMobile ? 'text-xs' : 'text-sm'}`}
                  >
                    {strength}
                  </span>
                ))}
              </div>
            </div>

            {/* Key Metrics */}
            <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2'} gap-4 pt-2`}>
              <div>
                <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>Total Staked</p>
                <p className={`text-white font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>{formatEther(metrics.totalStaked)} POL</p>
              </div>
              <div>
                <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>Current APY</p>
                <p className={`text-purple-400 font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>{metrics.apy.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className={`card-unified p-${isMobile ? '4' : '6'}`} role="region" aria-label="Score breakdown details">
        <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white mb-${isMobile ? '4' : '6'} flex items-center gap-2`}>
          <span>📊</span> Score Breakdown
        </h3>
        
        <div className={`space-y-${isMobile ? '3' : '4'}`}>
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
                  <span className={`text-gray-300 font-medium ${isMobile ? 'text-sm' : ''}`}>{label}</span>
                  <span className={`text-white font-bold ${isMobile ? 'text-sm' : ''}`}>{value.toFixed(1)} / {maxValue}</span>
                </div>
                <div 
                  className={`w-full bg-gray-700/30 rounded-full ${isMobile ? 'h-2' : 'h-3'} overflow-hidden`}
                  role="progressbar"
                  aria-valuenow={Math.round(value)}
                  aria-valuemin={0}
                  aria-valuemax={maxValue}
                  aria-label={`${label} progress: ${value.toFixed(1)} out of ${maxValue}`}
                >
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
      <div className={`card-unified p-${isMobile ? '4' : '6'}`}>
        <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white mb-${isMobile ? '4' : '6'} flex items-center gap-2`}>
          <span>🎯</span> Smart Recommendations
        </h3>
        
        <div className={`grid gap-3 ${
          isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'
        }`}>
          {recommendations.map((rec, index) => (
            <div
              key={rec.id}
              className={`p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all hover:border-purple-500/30 group ${
                // Solo en desktop la última card ocupa 2 columnas si hay 5
                !isMobile && recommendations.length === 5 && index === 4 ? 'md:col-span-2' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className={`flex items-center gap-2 mb-2 ${isMobile ? 'flex-col items-start' : ''}`}>
                    <span className={isMobile ? 'text-lg' : 'text-2xl'}>{getCategoryIcon(rec.category)}</span>
                    <h4 className={`text-white font-bold ${isMobile ? 'text-xs' : 'text-lg'} group-hover:text-purple-400 transition-colors line-clamp-2`}>
                      {rec.title}
                    </h4>
                  </div>
                  {!isMobile && (
                    <p className="text-gray-400 mb-3 text-sm">{rec.description}</p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getPriorityColor(rec.priority)}`}>
                      {rec.priority.toUpperCase()}
                    </span>
                    {!isMobile && (
                      <>
                        <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-400 text-xs font-semibold">
                          {rec.impact}
                        </span>
                        {rec.actionable && (
                          <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-xs font-semibold">
                            ✓
                          </span>
                        )}
                      </>
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
        <div className={`card-unified p-${isMobile ? '4' : '6'} border-orange-500/20`}>
          <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white mb-4 flex items-center gap-2`}>
            <span>🚀</span> Areas for Growth
          </h3>
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'md:grid-cols-2 gap-3'}`}>
            {score.improvements.map((improvement, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 ${isMobile ? 'p-2' : 'p-3'} bg-orange-500/5 border border-orange-500/20 rounded-lg`}
              >
                <span className="text-orange-400">→</span>
                <p className={`text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>{improvement}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileAIAnalysis;
