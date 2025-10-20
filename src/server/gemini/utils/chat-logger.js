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

    if (metrics.queryAnalysisTime) {
      console.log(`Query Analysis: ${metrics.queryAnalysisTime.toFixed(0)}ms`);
    }

    if (metrics.kbSearchTime) {
      console.log(`KB Search: ${metrics.kbSearchTime.toFixed(0)}ms`);
    }

    if (metrics.responseTime) {
      console.log(`Response Generation: ${metrics.responseTime.toFixed(0)}ms`);
    }

    if (metrics.totalTime) {
      console.log(`Total Time: ${metrics.totalTime.toFixed(0)}ms`);
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

    if (data.tokensUsed) {
      console.log(`Tokens Used: ${data.tokensUsed}`);
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
