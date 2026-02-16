import { useMemo } from 'react';
import { useAccount, useReadContracts } from 'wagmi';
import { formatEther } from 'viem';
import type { Abi } from 'viem';
import TreasuryManagerABI from '../../abi/Treasury/TreasuryManager.json';

const TREASURY_ADDRESS = import.meta.env.VITE_TREASURY_MANAGER_ADDRESS as `0x${string}`;

// Log contract address on module load (only in dev)
if (import.meta.env.DEV) {
  console.log('[useTreasuryStats] Treasury contract address:', TREASURY_ADDRESS);
  if (!TREASURY_ADDRESS || (TREASURY_ADDRESS as unknown as string) === 'undefined') {
    console.error('[useTreasuryStats] VITE_TREASURY_MANAGER_ADDRESS not set in .env!');
  }
}

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface TreasuryData {
  /** Global treasury stats */
  stats: TreasuryStats | null;
  /** Fund allocation percentages */
  allocations: TreasuryAllocations | null;
  /** Reserve fund health */
  reserve: ReserveStats | null;
  /** Loading state */
  isLoading: boolean;
}

export interface TreasuryStats {
  totalReceived: string;
  totalReceivedRaw: bigint;
  totalDistributed: string;
  totalDistributedRaw: bigint;
  currentBalance: string;
  currentBalanceRaw: bigint;
  lastDistribution: Date | null;
  autoDistEnabled: boolean;
}

export interface TreasuryAllocations {
  rewards: number;     // percentage
  staking: number;
  marketplace: number;
  development: number;
  collaborators: number;
  total: number;
  items: AllocationItem[];
}

export interface AllocationItem {
  name: string;
  percentage: number;
  color: string;
  emoji: string;
}

export interface ReserveStats {
  currentBalance: string;
  currentBalanceRaw: bigint;
  totalAccumulated: string;
  totalWithdrawn: string;
  allocationPercentage: number;
  isEnabled: boolean;
  healthLevel: 'Critical' | 'Low' | 'Moderate' | 'Healthy' | 'Excellent';
  healthColor: string;
}

// ============================================
// MAIN HOOK
// ============================================

