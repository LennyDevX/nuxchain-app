/**
 * 🎨 NFT Logger Utility v2.0 - Enhanced for GameifiedMarketplace & EnhancedSmartStaking
 * 
 * Centralized logging system for NFT operations, skills, staking, and gamification.
 * Prevents infinite loops and provides consistent logging format.
 * 
 * Features:
 * - Deduplication: Only logs when data changes
 * - Conditional: Only logs in development
 * - Performance: Uses Map for O(1) lookups
 * - Type-safe: Full TypeScript support
 * - Enhanced: Skills, Staking, Gamification tracking
 */

type LogLevel = 'info' | 'success' | 'warning' | 'error';
type LogContext = 
  | 'page' 
  | 'hook' 
  | 'fetch' 
  | 'cache' 
  | 'filter' 
  | 'skill' 
  | 'gamification'
  | 'marketplace'
  | 'transaction';

interface LogEntry {
  timestamp: number;
  hash: string;
}

interface SkillNFTInfo {
  tokenId: string | number;
  skillType: string;
  effectValue: number;
  rarity: string;
  stars: number;
  isActive: boolean;
  mintedAt?: number;
  lastActivationTime?: number;
}

interface UserProfileInfo {
  address: string;
  totalXP: number;
  level: number;
  skillsLevel: number;
  maxActiveSkills: number;
  activeSkillsCount: number;
  nftsCreated: number;
  nftsSold: number;
  nftsBought: number;
}

interface NFTMetadataInfo {
  tokenId: string | number;
  category: string;
  creator: string;
  isListed: boolean;
  listedPrice: string;
  likes: number;
  commentsCount: number;
  hasSkills?: boolean;
  skillsCount?: number;
}

class NFTLogger {
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
   * Get color for log level
   */
  private getColor(level: LogLevel): string {
    switch (level) {
      case 'success': return '#32cd32';
      case 'warning': return '#ffa500';
      case 'error': return '#ff4444';
      case 'info':
      default: return '#ff69b4';
    }
  }

  /**
   * Get icon for context
   */
  private getIcon(context: LogContext): string {
    switch (context) {
      case 'page': return '🎨';
      case 'hook': return '🔗';
      case 'fetch': return '📡';
      case 'cache': return '💾';
      case 'filter': return '🔍';
      case 'skill': return '⚡';
      case 'gamification': return '🎮';
      case 'marketplace': return '🏪';
      case 'transaction': return '📝';
      default: return '📋';
    }
  }

  /**
   * Get rarity emoji
   */
  private getRarityEmoji(rarity: string): string {
    switch (rarity.toUpperCase()) {
      case 'LEGENDARY': return '🌟🌟🌟🌟🌟';
      case 'EPIC': return '🌟🌟🌟🌟';
      case 'RARE': return '🌟🌟🌟';
      case 'UNCOMMON': return '🌟🌟';
      case 'COMMON': return '🌟';
      default: return '⭐';
    }
  }

  /**
   * Log NFT page state
   */
  logPageState(params: {
    page: string;
    total: number;
    loaded: number;
    hasMore: boolean;
    isConnected: boolean;
    error?: string | null;
  }) {
    const key = `page-${params.page}`;
    const data = JSON.stringify(params);

    if (!this.shouldLog(key, data)) return;

    const level: LogLevel = params.error ? 'error' : 'success';
    
    console.log(
      `%c${this.getIcon('page')} ${params.page} Page%c\n` +
      `├─ Status: ${params.error ? '❌ Error' : '✅ Loaded'}\n` +
      `├─ Total: ${params.total} NFTs\n` +
      `├─ Loaded: ${params.loaded} NFTs\n` +
      `├─ Has More: ${params.hasMore ? '📖' : '🏁'}\n` +
      `└─ Connected: ${params.isConnected ? '✅' : '❌'}`,
      `color: ${this.getColor(level)}; font-weight: bold;`,
      'color: #ffffff;'
    );
  }

