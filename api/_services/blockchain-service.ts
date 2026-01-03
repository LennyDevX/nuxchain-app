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
};

// ============================================================================
// USER STAKING POSITION (EnhancedSmartStakingView)
// ============================================================================

const STAKING_VIEW_ABI = [
  {
    name: 'getUserDetailedStats',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'totalDeposited', type: 'uint256' },
          { name: 'totalRewards', type: 'uint256' },
          { name: 'boostedRewards', type: 'uint256' },
          { name: 'boostedRewardsWithRarity', type: 'uint256' },
          { name: 'depositCount', type: 'uint256' },
          { name: 'lastWithdrawTime', type: 'uint256' },
          { name: 'userLevel', type: 'uint16' },
          { name: 'userXP', type: 'uint256' },
          { name: 'maxActiveSkills', type: 'uint8' },
          { name: 'activeSkillsCount', type: 'uint8' },
          { name: 'stakingBoostTotal', type: 'uint16' },
          { name: 'feeDiscountTotal', type: 'uint16' },
          { name: 'hasAutoCompound', type: 'bool' },
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
      { name: 'flexibleAPY', type: 'uint256' },
      { name: 'locked30APY', type: 'uint256' },
      { name: 'locked90APY', type: 'uint256' },
      { name: 'locked180APY', type: 'uint256' },
      { name: 'locked365APY', type: 'uint256' },
    ],
  },
  {
    name: 'getUserDepositsByType',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [
      {
        name: 'flexible',
        type: 'tuple[]',
        components: [
          { name: 'depositIndex', type: 'uint256' },
          { name: 'amount', type: 'uint256' },
          { name: 'currentRewards', type: 'uint256' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'lastClaimTime', type: 'uint256' },
          { name: 'lockupDuration', type: 'uint256' },
          { name: 'unlockTime', type: 'uint256' },
          { name: 'lockupType', type: 'string' },
          { name: 'isLocked', type: 'bool' },
          { name: 'isWithdrawable', type: 'bool' },
        ],
      },
      {
        name: 'locked30',
        type: 'tuple[]',
        components: [
          { name: 'depositIndex', type: 'uint256' },
          { name: 'amount', type: 'uint256' },
          { name: 'currentRewards', type: 'uint256' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'lastClaimTime', type: 'uint256' },
          { name: 'lockupDuration', type: 'uint256' },
          { name: 'unlockTime', type: 'uint256' },
          { name: 'lockupType', type: 'string' },
          { name: 'isLocked', type: 'bool' },
          { name: 'isWithdrawable', type: 'bool' },
        ],
      },
      {
        name: 'locked90',
        type: 'tuple[]',
        components: [
          { name: 'depositIndex', type: 'uint256' },
          { name: 'amount', type: 'uint256' },
          { name: 'currentRewards', type: 'uint256' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'lastClaimTime', type: 'uint256' },
          { name: 'lockupDuration', type: 'uint256' },
          { name: 'unlockTime', type: 'uint256' },
          { name: 'lockupType', type: 'string' },
          { name: 'isLocked', type: 'bool' },
          { name: 'isWithdrawable', type: 'bool' },
        ],
      },
      {
        name: 'locked180',
        type: 'tuple[]',
        components: [
          { name: 'depositIndex', type: 'uint256' },
          { name: 'amount', type: 'uint256' },
          { name: 'currentRewards', type: 'uint256' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'lastClaimTime', type: 'uint256' },
          { name: 'lockupDuration', type: 'uint256' },
          { name: 'unlockTime', type: 'uint256' },
          { name: 'lockupType', type: 'string' },
          { name: 'isLocked', type: 'bool' },
          { name: 'isWithdrawable', type: 'bool' },
        ],
      },
      {
        name: 'locked365',
        type: 'tuple[]',
        components: [
          { name: 'depositIndex', type: 'uint256' },
          { name: 'amount', type: 'uint256' },
          { name: 'currentRewards', type: 'uint256' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'lastClaimTime', type: 'uint256' },
          { name: 'lockupDuration', type: 'uint256' },
          { name: 'unlockTime', type: 'uint256' },
          { name: 'lockupType', type: 'string' },
          { name: 'isLocked', type: 'bool' },
          { name: 'isWithdrawable', type: 'bool' },
        ],
      },
    ],
  },
] as const;

