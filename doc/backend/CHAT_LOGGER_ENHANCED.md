# 📝 Chat Logger - Enhanced Logging Guide

## Overview

The Chat Logger has been enhanced to provide comprehensive logging for cost optimization features including:

- **Token Counting** - Track token usage and optimization
- **Context Caching** - Monitor cache hits/misses and savings
- **Cost Tracking** - Calculate and display cost estimates

## New Logging Methods

### 1. Token Counting Logs

Log token analysis and optimization results:

```javascript
import chatLogger from '../utils/chat-logger.js';

// Log token counting before optimization
chatLogger.logTokenCounting({
  beforeOptimization: {
    systemTokens: 1500,
    contextTokens: 3000,
    messageTokens: 500,
    totalTokens: 5000
  },
  afterOptimization: {
    contextTokens: 2000,
    totalTokens: 4000
  },
  wasOptimized: true,
  estimatedCost: {
    inputCost: 0.000375,
    outputCost: 0.000150,
    totalCost: 0.000525
  }
});
```

**Output:**
```
──────────────────────────────────────────────────────────────────────
📊 TOKEN ANALYSIS
──────────────────────────────────────────────────────────────────────
Before Optimization:
  • System: 1,500 tokens
  • Context: 3,000 tokens
  • Message: 500 tokens
  • Total: 5,000 tokens

After Optimization:
  • Context: 2,000 tokens
  • Total: 4,000 tokens
  ✂️ Reduced by: 1,000 tokens (20.0%)

💰 Estimated Cost:
  • Input: $0.000375
  • Output: $0.000150
  • Total: $0.000525
```

### 2. Cache Operation Logs

Log cache operations (create, hit, miss, delete):

```javascript
// Log cache creation
chatLogger.logCacheOperation('CREATE', {
  cacheName: 'nuxchain-system-20231214',
  type: 'system_instruction',
  ttl: 300,
  estimatedTokens: 2500
});

// Log cache hit with tokens saved
chatLogger.logCacheOperation('HIT', {
  cacheName: 'nuxchain-system-20231214',
  type: 'system_instruction',
  tokensSaved: 2500
});
```

**Output:**
```
💾🆕 CACHE CREATE
  Cache: nuxchain-system-20231214
  Type: system_instruction
  TTL: 300s
  Tokens Cached: 2,500

💾✅ CACHE HIT
  Cache: nuxchain-system-20231214
  Type: system_instruction
  💚 Tokens Saved: 2,500 (~$0.000141)
```

### 3. Cache Statistics

Display cache performance metrics:

```javascript
chatLogger.logCacheStats({
  hits: 45,
  misses: 5,
  activeCaches: 3,
  tokensSaved: 125000,
  estimatedSavings: '$0.007031'
});
```

**Output:**
```
──────────────────────────────────────────────────────────────────────
💾 CACHE STATISTICS
──────────────────────────────────────────────────────────────────────
Hit Rate: [████████████████░░░░] 90.0%
  • Hits: 45
  • Misses: 5
  • Active Caches: 3
  💚 Tokens Saved: 125,000
  💰 Cost Savings: $0.007031
```

### 4. Cost Tracking

Log comprehensive cost tracking data:

```javascript
chatLogger.logCostTracking({
  tokens: {
    input: 50000,
    output: 25000,
    cached: 150000,
    total: 75000
  },
  costs: {
    input: '$0.003750',
    output: '$0.007500',
    cached: '$0.002813',
    total: '$0.014063',
    savings: '$0.008437'
  },
  requests: {
    total: 100,
    cacheHitRate: '75.0%'
  },
  averages: {
    tokensPerRequest: 750,
    costPerRequest: '$0.000141'
  }
});
```

**Output:**
```
──────────────────────────────────────────────────────────────────────
💰 COST TRACKING
──────────────────────────────────────────────────────────────────────
Token Usage:
  • Input: 50,000
  • Output: 25,000
  • Cached: 150,000
  • Total: 75,000

Cost Breakdown:
  • Input Cost: $0.003750
  • Output Cost: $0.007500
  • Cached Cost: $0.002813
  • Total Cost: $0.014063
  💚 Savings: $0.008437

Request Stats:
  • Total Requests: 100
  • Cache Hit Rate: 75.0%

Averages:
  • Tokens/Request: 750
  • Cost/Request: $0.000141
```