  /**
   * Log hook execution (fetch start)
   */
  logFetchStart(params: {
    hook: string;
    userOnly?: boolean;
    isForSale?: boolean;
    category?: string;
    startToken: number;
    endToken: number;
    address?: string;
  }) {
    const key = `fetch-${params.hook}-${params.startToken}`;
    const data = JSON.stringify(params);

    if (!this.shouldLog(key, data)) return;

    console.log(
      `%c${this.getIcon('fetch')} ${params.hook}%c\n` +
      `├─ Filter: userOnly=${params.userOnly}, isForSale=${params.isForSale}, category=${params.category || 'any'}\n` +
      `├─ Scanning: tokens #${params.startToken}-${params.endToken - 1}\n` +
      `└─ Address: ${params.address?.slice(0, 10)}...`,
      'color: #ff1493; font-weight: bold;',
      'color: #ffffff;'
    );
  }

  /**
   * Log fetch result
   */
  logFetchResult(params: {
    hook: string;
    valid: number;
    total: number;
    category?: string;
    isForSale?: boolean;
    userOnly?: boolean;
  }) {
    const key = `result-${params.hook}-${params.valid}`;
    const data = JSON.stringify(params);

    if (!this.shouldLog(key, data)) return;

    console.log(
      `%c${this.getIcon('hook')} ${params.hook} Result%c\n` +
      `├─ Valid: ${params.valid}/${params.total} tokens\n` +
      `├─ Filter: ${params.category ? params.category : 'no category filter'}\n` +
      `├─ For Sale Only: ${params.isForSale === true ? '✅' : params.isForSale === false ? '❌' : '⚪'}\n` +
      `└─ User Only: ${params.userOnly ? '✅ (by owner)' : '❌'}`,
      'color: #32cd32; font-weight: bold;',
      'color: #ffffff;'
    );
  }

  /**
   * Log cache operation
   */
  logCacheOperation(params: {
    operation: 'hit' | 'miss' | 'set' | 'clear';
    key: string;
    size?: number;
  }) {
    const logKey = `cache-${params.operation}-${params.key}`;
    const data = JSON.stringify(params);

    if (!this.shouldLog(logKey, data)) return;
    
    console.log(
      `%c${this.getIcon('cache')} Cache ${params.operation.toUpperCase()}%c\n` +
      `├─ Key: ${params.key}\n` +
      `└─ ${params.size !== undefined ? `Size: ${params.size} items` : 'N/A'}`,
      `color: #4169e1; font-weight: bold;`,
      'color: #ffffff;'
    );
  }

  /**
   * Log filter application
   */
  logFilter(params: {
    page: string;
    originalCount: number;
    filteredCount: number;
    filters: {
      search?: string;
      category?: string;
      status?: string;
      nftType?: string;
      sortBy?: string;
    };
  }) {
    const key = `filter-${params.page}`;
    const data = JSON.stringify(params);

    if (!this.shouldLog(key, data)) return;

    const filterList = Object.entries(params.filters)
      .filter(([, value]) => value && value !== 'all')
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    console.log(
      `%c${this.getIcon('filter')} Filters Applied%c\n` +
      `├─ Page: ${params.page}\n` +
      `├─ Original: ${params.originalCount} NFTs\n` +
      `├─ Filtered: ${params.filteredCount} NFTs\n` +
      `└─ Active Filters: ${filterList || 'none'}`,
      'color: #9370db; font-weight: bold;',
      'color: #ffffff;'
    );
  }

  /**
   * NEW: Log Skill NFT Information
   */
  logSkillNFT(params: SkillNFTInfo) {
    const key = `skill-${params.tokenId}`;
    const data = JSON.stringify(params);

    if (!this.shouldLog(key, data)) return;

    console.log(
      `%c${this.getIcon('skill')} Skill NFT #${params.tokenId}%c\n` +
      `├─ Type: ${params.skillType}\n` +
      `├─ Effect: ${params.effectValue / 100}%\n` +
      `├─ Rarity: ${this.getRarityEmoji(params.rarity)} ${params.rarity} (${params.stars}★)\n` +
      `├─ Status: ${params.isActive ? '✅ Active' : '⚪ Inactive'}\n` +
      `${params.mintedAt ? `├─ Minted: ${new Date(params.mintedAt * 1000).toLocaleString()}\n` : ''}` +
      `${params.lastActivationTime ? `└─ Last Activation: ${new Date(params.lastActivationTime * 1000).toLocaleString()}` : '└─ Never Activated'}`,
      'color: #9d4edd; font-weight: bold;',
      'color: #ffffff;'
    );
  }

