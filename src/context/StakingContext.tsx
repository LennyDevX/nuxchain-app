import { useMemo, useRef, useEffect, type ReactNode } from 'react';
import { useAccount, useReadContracts } from 'wagmi';
import type { Abi } from 'viem';
import EnhancedSmartStakingABI from '../abi/SmartStaking/EnhancedSmartStakingCoreV2.json';
import EnhancedSmartStakingViewABI from '../abi/SmartStaking/EnhancedSmartStakingView.json';
import EnhancedSmartStakingGamificationABI from '../abi/SmartStaking/EnhancedSmartStakingGamification.json';
import { StakingContext } from './StakingContextDefinition';
import type { StakingContextType, PoolData, UserStakingData, GamificationData, ProtocolHealthData, AnalyticsData } from './StakingContext.types';

// ============================================
// CONSTANTS
// ============================================

const STAKING_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS as `0x${string}`;
const VIEW_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_VIEWER_ADDRESS as `0x${string}`;
const GAMIFICATION_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_GAMIFICATION_ADDRESS as `0x${string}`;

// ============================================
// DEFAULTS
// ============================================

const DEFAULT_POOL: PoolData = {
  totalPoolBalance: 0n,
  uniqueUsersCount: 0n,
  isPaused: false,
  contractVersion: 0n,
  globalStats: null,
};

const DEFAULT_USER: UserStakingData = {
  pendingRewards: 0n,
  totalDeposit: 0n,
  depositCount: 0,
  hasDeposits: false,
};

const DEFAULT_GAMIFICATION: GamificationData = {
  xp: 0n,
  level: 1,
  badgeCount: 0,
  hasAutoCompound: false,
};

const DEFAULT_HEALTH: ProtocolHealthData = {
  status: 0,
  statusLabel: 'Unknown',
  statusColor: 'text-gray-500',
  isHealthy: false,
};

