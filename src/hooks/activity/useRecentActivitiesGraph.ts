import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { apolloClient } from '../../lib/apollo-client';
import { GET_USER_ACTIVITIES, GET_USER_INDIVIDUAL_SKILLS } from '../../lib/graphql/queries';
import type { GetUserActivitiesResponse, ActivityType as GraphQLActivityType, GraphQLActivity, GraphQLIndividualSkill } from '../../lib/graphql/types';

// Tipos de actividad (exportados para uso externo)
export type ActivityType = GraphQLActivityType;

export interface Activity {
  id: string;
  type: ActivityType;
  timestamp: number;
  txHash: string;
  details: {
    amount?: string;
    tokenId?: string;
    price?: string;
    lockupDuration?: number;
    category?: string;
    buyer?: string;
    seller?: string;
    offerId?: string;
  };
  description: string;
  icon: string;
  color: string;
}

interface UseRecentActivitiesReturn {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
  refreshActivities: () => Promise<void>;
}

/**
 * Hook para obtener actividades recientes del usuario usando The Graph
 * 
 * ✅ VENTAJAS vs getLogs:
 * - Query instantáneo (~200ms vs 6 horas)
 * - Sin límites de rate limiting de RPC
 * - Histórico completo desde genesis
 * - Datos pre-indexados y optimizados
 * - Queries complejas con filtros avanzados
 * 
 * @param maxActivities - Número máximo de actividades a retornar (default: 20)
 */
