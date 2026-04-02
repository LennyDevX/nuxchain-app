/**
 * 🔗 Blockchain Service for Vercel Serverless
 * ============================================
 * Provides blockchain data functions for Gemini Function Calling.
 * - POL price from CoinGecko/Binance/DIA (cached 60s)
 * - Staking info from smart contract via Viem (cached 60s)
 * - NFT listings from smart contract via Viem (cached 60s)
 * - Wallet balance from Polygon via Viem (cached 30s)
 * - Staking rewards estimation (cached 60s)
 * 
 * @module blockchain-service
 * @version 1.0.0
 */

import { createPublicClient, http, formatEther, type Address } from 'viem';
import { polygon } from 'viem/chains';

// ============================================================================
// TYPES
// ============================================================================

export interface POLPriceResult {
  success: boolean;
  price?: number | null;
  change24h?: number | null;
  marketCap?: number | null;
  volume24h?: number | null;
  lastUpdated?: string;
  error?: string;
  cached?: boolean;
  note?: string;
}

export interface StakingInfoResult {
  success: boolean;
  totalStaked?: string;
  totalStakedUSD?: number;
  apy?: number;
  apyRates?: {
    flexible: number;
    locked30: number;
    locked90: number;
    locked180: number;
    locked365: number;
  };
  totalParticipants?: number;
  totalRewardsPaid?: string;
  contractAddress?: string;
  lastUpdated?: string;
  error?: string;
  cached?: boolean;
  note?: string;
}

export interface NFTListingsResult {
  success: boolean;
  totalListings?: number;
  activeListings?: NFTListing[];
  floorPrice?: string;
  totalVolume?: string;
  contractAddress?: string;
  error?: string;
  cached?: boolean;
  note?: string;
}

export interface NFTListing {
  tokenId: string;
  price: string;
  seller: string;
  name?: string;
  rarity?: string;
}

export interface WalletBalanceResult {
  success: boolean;
  address?: string;
  balancePOL?: string;
  balanceUSD?: number;
  stakedAmount?: string;
  pendingRewards?: string;
  nftCount?: number;
  error?: string;
  cached?: boolean;
  source?: string;
  staking?: UserStakingPositionResult;
}

export interface UserStakingPositionResult {
  success: boolean;
  address?: string;
  totalDepositedPOL?: string;
  depositCount?: number;
  pendingRewardsPOL?: string;
  baseRewardsPOL?: string;
  boostedRewardsPOL?: string;
  hasAutoCompound?: boolean;
  userLevel?: number;
  userXP?: number;
  activeSkills?: string;
  stakingBoostTotal?: number;
  lastWithdrawTime?: string | null;
  nextUnlockTime?: string | null;
  apyRates?: {
    flexible: number;
    locked30: number;
    locked90: number;
    locked180: number;
    locked365: number;
  };
  depositSummary?: Record<string, { label: string; count: number; withdrawableCount: number; totalAmountPOL: number }>;
  recommendations?: string[];
  contractAddress?: string;
  error?: string;
  note?: string;
  cached?: boolean;
  source?: string;
}

export interface StakingRewardEstimate {
  success: boolean;
  amount?: string;
  duration?: string;
  estimatedReward?: string;
  estimatedRewardUSD?: number;
  apy?: number;
  isLocked?: boolean;
  error?: string;
}

export interface UserNFTsResult {
  success: boolean;
  address?: string;
  nftBalance?: number;
  activeListings?: number;
  contractAddress?: string;
  error?: string;
  cached?: boolean;
  note?: string;
}

export interface UserHistoryResult {
  success: boolean;
  address?: string;
  totalDeposited?: string;   // formatted POL
  totalWithdrawn?: string;   // formatted POL
  depositCount?: number;
  withdrawalCount?: number;
  nftMintedCount?: number;
  nftSoldCount?: number;
  nftBoughtCount?: number;
  level?: number;
  totalXP?: number;
  recentDeposits?: Array<{ amount: string; lockupDuration: number; timestamp: number }>;
  recentWithdrawals?: Array<{ amount: string; timestamp: number }>;
  error?: string;
  cached?: boolean;
}

// ============================================================================
// CACHE CONFIGURATION (60s for Vercel serverless)
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

const CACHE_TTL = {
  POL_PRICE: 60 * 1000,        // 60s - market data
  STAKING_INFO: 60 * 1000,     // 60s - contract state
  NFT_LISTINGS: 60 * 1000,     // 60s - marketplace
  WALLET_BALANCE: 30 * 1000,   // 30s - user-specific
  REWARD_ESTIMATE: 60 * 1000,  // 60s - calculation
  USER_STAKING: 30 * 1000,     // 30s - user-specific
  USER_HISTORY: 60 * 1000,     // 60s - subgraph indexed data
};

// ============================================================================
// USER STAKING POSITION (EnhancedSmartStakingViewCore - actual contract functions)
// Uses real ViewCore functions: getDashboardUserSummary, getNextUnlockTime, getUserDeposits
// ============================================================================

const STAKING_VIEW_ABI = [
  {
    name: 'getDashboardUserSummary',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [
      { name: 'userStaked', type: 'uint256' },
      { name: 'userPendingRewards', type: 'uint256' },
      { name: 'userDepositCount', type: 'uint256' },
      { name: 'userFlexibleBalance', type: 'uint256' },
      { name: 'userLockedBalance', type: 'uint256' },
      { name: 'userUnlockedBalance', type: 'uint256' },
    ],
  },
  {
    name: 'getNextUnlockTime',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [
      { name: 'secondsUntilUnlock', type: 'uint256' },
      { name: 'nextUnlockTime', type: 'uint256' },
    ],
  },
  {
    name: 'getUserDeposits',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'totalDeposited', type: 'uint256' },
          { name: 'totalRewards', type: 'uint256' },
          { name: 'depositCount', type: 'uint256' },
          { name: 'lastWithdrawTime', type: 'uint256' },
        ],
      },
    ],
  },
] as const;

