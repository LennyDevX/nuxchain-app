/**
 * 🎯 Token Counting Service for Gemini API
 * 
 * Features:
 * - Pre-count tokens before sending requests
 * - Optimize context length dynamically
 * - Track token usage for cost optimization
 * - Prevent context truncation issues
 * 
 * Based on Google GenAI SDK latest documentation (Dec 2024)
 */

import ai from '../config/ai-config.js';
import { DEFAULT_MODEL } from '../config/ai-config.js';

class TokenCountingService {
  constructor() {
    this.tokenStats = {
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCachedTokens: 0,
      requestCount: 0,
      averageInputTokens: 0,
      estimatedCostSavings: 0
    };
    
    // Model limits (gemini-3.1-flash-lite)
    this.modelLimits = {
      'gemini-3.1-flash-lite': {
        inputTokenLimit: 1000000,  // 1M tokens
        outputTokenLimit: 8192,
        minCacheTokens: 1024,     // Minimum for caching
        tokensPerChar: 0.25       // ~4 chars per token
      },
      'gemini-2.5-flash': {
        inputTokenLimit: 1000000,
        outputTokenLimit: 8192,
        minCacheTokens: 1024,
        tokensPerChar: 0.25
      },
      'gemini-2.5-pro': {
        inputTokenLimit: 2000000,
        outputTokenLimit: 8192,
        minCacheTokens: 4096,
        tokensPerChar: 0.25
      }
    };

    console.log('✅ Token Counting Service initialized');
  }

  /**
   * 🔢 Count tokens for text content using Gemini API
   * @param {string} content - Text content to count
   * @param {string} model - Model name
   * @returns {Promise<{totalTokens: number, estimatedCost: number}>}
   */
  async countTokens(content, model = DEFAULT_MODEL) {
    try {
      if (!content || typeof content !== 'string') {
        return { totalTokens: 0, estimatedCost: 0 };
      }

      // Use the official countTokens API
      const result = await ai.models.countTokens({
        model,
        contents: content
      });

      const totalTokens = result.totalTokens || 0;
      
      // Update stats
      this.tokenStats.totalInputTokens += totalTokens;
      this.tokenStats.requestCount++;
      this.tokenStats.averageInputTokens = 
        this.tokenStats.totalInputTokens / this.tokenStats.requestCount;

      console.log(`📊 Token count: ${totalTokens} tokens for ${content.length} chars`);

      return {
        totalTokens,
        estimatedCost: this.estimateCost(totalTokens, 0, model),
        charCount: content.length,
        tokensPerChar: totalTokens / content.length
      };
    } catch (error) {
      console.warn('⚠️ Token counting failed, using estimation:', error.message);
      
      // Fallback to estimation
      return this.estimateTokens(content, model);
    }
  }

  /**
   * 🔢 Count tokens for multi-part content (system + context + message)
   * @param {Object} parts - Content parts
   * @param {string} model - Model name
   * @returns {Promise<Object>}
   */
  async countMultiPartTokens(parts, model = DEFAULT_MODEL) {
    try {
      const { systemInstruction, context, message, history = [] } = parts;

      // Build contents array for counting
      const contentsToCount = [];

      if (systemInstruction) {
        contentsToCount.push({ role: 'user', parts: [{ text: `[System] ${systemInstruction}` }] });
      }

      if (context) {
        contentsToCount.push({ role: 'user', parts: [{ text: `[Context] ${context}` }] });
      }

      // Add history
      for (const msg of history) {
        contentsToCount.push(msg);
      }

      // Add current message
      if (message) {
        contentsToCount.push({ role: 'user', parts: [{ text: message }] });
      }

      // Count tokens using API
      const result = await ai.models.countTokens({
        model,
        contents: contentsToCount
      });

      const breakdown = {
        totalTokens: result.totalTokens || 0,
        systemTokens: systemInstruction ? await this.quickEstimate(systemInstruction) : 0,
        contextTokens: context ? await this.quickEstimate(context) : 0,
        messageTokens: message ? await this.quickEstimate(message) : 0,
        historyTokens: 0
      };

      // Estimate history tokens
      for (const msg of history) {
        const text = msg.parts?.[0]?.text || '';
        breakdown.historyTokens += await this.quickEstimate(text);
      }

      console.log(`📊 Multi-part token count:`, breakdown);

      return breakdown;
    } catch (error) {
      console.warn('⚠️ Multi-part token counting failed:', error.message);
      
      // Fallback estimation
      return this.estimateMultiPartTokens(parts, model);
    }
  }

