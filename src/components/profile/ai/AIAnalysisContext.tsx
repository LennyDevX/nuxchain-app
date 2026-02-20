/**
 * AIAnalysisProvider - Provider del contexto de análisis de IA
 * Solo exporta el componente Provider para permitir Fast Refresh
 */

import { useMemo, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useAdvancedStakingAnalysis } from '../../../hooks/ai/useAdvancedStakingAnalysis';
import { useContractConstants } from '../../../hooks/ai/useContractConstants';
import { useIsMobile } from '../../../hooks/mobile/useIsMobile';
import { useWalletBalance } from '../../../hooks/web3/useWalletBalance';
import { 
  generateBalanceRecommendations,
  calculateOpportunityScore,
  type EnhancedPortfolioAnalysis,
} from '../../../utils/ai/portfolioAnalyzer';
import { 
  AIAnalysisContext, 
  DEFAULT_CONFIG, 
  type AIAnalysisConfig, 
  type AIAnalysisContextState 
} from './AIAnalysisTypes';

// Re-exportar tipos para compatibilidad
export type { AIAnalysisConfig, AIAnalysisContextState } from './AIAnalysisTypes';
export { AIAnalysisContext } from './AIAnalysisTypes';

/**
 * Provider del contexto de análisis de IA
 */
export function AIAnalysisProvider({ children }: { children: ReactNode }) {
  const analysis = useAdvancedStakingAnalysis();
  const constants = useContractConstants();
  const isMobile = useIsMobile();
  const walletBalance = useWalletBalance();
  
  // Calculate balance-aware recommendations
  const { balanceRecommendations, enhancedPortfolio, opportunityScore } = useMemo(() => {
    const availableBalance = walletBalance.availableForStaking;
    const portfolioAnalysis = analysis.portfolioAnalysis;
    
    // Generate recommendations based on wallet balance
    // Convert contract basis points to APYRatesInput for generateBalanceRecommendations
    const apyRatesInput = {
      flexible:  constants.apyRates.flexible,
      locked30:  constants.apyRates.locked30,
      locked90:  constants.apyRates.locked90,
      locked180: constants.apyRates.locked180,
      locked365: constants.apyRates.locked365,
    };
    const recommendations = generateBalanceRecommendations(availableBalance, portfolioAnalysis, apyRatesInput);
    
    // Calculate opportunity score
    const oppScore = calculateOpportunityScore(availableBalance, portfolioAnalysis);
    
    // Get enhanced portfolio analysis if we have positions
    let enhanced: EnhancedPortfolioAnalysis | null = null;
    if (portfolioAnalysis && portfolioAnalysis.totalValue > 0n) {
      // We need positions for full analysis, but we can create an enhanced version
      enhanced = {
        ...portfolioAnalysis,
        walletBalance: {
          available: availableBalance,
          canStake: walletBalance.canStake,
          suggestedStakeAmount: walletBalance.suggestedAmounts.moderate,
        },
        balanceRecommendations: recommendations,
        opportunityScore: oppScore,
      };
    }
    
    return {
      balanceRecommendations: recommendations,
      enhancedPortfolio: enhanced,
      opportunityScore: oppScore,
    };
  }, [walletBalance, analysis.portfolioAnalysis, constants.apyRates]);
  
  // Estado de configuración
  const [config, setConfig] = useState<AIAnalysisConfig>(() => {
    // Cargar configuración desde localStorage
    const saved = localStorage.getItem('ai-analysis-config');
    if (saved) {
      try {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_CONFIG;
      }
    }
    return DEFAULT_CONFIG;
  });
  
  // Estado de UI
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'gamification' | 'portfolio'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Guardar configuración en localStorage
  useEffect(() => {
    localStorage.setItem('ai-analysis-config', JSON.stringify(config));
  }, [config]);
  
  // Actualizar configuración
  const updateConfig = useCallback((updates: Partial<AIAnalysisConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);
  
  // Refresh con animación
  const refreshAnalysis = useCallback(async () => {
    setIsRefreshing(true);
    try {
      analysis.refreshAnalysis();
      constants.refetch();
      // Esperar un poco para la animación
      await new Promise(resolve => setTimeout(resolve, 800));
    } finally {
      setIsRefreshing(false);
    }
  }, [analysis, constants]);
  
  // Ajustar para mobile
  useEffect(() => {
    if (isMobile && !config.compactMode) {
      updateConfig({ compactMode: true });
    }
  }, [isMobile, config.compactMode, updateConfig]);
  
  // Helper functions para colores
  const getScoreLevelColor = useCallback((level: string): string => {
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
  }, []);
  
  const getProgressColor = useCallback((value: number): string => {
    if (value >= 20) return 'bg-gradient-to-r from-green-500 to-emerald-600';
    if (value >= 15) return 'bg-gradient-to-r from-blue-500 to-indigo-600';
    if (value >= 10) return 'bg-gradient-to-r from-yellow-500 to-orange-600';
    return 'bg-gradient-to-r from-red-500 to-pink-600';
  }, []);
  
  const getPriorityColor = useCallback((priority: string): string => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      default:
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    }
  }, []);
  
  const getCategoryIcon = useCallback((category: string): string => {
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
  }, []);
  
  const getRarityColor = useCallback((rarity: string): string => {
    switch (rarity?.toUpperCase()) {
      case 'COMMON':
        return 'from-gray-400 to-gray-500';
      case 'RARE':
        return 'from-blue-400 to-blue-600';
      case 'EPIC':
        return 'from-purple-400 to-purple-600';
      case 'LEGENDARY':
        return 'from-yellow-400 to-orange-500';
      case 'MYTHIC':
        return 'from-pink-400 to-red-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  }, []);
  
  const value = useMemo((): AIAnalysisContextState => ({
    analysis,
    constants,
    walletBalance,
    balanceRecommendations,
    enhancedPortfolio,
    opportunityScore,
    config,
    updateConfig,
    activeTab,
    setActiveTab,
    isRefreshing,
    refreshAnalysis,
    isMobile,
    getScoreLevelColor,
    getProgressColor,
    getPriorityColor,
    getCategoryIcon,
    getRarityColor,
  }), [
    analysis,
    constants,
    walletBalance,
    balanceRecommendations,
    enhancedPortfolio,
    opportunityScore,
    config,
    updateConfig,
    activeTab,
    isRefreshing,
    refreshAnalysis,
    isMobile,
    getScoreLevelColor,
    getProgressColor,
    getPriorityColor,
    getCategoryIcon,
    getRarityColor,
  ]);
  
  return (
    <AIAnalysisContext.Provider value={value}>
      {children}
    </AIAnalysisContext.Provider>
  );
}