function summarizeDepositsByType(depositsByType: unknown): { summary: UserStakingPositionResult['depositSummary']; nextUnlock: number | null } {
  const types = [
    { key: 'flexible', label: 'Flexible' },
    { key: 'locked30', label: 'Locked 30d' },
    { key: 'locked90', label: 'Locked 90d' },
    { key: 'locked180', label: 'Locked 180d' },
    { key: 'locked365', label: 'Locked 365d' },
  ] as const;

  const arr = Array.isArray(depositsByType) ? depositsByType : [];
  const summary: Record<string, { label: string; count: number; withdrawableCount: number; totalAmountPOL: number }> = {};
  let nextUnlock: number | null = null;

  for (let i = 0; i < types.length; i++) {
    const list = Array.isArray(arr[i]) ? (arr[i] as Array<{ amount: bigint; unlockTime: bigint; isWithdrawable: boolean }>) : [];
    const withdrawableCount = list.filter((d) => d?.isWithdrawable).length;
    const totalAmountPOL = list.reduce((acc, d) => acc + Number(formatEther(d?.amount ?? 0n)), 0);

    for (const d of list) {
      const unlock = Number(d?.unlockTime ?? 0n);
      if (unlock > 0 && (nextUnlock === null || unlock < nextUnlock)) nextUnlock = unlock;
    }

    summary[types[i].key] = {
      label: types[i].label,
      count: list.length,
      withdrawableCount,
      totalAmountPOL,
    };
  }

  return { summary, nextUnlock };
}

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

  const withdrawable = Object.values(input.depositSummary).reduce((acc, v) => acc + (v?.withdrawableCount ?? 0), 0);
  if (withdrawable > 0) {
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
    type UserDetailedStatsTuple = readonly [
      bigint, // totalDeposited
      bigint, // totalRewards
      bigint, // boostedRewards
      bigint, // boostedRewardsWithRarity
      bigint, // depositCount
      bigint, // lastWithdrawTime
      bigint, // userLevel
      bigint, // userXP
      bigint, // maxActiveSkills
      bigint, // activeSkillsCount
      bigint, // stakingBoostTotal
      bigint, // feeDiscountTotal
      boolean // hasAutoCompound
    ];

    type ApyRatesTuple = readonly [bigint, bigint, bigint, bigint, bigint];

    // Use safeRpcCall wrapper for all contract reads
    const [statsAny, apyAny, depositsByType] = await Promise.all([
      safeRpcCall(
        () => publicClient.readContract({
          address: CONFIG.STAKING_VIEWER as Address,
          abi: STAKING_VIEW_ABI,
          functionName: 'getUserDetailedStats',
          args: [address as Address],
          authorizationList: undefined,
        }) as Promise<unknown>,
        'getUserDetailedStats'
      ),
      safeRpcCall(
        () => publicClient.readContract({
          address: CONFIG.STAKING_VIEWER as Address,
          abi: STAKING_VIEW_ABI,
          functionName: 'getAPYRates',
          authorizationList: undefined,
        }) as Promise<unknown>,
        'getAPYRates'
      ),
      safeRpcCall(
        () => publicClient.readContract({
          address: CONFIG.STAKING_VIEWER as Address,
          abi: STAKING_VIEW_ABI,
          functionName: 'getUserDepositsByType',
          args: [address as Address],
          authorizationList: undefined,
        }) as Promise<unknown>,
        'getUserDepositsByType'
      ),
    ]);

    const stats = statsAny as UserDetailedStatsTuple;
    const apy = apyAny as ApyRatesTuple;

    // stats is a struct - Viem may return as object or tuple depending on ABI
    // Handle both cases for compatibility
    const statsObj = stats as unknown as {
      totalDeposited?: bigint;
      totalRewards?: bigint;
      boostedRewards?: bigint;
      boostedRewardsWithRarity?: bigint;
      depositCount?: bigint;
      lastWithdrawTime?: bigint;
      userLevel?: bigint;
      userXP?: bigint;
      maxActiveSkills?: bigint;
      activeSkillsCount?: bigint;
      stakingBoostTotal?: bigint;
      hasAutoCompound?: boolean;
    };
    const isArray = Array.isArray(stats);

    const totalDepositedPOL = Number(formatEther(isArray ? stats?.[0] ?? 0n : statsObj?.totalDeposited ?? 0n));
    const totalRewardsPOL = Number(formatEther(isArray ? stats?.[1] ?? 0n : statsObj?.totalRewards ?? 0n));
    const boostedRewardsPOL = Number(formatEther(isArray ? stats?.[2] ?? 0n : statsObj?.boostedRewards ?? 0n));
    const boostedRewardsWithRarityPOL = Number(formatEther(isArray ? stats?.[3] ?? 0n : statsObj?.boostedRewardsWithRarity ?? 0n));
    const depositCount = Number(isArray ? stats?.[4] ?? 0n : statsObj?.depositCount ?? 0n);
    const lastWithdrawTime = Number(isArray ? stats?.[5] ?? 0n : statsObj?.lastWithdrawTime ?? 0n);
    const userLevel = Number(isArray ? stats?.[6] ?? 0n : statsObj?.userLevel ?? 0n);
    const userXP = Number(isArray ? stats?.[7] ?? 0n : statsObj?.userXP ?? 0n);
    const maxActiveSkills = Number(isArray ? stats?.[8] ?? 0n : statsObj?.maxActiveSkills ?? 0);
    const activeSkillsCount = Number(isArray ? stats?.[9] ?? 0n : statsObj?.activeSkillsCount ?? 0);
    const stakingBoostTotal = Number(isArray ? stats?.[10] ?? 0n : statsObj?.stakingBoostTotal ?? 0);
    const hasAutoCompound = Boolean(isArray ? stats?.[12] ?? false : statsObj?.hasAutoCompound ?? false);

    // APY rates are returned in basis points (100 = 1%), so divide by 100
    const apyRates = {
      flexible: Number(apy?.[0] ?? 0n) / 100,
      locked30: Number(apy?.[1] ?? 0n) / 100,
      locked90: Number(apy?.[2] ?? 0n) / 100,
      locked180: Number(apy?.[3] ?? 0n) / 100,
      locked365: Number(apy?.[4] ?? 0n) / 100,
    };

    const { summary: depositSummary, nextUnlock } = summarizeDepositsByType(depositsByType);
    const recommendations = buildStakingRecommendations({
      depositCount,
      totalDepositedPOL,
      pendingRewardsPOL: boostedRewardsWithRarityPOL,
      hasAutoCompound,
      depositSummary: (depositSummary || {}) as NonNullable<UserStakingPositionResult['depositSummary']>,
      apyRates,
    });

    const result: UserStakingPositionResult = {
      success: true,
      address,
      totalDepositedPOL: `${totalDepositedPOL.toFixed(6)} POL`,
      depositCount,
      pendingRewardsPOL: `${boostedRewardsWithRarityPOL.toFixed(6)} POL`,
      baseRewardsPOL: `${totalRewardsPOL.toFixed(6)} POL`,
      boostedRewardsPOL: `${boostedRewardsPOL.toFixed(6)} POL`,
      hasAutoCompound,
      userLevel,
      userXP,
      activeSkills: `${activeSkillsCount}/${maxActiveSkills}`,
      stakingBoostTotal,
      lastWithdrawTime: lastWithdrawTime ? new Date(lastWithdrawTime * 1000).toISOString() : null,
      nextUnlockTime: nextUnlock ? new Date(nextUnlock * 1000).toISOString() : null,
      apyRates,
      depositSummary: depositSummary || {},
      recommendations,
      contractAddress: CONFIG.STAKING_VIEWER,
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
  POLYGONSCAN_API: 'https://api.polygonscan.com/api',
  POLYGONSCAN_API_KEY: process.env.POLYGONSCAN_API_KEY || 'YourApiKeyToken',
  RPC_URL: getRpcUrl(),
  FALLBACK_RPCS,
  
  // Contract addresses from .env
  STAKING_CONTRACT: process.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS || '0xC67F0a0cB719e4f4358D980a5D966878Fd6f3946',
  STAKING_VIEWER: process.env.VITE_ENHANCED_SMARTSTAKING_VIEWER_ADDRESS || '0x97C24aC0Eb18b87Ea71312e1Ea415aE17D696462',
  MARKETPLACE_PROXY: process.env.VITE_GAMEIFIED_MARKETPLACE_PROXY || '0xd502fB2Eb3d345EE9A5A0286A472B38c77Fda6d5',
  
  // The Graph Subgraph endpoint (hosted service)
  SUBGRAPH_URL: 'https://api.studio.thegraph.com/query/YOUR_SUBGRAPH_ID/nuxchain/version/latest',
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
let publicClient = createPublicClient({
  chain: polygon,
  transport: http(CONFIG.RPC_URL, {
    timeout: 10000, // 10 second timeout
    retryCount: 2,
    retryDelay: 1000,
  })
});

// Track failed RPC attempts to switch to fallback
let rpcFailureCount = 0;
const MAX_FAILURES_BEFORE_SWITCH = 3;

/**
 * Helper to switch to fallback RPC if primary fails repeatedly
 */
function switchToFallbackRpc(): void {
  if (rpcFailureCount >= MAX_FAILURES_BEFORE_SWITCH && CONFIG.FALLBACK_RPCS.length > 0) {
    const fallbackUrl = CONFIG.FALLBACK_RPCS[0];
    console.warn(`[BlockchainService] \ud83d\udd04 Switching to fallback RPC: ${fallbackUrl}`);
    publicClient = createPublicClient({
      chain: polygon,
      transport: http(fallbackUrl, {
        timeout: 10000,
        retryCount: 2,
        retryDelay: 1000,
      })
    });
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
      `${CONFIG.POLYGONSCAN_API}?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${CONFIG.POLYGONSCAN_API_KEY}`,
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
      `${CONFIG.POLYGONSCAN_API}?module=account&action=balance&address=${contractAddress}&apikey=${CONFIG.POLYGONSCAN_API_KEY}`,
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
 * Get current POL (Polygon) token price from CoinGecko
 * Rate limited: uses internal cache to minimize API calls
 */
export async function getPolPrice(): Promise<POLPriceResult> {
  const cacheKey = 'pol_price';
  const cached = getFromCache<POLPriceResult>(cacheKey);
  
  if (cached) {
    return { ...cached, cached: true };
  }
  
  try {
    // Intentar CoinGecko primero
    const response = await fetch(
      `${CONFIG.COINGECKO_API}/simple/price?ids=matic-network&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NuxchainApp/1.0'
        },
        signal: AbortSignal.timeout(5000),
      }
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data = await response.json();
    const matic = data['matic-network'];
    
    // Verificar que matic existe Y tiene datos
    if (!matic || typeof matic.usd !== 'number') {
      console.log('[BlockchainService] CoinGecko empty, trying DIA Data...');
      return await getPolPriceFromDIA();
    }
    
    const result: POLPriceResult = {
      success: true,
      price: matic.usd,
      change24h: matic.usd_24h_change,
      marketCap: matic.usd_market_cap,
      volume24h: matic.usd_24h_vol,
      lastUpdated: new Date().toISOString(),
      cached: false,
    };
    
    setCache(cacheKey, result, CACHE_TTL.POL_PRICE);
    return result;
    
  } catch (error) {
    console.error('[BlockchainService] CoinGecko error:', error);
    return await getPolPriceFromDIA();
  }
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
    // Define minimal ABI for getGlobalStats and APY
    const STAKING_VIEWER_ABI = [
      {
        name: 'getGlobalStats',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [
          { type: 'uint256', name: 'totalStaked' },
          { type: 'uint256', name: 'totalRewardsPaid' },
          { type: 'uint256', name: 'activeUsers' },
          { type: 'uint256', name: 'totalDeposits' },
        ],
      },
    ] as const;

    // Read contract stats and APY rates using safeRpcCall wrapper
    const [stats, apyRates] = await Promise.all([
      safeRpcCall(
        () => publicClient.readContract({
          address: CONFIG.STAKING_VIEWER as Address,
          abi: STAKING_VIEWER_ABI,
          functionName: 'getGlobalStats',
          authorizationList: undefined,
        }),
        'getGlobalStats'
      ),
      safeRpcCall(
        () => publicClient.readContract({
          address: CONFIG.STAKING_VIEWER as Address,
          abi: STAKING_VIEW_ABI,
          functionName: 'getAPYRates',
          authorizationList: undefined,
        }) as Promise<readonly [bigint, bigint, bigint, bigint, bigint]>,
        'getAPYRates'
      ),
    ]);

    // Convert Wei to Ether
    const totalStakedEther = formatEther(stats[0]);
    const totalRewardsPaidEther = formatEther(stats[1]);
    const activeUsers = Number(stats[2]);

    // Get POL price for USD conversion
    const polPrice = await getPolPrice();
    const priceUsd = polPrice.success ? (polPrice.price || 0.5) : 0.5;

    // Format numbers
    const totalStakedNum = parseFloat(totalStakedEther);
    const formattedStaked = totalStakedNum.toLocaleString('en-US', { maximumFractionDigits: 0 });
    const formattedRewards = parseFloat(totalRewardsPaidEther).toLocaleString('en-US', { maximumFractionDigits: 0 });

    // APY rates are in format where 263 = 26.3%, so divide by 10
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
    const contractInfo = await getContractInfoFromPolygonScan(CONFIG.STAKING_VIEWER).catch(() => null);
    
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
      contractAddress: CONFIG.STAKING_VIEWER,
      note: contractInfo?.verified 
        ? `Contract is verified on PolygonScan. View at: https://polygonscan.com/address/${CONFIG.STAKING_VIEWER}`
        : `Unable to verify contract. Check status at: https://polygonscan.com/address/${CONFIG.STAKING_VIEWER}`,
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
    // Get real APY rates from contract
    let flexibleAPY = 26.3; // Default based on contract
    let lockedAPY = 78.8; // Default 90d lock APY
    
    try {
      const apyRates = await safeRpcCall(
        () => publicClient.readContract({
          address: CONFIG.STAKING_VIEWER as Address,
          abi: STAKING_VIEW_ABI,
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
// FUNCTION EXECUTOR FOR GEMINI
// ============================================================================

export type BlockchainFunctionName = 
  | 'get_pol_price'
  | 'get_staking_info'
  | 'get_nft_listings'
  | 'check_wallet_balance'
  | 'get_user_staking_position'
  | 'estimate_staking_reward';

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
      
    default:
      return { success: false, error: `Unknown function: ${functionName}` };
  }
}

// Export singleton-style service
export const blockchainService = {
  getPolPrice,
  getStakingInfo,
  getNftListings,
  getWalletBalance,
  getUserStakingPosition,
  estimateStakingReward,
  executeBlockchainFunction,
};

export default blockchainService;
