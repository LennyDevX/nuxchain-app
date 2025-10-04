/**
 * Algoritmo inteligente para calcular el score de staking
 * Analiza múltiples factores para dar una visión completa del rendimiento
 */

export interface StakingMetrics {
  totalStaked: bigint;
  pendingRewards: bigint;
  activePositions: number;
  apy: number;
  stakingDuration?: number; // en días
  lastClaimTime?: bigint;
}

export interface ScoreResult {
  overallScore: number; // 0-100
  scoreLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master';
  breakdown: {
    amountScore: number;
    consistencyScore: number;
    rewardsScore: number;
    diversificationScore: number;
    engagementScore: number;
  };
  strengths: string[];
  improvements: string[];
  percentile: number; // Percentil en el pool
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'optimization' | 'strategy' | 'risk' | 'opportunity';
  actionable: boolean;
  impact: string;
}

/**
 * Calcula el score basado en la cantidad stakeada
 * Máximo: 25 puntos
 */
function calculateAmountScore(totalStaked: bigint): number {
  const stakedInEther = Number(totalStaked) / 1e18;
  
  // Escala logarítmica para evitar que grandes cantidades dominen
  if (stakedInEther === 0) return 0;
  if (stakedInEther < 10) return Math.min(stakedInEther * 1.5, 15);
  if (stakedInEther < 100) return Math.min(15 + (stakedInEther - 10) * 0.08, 20);
  if (stakedInEther < 1000) return Math.min(20 + (stakedInEther - 100) * 0.005, 25);
  
  return 25;
}

/**
 * Calcula el score de consistencia basado en posiciones activas
 * Máximo: 20 puntos
 */
function calculateConsistencyScore(activePositions: number): number {
  if (activePositions === 0) return 0;
  if (activePositions === 1) return 8;
  if (activePositions <= 3) return 12;
  if (activePositions <= 5) return 16;
  
  return Math.min(16 + (activePositions - 5) * 0.8, 20);
}

/**
 * Calcula el score de recompensas basado en el APY y rewards pendientes
 * Máximo: 25 puntos
 */
function calculateRewardsScore(
  pendingRewards: bigint,
  totalStaked: bigint,
  apy: number
): number {
  const rewardsInEther = Number(pendingRewards) / 1e18;
  const stakedInEther = Number(totalStaked) / 1e18;
  
  // Puntuación por APY (0-15 puntos)
  const apyScore = Math.min(apy * 0.75, 15);
  
  // Puntuación por ratio de rewards (0-10 puntos)
  const rewardRatio = stakedInEther > 0 ? (rewardsInEther / stakedInEther) * 100 : 0;
  const ratioScore = Math.min(rewardRatio * 2, 10);
  
  return Math.min(apyScore + ratioScore, 25);
}

/**
 * Calcula el score de diversificación
 * Máximo: 15 puntos
 */
function calculateDiversificationScore(
  activePositions: number,
  totalStaked: bigint
): number {
  const stakedInEther = Number(totalStaked) / 1e18;
  
  // Penaliza tener todo en una sola posición
  if (activePositions === 0) return 0;
  if (activePositions === 1 && stakedInEther > 50) return 5;
  if (activePositions === 2) return 8;
  if (activePositions >= 3 && activePositions <= 5) return 12;
  if (activePositions > 5) return 15;
  
  return 10;
}

/**
 * Calcula el score de engagement (actividad reciente)
 * Máximo: 15 puntos
 */
function calculateEngagementScore(
  lastClaimTime?: bigint,
  stakingDuration?: number
): number {
  let score = 0;
  
  // Puntuación por duración del staking
  if (stakingDuration) {
    if (stakingDuration > 180) score += 8; // Más de 6 meses
    else if (stakingDuration > 90) score += 6; // Más de 3 meses
    else if (stakingDuration > 30) score += 4; // Más de 1 mes
    else score += 2;
  }
  
  // Puntuación por última actividad de claim
  if (lastClaimTime) {
    const now = BigInt(Math.floor(Date.now() / 1000));
    const daysSinceLastClaim = Number(now - lastClaimTime) / (60 * 60 * 24);
    
    if (daysSinceLastClaim < 7) score += 7; // Activo esta semana
    else if (daysSinceLastClaim < 30) score += 5; // Activo este mes
    else if (daysSinceLastClaim < 90) score += 3; // Activo este trimestre
    else score += 1;
  } else {
    score += 5; // Nuevo usuario, puntaje neutral
  }
  
  return Math.min(score, 15);
}