### 5. Enhanced Metrics

Updated metrics logging with cost data:

```javascript
chatLogger.logMetrics({
  queryAnalysisTime: 15,
  kbSearchTime: 45,
  tokenCountingTime: 8,
  contextOptimizationTime: 12,
  cacheCheckTime: 3,
  responseTime: 1200,
  totalTime: 1283,
  tokensUsed: 4500,
  tokensSaved: 2500,
  estimatedCost: 0.000338,
  cacheUsed: true
});
```

**Output:**
```
──────────────────────────────────────────────────────────────────────
⏱️ PERFORMANCE METRICS
──────────────────────────────────────────────────────────────────────
Query Analysis: 15ms
KB Search: 45ms
Token Counting: 8ms
Context Optimization: 12ms
Cache Check: 3ms
Response Generation: 1200ms
Total Time: 1283ms

Tokens Used: 4,500
💚 Tokens Saved: 2,500
💰 Estimated Cost: $0.000338
Cache Used: ✅ Yes
══════════════════════════════════════════════════════════════════════
```

### 6. Enhanced Summary

Updated summary with cost savings:

```javascript
chatLogger.logSummary({
  queryType: 'Knowledge Base Query',
  kbUsed: true,
  cacheUsed: true,
  contextOptimized: true,
  tokensUsed: 4500,
  tokensSaved: 2500,
  estimatedCost: 0.000338,
  costSavings: 0.000141,
  responseLength: 850,
  status: 'SUCCESS'
});
```

**Output:**
```
──────────────────────────────────────────────────────────────────────
📊 CHAT SUMMARY
──────────────────────────────────────────────────────────────────────
Query Type: Knowledge Base Query
KB Used: ✅ Yes
Cache Used: 💾✅ Yes
Context Optimized: ✂️ Yes
Tokens Used: 4,500
💚 Tokens Saved: 2,500
💰 Estimated Cost: $0.000338
💚 Cost Savings: $0.000141
Response Length: 850 chars
Status: SUCCESS
══════════════════════════════════════════════════════════════════════
```

## Integration Examples

### Complete Request Flow with Enhanced Logging

```javascript
import chatLogger from '../utils/chat-logger.js';
import tokenCountingService from '../services/token-counting-service.js';
import contextCacheService from '../services/context-cache-service.js';
import costTrackingService from '../services/cost-tracking-service.js';

async function processEnhancedChatRequest(query) {
  const startTime = Date.now();
  
  // 1. Log system info with new features
  chatLogger.logSystemInfo({
    kbEnabled: true,
    embeddingsEnabled: true,
    cachingEnabled: true,
    tokenCountingEnabled: true,
    costTrackingEnabled: true
  });

  // 2. Count tokens before optimization
  const tokenBreakdown = await tokenCountingService.countMultiPartTokens({
    systemInstruction: systemInst,
    context: kbContext,
    message: query
  });

  chatLogger.logTokenCounting({
    beforeOptimization: tokenBreakdown,
    estimatedCost: tokenCountingService.estimateCost(
      tokenBreakdown.totalTokens,
      500
    )
  });

  // 3. Optimize context if needed
  const optimized = await tokenCountingService.optimizeContextLength(
    kbContext,
    4000
  );

  if (optimized.wasTruncated) {
    chatLogger.logTokenOptimization(
      tokenBreakdown.contextTokens,
      optimized
    );
  }

  // 4. Check cache
  const cache = await contextCacheService.getOrCreateSystemCache(
    systemInst,
    optimized.optimizedContext
  );

  // 5. Generate response
  const response = await generateResponse(query, cache);

  // 6. Track costs
  costTrackingService.recordFromResponse(
    response.usageMetadata,
    'gemini-2.5-flash-lite'
  );

  // 7. Log final metrics
  const duration = Date.now() - startTime;
  chatLogger.logMetrics({
    totalTime: duration,
    tokensUsed: response.usageMetadata.promptTokenCount,
    tokensSaved: cache ? cache.estimatedTokens : 0,
    estimatedCost: costTrackingService.getStats().costs.total,
    cacheUsed: !!cache
  });

  // 8. Log summary
  chatLogger.logSummary({
    queryType: 'Knowledge Base Query',
    kbUsed: true,
    cacheUsed: !!cache,
    contextOptimized: optimized.wasTruncated,
    tokensUsed: response.usageMetadata.totalTokenCount,
    tokensSaved: cache ? cache.estimatedTokens : 0,
    estimatedCost: costTrackingService.getStats().costs.total,
    responseLength: response.text.length,
    status: 'SUCCESS'
  });
}
```

