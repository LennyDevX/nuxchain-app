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
    // Airdrop con countdown de 48 horas (2880 minutos)
    enabled: true,
    estimatedTime: 2880, // 48 horas
    message: 'Estamos optimizando nuestro sistema para reducir el consumo de recursos y mejorar la experiencia. El Airdrop estará disponible en 48 horas. ¡Gracias por tu paciencia!',
    startTime: new Date().toISOString(),
  },
  nfts: {
    enabled: true,
    estimatedTime: 120,
    message: 'Estamos actualizando el NFT Hub con nuevas funcionalidades y optimizaciones. Volveremos pronto con mejoras increíbles.',
    startTime: new Date().toISOString(),
  },
  marketplace: {
    enabled: true,
    estimatedTime: 120,
    message: 'El Marketplace está siendo optimizado para ofrecerte una mejor experiencia de compra y venta. Regresamos muy pronto.',
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
