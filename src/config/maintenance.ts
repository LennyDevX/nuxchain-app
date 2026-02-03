/**
 * Maintenance Configuration
 * Controls whether the airdrop is in maintenance mode
 */

export const MAINTENANCE_CONFIG = {
  // Set to true to enable maintenance mode (or use VITE_AIRDROP_MAINTENANCE in .env)
  enabled: false, // import.meta.env.VITE_AIRDROP_MAINTENANCE === 'true',
  
  // Estimated time until maintenance is complete (in minutes)
  estimatedTime: 120,
  
  // Custom maintenance message
  message: 'We are upgrading our anti-bot security system and deploying enhanced wallet validation. This ensures only real users can participate in the airdrop. The system will be back online shortly. Thank you for your patience!',  
  
  // Start time of maintenance (ISO string)
  startTime: new Date().toISOString(),
};

export const isMaintenanceMode = (): boolean => {
  return MAINTENANCE_CONFIG.enabled;
};

export const getMaintenanceTimeRemaining = (): number => {
  const startTime = new Date(MAINTENANCE_CONFIG.startTime).getTime();
  const estimatedEndTime = startTime + MAINTENANCE_CONFIG.estimatedTime * 60 * 1000;
  const now = Date.now();
  const remaining = Math.max(0, estimatedEndTime - now);
  
  return Math.ceil(remaining / 1000); // Return in seconds
};
