/**
 * Gemini Semantic Streaming API for Vercel
 * Adapted from local implementation with serverless optimizations
 */

import { GoogleGenAI } from '@google/genai';

// ===== TEMPORARY IMPLEMENTATIONS FOR VERCEL =====
// These implementations replace the local services to work in Vercel's serverless environment

// Import the complete knowledge base service
import { getRelevantContext as getKnowledgeBaseContext, searchKnowledgeBase } from '../services/knowledge-base.js';

// Enhanced getRelevantContext using the complete knowledge base
function getRelevantContext(query) {
  console.log('🔍 [PRODUCTION] Using complete knowledge base for query:', query);
  
  try {
    // Use the comprehensive knowledge base service
    const context = getKnowledgeBaseContext(query);
    
    if (context && context.length > 0) {
      console.log('✅ [PRODUCTION] Found relevant context from knowledge base, length:', context.length);
      return context;
    }
    
    // Fallback to direct search if no context found
    const searchResults = searchKnowledgeBase(query, 3);
    if (searchResults && searchResults.length > 0) {
      const fallbackContext = searchResults.map(item => item.content).join('\n\n');
      console.log('✅ [PRODUCTION] Using search results as fallback, length:', fallbackContext.length);
      return fallbackContext;
    }
    
    // Final fallback
    console.log('⚠️ [PRODUCTION] No specific context found, using general fallback');
    return "Nuxchain is a comprehensive decentralized platform that combines staking, NFT marketplace, airdrops and tokenization. It's a complete ecosystem for digital asset management and passive income generation.";
    
  } catch (error) {
    console.error('❌ [PRODUCTION] Error in getRelevantContext:', error.message);
    // Emergency fallback
    return "Nuxchain is a comprehensive decentralized platform that combines staking, NFT marketplace, airdrops and tokenization. It's a complete ecosystem for digital asset management and passive income generation.";
  }
}

// Temporary implementation of semantic streaming service
const semanticStreamingService = {
  async streamSemanticContent(res, content, options = {}) {
    console.log('🔧 [PRODUCTION] Using semantic streaming for content length:', content.length);
    
    const { 
      enableSemanticChunking = true,
      enableContextualPauses = true,
      enableVariableSpeed = true,
      chunkSize = 30,
      baseDelay = 25
    } = options;
    
    if (!enableSemanticChunking) {
      // Simple streaming without semantic analysis
      for (let i = 0; i < content.length; i += chunkSize) {
        const chunk = content.slice(i, i + chunkSize);
        res.write(chunk);
        await new Promise(resolve => setTimeout(resolve, baseDelay));
      }
      return;
    }
    
    // Semantic chunking implementation
    const sentences = content.split(/([.!?]+\s+)/);
    let currentChunk = '';
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      currentChunk += sentence;
      
      // Determine if we should send this chunk
      const shouldSend = 
        currentChunk.length >= chunkSize ||
        /[.!?]+\s*$/.test(sentence) ||
        i === sentences.length - 1;
      
      if (shouldSend && currentChunk.trim()) {
        res.write(currentChunk);
        
        // Calculate delay based on content complexity
        let delay = baseDelay;
        if (enableContextualPauses) {
          if (/[.!?]+\s*$/.test(sentence)) delay *= 2; // Pause after sentences
          if (/[,;:]\s*$/.test(sentence)) delay *= 1.5; // Shorter pause after commas
        }
        
        if (enableVariableSpeed) {
          // Adjust speed based on content complexity
          if (/\b(blockchain|cryptocurrency|staking|tokenization)\b/i.test(currentChunk)) {
            delay *= 1.3; // Slower for complex terms
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
        currentChunk = '';
      }
    }
    
    // Send any remaining content
    if (currentChunk.trim()) {
      res.write(currentChunk);
    }
  }
};

// Temporary implementation of error handling
function withErrorHandling(handler) {
  return async (req, res) => {
    try {
      return await handler(req, res);
    } catch (error) {
      console.error('🚨 [PRODUCTION] Error caught by error handler:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
      }
    }
  };
}

// Temporary implementation of rate limiter
const rateLimiter = {
  soft: (req, res, next) => {
    console.log('🔧 [PRODUCTION] Rate limiter - allowing request');
    if (next) next();
    return Promise.resolve();
  }
};

// CORS configuration for Vercel
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400'
};

// Security check function
function checkSecurity(req) {
  const publicEndpoints = ['/api/chat/stream', '/api/chat/stream-with-tools'];
  const currentPath = req.url?.split('?')[0];
  
  if (publicEndpoints.includes(currentPath)) {
    return { allowed: true };
  }
  
  const apiKey = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.SERVER_API_KEY) {
    return { allowed: false, reason: 'Invalid API key' };
  }
  
  return { allowed: true };
}

// Simple in-memory cache for relevant context
const contextCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedContext(key) {
  const item = contextCache.get(key);
  if (!item) return null;
  
  if (Date.now() - item.timestamp > CACHE_TTL) {
    contextCache.delete(key);
    return null;
  }
  return item.value;
}

function setCachedContext(key, value) {
  contextCache.set(key, { value, timestamp: Date.now() });
}