  /**
   * 🎯 Quick token estimation (no API call)
   */
  async quickEstimate(text, model = DEFAULT_MODEL) {
    if (!text) return 0;
    
    const limits = this.modelLimits[model] || this.modelLimits['gemini-3.1-flash-lite'];
    return Math.ceil(text.length * limits.tokensPerChar);
  }

  /**
   * 📈 Estimate tokens without API call (fallback)
   */
  estimateTokens(content, model = DEFAULT_MODEL) {
    if (!content) return { totalTokens: 0, estimatedCost: 0 };

const limits = this.modelLimits[model] || this.modelLimits['gemini-3.1-flash-lite'];
    const totalTokens = Math.ceil(content.length * limits.tokensPerChar);

    return {
      totalTokens,
      estimatedCost: this.estimateCost(totalTokens, 0, model),
      charCount: content.length,
      tokensPerChar: limits.tokensPerChar,
      isEstimate: true
    };
  }

  /**
   * 📈 Estimate multi-part tokens without API call
   */
  estimateMultiPartTokens(parts, model = DEFAULT_MODEL) {
    const { systemInstruction = '', context = '', message = '', history = [] } = parts;
    const limits = this.modelLimits[model] || this.modelLimits['gemini-3.1-flash-lite'];

    const systemTokens = Math.ceil((systemInstruction?.length || 0) * limits.tokensPerChar);
    const contextTokens = Math.ceil((context?.length || 0) * limits.tokensPerChar);
    const messageTokens = Math.ceil((message?.length || 0) * limits.tokensPerChar);
    
    let historyTokens = 0;
    for (const msg of history) {
      const text = msg.parts?.[0]?.text || '';
      historyTokens += Math.ceil(text.length * limits.tokensPerChar);
    }

    return {
      totalTokens: systemTokens + contextTokens + messageTokens + historyTokens,
      systemTokens,
      contextTokens,
      messageTokens,
      historyTokens,
      isEstimate: true
    };
  }

  /**
   * ✂️ Optimize context length to fit within token limits
   * @param {string} context - Original context
   * @param {number} maxTokens - Maximum allowed tokens
   * @param {string} model - Model name
   * @returns {Promise<{optimizedContext: string, tokenCount: number, wasTruncated: boolean}>}
   */
  async optimizeContextLength(context, maxTokens = 4000, model = DEFAULT_MODEL) {
    if (!context) {
      return { optimizedContext: '', tokenCount: 0, wasTruncated: false };
    }

    try {
      // First, count current tokens
      const currentCount = await this.countTokens(context, model);

      if (currentCount.totalTokens <= maxTokens) {
        return {
          optimizedContext: context,
          tokenCount: currentCount.totalTokens,
          wasTruncated: false
        };
      }

      // Calculate ratio for truncation
      const ratio = maxTokens / currentCount.totalTokens;
      const targetLength = Math.floor(context.length * ratio * 0.95); // 5% safety margin

      // Smart truncation: try to cut at sentence boundaries
      let truncatedContext = context.substring(0, targetLength);
      
      // Find last complete sentence
      const lastSentenceEnd = Math.max(
        truncatedContext.lastIndexOf('.'),
        truncatedContext.lastIndexOf('!'),
        truncatedContext.lastIndexOf('?'),
        truncatedContext.lastIndexOf('\n')
      );

      if (lastSentenceEnd > targetLength * 0.8) {
        truncatedContext = truncatedContext.substring(0, lastSentenceEnd + 1);
      }

      // Verify final token count
      const finalCount = await this.countTokens(truncatedContext, model);

      console.log(`✂️ Context optimized: ${currentCount.totalTokens} → ${finalCount.totalTokens} tokens`);

      return {
        optimizedContext: truncatedContext + '\n[Context truncated for token optimization]',
        tokenCount: finalCount.totalTokens,
        wasTruncated: true,
        originalTokens: currentCount.totalTokens,
        reduction: `${((1 - finalCount.totalTokens / currentCount.totalTokens) * 100).toFixed(1)}%`
      };
    } catch (error) {
      console.warn('⚠️ Context optimization failed:', error.message);
      
      // Fallback: simple character-based truncation
const limits = this.modelLimits[model] || this.modelLimits['gemini-3.1-flash-lite'];
      const maxChars = Math.floor(maxTokens / limits.tokensPerChar);
      
      return {
        optimizedContext: context.substring(0, maxChars) + '...',
        tokenCount: maxTokens,
        wasTruncated: true,
        isEstimate: true
      };
    }
  }