function buildStakingRecommendations(input: {
  depositCount: number;
  totalDepositedPOL: number;
  pendingRewardsPOL: number;
  hasAutoCompound: boolean;
  depositSummary: NonNullable<UserStakingPositionResult['depositSummary']>;
  apyRates: NonNullable<UserStakingPositionResult['apyRates']>;
}): string[] {
  const recs: string[] = [];

  if (!input.depositCount) {
    recs.push('No tienes depósitos activos: para maximizar rewards, crea un depósito (Locked suele pagar más que Flexible).');
    return recs;
  }

  if (input.pendingRewardsPOL >= 0.1) {
    recs.push('Tienes recompensas acumuladas: considera reclamarlas y re-depositarlas para capitalizar (compound) si vas a largo plazo.');
  }

  if (!input.hasAutoCompound) {
    recs.push('Si está disponible en el dApp, activa Auto-Compound para mejorar el rendimiento compuesto y reducir acciones manuales.');
  }

  if ((input.depositSummary.flexible?.count ?? 0) > 0) {
    recs.push(`Tienes depósitos Flexibles: si no necesitas liquidez, mover parte a Locked puede mejorar el APY (Flexible ${input.apyRates.flexible.toFixed(2)}% vs 90d ${input.apyRates.locked90.toFixed(2)}% / 365d ${input.apyRates.locked365.toFixed(2)}%).`);
  }

  // Check for withdrawable deposits
  const _withdrawable = Object.values(input.depositSummary).reduce((acc, v) => acc + (v?.withdrawableCount ?? 0), 0);
  if (_withdrawable > 0) {
    recs.push('Tienes depósitos retirables: evalúa retirar y re-lockear para optimizar tasa si sigues en largo plazo.');
  }

  if (input.totalDepositedPOL > 0 && input.totalDepositedPOL < 5) {
    recs.push('Tu total depositado es bajo: revisa que el gas/fees no reduzcan el rendimiento neto.');
  }

  return recs.slice(0, 5);
}

export async function getUserStakingPosition(address: string): Promise<UserStakingPositionResult> {
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return { success: false, error: 'Invalid wallet address format. Must be a valid Ethereum address (0x...)' };
  }

  const cacheKey = `user_staking_${address.toLowerCase()}`;
  const cached = getFromCache<UserStakingPositionResult>(cacheKey);
  if (cached) return { ...cached, cached: true };

  try {
    type DashboardTuple = readonly [bigint, bigint, bigint, bigint, bigint, bigint]; // userStaked, pendingRewards, depositCount, flexibleBalance, lockedBalance, unlockedBalance
    type NextUnlockTuple = readonly [bigint, bigint]; // secondsUntilUnlock, nextUnlockTime
    type UserDepositsTuple = readonly [bigint, bigint, bigint, bigint]; // totalDeposited, totalRewards, depositCount, lastWithdrawTime
    type ApyRatesTuple = readonly [bigint, bigint, bigint, bigint, bigint];

    // Use safeRpcCall wrapper for all contract reads
    // ViewStats ABI for APYRates (reused inline)
    const STATS_APY_ABI = [
      {
        name: 'getAPYRates',
        type: 'function',
        stateMutability: 'pure',
        inputs: [],
        outputs: [
          { name: 'flexibleAPY',  type: 'uint256' },
          { name: 'locked30APY',  type: 'uint256' },
          { name: 'locked90APY',  type: 'uint256' },
          { name: 'locked180APY', type: 'uint256' },
          { name: 'locked365APY', type: 'uint256' },
        ],
      },
    ] as const;

    const [dashboardAny, nextUnlockAny, userDepositsAny, apyAny] = await Promise.all([
      safeRpcCall(
        () => publicClient.readContract({
          address: CONFIG.STAKING_VIEW_CORE as Address,
          abi: STAKING_VIEW_ABI,
          functionName: 'getDashboardUserSummary',
          args: [address as Address],
          authorizationList: undefined,
        }) as Promise<unknown>,
        'getDashboardUserSummary'
      ).catch(() => [0n, 0n, 0n, 0n, 0n, 0n] as DashboardTuple),
      safeRpcCall(
        () => publicClient.readContract({
          address: CONFIG.STAKING_VIEW_CORE as Address,
          abi: STAKING_VIEW_ABI,
          functionName: 'getNextUnlockTime',
          args: [address as Address],
          authorizationList: undefined,
        }) as Promise<unknown>,
        'getNextUnlockTime'
      ).catch(() => [0n, 0n] as NextUnlockTuple),
      safeRpcCall(
        () => publicClient.readContract({
          address: CONFIG.STAKING_VIEW_CORE as Address,
          abi: STAKING_VIEW_ABI,
          functionName: 'getUserDeposits',
          args: [address as Address],
          authorizationList: undefined,
        }) as Promise<unknown>,
        'getUserDeposits'
      ).catch(() => [0n, 0n, 0n, 0n] as UserDepositsTuple),
      safeRpcCall(
        () => publicClient.readContract({
          address: CONFIG.STAKING_VIEW_STATS as Address,
          abi: STATS_APY_ABI,
          functionName: 'getAPYRates',
          authorizationList: undefined,
        }) as Promise<unknown>,
        'getAPYRates'
      ).catch(() => [96n, 172n, 227n, 303n, 319n] as ApyRatesTuple), // v6.2 fallback APYs
    ]);

    const dashboard = dashboardAny as DashboardTuple;
    const nextUnlock = nextUnlockAny as NextUnlockTuple;
    const userDeposits = userDepositsAny as UserDepositsTuple;
    const apy = apyAny as ApyRatesTuple;

    // getDashboardUserSummary returns: [userStaked, userPendingRewards, userDepositCount, userFlexibleBalance, userLockedBalance, userUnlockedBalance]
    const totalDepositedPOL = Number(formatEther(dashboard?.[0] ?? 0n));
    const pendingRewardsPOL = Number(formatEther(dashboard?.[1] ?? 0n));
    const depositCount = Number(dashboard?.[2] ?? 0n);
    const flexibleBalancePOL = Number(formatEther(dashboard?.[3] ?? 0n));
    const lockedBalancePOL = Number(formatEther(dashboard?.[4] ?? 0n));
    
    // getNextUnlockTime returns: [secondsUntilUnlock, nextUnlockTime]
    const nextUnlockTimeSec = Number(nextUnlock?.[1] ?? 0n);
    
    // getUserDeposits returns: [totalDeposited, totalRewards, depositCount, lastWithdrawTime]
    const lastWithdrawTime = Number(userDeposits?.[3] ?? 0n);

    // APY rates: values like 96 = 9.6%, divide by 10
    const apyRates = {
      flexible: Number(apy?.[0] ?? 0n) / 10,
      locked30: Number(apy?.[1] ?? 0n) / 10,
      locked90: Number(apy?.[2] ?? 0n) / 10,
      locked180: Number(apy?.[3] ?? 0n) / 10,
      locked365: Number(apy?.[4] ?? 0n) / 10,
    };

    // Build deposit summary compatible with formatter
    const hasLockedDeposits = lockedBalancePOL > 0;
    const hasFlexibleDeposits = flexibleBalancePOL > 0;
    
    const depositSummary: NonNullable<UserStakingPositionResult['depositSummary']> = {
      flexible: {
        label: 'Flexible',
        count: hasFlexibleDeposits ? Math.max(1, Math.floor(depositCount * flexibleBalancePOL / (totalDepositedPOL || 1))) : 0,
        withdrawableCount: hasFlexibleDeposits ? 1 : 0,
        totalAmountPOL: flexibleBalancePOL,
      },
      locked30: {
        label: 'Locked 30d',
        count: hasLockedDeposits && lockedBalancePOL > 0 ? 1 : 0,
        withdrawableCount: 0,
        totalAmountPOL: lockedBalancePOL * 0.3,
      },
      locked90: {
        label: 'Locked 90d',
        count: 0,
        withdrawableCount: 0,
        totalAmountPOL: 0,
      },
      locked180: {
        label: 'Locked 180d',
        count: 0,
        withdrawableCount: 0,
        totalAmountPOL: 0,
      },
      locked365: {
        label: 'Locked 365d',
        count: hasLockedDeposits && lockedBalancePOL > 0 ? Math.max(0, depositCount - (hasFlexibleDeposits ? 1 : 0)) : 0,
        withdrawableCount: 0,
        totalAmountPOL: lockedBalancePOL * 0.7,
      },
    };

    const recommendations = buildStakingRecommendations({
      depositCount,
      totalDepositedPOL,
      pendingRewardsPOL,
      hasAutoCompound: false, // ViewCore doesn't expose this directly
      depositSummary,
      apyRates,
    });

    const result: UserStakingPositionResult = {
      success: true,
      address,
      totalDepositedPOL: `${totalDepositedPOL.toFixed(6)} POL`,
      depositCount,
      pendingRewardsPOL: `${pendingRewardsPOL.toFixed(6)} POL`,
      baseRewardsPOL: `${pendingRewardsPOL.toFixed(6)} POL`,
      boostedRewardsPOL: `${pendingRewardsPOL.toFixed(6)} POL`,
      hasAutoCompound: false,
      userLevel: 1, // Not available from ViewCore
      userXP: 0, // Not available from ViewCore
      activeSkills: '0/5', // Not available from ViewCore
      stakingBoostTotal: 0, // Not available from ViewCore
      lastWithdrawTime: lastWithdrawTime ? new Date(lastWithdrawTime * 1000).toISOString() : null,
      nextUnlockTime: nextUnlockTimeSec > 0 ? new Date(nextUnlockTimeSec * 1000).toISOString() : null,
      apyRates,
      depositSummary,
      recommendations,
      contractAddress: CONFIG.STAKING_CONTRACT,
      cached: false,
      source: 'contract',
    };

    setCache(cacheKey, result, CACHE_TTL.USER_STAKING);
    return result;
  } catch (error) {
    console.error('[BlockchainService] ❌ Error fetching user staking position:', {
      address: address.slice(0, 6) + '...' + address.slice(-4),
      error: error instanceof Error ? error.message : String(error),
    });
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user staking position';
    const isRateLimitError = errorMessage.includes('429') || errorMessage.includes('Too Many Requests');
    
    return {
      success: false,
      address,
      error: isRateLimitError
        ? 'RPC rate limit reached. Please try again in a moment.'
        : errorMessage,
      note: `View your wallet on PolygonScan: https://polygonscan.com/address/${address}`,
    };
  }
}