  /**
   * NEW: Log User Profile (Gamification)
   */
  logUserProfile(params: UserProfileInfo) {
    const key = `profile-${params.address}`;
    const data = JSON.stringify(params);

    if (!this.shouldLog(key, data)) return;

    console.log(
      `%c${this.getIcon('gamification')} User Profile%c\n` +
      `├─ Address: ${params.address.slice(0, 10)}...${params.address.slice(-8)}\n` +
      `├─ Total XP: ${params.totalXP} (Level ${params.level})\n` +
      `├─ Skills Level: ${params.skillsLevel} (Max: ${params.maxActiveSkills} active skills)\n` +
      `├─ Active Skills: ${params.activeSkillsCount}/${params.maxActiveSkills}\n` +
      `├─ NFTs Created: ${params.nftsCreated}\n` +
      `├─ NFTs Sold: ${params.nftsSold}\n` +
      `└─ NFTs Bought: ${params.nftsBought}`,
      'color: #06ffa5; font-weight: bold;',
      'color: #ffffff;'
    );
  }

  /**
   * NEW: Log NFT Metadata (Enhanced)
   */
  logNFTMetadata(params: NFTMetadataInfo) {
    const key = `metadata-${params.tokenId}`;
    const data = JSON.stringify(params);

    if (!this.shouldLog(key, data)) return;

    console.log(
      `%c${this.getIcon('marketplace')} NFT #${params.tokenId}%c\n` +
      `├─ Category: ${params.category}\n` +
      `├─ Creator: ${params.creator.slice(0, 10)}...${params.creator.slice(-8)}\n` +
      `├─ Status: ${params.isListed ? '🏪 Listed' : '🔒 Not Listed'}\n` +
      `├─ Price: ${params.isListed ? `${params.listedPrice} POL` : 'N/A'}\n` +
      `├─ Likes: ❤️ ${params.likes}\n` +
      `├─ Comments: 💬 ${params.commentsCount}\n` +
      `${params.hasSkills ? `└─ Skills: ⚡ ${params.skillsCount} embedded` : '└─ Skills: None'}`,
      'color: #4cc9f0; font-weight: bold;',
      'color: #ffffff;'
    );
  }

  /**
   * NEW: Log Marketplace Transaction
   */
  logTransaction(params: {
    type: 'mint' | 'list' | 'buy' | 'sell' | 'offer' | 'accept_offer' | 'unlist';
    tokenId: string | number;
    from?: string;
    to?: string;
    price?: string;
    txHash?: string;
    gasUsed?: string;
  }) {
    const key = `tx-${params.type}-${params.tokenId}`;
    const data = JSON.stringify(params);

    if (!this.shouldLog(key, data)) return;

    const typeEmoji = {
      mint: '🎨',
      list: '🏪',
      buy: '🛒',
      sell: '💰',
      offer: '📨',
      accept_offer: '🤝',
      unlist: '🔓'
    };

    console.log(
      `%c${this.getIcon('transaction')} ${typeEmoji[params.type]} Transaction: ${params.type.toUpperCase()}%c\n` +
      `├─ Token ID: #${params.tokenId}\n` +
      `${params.from ? `├─ From: ${params.from.slice(0, 10)}...${params.from.slice(-8)}\n` : ''}` +
      `${params.to ? `├─ To: ${params.to.slice(0, 10)}...${params.to.slice(-8)}\n` : ''}` +
      `${params.price ? `├─ Price: ${params.price} POL\n` : ''}` +
      `${params.txHash ? `├─ Tx Hash: ${params.txHash.slice(0, 10)}...${params.txHash.slice(-8)}\n` : ''}` +
      `${params.gasUsed ? `└─ Gas Used: ${params.gasUsed}` : '└─ Status: Pending'}`,
      'color: #f72585; font-weight: bold;',
      'color: #ffffff;'
    );
  }

