import { useState, useCallback, useEffect } from 'react';
import { useAccount, useWriteContract, usePublicClient } from 'wagmi';
import { parseEther } from 'viem';
import type { SkillData } from '../../components/skills/config';
import IIndividualSkillsABI from '../../abi/IndividualSkillsMarketplace/IndividualSkillsMarketplace.json';
import { useSkillsGraph } from './useSkillsGraph';
import { dispatchTransactionEvent } from '../subgraph/useTransactionWatcher';

const INDIVIDUAL_SKILLS_ADDRESS = import.meta.env.VITE_INDIVIDUAL_SKILLS as `0x${string}`;
const LAST_KNOWN_CONTRACT_KEY = 'nuxchain_last_contract_address';

export interface UserSkillData {
  skillId: number;
  skillType: number;
  rarity: number;
  level?: number;
  isActive: boolean;
  expiresAt?: number;
  purchasedAt: number;
  txHash?: string;
  skillName?: string;
  skillIcon?: string;
  skillColor?: string;
  skillDescription?: string;
  skillEffectFormatted?: string;
}

export function useSkillsStore() {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Contract write hook
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  
  // GraphQL hook for subgraph queries
  const skillsGraph = useSkillsGraph();

  // ✅ CLEANUP: Clear old skills data when contract address changes
  useEffect(() => {
    if (!address) return;

    const lastContractAddress = localStorage.getItem(LAST_KNOWN_CONTRACT_KEY);
    
    // If contract address has changed, clear old skills data
    if (lastContractAddress && lastContractAddress !== INDIVIDUAL_SKILLS_ADDRESS) {
      console.log('🧹 Contract address changed. Clearing old skills data...');
      const storageKey = `skills_${address.toLowerCase()}`;
      localStorage.removeItem(storageKey);
    }
    
    // Always update the last known contract address
    localStorage.setItem(LAST_KNOWN_CONTRACT_KEY, INDIVIDUAL_SKILLS_ADDRESS);
  }, [address]);

  // ========================================
  // HELPER FUNCTIONS
  // ========================================

  /**
   * Calculate skill price based on type and rarity
   * Matches IndividualSkillsMarketplace contract pricing:
   * 
   * STAKING SKILLS (1-7):
   * - COMMON: 50 POL, UNCOMMON: 80 POL, RARE: 100 POL, EPIC: 150 POL, LEGENDARY: 220 POL
   * 
   * ACTIVE SKILLS (8-16): 30% markup
   * - COMMON: 65 POL, UNCOMMON: 104 POL, RARE: 130 POL, EPIC: 195 POL, LEGENDARY: 286 POL
   */
  const calculateSkillCost = (skillType: number, rarity: number): number => {
    // STAKING SKILLS prices
    const stakingPrices = [50, 80, 100, 150, 220];
    // ACTIVE SKILLS prices (30% markup)
    const activePrices = [65, 104, 130, 195, 286];
    
    // Skills 1-7 are staking, 8-16 are active
    if (skillType >= 1 && skillType <= 7) {
      return stakingPrices[rarity] || 0;
    } else if (skillType >= 8 && skillType <= 16) {
      return activePrices[rarity] || 0;
    }
    
    return 0;
  };

  // ========================================
  // WRITE OPERATIONS
  // ========================================

  /**
   * Purchase individual skill from marketplace
   * This directly calls purchaseIndividualSkill and requires POL payment
   * 
   * @param skill - SkillData with skillType and rarity
   * @param level - Level of the skill (1-50, default 1)
   * @param metadata - Metadata string (default: "Purchased from store")
   */
  const purchaseSkill = useCallback(
    async (skill: SkillData, level: number = 1, metadata: string = '') => {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        // Calculate price in POL based on skill type and rarity
        const priceInPOL = calculateSkillCost(skill.skillType, skill.rarity);
        
        if (priceInPOL === 0) {
          throw new Error('Invalid skill type or rarity');
        }

        const hash = await writeContractAsync({
          address: INDIVIDUAL_SKILLS_ADDRESS,
          abi: IIndividualSkillsABI.abi,
          functionName: 'purchaseIndividualSkill',
          args: [
            BigInt(skill.skillType), // Skill type (1-16)
            BigInt(skill.rarity), // Rarity (0-4)
            BigInt(level), // Level (1-50)
            metadata || 'Purchased from store', // Metadata
          ],
          value: parseEther(priceInPOL.toString()), // Payment in POL (native token)
        });

        // Wait for transaction confirmation
        if (publicClient) {
          const receipt = await publicClient.waitForTransactionReceipt({ hash });

          if (receipt.status === 'success') {
            // ✅ Save purchased skill to localStorage for MySkills display
            const purchasedSkill = {
              skillId: Date.now(), // Use timestamp as temporary ID until we have contract ID
              skillType: skill.skillType,
              rarity: skill.rarity,
              level,
              isActive: false,
              purchasedAt: Date.now(),
              txHash: hash,
              skillName: skill.name,
              skillIcon: skill.icon,
              skillColor: skill.color,
              skillDescription: skill.description,
              skillEffectFormatted: skill.effectFormatted,
            };

            // Get existing skills from localStorage
            const storageKey = `skills_${address?.toLowerCase()}`;
            const existingSkills = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            // Add new skill
            const updatedSkills = [purchasedSkill, ...existingSkills];
            
            // Save back to localStorage
            localStorage.setItem(storageKey, JSON.stringify(updatedSkills));

            // ✅ NEW: Dispatch transaction event for auto-refresh
            dispatchTransactionEvent('skillPurchased', {
              txHash: hash,
              type: 'skill_purchase',
              timestamp: Date.now(),
            });

            return receipt;
          } else {
            throw new Error('Transaction failed');
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to purchase skill';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [address, writeContractAsync, publicClient]
  );

  /**
   * Renew expired individual skill (50% of original price)
   * 
   * @param skillId - ID of the skill to renew
   * @param skillType - Type of skill (1-16) to calculate correct price
   * @param rarity - Rarity level to calculate renewal price
   */
  const renewSkill = useCallback(
    async (skillId: number, skillType: number, rarity: number) => {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        // Calculate renewal price: 50% of original
        const originalPrice = calculateSkillCost(skillType, rarity);
        const renewalPrice = originalPrice / 2;

        const hash = await writeContractAsync({
          address: INDIVIDUAL_SKILLS_ADDRESS,
          abi: IIndividualSkillsABI.abi,
          functionName: 'renewIndividualSkill',
          args: [BigInt(skillId)],
          value: parseEther(renewalPrice.toString()),
        });

        if (publicClient) {
          const receipt = await publicClient.waitForTransactionReceipt({ hash });

          if (receipt.status === 'success') {
            return receipt;
          } else {
            throw new Error('Transaction failed');
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to renew skill';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [address, writeContractAsync, publicClient]
  );

  /**
   * Activate individual skill (user must have 250 POL staked for staking skills)
   */
  const activateSkill = useCallback(
    async (skillId: number) => {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const hash = await writeContractAsync({
          address: INDIVIDUAL_SKILLS_ADDRESS,
          abi: IIndividualSkillsABI.abi,
          functionName: 'activateIndividualSkill',
          args: [BigInt(skillId)],
        });

        if (publicClient) {
          const receipt = await publicClient.waitForTransactionReceipt({ hash });

          if (receipt.status === 'success') {
            return receipt;
          } else {
            throw new Error('Transaction failed');
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to activate skill';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [address, writeContractAsync, publicClient]
  );

  /**
   * Deactivate individual skill
   */
  const deactivateSkill = useCallback(
    async (skillId: number) => {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const hash = await writeContractAsync({
          address: INDIVIDUAL_SKILLS_ADDRESS,
          abi: IIndividualSkillsABI.abi,
          functionName: 'deactivateIndividualSkill',
          args: [BigInt(skillId)],
        });

        if (publicClient) {
          const receipt = await publicClient.waitForTransactionReceipt({ hash });

          if (receipt.status === 'success') {
            return receipt;
          } else {
            throw new Error('Transaction failed');
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to deactivate skill';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [address, writeContractAsync, publicClient]
  );

  /**
   * Get user's purchased skills from localStorage (fastest)
   * This is populated immediately after purchase transaction
   * @returns Array of UserSkillData from localStorage
   */
  const getUserSkills = useCallback((): UserSkillData[] => {
    if (!address) return [];
    
    const storageKey = `skills_${address.toLowerCase()}`;
    const savedSkills = localStorage.getItem(storageKey);
    
    return savedSkills ? JSON.parse(savedSkills) : [];
  }, [address]);

  /**
   * Get user's purchased skills from Subgraph (v0.20 - on-chain truth)
   * This queries The Graph API which indexes events from IndividualSkillsMarketplace
   * 
   * Advantages:
   * - On-chain verified data
   * - Accessible across browser sessions
   * - Includes activation status from smart contract
   * 
   * @returns Array of skills fetched from subgraph
   */
  const getUserSkillsFromGraph = useCallback(
    async (userAddress?: string): Promise<UserSkillData[]> => {
      const queryAddress = userAddress || address;
      if (!queryAddress) return [];

      try {
        const graphSkills = await skillsGraph.getUserSkills(queryAddress);
        
        // Convert GraphQL response to UserSkillData format
        return graphSkills.map((skill) => ({
          skillId: parseInt(skill.skillId),
          skillType: skill.skillType,
          rarity: skill.rarity,
          level: skill.level,
          isActive: skill.isActive,
          expiresAt: skill.expiresAt,
          purchasedAt: skill.timestamp,
          txHash: skill.txHash,
          // These would need to be mapped from SKILLS_DATA
          skillName: undefined,
          skillIcon: undefined,
          skillColor: undefined,
          skillDescription: undefined,
          skillEffectFormatted: undefined,
        }));
      } catch (err) {
        console.error('Error fetching skills from subgraph:', err);
        return [];
      }
    },
    [address, skillsGraph]
  );

  /**
   * Get skills from both localStorage and Subgraph (merged for redundancy)
   * Priority: localStorage first (faster), subgraph for verification
   * 
   * @returns Merged array with deduplication by skillId
   */
  const getUserSkillsMerged = useCallback(
    async (userAddress?: string): Promise<UserSkillData[]> => {
      const queryAddress = userAddress || address;
      if (!queryAddress) return [];

      // Get both sources in parallel
      const localSkills = getUserSkills();
      const graphSkills = await getUserSkillsFromGraph(queryAddress);

      // Merge with deduplication - prefer localStorage (has metadata like icon, color)
      const merged = new Map<number, UserSkillData>();

      // Add graph skills first (on-chain source)
      graphSkills.forEach((skill) => {
        merged.set(skill.skillId, skill);
      });

      // Overlay localStorage skills (has richer metadata)
      localSkills.forEach((skill) => {
        const existing = merged.get(skill.skillId);
        merged.set(skill.skillId, {
          ...existing,
          ...skill,
          // Prefer local metadata but use graph for contract state
          isActive: existing?.isActive ?? skill.isActive,
          expiresAt: existing?.expiresAt ?? skill.expiresAt,
        });
      });

      return Array.from(merged.values());
    },
    [address, getUserSkills, getUserSkillsFromGraph]
  );

  /**
   * Sync skills: get from graph and update localStorage if different
   * Use this to refresh skills periodically or after manual refresh
   * 
   * @returns Synced skills from both sources
   */
  const syncSkillsWithGraph = useCallback(
    async (userAddress?: string): Promise<UserSkillData[]> => {
      const queryAddress = userAddress || address;
      if (!queryAddress) return [];

      try {
        setIsLoading(true);
        const graphSkills = await skillsGraph.getUserSkills(queryAddress);

        if (graphSkills.length > 0) {
          // Update localStorage with fresh data from subgraph
          const storageKey = `skills_${queryAddress.toLowerCase()}`;
          const localSkills = getUserSkills();

          // Merge: keep local metadata, update state from graph
          const merged = localSkills.map((local) => {
            const graphSkill = graphSkills.find((g) => g.skillId === local.skillId.toString());
            if (graphSkill) {
              return {
                ...local,
                isActive: graphSkill.isActive,
                expiresAt: graphSkill.expiresAt,
                purchasedAt: graphSkill.timestamp,
              };
            }
            return local;
          });

          // Add any new skills from graph that aren't in localStorage
          graphSkills.forEach((graphSkill) => {
            if (!merged.find((l) => l.skillId === parseInt(graphSkill.skillId))) {
              merged.push({
                skillId: parseInt(graphSkill.skillId),
                skillType: graphSkill.skillType,
                rarity: graphSkill.rarity,
                level: graphSkill.level,
                isActive: graphSkill.isActive,
                expiresAt: graphSkill.expiresAt,
                purchasedAt: graphSkill.timestamp,
                txHash: graphSkill.txHash,
              });
            }
          });

          localStorage.setItem(storageKey, JSON.stringify(merged));
          return merged;
        }

        return getUserSkills();
      } catch (err) {
        console.error('Error syncing skills with graph:', err);
        return getUserSkills();
      } finally {
        setIsLoading(false);
      }
    },
    [address, skillsGraph, getUserSkills]
  );

  return {
    // State
    isLoading,
    error,
    isConnected,
    userAddress: address,

    // Helper
    calculateSkillCost,
    
    // Methods - localStorage (fast)
    getUserSkills,
    
    // Methods - Subgraph (v0.20 - on-chain truth)
    getUserSkillsFromGraph,
    getUserSkillsMerged,
    syncSkillsWithGraph,

    // Purchase operations
    purchaseSkill,
    renewSkill,
    activateSkill,
    deactivateSkill,
  };
}
