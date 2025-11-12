/**
 * Gamification Analyzer - Análisis del sistema de gamificación
 * Evalúa XP, logros, quests y progresión del usuario
 */

export interface GamificationData {
  userXP: bigint;
  userLevel: number;
  completedQuests: number;
  totalQuests: number;
  unlockedAchievements: number;
  totalAchievements: number;
  referrals: number;
  nftsMinted: number;
  nftsSold: number;
  nftsBought: number;
}

export interface GamificationAnalysis {
  levelProgress: {
    currentLevel: number;
    nextLevel: number;
    xpProgress: number; // Porcentaje hacia el siguiente nivel
    xpRequired: bigint;
    xpToNextLevel: bigint;
  };
  engagementScore: number; // 0-100
  completionRates: {
    quests: number;
    achievements: number;
    overall: number;
  };
  strengths: string[];
  growthAreas: string[];
  recommendations: GamificationRecommendation[];
  projectedRewards: {
    nextQuestReward: number;
    nextAchievementReward: number;
    levelUpBonus: number;
  };
}

export interface GamificationRecommendation {
  id: string;
  type: 'quest' | 'achievement' | 'social' | 'trading';
  title: string;
  description: string;
  xpReward: number;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Calcula el XP requerido para alcanzar un nivel específico
 * Fórmula UNIFICADA: XP para Nivel N = N² × 100
 * 
 * Ejemplo:
 * - Nivel 1: 1² × 100 = 100 XP (necesario para subir a Nivel 2)
 * - Nivel 2: 2² × 100 = 400 XP (necesario para subir a Nivel 3)
 * - Nivel 3: 3² × 100 = 900 XP (necesario para subir a Nivel 4)
 * 
 * XP TOTAL acumulado:
 * - Para estar en Nivel 1: 0 XP
 * - Para estar en Nivel 2: 100 XP
 * - Para estar en Nivel 3: 100 + 400 = 500 XP
 */
export function calculateXPForLevel(level: number): bigint {
  // ✅ FÓRMULA LINEAL (COINCIDE CON SMART CONTRACT):
  // Cada nivel requiere 100 XP adicional
  // Level 0: 0 XP
  // Level 1: 100 XP
  // Level 2: 200 XP
  // Level 3: 300 XP
  const xp = level * 100;
  return BigInt(xp);
}

/**
 * Calcula el nivel basado en XP total (LINEAL)
 * ✅ FÓRMULA: level = floor(totalXP / 100)
 * Con 40 XP: level 0 (mostrado como Level 1 en UI)
 * Con 100 XP: level 1 (mostrado como Level 2 en UI)
 */
export function calculateLevelFromXP(totalXP: bigint): number {
  // Fórmula lineal simple: divide XP por 100
  const level = Number(totalXP) / 100;
  return Math.floor(level);
}

/**
 * Calcula el progreso hacia el siguiente nivel
 */
function calculateLevelProgress(
  currentXP: bigint,
  currentLevel: number
): {
  xpProgress: number;
  xpRequired: bigint;
  xpToNextLevel: bigint;
} {
  const currentLevelXP = calculateXPForLevel(currentLevel);
  const nextLevelXP = calculateXPForLevel(currentLevel + 1);
  const xpInCurrentLevel = currentXP - currentLevelXP;
  const xpRequiredForLevel = nextLevelXP - currentLevelXP;
  
  const xpProgress = xpRequiredForLevel > 0n 
    ? Number((xpInCurrentLevel * 100n) / xpRequiredForLevel)
    : 0;

  return {
    xpProgress: Math.min(Math.max(xpProgress, 0), 100),
    xpRequired: xpRequiredForLevel,
    xpToNextLevel: nextLevelXP - currentXP,
  };
}

/**
 * Calcula el engagement score basado en la actividad del usuario
 */
function calculateEngagementScore(data: GamificationData): number {
  let score = 0;
  
  // XP y nivel (30 puntos)
  const levelScore = Math.min((data.userLevel / 10) * 30, 30);
  score += levelScore;
  
  // Quests completados (25 puntos)
  const questCompletionRate = data.totalQuests > 0 
    ? data.completedQuests / data.totalQuests 
    : 0;
  score += questCompletionRate * 25;
  
  // Achievements (20 puntos)
  const achievementRate = data.totalAchievements > 0
    ? data.unlockedAchievements / data.totalAchievements
    : 0;
  score += achievementRate * 20;
  
  // Trading activity (15 puntos)
  const tradingActivity = Math.min(
    (data.nftsMinted + data.nftsSold + data.nftsBought) / 20,
    1
  ) * 15;
  score += tradingActivity;
  
  // Social engagement (10 puntos)
  const socialScore = Math.min(data.referrals * 2, 10);
  score += socialScore;
  
  return Math.round(Math.min(score, 100));
}

/**
 * Calcula tasas de completación
 */
function calculateCompletionRates(data: GamificationData): {
  quests: number;
  achievements: number;
  overall: number;
} {
  const questRate = data.totalQuests > 0 
    ? (data.completedQuests / data.totalQuests) * 100 
    : 0;
  
  const achievementRate = data.totalAchievements > 0
    ? (data.unlockedAchievements / data.totalAchievements) * 100
    : 0;
  
  const overall = (questRate + achievementRate) / 2;
  
  return {
    quests: Math.round(questRate),
    achievements: Math.round(achievementRate),
    overall: Math.round(overall),
  };
}

/**
 * Identifica fortalezas del usuario en gamificación
 */
function identifyGamificationStrengths(
  data: GamificationData,
  completionRates: { quests: number; achievements: number; overall: number }
): string[] {
  const strengths: string[] = [];
  
  if (data.userLevel >= 5) {
    strengths.push(`High Level ${data.userLevel} - Experienced User`);
  }
  
  if (completionRates.quests >= 75) {
    strengths.push('Quest Master - Excellent quest completion rate');
  }
  
  if (completionRates.achievements >= 60) {
    strengths.push('Achievement Hunter - Strong achievement progress');
  }
  
  if (data.referrals >= 5) {
    strengths.push('Community Builder - Active referral participant');
  }
  
  if (data.nftsMinted >= 10) {
    strengths.push('Prolific Creator - High NFT minting activity');
  }
  
  if (data.nftsSold >= 5) {
    strengths.push('Successful Trader - Proven sales record');
  }
  
  return strengths.length > 0 
    ? strengths 
    : ['Getting Started - Building your reputation'];
}

/**
 * Identifica áreas de crecimiento
 */
function identifyGrowthAreas(
  data: GamificationData,
  completionRates: { quests: number; achievements: number; overall: number }
): string[] {
  const areas: string[] = [];
  
  if (data.userLevel < 3) {
    areas.push('Gain more XP through active participation');
  }
  
  if (completionRates.quests < 50) {
    areas.push('Complete more quests to unlock rewards');
  }
  
  if (completionRates.achievements < 40) {
    areas.push('Focus on unlocking achievements');
  }
  
  if (data.referrals === 0) {
    areas.push('Invite friends to earn referral bonuses');
  }
  
  if (data.nftsMinted === 0) {
    areas.push('Start minting NFTs to gain experience');
  }
  
  if (data.nftsBought + data.nftsSold < 3) {
    areas.push('Engage more in marketplace trading');
  }
  
  return areas;
}

/**
 * Genera recomendaciones de gamificación
 */
function generateGamificationRecommendations(
  data: GamificationData,
  analysis: Partial<GamificationAnalysis>
): GamificationRecommendation[] {
  const recommendations: GamificationRecommendation[] = [];
  
  // Recomendaciones de quests
  const questsRemaining = data.totalQuests - data.completedQuests;
  if (questsRemaining > 0) {
    recommendations.push({
      id: 'gamification-quests',
      type: 'quest',
      title: `Complete ${questsRemaining} Remaining Quest${questsRemaining > 1 ? 's' : ''}`,
      description: `You have ${questsRemaining} active quests. Complete them to earn XP and unlock special rewards.`,
      xpReward: questsRemaining * 50,
      priority: questsRemaining >= 3 ? 'high' : 'medium',
    });
  }
  
  // Recomendaciones de achievements
  const achievementsRemaining = data.totalAchievements - data.unlockedAchievements;
  if (achievementsRemaining > 0 && data.unlockedAchievements < data.totalAchievements * 0.5) {
    recommendations.push({
      id: 'gamification-achievements',
      type: 'achievement',
      title: 'Unlock More Achievements',
      description: `${achievementsRemaining} achievements waiting to be unlocked. Each one grants permanent bonuses and XP.`,
      xpReward: 100,
      priority: 'high',
    });
  }
  
  // Recomendaciones sociales
  if (data.referrals < 3) {
    recommendations.push({
      id: 'gamification-social',
      type: 'social',
      title: 'Grow Your Network',
      description: 'Invite friends to join. Earn 50 XP per referral plus a share of their trading fees.',
      xpReward: 50,
      priority: 'medium',
    });
  }
  
  // Recomendaciones de trading
  if (data.nftsMinted < 5) {
    recommendations.push({
      id: 'gamification-trading-mint',
      type: 'trading',
      title: 'Create Your First NFTs',
      description: 'Mint NFTs to gain 10 XP per creation and establish your presence in the marketplace.',
      xpReward: 10,
      priority: 'high',
    });
  }
  
  if (data.nftsBought === 0 && data.userLevel >= 2) {
    recommendations.push({
      id: 'gamification-trading-buy',
      type: 'trading',
      title: 'Start Collecting',
      description: 'Buy your first NFT to earn 15 XP and support other creators.',
      xpReward: 15,
      priority: 'medium',
    });
  }
  
  if (data.nftsSold === 0 && data.nftsMinted >= 3) {
    recommendations.push({
      id: 'gamification-trading-sell',
      type: 'trading',
      title: 'Make Your First Sale',
      description: 'List your NFTs at competitive prices. First sale earns 20 XP bonus!',
      xpReward: 20,
      priority: 'medium',
    });
  }
  
  // Recomendación de level up
  if (analysis.levelProgress && analysis.levelProgress.xpProgress >= 80) {
    recommendations.push({
      id: 'gamification-levelup',
      type: 'achievement',
      title: 'Level Up Soon!',
      description: `You're ${analysis.levelProgress.xpProgress}% of the way to level ${data.userLevel + 1}. Keep going!`,
      xpReward: Number(analysis.levelProgress.xpToNextLevel),
      priority: 'high',
    });
  }
  
  return recommendations;
}

/**
 * Proyecta recompensas futuras
 */
function projectRewards(
  data: GamificationData
): GamificationAnalysis['projectedRewards'] {
  // Estimaciones basadas en el contrato
  const avgQuestReward = 0.5; // POL
  const avgAchievementReward = 1.0; // POL
  const levelUpBonus = data.userLevel * 0.1; // Bonus incrementa con el nivel
  
  return {
    nextQuestReward: avgQuestReward,
    nextAchievementReward: avgAchievementReward,
    levelUpBonus,
  };
}

/**
 * Función principal de análisis de gamificación
 */
export function analyzeGamification(data: GamificationData): GamificationAnalysis {
  const currentLevel = calculateLevelFromXP(data.userXP);
  const levelProgressData = calculateLevelProgress(data.userXP, currentLevel);
  
  const levelProgress = {
    currentLevel,
    nextLevel: currentLevel + 1,
    ...levelProgressData,
  };
  
  const engagementScore = calculateEngagementScore(data);
  const completionRates = calculateCompletionRates(data);
  const strengths = identifyGamificationStrengths(data, completionRates);
  const growthAreas = identifyGrowthAreas(data, completionRates);
  
  const analysis: GamificationAnalysis = {
    levelProgress,
    engagementScore,
    completionRates,
    strengths,
    growthAreas,
    recommendations: [],
    projectedRewards: projectRewards(data),
  };
  
  analysis.recommendations = generateGamificationRecommendations(data, analysis);
  
  return analysis;
}

/**
 * Calcula el multiplicador de skills disponibles según el nivel
 */
export function calculateMaxSkillsByLevel(level: number): number {
  const BASE_MAX_SKILLS = 3;
  return Math.min(BASE_MAX_SKILLS + Math.floor(level / 2), 10);
}

/**
 * Evalúa si el usuario califica para rewards especiales
 */
export function evaluateSpecialRewardsEligibility(
  data: GamificationData
): {
  eligibleForAirdrop: boolean;
  eligibleForBonusRewards: boolean;
  eligibleForExclusiveNFTs: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  let eligibleForAirdrop = false;
  let eligibleForBonusRewards = false;
  let eligibleForExclusiveNFTs = false;
  
  // Criterios para airdrops
  if (data.userLevel >= 5 && data.completedQuests >= 10) {
    eligibleForAirdrop = true;
    reasons.push('High level and quest completion qualifies for airdrops');
  }
  
  // Criterios para bonus rewards
  if (data.unlockedAchievements >= data.totalAchievements * 0.6) {
    eligibleForBonusRewards = true;
    reasons.push('60%+ achievement completion unlocks bonus rewards');
  }
  
  // Criterios para NFTs exclusivos
  if (data.userLevel >= 8 && data.referrals >= 5) {
    eligibleForExclusiveNFTs = true;
    reasons.push('Elite status (Level 8+, 5+ referrals) grants exclusive NFT access');
  }
  
  return {
    eligibleForAirdrop,
    eligibleForBonusRewards,
    eligibleForExclusiveNFTs,
    reasons,
  };
}
