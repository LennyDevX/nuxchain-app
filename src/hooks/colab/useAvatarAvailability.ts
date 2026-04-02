import { useState, useEffect, useCallback } from 'react';
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../../lib/export/config/legacy';
import { CollaboratorBadgeRewardsABI } from '../../lib/export/abis/legacy';

const COLLABORATOR_BADGE_REWARDS_ADDRESS = CONTRACT_ADDRESSES.CollaboratorBadgeRewards;
const COLLABORATOR_BADGE_REWARDS_ABI = CollaboratorBadgeRewardsABI;

export interface AvatarAvailability {
  tokenId: number;
  isMinted: boolean;
  owner?: string;
}

export function useAvatarAvailability() {
  const [availability, setAvailability] = useState<AvatarAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Read total holders count
  const { data: holdersCount, refetch: refetchHolders } = useReadContract({
    address: COLLABORATOR_BADGE_REWARDS_ADDRESS as `0x${string}`,
    abi: COLLABORATOR_BADGE_REWARDS_ABI,
    functionName: 'getStats',
  });

  // Check availability for all 12 slots
  // Since we don't have direct token ID to avatar mapping in the contract,
  // we'll simulate availability based on holder count and assume sequential minting
  const checkAvailability = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // For now, we'll create a simulated availability array
      // In a real implementation, you would:
      // 1. Query the NFT contract for token ownership by ID
      // 2. Or query a mapping that tracks which avatar IDs are minted
      
      // Simulating based on holders count - first N avatars are "minted"
      const totalHolders = holdersCount ? Number((holdersCount as bigint[])[5]) : 0;
      
      const availabilityData: AvatarAvailability[] = Array.from({ length: 12 }, (_, i) => ({
        tokenId: i + 1,
        isMinted: i < totalHolders, // First N slots are considered minted
        owner: i < totalHolders ? '0x...' + String(i).repeat(4) : undefined,
      }));

      setAvailability(availabilityData);
    } catch (err) {
      console.error('Error checking avatar availability:', err);
      setError(err instanceof Error ? err.message : 'Failed to check availability');
    } finally {
      setIsLoading(false);
    }
  }, [holdersCount]);

  // Check availability on mount and when holders count changes
  useEffect(() => {
    checkAvailability();
  }, [checkAvailability, holdersCount]);

  // Get specific avatar availability
  const getAvatarStatus = useCallback((tokenId: number): AvatarAvailability | undefined => {
    return availability.find(a => a.tokenId === tokenId);
  }, [availability]);

  // Count available avatars
  const availableCount = availability.filter(a => !a.isMinted).length;
  const mintedCount = availability.filter(a => a.isMinted).length;

  // Refresh availability
  const refresh = useCallback(async () => {
    await refetchHolders();
    await checkAvailability();
  }, [refetchHolders, checkAvailability]);

  return {
    availability,
    availableCount,
    mintedCount,
    totalCount: 12,
    isLoading,
    error,
    getAvatarStatus,
    refresh,
  };
}

export default useAvatarAvailability;