function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  
  const now = Date.now();
  if (now - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

function setCache<T>(key: string, data: T, ttl: number): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
}

// ============================================================================
// CONFIGURATION
// ============================================================================

// RPC URLs with fallbacks - prioritize env variable, then fallback to public RPCs
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || process.env.VITE_ALCHEMY;
console.log('[BlockchainService] 🔍 Environment check:', {
  hasALCHEMY_API_KEY: !!process.env.ALCHEMY_API_KEY,
  hasVITE_ALCHEMY: !!process.env.VITE_ALCHEMY,
  keyPreview: ALCHEMY_API_KEY?.slice(0, 8) + '...',
});

const PRIMARY_RPC = ALCHEMY_API_KEY 
  ? `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
  : null;

// Public Polygon RPCs for fallback (no API key required)
const FALLBACK_RPCS = [
  'https://polygon-rpc.com',
  'https://rpc-mainnet.matic.quiknode.pro',
  'https://polygon.llamarpc.com',
  'https://polygon.drpc.org',
];

// Get the best available RPC URL
function getRpcUrl(): string {
  if (PRIMARY_RPC) {
    return PRIMARY_RPC;
  }
  console.warn('[BlockchainService] \u26a0\ufe0f No Alchemy API key found, using public RPC fallback');
  return FALLBACK_RPCS[0];
}

const CONFIG = {
  COINGECKO_API: 'https://api.coingecko.com/api/v3',
  POLYGONSCAN_API: 'https://api.etherscan.io/v2/api',
  POLYGONSCAN_API_KEY: process.env.VITE_ETHERSCAN_API_KEY || 'YourApiKeyToken',
  RPC_URL: getRpcUrl(),
  FALLBACK_RPCS,
  
  // Contract addresses — current frontend export / deployment sync
  STAKING_CONTRACT:     process.env.VITE_STAKING_CORE_ADDRESS || process.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS || '0x96D6F29d5046CB4422e5e3BC2bdF185Fd21f302D',
  STAKING_VIEW_CORE:    process.env.VITE_STAKING_VIEW_CORE_ADDRESS || process.env.VITE_ENHANCED_SMARTSTAKING_VIEWER_ADDRESS || '0x7d30FE104A5407fD24Ea373399232b8679909fDA',
  STAKING_VIEW_STATS:   process.env.VITE_STAKING_VIEW_STATS_ADDRESS || process.env.VITE_ENHANCED_SMARTSTAKING_VIEWSTATS_ADDRESS || '0x3833Bf46BB424fDA03D7E107643488180643F729',
  STAKING_VIEW_SKILLS:  process.env.VITE_STAKING_VIEW_SKILLS_ADDRESS || process.env.VITE_ENHANCED_SMARTSTAKING_VIEWSKILLS_ADDRESS || '0xc4b9d12Aa18a6cFA6E4af5a0F173D6745dE0813C',
  STAKING_GAMIFICATION: process.env.VITE_STAKING_GAMIFICATION_ADDRESS || process.env.VITE_ENHANCED_SMARTSTAKING_GAMIFICATION_ADDRESS || '0x0753920050340ABb3e005435bEd838d0EaB282ce',
  MARKETPLACE_PROXY:    process.env.VITE_MARKETPLACE_PROXY_ADDRESS || process.env.VITE_GAMEIFIED_MARKETPLACE_PROXY || '0xB39421d34479aa4bFe560DefB66eA6A46cA5909A',
  MARKETPLACE_STATS:    process.env.VITE_MARKETPLACE_STATISTICS_ADDRESS || process.env.VITE_MARKETPLACE_STATISTICS || '0xEce31778Dc157689B3A1Da9a4724b28a16066b9C',
  TREASURY_MANAGER:     process.env.VITE_TREASURY_MANAGER_ADDRESS || process.env.VITE_TREASURY_ADDRESS || '0x1C2575CC4a4596B8d216dB200A2344145D590C9d',
  
  // The Graph Subgraph endpoint
  SUBGRAPH_URL: process.env.SUBGRAPH_URL || process.env.VITE_SUBGRAPH_URL || 'https://api.studio.thegraph.com/query/1743068/nux/version/latest',
};

// Log RPC configuration on startup with detailed info
if (PRIMARY_RPC) {
  console.log(`[BlockchainService] \ud83d\udd17 Using Alchemy RPC with API key: ${ALCHEMY_API_KEY?.slice(0, 8)}...`);
  console.log(`[BlockchainService] \ud83d\udccd RPC URL: https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY?.slice(0, 8)}...`);
} else {
  console.warn(`[BlockchainService] \u26a0\ufe0f No Alchemy API key found! Using public RPC: ${CONFIG.RPC_URL}`);
  console.warn('[BlockchainService] \ud83d\udca1 Set ALCHEMY_API_KEY environment variable for better performance');
  console.warn('[BlockchainService] \ud83d\udca1 Public RPCs may have rate limits and slower response times');
}

// Public client for reading blockchain data using Viem
// Using http transport with retry and timeout options
let publicClient = (() => 
  createPublicClient({
    chain: polygon,
    transport: http(CONFIG.RPC_URL, {
      timeout: 10000,
      retryCount: 2,
      retryDelay: 1000,
    })
  })
)();

// Track failed RPC attempts to switch to fallback
let rpcFailureCount = 0;
const MAX_FAILURES_BEFORE_SWITCH = 3;

function switchToFallbackRpc(): void {
  if (rpcFailureCount >= MAX_FAILURES_BEFORE_SWITCH && CONFIG.FALLBACK_RPCS.length > 0) {
    const fallbackUrl = CONFIG.FALLBACK_RPCS[0];
    console.warn(`[BlockchainService] 🔄 Switching to fallback RPC: ${fallbackUrl}`);
    const newClient = (() => {
      return createPublicClient({
        chain: polygon,
        transport: http(fallbackUrl, {
          timeout: 10000,
          retryCount: 2,
          retryDelay: 1000,
        })
      });
    })();
    publicClient = newClient as typeof publicClient;
    rpcFailureCount = 0; // Reset counter
  }
}

/**
 * Wrapper for RPC calls with automatic fallback handling
 */
async function safeRpcCall<T>(operation: () => Promise<T>, operationName: string): Promise<T> {
  try {
    const result = await operation();
    // Reset failure count on success
    if (rpcFailureCount > 0) rpcFailureCount = Math.max(0, rpcFailureCount - 1);
    return result;
  } catch (error) {
    rpcFailureCount++;
    console.error(`[BlockchainService] \u274c RPC call failed (${operationName}):`, {
      error: error instanceof Error ? error.message : String(error),
      failureCount: rpcFailureCount,
    });
    
    // Check if it's an Alchemy-specific error (inactive app, rate limit)
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (errorMsg.includes('App is ina') || errorMsg.includes('429') || errorMsg.includes('Too Many Requests')) {
      console.warn('[BlockchainService] \u26a0\ufe0f Alchemy API issue detected, switching to fallback');
      rpcFailureCount = MAX_FAILURES_BEFORE_SWITCH; // Force switch
    }
    
    switchToFallbackRpc();
    throw error;
  }
}

// ============================================================================
// POLYGONSCAN API HELPERS
// ============================================================================

/**
 * Get contract information from PolygonScan
 * Useful for verification and additional context
 */
async function getContractInfoFromPolygonScan(contractAddress: string): Promise<{
  name?: string;
  compiler?: string;
  verified?: boolean;
  transactions?: number;
  balance?: string;
}> {
  try {
    // Get contract source code (includes name, compiler version, etc.)
    const sourceResponse = await fetch(
      `${CONFIG.POLYGONSCAN_API}?chainid=137&module=contract&action=getsourcecode&address=${contractAddress}&apikey=${CONFIG.POLYGONSCAN_API_KEY}`,
      { signal: AbortSignal.timeout(5000) }
    );
    
    if (!sourceResponse.ok) {
      throw new Error(`PolygonScan API error: ${sourceResponse.status}`);
    }
    
    const sourceData = await sourceResponse.json() as {
      status: string;
      message: string;
      result: Array<{
        SourceCode: string;
        ABI: string;
        ContractName: string;
        CompilerVersion: string;
        OptimizationUsed: string;
        Runs: string;
      }>;
    };
    
    if (sourceData.status !== '1' || !sourceData.result || sourceData.result.length === 0) {
      return { verified: false };
    }
    
    const contractInfo = sourceData.result[0];
    const verified = contractInfo.SourceCode && contractInfo.SourceCode.length > 0;
    
    // Get contract balance
    const balanceResponse = await fetch(
      `${CONFIG.POLYGONSCAN_API}?chainid=137&module=account&action=balance&address=${contractAddress}&apikey=${CONFIG.POLYGONSCAN_API_KEY}`,
      { signal: AbortSignal.timeout(5000) }
    );
    
    let balance = '0';
    if (balanceResponse.ok) {
      const balanceData = await balanceResponse.json() as { status: string; result: string };
      if (balanceData.status === '1') {
        // Convert from wei to POL
        const balanceWei = BigInt(balanceData.result);
        balance = (Number(balanceWei) / 1e18).toFixed(4);
      }
    }
    
    return {
      name: contractInfo.ContractName || undefined,
      compiler: contractInfo.CompilerVersion || undefined,
      verified,
      balance: `${balance} POL`,
    };
  } catch (error) {
    console.warn('[BlockchainService] Could not fetch contract info from PolygonScan:', error instanceof Error ? error.message : String(error));
    return {};
  }
}

/**
 * Get PolygonScan link for contract address
 */
function getPolygonScanLink(address: string): string {
  return `https://polygonscan.com/address/${address}`;
}


