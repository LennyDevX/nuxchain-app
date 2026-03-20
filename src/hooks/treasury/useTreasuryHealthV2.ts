/**
 * useTreasuryHealthV2 — React hook for TreasuryManager admin dashboard
 * 
 * Combines data from TreasuryManager and SmartStaking for a unified view.
 * Powered by wagmi's useReadContracts for efficiency and auto-refresh.
 */

import { useMemo } from 'react';
import { useReadContracts, useAccount } from 'wagmi';
import { formatEther } from 'viem';
import TreasuryManagerABIJSON from '../../abi/Treasury/TreasuryManager.json';
import EnhancedSmartStakingABIJSON from '../../abi/SmartStaking/EnhancedSmartStakingCoreV2.json';

const TreasuryManagerABI = TreasuryManagerABIJSON.abi;
const SmartStakingABI = EnhancedSmartStakingABIJSON.abi;

const TREASURY_MANAGER = import.meta.env.VITE_TREASURY_MANAGER_ADDRESS as `0x${string}`;
const SMART_STAKING = import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS as `0x${string}`;

export enum ProtocolStatus {
  HEALTHY = 0,
  UNSTABLE = 1,
  CRITICAL = 2,
  EMERGENCY = 3,
}

const PROTOCOL_LABELS = ['Healthy', 'Unstable', 'Critical', 'Emergency'];
const TREASURY_LABELS = ['Rewards', 'Staking', 'Collaborators', 'Development', 'Marketplace'];

export interface TreasuryV2Data {
  healthScore: number;
  status: 'Normal' | 'Emergency' | 'Critical';
  
  // Balances
  totalBalance: bigint;
  availableBalance: bigint;
  reserveBalance: bigint;
  totalReceived: bigint;
  totalDistributed: bigint;
  
  // Reserve
  reserveAccumulated: bigint;
  reserveWithdrawn: bigint;
  reservePct: number;
  reserveEnabled: boolean;
  
  // Timeline
  nextDistributionSecs: number;
  isDistributionReady: boolean;
  lastDistributionTime: number;
  
  // Allocations
  allocations: {
    name: string;
    value: number; // percentage
    address: string;
    status: ProtocolStatus;
    deficit: bigint;
  }[];
  
  // Metadata
  isPaused: boolean;
  isStakingLinked: boolean;
  ownerAddress: string;
}

