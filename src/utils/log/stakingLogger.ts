/**
 * 💰 Staking Logger Utility v1.0 - Enhanced for EnhancedSmartStaking
 * 
 * Centralized logging system for staking operations, deposits, rewards, and skill boosts.
 * Prevents infinite loops and provides consistent logging format.
 * 
 * Features:
 * - Deduplication: Only logs when data changes
 * - Conditional: Only logs in development
 * - Performance: Uses Map for O(1) lookups
 * - Type-safe: Full TypeScript support
 * - Enhanced: Deposits, Withdrawals, Claims, Compounds, Emergency operations
 */

type StakingContext = 
  | 'deposit'
  | 'withdraw'
  | 'claim'
  | 'compound'
  | 'emergency'
  | 'position'
  | 'rewards'
  | 'boost'
  | 'pool'
  | 'user';

interface LogEntry {
  timestamp: number;
  hash: string;
}

interface StakingInfo {
  totalStaked: string;
  pendingRewards: string;
  activePositions: number;
  boostedRewards?: string;
  stakingBoost?: number;
  hasAutoCompound?: boolean;
}

interface StakingPosition {
  positionId: number;
  amount: string;
  lockupPeriod: number;
  startTime: number;
  endTime: number;
  lastClaimTime: number;
  accumulatedRewards: string;
  isActive: boolean;
  isEmergency?: boolean;
}

interface RewardsInfo {
  pending: string;
  accumulated: string;
  claimed: string;
  boosted?: string;
  baseAPY: number;
  finalAPY: number;
  skillBonus?: number;
}

interface PoolInfo {
  totalPoolBalance: string;
  uniqueUsers: number;
  totalDeposits: string;
  isPaused: boolean;
  minDeposit?: string;
  maxDeposit?: string;
}

interface SkillBoostInfo {
  skillTokenIds: number[];
  totalBoost: number;
  stakeBoost: number;
  hasAutoCompound: boolean;
  lockupReduction: number;
  feeReduction: number;
}

class StakingLogger {
  private logCache = new Map<string, LogEntry>();
  private isDevelopment = import.meta.env.DEV;
  private debounceTime = 1000; // 1 second

  /**
   * Check if we should log (prevent duplicates within debounce time)
   */
  private shouldLog(key: string, data: string): boolean {
    if (!this.isDevelopment) return false;

    const hash = this.hashString(data);
    const cached = this.logCache.get(key);
    const now = Date.now();

    if (cached && cached.hash === hash && now - cached.timestamp < this.debounceTime) {
      return false;
    }

    this.logCache.set(key, { timestamp: now, hash });
    return true;
  }

  /**
   * Simple string hash for comparison
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  /**
   * Get icon for context
   */
  private getIcon(context: StakingContext): string {
    switch (context) {
      case 'deposit': return '📥';
      case 'withdraw': return '📤';
      case 'claim': return '🎁';
      case 'compound': return '🔄';
      case 'emergency': return '🚨';
      case 'position': return '📊';
      case 'rewards': return '💎';
      case 'boost': return '⚡';
      case 'pool': return '🏊';
      case 'user': return '👤';
      default: return '💰';
    }
  }

  /**
   * Format timestamp to readable date
   */
  private formatTimestamp(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString();
  }

  /**
   * Format duration in days/hours
   */
  private formatDuration(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    return `${hours}h`;
  }

  /**
   * Log Staking Information
   */
  logStaking(params: StakingInfo) {
    const key = `staking-${params.totalStaked}`;
    const data = JSON.stringify(params);

    if (!this.shouldLog(key, data)) return;

    console.log(
      `%c${this.getIcon('user')} Staking Info%c\n` +
      `├─ Total Staked: ${params.totalStaked} POL\n` +
      `├─ Pending Rewards: ${params.pendingRewards} POL\n` +
      `├─ Active Positions: ${params.activePositions}\n` +
      `${params.boostedRewards ? `├─ Boosted Rewards: ${params.boostedRewards} POL\n` : ''}` +
      `${params.stakingBoost ? `├─ Staking Boost: +${params.stakingBoost / 100}%\n` : ''}` +
      `└─ Auto-Compound: ${params.hasAutoCompound ? '✅ Enabled' : '❌ Disabled'}`,
      'color: #ffb703; font-weight: bold;',
      'color: #ffffff;'
    );
  }