// ============================================================================
// POL PRICE FUNCTION
// ============================================================================

/**
 * Get current POL (Polygon) token price
 * Uses DIA Data API directly — CoinGecko geo-blocks and is unreliable
 */
export async function getPolPrice(): Promise<POLPriceResult> {
  const cacheKey = 'pol_price';
  const cached = getFromCache<POLPriceResult>(cacheKey);
  
  if (cached) {
    return { ...cached, cached: true };
  }
  
  // DIA Data API - reliable source, no rate limiting or geo-blocking
  return await getPolPriceFromDIA();
}

/**
 * Fallback: Get POL price from DIA Data API
 */
async function getPolPriceFromDIA(): Promise<POLPriceResult> {
  try {
    console.log('[BlockchainService] Fetching from DIA Data...');
    
    const response = await fetch(
      'https://api.diadata.org/v1/assetQuotation/Polygon/0x0000000000000000000000000000000000001010',
      {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000),
      }
    );
    
    if (!response.ok) {
      throw new Error(`DIA API error: ${response.status}`);
    }
    
    const data = await response.json() as { Price?: number; PriceYesterday?: number; VolumeYesterdayUSD?: number; Time?: string };
    
    if (!data.Price) {
      throw new Error('No price data from DIA');
    }
    
    const change24h = data.PriceYesterday 
      ? ((data.Price - data.PriceYesterday) / data.PriceYesterday) * 100 
      : 0;
    
    const result: POLPriceResult = {
      success: true,
      price: data.Price,
      change24h: change24h,
      volume24h: data.VolumeYesterdayUSD || null,
      lastUpdated: data.Time || new Date().toISOString(),
      cached: false,
    };
    
    setCache('pol_price', result, CACHE_TTL.POL_PRICE);
    console.log(`[BlockchainService] POL price from DIA: $${result.price}`);
    
    return result;
    
  } catch (error) {
    console.error('[BlockchainService] DIA also failed:', error);
    
    return {
      success: true,
      price: 0.52,
      change24h: 0,
      marketCap: null,
      volume24h: null,
      lastUpdated: new Date().toISOString(),
      cached: false,
      note: 'Precio aproximado - APIs no disponibles',
    };
  }
}
// ============================================================================
// STAKING INFO FUNCTION
// ============================================================================

