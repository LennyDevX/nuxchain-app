/**
 * GraphQL Hook for Individual Skills Marketplace
 * Fetches purchased skills directly from The Graph Subgraph (v0.20)
 * Provides on-chain data with real-time sync capabilities
 */

import { useCallback, useState } from 'react';
import { gql } from '@apollo/client';
import { apolloClient } from '../../lib/apollo-client';

export interface SkillPurchaseEvent {
  id: string;
  user: string;
  skillId: string;
  skillType: number;
  rarity: number;
  level: number;
  price: string;
  timestamp: number;
  txHash: string;
  metadata: string;
  isActive: boolean;
  expiresAt: number;
}

export interface SkillActivationEvent {
  id: string;
  user: string;
  skillId: string;
  timestamp: number;
  txHash: string;
}

export interface UserSkillsResponse {
  purchases: SkillPurchaseEvent[];
  activations: SkillActivationEvent[];
}

/**
 * Query to fetch user's purchased skills from subgraph
 * Includes both STAKING and ACTIVE skills (1-16)
 */
const GET_USER_SKILLS = gql`
  query GetUserSkills($userAddress: String!) {
    skillPurchaseds(
      where: { user: $userAddress }
      orderBy: timestamp
      orderDirection: desc
      first: 1000
    ) {
      id
      user
      skillId
      skillType
      rarity
      level
      price
      timestamp
      transactionHash
      metadata
      isActive
      expiresAt
    }
  }
`;

/**
 * Query to fetch user's skill activations (for boost tracking)
 */
const GET_USER_SKILL_ACTIVATIONS = gql`
  query GetUserSkillActivations($userAddress: String!) {
    skillActivateds(
      where: { user: $userAddress }
      orderBy: timestamp
      orderDirection: desc
      first: 500
    ) {
      id
      user
      skillId
      timestamp
      transactionHash
    }
  }
`;

/**
 * Query to fetch all user's skills with combined purchase/activation data
 */
const GET_USER_SKILLS_COMPREHENSIVE = gql`
  query GetUserSkillsComprehensive($userAddress: String!) {
    skillPurchaseds(
      where: { user: $userAddress }
      orderBy: timestamp
      orderDirection: desc
      first: 1000
    ) {
      id
      user
      skillId
      skillType
      rarity
      level
      price
      timestamp
      transactionHash
      metadata
      isActive
      expiresAt
    }
    skillActivateds(where: { user: $userAddress }, first: 500) {
      skillId
      timestamp
    }
    skillDeactivateds(where: { user: $userAddress }, first: 500) {
      skillId
      timestamp
    }
    skillExpiredsFromGraph: skillExpireds(where: { user: $userAddress }, first: 500) {
      skillId
      timestamp
    }
  }
`;