## System Info Enhancement

The `logSystemInfo` method now includes cost optimization features:

```javascript
chatLogger.logSystemInfo({
  kbEnabled: true,
  embeddingsEnabled: true,
  cachingEnabled: true,           // NEW
  tokenCountingEnabled: true,     // NEW
  costTrackingEnabled: true       // NEW
});
```

**Output:**
```
══════════════════════════════════════════════════════════════════════
⚙️ CHAT SESSION INITIALIZED
══════════════════════════════════════════════════════════════════════
Session ID: abc123xyz
Environment: development
Knowledge Base: ✅ Enabled
Embeddings: ✅ Enabled
Context Caching: 💾✅ Enabled
Token Counting: 📊✅ Enabled
Cost Tracking: 💰✅ Enabled
══════════════════════════════════════════════════════════════════════
```

## Best Practices

1. **Log at Key Points**: Add logging at critical stages (token counting, cache operations, cost tracking)

2. **Use Appropriate Log Levels**: 
   - Token counting → Info
   - Cache hits → Info
   - Cache misses → Debug
   - Cost tracking → Info

3. **Include Context**: Always provide relevant metadata in log calls

4. **Monitor Performance**: Check metrics regularly to identify optimization opportunities

5. **Review Summaries**: Use summary logs to track overall system health and cost efficiency

## Viewing Logs in Production

To see these enhanced logs in your terminal when running the local server:

```bash
npm run dev:server
```

Or view metrics via the new endpoints:

```bash
# View all metrics (JSON)
curl http://localhost:3001/metrics

# View formatted summary
curl http://localhost:3001/metrics/summary

# View active caches
curl http://localhost:3001/cache/list
```

## Cost Monitoring Dashboard

The enhanced logger integrates with the cost tracking service to provide a periodic summary (every 30 minutes):

```
📊 ═══════════════════════════════════════════════════════
   GEMINI API COST TRACKING SUMMARY
═══════════════════════════════════════════════════════

   📈 TOKEN USAGE
   ├─ Input Tokens:    125,000
   ├─ Output Tokens:   50,000
   ├─ Cached Tokens:   300,000
   └─ Total:           175,000

   💰 COST BREAKDOWN
   ├─ Input Cost:      $0.009375
   ├─ Output Cost:     $0.015000
   ├─ Cached Cost:     $0.005625
   ├─ Total Cost:      $0.030000
   └─ 💚 Savings:      $0.016875

   📊 REQUEST METRICS
   ├─ Total Requests:  200
   ├─ Cache Hits:      150
   ├─ Cache Misses:    50
   └─ Hit Rate:        75.0%

   ⏱️ SESSION INFO
   ├─ Duration:        30.00 min
   └─ Avg/Request:     875 tokens ($0.000150)

═══════════════════════════════════════════════════════
```

## Troubleshooting

### Logs Not Showing

If enhanced logs aren't appearing:

1. Ensure chat logger is imported:
   ```javascript
   import chatLogger from '../utils/chat-logger.js';
   ```

2. Check that services are calling the logger:
   ```javascript
   chatLogger.logTokenCounting(tokenData);
   chatLogger.logCacheOperation('HIT', cacheData);
   ```

3. Verify NODE_ENV is 'development' for full logs

### Performance Impact

The enhanced logging adds minimal overhead (~2-5ms per request) and only logs to console in development mode.

---

**Updated:** December 14, 2025
**Version:** 2.0.0 (Cost Optimization Release)
