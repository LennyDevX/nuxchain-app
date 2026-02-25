/**
 * useAdvancedStakingAnalysis - Hook avanzado de análisis de staking
 * Integra análisis de skills, gamificación y portafolio
 */

import { useState, useMemo } from 'react';
import { useUserStaking } from '../staking/useUserStaking';
import { useUserProfile } from '../marketplace/useUserProfile';
import { useSkillNFTs } from '../staking/useSkillNFTs';
import { useQuestStatus } from '../marketplace/useQuestStatus';
import { useAchievementStatus } from '../marketplace/useAchievementStatus';
import { usePortfolioAnalysis } from '../ai/usePortfolioAnalysis';
import { useGamificationData } from '../marketplace/useGamificationData';
import {
  analyzeSkills,
  calculateSkillAPYImpact,
  evaluateSkillStrategy,
  type SkillNFTData,
  type SkillAnalysis,
} from '../../utils/ai/skillAnalyzer';
import {
  analyzeGamification,
  calculateMaxSkillsByLevel,
  evaluateSpecialRewardsEligibility,
  type GamificationData,
  type GamificationAnalysis,
} from '../../utils/ai/gamificationAnalyzer';
import {
  projectPortfolioGrowth,
  evaluatePortfolioEfficiency,
  type PortfolioAnalysis,
} from '../../utils/ai/portfolioAnalyzer';
import {
  calculateStakingScore,
  generateRecommendations,
  type ScoreResult,
  type Recommendation,
} from '../../utils/analytics/stakingScoreAlgorithm';

export interface AdvancedStakingAnalysis {
  // Score tradicional mejorado
  overallScore: ScoreResult;
  recommendations: Recommendation[];
  
  // Análisis de skills
  skillAnalysis: SkillAnalysis | null;
  skillStrategy: ReturnType<typeof evaluateSkillStrategy> | null;
  enhancedAPY: number;
  
  // Análisis de gamificación
  gamificationAnalysis: GamificationAnalysis | null;
  specialRewards: ReturnType<typeof evaluateSpecialRewardsEligibility> | null;
  
  // Análisis de portafolio  
  portfolioAnalysis: PortfolioAnalysis | null;
  portfolioEfficiency: ReturnType<typeof evaluatePortfolioEfficiency> | null;
  growthProjections: ReturnType<typeof projectPortfolioGrowth> | null;
  
  // Metadatos
  isLoading: boolean;
  error: string | null;
  lastUpdate: number;
  refreshAnalysis: () => void;
}

/**
 * Hook principal de análisis avanzado
 */
