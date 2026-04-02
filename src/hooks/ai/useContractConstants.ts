/**
 * useContractConstants - Hook para obtener constantes del contrato en tiempo real
 * Lee APY rates, configuración de skills y límites directamente del contrato
 */

import { useReadContract, useReadContracts } from 'wagmi';
import { useMemo } from 'react';
import {
  EnhancedSmartStakingViewABI,
  IndividualSkillsMarketplaceImplABI as IndividualSkillsMarketplaceABI,
} from '../../lib/export/abis/legacy';

const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS as `0x${string}`;
const SKILLS_MARKETPLACE_ADDRESS = import.meta.env.VITE_INDIVIDUAL_SKILLS_MARKETPLACE_ADDRESS as `0x${string}`;

/**
 * APY Rates por período de lockup (en basis points, 100 = 1%)
 */
export interface APYRates {
  flexible: number;      // 0 días
  locked30: number;      // 30 días
  locked90: number;      // 90 días
  locked180: number;     // 180 días
  locked365: number;     // 365 días
}

/**
 * Configuración de Skills disponibles
 */
export interface SkillConfiguration {
  skillType: number;
  enabled: boolean;
  effectValue: number;
  description: string;
}

/**
 * Multiplicadores de rareza para skills
 */
export interface RarityMultipliers {
  common: number;
  rare: number;
  epic: number;
  legendary: number;
  mythic: number;
}

/**
 * Precios base por rareza
 */
export interface BasePrices {
  common: bigint;
  rare: bigint;
  epic: bigint;
  legendary: bigint;
  mythic: bigint;
}

/**
 * Constantes completas del sistema
 */
export interface ContractConstants {
  // Staking
  apyRates: APYRates;
  minDeposit: bigint;
  maxDeposit: bigint;
  maxDepositsPerUser: number;
  commissionPercentage: number;
  
  // Skills
  skillsConfig: SkillConfiguration[];
  rarityMultipliers: RarityMultipliers;
  basePrices: BasePrices;
  maxActiveSkills: number;
  
  // Estado
  isLoading: boolean;
  error: Error | null;
  lastFetch: number;
  refetch: () => void;
}

// Valores por defecto (fallback si el contrato no responde)
const DEFAULT_APY_RATES: APYRates = {
  flexible: 960,     // 9.6% APY  (v6.2)
  locked30: 1720,    // 17.2% APY (v6.2)
  locked90: 2270,    // 22.7% APY (v6.2)
  locked180: 3030,   // 30.3% APY (v6.2)
  locked365: 3190,   // 31.9% APY (v6.2)
};

const DEFAULT_RARITY_MULTIPLIERS: RarityMultipliers = {
  common: 100,
  rare: 150,
  epic: 200,
  legendary: 300,
  mythic: 500,
};

/**
 * Hook principal para obtener constantes del contrato
 */
