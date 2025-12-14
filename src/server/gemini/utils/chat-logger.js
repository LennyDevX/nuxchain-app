/**
 * Professional Chat Logger for Debugging
 * Provides clean, structured logging for chat operations
 */

class ChatLogger {
  constructor() {
    this.reset();
  }

  reset() {
    this.sessionId = Math.random().toString(36).substring(2, 9);
    this.startTime = Date.now();
  }

  // ============================================
  // 1️⃣ QUERY ANALYSIS
  // ============================================

  logQueryAnalysis(query, classification) {
    const timestamp = this.getTimestamp();
    const preview = query.substring(0, 60) + (query.length > 60 ? '...' : '');
    
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📝 QUERY ANALYSIS [${timestamp}]`);
    console.log(`${'='.repeat(70)}`);
    console.log(`Query: "${preview}"`);
    console.log(`Type: ${classification.needsKB ? '🔍 Knowledge Base' : '🤖 General Knowledge'}`);
    
    if (classification.confidence) {
      const confidenceBar = this.createBar(classification.confidence, 20);
      console.log(`Confidence: ${confidenceBar} ${(classification.confidence * 100).toFixed(0)}%`);
    }
    
    if (classification.detectedKeywords?.length > 0) {
      console.log(`Keywords: ${classification.detectedKeywords.join(', ')}`);
    }
  }

  // ============================================
  // 2️⃣ KNOWLEDGE BASE SEARCH
  // ============================================

  logKBSearch(query, searchResults) {
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`📚 KNOWLEDGE BASE SEARCH`);
    console.log(`${'─'.repeat(70)}`);
    
    if (!searchResults || searchResults.length === 0) {
      console.log(`❌ No relevant documents found`);
      return;
    }

    console.log(`✅ Found ${searchResults.length} relevant documents:\n`);
    
    searchResults.forEach((result, index) => {
      const contentPreview = result.content
        .substring(0, 70)
        .replace(/\n/g, ' ')
        + (result.content.length > 70 ? '...' : '');
      
      const scoreBar = this.createBar(result.score, 15);
      const topic = result.metadata?.topic || 'unknown';
      
      console.log(
        `  ${index + 1}. [${topic}] ${scoreBar} ${(result.score * 100).toFixed(1)}%`
      );
      console.log(`     "${contentPreview}"`);
    });
  }

  // ============================================
  // 3️⃣ RESPONSE GENERATION
  // ============================================

  logResponseStart(model, config) {
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`🤖 RESPONSE GENERATION`);
    console.log(`${'─'.repeat(70)}`);
    console.log(`Model: ${model}`);
    console.log(`Temperature: ${config.temperature} | Max Tokens: ${config.maxTokens}`);
    console.log(`Streaming: ${config.streaming ? '✅ Yes' : '❌ No'}`);
    console.log(`Status: ⏳ Generating...`);
  }

  logResponseProgress(chunkCount, totalLength) {
    // This can be called frequently, so keep it minimal
    if (chunkCount % 5 === 0) { // Log every 5 chunks
      const sizeKB = (totalLength / 1024).toFixed(1);
      process.stdout.write(`\r  Progress: ${chunkCount} chunks | ${sizeKB}KB`);
    }
  }

  logResponseComplete(totalLength, duration) {
    const durationSec = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const sizeKB = (totalLength / 1024).toFixed(1);
    
    process.stdout.write('\r                                                  \r'); // Clear progress line
    console.log(`✅ Complete: ${sizeKB}KB in ${durationSec}s`);
  }

  // ============================================
  // 4️⃣ CONTEXT INFORMATION
  // ============================================

  logContext(context) {
    if (!context) return;

    console.log(`\n${'─'.repeat(70)}`);
    console.log(`📋 CONTEXT INFORMATION`);
    console.log(`${'─'.repeat(70)}`);

    if (context.context) {
      const contextPreview = context.context
        .substring(0, 100)
        .replace(/\n/g, ' ')
        + (context.context.length > 100 ? '...' : '');
      console.log(`Context: "${contextPreview}"`);
    }

    if (context.score) {
      console.log(`Score: ${(context.score * 100).toFixed(1)}%`);
    }

    if (context.documentsFound) {
      console.log(`Documents: ${context.documentsFound}`);
    }

    if (context.usedEmbeddings !== undefined) {
      console.log(`Method: ${context.usedEmbeddings ? '🔗 Embeddings' : '📝 BM25'}`);
    }
  }

  // ============================================
  // 🆕 TOKEN COUNTING & OPTIMIZATION
  // ============================================

  logTokenCounting(tokenData) {
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`📊 TOKEN ANALYSIS`);
    console.log(`${'─'.repeat(70)}`);

    if (tokenData.beforeOptimization) {
      console.log(`Before Optimization:`);
      console.log(`  • System: ${tokenData.beforeOptimization.systemTokens?.toLocaleString() || 0} tokens`);
      console.log(`  • Context: ${tokenData.beforeOptimization.contextTokens?.toLocaleString() || 0} tokens`);
      console.log(`  • Message: ${tokenData.beforeOptimization.messageTokens?.toLocaleString() || 0} tokens`);
      console.log(`  • Total: ${tokenData.beforeOptimization.totalTokens?.toLocaleString() || 0} tokens`);
    }

    if (tokenData.afterOptimization && tokenData.wasOptimized) {
      console.log(`\nAfter Optimization:`);
      console.log(`  • Context: ${tokenData.afterOptimization.contextTokens?.toLocaleString() || 0} tokens`);
      console.log(`  • Total: ${tokenData.afterOptimization.totalTokens?.toLocaleString() || 0} tokens`);
      
      const reduction = tokenData.beforeOptimization.totalTokens - tokenData.afterOptimization.totalTokens;
      const reductionPercent = ((reduction / tokenData.beforeOptimization.totalTokens) * 100).toFixed(1);
      console.log(`  ✂️ Reduced by: ${reduction.toLocaleString()} tokens (${reductionPercent}%)`);
    }

    if (tokenData.estimatedCost) {
      console.log(`\n💰 Estimated Cost:`);
      console.log(`  • Input: $${tokenData.estimatedCost.inputCost?.toFixed(6) || 0}`);
      console.log(`  • Output: $${tokenData.estimatedCost.outputCost?.toFixed(6) || 0}`);
      console.log(`  • Total: $${tokenData.estimatedCost.totalCost?.toFixed(6) || 0}`);
    }
  }

  logTokenOptimization(original, optimized) {
    if (!optimized.wasTruncated) return;

    console.log(`\n✂️ CONTEXT OPTIMIZATION`);
    console.log(`  Original: ${original} tokens → Optimized: ${optimized.tokenCount} tokens`);
    console.log(`  Reduction: ${optimized.reduction}`);
  }

  // ============================================
  // 🆕 CACHE OPERATIONS
  // ============================================

  logCacheOperation(operation, data = {}) {
    const symbols = {
      'CREATE': '💾🆕',
      'HIT': '💾✅',
      'MISS': '💾❌',
      'UPDATE': '💾🔄',
      'DELETE': '💾🗑️',
      'EXPIRED': '💾⏰'
    };

    const symbol = symbols[operation] || '💾';
    console.log(`\n${symbol} CACHE ${operation}`);

    if (data.cacheName) {
      console.log(`  Cache: ${data.cacheName}`);
    }

    if (data.type) {
      console.log(`  Type: ${data.type}`);
    }

    if (data.ttl) {
      console.log(`  TTL: ${data.ttl}s`);
    }

    if (data.estimatedTokens) {
      console.log(`  Tokens Cached: ${data.estimatedTokens.toLocaleString()}`);
    }

    if (data.tokensSaved) {
      const costSaved = (data.tokensSaved / 1000000) * 0.075 * 0.75; // 75% savings
      console.log(`  💚 Tokens Saved: ${data.tokensSaved.toLocaleString()} (~$${costSaved.toFixed(6)})`);
    }
  }

  logCacheStats(stats) {
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`💾 CACHE STATISTICS`);
    console.log(`${'─'.repeat(70)}`);

    if (stats.hits !== undefined && stats.misses !== undefined) {
      const total = stats.hits + stats.misses;
      const hitRate = total > 0 ? ((stats.hits / total) * 100).toFixed(1) : 0;
      const hitBar = this.createBar(stats.hits / (total || 1), 20);
      
      console.log(`Hit Rate: ${hitBar} ${hitRate}%`);
      console.log(`  • Hits: ${stats.hits}`);
      console.log(`  • Misses: ${stats.misses}`);
    }

    if (stats.activeCaches !== undefined) {
      console.log(`  • Active Caches: ${stats.activeCaches}`);
    }

    if (stats.tokensSaved) {
      console.log(`  💚 Tokens Saved: ${stats.tokensSaved.toLocaleString()}`);
    }

    if (stats.estimatedSavings) {
      console.log(`  💰 Cost Savings: ${stats.estimatedSavings}`);
    }
  }

  // ============================================
  // 🆕 COST TRACKING
  // ============================================

  logCostTracking(costData) {
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`💰 COST TRACKING`);
    console.log(`${'─'.repeat(70)}`);

    if (costData.tokens) {
      console.log(`Token Usage:`);
      console.log(`  • Input: ${costData.tokens.input?.toLocaleString() || 0}`);
      console.log(`  • Output: ${costData.tokens.output?.toLocaleString() || 0}`);
      console.log(`  • Cached: ${costData.tokens.cached?.toLocaleString() || 0}`);
      console.log(`  • Total: ${costData.tokens.total?.toLocaleString() || 0}`);
    }

    if (costData.costs) {
      console.log(`\nCost Breakdown:`);
      console.log(`  • Input Cost: ${costData.costs.input}`);
      console.log(`  • Output Cost: ${costData.costs.output}`);
      console.log(`  • Cached Cost: ${costData.costs.cached}`);
      console.log(`  • Total Cost: ${costData.costs.total}`);
      console.log(`  💚 Savings: ${costData.costs.savings}`);
    }

    if (costData.requests) {
      console.log(`\nRequest Stats:`);
      console.log(`  • Total Requests: ${costData.requests.total}`);
      console.log(`  • Cache Hit Rate: ${costData.requests.cacheHitRate}`);
    }

    if (costData.averages) {
      console.log(`\nAverages:`);
      console.log(`  • Tokens/Request: ${costData.averages.tokensPerRequest}`);
      console.log(`  • Cost/Request: ${costData.averages.costPerRequest}`);
    }
  }

  logCostSummary(summary) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`💰 SESSION COST SUMMARY`);
    console.log(`${'='.repeat(70)}`);
    console.log(summary);
  }

  // ============================================
  // 5️⃣ ERROR HANDLING
  // ============================================

  logError(error, context = '') {
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`❌ ERROR ${context ? `[${context}]` : ''}`);
    console.log(`${'─'.repeat(70)}`);
    console.log(`Message: ${error.message}`);
    if (error.stack) {
      console.log(`Stack: ${error.stack.split('\n')[1]?.trim()}`);
    }
  }

  // ============================================
  // 6️⃣ PERFORMANCE METRICS
  // ============================================

  logMetrics(metrics) {
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`⏱️ PERFORMANCE METRICS`);
    console.log(`${'─'.repeat(70)}`);

    // Timing metrics
    if (metrics.queryAnalysisTime) {
      console.log(`Query Analysis: ${metrics.queryAnalysisTime.toFixed(0)}ms`);
    }

    if (metrics.kbSearchTime) {
      console.log(`KB Search: ${metrics.kbSearchTime.toFixed(0)}ms`);
    }

    if (metrics.tokenCountingTime) {
      console.log(`Token Counting: ${metrics.tokenCountingTime.toFixed(0)}ms`);
    }

    if (metrics.contextOptimizationTime) {
      console.log(`Context Optimization: ${metrics.contextOptimizationTime.toFixed(0)}ms`);
    }

    if (metrics.cacheCheckTime) {
      console.log(`Cache Check: ${metrics.cacheCheckTime.toFixed(0)}ms`);
    }

    if (metrics.responseTime) {
      console.log(`Response Generation: ${metrics.responseTime.toFixed(0)}ms`);
    }

    if (metrics.totalTime) {
      console.log(`Total Time: ${metrics.totalTime.toFixed(0)}ms`);
    }

    // Cost metrics
    if (metrics.tokensUsed) {
      console.log(`\nTokens Used: ${metrics.tokensUsed.toLocaleString()}`);
    }

    if (metrics.tokensSaved) {
      console.log(`💚 Tokens Saved: ${metrics.tokensSaved.toLocaleString()}`);
    }

    if (metrics.estimatedCost) {
      console.log(`💰 Estimated Cost: $${metrics.estimatedCost.toFixed(6)}`);
    }

    if (metrics.cacheUsed !== undefined) {
      console.log(`Cache Used: ${metrics.cacheUsed ? '✅ Yes' : '❌ No'}`);
    }

    console.log(`${'='.repeat(70)}\n`);
  }

  // ============================================
  // 7️⃣ SYSTEM INFORMATION
  // ============================================

  logSystemInfo(config = {}) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`⚙️ CHAT SESSION INITIALIZED`);
    console.log(`${'='.repeat(70)}`);
    console.log(`Session ID: ${this.sessionId}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    if (config.kbEnabled !== undefined) {
      console.log(`Knowledge Base: ${config.kbEnabled ? '✅ Enabled' : '❌ Disabled'}`);
    }
    
    if (config.embeddingsEnabled !== undefined) {
      console.log(`Embeddings: ${config.embeddingsEnabled ? '✅ Enabled' : '❌ Disabled'}`);
    }

    if (config.cachingEnabled !== undefined) {
      console.log(`Context Caching: ${config.cachingEnabled ? '💾✅ Enabled' : '💾❌ Disabled'}`);
    }

    if (config.tokenCountingEnabled !== undefined) {
      console.log(`Token Counting: ${config.tokenCountingEnabled ? '📊✅ Enabled' : '📊❌ Disabled'}`);
    }

    if (config.costTrackingEnabled !== undefined) {
      console.log(`Cost Tracking: ${config.costTrackingEnabled ? '💰✅ Enabled' : '💰❌ Disabled'}`);
    }

    console.log(`${'='.repeat(70)}\n`);
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  createBar(value, width = 20) {
    if (typeof value !== 'number' || value < 0 || value > 1) return '';
    
    const filled = Math.round(value * width);
    const empty = width - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    
    return `[${bar}]`;
  }

  getTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  }