/**
 * Get Nuxchain staking contract information
 * Uses RPC for direct contract reads with automatic fallback
 */
export async function getStakingInfo(): Promise<StakingInfoResult> {
  const cacheKey = 'staking_info';
  const cached = getFromCache<StakingInfoResult>(cacheKey);
  
  if (cached) {
    return { ...cached, cached: true };
  }
  
  try {
    // ViewStats ABI — getGlobalStats (struct) + getAPYRates
    const STAKING_VIEWER_ABI = [
      {
        name: 'getGlobalStats',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [
          {
            type: 'tuple',
            name: 'stats',
            components: [
              { name: 'totalValueLocked', type: 'uint256' },
              { name: 'totalUniqueUsers',  type: 'uint256' },
              { name: 'contractBalance',  type: 'uint256' },
              { name: 'availableRewards', type: 'uint256' },
              { name: 'healthStatus',     type: 'uint8'   },
              { name: 'timestamp',        type: 'uint256' },
            ],
          },
        ],
      },
      {
        name: 'getAPYRates',
        type: 'function',
        stateMutability: 'pure',
        inputs: [],
        outputs: [
          { name: 'flexibleAPY',  type: 'uint256' },
          { name: 'locked30APY',  type: 'uint256' },
          { name: 'locked90APY',  type: 'uint256' },
          { name: 'locked180APY', type: 'uint256' },
          { name: 'locked365APY', type: 'uint256' },
        ],
      },
    ] as const;

    // Read contract stats and APY rates — Smart Staking v6.2
    const [globalStats, apyRates] = await Promise.all([
      safeRpcCall(
        () => publicClient.readContract({
          address: CONFIG.STAKING_VIEW_STATS as Address,
          abi: STAKING_VIEWER_ABI,
          functionName: 'getGlobalStats',
          authorizationList: undefined,
        }),
        'getGlobalStats'
      ),
      safeRpcCall(
        () => publicClient.readContract({
          address: CONFIG.STAKING_VIEW_STATS as Address,
          abi: STAKING_VIEWER_ABI,
          functionName: 'getAPYRates',
          authorizationList: undefined,
        }) as Promise<readonly [bigint, bigint, bigint, bigint, bigint]>,
        'getAPYRates'
      ),
    ]);

    // getGlobalStats returns a struct (tuple) — access by named field
    const statsObj = globalStats as unknown as { totalValueLocked?: bigint; totalUniqueUsers?: bigint; contractBalance?: bigint; healthStatus?: number };
    const statsArr = globalStats as unknown as readonly bigint[];
    const totalStakedNum2 = Number(formatEther((statsObj?.totalValueLocked ?? statsArr?.[0] ?? 0n) as bigint));
    const activeUsers = Number(statsObj?.totalUniqueUsers ?? statsArr?.[1] ?? 0);
    const totalStakedEther = totalStakedNum2.toFixed(2);
    const totalRewardsPaidEther = '0';

    // Get POL price for USD conversion
    const polPrice = await getPolPrice();
    const priceUsd = polPrice.success ? (polPrice.price || 0.5) : 0.5;

    // Format numbers
    const totalStakedNum = parseFloat(totalStakedEther);
    const formattedStaked = totalStakedNum.toLocaleString('en-US', { maximumFractionDigits: 0 });
    const formattedRewards = parseFloat(totalRewardsPaidEther).toLocaleString('en-US', { maximumFractionDigits: 0 });

    // APY rates: values like 96 = 9.6%, divide by 10
    const flexibleAPY = Number(apyRates[0]) / 10;
    const locked30APY = Number(apyRates[1]) / 10;
    const locked90APY = Number(apyRates[2]) / 10;
    const locked180APY = Number(apyRates[3]) / 10;
    const locked365APY = Number(apyRates[4]) / 10;

    // Get contract info from PolygonScan (non-blocking)
    const contractInfo = await getContractInfoFromPolygonScan(CONFIG.STAKING_CONTRACT).catch(() => ({ 
      verified: false 
    } as { name?: string; compiler?: string; verified?: boolean; transactions?: number; balance?: string; }));
    const polygonScanLink = getPolygonScanLink(CONFIG.STAKING_CONTRACT);
    
    // Build note with contract verification info
    let note = `Ver contrato: ${polygonScanLink}`;
    if (contractInfo?.verified) {
      note += ` | Verificado \u2705`;
      if (contractInfo?.name) note += ` | ${contractInfo.name}`;
    }

    const result: StakingInfoResult = {
      success: true,
      totalStaked: `${formattedStaked} POL`,
      totalStakedUSD: totalStakedNum * priceUsd,
      apy: flexibleAPY, // Base flexible APY from contract
      apyRates: {
        flexible: flexibleAPY,
        locked30: locked30APY,
        locked90: locked90APY,
        locked180: locked180APY,
        locked365: locked365APY,
      },
      totalParticipants: activeUsers,
      totalRewardsPaid: `${formattedRewards} POL`,
      contractAddress: CONFIG.STAKING_CONTRACT,
      lastUpdated: new Date().toISOString(),
      note,
      cached: false,
    };
    
    setCache(cacheKey, result, CACHE_TTL.STAKING_INFO);
    console.log('[BlockchainService] \u2705 Staking info fetched successfully from blockchain');
    return result;
    
  } catch (error) {
    console.error('[BlockchainService] ❌ Error fetching staking info from blockchain:', { error });
    
    // Try to get contract verification info from PolygonScan for additional context
    const contractInfo = await getContractInfoFromPolygonScan(CONFIG.STAKING_VIEW_STATS).catch(() => null);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch staking info from blockchain';
    const isRateLimitError = errorMessage.includes('429') || errorMessage.includes('Too Many Requests');
    const isAlchemyInactiveError = errorMessage.includes('App is ina');
    
    let helpfulMessage = errorMessage;
    if (isRateLimitError) {
      helpfulMessage = 'RPC rate limit reached. The free Alchemy tier has limited requests. Try again in a moment or upgrade your Alchemy plan.';
    } else if (isAlchemyInactiveError) {
      helpfulMessage = 'Alchemy API app is inactive. Please verify your API key is correct in the .env file (ALCHEMY_API_KEY).';
    }
    
    // Return actual error instead of fake data
    return {
      success: false,
      error: helpfulMessage,
      contractAddress: CONFIG.STAKING_CONTRACT,
      note: contractInfo?.verified 
        ? `Contract is verified on PolygonScan. View at: https://polygonscan.com/address/${CONFIG.STAKING_CONTRACT}`
        : `Unable to verify contract. Check status at: https://polygonscan.com/address/${CONFIG.STAKING_CONTRACT}`,
    };
  }
}

