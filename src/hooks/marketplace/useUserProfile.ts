import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';
import { useMemo, useCallback } from 'react';
import GameifiedMarketplaceCoreABI from '../../abi/MarketplaceCore/GameifiedMarketplaceCoreV1.json';
import LevelingSystemABI from '../../abi/LevelingSystem/LevelingSystem.json';
import type { UserProfile } from '../../types/contracts';
import { xpToasts } from '../../utils/toasts/xpToasts';

const MARKETPLACE_CONTRACT_ADDRESS = import.meta.env.VITE_GAMEIFIED_MARKETPLACE_PROXY;

// ✅ Validación de configuración del contrato en tiempo de carga
if (!MARKETPLACE_CONTRACT_ADDRESS) {
  console.error('❌ CRITICAL ERROR: VITE_GAMEIFIED_MARKETPLACE_PROXY no está configurado');
  console.error('Este valor es requerido en variables de entorno para el funcionamiento del Marketplace');
}

interface UseUserProfileReturn {
  userProfile: UserProfile | null;
  level: number;
  totalXP: bigint;
  isLoading: boolean;
  error: Error | null;
  formattedXP: string;
  refetch?: () => void;
}

/**
 * Hook para obtener el perfil gamificado del usuario en el Marketplace
 * Incluye XP, nivel, estadísticas de NFTs y earnings
 * 
 * ✅ MEJORADO:
 * - Event listeners para XPGained y LevelUp
 * - Refetch más agresivo: cada 15 segundos
 * - Invalidación de cache cuando hay eventos
 * - Notificaciones cuando se gana XP
 * - Validación de dirección del contrato en producción
 * - Usa sistema modular: LevelingSystem para perfiles
 */
export function useUserProfile(): UseUserProfileReturn {
  const { address, isConnected } = useAccount();

  const marketplaceConfig = {
    address: MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
    abi: GameifiedMarketplaceCoreABI.abi,
  };

  // ✅ STEP 1: Get LevelingSystem address from marketplace contract
  const { data: levelingSystemAddress } = useReadContract({
    ...marketplaceConfig,
    functionName: 'levelingSystemAddress',
    query: { 
      enabled: !!MARKETPLACE_CONTRACT_ADDRESS,
      staleTime: Infinity, // Address doesn't change
    }
  });

  // ✅ STEP 2: Get user profile from LevelingSystem contract
  const { data: profileData, isLoading, error, refetch } = useReadContract({
    address: levelingSystemAddress as `0x${string}`,
    abi: LevelingSystemABI.abi,
    functionName: 'userProfiles',
    args: [address],
    query: { 
      enabled: !!address && isConnected && !!levelingSystemAddress,
      staleTime: 10000,
      refetchInterval: 15000,
      refetchIntervalInBackground: true
    }
  });

  // ✅ EVENT LISTENER: XPGained
  const onXPGainedLogs = useCallback((logs: unknown[]) => {
    console.log('🏆 XP Gained Event:', logs);
    
    if (logs && logs.length > 0) {
      const log = logs[0] as Record<string, unknown>;
      // Mostrar notificación
      const amount = (log.args as Record<string, unknown>)?.amount ? Number((log.args as Record<string, unknown>).amount) : 0;
      const reason = (log.args as Record<string, unknown>)?.reason ? String((log.args as Record<string, unknown>).reason) : 'ACTIVITY';
      
      xpToasts.xpGained(amount, reason);
    }
    
    // Refetch inmediato cuando se gane XP
    if (refetch) {
      setTimeout(() => refetch(), 500); // Pequeño delay para permitir que blockchain se actualice
    }
  }, [refetch]);

  useWatchContractEvent({
    address: levelingSystemAddress as `0x${string}`,
    abi: LevelingSystemABI.abi,
    eventName: 'XPGained',
    args: {
      user: address
    },
    enabled: !!levelingSystemAddress,
    onLogs: onXPGainedLogs
  });

  // ✅ EVENT LISTENER: LevelUp
  const onLevelUpLogs = useCallback((logs: unknown[]) => {
    console.log('⭐ Level Up Event:', logs);
    
    if (logs && logs.length > 0) {
      const log = logs[0] as Record<string, unknown>;
      const newLevel = (log.args as Record<string, unknown>)?.newLevel ? Number((log.args as Record<string, unknown>).newLevel) : 1;
      const nextLevelXP = ((newLevel + 1) ** 2 * 100);
      
      xpToasts.levelUp(newLevel, nextLevelXP);
    }
    
    // Refetch inmediato cuando suba de nivel
    if (refetch) {
      setTimeout(() => refetch(), 500);
    }
  }, [refetch]);

  useWatchContractEvent({
    address: levelingSystemAddress as `0x${string}`,
    abi: LevelingSystemABI.abi,
    eventName: 'LevelUp',
    args: {
      user: address
    },
    enabled: !!levelingSystemAddress,
    onLogs: onLevelUpLogs
  });

  const userProfile = useMemo(() => {
    if (!profileData || !Array.isArray(profileData)) return null;

    return {
      totalXP: BigInt(profileData[0] || 0),
      level: Number(profileData[1] ?? 0),
      nftsCreated: BigInt(profileData[2] || 0),
      nftsOwned: BigInt(profileData[3] || 0),
      nftsSold: BigInt(profileData[4] || 0),
      nftsBought: BigInt(profileData[5] || 0),
      // Legacy fields for compatibility
      referralCount: BigInt(0),
      totalEarnings: BigInt(0),
      lastActivityTime: BigInt(0),
    } as UserProfile;
  }, [profileData]);

  const level = useMemo(() => {
    // ✅ Show level 0 when appropriate (0-99 XP)
    return userProfile?.level ?? 0;
  }, [userProfile]);

  const totalXP = useMemo(() => {
    return userProfile?.totalXP || BigInt(0);
  }, [userProfile]);

  const formattedXP = useMemo(() => {
    if (!totalXP) return '0';
    return totalXP.toString();
  }, [totalXP]);

  return {
    userProfile,
    level,
    totalXP,
    isLoading,
    error: error as Error | null,
    formattedXP,
    refetch: () => {
      console.log('🔄 Manualmente refetching perfil del usuario...');
      if (refetch) {
        refetch();
      }
    }
  };
}

