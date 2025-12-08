/**
 * AIAnalysisTypes - Tipos y definiciones del contexto de análisis de IA
 * Separado del provider para permitir Fast Refresh
 */

import { createContext } from 'react';
import type { AdvancedStakingAnalysis } from '../../../hooks/ai/useAdvancedStakingAnalysis';
import type { ContractConstants } from '../../../hooks/ai/useContractConstants';
import type { WalletBalanceData } from '../../../hooks/web3/useWalletBalance';
import type { BalanceRecommendation, EnhancedPortfolioAnalysis } from '../../../utils/ai/portfolioAnalyzer';

/**
 * Configuración de análisis de IA
 */
export interface AIAnalysisConfig {
  // Intervalos de refresh
  autoRefreshInterval: number; // ms, 0 = disabled
  cacheTime: number; // ms
  
  // Pesos para scoring
  weights: {
    staking: number;      // 0-1
    skills: number;       // 0-1
    gamification: number; // 0-1
    portfolio: number;    // 0-1
  };
  
  // Thresholds para recomendaciones
  thresholds: {
    lowScore: number;
    mediumScore: number;
    highScore: number;
    criticalLiquidity: number;
    optimalDiversification: number;
  };
  
  // UI preferences
  showAnimations: boolean;
  compactMode: boolean;
}

/**
 * Estado del contexto
 */
export interface AIAnalysisContextState {
  // Datos de análisis
  analysis: AdvancedStakingAnalysis;
  constants: ContractConstants;
  
  // Wallet balance data for recommendations
  walletBalance: WalletBalanceData;
  balanceRecommendations: BalanceRecommendation[];
  enhancedPortfolio: EnhancedPortfolioAnalysis | null;
  opportunityScore: number;
  
  // Configuración
  config: AIAnalysisConfig;
  updateConfig: (updates: Partial<AIAnalysisConfig>) => void;
  
  // Estado de UI
  activeTab: 'overview' | 'skills' | 'gamification' | 'portfolio';
  setActiveTab: (tab: 'overview' | 'skills' | 'gamification' | 'portfolio') => void;
  isRefreshing: boolean;
  
  // Métodos
  refreshAnalysis: () => Promise<void>;
  
  // Utilidades
  isMobile: boolean;
  
  // Helpers de colores
  getScoreLevelColor: (level: string) => string;
  getProgressColor: (value: number) => string;
  getPriorityColor: (priority: string) => string;
  getCategoryIcon: (category: string) => string;
  getRarityColor: (rarity: string) => string;
}

// Configuración por defecto
export const DEFAULT_CONFIG: AIAnalysisConfig = {
  autoRefreshInterval: 60000, // 1 minuto
  cacheTime: 300000, // 5 minutos
  
  weights: {
    staking: 0.35,
    skills: 0.25,
    gamification: 0.20,
    portfolio: 0.20,
  },
  
  thresholds: {
    lowScore: 40,
    mediumScore: 60,
    highScore: 80,
    criticalLiquidity: 10,
    optimalDiversification: 60,
  },
  
  showAnimations: true,
  compactMode: false,
};

// Crear el contexto (solo el contexto, sin provider)
export const AIAnalysisContext = createContext<AIAnalysisContextState | undefined>(undefined);