export function useSkillsGraph() {
  const [skills, setSkills] = useState<SkillPurchaseEvent[]>([]);
  const [activations, setActivations] = useState<SkillActivationEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch user's purchased skills from subgraph
   * @param userAddress - User's wallet address
   */
  const getUserSkills = useCallback(
    async (userAddress: string): Promise<SkillPurchaseEvent[]> => {
      if (!userAddress) {
        return [];
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data, errors } = await apolloClient.query({
          query: GET_USER_SKILLS,
          variables: {
            userAddress: userAddress.toLowerCase(),
          },
          fetchPolicy: 'network-only',
        });

        if (errors && errors.length > 0) {
          throw new Error(`GraphQL Error: ${errors[0].message}`);
        }

        const fetchedSkills: SkillPurchaseEvent[] = (data.skillPurchaseds || []).map(
          (skill: Record<string, unknown>) => ({
            id: String(skill.id),
            user: String(skill.user),
            skillId: String(skill.skillId),
            skillType: Number(skill.skillType),
            rarity: Number(skill.rarity),
            level: Number(skill.level),
            price: String(skill.price),
            timestamp: Number(skill.timestamp),
            txHash: String(skill.transactionHash),
            metadata: String(skill.metadata),
            isActive: Boolean(skill.isActive),
            expiresAt: Number(skill.expiresAt),
          })
        );

        setSkills(fetchedSkills);
        return fetchedSkills;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch skills';
        setError(errorMessage);
        console.error('useSkillsGraph - getUserSkills error:', err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Fetch user's skill activation events
   * @param userAddress - User's wallet address
   */
  const getUserSkillActivations = useCallback(
    async (userAddress: string): Promise<SkillActivationEvent[]> => {
      if (!userAddress) {
        return [];
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data, errors } = await apolloClient.query({
          query: GET_USER_SKILL_ACTIVATIONS,
          variables: {
            userAddress: userAddress.toLowerCase(),
          },
          fetchPolicy: 'network-only',
        });

        if (errors && errors.length > 0) {
          throw new Error(`GraphQL Error: ${errors[0].message}`);
        }

        const fetchedActivations: SkillActivationEvent[] = (
          data.skillActivateds || []
        ).map((event: Record<string, unknown>) => ({
          id: String(event.id),
          user: String(event.user),
          skillId: String(event.skillId),
          timestamp: Number(event.timestamp),
          txHash: String(event.transactionHash),
        }));

        setActivations(fetchedActivations);
        return fetchedActivations;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch activations';
        setError(errorMessage);
        console.error('useSkillsGraph - getUserSkillActivations error:', err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Fetch comprehensive skill data (purchases + activations + deactivations)
   * @param userAddress - User's wallet address
   */
  const getUserSkillsComprehensive = useCallback(
    async (userAddress: string): Promise<UserSkillsResponse> => {
      if (!userAddress) {
        return { purchases: [], activations: [] };
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data, errors } = await apolloClient.query({
          query: GET_USER_SKILLS_COMPREHENSIVE,
          variables: {
            userAddress: userAddress.toLowerCase(),
          },
          fetchPolicy: 'network-only',
        });

        if (errors && errors.length > 0) {
          throw new Error(`GraphQL Error: ${errors[0].message}`);
        }

        const purchases: SkillPurchaseEvent[] = (data.skillPurchaseds || []).map(
          (skill: Record<string, unknown>) => ({
            id: String(skill.id),
            user: String(skill.user),
            skillId: String(skill.skillId),
            skillType: Number(skill.skillType),
            rarity: Number(skill.rarity),
            level: Number(skill.level),
            price: String(skill.price),
            timestamp: Number(skill.timestamp),
            txHash: String(skill.transactionHash),
            metadata: String(skill.metadata),
            isActive: Boolean(skill.isActive),
            expiresAt: Number(skill.expiresAt),
          })
        );

        const activations: SkillActivationEvent[] = (data.skillActivateds || []).map(
          (event: Record<string, unknown>) => ({
            id: String(event.id),
            user: String(event.user),
            skillId: String(event.skillId),
            timestamp: Number(event.timestamp),
            txHash: String(event.transactionHash),
          })
        );

        setSkills(purchases);
        setActivations(activations);

        return { purchases, activations };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch comprehensive skills data';
        setError(errorMessage);
        console.error('useSkillsGraph - getUserSkillsComprehensive error:', err);
        return { purchases: [], activations: [] };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Filter skills by category (STAKING vs ACTIVE)
   */
  const getSkillsByCategory = useCallback(
    (skillsList: SkillPurchaseEvent[]) => {
      const staking = skillsList.filter((s) => s.skillType >= 1 && s.skillType <= 7);
      const active = skillsList.filter((s) => s.skillType >= 8 && s.skillType <= 16);
      return { staking, active };
    },
    []
  );

  /**
   * Get only active (non-expired) skills
   */
  const getActiveSkills = useCallback((skillsList: SkillPurchaseEvent[]) => {
    const now = Math.floor(Date.now() / 1000);
    return skillsList.filter((s) => s.expiresAt > now && s.isActive);
  }, []);

  /**
   * Get only expired skills
   */
  const getExpiredSkills = useCallback((skillsList: SkillPurchaseEvent[]) => {
    const now = Math.floor(Date.now() / 1000);
    return skillsList.filter((s) => s.expiresAt <= now);
  }, []);

  return {
    // State
    skills,
    activations,
    isLoading,
    error,

    // Methods
    getUserSkills,
    getUserSkillActivations,
    getUserSkillsComprehensive,
    getSkillsByCategory,
    getActiveSkills,
    getExpiredSkills,
  };
}
