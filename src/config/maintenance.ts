/**
 * Maintenance Configuration
 * Controls maintenance mode for different routes
 */

// Extend Window interface to include dev overrides
declare global {
  interface Window {
    __NUX_DEV_OVERRIDES__?: {
      airdrop?: boolean;
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
const NFTS_START_TIME = new Date().toISOString();
const MARKETPLACE_START_TIME = new Date().toISOString();

export const MAINTENANCE_CONFIG: {
  airdrop: MaintenanceRoute;
  nfts: MaintenanceRoute;
  marketplace: MaintenanceRoute;
} = {
  airdrop: {
    // Airdrop - MAINTENANCE ENABLED
    enabled: true,
    estimatedTime: 2880, // 48 hours
    message: 'We are optimizing our system to reduce resource consumption and improve your experience. The Airdrop will be available in 48 hours. Thank you for your patience!',
    startTime: getOrInitializeStartTime('airdrop', AIRDROP_START_TIME),
  },
  nfts: {
    enabled: true,
    estimatedTime: 120,
    message: 'We are updating the NFT Hub with new features and optimizations. We will be back soon with amazing improvements.',
    startTime: getOrInitializeStartTime('nfts', NFTS_START_TIME),
  },
  marketplace: {
    enabled: true,
    estimatedTime: 120,
    message: 'The Marketplace is being optimized to give you a better buying and selling experience. We will be back very soon.',
    startTime: getOrInitializeStartTime('marketplace', MARKETPLACE_START_TIME),
  },
};

export const isMaintenanceMode = (route: 'airdrop' | 'nfts' | 'marketplace' = 'airdrop'): boolean => {
  // Dev override: bypass maintenance for airdrop if __NUX_DEV_OVERRIDES__.airdrop = false
  // Evaluated dynamically each call to allow runtime changes
  const devOverride = typeof window !== 'undefined' && window.__NUX_DEV_OVERRIDES__?.airdrop === false;
  if (route === 'airdrop' && devOverride) return false;
  
  const config = MAINTENANCE_CONFIG[route];
  if (!config.enabled) return false;
  
  // Auto-disable después del tiempo estimado (solo para airdrop con 48h)
  if (route === 'airdrop') {
    const startTime = new Date(config.startTime).getTime();
    const estimatedEndTime = startTime + config.estimatedTime * 60 * 1000;
    const now = Date.now();
    
    if (now >= estimatedEndTime) {
      // El tiempo expiró, desactivar mantenimiento automáticamente
      return false;
    }
  }
  
  return config.enabled;
};

export const getMaintenanceTimeRemaining = (route: 'airdrop' | 'nfts' | 'marketplace' = 'airdrop'): number => {
  const config = MAINTENANCE_CONFIG[route];
  const startTime = new Date(config.startTime).getTime();
  const estimatedEndTime = startTime + config.estimatedTime * 60 * 1000;
  const now = Date.now();
  const remaining = Math.max(0, estimatedEndTime - now);
  
  return Math.ceil(remaining / 1000); // Return in seconds
};

export const getMaintenanceConfig = (route: 'airdrop' | 'nfts' | 'marketplace'): MaintenanceRoute => {
  return MAINTENANCE_CONFIG[route];
};
