/**
 * Staking Calculations - Client-side calculation helpers
 * Mirrors contract logic for instant UI feedback without RPC calls
 */

import { STAKING_PERIODS, CONTRACT_CONSTANTS } from '../../constants/stakingConstants';

// ============================================
// APY CALCULATIONS
// ============================================

/**
 * Calculate effective APY for a lockup period with optional skill boost
 * @param lockupDays - Lockup period (0, 30, 90, 180, 365)
 * @param skillBoostBps - Skill boost in basis points (e.g., 375 = +3.75%)
 * @returns Annual percentage yield as decimal (e.g., 19.7)
 */
export function calculateEffectiveAPY(lockupDays: number, skillBoostBps = 0): number {
  const period = STAKING_PERIODS.find(p => p.value === String(lockupDays));
  if (!period) return 0;

  const baseAPY = period.hourlyRate * 24 * 365; // e.g., 19.71
  const boostMultiplier = 1 + skillBoostBps / 10000;
  return baseAPY * boostMultiplier;
}

/**
 * Calculate dynamic APY based on TVL
 * Formula: dynamicAPY = baseAPY × sqrt(targetTVL / currentTVL)
 * Clamped between 30%-100% of base
 */
export function calculateDynamicAPY(
  baseAPY: number,
  currentTVL: bigint,
  targetTVL: bigint = 1000000n * 10n ** 18n // 1M POL default
): number {
  if (currentTVL === 0n) return baseAPY;

  // Use number approximation for sqrt
  const ratio = Number(targetTVL) / Number(currentTVL);
  const multiplier = Math.sqrt(ratio);

  // Clamp between 0.3 and 1.0
  const clampedMultiplier = Math.min(1.0, Math.max(0.3, multiplier));
  return baseAPY * clampedMultiplier;
}

/**
 * Get APY for lockup period index (0-4)
 */
export function getBaseAPYByIndex(lockupIndex: number): number {
  if (lockupIndex < 0 || lockupIndex >= STAKING_PERIODS.length) return 0;
  return STAKING_PERIODS[lockupIndex].hourlyRate * 24 * 365;
}

/**
 * Get all APYs with dynamic adjustment
 */
export function getAllAPYs(currentTVL: bigint): Array<{
  lockupDays: number;
  label: string;
  baseAPY: number;
  dynamicAPY: number;
}> {
  return STAKING_PERIODS.map(period => {
    const baseAPY = period.hourlyRate * 24 * 365;
    return {
      lockupDays: parseInt(period.value),
      label: period.label,
      baseAPY,
      dynamicAPY: calculateDynamicAPY(baseAPY, currentTVL),
    };
  });
}

// ============================================
// REWARD CALCULATIONS
// ============================================

/**
 * Calculate estimated daily reward for a deposit
 */
export function calculateDailyReward(depositWei: bigint, lockupDays: number, skillBoostBps = 0): bigint {
  const period = STAKING_PERIODS.find(p => p.value === String(lockupDays));
  if (!period || depositWei === 0n) return 0n;

  // hourlyRate is in percentage (e.g., 0.00225 = 0.00225%)
  // Daily = hourly * 24, apply deposit amount
  const hourlyRateBps = BigInt(Math.round(period.hourlyRate * 10000)); // Convert to basis points × 100
  const dailyRewardBps = hourlyRateBps * 24n;
  const baseReward = (depositWei * dailyRewardBps) / 10000000n; // Divide by 10^7 (10^4 bps * 10^3 from % conversion)

  if (skillBoostBps > 0) {
    const boost = (baseReward * BigInt(skillBoostBps)) / 10000n;
    return baseReward + boost;
  }

  return baseReward;
}

/**
 * Calculate projected earnings over a period
 */
export function calculateProjectedEarnings(
  depositWei: bigint,
  lockupDays: number,
  projectionDays: number,
  skillBoostBps = 0
): { daily: bigint; monthly: bigint; annual: bigint; projected: bigint } {
  const daily = calculateDailyReward(depositWei, lockupDays, skillBoostBps);
  return {
    daily,
    monthly: daily * 30n,
    annual: daily * 365n,
    projected: daily * BigInt(projectionDays),
  };
}

