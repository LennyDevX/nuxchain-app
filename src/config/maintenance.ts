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
      store?: boolean;
      labs?: boolean;
      devhub?: boolean;
      chat?: boolean;
      giveaway?: boolean;
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
  const storageKey = `maintenance_start_time_${route}_v4`;
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
const STAKING_START_TIME = '2026-02-26T06:00:00Z';
const NFTS_START_TIME = new Date().toISOString();
const MARKETPLACE_START_TIME = new Date().toISOString();
const TOKENOMICS_START_TIME = new Date().toISOString();
const COLAB_START_TIME = new Date().toISOString();
const STORE_START_TIME = new Date().toISOString();
const LABS_START_TIME = new Date().toISOString();
const DEVHUB_START_TIME = new Date().toISOString();


export const MAINTENANCE_CONFIG: {
  airdrop: MaintenanceRoute;
  staking: MaintenanceRoute;
  nfts: MaintenanceRoute;
  marketplace: MaintenanceRoute;
  tokenomics: MaintenanceRoute;
  colab: MaintenanceRoute;
  store: MaintenanceRoute;
  labs: MaintenanceRoute;
  devhub: MaintenanceRoute;
  chat: MaintenanceRoute;
  giveaway: MaintenanceRoute;
} = {
  airdrop: {
    enabled: false,
    estimatedTime: 4320, // 3 days
    message: 'The Airdrop section is currently paused. We are rethinking our rewards distribution strategy. Check back soon for updates!',
    startTime: getOrInitializeStartTime('airdrop', AIRDROP_START_TIME),
  },
  staking: {
    enabled: false,
    estimatedTime: 7200, // 5 days
    message: 'Smart Staking is being upgraded to v2 — new mechanics, better rewards, deeper DeFi integration on Polygon. Back very soon.',
    startTime: getOrInitializeStartTime('staking', STAKING_START_TIME),
  },
  nfts: {
    enabled: false,
    estimatedTime: 4320, // 3 days
    message: 'We are updating the NFT Hub with new features and optimizations. We will be back soon with amazing improvements.',
    startTime: getOrInitializeStartTime('nfts', NFTS_START_TIME),
  },
  marketplace: {
    enabled: false,
    estimatedTime: 4320, // 3 days
    message: 'The Marketplace is being optimized to give you a better buying and selling experience. We will be back very soon.',
    startTime: getOrInitializeStartTime('marketplace', MARKETPLACE_START_TIME),
  },
  tokenomics: {
    enabled: false,
    estimatedTime: 7200, // 5 days
    message: 'We are rebuilding Tokenomics with our new dual-chain ecosystem vision. Solana for services, Polygon for DeFi — new page coming soon.',
    startTime: getOrInitializeStartTime('tokenomics', TOKENOMICS_START_TIME),
  },
  colab: {
    enabled: false,
    estimatedTime: 4320, // 3 days
    message: 'The Colab Portal is being upgraded with new collaboration tools and enhanced builder rewards. We will be back shortly with exciting improvements.',
    startTime: getOrInitializeStartTime('colab', COLAB_START_TIME),
  },
  store: {
    enabled: false,
    estimatedTime: 4320, // 3 days
    message: 'The Skills Store is undergoing major upgrades to bring you new skills, better pricing, and an improved purchasing experience. Back soon!',
    startTime: getOrInitializeStartTime('store', STORE_START_TIME),
  },
  labs: {
    enabled: false,
    estimatedTime: 4320, // 3 days
    message: 'NuxChain Labs is being upgraded with new experimental tools and DeFi features. We will be back shortly with exciting new capabilities.',
    startTime: getOrInitializeStartTime('labs', LABS_START_TIME),
  },
  devhub: {
    enabled: false,
    estimatedTime: 4320, // 3 days
    message: 'The Developer Hub is undergoing major improvements to bring you better documentation, tools, and builder resources. Back soon!',
    startTime: getOrInitializeStartTime('devhub', DEVHUB_START_TIME),
  },
  chat: {
    enabled: false,
    estimatedTime: 1440, // 24 hours
    message: 'We are upgrading Nuxbee AI with enhanced features, better performance, and improved conversation history management. This upgrade will enable cloud-based conversation persistence and faster AI responses.',
    startTime: getOrInitializeStartTime('chat', new Date().toISOString()),
  },
  giveaway: {
    enabled: false,
    estimatedTime: 2880, // 48 hours
    message: 'Giveaway program is paused. A new rewards system is coming soon — stay tuned on X and Telegram!',
    startTime: getOrInitializeStartTime('giveaway', new Date().toISOString()),
  },
};

export const isMaintenanceMode = (route: 'airdrop' | 'staking' | 'nfts' | 'marketplace' | 'tokenomics' | 'colab' | 'store' | 'labs' | 'devhub' | 'chat' | 'giveaway' = 'airdrop'): boolean => {
  // Dev override: bypass maintenance for ANY route via browser console
  // Usage: window.__NUX_DEV_OVERRIDES__ = { [route]: false }
  const devOverride = typeof window !== 'undefined' && window.__NUX_DEV_OVERRIDES__?.[route] === false;
  if (devOverride) return false;
  
  const config = MAINTENANCE_CONFIG[route];
  return config.enabled;
};

export const getMaintenanceTimeRemaining = (route: 'airdrop' | 'staking' | 'nfts' | 'marketplace' | 'tokenomics' | 'colab' | 'store' | 'labs' | 'devhub' | 'chat' | 'giveaway' = 'airdrop'): number => {
  const config = MAINTENANCE_CONFIG[route];
  const startTime = new Date(config.startTime).getTime();
  const estimatedEndTime = startTime + config.estimatedTime * 60 * 1000;
  const now = Date.now();
  const remaining = Math.max(0, estimatedEndTime - now);
  
  return Math.ceil(remaining / 1000); // Return in seconds
};

export const getMaintenanceConfig = (route: 'airdrop' | 'staking' | 'nfts' | 'marketplace' | 'tokenomics' | 'colab' | 'store' | 'labs' | 'devhub' | 'chat' | 'giveaway'): MaintenanceRoute => {
  return MAINTENANCE_CONFIG[route];
};