  /**
   * Log Staking Position Details
   */
  logPosition(params: StakingPosition) {
    const key = `position-${params.positionId}`;
    const data = JSON.stringify(params);

    if (!this.shouldLog(key, data)) return;

    const now = Math.floor(Date.now() / 1000);
    const timeUntilUnlock = params.endTime - now;
    const isUnlocked = timeUntilUnlock <= 0;

    console.log(
      `%c${this.getIcon('position')} Staking Position #${params.positionId}%c\n` +
      `├─ Amount: ${params.amount} POL\n` +
      `├─ Lockup Period: ${params.lockupPeriod} days\n` +
      `├─ Start Time: ${this.formatTimestamp(params.startTime)}\n` +
      `├─ End Time: ${this.formatTimestamp(params.endTime)}\n` +
      `├─ Status: ${isUnlocked ? '🔓 Unlocked' : `🔒 Locked (${this.formatDuration(timeUntilUnlock)} remaining)`}\n` +
      `├─ Accumulated Rewards: ${params.accumulatedRewards} POL\n` +
      `├─ Last Claim: ${this.formatTimestamp(params.lastClaimTime)}\n` +
      `${params.isEmergency ? '├─ ⚠️ Emergency Mode Active\n' : ''}` +
      `└─ Active: ${params.isActive ? '✅ Yes' : '❌ No'}`,
      'color: #4361ee; font-weight: bold;',
      'color: #ffffff;'
    );
  }

  /**
   * Log Rewards Information
   */
  logRewards(params: RewardsInfo) {
    const key = `rewards-${params.pending}`;
    const data = JSON.stringify(params);

    if (!this.shouldLog(key, data)) return;

    console.log(
      `%c${this.getIcon('rewards')} Rewards Info%c\n` +
      `├─ Pending: ${params.pending} POL\n` +
      `├─ Accumulated: ${params.accumulated} POL\n` +
      `├─ Claimed: ${params.claimed} POL\n` +
      `${params.boosted ? `├─ Boosted: ${params.boosted} POL\n` : ''}` +
      `├─ Base APY: ${params.baseAPY}%\n` +
      `├─ Final APY: ${params.finalAPY}%\n` +
      `${params.skillBonus ? `└─ Skill Bonus: +${params.skillBonus}%` : '└─ No Skill Bonus'}`,
      'color: #06ffa5; font-weight: bold;',
      'color: #ffffff;'
    );
  }

  /**
   * Log Pool Information
   */
  logPool(params: PoolInfo) {
    const key = `pool-${params.totalPoolBalance}`;
    const data = JSON.stringify(params);

    if (!this.shouldLog(key, data)) return;

    console.log(
      `%c${this.getIcon('pool')} Pool Info%c\n` +
      `├─ Total Pool Balance: ${params.totalPoolBalance} POL\n` +
      `├─ Unique Users: ${params.uniqueUsers}\n` +
      `├─ Total Deposits: ${params.totalDeposits} POL\n` +
      `├─ Status: ${params.isPaused ? '⏸️ Paused' : '▶️ Active'}\n` +
      `${params.minDeposit ? `├─ Min Deposit: ${params.minDeposit} POL\n` : ''}` +
      `${params.maxDeposit ? `└─ Max Deposit: ${params.maxDeposit} POL` : '└─ No Max Deposit'}`,
      'color: #4895ef; font-weight: bold;',
      'color: #ffffff;'
    );
  }

  /**
   * Log Skill Boost Information
   */
  logSkillBoost(params: SkillBoostInfo) {
    const key = `boost-${params.totalBoost}`;
    const data = JSON.stringify(params);

    if (!this.shouldLog(key, data)) return;

    console.log(
      `%c${this.getIcon('boost')} Skill Boosts Active%c\n` +
      `├─ NFT Skills: ${params.skillTokenIds.length > 0 ? params.skillTokenIds.map(id => `#${id}`).join(', ') : 'None'}\n` +
      `├─ Total Boost: +${params.totalBoost / 100}%\n` +
      `├─ Stake Boost: +${params.stakeBoost / 100}%\n` +
      `├─ Auto-Compound: ${params.hasAutoCompound ? '✅ +15%' : '❌ Disabled'}\n` +
      `├─ Lockup Reduction: ${params.lockupReduction}%\n` +
      `└─ Fee Reduction: ${params.feeReduction}%`,
      'color: #9d4edd; font-weight: bold;',
      'color: #ffffff;'
    );
  }