export function useAdvancedStakingAnalysis(): AdvancedStakingAnalysis {
  const stakingData = useUserStaking();
  const userProfile = useUserProfile();
  const skillsData = useSkillNFTs();
  const questStatus = useQuestStatus();
  const achievementStatus = useAchievementStatus();
  const portfolioData = usePortfolioAnalysis();
  const gamificationOnChain = useGamificationData();
  
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  // Preparar datos de gamificación con quest y achievement stats reales
  const gamificationData: GamificationData | null = useMemo(() => {
    if (!userProfile.userProfile) return null;
    
    return {
      userXP: userProfile.totalXP || 0n,
      userLevel: userProfile.level ?? 0,
      completedQuests: gamificationOnChain.totalQuestsCompleted || questStatus.completedQuests,
      totalQuests: (gamificationOnChain.totalQuestsCompleted + gamificationOnChain.totalQuestsInProgress) || questStatus.totalQuests,
      unlockedAchievements: achievementStatus.unlockedAchievements,
      totalAchievements: achievementStatus.totalAchievements,
      referrals: Number(userProfile.userProfile.referralCount || 0),
      nftsMinted: gamificationOnChain.nftsCreated || Number(userProfile.userProfile.nftsCreated || 0),
      nftsSold: gamificationOnChain.nftsSold || Number(userProfile.userProfile.nftsSold || 0),
      nftsBought: gamificationOnChain.nftsBought || Number(userProfile.userProfile.nftsBought || 0),
    };
  }, [userProfile, questStatus, achievementStatus, gamificationOnChain]);

  // Análisis de skills
  const skillAnalysis = useMemo(() => {
    if (!skillsData.userSkillProfile || !gamificationData) return null;
    
    try {
      const maxSkills = calculateMaxSkillsByLevel(gamificationData.userLevel);
      // Usar los skills del contrato
      const activeSkillsCount = skillsData.userSkillProfile.activeSkillsCount;
      const totalBoost = skillsData.totalBoost;
      
      // Crear datos simulados para el análisis basados en datos reales
      const mockSkills: SkillNFTData[] = Array.from({ length: activeSkillsCount }, (_, i) => ({
        tokenId: BigInt(i),
        skillType: 'REWARD_BOOST',
        isActive: true,
        effectValue: Math.floor(totalBoost / Math.max(activeSkillsCount, 1)),
        rarity: 'COMMON' as const,
        level: 1,
      }));
      
      return analyzeSkills(
        mockSkills,
        gamificationData.userLevel,
        maxSkills,
        stakingData.totalStakedBigInt
      );
    } catch (err) {
      console.error('Error analyzing skills:', err);
      return null;
    }
  }, [skillsData, gamificationData, stakingData.totalStakedBigInt]);

  // Estrategia de skills
  const skillStrategy = useMemo(() => {
    if (!skillAnalysis) return null;
    
    try {
      return evaluateSkillStrategy(skillAnalysis);
    } catch (err) {
      console.error('Error evaluating skill strategy:', err);
      return null;
    }
  }, [skillAnalysis]);

  // APY mejorado con skills
  const enhancedAPY = useMemo(() => {
    const baseAPY = parseFloat(stakingData.apy) || 0;
    
    if (!skillAnalysis || skillAnalysis.totalSkillBoost === 0) {
      return baseAPY;
    }
    
    try {
      return calculateSkillAPYImpact(baseAPY, skillAnalysis.totalSkillBoost);
    } catch (err) {
      console.error('Error calculating enhanced APY:', err);
      return baseAPY;
    }
  }, [stakingData.apy, skillAnalysis]);

  // Análisis de gamificación
  const gamificationAnalysis = useMemo(() => {
    if (!gamificationData) return null;
    
    try {
      return analyzeGamification(gamificationData);
    } catch (err) {
      console.error('Error analyzing gamification:', err);
      return null;
    }
  }, [gamificationData]);

  // Recompensas especiales
  const specialRewards = useMemo(() => {
    if (!gamificationData) return null;
    
    try {
      return evaluateSpecialRewardsEligibility(gamificationData);
    } catch (err) {
      console.error('Error evaluating special rewards:', err);
      return null;
    }
  }, [gamificationData]);

  // Análisis de portafolio con datos reales de deposits individuales
  const portfolioAnalysis: PortfolioAnalysis | null = useMemo(() => {
    return portfolioData.portfolioAnalysis;
  }, [portfolioData.portfolioAnalysis]);

  const portfolioEfficiency = useMemo(() => {
    if (!portfolioAnalysis) return null;
    
    try {
      return evaluatePortfolioEfficiency(portfolioAnalysis);
    } catch (err) {
      console.error('Error evaluating portfolio efficiency:', err);
      return null;
    }
  }, [portfolioAnalysis]);

  const growthProjections = useMemo(() => {
    if (!portfolioAnalysis) return null;
    
    try {
      const analysis = portfolioAnalysis as unknown as {
        totalValue: bigint;
        weightedAPY: number;
      };
      
      if (analysis.totalValue && analysis.weightedAPY) {
        return projectPortfolioGrowth(
          analysis.totalValue,
          analysis.weightedAPY,
          12
        );
      }
      return null;
    } catch (err) {
      console.error('Error projecting growth:', err);
      return null;
    }
  }, [portfolioAnalysis]);

  // Score mejorado (incluye impacto de skills y gamificación)
  const overallScore = useMemo(() => {
    const metrics = {
      totalStaked: stakingData.totalStakedBigInt,
      pendingRewards: stakingData.pendingRewardsBigInt,
      activePositions: stakingData.activePositions,
      apy: enhancedAPY, // Usar APY mejorado con skills
      stakingDuration: undefined,
      lastClaimTime: undefined,
    };

    const baseScore = calculateStakingScore(metrics);

    // Bonus por skills (hasta +10 puntos)
    if (skillAnalysis) {
      const skillBonus = Math.min(
        (skillAnalysis.totalSkillBoost / 100) * 5,
        10
      );
      baseScore.overallScore = Math.min(baseScore.overallScore + Math.round(skillBonus), 100);
    }

    // Bonus por gamificación (hasta +5 puntos)
    if (gamificationAnalysis) {
      const gamificationBonus = Math.min(
        (gamificationAnalysis.engagementScore / 100) * 5,
        5
      );
      baseScore.overallScore = Math.min(baseScore.overallScore + Math.round(gamificationBonus), 100);
    }

    return baseScore;
  }, [stakingData, enhancedAPY, skillAnalysis, gamificationAnalysis]);

  // Recomendaciones mejoradas
  const recommendations = useMemo(() => {
    const metrics = {
      totalStaked: stakingData.totalStakedBigInt,
      pendingRewards: stakingData.pendingRewardsBigInt,
      activePositions: stakingData.activePositions,
      apy: enhancedAPY,
      stakingDuration: undefined,
      lastClaimTime: undefined,
    };

    const baseRecommendations = generateRecommendations(metrics, overallScore);

    // Agregar recomendaciones de skills
    if (skillAnalysis && skillAnalysis.recommendations.length > 0) {
      skillAnalysis.recommendations.forEach(rec => {
        baseRecommendations.push({
          id: `skill-${rec.type}`,
          title: rec.title,
          description: rec.description,
          priority: rec.priority,
          category: 'optimization',
          actionable: true,
          impact: `+${rec.estimatedImpact.toFixed(1)}% boost`,
        });
      });
    }

    // Agregar recomendaciones de gamificación
    if (gamificationAnalysis && gamificationAnalysis.recommendations.length > 0) {
      gamificationAnalysis.recommendations.slice(0, 3).forEach(rec => {
        baseRecommendations.push({
          id: `gamification-${rec.type}`,
          title: rec.title,
          description: rec.description,
          priority: rec.priority,
          category: 'opportunity',
          actionable: true,
          impact: `${rec.xpReward} XP`,
        });
      });
    }

    // Agregar recomendaciones de portafolio
    if (portfolioAnalysis && 'recommendations' in portfolioAnalysis) {
      const recs = (portfolioAnalysis as { recommendations: Array<{
        type: string;
        title: string;
        description: string;
        priority: 'high' | 'medium' | 'low';
        impact: string;
      }> }).recommendations;
      
      if (recs && recs.length > 0) {
        recs.slice(0, 3).forEach((rec, idx) => {
          baseRecommendations.push({
            id: `portfolio-${rec.type}-${idx}`,
            title: rec.title,
            description: rec.description,
            priority: rec.priority,
            category: rec.type as 'optimization' | 'strategy' | 'risk' | 'opportunity',
            actionable: true,
            impact: rec.impact,
          });
        });
      }
    }

    return baseRecommendations;
  }, [stakingData, enhancedAPY, overallScore, skillAnalysis, gamificationAnalysis, portfolioAnalysis]);

  // Función de refresh (solo manual)
  const refreshAnalysis = () => {
    setLastUpdate(Date.now());
  };

  const isLoading = stakingData.isLoading || skillsData.isLoading || userProfile.isLoading || 
                    questStatus.isLoading || achievementStatus.isLoading || portfolioData.isLoading;

  return {
    overallScore,
    recommendations,
    skillAnalysis,
    skillStrategy,
    enhancedAPY,
    gamificationAnalysis,
    specialRewards,
    portfolioAnalysis,
    portfolioEfficiency,
    growthProjections,
    isLoading,
    error: stakingData.error || userProfile.error?.message || null,
    lastUpdate,
    refreshAnalysis,
  };
}
