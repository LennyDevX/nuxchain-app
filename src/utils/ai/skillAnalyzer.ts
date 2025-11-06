/**
 * Skill Analyzer - Análisis avanzado de NFTs de Skills
 * Evalúa el impacto de los skills en el rendimiento de staking
 */

export interface SkillNFTData {
  tokenId: bigint;
  skillType: string;
  isActive: boolean;
  effectValue: number;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  level: number;
}

export interface SkillAnalysis {
  totalSkillBoost: number; // Boost total en puntos base
  activeSkills: number;
  maxSkillsAvailable: number;
  skillUtilization: number; // Porcentaje de uso óptimo
  rarityDistribution: Record<string, number>;
  recommendations: SkillRecommendation[];
  potentialBoost: number; // Boost potencial con optimización
}

export interface SkillRecommendation {
  type: 'activate' | 'upgrade' | 'acquire' | 'optimize';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: number;
}

/**
 * Calcula el boost efectivo de un skill según su tipo y rareza
 */
export function calculateSkillBoost(skill: SkillNFTData): number {
  const rarityMultiplier = {
    COMMON: 1.0,
    RARE: 1.3,
    EPIC: 1.6,
    LEGENDARY: 2.0,
  };

  const baseBoost = skill.effectValue;
  const rarityBoost = rarityMultiplier[skill.rarity] || 1.0;
  const levelBoost = 1 + (skill.level * 0.1); // +10% por nivel

  return baseBoost * rarityBoost * levelBoost;
}

/**
 * Analiza la distribución de rareza de los skills
 */
function analyzeRarityDistribution(skills: SkillNFTData[]): Record<string, number> {
  const distribution: Record<string, number> = {
    COMMON: 0,
    RARE: 0,
    EPIC: 0,
    LEGENDARY: 0,
  };

  skills.forEach(skill => {
    distribution[skill.rarity]++;
  });

  return distribution;
}

/**
 * Calcula el porcentaje de utilización óptima de skills
 */
function calculateSkillUtilization(
  activeSkills: number,
  maxSkills: number,
  userLevel: number
): number {
  // Nivel determina cuántos skills deberías tener activos
  const recommendedActive = Math.min(userLevel, maxSkills);
  return recommendedActive > 0 ? (activeSkills / recommendedActive) * 100 : 0;
}

/**
 * Genera recomendaciones basadas en el análisis de skills
 */
function generateSkillRecommendations(
  skills: SkillNFTData[],
  analysis: Partial<SkillAnalysis>,
  userLevel: number,
  totalStaked: bigint
): SkillRecommendation[] {
  const recommendations: SkillRecommendation[] = [];
  const inactiveSkills = skills.filter(s => !s.isActive);
  const activeSkills = skills.filter(s => s.isActive);

  // Recomendar activar skills inactivos
  if (inactiveSkills.length > 0 && analysis.activeSkills! < analysis.maxSkillsAvailable!) {
    const bestInactive = inactiveSkills.sort((a, b) => {
      const boostA = calculateSkillBoost(a);
      const boostB = calculateSkillBoost(b);
      return boostB - boostA;
    })[0];

    recommendations.push({
      type: 'activate',
      title: 'Activate High-Impact Skill',
      description: `You have inactive skills. Activate ${bestInactive.skillType} (${bestInactive.rarity}) for an estimated ${calculateSkillBoost(bestInactive).toFixed(1)}% boost.`,
      priority: 'high',
      estimatedImpact: calculateSkillBoost(bestInactive),
    });
  }

  // Recomendar upgrade de skills comunes
  const commonSkills = activeSkills.filter(s => s.rarity === 'COMMON');
  if (commonSkills.length > 0) {
    recommendations.push({
      type: 'upgrade',
      title: 'Upgrade Common Skills',
      description: `You have ${commonSkills.length} common skills active. Consider upgrading to rare or higher for 30-100% better performance.`,
      priority: 'medium',
      estimatedImpact: commonSkills.length * 30,
    });
  }

  // Recomendar adquirir más skills si el usuario tiene nivel alto
  if (userLevel >= 3 && skills.length < 5) {
    const stakedAmount = Number(totalStaked) / 1e18;
    if (stakedAmount >= 200) {
      recommendations.push({
        type: 'acquire',
        title: 'Acquire More Skills',
        description: `With ${stakedAmount.toFixed(0)} POL staked and level ${userLevel}, you can mint more skill NFTs to maximize your rewards.`,
        priority: 'medium',
        estimatedImpact: 50,
      });
    }
  }

  // Recomendar optimización de combinación de skills
  if (activeSkills.length >= 3) {
    const hasAutoCompound = activeSkills.some(s => s.skillType === 'AUTO_COMPOUND');
    const hasRewardBoost = activeSkills.some(s => s.skillType === 'REWARD_BOOST');
    
    if (!hasAutoCompound || !hasRewardBoost) {
      recommendations.push({
        type: 'optimize',
        title: 'Optimize Skill Combination',
        description: 'Consider combining AUTO_COMPOUND and REWARD_BOOST skills for maximum synergy and compound growth.',
        priority: 'low',
        estimatedImpact: 25,
      });
    }
  }

  // Recomendar basado en el stake amount
  const stakedAmount = Number(totalStaked) / 1e18;
  if (stakedAmount >= 1000 && skills.length === 0) {
    recommendations.push({
      type: 'acquire',
      title: 'High-Value Staker: Mint Skill NFTs',
      description: 'As a high-value staker, you should leverage skill NFTs to amplify your returns significantly.',
      priority: 'high',
      estimatedImpact: 100,
    });
  }

  return recommendations;
}