  /**
   * Log Deposit Transaction
   */
  logDeposit(params: {
    amount: string;
    lockupPeriod: number;
    user: string;
    txHash?: string;
    gasUsed?: string;
    success: boolean;
    error?: string;
  }) {
    const key = `deposit-${params.amount}-${params.lockupPeriod}`;
    const data = JSON.stringify(params);

    if (!this.shouldLog(key, data)) return;

    console.log(
      `%c${this.getIcon('deposit')} 📥 Deposit Transaction%c\n` +
      `├─ Amount: ${params.amount} POL\n` +
      `├─ Lockup Period: ${params.lockupPeriod} days\n` +
      `├─ User: ${params.user.slice(0, 10)}...${params.user.slice(-8)}\n` +
      `${params.txHash ? `├─ Tx Hash: ${params.txHash.slice(0, 10)}...${params.txHash.slice(-8)}\n` : ''}` +
      `${params.gasUsed ? `├─ Gas Used: ${params.gasUsed}\n` : ''}` +
      `└─ Status: ${params.success ? '✅ Success' : `❌ Failed${params.error ? `: ${params.error}` : ''}`}`,
      'color: #32cd32; font-weight: bold;',
      'color: #ffffff;'
    );
  }

  /**
   * Log Withdraw Transaction
   */
  logWithdraw(params: {
    positionId: number;
    amount: string;
    user: string;
    fee?: string;
    txHash?: string;
    gasUsed?: string;
    success: boolean;
    error?: string;
  }) {
    const key = `withdraw-${params.positionId}`;
    const data = JSON.stringify(params);

    if (!this.shouldLog(key, data)) return;

    console.log(
      `%c${this.getIcon('withdraw')} 📤 Withdraw Transaction%c\n` +
      `├─ Position ID: #${params.positionId}\n` +
      `├─ Amount: ${params.amount} POL\n` +
      `${params.fee ? `├─ Fee: ${params.fee} POL\n` : ''}` +
      `├─ User: ${params.user.slice(0, 10)}...${params.user.slice(-8)}\n` +
      `${params.txHash ? `├─ Tx Hash: ${params.txHash.slice(0, 10)}...${params.txHash.slice(-8)}\n` : ''}` +
      `${params.gasUsed ? `├─ Gas Used: ${params.gasUsed}\n` : ''}` +
      `└─ Status: ${params.success ? '✅ Success' : `❌ Failed${params.error ? `: ${params.error}` : ''}`}`,
      'color: #ff6b6b; font-weight: bold;',
      'color: #ffffff;'
    );
  }

  /**
   * Log Claim Rewards Transaction
   */
  logClaim(params: {
    positionId: number;
    amount: string;
    user: string;
    txHash?: string;
    gasUsed?: string;
    success: boolean;
    error?: string;
  }) {
    const key = `claim-${params.positionId}`;
    const data = JSON.stringify(params);

    if (!this.shouldLog(key, data)) return;

    console.log(
      `%c${this.getIcon('claim')} 🎁 Claim Rewards%c\n` +
      `├─ Position ID: #${params.positionId}\n` +
      `├─ Rewards: ${params.amount} POL\n` +
      `├─ User: ${params.user.slice(0, 10)}...${params.user.slice(-8)}\n` +
      `${params.txHash ? `├─ Tx Hash: ${params.txHash.slice(0, 10)}...${params.txHash.slice(-8)}\n` : ''}` +
      `${params.gasUsed ? `├─ Gas Used: ${params.gasUsed}\n` : ''}` +
      `└─ Status: ${params.success ? '✅ Success' : `❌ Failed${params.error ? `: ${params.error}` : ''}`}`,
      'color: #ffd60a; font-weight: bold;',
      'color: #ffffff;'
    );
  }