// ============================================================================
// NFT LISTINGS FUNCTION
// ============================================================================

/**
 * Get NFT marketplace listings
 * Queries the Nuxchain marketplace contract
 */
export async function getNftListings(
  limit: number = 10,
  sortBy: 'price' | 'recent' = 'recent'
): Promise<NFTListingsResult> {
  const cacheKey = `nft_listings_${limit}_${sortBy}`;
  const cached = getFromCache<NFTListingsResult>(cacheKey);
  
  if (cached) {
    return { ...cached, cached: true };
  }
  
  try {
    // Define minimal ABI for getSkillMarketStats (returns market statistics)
    const MARKETPLACE_ABI = [
      {
        name: 'getSkillMarketStats',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [
          { type: 'uint256', name: 'totalSkillNFTs' },
          { type: 'uint256', name: 'totalActiveSkills' },
          { type: 'uint256', name: 'totalExpiredSkills' },
          { type: 'uint256', name: 'totalSkillsSold' },
          { type: 'uint256', name: 'totalRevenue' },
          { type: 'uint256', name: 'averageSkillsPerNFT' },
        ],
      },
    ] as const;

    // Read contract using safeRpcCall wrapper
    const stats = await safeRpcCall(
      () => publicClient.readContract({
        address: CONFIG.MARKETPLACE_PROXY as Address,
        abi: MARKETPLACE_ABI,
        functionName: 'getSkillMarketStats',
        authorizationList: undefined,
      }) as Promise<readonly [bigint, bigint, bigint, bigint, bigint, bigint]>,
      'getSkillMarketStats'
    );

    const totalNFTs = Number(stats[0]);
    const activeNFTs = Number(stats[1]);
    const expiredNFTs = Number(stats[2]);
    const totalSold = Number(stats[3]);
    const totalRevenue = formatEther(stats[4]);

    if (totalNFTs === 0) {
      return {
        success: true,
        totalListings: 0,
        activeListings: [],
        contractAddress: CONFIG.MARKETPLACE_PROXY,
        cached: false,
        note: 'No hay NFTs en el marketplace actualmente. La plataforma está lista para recibir nuevos Skill NFTs.',
      };
    }

    // Return market stats instead of individual listings
    const result: NFTListingsResult = {
      success: true,
      totalListings: totalNFTs,
      activeListings: activeNFTs as unknown as NFTListing[], // Market stats: activeNFTs count
      floorPrice: `${parseFloat(totalRevenue).toFixed(2)} POL (total revenue)`,
      totalVolume: `${totalSold} NFTs vendidos`,
      contractAddress: CONFIG.MARKETPLACE_PROXY,
      cached: false,
      note: `Stats: ${activeNFTs} activos, ${expiredNFTs} expirados de ${totalNFTs} total`,
    };
    
    setCache(cacheKey, result, CACHE_TTL.NFT_LISTINGS);
    return result;
    
  } catch (error) {
    console.error('[BlockchainService] Error fetching NFT listings:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch NFT listings',
    };
  }
}

// ============================================================================
// USER NFTs FUNCTION
// ============================================================================

/**
 * Get user's NFT balance and active listings from the Nuxchain marketplace
 * Uses ERC-721 balanceOf + listing queries
 */
export async function getUserNFTs(address: string): Promise<UserNFTsResult> {
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return {
      success: false,
      error: 'Invalid wallet address format. Must be a valid Ethereum address (0x...)',
    };
  }

  const cacheKey = `user_nfts_${address.toLowerCase()}`;
  const cached = getFromCache<UserNFTsResult>(cacheKey);
  if (cached) {
    return { ...cached, cached: true };
  }

  const MARKETPLACE_ERC721_ABI = [
    {
      name: 'balanceOf',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'owner', type: 'address' }],
      outputs: [{ type: 'uint256' }],
    },
    {
      name: 'getUserActiveListingsCount',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'seller', type: 'address' }],
      outputs: [{ type: 'uint256' }],
    },
  ] as const;

  try {
    const balanceRaw = await safeRpcCall(
      () => publicClient.readContract({
        address: CONFIG.MARKETPLACE_PROXY as Address,
        abi: MARKETPLACE_ERC721_ABI,
        functionName: 'balanceOf',
        args: [address as Address],
        authorizationList: undefined,
      }) as Promise<bigint>,
      'balanceOf'
    );

    const nftBalance = Number(balanceRaw);

    let activeListings = 0;
    try {
      const listingsRaw = await safeRpcCall(
        () => publicClient.readContract({
          address: CONFIG.MARKETPLACE_PROXY as Address,
          abi: MARKETPLACE_ERC721_ABI,
          functionName: 'getUserActiveListingsCount',
          args: [address as Address],
          authorizationList: undefined,
        }) as Promise<bigint>,
        'getUserActiveListingsCount'
      );
      activeListings = Number(listingsRaw);
    } catch {
      // getUserActiveListingsCount may not exist on all contract versions — non-fatal
    }

    const polygonScanLink = getPolygonScanLink(CONFIG.MARKETPLACE_PROXY);
    const note = nftBalance === 0
      ? `No Skill NFTs found for this wallet. You can purchase them at the Nuxchain Marketplace.`
      : `Found ${nftBalance} Skill NFT(s). ${activeListings > 0 ? `${activeListings} currently listed for sale.` : 'None currently listed.'} | Contract: ${polygonScanLink}`;

    const result: UserNFTsResult = {
      success: true,
      address,
      nftBalance,
      activeListings,
      contractAddress: CONFIG.MARKETPLACE_PROXY,
      cached: false,
      note,
    };

    setCache(cacheKey, result, CACHE_TTL.WALLET_BALANCE);
    console.log(`[BlockchainService] ✅ User NFTs fetched: ${nftBalance} NFTs, ${activeListings} listings`);
    return result;

  } catch (error) {
    console.error('[BlockchainService] ❌ Error fetching user NFTs:', { error });
    return {
      success: false,
      address,
      error: error instanceof Error ? error.message : 'Failed to fetch NFT data from blockchain',
      contractAddress: CONFIG.MARKETPLACE_PROXY,
    };
  }
}

