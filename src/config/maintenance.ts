/**
 * Maintenance Configuration
 * Controls whether the airdrop is in maintenance mode
 */

export const MAINTENANCE_CONFIG = {
  // Set to true to enable maintenance mode
  enabled: true,
  
  // Estimated time until maintenance is complete (in minutes)
  estimatedTime: 150,
  
  // Custom maintenance message
  message: 'We are performing critical system maintenance to enhance security and remove fraudulent accounts. Our team is working hard to purge bot registrations and ensure a fair airdrop distribution. Thank you for your patience!',
  
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