  // ============================================
  // SUMMARY
  // ============================================

  logSummary(data) {
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`📊 CHAT SUMMARY`);
    console.log(`${'─'.repeat(70)}`);

    if (data.queryType) {
      console.log(`Query Type: ${data.queryType}`);
    }

    if (data.kbUsed !== undefined) {
      console.log(`KB Used: ${data.kbUsed ? '✅ Yes' : '❌ No'}`);
    }

    if (data.cacheUsed !== undefined) {
      console.log(`Cache Used: ${data.cacheUsed ? '💾✅ Yes' : '💾❌ No'}`);
    }

    if (data.contextOptimized !== undefined) {
      console.log(`Context Optimized: ${data.contextOptimized ? '✂️ Yes' : '❌ No'}`);
    }

    if (data.tokensUsed) {
      console.log(`Tokens Used: ${data.tokensUsed.toLocaleString()}`);
    }

    if (data.tokensSaved) {
      console.log(`💚 Tokens Saved: ${data.tokensSaved.toLocaleString()}`);
    }

    if (data.estimatedCost) {
      console.log(`💰 Estimated Cost: $${data.estimatedCost.toFixed(6)}`);
    }

    if (data.costSavings) {
      console.log(`💚 Cost Savings: $${data.costSavings.toFixed(6)}`);
    }

    if (data.responseLength) {
      console.log(`Response Length: ${data.responseLength} chars`);
    }

    if (data.status) {
      console.log(`Status: ${data.status}`);
    }

    console.log(`${'='.repeat(70)}\n`);
  }
}

// Export singleton instance
export default new ChatLogger();
