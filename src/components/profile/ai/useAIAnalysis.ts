/**
 * useAIAnalysis - Hooks para consumir el contexto de análisis de IA
 */

import { useContext } from 'react';
import { AIAnalysisContext, type AIAnalysisContextState } from './AIAnalysisTypes';

/**
 * Hook principal para usar el contexto de análisis de IA
 */
export function useAIAnalysis(): AIAnalysisContextState {
  const context = useContext(AIAnalysisContext);
  if (!context) {
    throw new Error('useAIAnalysis must be used within an AIAnalysisProvider');
  }
  return context;
}

/**
 * Hook para obtener solo el score y estado de carga
 */
export function useAIScore() {
  const { analysis } = useAIAnalysis();
  return {
    score: analysis.overallScore.overallScore,
    level: analysis.overallScore.scoreLevel,
    isLoading: analysis.isLoading,
  };
}

/**
 * Hook para obtener solo las recomendaciones
 */
export function useAIRecommendations() {
  const { analysis } = useAIAnalysis();
  return {
    recommendations: analysis.recommendations,
    count: analysis.recommendations.length,
    highPriority: analysis.recommendations.filter(r => r.priority === 'high').length,
  };
}

/**
 * Hook para obtener datos de skills
 */
export function useAISkillsData() {
  const { analysis, getRarityColor } = useAIAnalysis();
  return {
    skillAnalysis: analysis.skillAnalysis,
    skillStrategy: analysis.skillStrategy,
    enhancedAPY: analysis.enhancedAPY,
    getRarityColor,
    isLoading: analysis.isLoading,
  };
}

/**
 * Hook para obtener datos de gamificación
 */
export function useAIGamificationData() {
  const { analysis } = useAIAnalysis();
  return {
    gamificationAnalysis: analysis.gamificationAnalysis,
    specialRewards: analysis.specialRewards,
    isLoading: analysis.isLoading,
  };
}

/**
 * Hook para obtener datos de portafolio
 */
export function useAIPortfolioData() {
  const { analysis, walletBalance, balanceRecommendations, enhancedPortfolio, opportunityScore } = useAIAnalysis();
  return {
    portfolioAnalysis: analysis.portfolioAnalysis,
    portfolioEfficiency: analysis.portfolioEfficiency,
    growthProjections: analysis.growthProjections,
    // New wallet balance data
    walletBalance,
    balanceRecommendations,
    enhancedPortfolio,
    opportunityScore,
    isLoading: analysis.isLoading || walletBalance.isLoading,
  };
}

/**
 * Hook para obtener solo datos de balance de wallet
 */
export function useAIWalletBalance() {
  const { walletBalance, balanceRecommendations, opportunityScore } = useAIAnalysis();
  return {
    balance: walletBalance,
    recommendations: balanceRecommendations,
    opportunityScore,
    isLoading: walletBalance.isLoading,
  };
}
