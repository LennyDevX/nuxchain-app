/**
 * 🔗 Blockchain Service for Local Development Server
 * ===================================================
 * Provides blockchain data functions for Gemini Function Calling.
 * Longer cache TTL (300s) for development.
 * 
 * @module blockchain-service
 * @version 1.0.0
 */

import env from '../config/environment.js';
import { createPublicClient, http, formatEther } from 'viem';
import { polygon } from 'viem/chains';

// Simple logger helper (chatLogger doesn't have logInfo)
const log = {
  info: (msg, context, data) => console.log(`ℹ️ [${context}] ${msg}`, data || ''),
  error: (msg, context, data) => console.error(`❌ [${context}] ${msg}`, data || ''),
};

// ============================================================================
// BLOCKCHAIN CONNECTION
// ============================================================================

// Public client for reading blockchain data
if (!env.alchemyKey) {
  console.warn('⚠️ [BlockchainService] No ALCHEMY_API_KEY found! Set it in .env file');
  console.warn('⚠️ [BlockchainService] Add: ALCHEMY_API_KEY=your_key_here');
}

const publicClient = createPublicClient({
  chain: polygon,
  transport: http(env.alchemyKey 
    ? `https://polygon-mainnet.g.alchemy.com/v2/${env.alchemyKey}`
    : 'https://polygon-rpc.com' // Fallback to public RPC
  )
});

console.log('[BlockchainService] 🔗 RPC configured:', {
  hasAlchemyKey: !!env.alchemyKey,
  keyPreview: env.alchemyKey ? env.alchemyKey.slice(0, 8) + '...' : 'none',
  rpcUrl: env.alchemyKey ? 'Alchemy' : 'Public RPC',
});

// ============================================================================
// CACHE CONFIGURATION (300s for local development)
// ============================================================================

class BlockchainCache {
  constructor() {
    this.cache = new Map();
    this.TTL = {
      POL_PRICE: 300 * 1000,        // 5min
      STAKING_INFO: 300 * 1000,     // 5min
      NFT_LISTINGS: 300 * 1000,     // 5min
      WALLET_BALANCE: 60 * 1000,    // 1min (user-specific)
      REWARD_ESTIMATE: 300 * 1000,  // 5min
    };
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set(key, data, ttl) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  clear() {
    this.cache.clear();
  }
}

const cache = new BlockchainCache();

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  COINGECKO_API: 'https://api.coingecko.com/api/v3',
  ALCHEMY_URL: env.alchemyKey 
    ? `https://polygon-mainnet.g.alchemy.com/v2/${env.alchemyKey}`
    : 'https://polygon-rpc.com',
  POLYGONSCAN_API: 'https://api.polygonscan.com/api',
  POLYGONSCAN_API_KEY: env.polygonScanKey,
  
  // Contract addresses — Smart Staking v6.2 (Polygon Mainnet, deployed 2026-03-01)
  STAKING_CONTRACT:     process.env.VITE_STAKING_CORE_ADDRESS           || '0x2cda88046543be25a3EC4eA2d86dBe975Fda0028',
  STAKING_VIEW_CORE:    process.env.VITE_STAKING_VIEW_CORE_ADDRESS      || '0xDd21d682f3625eF90c446C8DE622A51e4084DA56',
  STAKING_VIEW_STATS:   process.env.VITE_STAKING_VIEW_STATS_ADDRESS     || '0x994BC04688577066CD4c6E55B459788dfe408007',
  STAKING_VIEW_SKILLS:  process.env.VITE_STAKING_VIEW_SKILLS_ADDRESS    || '0xc5a07f94b5Ecaaf8E65d9F3adb7AB590550a9bE9',
  STAKING_GAMIFICATION: process.env.VITE_STAKING_GAMIFICATION_ADDRESS   || '0x58b38720BE35eDD36e3D252ea41e8B0a9629EA1F',
  MARKETPLACE_PROXY:    process.env.VITE_MARKETPLACE_PROXY_ADDRESS      || '0xc8Af452F3842805Bc79bfFBBbDB9b130f222d9BC',
  MARKETPLACE_STATS:    process.env.VITE_MARKETPLACE_STATISTICS_ADDRESS || '0x7C4c72d3D1b9a54178254c79Ca4F788111A9c99D',
  TREASURY_MANAGER:     process.env.VITE_TREASURY_MANAGER_ADDRESS       || '0x312a3c5072c9DE2aB5cbDd799b3a65fb053DF043',
};

// ============================================================================
// POL PRICE FUNCTION
// ============================================================================

/**
 * Get current POL (Polygon) token price
 * Uses DIA Data API directly — CoinGecko geo-blocks and Binance returns 451
 */
async function getPolPrice() {
  const cacheKey = 'pol_price';
  const cached = cache.get(cacheKey);
  
  if (cached) {
    log.info('💰 POL price from cache', 'BlockchainService', { cached: true });
    return { ...cached, cached: true };
  }
  
  // DIA Data API is the only reliable source
  return await getPolPriceFromDIA();
}

/**
 * Fallback: Get POL price from Binance API
 */