/**
 * Hook para calcular el progreso de XP hasta el siguiente nivel
 * 
 * ✅ FÓRMULA (LINEAL - COINCIDE CON SMART CONTRACT):
 * - Contract level = floor(totalXP / 100)  (0, 1, 2, ...)
 * - Level 0: 0-99 XP (progresando hacia Level 1)
 * - Level 1: 100-199 XP (progresando hacia Level 2)
 * 
 * Con 40 XP:
 * - Level: 0
 * - Progreso: 40/100 = 40%
 * - Next level: 1 (necesita 100 XP acumulado)
 */
export function useXPProgress() {
  const { level, totalXP } = useUserProfile();

  // XP requerido PARA AVANZAR UNA LEVEL (100 XP por nivel)
  const xpRequiredForCurrentLevel = useMemo(() => {
    return BigInt(100);
  }, []);

  // XP requerido ACUMULADO para el siguiente nivel
  // Level 0 → necesitas 100 XP acumulado
  // Level 1 → necesitas 200 XP acumulado
  const xpForNextLevel = useMemo(() => {
    return BigInt((level + 1) * 100);
  }, [level]);

  // ✅ Progreso dentro del nivel actual
  const progress = useMemo(() => {
    if (!totalXP) {
      console.log('📊 Progress: totalXP is null, returning 0%');
      return 0;
    }
    
    // XP que ya has ganado en este nivel (0-99)
    const xpInCurrentLevel = Number(totalXP) % 100;
    
    // Progreso como porcentaje (0-100%)
    const percent = (xpInCurrentLevel / 100) * 100;
    
    console.log('📊 DEBUG Progress:', {
      level,
      totalXP: totalXP.toString(),
      xpInCurrentLevel,
      xpRequiredForCurrentLevel: xpRequiredForCurrentLevel.toString(),
      xpForNextLevel: xpForNextLevel.toString(),
      percent: percent.toFixed(2)
    });
    
    return Math.min(100, Math.max(0, percent));
  }, [totalXP, level, xpRequiredForCurrentLevel, xpForNextLevel]);

  // ✅ XP restante para llegar al siguiente nivel
  const xpRemaining = useMemo(() => {
    if (!totalXP) return xpRequiredForCurrentLevel;
    
    const xpInCurrentLevel = Number(totalXP) % 100;
    const remaining = 100 - xpInCurrentLevel;
    return BigInt(remaining);
  }, [totalXP, xpRequiredForCurrentLevel]);

  return {
    level,
    currentXP: totalXP,
    xpForNextLevel,
    xpForCurrentLevel: xpRequiredForCurrentLevel,
    xpRemaining,
    progress,
  };
}
