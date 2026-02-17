// Types for StakingContext
export interface PoolData {
  totalPoolBalance: bigint;
  uniqueUsersCount: bigint;
  isPaused: boolean;
  contractVersion: bigint;
  globalStats: {
    totalValueLocked: bigint;
    totalUniqueUsers: bigint;
    contractBalance: bigint;
    availableRewards: bigint;
    healthStatus: number;
    timestamp: bigint;
  } | null;
}

export interface UserStakingData {
  pendingRewards: bigint;
  totalDeposit: bigint;
  depositCount: number;
  hasDeposits: boolean;
}

export interface GamificationData {
  xp: bigint;
  level: number;
  badgeCount: number;
  hasAutoCompound: boolean;
}

export interface ProtocolHealthData {
  status: number;
  statusLabel: string;
  statusColor: string;
  isHealthy: boolean;
}

export interface AnalyticsData {
  withdrawalStatus: {
    canWithdraw: boolean;
    withdrawableRewards: bigint;
    lockedUntil: bigint;
    dailyLimitRemaining: bigint;
  };
  rewardsProjection: {
    hourly: bigint;
    daily: bigint;
    weekly: bigint;
    monthly: bigint;
    yearly: bigint;
  };
}

export interface StakingContextType {
  address: `0x${string}` | undefined;
  isConnected: boolean;
  hasValidConfig: boolean;
  stakingAddress: `0x${string}`;
  viewAddress: `0x${string}`;
  gamificationAddress: `0x${string}`;
  pool: PoolData;
  user: UserStakingData;
  gamification: GamificationData;
  protocolHealth: ProtocolHealthData;
  analytics: AnalyticsData;
  isLoading: boolean;
  isPoolLoading: boolean;
  isUserLoading: boolean;
  isGamifLoading: boolean;
  refetchAll: () => Promise<void>;
  refetchPool: () => Promise<void>;
  refetchUser: () => Promise<void>;
  previousLevel: number;
}
