import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';
import { useMemo, useCallback, useEffect } from 'react';
import GameifiedMarketplaceCoreABI from '../../abi/GameifiedMarketplaceCoreV1.json';
import type { UserProfile } from '../../types/contracts';
import { showXPNotification, injectXPNotificationStyles } from '../../utils/notifications/xpNotification';

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
 */
export function useUserProfile(): UseUserProfileReturn {
  const { address, isConnected } = useAccount();

  // Initialize notification styles once
  useEffect(() => {
    injectXPNotificationStyles();
  }, []);

  const contractConfig = {
    address: MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
    abi: GameifiedMarketplaceCoreABI.abi,
  };

  // Get user profile
  const { data: profileData, isLoading, error, refetch } = useReadContract({
    ...contractConfig,
    functionName: 'userProfiles',
    args: [address],
    query: { 
      enabled: !!address && isConnected,
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
      
      showXPNotification({
        type: 'xp_gained',
        amount,
        reason
      });
    }
    
    // Refetch inmediato cuando se gane XP
    if (refetch) {
      setTimeout(() => refetch(), 500); // Pequeño delay para permitir que blockchain se actualice
    }
  }, [refetch]);

  useWatchContractEvent({
    address: MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
    abi: GameifiedMarketplaceCoreABI.abi,
    eventName: 'XPGained',
    args: {
      user: address
    },
    onLogs: onXPGainedLogs
  });

  // ✅ EVENT LISTENER: LevelUp
  const onLevelUpLogs = useCallback((logs: unknown[]) => {
    console.log('⭐ Level Up Event:', logs);
    
    if (logs && logs.length > 0) {
      const log = logs[0] as Record<string, unknown>;
      const newLevel = (log.args as Record<string, unknown>)?.newLevel ? Number((log.args as Record<string, unknown>).newLevel) : 1;
      const nextLevelXP = ((newLevel + 1) ** 2 * 100);
      
      showXPNotification({
        type: 'level_up',
        level: newLevel,
        nextLevelXP
      });
    }
    
    // Refetch inmediato cuando suba de nivel
    if (refetch) {
      setTimeout(() => refetch(), 500);
    }
  }, [refetch]);

  useWatchContractEvent({
    address: MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
    abi: GameifiedMarketplaceCoreABI.abi,
    eventName: 'LevelUp',
    args: {
      user: address
    },
    onLogs: onLevelUpLogs
  });

  const userProfile = useMemo(() => {
    if (!profileData || !Array.isArray(profileData)) return null;

    return {
      totalXP: BigInt(profileData[0] || 0),
      // ✅ Allow level 0 when appropriate (no default fallback to 1)
      level: Number(profileData[1] ?? 0),
      nftsCreated: BigInt(profileData[2] || 0),
      nftsSold: BigInt(profileData[3] || 0),
      nftsBought: BigInt(profileData[4] || 0),
      referralCount: BigInt(profileData[5] || 0),
      totalEarnings: BigInt(profileData[6] || 0),
      lastActivityTime: BigInt(profileData[7] || 0),
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