export function useTreasuryHealthV2() {
  const { chain } = useAccount();

  const { data, isLoading, isError, refetch } = useReadContracts({
    contracts: [
      // Treasury Stats
      { address: TREASURY_MANAGER, abi: TreasuryManagerABI as any, functionName: 'getStats' },
      { address: TREASURY_MANAGER, abi: TreasuryManagerABI as any, functionName: 'getReserveStats' },
      { address: TREASURY_MANAGER, abi: TreasuryManagerABI as any, functionName: 'getDistributionTimeline' },
      { address: TREASURY_MANAGER, abi: TreasuryManagerABI as any, functionName: 'getAllAllocations' },
      { address: TREASURY_MANAGER, abi: TreasuryManagerABI as any, functionName: 'emergencyModeEnabled' },
      // Individual status (parallel reading for each pool type)
      { address: TREASURY_MANAGER, abi: TreasuryManagerABI as any, functionName: 'getProtocolStatus', args: [0] },
      { address: TREASURY_MANAGER, abi: TreasuryManagerABI as any, functionName: 'getProtocolStatus', args: [1] },
      { address: TREASURY_MANAGER, abi: TreasuryManagerABI as any, functionName: 'getProtocolStatus', args: [2] },
      { address: TREASURY_MANAGER, abi: TreasuryManagerABI as any, functionName: 'getProtocolStatus', args: [3] },
      { address: TREASURY_MANAGER, abi: TreasuryManagerABI as any, functionName: 'getProtocolStatus', args: [4] },
      // Staking Check
      { address: SMART_STAKING, abi: SmartStakingABI as any, functionName: 'treasuryManager' },
      { address: SMART_STAKING, abi: SmartStakingABI as any, functionName: 'paused' },
      { address: SMART_STAKING, abi: SmartStakingABI as any, functionName: 'owner' },
      // Sub-treasury addresses (indices 13-17)
      { address: TREASURY_MANAGER, abi: TreasuryManagerABI as any, functionName: 'getTreasuryConfig', args: [0] },
      { address: TREASURY_MANAGER, abi: TreasuryManagerABI as any, functionName: 'getTreasuryConfig', args: [1] },
      { address: TREASURY_MANAGER, abi: TreasuryManagerABI as any, functionName: 'getTreasuryConfig', args: [2] },
      { address: TREASURY_MANAGER, abi: TreasuryManagerABI as any, functionName: 'getTreasuryConfig', args: [3] },
      { address: TREASURY_MANAGER, abi: TreasuryManagerABI as any, functionName: 'getTreasuryConfig', args: [4] },
    ],
    query: {
      refetchInterval: 30_000,
    }
  });

  const parsedData = useMemo(() => {
    if (!data) return null;

    const stats = data[0].result as any;
    const reserve = data[1].result as any;
    const timeline = data[2].result as any;
    const allocs = data[3].result as any;
    const emergency = data[4].result as any;
    
    // Statuses
    const s0 = data[5].result as any;
    const s1 = data[6].result as any;
    const s2 = data[7].result as any;
    const s3 = data[8].result as any;
    const s4 = data[9].result as any;

    const stakingLink = data[10].result as string;
    const isPaused = data[11].result as boolean;
    const owner = data[12].result as string;

    // Sub-treasury addresses from getTreasuryConfig(i) — [address, allocation]
    const cfgs = [data[13], data[14], data[15], data[16], data[17]].map(
      (r) => (r?.result as [string, bigint] | undefined)
    );

    const isStakingLinked = stakingLink?.toLowerCase() === TREASURY_MANAGER.toLowerCase();

    // Map allocations
    const allocations = TREASURY_LABELS.map((name, i) => {
      const statusData = [s0, s1, s2, s3, s4][i];
      return {
        name,
        value: Number(allocs?.[i] ?? 0) / 100,
        address: cfgs[i]?.[0] ?? '',
        status: Number(statusData?.[0] ?? 0) as ProtocolStatus,
        deficit: BigInt(statusData?.[1] ?? 0),
      };
    });

    // Score calculation
    let score = 100;
    if (emergency) score -= 40;
    if (!isStakingLinked) score -= 10;
    if (allocations.some(a => a.status >= 2)) score -= 20;

    const result: TreasuryV2Data = {
      healthScore: Math.max(0, score),
      status: emergency ? 'Emergency' : (score < 70 ? 'Critical' : 'Normal'),
      
      totalBalance: BigInt(stats?.[2] ?? 0),
      availableBalance: BigInt(stats?.[3] ?? 0),
      reserveBalance: BigInt(reserve?.[0] ?? 0),
      totalReceived: BigInt(stats?.[0] ?? 0),
      totalDistributed: BigInt(stats?.[1] ?? 0),
      
      reserveAccumulated: BigInt(reserve?.[1] ?? 0),
      reserveWithdrawn: BigInt(reserve?.[2] ?? 0),
      reservePct: Number(reserve?.[3] ?? 0) / 100,
      reserveEnabled: Boolean(reserve?.[4]),
      
      nextDistributionSecs: Number(timeline?.[3] ?? 0),
      isDistributionReady: Boolean(timeline?.[4]),
      lastDistributionTime: Number(timeline?.[1] ?? 0),
      
      allocations,
      
      isPaused: Boolean(isPaused),
      isStakingLinked,
      ownerAddress: owner || '',
    };

    return result;
  }, [data]);

  return {
    data: parsedData,
    isLoading,
    isError,
    refetch,
    contractAddresses: {
      treasury: TREASURY_MANAGER,
      staking: SMART_STAKING,
    }
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function formatPOL(wei: bigint | undefined, dp = 2): string {
  if (wei === undefined) return '0.00';
  const eth = formatEther(wei);
  return parseFloat(eth).toLocaleString(undefined, { 
    minimumFractionDigits: dp, 
    maximumFractionDigits: dp 
  });
}

export function getStatusColor(status: ProtocolStatus | string): string {
  if (typeof status === 'string') {
    if (status === 'Emergency') return '#ef4444';
    if (status === 'Critical') return '#f59e0b';
    return '#10b981';
  }
  
  switch (status) {
    case ProtocolStatus.HEALTHY: return '#10b981';
    case ProtocolStatus.UNSTABLE: return '#f59e0b';
    case ProtocolStatus.CRITICAL: return '#ef4444';
    case ProtocolStatus.EMERGENCY: return '#7c3aed';
    default: return '#94a3b8';
  }
}

export function getHealthColor(score: number): string {
  if (score >= 80) return '#10b981'; // Green
  if (score >= 50) return '#f59e0b'; // Amber
  return '#ef4444'; // Red
}

export function formatTimeLeft(secs: number): string {
  if (secs <= 0) return 'Ready';
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  return `${h}h ${m}m`;
}
