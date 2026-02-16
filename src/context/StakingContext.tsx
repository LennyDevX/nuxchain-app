/**
 * StakingContext - Centralized staking state provider
 * Shares pool data, user data, and gamification state across all staking components
 * Eliminates prop drilling and provides a global refetch mechanism
 */

import {
  createContext,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import { useAccount, useReadContracts } from 'wagmi';
import type { Abi } from 'viem';
import EnhancedSmartStakingABI from '../abi/SmartStaking/EnhancedSmartStakingCoreV2.json';
import EnhancedSmartStakingViewABI from '../abi/SmartStaking/EnhancedSmartStakingView.json';
import EnhancedSmartStakingGamificationABI from '../abi/SmartStaking/EnhancedSmartStakingGamification.json';

// ============================================
// CONTRACT ADDRESSES
// ============================================

const STAKING_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS as `0x${string}`;
const VIEW_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_VIEWER_ADDRESS as `0x${string}`;
const GAMIFICATION_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_GAMIFICATION_ADDRESS as `0x${string}`;

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface PoolData {
  totalPoolBalance: bigint;
  uniqueUsersCount: bigint;
  isPaused: boolean;
  contractVersion: bigint;
}

export interface UserStakingData {
  totalDeposit: bigint;
  pendingRewards: bigint;
  depositCount: number;
  hasDeposits: boolean;
}

export interface UserGamificationData {
  currentXP: bigint;
  currentLevel: number;
  xpForNextLevel: bigint;
  xpProgress: number;
  totalXPEarned: bigint;
  badgeCount: number;
  hasAutoCompound: boolean;
}

export interface ProtocolHealthData {
  status: number;
  statusLabel: string;
  statusColor: string;
  isHealthy: boolean;
}

export interface StakingContextType {
  // Connection
  address: `0x${string}` | undefined;
  isConnected: boolean;

  // Contract config
  hasValidConfig: boolean;
  stakingAddress: `0x${string}`;
  viewAddress: `0x${string}`;
  gamificationAddress: `0x${string}`;

  // Pool data (shared across all components)
  pool: PoolData;

  // User data
  user: UserStakingData;

  // Gamification data
  gamification: UserGamificationData;

  // Protocol health
  protocolHealth: ProtocolHealthData;

  // Loading states
  isLoading: boolean;
  isPoolLoading: boolean;

  // Refetch
  refetchAll: () => Promise<void>;
  refetchPool: () => Promise<void>;
  refetchUser: () => Promise<void>;

  // Previous level (for level-up detection)
  previousLevel: number;
}

// ============================================
// DEFAULT VALUES
// ============================================

const DEFAULT_POOL: PoolData = {
  totalPoolBalance: 0n,
  uniqueUsersCount: 0n,
  isPaused: false,
  contractVersion: 0n,
};

const DEFAULT_USER: UserStakingData = {
  totalDeposit: 0n,
  pendingRewards: 0n,
  depositCount: 0,
  hasDeposits: false,
};

const DEFAULT_GAMIFICATION: UserGamificationData = {
  currentXP: 0n,
  currentLevel: 0,
  xpForNextLevel: 1000n,
  xpProgress: 0,
  totalXPEarned: 0n,
  badgeCount: 0,
  hasAutoCompound: false,
};

const DEFAULT_HEALTH: ProtocolHealthData = {
  status: 0,
  statusLabel: 'Unknown',
  statusColor: 'text-gray-500',
  isHealthy: false,
};

// ============================================
// CONTEXT
// ============================================

const StakingContext = createContext<StakingContextType | null>(null);

// ============================================
// PROVIDER
// ============================================

export function StakingProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const previousLevelRef = useRef(0);

  // Validate contract configuration
  const hasValidConfig = useMemo(() => {
    return Boolean(
      STAKING_ADDRESS &&
      STAKING_ADDRESS !== '0x0000000000000000000000000000000000000000' &&
      STAKING_ADDRESS.startsWith('0x')
    );
  }, []);

  // ── Pool Data Multicall ──
  const poolConfig = useMemo(() => ({
    address: STAKING_ADDRESS,
    abi: EnhancedSmartStakingABI.abi as Abi,
  }), []);

  const { data: poolData, isLoading: isPoolLoading, refetch: refetchPoolRaw } = useReadContracts({
    contracts: [
      { ...poolConfig, functionName: 'totalPoolBalance' },
      { ...poolConfig, functionName: 'uniqueUsersCount' },
      { ...poolConfig, functionName: 'paused' },
      { ...poolConfig, functionName: 'getContractVersion' },
    ],
    query: {
      enabled: hasValidConfig,
      staleTime: 60000, // 1 minute for pool data
      gcTime: 5 * 60 * 1000,
      refetchInterval: false,
      refetchOnWindowFocus: false,
    },
  });

  // ── User Data Multicall ──
  const viewConfig = useMemo(() => ({
    address: VIEW_ADDRESS,
    abi: EnhancedSmartStakingViewABI.abi as Abi,
  }), []);

  const { data: userData, isLoading: isUserLoading, refetch: refetchUserRaw } = useReadContracts({
    contracts: [
      { ...poolConfig, functionName: 'calculateRewards', args: [address] },
      { ...viewConfig, functionName: 'getTotalDeposit', args: [address] },
      { ...poolConfig, functionName: 'getUserDeposits', args: [address] },
    ],
    query: {
      enabled: !!address && isConnected && hasValidConfig,
      staleTime: 30000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  });

  // ── Gamification Data Multicall ──
  const gamifConfig = useMemo(() => ({
    address: GAMIFICATION_ADDRESS,
    abi: EnhancedSmartStakingGamificationABI.abi as Abi,
  }), []);

  const { data: gamifData, isLoading: isGamifLoading, refetch: refetchGamifRaw } = useReadContracts({
    contracts: [
      { ...gamifConfig, functionName: 'getUserXPInfo', args: [address] },
      { ...gamifConfig, functionName: 'getUserBadgeCount', args: [address] },
      { ...gamifConfig, functionName: 'getAutoCompoundConfig', args: [address] },
      { ...gamifConfig, functionName: 'getProtocolHealth' },
    ],
    query: {
      enabled: !!address && isConnected && hasValidConfig,
      staleTime: 45000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  });

  // ── Parse Pool Data ──
  const pool = useMemo((): PoolData => {
    if (!poolData) return DEFAULT_POOL;
    return {
      totalPoolBalance: (poolData[0]?.result as bigint) || 0n,
      uniqueUsersCount: (poolData[1]?.result as bigint) || 0n,
      isPaused: (poolData[2]?.result as boolean) || false,
      contractVersion: (poolData[3]?.result as bigint) || 0n,
    };
  }, [poolData]);

  // ── Parse User Data ──
  const user = useMemo((): UserStakingData => {
    if (!userData) return DEFAULT_USER;

    const pendingRewards = (userData[0]?.result as bigint) || 0n;
    const totalDeposit = (userData[1]?.result as bigint) || 0n;
    const deposits = userData[2]?.result;
    const depositCount = Array.isArray(deposits) ? deposits.length : 0;

    return {
      pendingRewards,
      totalDeposit,
      depositCount,
      hasDeposits: totalDeposit > 0n,
    };
  }, [userData]);

  // ── Parse Gamification Data ──
  const gamification = useMemo((): UserGamificationData => {
    if (!gamifData) return DEFAULT_GAMIFICATION;

    // XP Info
    const xpRaw = gamifData[0]?.result as {
      currentXP?: bigint;
      currentLevel?: bigint;
      xpForNextLevel?: bigint;
      totalXPEarned?: bigint;
    } | undefined;

    const currentXP = xpRaw?.currentXP || 0n;
    const xpForNext = xpRaw?.xpForNextLevel || 1000n;
    const progress = xpForNext > 0n ? Number((currentXP * 100n) / xpForNext) : 0;

    // Badge count
    const badgeCount = Number(gamifData[1]?.result || 0);

    // Auto-compound
    const autoCompound = gamifData[2]?.result as { isEnabled?: boolean } | undefined;

    return {
      currentXP,
      currentLevel: Number(xpRaw?.currentLevel || 0),
      xpForNextLevel: xpForNext,
      xpProgress: Math.min(100, progress),
      totalXPEarned: xpRaw?.totalXPEarned || 0n,
      badgeCount,
      hasAutoCompound: Boolean(autoCompound?.isEnabled),
    };
  }, [gamifData]);

  // ── Parse Protocol Health ──
  const protocolHealth = useMemo((): ProtocolHealthData => {
    if (!gamifData?.[3]?.result) return DEFAULT_HEALTH;

    const data = gamifData[3].result as { status?: number };
    const status = Number(data.status || 0);

    const labels: Record<number, { label: string; color: string }> = {
      0: { label: 'Critical', color: 'text-red-500' },
      1: { label: 'Low', color: 'text-orange-500' },
      2: { label: 'Moderate', color: 'text-yellow-500' },
      3: { label: 'Healthy', color: 'text-emerald-500' },
      4: { label: 'Excellent', color: 'text-green-400' },
    };

    const info = labels[status] || { label: 'Unknown', color: 'text-gray-500' };
    return {
      status,
      statusLabel: info.label,
      statusColor: info.color,
      isHealthy: status >= 2,
    };
  }, [gamifData]);

  // ── Track previous level for level-up detection ──
  useEffect(() => {
    if (gamification.currentLevel > 0) {
      previousLevelRef.current = gamification.currentLevel;
    }
  }, [gamification.currentLevel]);

  // ── Refetch Functions ──
  const refetchPool = useCallback(async () => {
    await refetchPoolRaw();
  }, [refetchPoolRaw]);

  const refetchUser = useCallback(async () => {
    await refetchUserRaw();
    await refetchGamifRaw();
  }, [refetchUserRaw, refetchGamifRaw]);

  const refetchAll = useCallback(async () => {
    await Promise.all([refetchPoolRaw(), refetchUserRaw(), refetchGamifRaw()]);
  }, [refetchPoolRaw, refetchUserRaw, refetchGamifRaw]);

  // ── Context Value ──
  const value = useMemo<StakingContextType>(() => ({
    address,
    isConnected,
    hasValidConfig,
    stakingAddress: STAKING_ADDRESS,
    viewAddress: VIEW_ADDRESS,
    gamificationAddress: GAMIFICATION_ADDRESS,
    pool,
    user,
    gamification,
    protocolHealth,
    isLoading: isPoolLoading || isUserLoading || isGamifLoading,
    isPoolLoading,
    refetchAll,
    refetchPool,
    refetchUser,
    previousLevel: previousLevelRef.current,
  }), [
    address,
    isConnected,
    hasValidConfig,
    pool,
    user,
    gamification,
    protocolHealth,
    isPoolLoading,
    isUserLoading,
    isGamifLoading,
    refetchAll,
    refetchPool,
    refetchUser,
  ]);

  return (
    <StakingContext.Provider value={value}>
      {children}
    </StakingContext.Provider>
  );
}

export default StakingContext;
