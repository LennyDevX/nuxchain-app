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

// ── v6.2.0 New Types ──
export interface CircuitBreakerData {
  enabled: boolean;
  reserveRatio: bigint;
  isBlocked: boolean;
}

export interface ReferralData {
  referrer: `0x${string}` | null;
  totalReferralsMade: bigint;
  boostEndTime: bigint;
  boostActive: boolean;
  currentBoostBps: bigint;
}

export interface LockupAnalysisData {
  totalFlexible: bigint;
  totalLocked30: bigint;
  totalLocked90: bigint;
  totalLocked180: bigint;
  totalLocked365: bigint;
  nextUnlockAmount: bigint;
  nextUnlockTime: bigint;
}

export interface PoolHealthData {
  healthStatus: number;
  statusMessage: string;
  reserveRatio: bigint;
  description: string;
}

export interface StakingRatesInfo {
  lockupPeriods: readonly bigint[];
  hourlyROI: readonly bigint[];
  annualAPY: readonly bigint[];
  periodNames: readonly string[];
}

export interface StakingContextType {
  address: `0x${string}` | undefined;
  isConnected: boolean;
  hasValidConfig: boolean;
  stakingAddress: `0x${string}`;
  viewAddress: `0x${string}`;
  gamificationAddress: `0x${string}`;
  viewStatsAddress: `0x${string}`;
  pool: PoolData;
  user: UserStakingData;
  gamification: GamificationData;
  protocolHealth: ProtocolHealthData;
  analytics: AnalyticsData;
  circuitBreaker: CircuitBreakerData;
  referral: ReferralData;
  lockupAnalysis: LockupAnalysisData;
  poolHealth: PoolHealthData;
  stakingRates: StakingRatesInfo | null;
  reinvestmentPercentage: bigint;
  isLoading: boolean;
  isPoolLoading: boolean;
  isUserLoading: boolean;
  isGamifLoading: boolean;
  refetchAll: () => Promise<void>;
  refetchPool: () => Promise<void>;
  refetchUser: () => Promise<void>;
  previousLevel: number;
}
