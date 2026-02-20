/**
 * Maintenance Configuration
 * Controls maintenance mode for different routes
 */

// Extend Window interface to include dev overrides
declare global {
  interface Window {
    __NUX_DEV_OVERRIDES__?: {
      airdrop?: boolean;
      staking?: boolean;
      nfts?: boolean;
      marketplace?: boolean;
      tokenomics?: boolean;
      colab?: boolean;
    };
  }
}

interface MaintenanceRoute {
  enabled: boolean;
  estimatedTime: number; // in minutes
  message: string;
  startTime: string;
}

// Get or initialize startTime from localStorage with a persistent fixed time
const getOrInitializeStartTime = (route: string, fallbackTime: string): string => {
  const storageKey = `maintenance_start_time_${route}_v2`;
  let startTime = localStorage.getItem(storageKey);
  
  if (!startTime) {
    startTime = fallbackTime;
    localStorage.setItem(storageKey, startTime);
  }
  
  return startTime;
};

// Format: 2026-02-05T06:00:00Z (5 Feb 2026 01:00 AM EST = 06:00 UTC)
// This is when the countdown was launched
const AIRDROP_START_TIME = '2026-02-05T06:00:00Z';
const STAKING_START_TIME = '2026-02-16T12:00:00Z';
const NFTS_START_TIME = new Date().toISOString();
const MARKETPLACE_START_TIME = new Date().toISOString();
const TOKENOMICS_START_TIME = new Date().toISOString();
const COLAB_START_TIME = new Date().toISOString();
const STORE_START_TIME = new Date().toISOString();

export const MAINTENANCE_CONFIG: {
  airdrop: MaintenanceRoute;
  staking: MaintenanceRoute;
  nfts: MaintenanceRoute;
  marketplace: MaintenanceRoute;
  tokenomics: MaintenanceRoute;
  colab: MaintenanceRoute;
  store: MaintenanceRoute;
} = {
  airdrop: {
    // Airdrop - MAINTENANCE DISABLED
    enabled: false,
    estimatedTime: 2880, // 48 hours
    message: 'We are optimizing our system to reduce resource consumption and improve your experience. The Airdrop will be available in 48 hours. Thank you for your patience!',
    startTime: getOrInitializeStartTime('airdrop', AIRDROP_START_TIME),
  },
  staking: {
    // Staking - MAINTENANCE ENABLED
    enabled: true,
    estimatedTime: 7200, // 5 days (5 * 24 * 60)
    message: 'We are upgrading the Staking system with enhanced features and improved rewards. The staking platform will be available in 5 days with better performance and new staking options.',
    startTime: getOrInitializeStartTime('staking', STAKING_START_TIME),
  },
  nfts: {
    enabled: true,
    estimatedTime: 4320, // 3 days
    message: 'We are updating the NFT Hub with new features and optimizations. We will be back soon with amazing improvements.',
    startTime: getOrInitializeStartTime('nfts', NFTS_START_TIME),
  },
  marketplace: {
    enabled: true,
    estimatedTime: 4320, // 3 days
    message: 'The Marketplace is being optimized to give you a better buying and selling experience. We will be back very soon.',
    startTime: getOrInitializeStartTime('marketplace', MARKETPLACE_START_TIME),
  },
  tokenomics: {
    enabled: true,
    estimatedTime: 7200, // 5 days (5 * 24 * 60)
    message: 'Major Protocol Update: We are optimizing the $NUX Tokenomics to improve long-term sustainability and community rewards. Tokenomics 2.0 details arriving soon.',
    startTime: getOrInitializeStartTime('tokenomics', TOKENOMICS_START_TIME),
  },
  colab: {
    enabled: true,
    estimatedTime: 4320, // 3 days
    message: 'The Colab Portal is being upgraded with new collaboration tools and enhanced builder rewards. We will be back shortly with exciting improvements.',
    startTime: getOrInitializeStartTime('colab', COLAB_START_TIME),
  },
  store: {
    enabled: true,
    estimatedTime: 4320, // 3 days
    message: 'The Skills Store is undergoing major upgrades to bring you new skills, better pricing, and an improved purchasing experience. Back soon!',
    startTime: getOrInitializeStartTime('store', STORE_START_TIME),
  },
};

export const isMaintenanceMode = (route: 'airdrop' | 'staking' | 'nfts' | 'marketplace' | 'tokenomics' | 'colab' | 'store' = 'airdrop'): boolean => {
  // Dev override: bypass maintenance for airdrop if __NUX_DEV_OVERRIDES__.airdrop = false
  const devOverride = typeof window !== 'undefined' && window.__NUX_DEV_OVERRIDES__?.airdrop === false;
  if (route === 'airdrop' && devOverride) return false;
  
  const config = MAINTENANCE_CONFIG[route];
  if (!config.enabled) return false;
  
  // Auto-disable después del tiempo estimado (solo para airdrop, staking y colab)
  if (route === 'airdrop' || route === 'staking' || route === 'colab') {
    const startTime = new Date(config.startTime).getTime();
    const estimatedEndTime = startTime + config.estimatedTime * 60 * 1000;
    const now = Date.now();
    
    if (now >= estimatedEndTime) {
      return false;
    }
  }
  
  return config.enabled;
};

export const getMaintenanceTimeRemaining = (route: 'airdrop' | 'staking' | 'nfts' | 'marketplace' | 'tokenomics' | 'colab' | 'store' = 'airdrop'): number => {
  const config = MAINTENANCE_CONFIG[route];
  const startTime = new Date(config.startTime).getTime();
  const estimatedEndTime = startTime + config.estimatedTime * 60 * 1000;
  const now = Date.now();
  const remaining = Math.max(0, estimatedEndTime - now);
  
  return Math.ceil(remaining / 1000); // Return in seconds
};

export const getMaintenanceConfig = (route: 'airdrop' | 'staking' | 'nfts' | 'marketplace' | 'tokenomics' | 'colab' | 'store'): MaintenanceRoute => {
  return MAINTENANCE_CONFIG[route];
};
