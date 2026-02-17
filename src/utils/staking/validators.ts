/**
 * Staking Validators - Input validation for staking operations
 * Prevents invalid transactions by validating client-side first
 */

import { parseEther } from 'viem';
import { CONTRACT_CONSTANTS } from '../../constants/stakingConstants';

// ============================================
// DEPOSIT VALIDATION
// ============================================

export interface DepositValidation {
  isValid: boolean;
  error: string | null;
}

/**
 * Validate deposit amount
 */
export function validateDepositAmount(
  amount: string,
  userBalance?: bigint
): DepositValidation {
  // Check empty
  if (!amount || amount.trim() === '') {
    return { isValid: false, error: 'Enter an amount to deposit' };
  }

  // Check valid number
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return { isValid: false, error: 'Enter a valid positive amount' };
  }

  // Check minimum
  if (numAmount < CONTRACT_CONSTANTS.MIN_DEPOSIT) {
    return {
      isValid: false,
      error: `Minimum deposit is ${CONTRACT_CONSTANTS.MIN_DEPOSIT} POL`,
    };
  }

  // Check maximum
  if (numAmount > CONTRACT_CONSTANTS.MAX_DEPOSIT) {
    return {
      isValid: false,
      error: `Maximum deposit is ${CONTRACT_CONSTANTS.MAX_DEPOSIT.toLocaleString()} POL`,
    };
  }

  // Check balance
  if (userBalance !== undefined) {
    try {
      const amountWei = parseEther(amount);
      if (amountWei > userBalance) {
        return { isValid: false, error: 'Insufficient balance' };
      }
    } catch {
      return { isValid: false, error: 'Invalid amount format' };
    }
  }

  return { isValid: true, error: null };
}

/**
 * Validate lockup period
 */
export function validateLockupPeriod(days: number): DepositValidation {
  const validPeriods = [0, 30, 90, 180, 365];
  if (!validPeriods.includes(days)) {
    return {
      isValid: false,
      error: 'Select a valid lockup period: Flexible, 30, 90, 180, or 365 days',
    };
  }
  return { isValid: true, error: null };
}

/**
 * Check if user has reached maximum deposits
 */
export function canMakeDeposit(currentDepositCount: number): DepositValidation {
  if (currentDepositCount >= CONTRACT_CONSTANTS.MAX_DEPOSITS_PER_USER) {
    return {
      isValid: false,
      error: `Maximum deposits reached (${CONTRACT_CONSTANTS.MAX_DEPOSITS_PER_USER}). Withdraw existing deposits first.`,
    };
  }
  return { isValid: true, error: null };
}

// ============================================
// WITHDRAWAL VALIDATION
// ============================================

export interface WithdrawValidation {
  canWithdraw: boolean;
  reason: string | null;
}

/**
 * Validate if a deposit can be withdrawn
 */
export function validateWithdrawal(
  isLocked: boolean,
  lockupDaysRemaining: number,
  dailyLimitRemaining: bigint,
  withdrawAmount: bigint
): WithdrawValidation {
  if (isLocked && lockupDaysRemaining > 0) {
    return {
      canWithdraw: false,
      reason: `Deposit is locked for ${lockupDaysRemaining} more days`,
    };
  }

  if (withdrawAmount > dailyLimitRemaining) {
    return {
      canWithdraw: false,
      reason: `Exceeds daily withdrawal limit. Remaining: ${Number(dailyLimitRemaining / 10n ** 18n)} POL`,
    };
  }

  return { canWithdraw: true, reason: null };
}

// ============================================
// SKILL VALIDATION
// ============================================

/**
 * Check if a skill can be activated without exceeding boost limits
 */
export function validateSkillActivation(
  currentBoostBps: number,
  newSkillBoostBps: number,
  activeSkillCount: number,
  maxSlots = CONTRACT_CONSTANTS.MAX_ACTIVE_SKILL_SLOTS
): DepositValidation {
  const MAX_STAKING_BOOST = 3750; // 37.5%

  if (activeSkillCount >= maxSlots) {
    return {
      isValid: false,
      error: `Maximum ${maxSlots} active skills. Deactivate one first.`,
    };
  }

  if (currentBoostBps + newSkillBoostBps > MAX_STAKING_BOOST) {
    return {
      isValid: false,
      error: `Would exceed max boost limit of 37.5%. Current: ${(currentBoostBps / 100).toFixed(2)}%`,
    };
  }

  return { isValid: true, error: null };
}

// ============================================
// CONTRACT ADDRESS VALIDATION
// ============================================

/**
 * Validate a contract address is properly configured
 */
export function isValidContractAddress(address: string | undefined): boolean {
  return Boolean(
    address &&
    address !== '0x0000000000000000000000000000000000000000' &&
    address.startsWith('0x') &&
    address.length === 42
  );
}

/**
 * Validate all required staking contract addresses
 */
export function validateStakingConfig(): {
  isValid: boolean;
  missing: string[];
} {
  const required = {
    STAKING: import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS,
    VIEW: import.meta.env.VITE_ENHANCED_SMARTSTAKING_VIEWER_ADDRESS,
    GAMIFICATION: import.meta.env.VITE_ENHANCED_SMARTSTAKING_GAMIFICATION_ADDRESS,
    REWARDS: import.meta.env.VITE_ENHANCED_SMARTSTAKING_REWARDS_ADDRESS,
    SKILLS: import.meta.env.VITE_ENHANCED_SMARTSTAKING_SKILLS_ADDRESS,
  };

  const missing = Object.entries(required)
    .filter(([, addr]) => !isValidContractAddress(addr))
    .map(([name]) => name);

  return { isValid: missing.length === 0, missing };
}