/**
 * Determina el nivel basado en el score total
 */
function getScoreLevel(score: number): ScoreResult['scoreLevel'] {
  if (score >= 90) return 'Master';
  if (score >= 75) return 'Expert';
  if (score >= 60) return 'Advanced';
  if (score >= 40) return 'Intermediate';
  return 'Beginner';
}

/**
 * Identifica fortalezas del usuario
 */
function identifyStrengths(breakdown: ScoreResult['breakdown']): string[] {
  const strengths: string[] = [];
  
  if (breakdown.amountScore >= 20) {
    strengths.push('Strong capital commitment');
  }
  if (breakdown.consistencyScore >= 15) {
    strengths.push('Excellent position management');
  }
  if (breakdown.rewardsScore >= 20) {
    strengths.push('High reward generation');
  }
  if (breakdown.diversificationScore >= 12) {
    strengths.push('Well-diversified portfolio');
  }
  if (breakdown.engagementScore >= 12) {
    strengths.push('Highly engaged stakeholder');
  }
  
  return strengths.length > 0 
    ? strengths 
    : ['Building your staking profile'];
}

/**
 * Identifica áreas de mejora
 */
function identifyImprovements(breakdown: ScoreResult['breakdown']): string[] {
  const improvements: string[] = [];
  
  if (breakdown.amountScore < 15) {
    improvements.push('Consider increasing your staking amount');
  }
  if (breakdown.consistencyScore < 10) {
    improvements.push('Create multiple positions for better risk management');
  }
  if (breakdown.rewardsScore < 15) {
    improvements.push('Optimize your positions for higher APY');
  }
  if (breakdown.diversificationScore < 8) {
    improvements.push('Diversify across more positions');
  }
  if (breakdown.engagementScore < 8) {
    improvements.push('Stay more active with regular claims');
  }
  
  return improvements;
}

/**
 * Calcula el percentil en el pool (simulado)
 */
function calculatePercentile(score: number): number {
  // Distribución aproximada basada en curva normal
  if (score >= 90) return 95;
  if (score >= 80) return 85;
  if (score >= 70) return 70;
  if (score >= 60) return 55;
  if (score >= 50) return 40;
  if (score >= 40) return 25;
  return Math.max(10, score / 2);
}

/**
 * Función principal para calcular el score de staking
 */
export function calculateStakingScore(metrics: StakingMetrics): ScoreResult {
  const breakdown = {
    amountScore: calculateAmountScore(metrics.totalStaked),
    consistencyScore: calculateConsistencyScore(metrics.activePositions),
    rewardsScore: calculateRewardsScore(
      metrics.pendingRewards,
      metrics.totalStaked,
      metrics.apy
    ),
    diversificationScore: calculateDiversificationScore(
      metrics.activePositions,
      metrics.totalStaked
    ),
    engagementScore: calculateEngagementScore(
      metrics.lastClaimTime,
      metrics.stakingDuration
    ),
  };
  
  const overallScore = Math.round(
    breakdown.amountScore +
    breakdown.consistencyScore +
    breakdown.rewardsScore +
    breakdown.diversificationScore +
    breakdown.engagementScore
  );
  
  return {
    overallScore: Math.min(overallScore, 100),
    scoreLevel: getScoreLevel(overallScore),
    breakdown,
    strengths: identifyStrengths(breakdown),
    improvements: identifyImprovements(breakdown),
    percentile: calculatePercentile(overallScore),
  };
}

/**
 * Genera recomendaciones inteligentes basadas en el score
 */
