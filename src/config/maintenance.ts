/**
 * Maintenance Configuration
 * Controls maintenance mode for different routes
 */

interface MaintenanceRoute {
  enabled: boolean;
  estimatedTime: number; // in minutes
  message: string;
  startTime: string;
}

export const MAINTENANCE_CONFIG: {
  airdrop: MaintenanceRoute;
  nfts: MaintenanceRoute;
  marketplace: MaintenanceRoute;
} = {
  airdrop: {
    // Airdrop with 48-hour countdown (2880 minutes)
    enabled: true,
    estimatedTime: 2880, // 48 hours
    message: 'We are optimizing our system to reduce resource consumption and improve your experience. The Airdrop will be available in 48 hours. Thank you for your patience!',
    startTime: new Date().toISOString(),
  },
  nfts: {
    enabled: true,
    estimatedTime: 120,
    message: 'We are updating the NFT Hub with new features and optimizations. We will be back soon with amazing improvements.',
    startTime: new Date().toISOString(),
  },
  marketplace: {
    enabled: true,
    estimatedTime: 120,
    message: 'The Marketplace is being optimized to give you a better buying and selling experience. We will be back very soon.',
    startTime: new Date().toISOString(),
  },
};

export const isMaintenanceMode = (route: 'airdrop' | 'nfts' | 'marketplace' = 'airdrop'): boolean => {
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