const DEFAULT_ANALYTICS: AnalyticsData = {
  withdrawalStatus: {
    canWithdraw: false,
    withdrawableRewards: 0n,
    lockedUntil: 0n,
    dailyLimitRemaining: 0n,
  },
  rewardsProjection: {
    hourly: 0n,
    daily: 0n,
    weekly: 0n,
    monthly: 0n,
    yearly: 0n,
  },
};

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

  // ── Configs ──
  const poolConfig = useMemo(() => ({
    address: STAKING_ADDRESS,
    abi: EnhancedSmartStakingABI.abi as Abi,
  }), []);

  const viewConfig = useMemo(() => ({
    address: VIEW_ADDRESS,
    abi: EnhancedSmartStakingViewABI.abi as Abi,
  }), []);

  // ── Pool Data Multicall ──
  const { data: poolData, isLoading: isPoolLoading, refetch: refetchPoolRaw } = useReadContracts({
    contracts: [
      { ...poolConfig, functionName: 'totalPoolBalance' },
      { ...poolConfig, functionName: 'uniqueUsersCount' },
      { ...poolConfig, functionName: 'paused' },
      { ...poolConfig, functionName: 'getContractVersion' },
      { ...viewConfig, functionName: 'getGlobalStats' },
    ],
    query: {
      enabled: hasValidConfig,
      staleTime: 60000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  });

  useEffect(() => {
    if (poolData) {
      const results = poolData.map((d, i) => ({
        func: ['totalPoolBalance', 'uniqueUsersCount', 'paused', 'getContractVersion', 'getGlobalStats'][i],
        status: d.status,
      }));
      console.warn('[StakingContext] Pool Multicall Results:', results);
    }
  }, [poolData]);

  // ── User Data Multicall ──
  const { data: userData, isLoading: isUserLoading, refetch: refetchUserRaw } = useReadContracts({
    contracts: [
      { ...viewConfig, functionName: 'getDashboardUserSummary', args: [address] },
      { ...viewConfig, functionName: 'getWithdrawalStatus', args: [address] },
      { ...viewConfig, functionName: 'getUserRewardsProjection', args: [address] },
      { ...viewConfig, functionName: 'getUserDeposits', args: [address] },
    ],
    query: {
      enabled: !!address && isConnected && hasValidConfig,
      staleTime: 30000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  });

  useEffect(() => {
    if (userData) {
      const summary = userData.map((d, i) => {
        const name = ['Summary', 'Withdrawal', 'Projection', 'Deposits'][i];
        let detail = 'N/A';
        if (d.status === 'success') {
          if (Array.isArray(d.result)) detail = `Array(${d.result.length})`;
          else if (typeof d.result === 'object') detail = 'Object';
          else detail = String(d.result);
        }
        return `${name}: ${d.status} (${detail})`;
      }).join(' | ');
      console.warn('[StakingContext] User Data Batch:', summary);

      const results = userData.map((d, i) => ({
        func: ['getDashboardUserSummary', 'getWithdrawalStatus', 'getUserRewardsProjection', 'getUserDeposits'][i],
        status: d.status,
        result: d.result,
      }));
      console.log('[StakingContext] User Multicall Raw:', JSON.parse(JSON.stringify(results, (_, v) => typeof v === 'bigint' ? v.toString() : v)));
    }
  }, [userData]);

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

    const globalStatsRaw = poolData[4]?.result as {
      totalValueLocked?: number;
      totalUniqueUsers?: number;
      contractBalance?: number;
      availableRewards?: number;
      healthStatus?: number;
      timestamp?: number;
    } | Array<number> | undefined;

    let globalStats = null;

    if (globalStatsRaw) {
      if (Array.isArray(globalStatsRaw)) {
        globalStats = {
          totalValueLocked: BigInt(globalStatsRaw[0] || 0),
          totalUniqueUsers: BigInt(globalStatsRaw[1] || 0),
          contractBalance: BigInt(globalStatsRaw[2] || 0),
          availableRewards: BigInt(globalStatsRaw[3] || 0),
          healthStatus: Number(globalStatsRaw[4] || 0),
          timestamp: BigInt(globalStatsRaw[5] || 0),
        };
      } else {
        globalStats = {
          totalValueLocked: BigInt(globalStatsRaw.totalValueLocked || 0),
          totalUniqueUsers: BigInt(globalStatsRaw.totalUniqueUsers || 0),
          contractBalance: BigInt(globalStatsRaw.contractBalance || 0),
          availableRewards: BigInt(globalStatsRaw.availableRewards || 0),
          healthStatus: Number(globalStatsRaw.healthStatus || 0),
          timestamp: BigInt(globalStatsRaw.timestamp || 0),
        };
      }
    }

    return {
      totalPoolBalance: (poolData[0]?.result as bigint) || 0n,
      uniqueUsersCount: (poolData[1]?.result as bigint) || 0n,
      isPaused: (poolData[2]?.result as boolean) || false,
      contractVersion: (poolData[3]?.result as bigint) || 0n,
      globalStats,
    };
  }, [poolData]);

  // ── Parse User Data ──
  const user = useMemo((): UserStakingData => {
    if (!userData) return DEFAULT_USER;

    // dashboardSummary: [userStaked, userPendingRewards, userDepositCount, userFlexibleBalance, userLockedBalance, userUnlockedBalance]
    const dashboardSummary = userData[0]?.result as [bigint, bigint, number, bigint, bigint, bigint] | undefined;
    const depositsRaw = userData[3]?.result as Array<{
      depositId: string;
      amount: number;
      timestamp: number;
    }> | undefined;

    return {
      totalDeposit: BigInt(dashboardSummary?.[0] || 0),
      pendingRewards: BigInt(dashboardSummary?.[1] || 0),
      depositCount: Number(dashboardSummary?.[2] || depositsRaw?.length || 0),
      hasDeposits: BigInt(dashboardSummary?.[0] || 0) > 0n,
    };
  }, [userData]);

  // ── Parse Gamification Data ──
  const gamification = useMemo((): GamificationData => {
    if (!gamifData) return DEFAULT_GAMIFICATION;

    const xpInfo = gamifData[0]?.result as [bigint, number] | undefined;
    const badgeCount = Number(gamifData[1]?.result || 0);
    const hasAutoCompound = Boolean(gamifData[2]?.result);

    return {
      xp: BigInt(xpInfo?.[0] || 0),
      level: Number(xpInfo?.[1] || 1),
      badgeCount,
      hasAutoCompound,
    };
  }, [gamifData]);

  // ── Parse Analytics Data ──
  const analytics = useMemo((): AnalyticsData => {
    if (!userData) return DEFAULT_ANALYTICS;

    // Withdrawal status parsing (userData[1])
    const withdrawalRaw = userData[1]?.result as [boolean, bigint, bigint, bigint] | { canWithdraw: boolean; withdrawableRewards: bigint; lockedUntil: bigint; dailyLimitRemaining: bigint } | undefined;
    let withdrawalStatus = DEFAULT_ANALYTICS.withdrawalStatus;
    if (withdrawalRaw) {
      if (Array.isArray(withdrawalRaw)) {
        withdrawalStatus = {
          canWithdraw: Boolean(withdrawalRaw[0]),
          withdrawableRewards: BigInt(withdrawalRaw[1] || 0),
          lockedUntil: BigInt(withdrawalRaw[2] || 0),
          dailyLimitRemaining: BigInt(withdrawalRaw[3] || 0),
        };
      } else if (typeof withdrawalRaw === 'object') {
        withdrawalStatus = {
          canWithdraw: Boolean(withdrawalRaw.canWithdraw),
          withdrawableRewards: BigInt(withdrawalRaw.withdrawableRewards || 0),
          lockedUntil: BigInt(withdrawalRaw.lockedUntil || 0),
          dailyLimitRemaining: BigInt(withdrawalRaw.dailyLimitRemaining || 0),
        };
      }
    }

    // Projection parsing (userData[2])
    // Contract returns UserRewardsProjection struct: { hourlyRewards, dailyRewards, weeklyRewards, monthlyRewards, yearlyRewards, currentPendingRewards }
    const projectionRaw = userData[2]?.result;
    const projectionStatus = userData[2]?.status;
    let rewardsProjection = DEFAULT_ANALYTICS.rewardsProjection;
    
    if (projectionStatus === 'success' && projectionRaw) {
      // Wagmi returns tuples as both array-like and object-like
      const proj = projectionRaw as Record<string, bigint> & Array<bigint>;
      
      // Check if we have valid projection data
      const hasValidData = (proj.hourlyRewards !== undefined && proj.hourlyRewards > 0n) || 
                          (proj[0] !== undefined && proj[0] > 0n);
      
      if (hasValidData) {
        rewardsProjection = {
          hourly: BigInt(proj.hourlyRewards || proj[0] || 0),
          daily: BigInt(proj.dailyRewards || proj[1] || 0),
          weekly: BigInt(proj.weeklyRewards || proj[2] || 0),
          monthly: BigInt(proj.monthlyRewards || proj[3] || 0),
          yearly: BigInt(proj.yearlyRewards || proj[4] || 0),
        };
        
        console.log('[StakingContext] Projection from contract:', {
          hourly: rewardsProjection.hourly.toString(),
          daily: rewardsProjection.daily.toString(),
          yearly: rewardsProjection.yearly.toString(),
        });
      } else {
        // Contract returned success but with zeros - calculate fallback
        rewardsProjection = calculateFallback();
      }
    } else {
      // Contract call failed - use fallback calculation
      console.warn('[StakingContext] Projection failed, using fallback:', {
        status: projectionStatus,
        hasData: !!projectionRaw,
      });
      rewardsProjection = calculateFallback();
    }

    // Helper function to calculate projection from deposits and APY
    function calculateFallback() {
      if (!userData) return DEFAULT_ANALYTICS.rewardsProjection;
      
      // Get user's total deposit
      const dashboardSummary = userData[0]?.result as [bigint, bigint, number, bigint, bigint, bigint] | undefined;
      const totalStake = BigInt(dashboardSummary?.[0] || 0);
      
      if (totalStake === 0n) {
        return DEFAULT_ANALYTICS.rewardsProjection;
      }
      
      // Get deposit details to calculate weighted APY
      const depositsData = userData[3]?.result as { 
        deposits?: Array<{
          amount?: bigint;
          lockupDuration?: bigint;
        }>;
      } | undefined;
      
      let weightedAPY = 1970n; // Default base APY: 19.7%
      
      // Calculate weighted APY considering lockup bonuses
      if (depositsData?.deposits && depositsData.deposits.length > 0) {
        let totalWeightedAPY = 0n;
        let totalAmount = 0n;
        
        for (const dep of depositsData.deposits) {
          const amount = dep.amount || 0n;
          const lockupDuration = dep.lockupDuration || 0n;
          
          // Determine APY based on lockup duration
          let apy = 1970n; // Base 19.7%
          
          if (lockupDuration >= 31536000n) { // 365 days
            apy = 2970n; // 29.7% (19.7% + 10%)
          } else if (lockupDuration >= 15552000n) { // 180 days
            apy = 2660n; // 26.6% (19.7% + 6.9%)
          } else if (lockupDuration >= 7776000n) { // 90 days
            apy = 2370n; // 23.7% (19.7% + 4%)
          } else if (lockupDuration >= 2592000n) { // 30 days
            apy = 2170n; // 21.7% (19.7% + 2%)
          }
          
          totalWeightedAPY += amount * apy;
          totalAmount += amount;
        }
        
        if (totalAmount > 0n) {
          weightedAPY = totalWeightedAPY / totalAmount;
        }
      }
      
      // Calculate projections based on weighted APY
      const yearlyReward = (totalStake * weightedAPY) / 10000n;
      const dailyReward = yearlyReward / 365n;
      const hourlyReward = dailyReward / 24n;
      const weeklyReward = dailyReward * 7n;
      const monthlyReward = dailyReward * 30n;
      
      console.log('[StakingContext] Fallback projection calculated:', {
        totalStake: totalStake.toString(),
        weightedAPY: `${Number(weightedAPY) / 100}%`,
        daily: dailyReward.toString(),
        yearly: yearlyReward.toString(),
      });
      
      return {
        hourly: hourlyReward,
        daily: dailyReward,
        weekly: weeklyReward,
        monthly: monthlyReward,
        yearly: yearlyReward,
      };
    }

    return {
      withdrawalStatus,
      rewardsProjection,
    };
  }, [userData]);

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

  // Update previous level ref
  useEffect(() => {
    if (gamification.level > 1) {
      previousLevelRef.current = gamification.level;
    }
  }, [gamification.level]);

  useEffect(() => {
    if (user.hasDeposits) {
      console.warn('[StakingContext] User has deposits, count:', user.depositCount);
      console.log('[StakingContext] Parsed User State:', user);
    }
  }, [user]);

  // ── Actions ──
  const refetchAll = async () => {
    await Promise.all([
      refetchPoolRaw(),
      refetchUserRaw(),
      refetchGamifRaw(),
    ]);
  };

  const refetchPool = async () => {
    await refetchPoolRaw();
  };

  const refetchUser = async () => {
    await refetchUserRaw();
  };

  const contextValue: StakingContextType = {
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
    analytics,
    isLoading: isPoolLoading || isUserLoading || isGamifLoading,
    isPoolLoading,
    isUserLoading,
    isGamifLoading,
    refetchAll,
    refetchPool,
    refetchUser,
    previousLevel: previousLevelRef.current,
  };

  return (
    <StakingContext.Provider value={contextValue}>
      {children}
    </StakingContext.Provider>
  );
}

// useStakingContext hook is exported from useStakingContext.ts to comply with fast refresh rules
