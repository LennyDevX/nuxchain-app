// Utility functions for handling smart contract custom errors

export interface ContractError {
  name: string;
  args?: any[];
}

/**
 * Parses contract error and returns user-friendly message in English
 * @param error - The error object from the contract call
 * @returns User-friendly error message
 */
export function parseContractError(error: any): string {
  // Check if it's a contract revert with custom error
  if (error?.cause?.data || error?.data) {
    const errorData = error.cause?.data || error.data;
    
    // Try to decode the error based on known error signatures
    if (typeof errorData === 'string') {
      // Common custom errors from SmartStaking contract
      if (errorData.includes('AlreadyMigrated')) {
        return '❌ Contract has already been migrated';
      }
      if (errorData.includes('ContractIsMigrated')) {
        return '❌ Contract has been migrated to a new version';
      }
      if (errorData.includes('DailyWithdrawalLimitExceeded')) {
        return '❌ Daily withdrawal limit exceeded. Try with a smaller amount';
      }
      if (errorData.includes('DepositTooHigh')) {
        return '❌ Deposit exceeds maximum allowed limit (10,000 POL)';
      }
      if (errorData.includes('DepositTooLow')) {
        return '❌ Deposit is below minimum required (5 POL)';
      }
      if (errorData.includes('FundsAreLocked')) {
        return '❌ Funds are locked. Wait until the lockup period ends';
      }
      if (errorData.includes('InsufficientBalance')) {
        return '❌ Insufficient balance in contract or your wallet';
      }
      if (errorData.includes('InvalidAddress')) {
        return '❌ Invalid address provided';
      }
      if (errorData.includes('InvalidLockupDuration')) {
        return '❌ Invalid lockup period. Use: 0, 30, 90, 180 or 365 days';
      }
      if (errorData.includes('MaxDepositsReached')) {
        return '❌ You have reached the maximum deposit limit (300 deposits)';
      }
      if (errorData.includes('NoDepositsFound')) {
        return '❌ You have no active deposits in this contract';
      }
      if (errorData.includes('NoPendingCommission')) {
        return '❌ No pending commissions to withdraw';
      }
      if (errorData.includes('NoRewardsAvailable')) {
        return '❌ You have no rewards available to claim';
      }
      if (errorData.includes('UnauthorizedSender')) {
        return '❌ You are not authorized to perform this operation';
      }
    }
  }

  // Check for common revert reasons
  if (error?.message) {
    const message = error.message.toLowerCase();
    
    if (message.includes('paused')) {
      return '⏸️ Contract is temporarily paused';
    }
    if (message.includes('insufficient funds') || message.includes('insufficient balance')) {
      return '❌ Insufficient balance in your wallet';
    }
    if (message.includes('user rejected') || message.includes('user denied')) {
      return '❌ Transaction cancelled by user';
    }
    if (message.includes('gas')) {
      return '⛽ Gas error. Try increasing the gas limit';
    }
    if (message.includes('nonce')) {
      return '🔄 Nonce error. Try refreshing the page';
    }
    if (message.includes('network')) {
      return '🌐 Network error. Check your connection';
    }
  }

  // Fallback for unknown errors
  return '❌ Unknown error. Please try again or contact support';
}

/**
 * Shows a user-friendly error notification
 * @param error - The error object
 * @param customMessage - Optional custom message prefix
 */
export function showContractError(error: any, customMessage?: string): void {
  const errorMessage = parseContractError(error);
  const fullMessage = customMessage ? `${customMessage}: ${errorMessage}` : errorMessage;
  
  // You can replace this with your preferred notification system
  alert(fullMessage);
  
  // Also log the original error for debugging
  console.error('Contract Error:', error);
}

/**
 * Validates deposit amount before sending transaction
 * @param amount - Amount to validate
 * @param balance - User's current balance
 * @returns Validation result with error message if invalid
 */
export function validateDepositAmount(amount: string, balance?: bigint): { isValid: boolean; error?: string } {
  const numAmount = parseFloat(amount);
  
  if (!amount || numAmount <= 0) {
    return { isValid: false, error: '❌ Amount must be greater than 0 POL' };
  }
  
  if (numAmount < 5) {
    return { isValid: false, error: '❌ Minimum deposit amount is 5 POL' };
  }
  
  if (numAmount > 10000) {
    return { isValid: false, error: '❌ Maximum deposit amount is 10,000 POL' };
  }
  
  if (balance && BigInt(Math.floor(numAmount * 1e18)) > balance) {
    return { isValid: false, error: '❌ Insufficient balance in your wallet' };
  }
  
  return { isValid: true };
}

/**
 * Validates lockup duration
 * @param duration - Duration in days as string
 * @returns Validation result
 */
export function validateLockupDuration(duration: string): { isValid: boolean; error?: string } {
  const validDurations = ['0', '30', '90', '180', '365'];
  
  if (!validDurations.includes(duration)) {
    return { 
      isValid: false, 
      error: '❌ Invalid lockup period. Select: Flexible, 30, 90, 180 or 365 days' 
    };
  }
  
  return { isValid: true };
}