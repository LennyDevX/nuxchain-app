/**
 * ProfileAIAnalysisRefactored - Versión modular del análisis de IA
 * Usa los sub-componentes AIAnalysisOverview, AIAnalysisSkills, AIAnalysisGamification, AIAnalysisPortfolio
 */

import React, { useState, useEffect, Suspense } from 'react';
import { AIAnalysisProvider } from './ai/AIAnalysisContext';
import { useAIAnalysis } from './ai/useAIAnalysis';
import AIAnalysisWelcome from './AIAnalysisWelcome';
import AIAnalysisOverview from './ai/AIAnalysisOverview';
import AIAnalysisSkills from './ai/AIAnalysisSkills';
import AIAnalysisGamification from './ai/AIAnalysisGamification';
import AIAnalysisPortfolio from './ai/AIAnalysisPortfolio';
import '../../styles/animations.css';

// Loading skeleton para los tabs
const TabSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="bg-slate-800/50 rounded-xl p-6 h-48 animate-pulse" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-slate-800/50 rounded-xl p-4 h-32 animate-pulse" />
      <div className="bg-slate-800/50 rounded-xl p-4 h-32 animate-pulse" />
    </div>
  </div>
);

// Contenido interno que usa el contexto
const ProfileAIAnalysisContent: React.FC = () => {
  const { 
    analysis, 
    activeTab, 
    setActiveTab, 
    isRefreshing, 
    refreshAnalysis,
    isMobile 
  } = useAIAnalysis();
  
  const [showWelcome, setShowWelcome] = useState(false);

  // Check if user has seen the tutorial
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('ai-analysis-tutorial-seen');
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => setShowWelcome(true), 0);
      return () => clearTimeout(timer);
    }
  }, []);

  // Handle refresh with animation
  const handleRefresh = async () => {
    await refreshAnalysis();
  };

  if (analysis.isLoading) {
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
          <h2 className={`font-bold jersey-15-regular text-gradient ${isMobile ? 'text-4xl' : 'text-5xl'}`}>
            🤖 Advanced AI Analysis
          </h2>
          <p className={`text-gray-400 mt-1 jersey-20-regular ${isMobile ? 'text-xl' : 'text-2xl'}`}>
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
          { id: 'skills', label: 'Skills', icon: '⚡', badge: analysis.skillAnalysis?.activeSkills },
          { id: 'gamification', label: 'Progress', icon: '🎮', badge: analysis.gamificationAnalysis?.levelProgress.currentLevel },
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

      {/* Tab Content */}
      <Suspense fallback={<TabSkeleton />}>
        {activeTab === 'overview' && <AIAnalysisOverview />}
        {activeTab === 'skills' && <AIAnalysisSkills />}
        {activeTab === 'gamification' && <AIAnalysisGamification />}
        {activeTab === 'portfolio' && <AIAnalysisPortfolio />}
      </Suspense>
    </div>
  );
};

// Componente principal envuelto con el Provider
const ProfileAIAnalysisRefactored: React.FC = () => {
  return (
    <AIAnalysisProvider>
      <ProfileAIAnalysisContent />
    </AIAnalysisProvider>
  );
};

export default ProfileAIAnalysisRefactored;