// Main stream handler function
async function streamHandler(req, res) {
  console.log('🚀 [PRODUCTION] Stream handler started');
  
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      return res.status(200).json({});
    }

    // Apply soft rate limiting
    await rateLimiter.soft(req, res);

    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Security check
    const securityResult = checkSecurity(req);
    if (!securityResult.allowed) {
      console.log('🔒 [PRODUCTION] Security check failed:', securityResult.reason);
      return res.status(401).json({ error: securityResult.reason });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, conversationHistory = [], messages = [] } = req.body;

    // Limit history to last 5 messages
    let finalMessage;
    let finalHistory;
    if (messages && messages.length > 0) {
      finalHistory = messages.slice(-5);
      const lastMessage = messages[messages.length - 1];
      finalMessage = lastMessage.content || lastMessage.parts?.[0]?.text || lastMessage.text;
    } else {
      finalMessage = message;
      finalHistory = conversationHistory.slice(-5);
    }

    if (!finalMessage) {
      return res.status(400).json({ error: 'Message required' });
    }

    // Check that Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    console.log('🤖 [PRODUCTION] Initializing Gemini AI');
    
    // Initialize Gemini
    const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

    // Context retrieval logic
    let relevantContext = '';
    let searchMethod = 'skipped';
    const cacheKey = finalMessage.trim().toLowerCase();

    if (finalMessage.length < 15) {
      searchMethod = 'short_message';
    } else {
      // Try cache first
      const cached = getCachedContext(cacheKey);
      if (cached) {
        relevantContext = cached;
        searchMethod = 'cache';
      } else {
        try {
          const directSearchResults = getRelevantContext(finalMessage);
          if (directSearchResults) {
            relevantContext = directSearchResults;
          }
          searchMethod = 'direct_search';
        } catch (error) {
          console.error('Error retrieving context:', error.message);
          searchMethod = 'error';
        }
        
        // Cache the result if we have relevant context
        if (relevantContext) {
          setCachedContext(cacheKey, relevantContext);
        }
      }
    }

    // Fallback context
    const contextToUse = relevantContext || `Nuxchain is a comprehensive decentralized platform that combines staking, NFT marketplace, airdrops and tokenization. It's a complete ecosystem for digital asset management and passive income generation.`;

    // Create prompt with Nuxchain context
    const systemPrompt = `I'm an intelligent assistant for the Nuxchain platform. I'm here to help you with accurate and up-to-date information about the Nuxchain ecosystem.

RELEVANT NUXCHAIN CONTEXT:
${contextToUse}

INSTRUCTIONS:
- Always respond in English
- Use information from the context when relevant
- If you don't have specific information about something related to Nuxchain, clearly state it
- Be helpful, friendly, and conversational
- You can use emojis occasionally to make the conversation more pleasant
- Focus on being helpful rather than introducing yourself repeatedly
- If the user asks about topics not related to Nuxchain, you can help but keep the focus on how it might relate to the platform`;

    // Prepare content with history and context
    const contents = `${systemPrompt}\n\nUser: ${finalMessage}`;

    // Configure headers for streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Connection', 'keep-alive');
    
    // Extract streaming configuration
    const { streamingConfig = {} } = req.body;
    const semanticOptions = {
      enableSemanticChunking: streamingConfig.enableSemanticChunking !== false,
      enableContextualPauses: streamingConfig.enableContextualPauses !== false,
      enableVariableSpeed: streamingConfig.enableVariableSpeed !== false,
      clientInfo: {
        userAgent: req.headers['user-agent'] || '',
        language: req.headers['accept-language'] || 'en-US'
      }
    };

    // Timeout control for Vercel
    const requestStartTime = Date.now();
    const MAX_EXECUTION_TIME = 15000; // 15 seconds

    const timeoutDetector = setInterval(() => {
      if (Date.now() - requestStartTime > MAX_EXECUTION_TIME && !res.writableEnded) {
        if (!res.destroyed) {
          res.write('\n⚠️ Execution time limit approaching.\n');
        }
        clearInterval(timeoutDetector);
      }
    }, 1000);

    try {
      // Generate content stream
      const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: contents
      });

      // Process and stream the response
      let accumulatedText = '';
      let streamStarted = false;

      for await (const chunk of response) {
        if (res.destroyed || res.writableEnded) break;

        try {
          console.log('=== CHUNK DEBUG ===');
          console.log('Chunk type:', typeof chunk);
          console.log('Chunk keys:', Object.keys(chunk));
          console.log('Full chunk:', JSON.stringify(chunk, null, 2));
          console.log('chunk.text type:', typeof chunk.text);
          console.log('chunk.text value:', chunk.text);
          console.log('chunk.text():', typeof chunk.text === 'function' ? chunk.text() : 'not a function');
          console.log('==================');
          
          const text = chunk.text || '';
          if (text) {
            accumulatedText += text;
            // Start streaming once we have sufficient content
            if (!streamStarted && accumulatedText.length > 20) {
              streamStarted = true;
              await semanticStreamingService.streamSemanticContent(res, accumulatedText, semanticOptions);
              accumulatedText = '';
            }
          }
        } catch (error) {
          console.error('Error processing chunk:', error.message);
        }
      }

      // Stream any remaining text
      if (accumulatedText && !res.writableEnded) {
        await semanticStreamingService.streamSemanticContent(res, accumulatedText, semanticOptions);
      }

      // Clean up
      clearInterval(timeoutDetector);
      if (!res.writableEnded) {
        res.end();
      }
    } catch (error) {
      clearInterval(timeoutDetector);
      console.error('Gemini API error:', error.message || error);
      if (!res.writableEnded) {
        res.write(`\n❌ I apologize, but I encountered an error while processing your request. Please try again.\n`);
        res.end();
      }
    }
  } catch (error) {
    console.error('Unexpected error in stream handler:', error);
    if (!res.writableEnded) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

// Apply error handling middleware and export the handler
export default withErrorHandling(streamHandler);