/**
 * Función principal de análisis de skills
 */
export function analyzeSkills(
  skills: SkillNFTData[],
  userLevel: number,
  maxSkills: number,
  totalStaked: bigint
): SkillAnalysis {
  const activeSkills = skills.filter(s => s.isActive);
  
  // Calcular boost total de skills activos
  const totalSkillBoost = activeSkills.reduce((sum, skill) => {
    return sum + calculateSkillBoost(skill);
  }, 0);

  // Calcular boost potencial con todos los skills activos optimizados
  const potentialBoost = skills.reduce((sum, skill) => {
    return sum + calculateSkillBoost(skill);
  }, 0);

  const skillUtilization = calculateSkillUtilization(
    activeSkills.length,
    maxSkills,
    userLevel
  );

  const rarityDistribution = analyzeRarityDistribution(skills);

  const analysis: SkillAnalysis = {
    totalSkillBoost,
    activeSkills: activeSkills.length,
    maxSkillsAvailable: maxSkills,
    skillUtilization,
    rarityDistribution,
    recommendations: [],
    potentialBoost,
  };

  analysis.recommendations = generateSkillRecommendations(
    skills,
    analysis,
    userLevel,
    totalStaked
  );

  return analysis;
}

/**
 * Calcula el impacto de los skills en el APY
 */
export function calculateSkillAPYImpact(
  baseAPY: number,
  totalSkillBoost: number
): number {
  // El boost se aplica como porcentaje adicional
  // Ejemplo: 50 puntos de boost = +5% APY
  const boostPercentage = totalSkillBoost / 1000; // Convertir a porcentaje
  return baseAPY * (1 + boostPercentage);
}

/**
 * Calcula el ROI mejorado con skills
 */
export function calculateEnhancedROI(
  baseROI: number,
  skills: SkillNFTData[]
): number {
  const activeSkills = skills.filter(s => s.isActive);
  let enhancedROI = baseROI;

  activeSkills.forEach(skill => {
    const boost = calculateSkillBoost(skill);
    // Aplicar boost según el tipo de skill
    if (skill.skillType === 'REWARD_BOOST') {
      enhancedROI += (baseROI * boost) / 10000;
    }
  });

  return enhancedROI;
}

/**
 * Evalúa la calidad general de la estrategia de skills
 */
export function evaluateSkillStrategy(analysis: SkillAnalysis): {
  score: number;
  rating: 'Poor' | 'Fair' | 'Good' | 'Excellent' | 'Outstanding';
  feedback: string;
} {
  let score = 0;

  // Puntos por utilización (0-30)
  score += (analysis.skillUtilization / 100) * 30;

  // Puntos por número de skills activos (0-25)
  score += Math.min((analysis.activeSkills / analysis.maxSkillsAvailable) * 25, 25);

  // Puntos por diversidad de rareza (0-20)
  const uniqueRarities = Object.values(analysis.rarityDistribution).filter(count => count > 0).length;
  score += (uniqueRarities / 4) * 20;

  // Puntos por boost total (0-25)
  score += Math.min((analysis.totalSkillBoost / 200) * 25, 25);

  let rating: 'Poor' | 'Fair' | 'Good' | 'Excellent' | 'Outstanding';
  let feedback: string;

  if (score >= 90) {
    rating = 'Outstanding';
    feedback = 'Your skill strategy is exceptional! You are maximizing all available boosts.';
  } else if (score >= 75) {
    rating = 'Excellent';
    feedback = 'Great skill management! Minor optimizations could push you to the top tier.';
  } else if (score >= 60) {
    rating = 'Good';
    feedback = 'Solid skill usage, but there is room for improvement in activation and diversity.';
  } else if (score >= 40) {
    rating = 'Fair';
    feedback = 'You are using skills, but not optimally. Focus on activating more high-impact skills.';
  } else {
    rating = 'Poor';
    feedback = 'Your skill strategy needs significant improvement. Start by activating your best skills.';
  }

  return { score: Math.round(score), rating, feedback };
}
