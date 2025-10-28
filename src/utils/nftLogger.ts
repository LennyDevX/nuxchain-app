/**
 * 🎨 NFT Logger Utility
 * 
 * Centralized logging system for NFT operations across the app.
 * Prevents infinite loops and provides consistent logging format.
 * 
 * Features:
 * - Deduplication: Only logs when data changes
 * - Conditional: Only logs in development
 * - Performance: Uses Map for O(1) lookups
 * - Type-safe: Full TypeScript support
 */

type LogLevel = 'info' | 'success' | 'warning' | 'error';
type LogContext = 'page' | 'hook' | 'fetch' | 'cache' | 'filter';

interface LogEntry {
  timestamp: number;
  hash: string;
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

    // If same data was logged recently, skip
    if (cached && cached.hash === hash && now - cached.timestamp < this.debounceTime) {
      return false;
    }

    // Update cache
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
      default: return '📋';
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
   * Log cache hit/miss
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
   * Log error
   */
  logError(params: {
    context: string;
    error: Error | string;
    metadata?: Record<string, unknown>;
  }) {
    // Always log errors (no deduplication)
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