export function useRecentActivities(maxActivities: number = 20): UseRecentActivitiesReturn {
  const { address } = useAccount();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para convertir duración de segundos a texto legible
  const formatLockupDuration = useCallback((seconds: number): string => {
    const days = Math.floor(seconds / (24 * 3600));
    if (days === 0) return 'Flexible';
    if (days === 30) return '30 Days';
    if (days === 90) return '90 Days';
    if (days === 180) return '180 Days';
    if (days === 365) return '365 Days';
    return `${days} Days`;
  }, []);

  // Función para generar descripción de actividad
  const generateDescription = useCallback((type: ActivityType, details: Activity['details']): string => {
    switch (type) {
      case 'STAKING_DEPOSIT':
        return `Staked ${details.amount} POL${
          details.lockupDuration ? ` (${formatLockupDuration(details.lockupDuration)})` : ''
        }`;
      case 'STAKING_WITHDRAW':
        return `Withdrew ${details.amount} POL`;
      case 'STAKING_COMPOUND':
        return `Compounded ${details.amount} POL rewards`;
      case 'NFT_MINT':
        return `Minted NFT #${details.tokenId}${details.category ? ` (${details.category})` : ''}`;
      case 'NFT_LIST':
        return `Listed NFT #${details.tokenId} for ${details.price} POL`;
      case 'NFT_SALE':
        return `Sold NFT #${details.tokenId} for ${details.price} POL`;
      case 'NFT_PURCHASE':
        return `Purchased NFT #${details.tokenId} for ${details.price} POL`;
      case 'NFT_UNLIST':
        return `Unlisted NFT #${details.tokenId}`;
      case 'OFFER_MADE':
        return `Made offer of ${details.amount} POL on NFT #${details.tokenId}`;
      case 'OFFER_ACCEPTED':
        return `Accepted offer of ${details.amount} POL for NFT #${details.tokenId}`;
      case 'SKILL_PURCHASED':
        return `Purchased Skill #${details.tokenId}`;
      default:
        return 'Unknown activity';
    }
  }, [formatLockupDuration]);

  // Función para obtener icono según tipo de actividad
  const getActivityIcon = useCallback((type: ActivityType): string => {
    switch (type) {
      case 'STAKING_DEPOSIT':
        return '💎';
      case 'STAKING_WITHDRAW':
        return '💰';
      case 'STAKING_COMPOUND':
        return '🔄';
      case 'NFT_MINT':
        return '🎨';
      case 'NFT_LIST':
        return '🏷️';
      case 'NFT_SALE':
        return '💵';
      case 'NFT_PURCHASE':
        return '🛒';
      case 'NFT_UNLIST':
        return '❌';
      case 'OFFER_MADE':
        return '💬';
      case 'OFFER_ACCEPTED':
        return '✅';
      case 'SKILL_PURCHASED':
        return '🎯';
      default:
        return '📋';
    }
  }, []);

  // Función para obtener color según tipo de actividad
  const getActivityColor = useCallback((type: ActivityType): string => {
    switch (type) {
      case 'STAKING_DEPOSIT':
        return 'text-green-400';
      case 'STAKING_WITHDRAW':
        return 'text-blue-400';
      case 'STAKING_COMPOUND':
        return 'text-purple-400';
      case 'NFT_MINT':
        return 'text-pink-400';
      case 'NFT_LIST':
        return 'text-yellow-400';
      case 'NFT_SALE':
        return 'text-green-400';
      case 'NFT_PURCHASE':
        return 'text-blue-400';
      case 'NFT_UNLIST':
        return 'text-red-400';
      case 'OFFER_MADE':
        return 'text-orange-400';
      case 'OFFER_ACCEPTED':
        return 'text-green-400';
      case 'SKILL_PURCHASED':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  }, []);

  // Función principal para obtener actividades desde The Graph
  const fetchActivities = useCallback(async () => {
    if (!address) {
      setActivities([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(
        `%c📊 useRecentActivitiesGraph%c\n` +
        `├─ Hook: GraphQL Query (The Graph)\n` +
        `├─ Address: ${address?.slice(0, 10)}...\n` +
        `├─ Max Activities: ${maxActivities}\n` +
        `└─ Status: Fetching...`,
        'color: #4169e1; font-weight: bold;',
        'color: #ffffff;'
      );

      const startTime = performance.now();

      try {
        // Query both regular activities and individual skills in parallel
        const [activitiesResult, skillsResult] = await Promise.all([
          apolloClient.query<GetUserActivitiesResponse>({
            query: GET_USER_ACTIVITIES,
            variables: {
              userAddress: address.toLowerCase(),
              first: maxActivities,
              skip: 0,
            },
            fetchPolicy: 'no-cache',
          }),
          apolloClient.query({
            query: GET_USER_INDIVIDUAL_SKILLS,
            variables: {
              userAddress: address.toLowerCase(),
              first: maxActivities,
            },
            fetchPolicy: 'no-cache',
          }),
        ]);

        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);

        // Handle errors from either query
        if (activitiesResult.errors && activitiesResult.errors.length > 0) {
          console.error('❌ [The Graph] Activities GraphQL errors:', activitiesResult.errors);
        }
        if (skillsResult.errors && skillsResult.errors.length > 0) {
          console.error('❌ [The Graph] Skills GraphQL errors:', skillsResult.errors);
        }

        const { data: activitiesData } = activitiesResult;
        const { data: skillsData } = skillsResult;

        console.log(
          `%c✅ useRecentActivitiesGraph Query%c\n` +
          `├─ Fetched: ${activitiesData?.activities?.length || 0} activities\n` +
          `├─ Fetched: ${skillsData?.individualSkills?.length || 0} skills\n` +
          `└─ Time: ${duration}ms`,
          'color: #20b2aa; font-weight: bold;',
          'color: #ffffff;'
        );

        // ✅ DIAGNOSTIC: Log if skills query returned empty (potential subgraph sync issue)
        if ((skillsData?.individualSkills?.length || 0) === 0) {
          console.warn(
            `%c⚠️ [The Graph] No skills returned%c\n` +
            `├─ User: ${address}\n` +
            `├─ Time: ${duration}ms\n` +
            `├─ Possible Cause: Subgraph indexing delay OR user has no purchased skills\n` +
            `└─ Solution: Verify on-chain or wait for subgraph to sync`,
            'color: #ff6b6b; font-weight: bold;',
            'color: #ffffff;'
          );
        }

        // Transform GraphQL activities data to Activity format
        const transformedActivities: Activity[] = (activitiesData?.activities || []).map((activity: GraphQLActivity) => {
          const details: Activity['details'] = {
            amount: activity.amount ? formatEther(BigInt(activity.amount)) : undefined,
            tokenId: activity.tokenId,
            price: activity.amount ? formatEther(BigInt(activity.amount)) : undefined,
            lockupDuration: activity.lockupDuration ? Number(activity.lockupDuration) : undefined,
            category: activity.category,
            buyer: activity.buyer,
            seller: activity.seller,
            offerId: activity.offerId,
          };

          const description = generateDescription(activity.type, details);
          const icon = getActivityIcon(activity.type);
          const color = getActivityColor(activity.type);

          return {
            id: activity.id,
            type: activity.type,
            timestamp: Number(activity.timestamp),
            txHash: activity.transactionHash,
            details,
            description,
            icon,
            color,
          };
        });

        // Transform individual skills to Activity format
        const skillActivities: Activity[] = (skillsData?.individualSkills || []).map((skill: GraphQLIndividualSkill) => {
          const details: Activity['details'] = {
            amount: undefined,
            tokenId: skill.skillId,
          };

          // Create a skill-specific description
          // ✅ FIX: Show both skillId (NFT token ID) and skillType (the actual skill category)
          const skillName = `Skill Type ${skill.skillType} (ID: ${skill.skillId}, Rarity: ${skill.rarity})`;
          const description = `Purchased ${skillName}`;
          const icon = '🎯'; // Skill icon
          const color = '#a78bfa'; // Purple color for skills

          return {
            id: `skill-${skill.id}`,
            type: 'SKILL_PURCHASED' as const,
            timestamp: Number(skill.purchasedAt),
            txHash: skill.transactionHash,
            details,
            description,
            icon,
            color,
          };
        });

        // Combine all activities
        const allTransformedActivities = [...transformedActivities, ...skillActivities];

        // ✅ CRITICAL FIX: Deduplicate by transaction hash + type
        // This prevents showing the same transaction twice if it appears in multiple queries
        // ⚠️ NOTE: For skills, each skill has a different txHash, so different purchases WON'T be deduplicated
        const uniqueActivities = allTransformedActivities.reduce((acc, activity) => {
          const key = `${activity.txHash}-${activity.type}`;
          if (!acc.has(key)) {
            acc.set(key, activity);
          }
          return acc;
        }, new Map<string, Activity>());

        const deduplicatedActivities = Array.from(uniqueActivities.values());

        // Sort by timestamp descending (most recent first)
        deduplicatedActivities.sort((a, b) => b.timestamp - a.timestamp);

        // For NFT activities, keep only the most recent activity per NFT tokenId
        // ✅ IMPORTANT: Skills are NOT in this list, so all skill purchases are kept
        const nftActivityTypes = ['NFT_LIST', 'NFT_SALE', 'NFT_PURCHASE', 'NFT_UNLIST', 'OFFER_MADE', 'OFFER_ACCEPTED'];
        const nftActivitiesMap = new Map<string, Activity>();
        const nonNftActivities: Activity[] = [];

        deduplicatedActivities.forEach(activity => {
          if (nftActivityTypes.includes(activity.type) && activity.details.tokenId) {
            // For NFT activities, use tokenId + type as key to keep only the most recent
            const nftKey = `${activity.details.tokenId}-${activity.type}`;
            const existing = nftActivitiesMap.get(nftKey);
            
            // Keep the most recent one (already sorted by timestamp)
            if (!existing || activity.timestamp > existing.timestamp) {
              nftActivitiesMap.set(nftKey, activity);
            }
          } else {
            // Keep all non-NFT activities (staking, skills, etc.)
            nonNftActivities.push(activity);
          }
        });

        // Combine NFT activities (deduplicated by tokenId) with all other activities
        const finalActivities = [...Array.from(nftActivitiesMap.values()), ...nonNftActivities];

        // Sort final list by timestamp
        finalActivities.sort((a, b) => b.timestamp - a.timestamp);

        setActivities(finalActivities);
        setError(null); // Clear any previous errors

        console.log(
          `%c🔍 useRecentActivitiesGraph Processing%c\n` +
          `├─ Raw Activities: ${activitiesData?.activities?.length || 0}\n` +
          `├─ Raw Skills: ${skillsData?.individualSkills?.length || 0}\n` +
          `├─ Deduplicated: ${deduplicatedActivities.length} (txHash + type)\n` +
          `├─ NFT Deduped: ${finalActivities.length} (by tokenId)\n` +
          `├─ NFT Activities: ${nftActivitiesMap.size}\n` +
          `├─ Other Activities: ${nonNftActivities.length}\n` +
          `├─ Skills Kept: ${skillActivities.length}\n` +
          `└─ Final Result: ${finalActivities.length} activities sorted by date`,
          'color: #ff8c00; font-weight: bold;',
          'color: #ffffff;'
        );
      } catch (subgraphError) {
        console.error('❌ [The Graph] Subgraph request failed:', subgraphError);
        console.warn('⚠️ Subgraph unavailable - returning empty activity list');
        console.info('💡 Note: The subgraph might not be deployed or synced yet');
        
        // Set a more descriptive error message
        const errorMessage = subgraphError instanceof Error 
          ? subgraphError.message 
          : 'The subgraph is temporarily unavailable';
        
        setActivities([]);
        setError(`Subgraph Error: ${errorMessage}. Your recent activities will appear once the subgraph is synced.`);
      }
    } catch (err) {
      console.error('❌ [useRecentActivitiesGraph] Unexpected error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unexpected error';
      setActivities([]);
      setError(`Error loading activities: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [address, maxActivities, generateDescription, getActivityIcon, getActivityColor]);

  // Auto-fetch when address or maxActivities changes
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    isLoading,
    error,
    refreshActivities: fetchActivities,
  };
}