export function generateRecommendations(
  metrics: StakingMetrics,
  scoreResult: ScoreResult
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const { breakdown } = scoreResult;
  const stakedInEther = Number(metrics.totalStaked) / 1e18;
  
  // Recomendaciones por bajo amount score
  if (breakdown.amountScore < 15) {
    recommendations.push({
      id: 'increase-stake',
      title: 'Increase Your Stake',
      description: `Your current stake of ${stakedInEther.toFixed(2)} tokens is below optimal levels. Consider increasing to at least 50 tokens to improve your position score and unlock better rewards.`,
      priority: 'high',
      category: 'optimization',
      actionable: true,
      impact: '+10-15 score points',
    });
  }
  
  // Recomendaciones por consistencia
  if (breakdown.consistencyScore < 12 && metrics.activePositions < 3) {
    recommendations.push({
      id: 'diversify-positions',
      title: 'Diversify Your Positions',
      description: 'Create multiple staking positions to reduce risk and improve your consistency score. Aim for 3-5 positions for optimal diversification.',
      priority: 'high',
      category: 'strategy',
      actionable: true,
      impact: '+8-12 score points',
    });
  }
  
  // Recomendaciones por APY
  if (metrics.apy < 15) {
    recommendations.push({
      id: 'optimize-apy',
      title: 'Optimize Your APY',
      description: `Your current APY of ${metrics.apy}% is below average. Consider longer lock periods or explore high-yield pools to increase your returns.`,
      priority: 'medium',
      category: 'optimization',
      actionable: true,
      impact: '+5-10 score points',
    });
  }
  
  // Recomendaciones por rewards pendientes altos
  const rewardsInEther = Number(metrics.pendingRewards) / 1e18;
  if (rewardsInEther > 10) {
    recommendations.push({
      id: 'claim-rewards',
      title: 'Claim Your Rewards',
      description: `You have ${rewardsInEther.toFixed(2)} tokens in pending rewards. Consider claiming and restaking to compound your earnings.`,
      priority: 'high',
      category: 'opportunity',
      actionable: true,
      impact: 'Compound growth',
    });
  }
  
  // Recomendaciones por engagement bajo
  if (breakdown.engagementScore < 10) {
    recommendations.push({
      id: 'increase-activity',
      title: 'Stay More Active',
      description: 'Regular interaction with your staking positions improves your engagement score. Check your positions weekly and claim rewards regularly.',
      priority: 'low',
      category: 'strategy',
      actionable: true,
      impact: '+5-8 score points',
    });
  }
  
  // Recomendaciones para expertos
  if (scoreResult.scoreLevel === 'Expert' || scoreResult.scoreLevel === 'Master') {
    recommendations.push({
      id: 'maintain-excellence',
      title: 'Maintain Your Excellence',
      description: 'You are in the top tier of stakers! Continue your strategy and consider sharing your knowledge with the community.',
      priority: 'low',
      category: 'strategy',
      actionable: false,
      impact: 'Community leadership',
    });
  }
  
  // Recomendaciones para principiantes
  if (scoreResult.scoreLevel === 'Beginner') {
    recommendations.push({
      id: 'getting-started',
      title: 'Getting Started Guide',
      description: 'New to staking? Start small, learn the basics, and gradually increase your positions as you gain confidence.',
      priority: 'high',
      category: 'strategy',
      actionable: true,
      impact: 'Foundation building',
    });
  }
  
  // Recomendaciones de riesgo
  if (metrics.activePositions === 1 && stakedInEther > 100) {
    recommendations.push({
      id: 'risk-management',
      title: 'Risk Management Alert',
      description: 'Having all your funds in a single position increases risk. Spread across multiple positions to protect your investment.',
      priority: 'high',
      category: 'risk',
      actionable: true,
      impact: 'Risk reduction',
    });
  }
  
  return recommendations;
}

/**
 * Genera insights adicionales basados en tendencias
 */
export function generateInsights(
  metrics: StakingMetrics,
  scoreResult: ScoreResult
): string[] {
  const insights: string[] = [];
  const stakedInEther = Number(metrics.totalStaked) / 1e18;
  
  insights.push(`You're performing better than ${scoreResult.percentile}% of all stakers.`);
  
  if (metrics.apy > 20) {
    insights.push(`Your APY of ${metrics.apy}% is exceptional! You're maximizing returns.`);
  }
  
  if (metrics.activePositions >= 5) {
    insights.push('Your diversified approach shows advanced portfolio management skills.');
  }
  
  if (stakedInEther > 1000) {
    insights.push('As a whale staker, your contributions significantly support the ecosystem.');
  }
  
  if (scoreResult.overallScore > 80) {
    insights.push('You qualify for potential airdrops and exclusive rewards programs!');
  }
  
  return insights;
}
