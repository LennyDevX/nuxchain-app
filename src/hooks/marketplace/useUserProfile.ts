import { useAccount, useReadContract } from 'wagmi';
import { useMemo } from 'react';
import GameifiedMarketplaceCoreABI from '../../abi/GameifiedMarketplaceCoreV1.json';
import type { UserProfile } from '../../types/contracts';

const MARKETPLACE_CONTRACT_ADDRESS = import.meta.env.VITE_GAMEIFIED_MARKETPLACE_PROXY;

interface UseUserProfileReturn {
  userProfile: UserProfile | null;
  level: number;
  totalXP: bigint;
  isLoading: boolean;
  error: Error | null;
  formattedXP: string;
}

/**
 * Hook para obtener el perfil gamificado del usuario en el Marketplace
 * Incluye XP, nivel, estadísticas de NFTs y earnings
 */
export function useUserProfile(): UseUserProfileReturn {
  const { address, isConnected } = useAccount();

  const contractConfig = {
    address: MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
    abi: GameifiedMarketplaceCoreABI.abi,
  };

  // Get user profile
  const { data: profileData, isLoading, error } = useReadContract({
    ...contractConfig,
    functionName: 'userProfiles',
    args: [address],
    query: { 
      enabled: !!address && isConnected,
      staleTime: 30000,
      refetchInterval: 60000
    }
  });

  const userProfile = useMemo(() => {
    if (!profileData || !Array.isArray(profileData)) return null;

    return {
      totalXP: BigInt(profileData[0] || 0),
      level: Number(profileData[1] || 1),
      nftsCreated: BigInt(profileData[2] || 0),
      nftsSold: BigInt(profileData[3] || 0),
      nftsBought: BigInt(profileData[4] || 0),
      referralCount: BigInt(profileData[5] || 0),
      totalEarnings: BigInt(profileData[6] || 0),
      lastActivityTime: BigInt(profileData[7] || 0),
    } as UserProfile;
  }, [profileData]);

  const level = useMemo(() => {
    return userProfile?.level || 1;
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
  };
}

/**
 * Hook para calcular el progreso de XP hasta el siguiente nivel
 */
export function useXPProgress() {
  const { level, totalXP } = useUserProfile();

  const xpForNextLevel = useMemo(() => {
    // Fórmula: XP requerido = nivel^2 * 100
    return BigInt((level + 1) ** 2 * 100);
  }, [level]);

  const xpForCurrentLevel = useMemo(() => {
    return BigInt(level ** 2 * 100);
  }, [level]);

  const progress = useMemo(() => {
    if (!totalXP) return 0;
    const current = Number(totalXP - xpForCurrentLevel);
    const needed = Number(xpForNextLevel - xpForCurrentLevel);
    return Math.min(100, Math.max(0, (current / needed) * 100));
  }, [totalXP, xpForCurrentLevel, xpForNextLevel]);

  return {
    level,
    currentXP: totalXP,
    xpForNextLevel,
    xpForCurrentLevel,
    progress,
  };
}