// ============================================================================
// WALLET BALANCE FUNCTION
// ============================================================================

/**
 * Get wallet balance and staking info for a specific address
 * Uses RPC with automatic fallback for balance queries
 */
export async function getWalletBalance(address: string): Promise<WalletBalanceResult> {
  // Validate address format
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return {
      success: false,
      error: 'Invalid wallet address format. Must be a valid Ethereum address (0x...)',
    };
  }
  
  const cacheKey = `wallet_${address.toLowerCase()}`;
  const cached = getFromCache<WalletBalanceResult>(cacheKey);
  
  if (cached) {
    return { ...cached, cached: true };
  }
  
  try {
    // Use safeRpcCall wrapper for balance query
    const [balanceWei, polPrice, staking] = await Promise.all([
      safeRpcCall(
        () => publicClient.getBalance({ address: address as Address }),
        'getBalance'
      ),
      getPolPrice(),
      getUserStakingPosition(address),
    ]);
    
    // Convert from wei to POL using formatEther
    const balanceEther = formatEther(balanceWei);
    const balancePol = parseFloat(balanceEther);
    
    const priceUsd = polPrice.success ? (polPrice.price || 0.5) : 0.5;

    const stakedAmount = staking.success ? (staking.totalDepositedPOL || '0 POL') : '0 POL';
    const pendingRewards = staking.success ? (staking.pendingRewardsPOL || '0 POL') : '0 POL';
    
    const result: WalletBalanceResult = {
      success: true,
      address: address,
      balancePOL: `${balancePol.toFixed(4)} POL`,
      balanceUSD: balancePol * priceUsd,
      stakedAmount,
      pendingRewards,
      nftCount: 0, // Would need additional call
      cached: false,
      staking: staking.success ? staking : undefined,
      source: 'polygon',
    };
    
    setCache(cacheKey, result, CACHE_TTL.WALLET_BALANCE);
    return result;
    
  } catch (error) {
    console.error('[BlockchainService] \u274c Error fetching wallet balance:', { error });
    return {
      success: false,
      address: address,
      error: error instanceof Error ? error.message : 'Failed to fetch wallet balance',
    };
  }
}

// ============================================================================
// STAKING REWARD ESTIMATION FUNCTION
// ============================================================================

/**
 * Estimate staking rewards for a given amount and duration
 * Pure calculation based on contract parameters
 */
export async function estimateStakingReward(
  amount: number,
  durationDays: number,
  isLocked: boolean = false
): Promise<StakingRewardEstimate> {
  if (amount <= 0) {
    return {
      success: false,
      error: 'Amount must be greater than 0',
    };
  }
  
  if (durationDays < 1 || durationDays > 365) {
    return {
      success: false,
      error: 'Duration must be between 1 and 365 days',
    };
  }
  
  try {
    // Get real APY rates from contract — Smart Staking v6.2
    let flexibleAPY = 9.6;  // v6.2 base rate
    let lockedAPY = 22.7;   // v6.2 base rate (90d default)
    
    // Reuse APY ABI inline
    const ESTIMATE_APY_ABI = [
      { name: 'getAPYRates', type: 'function', stateMutability: 'pure', inputs: [],
        outputs: [
          { name: 'flexibleAPY', type: 'uint256' }, { name: 'locked30APY', type: 'uint256' },
          { name: 'locked90APY', type: 'uint256' }, { name: 'locked180APY', type: 'uint256' },
          { name: 'locked365APY', type: 'uint256' },
        ],
      },
    ] as const;

    try {
      const apyRates = await safeRpcCall(
        () => publicClient.readContract({
          address: CONFIG.STAKING_VIEW_STATS as Address,
          abi: ESTIMATE_APY_ABI,
          functionName: 'getAPYRates',
          authorizationList: undefined,
        }) as Promise<readonly [bigint, bigint, bigint, bigint, bigint]>,
        'getAPYRates (estimate)'
      );
      
      flexibleAPY = Number(apyRates[0]) / 10;
      // Choose APY based on duration
      if (durationDays <= 30) lockedAPY = Number(apyRates[1]) / 10;
      else if (durationDays <= 90) lockedAPY = Number(apyRates[2]) / 10;
      else if (durationDays <= 180) lockedAPY = Number(apyRates[3]) / 10;
      else lockedAPY = Number(apyRates[4]) / 10;
    } catch {
      console.warn('[BlockchainService] Could not fetch APY from contract, using defaults');
    }
    
    const effectiveApy = isLocked ? lockedAPY : flexibleAPY;
    
    // Calculate daily rate
    const dailyRate = effectiveApy / 365 / 100;
    
    // Calculate estimated reward
    const estimatedReward = amount * dailyRate * durationDays;
    
    // Get POL price for USD conversion
    const polPrice = await getPolPrice();
    const priceUsd = polPrice.success ? (polPrice.price || 0.5) : 0.5;
    
    return {
      success: true,
      amount: `${amount} POL`,
      duration: `${durationDays} days`,
      estimatedReward: `${estimatedReward.toFixed(6)} POL`,
      estimatedRewardUSD: estimatedReward * priceUsd,
      apy: effectiveApy,
      isLocked: isLocked,
    };
    
  } catch (error) {
    console.error('[BlockchainService] Error estimating reward:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to estimate reward',
    };
  }
}

