/**
 * useViewFunctions - Centralized hook for smart contract view functions
 * Provides easy access to read-only contract data for enriching toast notifications
 */

import { useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import EnhancedSmartStakingViewABI from '../../abi/SmartStaking/EnhancedSmartStakingView.json'
import GameifiedMarketplaceCoreABI from '../../abi/Marketplace/GameifiedMarketplaceCoreV1.json'
import ReferralSystemABI from '../../abi/Marketplace/ReferralSystem.json'
import GameifiedMarketplaceSkillsABI from '../../abi/Marketplace/GameifiedMarketplaceSkillsNft.json'

/**
 * Get user's staking deposit information
 */
export function useUserDeposit(userAddress: `0x${string}` | undefined) {
  const { data, isLoading } = useReadContract({
    address: import.meta.env.VITE_ENHANCED_SMARTSTAKING_VIEWER_ADDRESS as `0x${string}`,
    abi: EnhancedSmartStakingViewABI.abi,
    functionName: 'getUserDeposits',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      staleTime: 30000,
    }
  })

  if (!data || !Array.isArray(data)) {
    return { totalStaked: '0', totalClaimed: '0', depositCount: 0, isLoading }
  }

  const [totalDeposited, totalRewardsClaimed, depositCount] = data as [bigint, bigint, bigint, bigint]

  return {
    totalStaked: formatEther(totalDeposited),
    totalClaimed: formatEther(totalRewardsClaimed),
    depositCount: Number(depositCount),
    isLoading
  }
}

/**
 * Get NFT token listing details
 */
export function useTokenListing(tokenId: bigint | undefined) {
  const { data, isLoading } = useReadContract({
    address: import.meta.env.VITE_GAMIFIED_MARKETPLACE_CORE_ADDRESS as `0x${string}`,
    abi: GameifiedMarketplaceCoreABI.abi,
    functionName: 'getTokenListing',
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: tokenId !== undefined,
      staleTime: 30000,
    }
  })

  if (!data || !Array.isArray(data)) {
    return { price: '0', seller: '', isListed: false, isLoading }
  }

  const [price, seller, isListed] = data as [bigint, `0x${string}`, boolean]

  return {
    price: formatEther(price),
    seller,
    isListed,
    isLoading
  }
}

/**
 * Get user's referral statistics
 */
export function useReferralStats(userAddress: `0x${string}` | undefined) {
  const { data, isLoading } = useReadContract({
    address: import.meta.env.VITE_REFERRAL_SYSTEM_ADDRESS as `0x${string}`,
    abi: ReferralSystemABI.abi,
    functionName: 'getReferralStats',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      staleTime: 30000,
    }
  })

  if (!data || !Array.isArray(data)) {
    return { totalReferrals: 0, totalBonus: '0', isLoading }
  }

  const [totalReferrals, totalBonusEarned] = data as [bigint, bigint]

  return {
    totalReferrals: Number(totalReferrals),
    totalBonus: formatEther(totalBonusEarned),
    isLoading
  }
}

/**
 * Get user's owned skills
 */
export function useOwnedSkills(userAddress: `0x${string}` | undefined) {
  const { data, isLoading } = useReadContract({
    address: import.meta.env.VITE_GAMIFIED_MARKETPLACE_SKILLS_V2_ADDRESS as `0x${string}`,
    abi: GameifiedMarketplaceSkillsABI.abi,
    functionName: 'getOwnedSkills',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      staleTime: 30000,
    }
  })

  if (!data || !Array.isArray(data)) {
    return { activeSkills: [], skillCount: 0, isLoading }
  }

  return {
    activeSkills: data as bigint[],
    skillCount: (data as bigint[]).length,
    isLoading
  }
}

/**
 * Get user's gamification profile (XP, Level)
 */
export function useUserProfile(userAddress: `0x${string}` | undefined) {
  const { data, isLoading } = useReadContract({
    address: import.meta.env.VITE_LEVELING_SYSTEM_ADDRESS as `0x${string}`,
    abi: [
      {
        inputs: [{ name: 'user', type: 'address' }],
        name: 'getUserProfile',
        outputs: [
          { name: 'currentXP', type: 'uint256' },
          { name: 'level', type: 'uint256' },
          { name: 'xpForNextLevel', type: 'uint256' }
        ],
        stateMutability: 'view',
        type: 'function'
      }
    ],
    functionName: 'getUserProfile',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      staleTime: 30000,
    }
  })

  if (!data || !Array.isArray(data)) {
    return { xp: 0, level: 0, xpForNext: 0, isLoading }
  }

  const [currentXP, level, xpForNextLevel] = data as [bigint, bigint, bigint]

  return {
    xp: Number(currentXP),
    level: Number(level),
    xpForNext: Number(xpForNextLevel),
    isLoading
  }
}
