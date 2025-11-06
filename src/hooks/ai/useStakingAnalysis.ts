import { useState, useEffect, useMemo } from 'react';
import { useUserStaking } from '../staking/useUserStaking';
import {
  calculateStakingScore,
  generateRecommendations,
  generateInsights,
  type ScoreResult,
  type Recommendation,
  type StakingMetrics,
} from '../../utils/analytics/stakingScoreAlgorithm';

export interface StakingAnalysis {
  score: ScoreResult;
  recommendations: Recommendation[];
  insights: string[];
  metrics: StakingMetrics;
  isLoading: boolean;
  error: string | null;
  refreshAnalysis: () => void;
}

/**
 * Hook personalizado para análisis inteligente de staking
 * Combina datos de staking con algoritmos de análisis avanzados
 */
export function useStakingAnalysis(): StakingAnalysis {
  const stakingData = useUserStaking();
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());

  // Construir métricas desde los datos de staking
  const metrics: StakingMetrics = useMemo(() => {
    return {
      totalStaked: stakingData.totalStakedBigInt,
      pendingRewards: stakingData.pendingRewardsBigInt,
      activePositions: stakingData.activePositions,
      apy: parseFloat(stakingData.apy) || 0,
      // Estos campos se pueden extender si hay más datos disponibles
      stakingDuration: undefined,
      lastClaimTime: undefined,
    };
  }, [
    stakingData.totalStakedBigInt,
    stakingData.pendingRewardsBigInt,
    stakingData.activePositions,
    stakingData.apy,
  ]);

  // Calcular score
  const score = useMemo(() => {
    if (stakingData.isLoading) {
      return {
        overallScore: 0,
        scoreLevel: 'Beginner' as const,
        breakdown: {
          amountScore: 0,
          consistencyScore: 0,
          rewardsScore: 0,
          diversificationScore: 0,
          engagementScore: 0,
        },
        strengths: [],
        improvements: [],
        percentile: 0,
      };
    }
    return calculateStakingScore(metrics);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metrics, stakingData.isLoading, lastUpdateTime]);

  // Generar recomendaciones
  const recommendations = useMemo(() => {
    if (stakingData.isLoading) return [];
    return generateRecommendations(metrics, score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metrics, score, stakingData.isLoading, lastUpdateTime]);

  // Generar insights
  const insights = useMemo(() => {
    if (stakingData.isLoading) return [];
    return generateInsights(metrics, score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metrics, score, stakingData.isLoading, lastUpdateTime]);

  // Función para forzar actualización del análisis
  const refreshAnalysis = () => {
    setLastUpdateTime(Date.now());
  };

  // Auto-refresh cada 30 segundos si hay cambios en los datos
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdateTime(Date.now());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    score,
    recommendations,
    insights,
    metrics,
    isLoading: stakingData.isLoading,
    error: stakingData.error,
    refreshAnalysis,
  };
}