export function useTreasuryStats(): TreasuryData {
  const { chain } = useAccount();

  const contractConfig = useMemo(() => ({
    address: TREASURY_ADDRESS,
    abi: TreasuryManagerABI.abi as Abi,
    chainId: chain?.id,
  }), [chain?.id]);

  // Multicall: Fetch stats, allocations, and reserve in one batch
  const { data: multicallData, isLoading, error: multicallError } = useReadContracts({
    contracts: [
      { ...contractConfig, functionName: 'getStats' },
      { ...contractConfig, functionName: 'getAllAllocations' },
      { ...contractConfig, functionName: 'getReserveStats' },
      { ...contractConfig, functionName: 'getBalance' },
    ],
    query: {
      enabled: !!TREASURY_ADDRESS,
      staleTime: 60000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  });

  // Debug: Log treasury contract responses
  if (multicallData && !isLoading) {
    const fnNames = ['getStats', 'getAllAllocations', 'getReserveStats', 'getBalance'];
    multicallData.forEach((result, i) => {
      if (result.status === 'failure') {
        console.error(
          `[useTreasuryStats] ${fnNames[i]} failed:`,
          result.error?.message || result.error || 'unknown error'
        );
      } else if (result.status === 'success' && import.meta.env.DEV) {
        console.log(`[useTreasuryStats] ${fnNames[i]} success:`, result.result);
      }
    });
  }
  if (multicallError) {
    console.error('[useTreasuryStats] Multicall error:', multicallError.message);
  }

  const result = useMemo((): TreasuryData => {
    // Parse getStats() - handle both tuple and named object returns
    const statsResult = multicallData?.[0];
    let statsRaw: readonly [bigint, bigint, bigint, bigint, boolean] | undefined;

    if (statsResult?.status === 'success' && statsResult.result) {
      const r = statsResult.result;
      if (Array.isArray(r)) {
        statsRaw = r as unknown as readonly [bigint, bigint, bigint, bigint, boolean];
      } else if (typeof r === 'object') {
        // viem may return named object for structs
        const obj = r as Record<string, unknown>;
        const totalReceived = (obj.totalReceived ?? obj[0]) as bigint;
        const totalDist = (obj.totalDist ?? obj.totalDistributed ?? obj[1]) as bigint;
        const currentBalance = (obj.currentBalance ?? obj[2]) as bigint;
        const lastDist = (obj.lastDistribution ?? obj[3]) as bigint;
        const autoDist = (obj.autoDistEnabled ?? obj[4]) as boolean;
        if (totalReceived !== undefined) {
          statsRaw = [totalReceived, totalDist, currentBalance, lastDist, autoDist] as const;
        }
      }
    }

    const stats: TreasuryStats | null = statsRaw ? {
      totalReceived: formatPOL(statsRaw[0]),
      totalReceivedRaw: statsRaw[0],
      totalDistributed: formatPOL(statsRaw[1]),
      totalDistributedRaw: statsRaw[1],
      currentBalance: formatPOL(statsRaw[2]),
      currentBalanceRaw: statsRaw[2],
      lastDistribution: statsRaw[3] > 0n ? new Date(Number(statsRaw[3]) * 1000) : null,
      autoDistEnabled: statsRaw[4],
    } : null;

    // Parse getAllAllocations() - handle both tuple and named object
    const allocResult = multicallData?.[1];
    let allocRaw: readonly [bigint, bigint, bigint, bigint, bigint] | undefined;

    if (allocResult?.status === 'success' && allocResult.result) {
      const r = allocResult.result;
      if (Array.isArray(r)) {
        allocRaw = r as unknown as readonly [bigint, bigint, bigint, bigint, bigint];
      } else if (typeof r === 'object') {
        const obj = r as Record<string, unknown>;
        const rewards = (obj.rewardsAlloc ?? obj[0]) as bigint;
        const staking = (obj.stakingAlloc ?? obj[1]) as bigint;
        const marketplace = (obj.marketplaceAlloc ?? obj.marketPlaceAlloc ?? obj[2]) as bigint;
        const development = (obj.developmentAlloc ?? obj[3]) as bigint;
        const collaborators = (obj.collaboratorsAlloc ?? obj[4]) as bigint;
        if (rewards !== undefined) {
          allocRaw = [rewards, staking, marketplace, development, collaborators] as const;
        }
      }
    }
    const allocations: TreasuryAllocations | null = allocRaw ? (() => {
      const rewards = Number(allocRaw[0]);
      const staking = Number(allocRaw[1]);
      const marketplace = Number(allocRaw[2]);
      const development = Number(allocRaw[3]);
      const collaborators = Number(allocRaw[4]);
      const total = rewards + staking + marketplace + development + collaborators;

      return {
        rewards,
        staking,
        marketplace,
        development,
        collaborators,
        total,
        items: [
          { name: 'Rewards Pool', percentage: rewards, color: 'from-emerald-500 to-green-500', emoji: '🎁' },
          { name: 'Staking', percentage: staking, color: 'from-purple-500 to-indigo-500', emoji: '📈' },
          { name: 'Marketplace', percentage: marketplace, color: 'from-blue-500 to-cyan-500', emoji: '🏪' },
          { name: 'Development', percentage: development, color: 'from-orange-500 to-amber-500', emoji: '⚙️' },
          { name: 'Collaborators', percentage: collaborators, color: 'from-pink-500 to-rose-500', emoji: '🤝' },
        ].filter(item => item.percentage > 0),
      };
    })() : null;

    // Parse getReserveStats() - handle both tuple and named object
    const reserveResult = multicallData?.[2];
    let reserveRaw: readonly [bigint, bigint, bigint, bigint, boolean] | undefined;

    if (reserveResult?.status === 'success' && reserveResult.result) {
      const r = reserveResult.result;
      if (Array.isArray(r)) {
        reserveRaw = r as unknown as readonly [bigint, bigint, bigint, bigint, boolean];
      } else if (typeof r === 'object') {
        const obj = r as Record<string, unknown>;
        const currentBalance = (obj.currentBalance ?? obj[0]) as bigint;
        const totalAccumulated = (obj.totalAccumulated ?? obj[1]) as bigint;
        const totalWithdrawn = (obj.totalWithdrawn ?? obj[2]) as bigint;
        const allocPct = (obj.allocationPercentage ?? obj[3]) as bigint;
        const isEnabled = (obj.isEnabled ?? obj[4]) as boolean;
        if (currentBalance !== undefined) {
          reserveRaw = [currentBalance, totalAccumulated, totalWithdrawn, allocPct, isEnabled] as const;
        }
      }
    }
    const reserve: ReserveStats | null = reserveRaw ? (() => {
      const balanceRaw = reserveRaw[0];
      const balance = parseFloat(formatEther(balanceRaw));
      
      const getHealthInfo = (bal: number) => {
        if (bal >= 100000) return { level: 'Excellent' as const, color: 'text-emerald-400' };
        if (bal >= 50000) return { level: 'Healthy' as const, color: 'text-green-400' };
        if (bal >= 10000) return { level: 'Moderate' as const, color: 'text-yellow-400' };
        if (bal >= 1000) return { level: 'Low' as const, color: 'text-orange-400' };
        return { level: 'Critical' as const, color: 'text-red-400' };
      };
      
      const health = getHealthInfo(balance);

      return {
        currentBalance: formatPOL(balanceRaw),
        currentBalanceRaw: balanceRaw,
        totalAccumulated: formatPOL(reserveRaw[1]),
        totalWithdrawn: formatPOL(reserveRaw[2]),
        allocationPercentage: Number(reserveRaw[3]),
        isEnabled: reserveRaw[4],
        healthLevel: health.level,
        healthColor: health.color,
      };
    })() : null;

    return { stats, allocations, reserve, isLoading };
  }, [multicallData, isLoading]);

  // Check if contract address is not configured
  if (!TREASURY_ADDRESS || TREASURY_ADDRESS === undefined || (TREASURY_ADDRESS as unknown as string) === 'undefined') {
    console.warn('[useTreasuryStats] Contract not deployed - returning empty data');
    return {
      stats: null,
      allocations: null,
      reserve: null,
      isLoading: false,
    };
  }

  return result;
}

// ============================================
// HELPERS
// ============================================

function formatPOL(value: bigint, decimals = 2): string {
  if (!value || value === 0n) return '0.00';
  return parseFloat(formatEther(value)).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
}

export default useTreasuryStats;