  /**
   * NEW: Log Skill Activation/Deactivation
   */
  logSkillAction(params: {
    action: 'activate' | 'deactivate' | 'upgrade' | 'cooldown';
    tokenId: string | number;
    skillType: string;
    user: string;
    fee?: string;
    cooldownRemaining?: number;
    success: boolean;
    error?: string;
  }) {
    const key = `skill-action-${params.action}-${params.tokenId}`;
    const data = JSON.stringify(params);

    if (!this.shouldLog(key, data)) return;

    const actionEmoji = {
      activate: '✅',
      deactivate: '❌',
      upgrade: '⬆️',
      cooldown: '⏳'
    };

    console.log(
      `%c${this.getIcon('skill')} ${actionEmoji[params.action]} Skill ${params.action.toUpperCase()}%c\n` +
      `├─ Token ID: #${params.tokenId}\n` +
      `├─ Skill Type: ${params.skillType}\n` +
      `├─ User: ${params.user.slice(0, 10)}...${params.user.slice(-8)}\n` +
      `${params.fee ? `├─ Fee: ${params.fee} POL\n` : ''}` +
      `${params.cooldownRemaining ? `├─ Cooldown: ${Math.floor(params.cooldownRemaining / 86400)} days remaining\n` : ''}` +
      `└─ Status: ${params.success ? '✅ Success' : `❌ Failed${params.error ? `: ${params.error}` : ''}`}`,
      'color: #7209b7; font-weight: bold;',
      'color: #ffffff;'
    );
  }

  /**
   * NEW: Log XP Gain Event
   */
  logXPGain(params: {
    user: string;
    amount: number;
    reason: string;
    newTotalXP: number;
    newLevel?: number;
    levelUp?: boolean;
  }) {
    const key = `xp-${params.user}-${params.amount}`;
    const data = JSON.stringify(params);

    if (!this.shouldLog(key, data)) return;

    console.log(
      `%c${this.getIcon('gamification')} 🎉 XP Gained%c\n` +
      `├─ User: ${params.user.slice(0, 10)}...${params.user.slice(-8)}\n` +
      `├─ Amount: +${params.amount} XP\n` +
      `├─ Reason: ${params.reason}\n` +
      `├─ Total XP: ${params.newTotalXP}\n` +
      `${params.levelUp && params.newLevel ? `└─ 🎊 LEVEL UP! Now Level ${params.newLevel}` : `└─ Current Level: ${params.newLevel || 'Unknown'}`}`,
      'color: #06ffa5; font-weight: bold;',
      'color: #ffffff;'
    );
  }

  /**
   * NEW: Log Quest/Achievement Completion
   */
  logGameEvent(params: {
    type: 'quest' | 'achievement' | 'referral';
    id?: number;
    name: string;
    user: string;
    reward: number;
    description?: string;
  }) {
    const key = `game-${params.type}-${params.id || params.name}`;
    const data = JSON.stringify(params);

    if (!this.shouldLog(key, data)) return;

    const typeEmoji = {
      quest: '📜',
      achievement: '🏆',
      referral: '👥'
    };

    console.log(
      `%c${this.getIcon('gamification')} ${typeEmoji[params.type]} ${params.type.toUpperCase()} Completed%c\n` +
      `├─ Name: ${params.name}\n` +
      `${params.id ? `├─ ID: #${params.id}\n` : ''}` +
      `├─ User: ${params.user.slice(0, 10)}...${params.user.slice(-8)}\n` +
      `├─ Reward: +${params.reward} XP\n` +
      `${params.description ? `└─ ${params.description}` : '└─ Completed!'}`,
      'color: #f72585; font-weight: bold;',
      'color: #ffffff;'
    );
  }

  /**
   * NEW: Log Contract Interaction Error
   */
  logContractError(params: {
    contract: 'GameifiedMarketplace' | 'EnhancedSmartStaking';
    function: string;
    error: Error | string;
    params?: Record<string, unknown>;
  }) {
    const errorMessage = params.error instanceof Error ? params.error.message : params.error;
    
    console.error(
      `%c❌ Contract Error: ${params.contract}%c\n` +
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
      `%c❌ Error in ${params.context}%c\n` +
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
export const nftLogger = new NFTLogger();

// Export class for testing
export default nftLogger;