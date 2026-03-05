/**
 * 💰 Cost Tracking Service for Gemini API
 * 
 * Features:
 * - Track token usage across requests
 * - Calculate estimated costs based on pricing
 * - Monitor cache hit rates and savings
 * - Generate usage reports
 * 
  * Pricing (as of Dec 2024 - gemini-3.1-flash-lite):
 * - Input: $0.075 per 1M tokens
 * - Output: $0.30 per 1M tokens
 * - Cached: 25% of input price ($0.01875 per 1M tokens)
 */

class CostTrackingService {
  constructor() {
    this.stats = {
      // Token counts
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCachedTokens: 0,
      
      // Request counts
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      
      // Cost calculations
      estimatedInputCost: 0,
      estimatedOutputCost: 0,
      estimatedCachedCost: 0,
      estimatedSavings: 0,
      
      // Session info
      sessionStart: Date.now(),
      lastRequestTime: null
    };

    // Pricing per 1M tokens (gemini-3.1-flash-lite)
    this.pricing = {
      'gemini-3.1-flash-lite': {
        input: 0.075,
        output: 0.30,
        cached: 0.01875  // 25% of input
      },
      'gemini-2.5-flash': {
        input: 0.15,
        output: 0.60,
        cached: 0.0375
      },
      'gemini-2.5-pro': {
        input: 1.25,
        output: 5.00,
        cached: 0.3125
      }
    };

    console.log('✅ Cost Tracking Service initialized');
  }

  /**
   * Record a request's token usage
   * @param {Object} usage - Token usage from response
   * @param {string} model - Model name
   * @param {boolean} usedCache - Whether cache was used
   */
  recordUsage(usage, model = 'gemini-3.1-flash-lite', usedCache = false) {
    const { inputTokens = 0, outputTokens = 0, cachedTokens = 0 } = usage;
    
    this.stats.totalInputTokens += inputTokens;
    this.stats.totalOutputTokens += outputTokens;
    this.stats.totalCachedTokens += cachedTokens;
    this.stats.totalRequests++;
    this.stats.lastRequestTime = Date.now();

    if (usedCache) {
      this.stats.cacheHits++;
    } else {
      this.stats.cacheMisses++;
    }

    // Calculate costs
    const prices = this.pricing[model] || this.pricing['gemini-3.1-flash-lite'];
    
    const inputCost = (inputTokens / 1000000) * prices.input;
    const outputCost = (outputTokens / 1000000) * prices.output;
    const cachedCost = (cachedTokens / 1000000) * prices.cached;
    
    this.stats.estimatedInputCost += inputCost;
    this.stats.estimatedOutputCost += outputCost;
    this.stats.estimatedCachedCost += cachedCost;

    // Calculate savings from caching
    if (cachedTokens > 0) {
      const regularCost = (cachedTokens / 1000000) * prices.input;
      const savings = regularCost - cachedCost;
      this.stats.estimatedSavings += savings;
    }

    console.log(`💰 Cost recorded: input=${inputTokens}, output=${outputTokens}, cached=${cachedTokens}`);
  }

  /**
   * Record usage from Gemini API response metadata
   * @param {Object} usageMetadata - From response.usageMetadata
   * @param {string} model - Model name
   */
  recordFromResponse(usageMetadata, model = 'gemini-3.1-flash-lite') {
    if (!usageMetadata) return;

    const usage = {
      inputTokens: usageMetadata.promptTokenCount || 0,
      outputTokens: usageMetadata.candidatesTokenCount || 0,
      cachedTokens: usageMetadata.cachedContentTokenCount || 0
    };

    const usedCache = usage.cachedTokens > 0;
    this.recordUsage(usage, model, usedCache);
  }