export function useContractConstants(): ContractConstants {
  // Configuración del contrato de staking view
  const stakingViewConfig = useMemo(() => ({
    address: STAKING_CONTRACT_ADDRESS,
    abi: EnhancedSmartStakingViewABI.abi,
  }), []);

  // Configuración del contrato de skills
  const skillsConfig = useMemo(() => ({
    address: SKILLS_MARKETPLACE_ADDRESS,
    abi: IndividualSkillsMarketplaceABI.abi,
  }), []);

  // Batch read de múltiples funciones
  const { data: stakingData, isLoading: stakingLoading, error: stakingError, refetch: refetchStaking } = useReadContracts({
    contracts: [
      {
        ...stakingViewConfig,
        functionName: 'getAPYRates',
      },
      {
        ...stakingViewConfig,
        functionName: 'getAvailableSkillsConfiguration',
      },
    ],
    query: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 30 * 60 * 1000,   // 30 minutos
      refetchOnWindowFocus: false,
      refetchInterval: 5 * 60 * 1000, // Refetch cada 5 minutos
    }
  });

  // Obtener multiplicadores de rareza del marketplace
  const { data: rarityData, isLoading: rarityLoading, refetch: refetchRarity } = useReadContract({
    ...skillsConfig,
    functionName: 'getRarityEffectMultipliers',
    query: {
      enabled: !!SKILLS_MARKETPLACE_ADDRESS,
      staleTime: 10 * 60 * 1000, // 10 minutos
      gcTime: 60 * 60 * 1000,    // 1 hora
    }
  });

  // Obtener precios base del marketplace
  const { data: pricesData, isLoading: pricesLoading, refetch: refetchPrices } = useReadContract({
    ...skillsConfig,
    functionName: 'getCurrentBasePrices',
    query: {
      enabled: !!SKILLS_MARKETPLACE_ADDRESS,
      staleTime: 10 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
    }
  });

  // Procesar APY rates
  const apyRates = useMemo((): APYRates => {
    if (!stakingData?.[0]?.result) return DEFAULT_APY_RATES;
    
    const result = stakingData[0].result as [bigint, bigint, bigint, bigint, bigint];
    
    return {
      flexible: Number(result[0]) || DEFAULT_APY_RATES.flexible,
      locked30: Number(result[1]) || DEFAULT_APY_RATES.locked30,
      locked90: Number(result[2]) || DEFAULT_APY_RATES.locked90,
      locked180: Number(result[3]) || DEFAULT_APY_RATES.locked180,
      locked365: Number(result[4]) || DEFAULT_APY_RATES.locked365,
    };
  }, [stakingData]);

  // Procesar configuración de skills
  const skillsConfiguration = useMemo((): SkillConfiguration[] => {
    if (!stakingData?.[1]?.result) return [];
    
    const result = stakingData[1].result as Array<{
      skillType: number;
      enabled: boolean;
      effectValue: number;
      description: string;
    }>;
    
    return result.map(skill => ({
      skillType: Number(skill.skillType),
      enabled: skill.enabled,
      effectValue: Number(skill.effectValue),
      description: skill.description,
    }));
  }, [stakingData]);

  // Procesar multiplicadores de rareza
  const rarityMultipliers = useMemo((): RarityMultipliers => {
    if (!rarityData) return DEFAULT_RARITY_MULTIPLIERS;
    
    const result = rarityData as [number, number, number, number, number];
    
    return {
      common: Number(result[0]) || DEFAULT_RARITY_MULTIPLIERS.common,
      rare: Number(result[1]) || DEFAULT_RARITY_MULTIPLIERS.rare,
      epic: Number(result[2]) || DEFAULT_RARITY_MULTIPLIERS.epic,
      legendary: Number(result[3]) || DEFAULT_RARITY_MULTIPLIERS.legendary,
      mythic: Number(result[4]) || DEFAULT_RARITY_MULTIPLIERS.mythic,
    };
  }, [rarityData]);

  // Procesar precios base
  const basePrices = useMemo((): BasePrices => {
    if (!pricesData) {
      // Precios por defecto en POL (18 decimales)
      const defaultPrice = BigInt(10) * BigInt(10 ** 18);
      return {
        common: defaultPrice,
        rare: defaultPrice * 2n,
        epic: defaultPrice * 5n,
        legendary: defaultPrice * 10n,
        mythic: defaultPrice * 25n,
      };
    }
    
    const result = pricesData as [bigint, bigint, bigint, bigint, bigint];
    
    return {
      common: result[0],
      rare: result[1],
      epic: result[2],
      legendary: result[3],
      mythic: result[4],
    };
  }, [pricesData]);

  // Función de refetch combinada
  const refetch = () => {
    refetchStaking();
    refetchRarity();
    refetchPrices();
  };

  return {
    apyRates,
    minDeposit: BigInt(10) * BigInt(10 ** 18),  // 10 POL
    maxDeposit: BigInt(100000) * BigInt(10 ** 18), // 100,000 POL
    maxDepositsPerUser: 400,
    commissionPercentage: 600, // 6% en basis points
    
    skillsConfig: skillsConfiguration,
    rarityMultipliers,
    basePrices,
    maxActiveSkills: 5,
    
    isLoading: stakingLoading || rarityLoading || pricesLoading,
    error: stakingError || null,
    lastFetch: Date.now(),
    refetch,
  };
}

/**
 * Hook simplificado para obtener solo APY rates
 */
export function useAPYRates(): APYRates & { isLoading: boolean } {
  const { apyRates, isLoading } = useContractConstants();
  return { ...apyRates, isLoading };
}

/**
 * Convertir APY de basis points a porcentaje
 */
export function apyToPercentage(basisPoints: number): number {
  return basisPoints / 100;
}

/**
 * Obtener APY para un período específico de lockup
 */
export function getAPYForLockup(rates: APYRates, days: number): number {
  if (days === 0) return rates.flexible;
  if (days <= 30) return rates.locked30;
  if (days <= 90) return rates.locked90;
  if (days <= 180) return rates.locked180;
  return rates.locked365;
}

/**
 * Calcular ROI diario desde APY
 */
export function calculateDailyROI(apyBasisPoints: number): number {
  return apyBasisPoints / 365;
}

/**
 * Calcular rewards estimados
 */
export function calculateEstimatedRewards(
  principal: bigint,
  apyBasisPoints: number,
  days: number
): bigint {
  const dailyRate = calculateDailyROI(apyBasisPoints);
  const totalRate = dailyRate * days;
  const rewards = (principal * BigInt(Math.floor(totalRate))) / 10000n;
  return rewards;
}
