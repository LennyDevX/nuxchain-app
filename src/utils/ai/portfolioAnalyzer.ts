/**
 * Portfolio Analyzer - Análisis avanzado del portafolio de staking
 * Evalúa diversificación, riesgo, y optimización de posiciones
 */

export interface StakingPosition {
  depositId: bigint;
  amount: bigint;
  lockupDuration: number; // en días
  depositTime: bigint;
  unlockTime: bigint;
  isLocked: boolean;
  estimatedRewards: bigint;
  currentROI: number; // porcentaje
}

export interface PortfolioAnalysis {
  totalValue: bigint;
  diversificationScore: number; // 0-100
  riskLevel: 'Low' | 'Medium' | 'High';
  positionDistribution: {
    flexible: number;
    short: number; // 30 días
    medium: number; // 90 días
    long: number; // 180+ días
  };
  weightedAPY: number;
  liquidityRatio: number; // Porcentaje de fondos desbloqueados
  recommendations: PortfolioRecommendation[];
  rebalancingSuggestions: RebalancingSuggestion[];
  riskMetrics: RiskMetrics;
}

export interface PortfolioRecommendation {
  type: 'diversification' | 'liquidity' | 'yield' | 'risk';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
}

export interface RebalancingSuggestion {
  action: 'add' | 'reduce' | 'maintain';
  lockupPeriod: number;
  currentPercentage: number;
  targetPercentage: number;
  reason: string;
}

export interface RiskMetrics {
  concentrationRisk: number; // 0-100, más alto = más riesgo
  lockupRisk: number; // 0-100, más alto = más riesgo
  overallRisk: number; // 0-100
  volatilityExposure: 'Low' | 'Medium' | 'High';
}

/**
 * Balance-aware recommendation for new staking positions
 */