  /**
   * Get current statistics
   * @returns {Object} Current stats and calculated metrics
   */
  getStats() {
    const sessionDuration = (Date.now() - this.stats.sessionStart) / 1000 / 60; // minutes
    const cacheHitRate = this.stats.totalRequests > 0
      ? ((this.stats.cacheHits / this.stats.totalRequests) * 100).toFixed(2)
      : 0;

    const totalCost = this.stats.estimatedInputCost + 
                      this.stats.estimatedOutputCost + 
                      this.stats.estimatedCachedCost;

    return {
      // Token usage
      tokens: {
        input: this.stats.totalInputTokens,
        output: this.stats.totalOutputTokens,
        cached: this.stats.totalCachedTokens,
        total: this.stats.totalInputTokens + this.stats.totalOutputTokens
      },
      
      // Request metrics
      requests: {
        total: this.stats.totalRequests,
        cacheHits: this.stats.cacheHits,
        cacheMisses: this.stats.cacheMisses,
        cacheHitRate: `${cacheHitRate}%`
      },
      
      // Cost breakdown
      costs: {
        input: `$${this.stats.estimatedInputCost.toFixed(6)}`,
        output: `$${this.stats.estimatedOutputCost.toFixed(6)}`,
        cached: `$${this.stats.estimatedCachedCost.toFixed(6)}`,
        total: `$${totalCost.toFixed(6)}`,
        savings: `$${this.stats.estimatedSavings.toFixed(6)}`
      },
      
      // Session info
      session: {
        durationMinutes: sessionDuration.toFixed(2),
        startTime: new Date(this.stats.sessionStart).toISOString(),
        lastRequest: this.stats.lastRequestTime 
          ? new Date(this.stats.lastRequestTime).toISOString()
          : null
      },
      
      // Averages
      averages: {
        tokensPerRequest: this.stats.totalRequests > 0
          ? Math.round((this.stats.totalInputTokens + this.stats.totalOutputTokens) / this.stats.totalRequests)
          : 0,
        costPerRequest: this.stats.totalRequests > 0
          ? `$${(totalCost / this.stats.totalRequests).toFixed(6)}`
          : '$0.000000'
      }
    };
  }

  /**
   * Get a formatted summary for logging
   * @returns {string} Formatted summary
   */
  getSummary() {
    const stats = this.getStats();
    
    return `
📊 ═══════════════════════════════════════════════════════
   GEMINI API COST TRACKING SUMMARY
═══════════════════════════════════════════════════════

   📈 TOKEN USAGE
   ├─ Input Tokens:    ${stats.tokens.input.toLocaleString()}
   ├─ Output Tokens:   ${stats.tokens.output.toLocaleString()}
   ├─ Cached Tokens:   ${stats.tokens.cached.toLocaleString()}
   └─ Total:           ${stats.tokens.total.toLocaleString()}

   💰 COST BREAKDOWN
   ├─ Input Cost:      ${stats.costs.input}
   ├─ Output Cost:     ${stats.costs.output}
   ├─ Cached Cost:     ${stats.costs.cached}
   ├─ Total Cost:      ${stats.costs.total}
   └─ 💚 Savings:      ${stats.costs.savings}

   📊 REQUEST METRICS
   ├─ Total Requests:  ${stats.requests.total}
   ├─ Cache Hits:      ${stats.requests.cacheHits}
   ├─ Cache Misses:    ${stats.requests.cacheMisses}
   └─ Hit Rate:        ${stats.requests.cacheHitRate}

   ⏱️ SESSION INFO
   ├─ Duration:        ${stats.session.durationMinutes} min
   └─ Avg/Request:     ${stats.averages.tokensPerRequest} tokens (${stats.averages.costPerRequest})

═══════════════════════════════════════════════════════
`;
  }

  /**
   * Estimate cost for a specific request before sending
   * @param {number} inputTokens - Estimated input tokens
   * @param {number} outputTokens - Estimated output tokens
   * @param {string} model - Model name
   * @returns {Object} Cost estimate
   */
  estimateCost(inputTokens, outputTokens = 500, model = 'gemini-3.1-flash-lite') {
    const prices = this.pricing[model] || this.pricing['gemini-3.1-flash-lite'];
    
    const inputCost = (inputTokens / 1000000) * prices.input;
    const outputCost = (outputTokens / 1000000) * prices.output;
    const totalCost = inputCost + outputCost;

    // Potential savings if cached
    const cachedCost = (inputTokens / 1000000) * prices.cached;
    const potentialSavings = inputCost - cachedCost;

    return {
      inputCost: `$${inputCost.toFixed(6)}`,
      outputCost: `$${outputCost.toFixed(6)}`,
      totalCost: `$${totalCost.toFixed(6)}`,
      potentialSavings: `$${potentialSavings.toFixed(6)} (if cached)`
    };
  }

  /**
   * Reset all statistics
   */
  reset() {
    this.stats = {
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCachedTokens: 0,
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      estimatedInputCost: 0,
      estimatedOutputCost: 0,
      estimatedCachedCost: 0,
      estimatedSavings: 0,
      sessionStart: Date.now(),
      lastRequestTime: null
    };
    console.log('📊 Cost tracking stats reset');
  }

  /**
   * Export stats as JSON for persistence
   * @returns {string} JSON string
   */
  exportStats() {
    return JSON.stringify({
      ...this.stats,
      exportTime: new Date().toISOString()
    }, null, 2);
  }
}

// Singleton instance
const costTrackingService = new CostTrackingService();

// Log summary every 30 minutes
setInterval(() => {
  if (costTrackingService.stats.totalRequests > 0) {
    console.log(costTrackingService.getSummary());
  }
}, 30 * 60 * 1000);

export default costTrackingService;
export { CostTrackingService };
