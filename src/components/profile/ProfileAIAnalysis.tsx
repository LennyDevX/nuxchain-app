import React, { useState, useEffect } from 'react';
import { useAdvancedStakingAnalysis } from '../../hooks/ai/useAdvancedStakingAnalysis';
import AIAnalysisWelcome from './AIAnalysisWelcome';
import '../../styles/animations.css';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

const ProfileAIAnalysis: React.FC = () => {
  const {
    overallScore,
    recommendations,
    skillAnalysis,
    skillStrategy,
    enhancedAPY,
    gamificationAnalysis,
    portfolioAnalysis,
    portfolioEfficiency,
    isLoading,
    refreshAnalysis
  } = useAdvancedStakingAnalysis();
  
  const [showWelcome, setShowWelcome] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'gamification' | 'portfolio'>('overview');
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
          <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent`}>
            🤖 Advanced AI Analysis
          </h2>
          <p className={`text-gray-400 mt-1 ${isMobile ? 'text-sm' : ''}`}>
            Comprehensive insights with Skills, Gamification & Portfolio analysis
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label={isRefreshing ? 'Refreshing AI analysis' : 'Refresh AI analysis'}
            className={`btn-primary ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'} rounded-lg flex items-center justify-center gap-2 hover:scale-105 transition-all disabled:opacity-50`}
          >
            <span className={isRefreshing ? 'animate-spin inline-block' : ''}>🔄</span>
            {!isMobile && <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>}
          </button>
          <button
            onClick={() => setShowWelcome(true)}
            className={`${isMobile ? 'px-3 py-2' : 'px-4 py-2'} bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all`}
          >
            <span className="text-lg">💡</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'skills', label: 'Skills', icon: '⚡', badge: skillAnalysis?.activeSkills },
          { id: 'gamification', label: 'Progress', icon: '🎮', badge: gamificationAnalysis?.levelProgress.currentLevel },
          { id: 'portfolio', label: 'Portfolio', icon: '💼' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            <span className={isMobile ? 'text-sm' : ''}>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Enhanced Score Card */}
          <div className="card-unified p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
            
            <div className={`relative grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-2 gap-8'}`}>
              {/* Score Circle */}
              <div className="flex flex-col items-center justify-center">
                <div className={`relative ${isMobile ? 'w-40 h-40' : 'w-48 h-48'}`}>
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx={isMobile ? "80" : "96"}
                      cy={isMobile ? "80" : "96"}
                      r={isMobile ? "70" : "88"}
                      stroke="rgba(139, 92, 246, 0.1)"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx={isMobile ? "80" : "96"}
                      cy={isMobile ? "80" : "96"}
                      r={isMobile ? "70" : "88"}
                      stroke="url(#scoreGradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(overallScore.overallScore / 100) * (isMobile ? 440 : 552)} ${isMobile ? 440 : 552}`}
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
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-white">{overallScore.overallScore}</span>
                    <span className="text-sm text-gray-400 mt-1">/ 100</span>
                  </div>
                </div>
                
                <div className={`mt-4 inline-block px-4 py-2 rounded-full bg-gradient-to-r ${getScoreLevelColor(overallScore.scoreLevel)} text-white font-bold text-lg shadow-lg`}>
                  {overallScore.scoreLevel} Staker
                </div>
                <p className="text-gray-400 mt-2">
                  Top <span className="text-purple-400 font-bold">{overallScore.percentile}%</span> of all stakers
                </p>
              </div>

              {/* Stats Grid */}
              <div className="space-y-4">
                {/* Enhanced APY */}
                {enhancedAPY > 0 && (
                  <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Enhanced APY</span>
                      <span className="text-purple-400 text-xs font-semibold">WITH SKILLS</span>
                    </div>
                    <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                      {enhancedAPY.toFixed(2)}%
                    </div>
                  </div>
                )}

                {/* Skills Summary */}
                {skillAnalysis && (
                  <div 
                    className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-purple-500/30 transition-all cursor-pointer" 
                    onClick={() => setActiveTab('skills')}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Active Skills</p>
                        <p className="text-2xl font-bold text-white">
                          {skillAnalysis.activeSkills} / {skillAnalysis.maxSkillsAvailable}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-sm">Total Boost</p>
                        <p className="text-2xl font-bold text-green-400">
                          +{skillAnalysis.totalSkillBoost.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gamification Progress */}
                {gamificationAnalysis && (
                  <div 
                    className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-pink-500/30 transition-all cursor-pointer" 
                    onClick={() => setActiveTab('gamification')}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Level & XP</p>
                        <p className="text-2xl font-bold text-white">
                          Level {gamificationAnalysis.levelProgress.currentLevel}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-sm">Engagement</p>
                        <p className="text-2xl font-bold text-pink-400">
                          {gamificationAnalysis.engagementScore}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Strengths */}
                <div>
                  <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2 text-sm">
                    <span>✨</span> Your Strengths
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {overallScore.strengths.map((strength: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-xs"
                      >
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className={`card-unified p-${isMobile ? '4' : '6'}`}>
            <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white mb-${isMobile ? '4' : '6'} flex items-center gap-2`}>
              <span>📊</span> Score Breakdown
            </h3>
            
            <div className={`space-y-${isMobile ? '3' : '4'}`}>
              {Object.entries(overallScore.breakdown).map(([key, value]) => {
                const numValue = value as number;
                const maxValue = key === 'amountScore' || key === 'rewardsScore' ? 25 : 
                               key === 'consistencyScore' ? 20 : 15;
                const percentage = (numValue / maxValue) * 100;
                const label = key
                  .replace('Score', '')
                  .replace(/([A-Z])/g, ' $1')
                  .trim()
                  .split(' ')
                  .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');

                return (
                  <div key={key}>
                    <div className="flex justify-between mb-2">
                      <span className={`text-gray-300 font-medium ${isMobile ? 'text-sm' : ''}`}>{label}</span>
                      <span className={`text-white font-bold ${isMobile ? 'text-sm' : ''}`}>{numValue.toFixed(1)} / {maxValue}</span>
                    </div>
                    <div className={`w-full bg-gray-700/30 rounded-full ${isMobile ? 'h-2' : 'h-3'} overflow-hidden`}>
                      <div
                        className={`h-full ${getProgressColor(numValue)} transition-all duration-1000 ease-out rounded-full`}
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
            
            <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className={`p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all hover:border-purple-500/30 group`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getCategoryIcon(rec.category)}</span>
                    <div className="flex-1">
                      <h4 className={`text-white font-bold ${isMobile ? 'text-sm' : 'text-base'} mb-2`}>
                        {rec.title}
                      </h4>
                      <p className={`text-gray-400 mb-3 ${isMobile ? 'text-xs' : 'text-sm'}`}>{rec.description}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(rec.priority)}`}>
                          {rec.priority.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-400 text-xs">
                          {rec.impact}
                        </span>
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
                  Perfect! You're following all best practices!
                </p>
              </div>
            )}
          </div>

          {/* Improvement Areas */}
          {overallScore.improvements.length > 0 && (
            <div className={`card-unified p-${isMobile ? '4' : '6'} border-orange-500/20`}>
              <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white mb-4 flex items-center gap-2`}>
                <span>🚀</span> Areas for Growth
              </h3>
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'md:grid-cols-2 gap-3'}`}>
                {overallScore.improvements.map((improvement: string, idx: number) => (
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
        </>
      )}

      {/* Skills Tab */}
      {activeTab === 'skills' && skillAnalysis && (
        <div className="space-y-6">
          {/* Skills Overview Cards */}
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
            <div className="card-unified p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider">Skills</span>
              </div>
              <p className="text-gray-400 text-sm mb-2">Active Skills</p>
              <p className="text-4xl font-bold text-white mb-1">{skillAnalysis.activeSkills}</p>
              <p className="text-gray-500 text-xs">of {skillAnalysis.maxSkillsAvailable} available</p>
            </div>

            <div className="card-unified p-6 bg-gradient-to-br from-green-500/10 to-green-600/5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
                <span className="text-xs text-green-400 font-semibold uppercase tracking-wider">Boost</span>
              </div>
              <p className="text-gray-400 text-sm mb-2">Total APY Boost</p>
              <p className="text-4xl font-bold text-green-400 mb-1">+{(skillAnalysis.totalSkillBoost / 100).toFixed(1)}%</p>
              <p className="text-gray-500 text-xs">Applied to staking rewards</p>
            </div>

            <div className="card-unified p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Usage</span>
              </div>
              <p className="text-gray-400 text-sm mb-2">Skill Utilization</p>
              <p className="text-4xl font-bold text-blue-400 mb-1">{skillAnalysis.skillUtilization.toFixed(0)}%</p>
              <p className="text-gray-500 text-xs">Efficiency rating</p>
            </div>
          </div>

          {/* Strategy Score */}
          {skillStrategy && (
            <div className="card-unified p-6 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-purple-500/5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <span className="text-3xl">🎯</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold text-lg">Skill Strategy</h4>
                  <p className="text-gray-400 text-sm">Overall effectiveness analysis</p>
                </div>
                <div className="text-right">
                  <div className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl">
                    <p className="text-xs text-gray-400 mb-1">Score</p>
                    <p className="text-2xl font-bold text-white">{skillStrategy.score}<span className="text-sm text-gray-400">/100</span></p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text">
                    {skillStrategy.rating}
                  </span>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${i < Math.floor(skillStrategy.score / 20) ? 'bg-gradient-to-r from-purple-400 to-pink-400' : 'bg-gray-700'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">{skillStrategy.feedback}</p>
              </div>
            </div>
          )}

          {/* Rarity Distribution */}
          {skillAnalysis.rarityDistribution && Object.keys(skillAnalysis.rarityDistribution).length > 0 && (
            <div className="card-unified p-6">
              <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <span>💎</span> Skills by Rarity
              </h4>
              <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-3 md:grid-cols-5'}`}>
                {Object.entries(skillAnalysis.rarityDistribution).map(([rarity, count]) => {
                  const rarityColors = {
                    'COMMON': 'from-gray-500/20 to-gray-600/10 border-gray-500/30',
                    'UNCOMMON': 'from-green-500/20 to-green-600/10 border-green-500/30',
                    'RARE': 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
                    'EPIC': 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
                    'LEGENDARY': 'from-orange-500/20 to-orange-600/10 border-orange-500/30'
                  };
                  const rarityIcons = {
                    'COMMON': '⚪',
                    'UNCOMMON': '🟢',
                    'RARE': '🔵',
                    'EPIC': '🟣',
                    'LEGENDARY': '🟠'
                  };
                  return (
                    <div key={rarity} className={`p-4 bg-gradient-to-br ${rarityColors[rarity as keyof typeof rarityColors] || 'from-gray-500/20 to-gray-600/10 border-gray-500/30'} border rounded-xl text-center`}>
                      <div className="text-2xl mb-2">{rarityIcons[rarity as keyof typeof rarityIcons] || '⚪'}</div>
                      <p className="text-xs text-gray-400 mb-1">{rarity}</p>
                      <p className="text-xl font-bold text-white">{count}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Skill Recommendations */}
          {skillAnalysis.recommendations.length > 0 && (
            <div className="card-unified p-6">
              <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <span>💡</span> Smart Recommendations
              </h4>
              <div className="space-y-3">
                {skillAnalysis.recommendations.map((rec, idx) => {
                  const typeIcons = {
                    'activate': '🔥',
                    'upgrade': '⬆️',
                    'acquire': '🛒',
                    'optimize': '⚙️'
                  };
                  return (
                    <div key={idx} className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-xl transition-all group">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <span className="text-xl">{typeIcons[rec.type as keyof typeof typeIcons] || '💡'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-white font-semibold mb-1">{rec.title}</h5>
                          <p className="text-gray-400 text-sm leading-relaxed mb-3">{rec.description}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(rec.priority)}`}>
                              {rec.priority.toUpperCase()}
                            </span>
                            <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-xs font-semibold">
                              +{rec.estimatedImpact.toFixed(1)}% Impact
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Skills Message */}
          {skillAnalysis.activeSkills === 0 && (
            <div className="card-unified p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <span className="text-4xl">⚡</span>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">No Active Skills Yet</h4>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Purchase and activate Skill NFTs to boost your staking rewards and unlock special features!
              </p>
              <a href="/skills" className="btn-primary inline-flex items-center gap-2">
                <span>🛒</span>
                <span>Browse Skill NFTs</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Gamification Tab */}
      {activeTab === 'gamification' && gamificationAnalysis && (
        <div className="space-y-6">
          {/* Level & XP Progress */}
          <div className="card-unified p-6 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-pink-500/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                <span className="text-4xl">🎮</span>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-1">Level {gamificationAnalysis.levelProgress.currentLevel}</h3>
                <p className="text-gray-400">Progress to Level {gamificationAnalysis.levelProgress.nextLevel}</p>
              </div>
              <div className="text-right">
                <div className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl">
                  <p className="text-xs text-gray-400 mb-1">Engagement</p>
                  <p className="text-2xl font-bold text-pink-400">{gamificationAnalysis.engagementScore}%</p>
                </div>
              </div>
            </div>
            
            {/* XP Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Experience Progress</span>
                <span className="text-sm font-semibold text-white">{gamificationAnalysis.levelProgress.xpProgress.toFixed(1)}%</span>
              </div>
              <div className="relative w-full bg-gray-700/30 rounded-full h-6 overflow-hidden border border-white/10">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 animate-pulse-slow"
                  style={{ width: `${gamificationAnalysis.levelProgress.xpProgress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white drop-shadow-lg">
                    {gamificationAnalysis.levelProgress.xpProgress.toFixed(0)}% Complete
                  </span>
                </div>
              </div>
            </div>

            {/* Level Stats */}
            <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
              <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-center">
                <p className="text-xs text-gray-400 mb-1">Current Level</p>
                <p className="text-xl font-bold text-white">{gamificationAnalysis.levelProgress.currentLevel}</p>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-center">
                <p className="text-xs text-gray-400 mb-1">Next Level</p>
                <p className="text-xl font-bold text-purple-400">{gamificationAnalysis.levelProgress.nextLevel}</p>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-center">
                <p className="text-xs text-gray-400 mb-1">XP Progress</p>
                <p className="text-xl font-bold text-pink-400">{gamificationAnalysis.levelProgress.xpProgress.toFixed(0)}%</p>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-center">
                <p className="text-xs text-gray-400 mb-1">Engagement</p>
                <p className="text-xl font-bold text-blue-400">{gamificationAnalysis.engagementScore}%</p>
              </div>
            </div>
          </div>

          {/* Completion Rates */}
          <div className="card-unified p-6">
            <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <span>🏆</span> Achievement & Quest Progress
            </h4>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
              <div className="p-5 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/20 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <span className="text-2xl">📜</span>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{gamificationAnalysis.completionRates.quests}%</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400">Quests Completed</p>
                <div className="mt-3 w-full bg-gray-700/30 rounded-full h-2">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${gamificationAnalysis.completionRates.quests}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-5 bg-gradient-to-br from-purple-500/10 to-indigo-500/5 border border-purple-500/20 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <span className="text-2xl">🏅</span>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{gamificationAnalysis.completionRates.achievements}%</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400">Achievements Unlocked</p>
                <div className="mt-3 w-full bg-gray-700/30 rounded-full h-2">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${gamificationAnalysis.completionRates.achievements}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{gamificationAnalysis.completionRates.overall}%</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400">Overall Completion</p>
                <div className="mt-3 w-full bg-gray-700/30 rounded-full h-2">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${gamificationAnalysis.completionRates.overall}%` }}
                  ></div>
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
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <span className="text-xl">🎯</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Activity Level</p>
                    <p className="text-xl font-bold text-white">
                      {gamificationAnalysis.engagementScore >= 80 ? 'Very Active' : gamificationAnalysis.engagementScore >= 60 ? 'Active' : gamificationAnalysis.engagementScore >= 40 ? 'Moderate' : 'Low'}
                    </p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">Based on your overall platform engagement</p>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <span className="text-xl">⚡</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Progress Status</p>
                    <p className="text-xl font-bold text-white">
                      {gamificationAnalysis.completionRates.overall >= 75 ? 'Excellent' : gamificationAnalysis.completionRates.overall >= 50 ? 'Good' : 'Getting Started'}
                    </p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">Your journey through quests and achievements</p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="card-unified p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
            <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <span>🚀</span> Level Up Faster
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                <span className="text-2xl">💰</span>
                <div>
                  <p className="text-white font-semibold mb-1">Complete More Staking</p>
                  <p className="text-gray-400 text-sm">Each staking deposit earns XP based on amount and duration</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                <span className="text-2xl">🎨</span>
                <div>
                  <p className="text-white font-semibold mb-1">Trade NFTs</p>
                  <p className="text-gray-400 text-sm">Buying and selling NFTs contributes to your engagement score</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                <span className="text-2xl">📜</span>
                <div>
                  <p className="text-white font-semibold mb-1">Finish Quests</p>
                  <p className="text-gray-400 text-sm">Complete active quests for bonus XP and rewards</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Tab */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          {portfolioAnalysis ? (
            <>
              {/* Portfolio Overview Cards */}
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
                <div className="card-unified p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider">Score</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">Diversification</p>
                  <p className="text-4xl font-bold text-white mb-1">{portfolioAnalysis.diversificationScore}</p>
                  <p className="text-gray-500 text-xs">out of 100</p>
                </div>

                <div className="card-unified p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <span className="text-2xl">⚖️</span>
                    </div>
                    <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Risk</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">Risk Level</p>
                  <p className={`text-4xl font-bold mb-1 ${
                    portfolioAnalysis.riskLevel === 'Low' ? 'text-green-400' :
                    portfolioAnalysis.riskLevel === 'Medium' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>{portfolioAnalysis.riskLevel}</p>
                  <p className="text-gray-500 text-xs">Assessment</p>
                </div>

                <div className="card-unified p-6 bg-gradient-to-br from-green-500/10 to-green-600/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <span className="text-2xl">💧</span>
                    </div>
                    <span className="text-xs text-green-400 font-semibold uppercase tracking-wider">Liquid</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">Liquidity Ratio</p>
                  <p className="text-4xl font-bold text-green-400 mb-1">{portfolioAnalysis.liquidityRatio.toFixed(1)}%</p>
                  <p className="text-gray-500 text-xs">Available funds</p>
                </div>
              </div>

              {/* Efficiency Score */}
              {portfolioEfficiency && (
                <div className="card-unified p-6 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-purple-500/5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      <span className="text-3xl">📊</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-bold text-lg">Portfolio Efficiency</h4>
                      <p className="text-gray-400 text-sm">Overall optimization analysis</p>
                    </div>
                    <div className="text-right">
                      <div className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl">
                        <p className="text-xs text-gray-400 mb-1">Score</p>
                        <p className="text-2xl font-bold text-white">{portfolioEfficiency.score}<span className="text-sm text-gray-400">/100</span></p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text">
                        {portfolioEfficiency.rating}
                      </span>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className={`w-2 h-2 rounded-full ${i < Math.floor(portfolioEfficiency.score / 20) ? 'bg-gradient-to-r from-purple-400 to-pink-400' : 'bg-gray-700'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{portfolioEfficiency.feedback}</p>
                  </div>
                </div>
              )}

              {/* Position Distribution */}
              <div className="card-unified p-6">
                <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <span>📂</span> Position Distribution
                </h4>
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
                  <div className="p-4 bg-gradient-to-br from-gray-500/10 to-gray-600/5 border border-gray-500/20 rounded-xl text-center">
                    <div className="text-2xl mb-2">⚡</div>
                    <p className="text-xs text-gray-400 mb-2">Flexible</p>
                    <p className="text-2xl font-bold text-white">{portfolioAnalysis.positionDistribution.flexible}</p>
                    <p className="text-xs text-gray-500 mt-1">positions</p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl text-center">
                    <div className="text-2xl mb-2">📅</div>
                    <p className="text-xs text-gray-400 mb-2">Short (30d)</p>
                    <p className="text-2xl font-bold text-white">{portfolioAnalysis.positionDistribution.short}</p>
                    <p className="text-xs text-gray-500 mt-1">positions</p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl text-center">
                    <div className="text-2xl mb-2">📆</div>
                    <p className="text-xs text-gray-400 mb-2">Medium (90d)</p>
                    <p className="text-2xl font-bold text-white">{portfolioAnalysis.positionDistribution.medium}</p>
                    <p className="text-xs text-gray-500 mt-1">positions</p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl text-center">
                    <div className="text-2xl mb-2">🗓️</div>
                    <p className="text-xs text-gray-400 mb-2">Long (180d+)</p>
                    <p className="text-2xl font-bold text-white">{portfolioAnalysis.positionDistribution.long}</p>
                    <p className="text-xs text-gray-500 mt-1">positions</p>
                  </div>
                </div>
              </div>

              {/* Weighted APY */}
              <div className="card-unified p-6 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                    <span className="text-3xl">💰</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-400 text-sm mb-1">Weighted Portfolio APY</p>
                    <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text">
                      {portfolioAnalysis.weightedAPY.toFixed(2)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-1">Annual Return</p>
                    <p className="text-sm text-gray-300">on all positions</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card-unified p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <span className="text-6xl">📊</span>
              </div>
              <h4 className="text-2xl font-bold text-white mb-3">Portfolio Analysis Coming Soon</h4>
              <p className="text-gray-400 mb-2 max-w-md mx-auto">
                Create multiple staking deposits to unlock comprehensive portfolio insights
              </p>
              <p className="text-gray-500 text-sm mb-6">
                You'll see diversification scores, risk analysis, position distribution, and more!
              </p>
              <a href="/staking" className="btn-primary inline-flex items-center gap-2">
                <span>💰</span>
                <span>Start Staking</span>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileAIAnalysis;
