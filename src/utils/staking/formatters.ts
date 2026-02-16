/**
 * Staking Formatters - Utility functions for formatting staking data
 * Centralizes all display formatting for POL amounts, APY, time, XP, etc.
 */

import { formatEther } from 'viem';

// ============================================
// POL AMOUNT FORMATTING
// ============================================

/**
 * Format a BigInt wei value to human-readable POL string
 */
export function formatPOL(value: bigint | undefined | null, decimals = 4): string {
  if (!value || value === 0n) return '0.00';
  return parseFloat(formatEther(value)).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a BigInt wei value to compact POL string (e.g., 1.2K, 3.4M)
 */
export function formatPOLCompact(value: bigint | undefined | null): string {
  if (!value || value === 0n) return '0';
  const num = parseFloat(formatEther(value));
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toFixed(2);
}

/**
 * Format a POL amount with currency suffix
 */
export function formatPOLWithUnit(value: bigint | undefined | null, decimals = 2): string {
  return `${formatPOL(value, decimals)} POL`;
}

/**
 * Format raw number as POL (not from wei)
 */
export function formatPOLNumber(value: number, decimals = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// ============================================
// APY / PERCENTAGE FORMATTING
// ============================================

/**
 * Format basis points to percentage string (e.g., 1970 → "19.70%")
 */
export function formatAPY(basisPoints: number): string {
  return `${(basisPoints / 100).toFixed(2)}%`;
}

/**
 * Format a decimal percentage to display string
 */
export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format APY with boost information
 */
export function formatAPYWithBoost(baseAPY: number, boostPercent: number): string {
  const effective = baseAPY * (1 + boostPercent / 100);
  if (boostPercent > 0) {
    return `${formatPercent(effective)} (+${formatPercent(boostPercent)})`;
  }
  return formatPercent(effective);
}

// ============================================
// TIME FORMATTING
// ============================================

/**
 * Format lockup duration in days to human-readable label
 */
export function formatLockupPeriod(days: number): string {
  if (days === 0) return 'Flexible';
  if (days <= 30) return '30 Days';
  if (days <= 90) return '90 Days';
  if (days <= 180) return '180 Days';
  return '365 Days';
}

/**
 * Format seconds to countdown string (e.g., "2d 4h 30m")
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Unlocked';

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 && days === 0) parts.push(`${minutes}m`);

  return parts.join(' ') || '< 1m';
}

/**
 * Format a timestamp to locale date string
 */
export function formatDate(timestamp: number | Date): string {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a timestamp to short date+time
 */
export function formatDateTime(timestamp: number | Date): string {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp * 1000);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(timestamp: number | Date): string {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp * 1000);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return formatDate(date);
}

// ============================================
// XP / GAMIFICATION FORMATTING
// ============================================

/**
 * Format XP value for display
 */
export function formatXP(xp: bigint | number): string {
  const num = typeof xp === 'bigint' ? Number(xp) : xp;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M XP`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K XP`;
  return `${num} XP`;
}

/**
 * Format level with rank title
 */
export function formatLevel(level: number): { level: number; title: string; color: string } {
  if (level >= 100) return { level, title: 'Grandmaster', color: 'text-amber-400' };
  if (level >= 75) return { level, title: 'Master', color: 'text-purple-400' };
  if (level >= 50) return { level, title: 'Expert', color: 'text-blue-400' };
  if (level >= 25) return { level, title: 'Adept', color: 'text-emerald-400' };
  if (level >= 10) return { level, title: 'Apprentice', color: 'text-cyan-400' };
  if (level >= 1) return { level, title: 'Novice', color: 'text-gray-400' };
  return { level, title: 'Newcomer', color: 'text-white/50' };
}

// ============================================
// BADGE FORMATTING
// ============================================

/** Badge metadata by ID */
export const BADGE_METADATA: Record<number, { name: string; icon: string; description: string }> = {
  1: { name: 'First Staker', icon: '🌟', description: 'Made your first stake' },
  2: { name: 'Level 10', icon: '🔥', description: 'Reached Level 10' },
  3: { name: 'Level 25', icon: '⚡', description: 'Reached Level 25' },
  4: { name: 'Level 50', icon: '💎', description: 'Reached Level 50' },
  5: { name: 'Level 100', icon: '👑', description: 'Reached Level 100' },
  6: { name: 'Quest Master', icon: '🏆', description: 'Completed 10 quests' },
  7: { name: 'Quest Legend', icon: '🌈', description: 'Completed 50 quests' },
  8: { name: 'Achiever', icon: '⭐', description: 'Unlocked 5 achievements' },
  9: { name: 'Achievement Hunter', icon: '🎯', description: 'Unlocked 20 achievements' },
  10: { name: 'Diamond Hands', icon: '💠', description: 'Staked for 365 days' },
};

/**
 * Get badge display info
 */
export function formatBadge(badgeId: number): { name: string; icon: string; description: string } {
  return BADGE_METADATA[badgeId] || {
    name: `Badge #${badgeId}`,
    icon: '🏅',
    description: 'Special achievement badge',
  };
}

// ============================================
// SKILL FORMATTING
// ============================================

/** Rarity display configuration */
export const RARITY_DISPLAY = {
  0: { name: 'Common', color: 'text-gray-400', bgColor: 'bg-gray-500/20', borderColor: 'border-gray-500/30', multiplier: '1x' },
  1: { name: 'Uncommon', color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/30', multiplier: '1.5x' },
  2: { name: 'Rare', color: 'text-blue-400', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/30', multiplier: '2x' },
  3: { name: 'Epic', color: 'text-purple-400', bgColor: 'bg-purple-500/20', borderColor: 'border-purple-500/30', multiplier: '3x' },
  4: { name: 'Legendary', color: 'text-amber-400', bgColor: 'bg-amber-500/20', borderColor: 'border-amber-500/30', multiplier: '5x' },
} as const;

/**
 * Format skill boost value
 */
export function formatSkillBoost(effectValue: number): string {
  return `+${(effectValue / 100).toFixed(2)}%`;
}

// ============================================
// ADDRESS FORMATTING
// ============================================

/**
 * Truncate address for display
 */
export function formatAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Get Polygonscan URL for transaction
 */
export function getTxUrl(txHash: string): string {
  return `https://polygonscan.com/tx/${txHash}`;
}

/**
 * Get Polygonscan URL for address
 */
export function getAddressUrl(address: string): string {
  return `https://polygonscan.com/address/${address}`;
}

// ============================================
// SERIALIZATION HELPERS
// ============================================

/**
 * Safely serialize BigInt for logging/DevTools
 */
export function serializeBigInt(value: unknown): unknown {
  if (typeof value === 'bigint') return value.toString();
  if (Array.isArray(value)) return value.map(serializeBigInt);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, serializeBigInt(v)])
    );
  }
  return value;
}