async function getPolPriceFromBinance() {
  try {
    console.log('🔄 [BlockchainService] Trying Binance API...');
    
    const response = await fetch(
      'https://api.binance.com/api/v3/ticker/24hr?symbol=MATICUSDT',
      {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.lastPrice) {
      throw new Error('No price data from Binance');
    }
    
    const result = {
      success: true,
      price: parseFloat(data.lastPrice),
      change24h: parseFloat(data.priceChangePercent),
      volume24h: parseFloat(data.volume),
      lastUpdated: new Date().toISOString(),
      cached: false,
      source: 'binance'
    };
    
    cache.set('pol_price', result, cache.TTL.POL_PRICE);
    console.log(`✅ [BlockchainService] POL price from Binance: $${result.price}`);
    
    return result;
    
  } catch (error) {
    console.error('❌ [BlockchainService] Binance failed:', error.message);
    
    // Intentar DIA Data como tercer fallback
    return await getPolPriceFromDIA();
  }
}

/**
 * Fallback: Get POL price from DIA Data API
 */
async function getPolPriceFromDIA() {
  try {
    console.log('🔄 [BlockchainService] Trying DIA Data API...');
    
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
    
    const data = await response.json();
    
    if (!data.Price) {
      throw new Error('No price data from DIA');
    }
    
    // Calcular cambio 24h
    const change24h = data.PriceYesterday 
      ? ((data.Price - data.PriceYesterday) / data.PriceYesterday) * 100 
      : 0;
    
    const result = {
      success: true,
      price: data.Price,
      change24h: change24h,
      volume24h: data.VolumeYesterdayUSD || null,
      lastUpdated: data.Time || new Date().toISOString(),
      cached: false,
      source: 'diadata'
    };
    
    cache.set('pol_price', result, cache.TTL.POL_PRICE);
    console.log(`✅ [BlockchainService] POL price from DIA: $${result.price}`);
    
    return result;
    
  } catch (error) {
    console.error('❌ [BlockchainService] DIA also failed:', error.message);
    
    // Fallback estático final
    return {
      success: true,
      price: 0.52,
      change24h: 0,
      marketCap: null,
      volume24h: null,
      lastUpdated: new Date().toISOString(),
      cached: false,
      note: 'Precio aproximado - APIs temporalmente no disponibles',
      source: 'fallback'
    };
  }
}

// ============================================================================
// STAKING INFO FUNCTION
// ============================================================================

// ViewStats ABI — getGlobalStats (struct) + getAPYRates + getPoolHealth + getPoolStats
const STAKING_VIEWER_ABI = [
  {
    inputs: [],
    name: 'getGlobalStats',
    outputs: [
      {
        components: [
          { name: 'totalValueLocked', type: 'uint256' },
          { name: 'totalUniqueUsers', type: 'uint256' },
          { name: 'contractBalance', type: 'uint256' },
          { name: 'availableRewards', type: 'uint256' },
          { name: 'healthStatus', type: 'uint8' },
          { name: 'timestamp', type: 'uint256' },
        ],
        name: 'stats',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getPoolHealth',
    outputs: [
      { name: 'healthStatus', type: 'uint8' },
      { name: 'statusMessage', type: 'string' },
      { name: 'reserveRatio', type: 'uint256' },
      { name: 'description', type: 'string' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getPoolStats',
    outputs: [
      { name: 'totalPoolValue', type: 'uint256' },
      { name: 'totalRewards', type: 'uint256' },
      { name: 'activeUsersCount', type: 'uint256' },
      { name: 'totalDeposits', type: 'uint256' },
      { name: 'contractBalanceValue', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAPYRates',
    outputs: [
      { name: 'flexibleAPY',  type: 'uint256' },
      { name: 'locked30APY',  type: 'uint256' },
      { name: 'locked90APY',  type: 'uint256' },
      { name: 'locked180APY', type: 'uint256' },
      { name: 'locked365APY', type: 'uint256' },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [{ name: '_user', type: 'address' }],
    name: 'getUserRewardsProjection',
    outputs: [
      {
        components: [
          { name: 'hourlyRewards',        type: 'uint256' },
          { name: 'dailyRewards',         type: 'uint256' },
          { name: 'weeklyRewards',        type: 'uint256' },
          { name: 'monthlyRewards',       type: 'uint256' },
          { name: 'yearlyRewards',        type: 'uint256' },
          { name: 'currentPendingRewards', type: 'uint256' },
        ],
        name: 'projection',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_user', type: 'address' }],
    name: 'getUserLockupAnalysis',
    outputs: [
      {
        components: [
          { name: 'totalFlexible',    type: 'uint256' },
          { name: 'totalLocked30',    type: 'uint256' },
          { name: 'totalLocked90',    type: 'uint256' },
          { name: 'totalLocked180',   type: 'uint256' },
          { name: 'totalLocked365',   type: 'uint256' },
          { name: 'nextUnlockAmount', type: 'uint256' },
          { name: 'nextUnlockTime',   type: 'uint256' },
        ],
        name: 'analysis',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_user', type: 'address' }],
    name: 'getEarningsBreakdown',
    outputs: [
      { name: 'dailyEarnings',   type: 'uint256' },
      { name: 'monthlyEarnings', type: 'uint256' },
      { name: 'annualEarnings',  type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

/**
 * Get Nuxchain staking contract information from blockchain
 */
async function getStakingInfo() {
  const cacheKey = 'staking_info';
  const cached = cache.get(cacheKey);
  
  if (cached) {
    log.info('📊 Staking info from cache', 'BlockchainService', { cached: true });
    return { ...cached, cached: true };
  }
  
  try {
    log.info('📊 Fetching staking info from blockchain', 'BlockchainService');
    
    // Get POL price for USD conversion
    const polPrice = await getPolPrice();
    const priceUsd = polPrice.success ? (polPrice.price || 0.12) : 0.12;
    
    // Read contract stats and APY rates — Smart Staking v6.2
    const [globalStats, apyRates] = await Promise.all([
      publicClient.readContract({
        address: CONFIG.STAKING_VIEW_STATS,
        abi: STAKING_VIEWER_ABI,
        functionName: 'getGlobalStats',
      }),
      publicClient.readContract({
        address: CONFIG.STAKING_VIEW_STATS,
        abi: STAKING_VIEWER_ABI,
        functionName: 'getAPYRates',
      }),
    ]);
    
    // getGlobalStats returns a struct (tuple): access by named field
    const totalStakedPOL = Number(formatEther(globalStats.totalValueLocked ?? globalStats[0] ?? 0n));
    const activeUsers = Number(globalStats.totalUniqueUsers ?? globalStats[1] ?? 0);
    const contractBalance = Number(formatEther(globalStats.contractBalance ?? globalStats[2] ?? 0n));
    const healthStatus = Number(globalStats.healthStatus ?? globalStats[4] ?? 0);
    const healthLabels = ['HEALTHY', 'WARNING', 'CRITICAL', 'CIRCUIT_BREAKER'];
    
    // APY rates: values like 96 = 9.6%, divide by 10
    const flexibleAPY = Number(apyRates[0]) / 10;
    const locked30APY  = Number(apyRates[1]) / 10;
    const locked90APY  = Number(apyRates[2]) / 10;
    const locked180APY = Number(apyRates[3]) / 10;
    const locked365APY = Number(apyRates[4]) / 10;
    
    const result = {
      success: true,
      totalStaked: totalStakedPOL.toFixed(2) + ' POL',
      totalStakedUSD: (totalStakedPOL * priceUsd).toFixed(2),
      contractBalance: contractBalance.toFixed(2) + ' POL',
      poolHealth: healthLabels[healthStatus] || 'HEALTHY',
      apy: flexibleAPY,
      apyRates: {
        flexible:  flexibleAPY,
        locked30:  locked30APY,
        locked90:  locked90APY,
        locked180: locked180APY,
        locked365: locked365APY,
      },
      totalParticipants: activeUsers,
      contractAddress: CONFIG.STAKING_CONTRACT,
      lastUpdated: new Date().toISOString(),
      cached: false,
    };
    
    cache.set(cacheKey, result, cache.TTL.STAKING_INFO);
    log.info('📊 Staking info fetched', 'BlockchainService', { 
      totalStaked: totalStakedPOL.toFixed(2),
      users: activeUsers 
    });
    
    return result;
    
  } catch (error) {
    log.error('❌ Error fetching staking info from blockchain', 'BlockchainService', { error: error.message });
    
    // Fallback — Smart Staking v6.2 base rates (contract constructor values)
    return {
      success: true,
      totalStaked: 'N/A',
      totalStakedUSD: 'N/A',
      apy: 9.6,
      apyRates: {
        flexible:  9.6,
        locked30:  17.2,
        locked90:  22.7,
        locked180: 30.3,
        locked365: 31.9,
      },
      totalParticipants: 0,
      contractAddress: CONFIG.STAKING_CONTRACT,
      note: 'APY base Smart Staking v6.2 — contrato no disponible en este momento',
      cached: false,
    };
  }
}

// ============================================================================
// NFT LISTINGS FUNCTION
// ============================================================================

// Minimal ABI for getSkillMarketStats and getAllSkillNFTs functions
const MARKETPLACE_ABI = [
  {
    "inputs": [],
    "name": "getSkillMarketStats",
    "outputs": [
      {"internalType": "uint256", "name": "totalSkillNFTs", "type": "uint256"},
      {"internalType": "uint256", "name": "totalActiveSkills", "type": "uint256"},
      {"internalType": "uint256", "name": "totalExpiredSkills", "type": "uint256"},
      {"internalType": "uint256", "name": "totalSkillsSold", "type": "uint256"},
      {"internalType": "uint256", "name": "totalRevenue", "type": "uint256"},
      {"internalType": "uint256", "name": "averageSkillsPerNFT", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllSkillNFTs",
    "outputs": [
      {"internalType": "uint256[]", "name": "", "type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

/**
 * Get NFT marketplace listings from real blockchain data
 */
async function getNftListings(limit = 10, sortBy = 'recent') {
  const cacheKey = `nft_listings_${limit}_${sortBy}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    log.info('NFT listings from cache', 'BlockchainService', { cached: true });
    return { ...cached, cached: true };
  }
  
  try {
    log.info('Fetching NFT market stats from blockchain', 'BlockchainService', { limit, sortBy });
    
    // First try to get market stats
    const stats = await publicClient.readContract({
      address: CONFIG.MARKETPLACE_PROXY,
      abi: MARKETPLACE_ABI,
      functionName: 'getSkillMarketStats',
    });
    
    const totalNFTs = Number(stats[0]);
    const activeNFTs = Number(stats[1]);
    const expiredNFTs = Number(stats[2]);
    const totalSold = Number(stats[3]);
    const totalRevenue = formatEther(stats[4]);
    
    // If no NFTs exist
    if (totalNFTs === 0) {
      const emptyResult = {
        success: true,
        totalListings: 0,
        activeListings: [],
        message: 'No hay NFTs en el marketplace actualmente. La plataforma esta lista para recibir nuevos Skill NFTs.',
        source: 'contract',
        contractAddress: CONFIG.MARKETPLACE_PROXY,
        cached: false,
      };
      
      cache.set(cacheKey, emptyResult, cache.TTL.NFT_LISTINGS);
      return emptyResult;
    }
    
    const result = {
      success: true,
      totalListings: totalNFTs,
      activeListings: activeNFTs,
      expiredListings: expiredNFTs,
      totalSold: totalSold,
      totalRevenue: `${parseFloat(totalRevenue).toFixed(2)} POL`,
      source: 'contract',
      contractAddress: CONFIG.MARKETPLACE_PROXY,
      cached: false,
    };
    
    cache.set(cacheKey, result, cache.TTL.NFT_LISTINGS);
    log.info('NFT market stats fetched', 'BlockchainService', { total: totalNFTs, active: activeNFTs });
    return result;
    
  } catch (error) {
    log.error('❌ Error fetching NFT listings', 'BlockchainService', { error: error.message });
    
    // Return friendly error message
    return {
      success: true, // Keep success:true to not break the flow
      totalListings: 0,
      activeListings: [],
      message: 'No se pudieron obtener los NFTs del contrato. El marketplace puede estar vacío o el contrato no responde.',
      error: error.message,
      contractAddress: CONFIG.MARKETPLACE_PROXY,
    };
  }
}

// ============================================================================
// WALLET BALANCE FUNCTION
// ============================================================================

// EnhancedSmartStakingViewCore ABI - functions actually called by getUserStakingPosition
const STAKING_VIEW_ABI = [
  {
    inputs: [{ internalType: 'address', name: '_user', type: 'address' }],
    name: 'getDashboardUserSummary',
    outputs: [
      { internalType: 'uint256', name: 'userStaked', type: 'uint256' },
      { internalType: 'uint256', name: 'userPendingRewards', type: 'uint256' },
      { internalType: 'uint256', name: 'userDepositCount', type: 'uint256' },
      { internalType: 'uint256', name: 'userFlexibleBalance', type: 'uint256' },
      { internalType: 'uint256', name: 'userLockedBalance', type: 'uint256' },
      { internalType: 'uint256', name: 'userUnlockedBalance', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_user', type: 'address' }],
    name: 'getNextUnlockTime',
    outputs: [
      { internalType: 'uint256', name: 'secondsUntilUnlock', type: 'uint256' },
      { internalType: 'uint256', name: 'nextUnlockTime', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getUserDeposits',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'totalDeposited', type: 'uint256' },
          { internalType: 'uint256', name: 'totalRewards', type: 'uint256' },
          { internalType: 'uint256', name: 'depositCount', type: 'uint256' },
          { internalType: 'uint256', name: 'lastWithdrawTime', type: 'uint256' },
        ],
        internalType: 'struct EnhancedSmartStakingViewCore.UserDepositInfo',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_user', type: 'address' }],
    name: 'getUserDepositsByType',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'depositIndex', type: 'uint256' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          { internalType: 'uint256', name: 'currentRewards', type: 'uint256' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
          { internalType: 'uint256', name: 'lastClaimTime', type: 'uint256' },
          { internalType: 'uint256', name: 'lockupDuration', type: 'uint256' },
          { internalType: 'uint256', name: 'unlockTime', type: 'uint256' },
          { internalType: 'string', name: 'lockupType', type: 'string' },
          { internalType: 'bool', name: 'isLocked', type: 'bool' },
          { internalType: 'bool', name: 'isWithdrawable', type: 'bool' },
        ],
        internalType: 'struct EnhancedSmartStakingView.DepositDetails[]',
        name: 'flexible',
        type: 'tuple[]',
      },
      {
        components: [
          { internalType: 'uint256', name: 'depositIndex', type: 'uint256' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          { internalType: 'uint256', name: 'currentRewards', type: 'uint256' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
          { internalType: 'uint256', name: 'lastClaimTime', type: 'uint256' },
          { internalType: 'uint256', name: 'lockupDuration', type: 'uint256' },
          { internalType: 'uint256', name: 'unlockTime', type: 'uint256' },
          { internalType: 'string', name: 'lockupType', type: 'string' },
          { internalType: 'bool', name: 'isLocked', type: 'bool' },
          { internalType: 'bool', name: 'isWithdrawable', type: 'bool' },
        ],
        internalType: 'struct EnhancedSmartStakingView.DepositDetails[]',
        name: 'locked30',
        type: 'tuple[]',
      },
      {
        components: [
          { internalType: 'uint256', name: 'depositIndex', type: 'uint256' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          { internalType: 'uint256', name: 'currentRewards', type: 'uint256' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
          { internalType: 'uint256', name: 'lastClaimTime', type: 'uint256' },
          { internalType: 'uint256', name: 'lockupDuration', type: 'uint256' },
          { internalType: 'uint256', name: 'unlockTime', type: 'uint256' },
          { internalType: 'string', name: 'lockupType', type: 'string' },
          { internalType: 'bool', name: 'isLocked', type: 'bool' },
          { internalType: 'bool', name: 'isWithdrawable', type: 'bool' },
        ],
        internalType: 'struct EnhancedSmartStakingView.DepositDetails[]',
        name: 'locked90',
        type: 'tuple[]',
      },
      {
        components: [
          { internalType: 'uint256', name: 'depositIndex', type: 'uint256' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          { internalType: 'uint256', name: 'currentRewards', type: 'uint256' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
          { internalType: 'uint256', name: 'lastClaimTime', type: 'uint256' },
          { internalType: 'uint256', name: 'lockupDuration', type: 'uint256' },
          { internalType: 'uint256', name: 'unlockTime', type: 'uint256' },
          { internalType: 'string', name: 'lockupType', type: 'string' },
          { internalType: 'bool', name: 'isLocked', type: 'bool' },
          { internalType: 'bool', name: 'isWithdrawable', type: 'bool' },
        ],
        internalType: 'struct EnhancedSmartStakingView.DepositDetails[]',
        name: 'locked180',
        type: 'tuple[]',
      },
      {
        components: [
          { internalType: 'uint256', name: 'depositIndex', type: 'uint256' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          { internalType: 'uint256', name: 'currentRewards', type: 'uint256' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
          { internalType: 'uint256', name: 'lastClaimTime', type: 'uint256' },
          { internalType: 'uint256', name: 'lockupDuration', type: 'uint256' },
          { internalType: 'uint256', name: 'unlockTime', type: 'uint256' },
          { internalType: 'string', name: 'lockupType', type: 'string' },
          { internalType: 'bool', name: 'isLocked', type: 'bool' },
          { internalType: 'bool', name: 'isWithdrawable', type: 'bool' },
        ],
        internalType: 'struct EnhancedSmartStakingView.DepositDetails[]',
        name: 'locked365',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

function summarizeDepositsByType(depositsByType) {
  const types = [
    { key: 'flexible', label: 'Flexible' },
    { key: 'locked30', label: 'Locked 30d' },
    { key: 'locked90', label: 'Locked 90d' },
    { key: 'locked180', label: 'Locked 180d' },
    { key: 'locked365', label: 'Locked 365d' },
  ];

  const summary = {};
  let nextUnlock = null;

  for (let idx = 0; idx < types.length; idx++) {
    const { key, label } = types[idx];
    const list = Array.isArray(depositsByType?.[idx]) ? depositsByType[idx] : [];
    const withdrawableCount = list.filter(d => d?.isWithdrawable).length;
    const totalAmount = list.reduce((acc, d) => acc + Number(formatEther(d?.amount ?? 0n)), 0);

    for (const d of list) {
      const unlockTime = Number(d?.unlockTime ?? 0n);
      if (unlockTime > 0 && (!nextUnlock || unlockTime < nextUnlock)) nextUnlock = unlockTime;
    }

    summary[key] = {
      label,
      count: list.length,
      withdrawableCount,
      totalAmountPOL: totalAmount,
    };
  }

  return { summary, nextUnlock };
}

function buildStakingRecommendations({
  depositCount,
  totalDepositedPOL,
  pendingRewardsPOL,
  hasAutoCompound,
  depositSummary,
  apyRates,
}) {
  const recs = [];

  if (!depositCount || depositCount === 0) {
    recs.push('No tienes depósitos activos: para maximizar rewards, crea un depósito (locked suele pagar más que flexible).');
    return recs;
  }

  if (pendingRewardsPOL >= 0.1) {
    recs.push('Tienes recompensas acumuladas: considera reclamarlas y re-depositarlas para capitalizar (compound) si tu estrategia es largo plazo.');
  }

  if (hasAutoCompound === false) {
    recs.push('Si existe la opción en el dApp, activa Auto-Compound para reducir el trabajo manual y mejorar el rendimiento compuesto.');
  }

  const flexibleCount = depositSummary?.flexible?.count ?? 0;
  if (flexibleCount > 0) {
    const flexAPY = typeof apyRates?.flexible === 'number' ? apyRates.flexible.toFixed(2) : 'N/A';
    const lock90APY = typeof apyRates?.locked90 === 'number' ? apyRates.locked90.toFixed(2) : 'N/A';
    const lock365APY = typeof apyRates?.locked365 === 'number' ? apyRates.locked365.toFixed(2) : 'N/A';
    recs.push(`Tienes depósitos Flexibles: si no necesitas liquidez, mover parte a Locked (30/90/180/365) normalmente mejora el APY (p.ej. ${flexAPY}% vs ${lock90APY}% / ${lock365APY}%).`);
  }

  const withdrawable = Object.values(depositSummary || {}).reduce((acc, v) => acc + (v?.withdrawableCount ?? 0), 0);
  if (withdrawable > 0) {
    recs.push('Tienes depósitos retirables: revisa si te conviene retirar y re-lockear para mejorar tasa (si sigues en largo plazo).');
  }

  if (totalDepositedPOL > 0 && totalDepositedPOL < 5) {
    recs.push('Tu total depositado es bajo: revisa mínimo/fees para que el gas no coma el rendimiento.');
  }

  return recs.slice(0, 5);
}

/**
 * Get user staking position (deposits + rewards) from EnhancedSmartStakingViewCore.
 * Uses actual ViewCore functions: getDashboardUserSummary, getNextUnlockTime, getUserDeposits
 */
async function getUserStakingPosition(address) {
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return { success: false, error: 'Invalid wallet address format' };
  }

  const cacheKey = `user_staking_${address.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, cached: true };

  try {
    // Call actual ViewCore functions (not the non-existent getUserDetailedStats/getUserDepositsByType)
    const [dashboard, nextUnlock, userDepositsInfo, apy] = await Promise.all([
      publicClient.readContract({
        address: CONFIG.STAKING_VIEW_CORE,
        abi: STAKING_VIEW_ABI,
        functionName: 'getDashboardUserSummary',
        args: [address],
      }).catch(() => [0n, 0n, 0n, 0n, 0n, 0n]), // Fallback if reverts
      publicClient.readContract({
        address: CONFIG.STAKING_VIEW_CORE,
        abi: STAKING_VIEW_ABI,
        functionName: 'getNextUnlockTime',
        args: [address],
      }).catch(() => [0n, 0n]), // Fallback if no locked deposits
      publicClient.readContract({
        address: CONFIG.STAKING_VIEW_CORE,
        abi: STAKING_VIEW_ABI,
        functionName: 'getUserDeposits',
        args: [address],
      }).catch(() => [0n, 0n, 0n, 0n]), // Fallback
      publicClient.readContract({
        address: CONFIG.STAKING_VIEW_STATS,
        abi: STAKING_VIEWER_ABI,
        functionName: 'getAPYRates',
      }).catch(() => [96n, 172n, 227n, 303n, 319n]), // v6.2 fallback APYs (x10)
    ]);

    // getDashboardUserSummary returns: [userStaked, userPendingRewards, userDepositCount, userFlexibleBalance, userLockedBalance, userUnlockedBalance]
    const totalDepositedPOL = Number(formatEther(dashboard[0] ?? 0n));
    const pendingRewardsWei = dashboard[1] ?? 0n;
    const depositCount = Number(dashboard[2] ?? 0n);
    const flexibleBalancePOL = Number(formatEther(dashboard[3] ?? 0n));
    const lockedBalancePOL = Number(formatEther(dashboard[4] ?? 0n));
    const unlockedBalancePOL = Number(formatEther(dashboard[5] ?? 0n));
    const pendingRewardsPOL = Number(formatEther(pendingRewardsWei));

    // getNextUnlockTime returns: [secondsUntilUnlock, nextUnlockTime]
    const nextUnlockTimeSec = Number(nextUnlock[1] ?? 0n);

    // getUserDeposits returns UserDepositInfo: {totalDeposited, totalRewards, depositCount, lastWithdrawTime}
    const lastWithdrawTime = Number(userDepositsInfo[3] ?? 0n);

    // APY rates from ViewStats: values like 96 = 9.6%, divide by 10
    const apyRates = {
      flexible: Number(apy[0]) / 10,
      locked30: Number(apy[1]) / 10,
      locked90: Number(apy[2]) / 10,
      locked180: Number(apy[3]) / 10,
      locked365: Number(apy[4]) / 10,
    };

    // Build deposit summary compatible with the formatter
    // We estimate locked deposit distribution based on locked balance vs total
    const hasLockedDeposits = lockedBalancePOL > 0;
    const hasFlexibleDeposits = flexibleBalancePOL > 0;
    
    // Estimate distribution (we don't have exact per-type breakdown from ViewCore)
    // Use 30d as default for locked if we can't determine exact type
    const depositSummary = {
      flexible: {
        label: 'Flexible',
        count: hasFlexibleDeposits ? Math.max(1, Math.floor(depositCount * flexibleBalancePOL / (totalDepositedPOL || 1))) : 0,
        withdrawableCount: hasFlexibleDeposits ? 1 : 0,
        totalAmountPOL: flexibleBalancePOL,
      },
      locked30: {
        label: 'Locked 30d',
        count: hasLockedDeposits && lockedBalancePOL > 0 ? 1 : 0, // Estimate at least one locked
        withdrawableCount: 0,
        totalAmountPOL: lockedBalancePOL * 0.3, // Rough estimate
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
        totalAmountPOL: lockedBalancePOL * 0.7, // Rough estimate
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

    const result = {
      success: true,
      address,
      totalDepositedPOL: `${totalDepositedPOL.toFixed(6)} POL`,
      depositCount,
      pendingRewardsPOL: `${pendingRewardsPOL.toFixed(6)} POL`,
      baseRewardsPOL: `${pendingRewardsPOL.toFixed(6)} POL`, // Same as pending for now
      boostedRewardsPOL: `${pendingRewardsPOL.toFixed(6)} POL`,
      hasAutoCompound: false,
      userLevel: 1, // Not available from ViewCore, default to 1
      userXP: 0, // Not available from ViewCore
      activeSkills: '0/5', // Not available from ViewCore
      stakingBoostTotal: 0, // Not available from ViewCore
      lastWithdrawTime: lastWithdrawTime ? new Date(lastWithdrawTime * 1000).toISOString() : null,
      nextUnlockTime: nextUnlockTimeSec > 0 ? new Date(nextUnlockTimeSec * 1000).toISOString() : null,
      apyRates,
      depositSummary,
      recommendations,
      source: 'contract',
      contractAddress: CONFIG.STAKING_CONTRACT,
      cached: false,
    };

    cache.set(cacheKey, result, cache.TTL.WALLET_BALANCE);
    return result;
  } catch (error) {
    log.error('❌ Error fetching user staking position', 'BlockchainService', { error: error.message });
    return {
      success: false,
      address,
      error: error.message || 'Failed to fetch user staking position',
    };
  }
}

/**
 * Get wallet balance for a specific address
 */
async function getWalletBalance(address) {
  // Validate address
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return {
      success: false,
      error: 'Invalid wallet address format',
    };
  }
  
  const cacheKey = `wallet_${address.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    log.info('👛 Wallet balance from cache', 'BlockchainService', { cached: true });
    return { ...cached, cached: true };
  }
  
  try {
    log.info('👛 Fetching wallet balance', 'BlockchainService', { address: `${address.slice(0, 6)}...${address.slice(-4)}` });

    const [balanceWei, polPrice, stakingPosition] = await Promise.all([
      publicClient.getBalance({ address }),
      getPolPrice(),
      getUserStakingPosition(address),
    ]);

    const balancePol = Number(formatEther(balanceWei));
    const priceUsd = polPrice.success ? (polPrice.price || 0.12) : 0.12;

    const stakedAmount = stakingPosition?.success ? stakingPosition.totalDepositedPOL : '0 POL';
    const pendingRewards = stakingPosition?.success ? stakingPosition.pendingRewardsPOL : '0 POL';

    const result = {
      success: true,
      address: address,
      balancePOL: `${balancePol.toFixed(4)} POL`,
      balanceUSD: balancePol * priceUsd,
      stakedAmount,
      pendingRewards,
      nftCount: 0,
      staking: stakingPosition?.success ? stakingPosition : undefined,
      cached: false,
      source: 'polygon',
    };
    
    cache.set(cacheKey, result, cache.TTL.WALLET_BALANCE);
    log.info('👛 Wallet balance fetched', 'BlockchainService', { balance: result.balancePOL });
    
    return result;
    
  } catch (error) {
    log.error('❌ Error fetching wallet balance', 'BlockchainService', { error: error.message });
    return {
      success: false,
      address: address,
      error: error.message || 'Failed to fetch wallet balance',
    };
  }
}

// ============================================================================
// STAKING REWARD ESTIMATION FUNCTION
// ============================================================================

/**
 * Estimate staking rewards
 */
async function estimateStakingReward(amount, durationDays, isLocked = false) {
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
    log.info('📈 Estimating staking reward', 'BlockchainService', { amount, durationDays, isLocked });
    
    // Get real APY rates from contract — Smart Staking v6.2
    let flexibleAPY = 9.6;  // v6.2 base rate (flexible)
    let lockedAPY = 22.7;   // v6.2 base rate (90d default)
    
    try {
      const apyRates = await publicClient.readContract({
        address: CONFIG.STAKING_VIEW_STATS,
        abi: STAKING_VIEWER_ABI,
        functionName: 'getAPYRates',
      });
      flexibleAPY = Number(apyRates[0]) / 10;
      // Choose APY based on duration
      if (durationDays <= 30) lockedAPY = Number(apyRates[1]) / 10;
      else if (durationDays <= 90) lockedAPY = Number(apyRates[2]) / 10;
      else if (durationDays <= 180) lockedAPY = Number(apyRates[3]) / 10;
      else lockedAPY = Number(apyRates[4]) / 10;
    } catch (err) {
      log.warn('⚠️ Could not fetch APY from contract, using defaults', 'BlockchainService');
    }
    
    const effectiveApy = isLocked ? lockedAPY : flexibleAPY;
    const dailyRate = effectiveApy / 365 / 100;
    const estimatedReward = amount * dailyRate * durationDays;
    
    const polPrice = await getPolPrice();
    const priceUsd = polPrice.success ? (polPrice.price || 0.5) : 0.5;
    
    return {
      success: true,
      amount: `${amount} POL`,
      duration: `${durationDays} days`,
      estimatedReward: `${estimatedReward.toFixed(4)} POL`,
      estimatedRewardUSD: estimatedReward * priceUsd,
      apy: effectiveApy,
      lockBonus: lockBonus,
    };
    
  } catch (error) {
    log.error('❌ Error estimating reward', 'BlockchainService', { error: error.message });
    return {
      success: false,
      error: error.message || 'Failed to estimate reward',
    };
  }
}

// ============================================================================
// USER NFTs FUNCTION
// ============================================================================

/**
 * Get user's NFT balance and active listings from the Nuxchain marketplace
 */
async function getUserNFTs(address) {
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return { success: false, error: 'Invalid wallet address format' };
  }

  const cacheKey = `user_nfts_${address.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, cached: true };

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
  ];

  try {
    const balanceRaw = await publicClient.readContract({
      address: CONFIG.MARKETPLACE_PROXY,
      abi: MARKETPLACE_ERC721_ABI,
      functionName: 'balanceOf',
      args: [address],
    });

    const nftBalance = Number(balanceRaw);
    let activeListings = 0;

    try {
      const listingsRaw = await publicClient.readContract({
        address: CONFIG.MARKETPLACE_PROXY,
        abi: MARKETPLACE_ERC721_ABI,
        functionName: 'getUserActiveListingsCount',
        args: [address],
      });
      activeListings = Number(listingsRaw);
    } catch {
      // getUserActiveListingsCount may not exist on all versions — non-fatal
    }

    const note = nftBalance === 0
      ? 'No NFTs found for this wallet. Create your own NFTs in the Nuxchain Marketplace or browse available collections.'
      : `Found ${nftBalance} NFT(s) in your wallet. ${activeListings > 0 ? `${activeListings} currently listed for sale.` : 'None currently listed. You can list them for sale in the marketplace.'}`;

    const result = {
      success: true,
      address,
      nftBalance,
      activeListings,
      contractAddress: CONFIG.MARKETPLACE_PROXY,
      cached: false,
      note,
    };

    cache.set(cacheKey, result, cache.TTL.WALLET_BALANCE);
    log.info(`✅ User NFTs fetched: ${nftBalance} NFTs, ${activeListings} listings`, 'BlockchainService');
    return result;

  } catch (error) {
    log.error('❌ Error fetching user NFTs', 'BlockchainService', { error: error.message });
    return {
      success: false,
      address,
      error: error.message || 'Failed to fetch NFT data from blockchain',
      contractAddress: CONFIG.MARKETPLACE_PROXY,
    };
  }
}

// ============================================================================
// FUNCTION EXECUTOR
// ============================================================================

/**
 * Execute a blockchain function by name
 */
async function executeBlockchainFunction(functionName, args = {}) {
  log.info(`🔗 Executing blockchain function: ${functionName}`, 'BlockchainService', args);
  
  switch (functionName) {
    case 'get_pol_price':
      return await getPolPrice();
      
    case 'get_staking_info':
      return await getStakingInfo();
      
    case 'get_nft_listings':
      return await getNftListings(args.limit || 10, args.sort_by || 'recent');
      
    case 'check_wallet_balance':
      // Aceptar 'address', 'walletAddress' o 'connectedWallet'
      const walletAddr = args.address || args.walletAddress || args.connectedWallet;
      if (!walletAddr) {
        return { 
          success: false, 
          error: 'No se proporciono una direccion de wallet. Conecta tu wallet o proporciona una direccion 0x.',
          hint: 'Ejemplo: "cual es el balance de 0x1234..."'
        };
      }
      return await getWalletBalance(walletAddr);

    case 'get_user_staking_position':
      // Aceptar 'address', 'walletAddress' o 'connectedWallet'
      const stakingAddr = args.address || args.walletAddress || args.connectedWallet;
      if (!stakingAddr) {
        return {
          success: false,
          error: 'No se proporciono una direccion de wallet. Conecta tu wallet o proporciona una direccion 0x.',
        };
      }
      return await getUserStakingPosition(stakingAddr);
      
    case 'estimate_staking_reward':
      // Usar defaults si no se proporcionan
      const amount = args.amount || 100;
      const durationDays = args.duration_days || args.durationDays || 30;
      return await estimateStakingReward(
        amount,
        durationDays,
        args.is_locked || args.isLocked || false
      );

    case 'get_user_nfts': {
      const nftAddr = args.address || args.walletAddress || args.connectedWallet;
      if (!nftAddr) {
        return { success: false, error: 'Para ver tus NFTs, conecta tu wallet o proporciona una dirección (ej: 0x1234...)' };
      }
      return await getUserNFTs(nftAddr);
    }
      
    default:
      return { success: false, error: `Unknown function: ${functionName}` };
  }
}

// ============================================================================
// FUNCTION DECLARATIONS FOR GEMINI
// ============================================================================

const blockchainFunctionDeclarations = [
  {
    name: 'get_pol_price',
    description: `Get the current POL (Polygon/MATIC) token price and market data.
Use when user asks about POL price, market cap, or trading volume.
Returns: price in USD, 24h change, market cap, volume.`,
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_staking_info',
    description: `Get Nuxchain staking contract statistics.
Use when user asks about staking APY, total staked, or participants.
Returns: total staked, APY (125%), participants, rewards paid.`,
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_nft_listings',
    description: `Get NFT marketplace listings from Nuxchain Skills marketplace.
Use when user asks about NFTs for sale or marketplace activity.
Returns: active listings, floor price, total volume.`,
    parameters: {
      type: 'object',
      properties: {
        limit: {
          type: 'integer',
          description: 'Max listings to return (1-50). Default: 10',
        },
        sort_by: {
          type: 'string',
          enum: ['price', 'recent'],
          description: 'Sort by price or most recent. Default: recent',
        },
      },
      required: [],
    },
  },
  {
    name: 'check_wallet_balance',
    description: `Check POL balance for a wallet address.
ONLY use when user explicitly provides a wallet address (0x...).
Returns: POL balance, USD value, staked amount.`,
    parameters: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'Ethereum/Polygon wallet address (0x...)',
        },
      },
      required: ['address'],
    },
  },
  {
    name: 'get_user_staking_position',
    description: `Get the connected user's SmartStaking deposits and pending rewards.
Use when user asks about their staking position, deposits, accumulated rewards, or how to optimize staking.
Returns: total deposited, pending rewards (boosted), deposit count, lock breakdown, and recommendations.` ,
    parameters: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'Ethereum/Polygon wallet address (0x...)',
        },
      },
      required: ['address'],
    },
  },
  {
    name: 'estimate_staking_reward',
    description: `Calculate estimated staking rewards.
Use when user asks "how much would I earn staking X POL for Y days?"
Returns: estimated reward in POL and USD, APY, lock bonus.`,
    parameters: {
      type: 'object',
      properties: {
        amount: {
          type: 'number',
          description: 'Amount of POL to stake (must be > 0)',
        },
        duration_days: {
          type: 'integer',
          description: 'Days to stake (1-365)',
        },
        is_locked: {
          type: 'boolean',
          description: 'Locked staking (+25% bonus). Default: false',
        },
      },
      required: ['amount', 'duration_days'],
    },
  },
  {
    name: 'get_user_nfts',
    description: `Get the connected user's Skill NFT balance and active marketplace listings.
Use when user asks about their own NFTs, minted NFTs, or marketplace listings.
- "mis NFTs", "my NFTs", "cuántos NFT tengo", "NFTs minteados"
- "mis listings", "my listings", "NFTs for sale"
Returns: total NFT balance, active listing count, contract address.`,
    parameters: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'Ethereum/Polygon wallet address (0x...)',
        },
      },
      required: ['address'],
    },
  },
];

const blockchainFunctionNames = [
  'get_pol_price',
  'get_staking_info',
  'get_nft_listings',
  'check_wallet_balance',
  'get_user_staking_position',
  'estimate_staking_reward',
  'get_user_nfts',
];

// ============================================================================
// EXPORTS
// ============================================================================

export {
  getPolPrice,
  getStakingInfo,
  getNftListings,
  getUserNFTs,
  getWalletBalance,
  getUserStakingPosition,
  estimateStakingReward,
  executeBlockchainFunction,
  blockchainFunctionDeclarations,
  blockchainFunctionNames,
  cache as blockchainCache,
};

export default {
  getPolPrice,
  getStakingInfo,
  getNftListings,
  getUserNFTs,
  getWalletBalance,
  estimateStakingReward,
  executeBlockchainFunction,
  blockchainFunctionDeclarations,
  blockchainFunctionNames,
};