  /**
   * Log Compound Transaction
   */
  logCompound(params: {
    positionId: number;
    rewardsCompounded: string;
    newTotalStaked: string;
    user: string;
    txHash?: string;
    gasUsed?: string;
    success: boolean;
    error?: string;
  }) {
    const key = `compound-${params.positionId}`;
    const data = JSON.stringify(params);

    if (!this.shouldLog(key, data)) return;

    console.log(
      `%c${this.getIcon('compound')} 🔄 Compound Rewards%c\n` +
      `├─ Position ID: #${params.positionId}\n` +
      `├─ Rewards Compounded: ${params.rewardsCompounded} POL\n` +
      `├─ New Total Staked: ${params.newTotalStaked} POL\n` +
      `├─ User: ${params.user.slice(0, 10)}...${params.user.slice(-8)}\n` +
      `${params.txHash ? `├─ Tx Hash: ${params.txHash.slice(0, 10)}...${params.txHash.slice(-8)}\n` : ''}` +
      `${params.gasUsed ? `├─ Gas Used: ${params.gasUsed}\n` : ''}` +
      `└─ Status: ${params.success ? '✅ Success' : `❌ Failed${params.error ? `: ${params.error}` : ''}`}`,
      'color: #06ffa5; font-weight: bold;',
      'color: #ffffff;'
    );
  }

  /**
   * Log Emergency Withdraw
   */
  logEmergencyWithdraw(params: {
    positionId: number;
    amount: string;
    penalty: string;
    user: string;
    txHash?: string;
    gasUsed?: string;
    success: boolean;
    error?: string;
  }) {
    const key = `emergency-${params.positionId}`;
    const data = JSON.stringify(params);

    if (!this.shouldLog(key, data)) return;

    console.log(
      `%c${this.getIcon('emergency')} 🚨 EMERGENCY WITHDRAW%c\n` +
      `├─ Position ID: #${params.positionId}\n` +
      `├─ Amount: ${params.amount} POL\n` +
      `├─ Penalty: ${params.penalty} POL\n` +
      `├─ User: ${params.user.slice(0, 10)}...${params.user.slice(-8)}\n` +
      `${params.txHash ? `├─ Tx Hash: ${params.txHash.slice(0, 10)}...${params.txHash.slice(-8)}\n` : ''}` +
      `${params.gasUsed ? `├─ Gas Used: ${params.gasUsed}\n` : ''}` +
      `└─ Status: ${params.success ? '⚠️ Success (with penalty)' : `❌ Failed${params.error ? `: ${params.error}` : ''}`}`,
      'color: #ff4444; font-weight: bold;',
      'color: #ffffff;'
    );
  }

  /**
   * Log Contract Error
   */
  logContractError(params: {
    function: string;
    error: Error | string;
    params?: Record<string, unknown>;
  }) {
    const errorMessage = params.error instanceof Error ? params.error.message : params.error;
    
    console.error(
      `%c❌ EnhancedSmartStaking Error%c\n` +
      `├─ Function: ${params.function}\n` +
      `├─ Error: ${errorMessage}\n` +
      `${params.params ? `└─ Params: ${JSON.stringify(params.params, null, 2)}` : '└─ No params'}`,
      'color: #ff4444; font-weight: bold;',
      'color: #ffffff;',
      params.error instanceof Error ? params.error : undefined
    );
  }

  /**
   * Log error
   */
  logError(params: {
    context: string;
    error: Error | string;
    metadata?: Record<string, unknown>;
  }) {
    console.error(
      `%c❌ Staking Error in ${params.context}%c\n` +
      `├─ Message: ${params.error instanceof Error ? params.error.message : params.error}\n` +
      `└─ Metadata: ${params.metadata ? JSON.stringify(params.metadata, null, 2) : 'none'}`,
      'color: #ff4444; font-weight: bold;',
      'color: #ffffff;',
      params.error instanceof Error ? params.error : undefined
    );
  }

  /**
   * Clear log cache (useful for testing)
   */
  clearCache() {
    this.logCache.clear();
  }

  /**
   * Enable/disable logging
   */
  setEnabled(enabled: boolean) {
    this.isDevelopment = enabled;
  }
}

// Export singleton instance
export const stakingLogger = new StakingLogger();

// Export class for testing
export default stakingLogger;
