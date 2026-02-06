#!/usr/bin/env node

/**
 * Maintenance Control Script
 * Allows easy toggling of maintenance mode without editing config files
 * 
 * Usage:
 *   node scripts/maintenance-control.js status
 *   node scripts/maintenance-control.js enable [estimatedTime] [message]
 *   node scripts/maintenance-control.js disable
 */

const fs = require('fs');
const path = require('path');

const MAINTENANCE_FILE = path.join(__dirname, '../src/config/maintenance.ts');

const commands = {
  status: showStatus,
  enable: enableMaintenance,
  disable: disableMaintenance,
  help: showHelp,
};

const command = process.argv[2] || 'status';

if (commands[command]) {
  commands[command]();
} else {
  console.error(`❌ Unknown command: ${command}`);
  showHelp();
  process.exit(1);
}

// ============ Command Implementations ============

function showStatus() {
  const content = fs.readFileSync(MAINTENANCE_FILE, 'utf-8');
  
  const enabledMatch = content.match(/enabled:\s*(true|false)/);
  const estimatedMatch = content.match(/estimatedTime:\s*(\d+)/);
  const messageMatch = content.match(/message:\s*['"`]([^'"`]*)['"` ]*[,}]/);
  
  const enabled = enabledMatch ? enabledMatch[1] === 'true' : false;
  const estimatedTime = estimatedMatch ? estimatedMatch[1] : 'Unknown';
  const message = messageMatch ? messageMatch[1] : 'Not found';
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📋 MAINTENANCE STATUS');
  console.log('═══════════════════════════════════════════════════\n');
  
  console.log(`Status:          ${enabled ? '🔴 ACTIVE' : '🟢 DISABLED'}`);
  console.log(`Estimated Time:  ${estimatedTime} minutes`);
  console.log(`Message Preview: ${message.substring(0, 60)}...`);
  
  console.log('\n═══════════════════════════════════════════════════\n');
}

function enableMaintenance() {
  const estimatedTime = process.argv[3] || '30';
  const message = process.argv[4] || 'We are performing critical system maintenance to enhance security and remove fraudulent accounts. Our team is working hard to purge bot registrations and ensure a fair airdrop distribution. Thank you for your patience!';
  
  if (isNaN(estimatedTime)) {
    console.error('❌ Estimated time must be a number (minutes)');
    process.exit(1);
  }
  
  const template = `/**
 * Maintenance Configuration
 * Controls whether the airdrop is in maintenance mode
 */

export const MAINTENANCE_CONFIG = {
  // Set to true to enable maintenance mode
  enabled: true,
  
  // Estimated time until maintenance is complete (in minutes)
  estimatedTime: ${estimatedTime},
  
  // Custom maintenance message
  message: '${message}',
  
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
};`;
  
  fs.writeFileSync(MAINTENANCE_FILE, template);
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('✅ MAINTENANCE ENABLED');
  console.log('═══════════════════════════════════════════════════\n');
  
  console.log(`⏱️  Estimated Time:  ${estimatedTime} minutes`);
  console.log(`📝 Message:         ${message.substring(0, 70)}...`);
  console.log('\n🔴 Airdrop is now in MAINTENANCE MODE');
  console.log('   Users will see the maintenance page instead of the airdrop form\n');
}

function disableMaintenance() {
  const template = `/**
 * Maintenance Configuration
 * Controls whether the airdrop is in maintenance mode
 */

export const MAINTENANCE_CONFIG = {
  // Set to true to enable maintenance mode
  enabled: false,
  
  // Estimated time until maintenance is complete (in minutes)
  estimatedTime: 30,
  
  // Custom maintenance message
  message: 'We are currently performing system maintenance to improve security and user experience.',
  
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
};`;
  
  fs.writeFileSync(MAINTENANCE_FILE, template);
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('✅ MAINTENANCE DISABLED');
  console.log('═══════════════════════════════════════════════════\n');
  
  console.log('🟢 Airdrop is now LIVE');
  console.log('   Users can access the airdrop form normally\n');
}

function showHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║          🔧 Maintenance Control Script                    ║
╚════════════════════════════════════════════════════════════╝

USAGE:
  node scripts/maintenance-control.js <command> [options]

COMMANDS:

  status
    Show current maintenance status
    Example: node scripts/maintenance-control.js status

  enable [time] [message]
    Enable maintenance mode for the airdrop
    - time: Estimated minutes (optional, default: 30)
    - message: Custom message (optional)
    Example: node scripts/maintenance-control.js enable 45 "Custom message"

  disable
    Disable maintenance mode and show airdrop
    Example: node scripts/maintenance-control.js disable

  help
    Show this help message

EXAMPLES:

  # Check current status
  $ node scripts/maintenance-control.js status

  # Enable maintenance for 30 minutes with default message
  $ node scripts/maintenance-control.js enable

  # Enable maintenance for 60 minutes with custom message
  $ node scripts/maintenance-control.js enable 60 "We're purging bots"

  # Disable maintenance and go live
  $ node scripts/maintenance-control.js disable

═══════════════════════════════════════════════════════════════
`);
}