  /**
   * 💰 Estimate cost based on tokens
   * Pricing (as of Dec 2024):
   * - gemini-3.1-flash-lite: $0.075/1M input, $0.30/1M output
   * - Cached tokens: 25% of regular price
   */
  estimateCost(inputTokens, outputTokens, model = DEFAULT_MODEL, cachedTokens = 0) {
    const pricing = {
      'gemini-3.1-flash-lite': { input: 0.075, output: 0.30, cached: 0.01875 },
      'gemini-2.5-flash': { input: 0.15, output: 0.60, cached: 0.0375 },
      'gemini-2.5-pro': { input: 1.25, output: 5.00, cached: 0.3125 }
    };

    const prices = pricing[model] || pricing['gemini-3.1-flash-lite'];
    
    const inputCost = (inputTokens / 1000000) * prices.input;
    const outputCost = (outputTokens / 1000000) * prices.output;
    const cachedCost = (cachedTokens / 1000000) * prices.cached;
    
    return {
      inputCost,
      outputCost,
      cachedCost,
      totalCost: inputCost + outputCost + cachedCost,
      savings: cachedTokens > 0 ? ((inputTokens / 1000000) * prices.input) - cachedCost : 0
    };
  }

  /**
   * 📊 Check if content is suitable for caching
   */
  isCacheWorthy(content, model = DEFAULT_MODEL) {
const limits = this.modelLimits[model] || this.modelLimits['gemini-3.1-flash-lite'];
    const estimatedTokens = Math.ceil(content.length * limits.tokensPerChar);
    
    return {
      isWorthy: estimatedTokens >= limits.minCacheTokens,
      estimatedTokens,
      minRequired: limits.minCacheTokens,
      reason: estimatedTokens >= limits.minCacheTokens 
        ? 'Content meets minimum token threshold for caching'
        : `Content has ${estimatedTokens} tokens, needs ${limits.minCacheTokens} minimum`
    };
  }

  /**
   * 📈 Get token usage statistics
   */
  getStats() {
    return {
      ...this.tokenStats,
      estimatedTotalCost: this.estimateCost(
        this.tokenStats.totalInputTokens,
        this.tokenStats.totalOutputTokens,
        DEFAULT_MODEL,
        this.tokenStats.totalCachedTokens
      )
    };
  }

  /**
   * 🔄 Update stats after a response
   */
  updateStatsFromResponse(usageMetadata) {
    if (!usageMetadata) return;

    const { promptTokenCount, candidatesTokenCount, cachedContentTokenCount } = usageMetadata;

    if (promptTokenCount) this.tokenStats.totalInputTokens += promptTokenCount;
    if (candidatesTokenCount) this.tokenStats.totalOutputTokens += candidatesTokenCount;
    if (cachedContentTokenCount) {
      this.tokenStats.totalCachedTokens += cachedContentTokenCount;
      // Calculate savings
      const regularCost = (cachedContentTokenCount / 1000000) * 0.075;
      const cachedCost = (cachedContentTokenCount / 1000000) * 0.01875;
      this.tokenStats.estimatedCostSavings += regularCost - cachedCost;
    }

    this.tokenStats.requestCount++;
    this.tokenStats.averageInputTokens = 
      this.tokenStats.totalInputTokens / this.tokenStats.requestCount;
  }

  /**
   * 🔄 Reset statistics
   */
  resetStats() {
    this.tokenStats = {
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCachedTokens: 0,
      requestCount: 0,
      averageInputTokens: 0,
      estimatedCostSavings: 0
    };
    console.log('📊 Token stats reset');
  }
}

// Singleton instance
const tokenCountingService = new TokenCountingService();

export default tokenCountingService;
export { TokenCountingService };