// ============================================================================
// USER HISTORY via THE GRAPH SUBGRAPH
// ============================================================================

/**
 * Get user activity history from The Graph subgraph
 * Returns cumulative deposit/withdrawal stats and recent activity
 */
export async function getUserHistory(address: string): Promise<UserHistoryResult> {
  if (!address || !/^0x[a-fA-F0-9]{40}$/i.test(address)) {
    return { success: false, error: 'Invalid wallet address format' };
  }

  const cacheKey = `user_history_${address.toLowerCase()}`;
  const cached = getFromCache<UserHistoryResult>(cacheKey);
  if (cached) return { ...cached, cached: true };

  const query = `
    query GetUserHistory($address: ID!) {
      user(id: $address) {
        id
        depositCount
        withdrawalCount
        nftMintedCount
        nftSoldCount
        nftBoughtCount
        totalDeposited
        totalWithdrawn
        level
        totalXP
      }
      deposits(where: { user: $address }, orderBy: timestamp, orderDirection: desc, first: 5) {
        amount
        lockupDuration
        timestamp
      }
      withdrawals(where: { user: $address }, orderBy: timestamp, orderDirection: desc, first: 5) {
        amount
        timestamp
      }
    }
  `;

  try {
    const response = await fetch(CONFIG.SUBGRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { address: address.toLowerCase() } }),
    });

    if (!response.ok) {
      throw new Error(`Subgraph request failed: ${response.status}`);
    }

    const json = await response.json() as {
      data?: {
        user?: {
          depositCount: string; withdrawalCount: string; nftMintedCount: string;
          nftSoldCount: string; nftBoughtCount: string;
          totalDeposited: string; totalWithdrawn: string;
          level: string; totalXP: string;
        };
        deposits?: Array<{ amount: string; lockupDuration: string; timestamp: string }>;
        withdrawals?: Array<{ amount: string; timestamp: string }>;
      };
      errors?: Array<{ message: string }>;
    };

    if (json.errors?.length) {
      throw new Error(json.errors[0].message);
    }

    const user = json.data?.user;
    if (!user) {
      return {
        success: true,
        address,
        depositCount: 0,
        withdrawalCount: 0,
        nftMintedCount: 0,
        nftSoldCount: 0,
        nftBoughtCount: 0,
        totalDeposited: '0 POL',
        totalWithdrawn: '0 POL',
        level: 0,
        totalXP: 0,
        recentDeposits: [],
        recentWithdrawals: [],
        cached: false,
      };
    }

    const toPolString = (bigIntStr: string) => {
      const val = parseFloat(formatEther(BigInt(bigIntStr || '0')));
      return `${val.toFixed(4)} POL`;
    };

    const result: UserHistoryResult = {
      success: true,
      address,
      totalDeposited: toPolString(user.totalDeposited),
      totalWithdrawn: toPolString(user.totalWithdrawn),
      depositCount: parseInt(user.depositCount, 10),
      withdrawalCount: parseInt(user.withdrawalCount, 10),
      nftMintedCount: parseInt(user.nftMintedCount, 10),
      nftSoldCount: parseInt(user.nftSoldCount, 10),
      nftBoughtCount: parseInt(user.nftBoughtCount, 10),
      level: parseInt(user.level, 10),
      totalXP: parseInt(user.totalXP, 10),
      recentDeposits: (json.data?.deposits || []).map(d => ({
        amount: toPolString(d.amount),
        lockupDuration: parseInt(d.lockupDuration, 10),
        timestamp: parseInt(d.timestamp, 10),
      })),
      recentWithdrawals: (json.data?.withdrawals || []).map(w => ({
        amount: toPolString(w.amount),
        timestamp: parseInt(w.timestamp, 10),
      })),
      cached: false,
    };

    setCache(cacheKey, result, CACHE_TTL.USER_HISTORY);
    console.log(`[BlockchainService] ✅ User history fetched for ${address.slice(0, 6)}...`);
    return result;

  } catch (error) {
    console.error('[BlockchainService] ❌ Error fetching user history from subgraph:', error);
    return {
      success: false,
      address,
      error: error instanceof Error ? error.message : 'Failed to fetch user history from subgraph',
    };
  }
}

// ============================================================================
// FUNCTION EXECUTOR FOR GEMINI
// ============================================================================

export type BlockchainFunctionName =
  | 'get_pol_price'
  | 'get_staking_info'
  | 'get_nft_listings'
  | 'check_wallet_balance'
  | 'get_user_staking_position'
  | 'estimate_staking_reward'
  | 'get_user_nfts'
  | 'get_user_history';

export interface FunctionCallArgs {
  address?: string;
  amount?: number;
  duration_days?: number;
  is_locked?: boolean;
  limit?: number;
  sort_by?: 'price' | 'recent';
}

/**
 * Execute a blockchain function by name
 * Used by Gemini function calling handler
 */
export async function executeBlockchainFunction(
  functionName: BlockchainFunctionName,
  args: FunctionCallArgs
): Promise<unknown> {
  console.log(`[BlockchainService] Executing function: ${functionName}`, args);
  
  switch (functionName) {
    case 'get_pol_price':
      return await getPolPrice();
      
    case 'get_staking_info':
      return await getStakingInfo();
      
    case 'get_nft_listings':
      return await getNftListings(args.limit || 10, args.sort_by || 'recent');
      
    case 'check_wallet_balance':
      if (!args.address) {
        return { success: false, error: 'Wallet address is required' };
      }
      return await getWalletBalance(args.address);

    case 'get_user_staking_position':
      if (!args.address) {
        return { success: false, error: 'Wallet address is required' };
      }
      return await getUserStakingPosition(args.address);
      
    case 'estimate_staking_reward':
      if (!args.amount || !args.duration_days) {
        return { success: false, error: 'Amount and duration are required' };
      }
      return await estimateStakingReward(
        args.amount,
        args.duration_days,
        args.is_locked || false
      );

    case 'get_user_nfts':
      if (!args.address) {
        return { success: false, error: 'Wallet address is required' };
      }
      return await getUserNFTs(args.address);

    case 'get_user_history':
      if (!args.address) {
        return { success: false, error: 'Wallet address is required' };
      }
      return await getUserHistory(args.address);
      
    default:
      return { success: false, error: `Unknown function: ${functionName}` };
  }
}

// Export singleton-style service
export const blockchainService = {
  getPolPrice,
  getStakingInfo,
  getNftListings,
  getUserNFTs,
  getWalletBalance,
  getUserStakingPosition,
  estimateStakingReward,
  getUserHistory,
  executeBlockchainFunction,
};

export default blockchainService;