export interface BalanceRecommendation {
  action: 'stake' | 'wait' | 'add-funds';
  suggestedAmount: number;
  suggestedLockup: number;
  expectedAPY: number;
  projectedMonthlyReward: number;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Extended portfolio analysis with wallet balance context
 */
export interface EnhancedPortfolioAnalysis extends PortfolioAnalysis {
  walletBalance: {
    available: number;
    canStake: boolean;
    suggestedStakeAmount: number;
  };
  balanceRecommendations: BalanceRecommendation[];
  opportunityScore: number; // 0-100 based on available funds vs portfolio gaps
}

/**
 * Clasifica posiciones por período de lock
 */
function classifyPositions(positions: StakingPosition[]): PortfolioAnalysis['positionDistribution'] {
  const distribution = {
    flexible: 0,
    short: 0,
    medium: 0,
    long: 0,
  };

  positions.forEach(pos => {
    console.log(`[portfolioAnalyzer] Classifying position:`, {
      depositId: pos.depositId.toString(),
      lockupDuration: pos.lockupDuration,
      isLocked: pos.isLocked
    });
    
    if (pos.lockupDuration === 0) {
      distribution.flexible++;
      console.log(`  → Classified as FLEXIBLE (lockupDuration = 0)`);
    } else if (pos.lockupDuration <= 30) {
      distribution.short++;
      console.log(`  → Classified as SHORT (lockupDuration <= 30 days)`);
    } else if (pos.lockupDuration <= 90) {
      distribution.medium++;
      console.log(`  → Classified as MEDIUM (lockupDuration <= 90 days)`);
    } else {
      distribution.long++;
      console.log(`  → Classified as LONG (lockupDuration > 90 days)`);
    }
  });

  console.log(`[portfolioAnalyzer] Distribution:`, distribution);
  return distribution;
}

/**
 * Calcula el score de diversificación
 */
function calculateDiversificationScore(
  positions: StakingPosition[],
  distribution: PortfolioAnalysis['positionDistribution']
): number {
  if (positions.length === 0) return 0;

  let score = 0;

  // Puntos por número de posiciones (0-40)
  const positionScore = Math.min((positions.length / 5) * 40, 40);
  score += positionScore;

  // Puntos por distribución equilibrada (0-60)
  const totalPositions = positions.length;
  const distributionArray = [
    distribution.flexible,
    distribution.short,
    distribution.medium,
    distribution.long,
  ];

  // Calcular índice de Herfindahl (mide concentración)
  const herfindahlIndex = distributionArray.reduce((sum, count) => {
    const share = count / totalPositions;
    return sum + share * share;
  }, 0);

  // Convertir HHI a score (1 = muy concentrado, 0.25 = perfectamente diversificado)
  const diversificationFromHHI = (1 - (herfindahlIndex - 0.25) / 0.75) * 60;
  score += Math.max(diversificationFromHHI, 0);

  return Math.round(Math.min(score, 100));
}

/**
 * Calcula el riesgo de concentración
 */
function calculateConcentrationRisk(positions: StakingPosition[]): number {
  if (positions.length === 0) return 0;

  const totalValue = positions.reduce((sum, pos) => sum + pos.amount, 0n);
  
  // Encontrar la posición más grande
  const largestPosition = positions.reduce((max, pos) => 
    pos.amount > max ? pos.amount : max, 
    0n
  );

  if (totalValue === 0n) return 0;

  // Porcentaje de la posición más grande
  const largestPercentage = Number((largestPosition * 100n) / totalValue);

  // Escala: 100 = todo en una posición, 0 = perfectamente distribuido
  return Math.round(largestPercentage);
}

/**
 * Calcula el riesgo de lockup
 */
function calculateLockupRisk(positions: StakingPosition[]): number {
  if (positions.length === 0) return 0;

  const totalValue = positions.reduce((sum, pos) => sum + pos.amount, 0n);
  const lockedValue = positions
    .filter(pos => pos.isLocked)
    .reduce((sum, pos) => sum + pos.amount, 0n);

  if (totalValue === 0n) return 0;

  // Porcentaje de fondos bloqueados
  const lockedPercentage = Number((lockedValue * 100n) / totalValue);

  return Math.round(lockedPercentage);
}

/**
 * Calcula métricas de riesgo
 */
function calculateRiskMetrics(positions: StakingPosition[]): RiskMetrics {
  const concentrationRisk = calculateConcentrationRisk(positions);
  const lockupRisk = calculateLockupRisk(positions);
  
  // Overall risk es un promedio ponderado
  const overallRisk = Math.round((concentrationRisk * 0.6) + (lockupRisk * 0.4));

  let volatilityExposure: 'Low' | 'Medium' | 'High';
  if (lockupRisk < 30) {
    volatilityExposure = 'Low';
  } else if (lockupRisk < 70) {
    volatilityExposure = 'Medium';
  } else {
    volatilityExposure = 'High';
  }

  return {
    concentrationRisk,
    lockupRisk,
    overallRisk,
    volatilityExposure,
  };
}

/**
 * Determina el nivel de riesgo general
 */
function determineRiskLevel(riskMetrics: RiskMetrics): 'Low' | 'Medium' | 'High' {
  if (riskMetrics.overallRisk < 35) return 'Low';
  if (riskMetrics.overallRisk < 65) return 'Medium';
  return 'High';
}

/**
 * Calcula el APY ponderado del portafolio
 */
function calculateWeightedAPY(positions: StakingPosition[]): number {
  if (positions.length === 0) return 0;

  const totalValue = positions.reduce((sum, pos) => sum + pos.amount, 0n);
  
  if (totalValue === 0n) return 0;

  const weightedSum = positions.reduce((sum, pos) => {
    const weight = Number(pos.amount) / Number(totalValue);
    return sum + (pos.currentROI * weight);
  }, 0);

  return Math.round(weightedSum * 100) / 100;
}

/**
 * Calcula el ratio de liquidez
 */
function calculateLiquidityRatio(positions: StakingPosition[]): number {
  if (positions.length === 0) return 0;

  const totalValue = positions.reduce((sum, pos) => sum + pos.amount, 0n);
  const liquidValue = positions
    .filter(pos => !pos.isLocked)
    .reduce((sum, pos) => sum + pos.amount, 0n);

  if (totalValue === 0n) return 0;

  return Math.round(Number((liquidValue * 10000n) / totalValue)) / 100;
}

/**
 * Genera recomendaciones de portafolio
 */
function generatePortfolioRecommendations(
  positions: StakingPosition[],
  analysis: Partial<PortfolioAnalysis>
): PortfolioRecommendation[] {
  const recommendations: PortfolioRecommendation[] = [];

  // Recomendaciones de diversificación
  if (analysis.diversificationScore! < 50) {
    recommendations.push({
      type: 'diversification',
      title: 'Improve Portfolio Diversification',
      description: `Your diversification score is ${analysis.diversificationScore}. Create positions across different lock periods to reduce risk.`,
      priority: 'high',
      impact: 'Reduces risk by 20-30%',
    });
  }

  // Recomendaciones de liquidez
  if (analysis.liquidityRatio! < 20) {
    recommendations.push({
      type: 'liquidity',
      title: 'Increase Liquidity Buffer',
      description: `Only ${analysis.liquidityRatio?.toFixed(1)}% of your portfolio is liquid. Consider keeping 20-30% in flexible staking.`,
      priority: 'high',
      impact: 'Improves access to funds',
    });
  } else if (analysis.liquidityRatio! > 70) {
    recommendations.push({
      type: 'yield',
      title: 'Optimize Yield with Lock Periods',
      description: `${analysis.liquidityRatio?.toFixed(1)}% of your portfolio is flexible. Lock some positions for higher APY.`,
      priority: 'medium',
      impact: 'Increases APY by 50-300%',
    });
  }

  // Recomendaciones de riesgo
  if (analysis.riskMetrics!.concentrationRisk > 60) {
    recommendations.push({
      type: 'risk',
      title: 'Reduce Concentration Risk',
      description: 'One position holds more than 60% of your portfolio. Split large positions to reduce risk.',
      priority: 'high',
      impact: 'Critical risk reduction',
    });
  }

  // Recomendaciones de yield
  if (analysis.weightedAPY! < 50) {
    recommendations.push({
      type: 'yield',
      title: 'Increase Overall Yield',
      description: `Your weighted APY is ${analysis.weightedAPY?.toFixed(2)}%. Consider longer lock periods for better returns.`,
      priority: 'medium',
      impact: '+20-100% APY improvement',
    });
  }

  // Recomendaciones para portafolios pequeños
  const totalValue = positions.reduce((sum, pos) => sum + pos.amount, 0n);
  if (totalValue < 100n * 10n**18n && positions.length === 1) {
    recommendations.push({
      type: 'diversification',
      title: 'Start Building Your Portfolio',
      description: 'Consider splitting your stake into 2-3 positions to begin diversifying.',
      priority: 'low',
      impact: 'Foundation for growth',
    });
  }

  return recommendations;
}

/**
 * Genera sugerencias de rebalanceo
 */
function generateRebalancingSuggestions(
  positions: StakingPosition[],
  distribution: PortfolioAnalysis['positionDistribution']
): RebalancingSuggestion[] {
  const suggestions: RebalancingSuggestion[] = [];
  const total = positions.length;

  if (total === 0) return suggestions;

  // Calcular porcentajes actuales
  const flexiblePct = (distribution.flexible / total) * 100;
  const shortPct = (distribution.short / total) * 100;
  const mediumPct = (distribution.medium / total) * 100;
  const longPct = (distribution.long / total) * 100;

  // Portafolio objetivo: 20% flexible, 30% short, 30% medium, 20% long
  const targetDistribution = {
    flexible: 20,
    short: 30,
    medium: 30,
    long: 20,
  };

  // Flexible
  if (Math.abs(flexiblePct - targetDistribution.flexible) > 10) {
    suggestions.push({
      action: flexiblePct < targetDistribution.flexible ? 'add' : 'reduce',
      lockupPeriod: 0,
      currentPercentage: Math.round(flexiblePct),
      targetPercentage: targetDistribution.flexible,
      reason: flexiblePct < targetDistribution.flexible
        ? 'Increase liquidity for better flexibility'
        : 'Too much capital idle, consider locking for better yields',
    });
  }

  // Short-term
  if (Math.abs(shortPct - targetDistribution.short) > 10) {
    suggestions.push({
      action: shortPct < targetDistribution.short ? 'add' : 'reduce',
      lockupPeriod: 30,
      currentPercentage: Math.round(shortPct),
      targetPercentage: targetDistribution.short,
      reason: shortPct < targetDistribution.short
        ? 'Add 30-day positions for balanced risk-reward'
        : 'Consider diversifying into other lock periods',
    });
  }

  // Medium-term
  if (Math.abs(mediumPct - targetDistribution.medium) > 10) {
    suggestions.push({
      action: mediumPct < targetDistribution.medium ? 'add' : 'reduce',
      lockupPeriod: 90,
      currentPercentage: Math.round(mediumPct),
      targetPercentage: targetDistribution.medium,
      reason: mediumPct < targetDistribution.medium
        ? 'Increase 90-day positions for optimal APY'
        : 'Well-positioned, maintain current strategy',
    });
  }

  // Long-term
  if (Math.abs(longPct - targetDistribution.long) > 10) {
    suggestions.push({
      action: longPct < targetDistribution.long ? 'add' : 'reduce',
      lockupPeriod: 180,
      currentPercentage: Math.round(longPct),
      targetPercentage: targetDistribution.long,
      reason: longPct < targetDistribution.long
        ? 'Add long-term positions for maximum yield'
        : 'Consider reducing lock duration for more flexibility',
    });
  }

  return suggestions;
}

/**
 * Función principal de análisis de portafolio
 */
export function analyzePortfolio(positions: StakingPosition[]): PortfolioAnalysis {
  const totalValue = positions.reduce((sum, pos) => sum + pos.amount, 0n);
  const distribution = classifyPositions(positions);
  const diversificationScore = calculateDiversificationScore(positions, distribution);
  const riskMetrics = calculateRiskMetrics(positions);
  const riskLevel = determineRiskLevel(riskMetrics);
  const weightedAPY = calculateWeightedAPY(positions);
  const liquidityRatio = calculateLiquidityRatio(positions);

  const analysis: PortfolioAnalysis = {
    totalValue,
    diversificationScore,
    riskLevel,
    positionDistribution: distribution,
    weightedAPY,
    liquidityRatio,
    recommendations: [],
    rebalancingSuggestions: [],
    riskMetrics,
  };

  analysis.recommendations = generatePortfolioRecommendations(positions, analysis);
  analysis.rebalancingSuggestions = generateRebalancingSuggestions(
    positions,
    distribution
  );

  return analysis;
}

/**
 * Calcula el rendimiento proyectado a diferentes plazos
 */
export function projectPortfolioGrowth(
  currentValue: bigint,
  weightedAPY: number,
  months: number
): {
  projected1Month: bigint;
  projected3Months: bigint;
  projected6Months: bigint;
  projected1Year: bigint;
  customMonths: bigint;
} {
  const monthlyRate = weightedAPY / 100 / 12;
  
  const calculate = (m: number) => {
    const multiplier = Math.pow(1 + monthlyRate, m);
    return BigInt(Math.floor(Number(currentValue) * multiplier));
  };

  return {
    projected1Month: calculate(1),
    projected3Months: calculate(3),
    projected6Months: calculate(6),
    projected1Year: calculate(12),
    customMonths: calculate(months),
  };
}

/**
 * Evalúa la eficiencia del portafolio
 */
export function evaluatePortfolioEfficiency(
  analysis: PortfolioAnalysis
): {
  score: number;
  rating: 'Poor' | 'Fair' | 'Good' | 'Excellent' | 'Outstanding';
  feedback: string;
} {
  let score = 0;

  // Diversificación (30 puntos)
  score += (analysis.diversificationScore / 100) * 30;

  // APY ponderado (25 puntos)
  const apyScore = Math.min((analysis.weightedAPY / 150) * 25, 25);
  score += apyScore;

  // Balance de liquidez (20 puntos)
  const liquidityScore = analysis.liquidityRatio >= 20 && analysis.liquidityRatio <= 40
    ? 20
    : Math.max(0, 20 - Math.abs(30 - analysis.liquidityRatio) * 0.5);
  score += liquidityScore;

  // Gestión de riesgo (25 puntos)
  const riskScore = analysis.riskLevel === 'Low' ? 25 : analysis.riskLevel === 'Medium' ? 15 : 5;
  score += riskScore;

  let rating: 'Poor' | 'Fair' | 'Good' | 'Excellent' | 'Outstanding';
  let feedback: string;

  if (score >= 90) {
    rating = 'Outstanding';
    feedback = 'Your portfolio is exceptionally well-managed with optimal diversification and risk balance.';
  } else if (score >= 75) {
    rating = 'Excellent';
    feedback = 'Great portfolio management! Minor tweaks could optimize further.';
  } else if (score >= 60) {
    rating = 'Good';
    feedback = 'Solid portfolio structure with room for improvement in diversification or yield.';
  } else if (score >= 40) {
    rating = 'Fair';
    feedback = 'Your portfolio needs rebalancing for better risk-reward ratio.';
  } else {
    rating = 'Poor';
    feedback = 'Significant portfolio optimization needed. Focus on diversification and risk management.';
  }

  return { score: Math.round(score), rating, feedback };
}

// APY rates by lockup duration
const APY_BY_LOCKUP: Record<number, number> = {
  0: 43.80,      // Flexible
  30: 87.60,     // 30 days
  90: 122.64,    // 90 days
  180: 149.28,   // 180 days
  365: 219.00,   // 365 days
};

const MIN_STAKE = 5;
const MAX_STAKE = 10000;

/**
 * Generate balance-aware recommendations for new staking positions
 */
export function generateBalanceRecommendations(
  availableBalance: number,
  portfolioAnalysis: PortfolioAnalysis | null
): BalanceRecommendation[] {
  const recommendations: BalanceRecommendation[] = [];

  // Not enough to stake
  if (availableBalance < MIN_STAKE) {
    recommendations.push({
      action: 'add-funds',
      suggestedAmount: MIN_STAKE - availableBalance,
      suggestedLockup: 0,
      expectedAPY: 0,
      projectedMonthlyReward: 0,
      reasoning: `Need ${(MIN_STAKE - availableBalance).toFixed(2)} more POL to meet minimum stake of ${MIN_STAKE} POL.`,
      priority: 'high',
    });
    return recommendations;
  }

  // No existing portfolio - recommend starting positions
  if (!portfolioAnalysis || portfolioAnalysis.totalValue === 0n) {
    // First stake recommendation
    const stakeAmount = Math.min(availableBalance * 0.5, MAX_STAKE);
    const expectedAPY = APY_BY_LOCKUP[0];
    
    recommendations.push({
      action: 'stake',
      suggestedAmount: stakeAmount,
      suggestedLockup: 0,
      expectedAPY,
      projectedMonthlyReward: (stakeAmount * expectedAPY / 100) / 12,
      reasoning: 'Start with a flexible stake to familiarize yourself with the platform. You can withdraw anytime.',
      priority: 'high',
    });

    // If enough balance, suggest a locked position too
    const remaining = availableBalance - stakeAmount;
    if (remaining >= MIN_STAKE) {
      const lockedAmount = Math.min(remaining * 0.7, MAX_STAKE);
      const lockAPY = APY_BY_LOCKUP[90];
      
      recommendations.push({
        action: 'stake',
        suggestedAmount: lockedAmount,
        suggestedLockup: 90,
        expectedAPY: lockAPY,
        projectedMonthlyReward: (lockedAmount * lockAPY / 100) / 12,
        reasoning: '90-day lock offers excellent APY with moderate commitment. Good for beginners.',
        priority: 'medium',
      });
    }

    return recommendations;
  }

  // Has existing portfolio - analyze gaps and optimize
  const { positionDistribution, diversificationScore, liquidityRatio, weightedAPY } = portfolioAnalysis;

  // 1. Fix low diversification
  if (diversificationScore < 50 && availableBalance >= MIN_STAKE) {
    // Find missing lockup tiers
    const tiersByPriority: { tier: number; name: string; apy: number }[] = [];
    
    if (positionDistribution.flexible === 0) {
      tiersByPriority.push({ tier: 0, name: 'Flexible', apy: APY_BY_LOCKUP[0] });
    }
    if (positionDistribution.short === 0) {
      tiersByPriority.push({ tier: 30, name: '30-day', apy: APY_BY_LOCKUP[30] });
    }
    if (positionDistribution.medium === 0) {
      tiersByPriority.push({ tier: 90, name: '90-day', apy: APY_BY_LOCKUP[90] });
    }
    if (positionDistribution.long === 0) {
      tiersByPriority.push({ tier: 180, name: '180-day', apy: APY_BY_LOCKUP[180] });
    }

    // Sort by APY descending
    tiersByPriority.sort((a, b) => b.apy - a.apy);

    for (const tier of tiersByPriority.slice(0, 2)) {
      const amount = Math.min(availableBalance / tiersByPriority.length, MAX_STAKE);
      if (amount >= MIN_STAKE) {
        recommendations.push({
          action: 'stake',
          suggestedAmount: amount,
          suggestedLockup: tier.tier,
          expectedAPY: tier.apy,
          projectedMonthlyReward: (amount * tier.apy / 100) / 12,
          reasoning: `Add a ${tier.name} position to improve diversification. Currently missing this tier.`,
          priority: 'high',
        });
      }
    }
  }

  // 2. Fix low liquidity
  if (liquidityRatio < 20 && positionDistribution.flexible === 0 && availableBalance >= MIN_STAKE) {
    const amount = Math.min(availableBalance * 0.3, MAX_STAKE);
    
    recommendations.push({
      action: 'stake',
      suggestedAmount: amount,
      suggestedLockup: 0,
      expectedAPY: APY_BY_LOCKUP[0],
      projectedMonthlyReward: (amount * APY_BY_LOCKUP[0] / 100) / 12,
      reasoning: `Your liquidity is only ${liquidityRatio.toFixed(0)}%. Add flexible stake for emergency access to funds.`,
      priority: 'high',
    });
  }

  // 3. Optimize yield if lots of flexible
  if (liquidityRatio > 60 && availableBalance >= MIN_STAKE) {
    const amount = Math.min(availableBalance * 0.6, MAX_STAKE);
    const targetLockup = weightedAPY < 100 ? 90 : 180;
    
    recommendations.push({
      action: 'stake',
      suggestedAmount: amount,
      suggestedLockup: targetLockup,
      expectedAPY: APY_BY_LOCKUP[targetLockup],
      projectedMonthlyReward: (amount * APY_BY_LOCKUP[targetLockup] / 100) / 12,
      reasoning: `High liquidity (${liquidityRatio.toFixed(0)}%). Lock funds for ${targetLockup} days to boost APY from ${weightedAPY.toFixed(1)}% to ~${APY_BY_LOCKUP[targetLockup]}%.`,
      priority: 'medium',
    });
  }

  // 4. General growth recommendation if portfolio is healthy
  if (recommendations.length === 0 && availableBalance >= MIN_STAKE * 2) {
    // Find weakest tier and strengthen it
    const tiers = [
      { key: 'flexible', count: positionDistribution.flexible, lockup: 0 },
      { key: 'short', count: positionDistribution.short, lockup: 30 },
      { key: 'medium', count: positionDistribution.medium, lockup: 90 },
      { key: 'long', count: positionDistribution.long, lockup: 180 },
    ];
    
    // Sort by count ascending to find weakest
    tiers.sort((a, b) => a.count - b.count);
    const weakestTier = tiers[0];
    
    const amount = Math.min(availableBalance * 0.4, MAX_STAKE);
    
    recommendations.push({
      action: 'stake',
      suggestedAmount: amount,
      suggestedLockup: weakestTier.lockup,
      expectedAPY: APY_BY_LOCKUP[weakestTier.lockup],
      projectedMonthlyReward: (amount * APY_BY_LOCKUP[weakestTier.lockup] / 100) / 12,
      reasoning: `Strengthen your ${weakestTier.key} tier for better balance. Your portfolio is healthy but could grow.`,
      priority: 'low',
    });
  }

  // 5. Max APY opportunity
  if (availableBalance >= MIN_STAKE * 3 && !recommendations.some(r => r.suggestedLockup === 365)) {
    const amount = Math.min(availableBalance * 0.25, MAX_STAKE);
    
    recommendations.push({
      action: 'stake',
      suggestedAmount: amount,
      suggestedLockup: 365,
      expectedAPY: APY_BY_LOCKUP[365],
      projectedMonthlyReward: (amount * APY_BY_LOCKUP[365] / 100) / 12,
      reasoning: `Lock ${amount.toFixed(0)} POL for 1 year at ${APY_BY_LOCKUP[365]}% APY for maximum passive income.`,
      priority: 'low',
    });
  }

  return recommendations;
}

/**
 * Calculate opportunity score based on available balance and portfolio gaps
 */
export function calculateOpportunityScore(
  availableBalance: number,
  portfolioAnalysis: PortfolioAnalysis | null
): number {
  if (availableBalance < MIN_STAKE) return 0;

  let score = 0;
  const maxOpportunity = 100;

  // Base score from having funds available (up to 30 points)
  const fundScore = Math.min((availableBalance / 100) * 30, 30);
  score += fundScore;

  if (!portfolioAnalysis) {
    // No portfolio = maximum opportunity to start
    return Math.min(score + 70, maxOpportunity);
  }

  // Diversification opportunity (up to 30 points)
  const diversificationGap = 100 - portfolioAnalysis.diversificationScore;
  score += (diversificationGap / 100) * 30;

  // Liquidity optimization opportunity (up to 20 points)
  if (portfolioAnalysis.liquidityRatio < 20 || portfolioAnalysis.liquidityRatio > 60) {
    score += 20;
  } else if (portfolioAnalysis.liquidityRatio < 30 || portfolioAnalysis.liquidityRatio > 50) {
    score += 10;
  }

  // APY improvement opportunity (up to 20 points)
  const apyGap = Math.max(0, 150 - portfolioAnalysis.weightedAPY);
  score += (apyGap / 150) * 20;

  return Math.min(Math.round(score), maxOpportunity);
}

/**
 * Enhanced portfolio analysis with wallet balance context
 */
export function analyzePortfolioWithBalance(
  positions: StakingPosition[],
  availableBalance: number
): EnhancedPortfolioAnalysis {
  // Get base analysis
  const baseAnalysis = analyzePortfolio(positions);
  
  // Generate balance-aware recommendations
  const balanceRecommendations = generateBalanceRecommendations(availableBalance, baseAnalysis);
  
  // Calculate opportunity score
  const opportunityScore = calculateOpportunityScore(availableBalance, baseAnalysis);
  
  // Determine suggested stake amount
  const canStake = availableBalance >= MIN_STAKE;
  const suggestedStakeAmount = canStake 
    ? Math.min(availableBalance * 0.5, MAX_STAKE)
    : 0;

  return {
    ...baseAnalysis,
    walletBalance: {
      available: availableBalance,
      canStake,
      suggestedStakeAmount,
    },
    balanceRecommendations,
    opportunityScore,
  };
}