/**
 * Calculate total skill boost in basis points from active skills
 */
export function calculateTotalSkillBoost(
  skills: Array<{ effectValue: number; rarity: number }>
): { stakingBoost: number; feeDiscount: number } {
  const RARITY_MULTIPLIERS = [100, 150, 200, 300, 500]; // ÷100
  const MAX_STAKING_BOOST = 3750; // 37.5% max
  const MAX_FEE_DISCOUNT = 5625; // 56.25% max

  let stakingBoost = 0;
  const feeDiscount = 0;

  for (const skill of skills) {
    const multiplier = RARITY_MULTIPLIERS[skill.rarity] || 100;
    const boostedValue = Math.round((skill.effectValue * multiplier) / 100);

    // Simplified: assume all are staking boosts for now
    stakingBoost += boostedValue;
  }

  return {
    stakingBoost: Math.min(stakingBoost, MAX_STAKING_BOOST),
    feeDiscount: Math.min(feeDiscount, MAX_FEE_DISCOUNT),
  };
}

// ============================================
// XP / LEVEL CALCULATIONS
// ============================================

/**
 * Calculate XP required for a given level
 * Formula from contract: Level = sqrt(XP / 50), so XP = Level^2 * 50
 */
export function xpForLevel(level: number): bigint {
  return BigInt(level * level * 50);
}

/**
 * Calculate level from XP
 */
export function levelFromXP(xp: bigint): number {
  return Math.floor(Math.sqrt(Number(xp) / 50));
}

/**
 * Calculate XP progress to next level (0-100%)
 */
export function xpProgressPercent(currentXP: bigint): number {
  const currentLevel = levelFromXP(currentXP);
  const xpForCurrent = xpForLevel(currentLevel);
  const xpForNext = xpForLevel(currentLevel + 1);
  const range = xpForNext - xpForCurrent;

  if (range === 0n) return 100;
  return Number(((currentXP - xpForCurrent) * 100n) / range);
}

/**
 * Calculate level-up reward amount (in POL)
 */
export function levelUpReward(level: number): number {
  if (level <= 50) return 1;
  if (level <= 75) return 2;
  if (level <= 90) return 3;
  return 5;
}

// ============================================
// DEPOSIT CALCULATIONS
// ============================================

/**
 * Calculate net deposit after commission (6%)
 */
export function calculateNetDeposit(amount: bigint): bigint {
  const commission = (amount * BigInt(CONTRACT_CONSTANTS.COMMISSION_PERCENTAGE)) / BigInt(CONTRACT_CONSTANTS.BASIS_POINTS);
  return amount - commission;
}

/**
 * Calculate commission amount
 */
export function calculateCommission(amount: bigint): bigint {
  return (amount * BigInt(CONTRACT_CONSTANTS.COMMISSION_PERCENTAGE)) / BigInt(CONTRACT_CONSTANTS.BASIS_POINTS);
}

/**
 * Check if deposit is within lockup period
 */
export function isDepositLocked(depositTimestamp: number, lockupDays: number): boolean {
  if (lockupDays === 0) return false;
  const unlockTime = depositTimestamp + lockupDays * 86400;
  return Date.now() / 1000 < unlockTime;
}

/**
 * Calculate time remaining in lockup (seconds)
 */
export function lockupTimeRemaining(depositTimestamp: number, lockupDays: number): number {
  if (lockupDays === 0) return 0;
  const unlockTime = depositTimestamp + lockupDays * 86400;
  const remaining = unlockTime - Date.now() / 1000;
  return Math.max(0, Math.floor(remaining));
}

/**
 * Calculate lockup progress percentage (0-100)
 */
export function lockupProgress(depositTimestamp: number, lockupDays: number): number {
  if (lockupDays === 0) return 100;
  const totalSeconds = lockupDays * 86400;
  const elapsed = Date.now() / 1000 - depositTimestamp;
  return Math.min(100, Math.max(0, (elapsed / totalSeconds) * 100));
}
