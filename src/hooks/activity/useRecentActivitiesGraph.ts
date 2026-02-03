import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { apolloClient } from '../../lib/apollo-client';
import { GET_USER_ACTIVITIES, GET_USER_PURCHASE_ACTIVITIES, GET_USER_INDIVIDUAL_SKILLS } from '../../lib/graphql/queries';
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

  // Mapa de descripciones de actividades para fácil mantenimiento
  const activityDescriptions = useCallback((type: ActivityType, details: Activity['details']): string => {
    const descriptions: Record<ActivityType, string> = {
      STAKING_DEPOSIT: `Staked ${details.amount} POL${
        details.lockupDuration ? ` (${formatLockupDuration(details.lockupDuration)})` : ''
      }`,
      STAKING_WITHDRAW: `Withdrew ${details.amount} POL`,
      STAKING_WITHDRAW_ALL: `Withdrew all ${details.amount} POL`,
      STAKING_COMPOUND: `Compounded ${details.amount} POL rewards`,
      STAKING_AUTO_COMPOUND: `Auto-compounded ${details.amount} POL rewards`,
      EMERGENCY_WITHDRAWAL: `Emergency withdrawal of ${details.amount} POL`,
      SKILL_ACTIVATED: `Activated Skill #${details.tokenId}`,
      SKILL_DEACTIVATED: `Deactivated Skill #${details.tokenId}`,
      SKILL_UPGRADED: `Upgraded Skill #${details.tokenId}`,
      QUEST_COMPLETED: `Completed Quest`,
      ACHIEVEMENT_UNLOCKED: `Unlocked Achievement`,
      NFT_MINT: `Minted NFT #${details.tokenId}${details.category ? ` (${details.category})` : ''}`,
      NFT_LIST: `Listed NFT #${details.tokenId} for ${details.price} POL`,
      NFT_SALE: `Sold NFT #${details.tokenId} for ${details.price} POL`,
      NFT_PURCHASE: `Purchased NFT #${details.tokenId} for ${details.price} POL`,
      NFT_UNLIST: `Unlisted NFT #${details.tokenId}`,
      OFFER_MADE: `Made offer of ${details.amount} POL on NFT #${details.tokenId}`,
      OFFER_ACCEPTED: `Accepted offer of ${details.amount} POL for NFT #${details.tokenId}`,
      OFFER_CANCELLED: `Cancelled offer for NFT #${details.tokenId}`,
      ROYALTY_PAID: `Paid royalty of ${details.amount} POL`,
      COMMISSION_PAID: `Paid commission of ${details.amount} POL`,
      XP_GAINED: `Gained ${details.amount} XP`,
      LEVEL_UP: `Reached new level`,
      AUTO_COMPOUND_ENABLED: `Enabled auto-compounding`,
      AUTO_COMPOUND_DISABLED: `Disabled auto-compounding`,
      AUTO_COMPOUND_EXECUTED: `Auto-compound executed`,
    };
    return descriptions[type] || `Activity: ${type}`;
  }, [formatLockupDuration]);

  // Función para generar descripción de actividad (mantener compatibilidad)
  const generateDescription = useCallback((type: ActivityType, details: Activity['details']): string => {
    return activityDescriptions(type, details);
  }, [activityDescriptions]);

  // Mapa de iconos de actividades para fácil mantenimiento
  const activityIcons = useCallback((type: ActivityType): string => {
    const icons: Record<ActivityType, string> = {
      STAKING_DEPOSIT: '💎',
      STAKING_WITHDRAW: '💰',
      STAKING_WITHDRAW_ALL: '💸',
      STAKING_COMPOUND: '🔄',
      STAKING_AUTO_COMPOUND: '⚙️',
      EMERGENCY_WITHDRAWAL: '🚨',
      SKILL_ACTIVATED: '✨',
      SKILL_DEACTIVATED: '⛔',
      SKILL_UPGRADED: '⬆️',
      QUEST_COMPLETED: '🏆',
      ACHIEVEMENT_UNLOCKED: '🥇',
      NFT_MINT: '🎨',
      NFT_LIST: '🏷️',
      NFT_SALE: '💵',
      NFT_PURCHASE: '🛒',
      NFT_UNLIST: '❌',
      OFFER_MADE: '💬',
      OFFER_ACCEPTED: '✅',
      OFFER_CANCELLED: '🚫',
      ROYALTY_PAID: '👑',
      COMMISSION_PAID: '💼',
      XP_GAINED: '📈',
      LEVEL_UP: '🚀',
      AUTO_COMPOUND_ENABLED: '✔️',
      AUTO_COMPOUND_DISABLED: '✖️',
      AUTO_COMPOUND_EXECUTED: '⚡',
    };
    return icons[type] || '📋';
  }, []);

  // Función para obtener icono según tipo de actividad (mantener compatibilidad)
  const getActivityIcon = useCallback((type: ActivityType): string => {
    return activityIcons(type);
  }, [activityIcons]);

  // Mapa de colores de actividades para fácil mantenimiento
  const activityColors = useCallback((type: ActivityType): string => {
    const colors: Record<ActivityType, string> = {
      STAKING_DEPOSIT: 'text-green-400',
      STAKING_WITHDRAW: 'text-blue-400',
      STAKING_WITHDRAW_ALL: 'text-cyan-400',
      STAKING_COMPOUND: 'text-purple-400',
      STAKING_AUTO_COMPOUND: 'text-indigo-400',
      EMERGENCY_WITHDRAWAL: 'text-red-500',
      SKILL_ACTIVATED: 'text-yellow-400',
      SKILL_DEACTIVATED: 'text-red-400',
      SKILL_UPGRADED: 'text-lime-400',
      QUEST_COMPLETED: 'text-orange-400',
      ACHIEVEMENT_UNLOCKED: 'text-yellow-300',
      NFT_MINT: 'text-pink-400',
      NFT_LIST: 'text-yellow-400',
      NFT_SALE: 'text-green-400',
      NFT_PURCHASE: 'text-blue-400',
      NFT_UNLIST: 'text-red-400',
      OFFER_MADE: 'text-orange-400',
      OFFER_ACCEPTED: 'text-green-400',
      OFFER_CANCELLED: 'text-red-400',
      ROYALTY_PAID: 'text-amber-400',
      COMMISSION_PAID: 'text-slate-400',
      XP_GAINED: 'text-green-300',
      LEVEL_UP: 'text-cyan-300',
      AUTO_COMPOUND_ENABLED: 'text-green-400',
      AUTO_COMPOUND_DISABLED: 'text-gray-400',
      AUTO_COMPOUND_EXECUTED: 'text-blue-300',
    };
    return colors[type] || 'text-gray-400';
  }, []);

  // Función para obtener color según tipo de actividad (mantener compatibilidad)
  const getActivityColor = useCallback((type: ActivityType): string => {
    return activityColors(type);
  }, [activityColors]);

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
        // Query all three sources in parallel:
        // 1. Regular activities (user as actor - creator, lister, seller, etc.)
        // 2. Purchase activities (TOKEN_SALE where user is BUYER)
        // 3. Individual skills (purchased skills)
        const [activitiesResult, purchasesResult, skillsResult] = await Promise.all([
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
            query: GET_USER_PURCHASE_ACTIVITIES,
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

        // Handle errors from any query
        if (activitiesResult.errors && activitiesResult.errors.length > 0) {
          console.error('❌ [The Graph] Activities GraphQL errors:', activitiesResult.errors);
        }
        if (purchasesResult.errors && purchasesResult.errors.length > 0) {
          console.error('❌ [The Graph] Purchases GraphQL errors:', purchasesResult.errors);
        }
        if (skillsResult.errors && skillsResult.errors.length > 0) {
          console.error('❌ [The Graph] Skills GraphQL errors:', skillsResult.errors);
        }

        const { data: activitiesData } = activitiesResult;
        const { data: purchasesData } = purchasesResult;
        const { data: skillsData } = skillsResult;

        console.log(
          `%c✅ useRecentActivitiesGraph Query%c\n` +
          `├─ Fetched: ${activitiesData?.activities?.length || 0} activities (as actor)\n` +
          `├─ Fetched: ${purchasesData?.activities?.length || 0} purchases (as buyer)\n` +
          `├─ Fetched: ${skillsData?.individualSkills?.length || 0} skills\n` +
          `└─ Time: ${duration}ms`,
          'color: #20b2aa; font-weight: bold;',
          'color: #ffffff;'
        );

        // ✅ DIAGNOSTIC: Log if no purchases found (Silent log, not a warning for empty state)
        if ((purchasesData?.activities?.length || 0) === 0) {
          console.log(
            `%cℹ️ [The Graph] No NFT purchases found%c\n` +
            `├─ User: ${address}\n` +
            `└─ Note: This is normal if the user hasn't bought NFTs yet`,
            'color: #888888; font-weight: bold;',
            'color: #888888;'
          );
        } else {
          console.log(
            `%c✅ [The Graph] Found NFT purchases%c\n` +
            `├─ Count: ${purchasesData?.activities?.length}\n` +
            `└─ Sample: ${JSON.stringify(purchasesData?.activities?.[0], null, 2)}`,
            'color: #00aa00; font-weight: bold;',
            'color: #ffffff;'
          );
        }

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

        // Transform purchase activities (NFT_PURCHASE activities from subgraph)
        // ✅ SIMPLIFIED: No longer need to transform type from TOKEN_SALE to NFT_PURCHASE
        const transformedPurchases: Activity[] = (purchasesData?.activities || []).map((activity: GraphQLActivity) => {
          const details: Activity['details'] = {
            amount: activity.amount ? formatEther(BigInt(activity.amount)) : undefined,
            tokenId: activity.tokenId,
            price: activity.amount ? formatEther(BigInt(activity.amount)) : undefined,
            category: activity.category,
            buyer: activity.buyer,
            seller: activity.seller,
          };

          // ✅ FIXED: Now type is already NFT_PURCHASE from subgraph
          const description = generateDescription(activity.type, details);
          const icon = getActivityIcon(activity.type);
          const color = getActivityColor(activity.type);

          return {
            id: `purchase-${activity.id}`,
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
            type: 'SKILL_UPGRADED' as const, // Reusing SKILL_UPGRADED type for purchased skills display
            timestamp: Number(skill.purchasedAt),
            txHash: skill.transactionHash,
            details,
            description,
            icon,
            color,
          };
        });

        // Combine all activities (actor activities + purchases + skills)
        const allTransformedActivities = [...transformedActivities, ...transformedPurchases, ...skillActivities];

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
          `├─ Raw Activities (actor): ${activitiesData?.activities?.length || 0}\n` +
          `├─ Raw Purchases (buyer): ${purchasesData?.activities?.length || 0}\n` +
          `├─ Raw Skills: ${skillsData?.individualSkills?.length || 0}\n` +
          `├─ Combined Total: ${allTransformedActivities.length}\n` +
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
