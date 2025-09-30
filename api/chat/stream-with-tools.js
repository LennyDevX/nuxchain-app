/**
 * Gemini Function Calling API for Vercel
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

// Enhanced URL context service with real content extraction
const urlContextService = {
  async fetchUrlContext(url, options = {}) {
    console.log('🔧 [PRODUCTION] Fetching content from URL:', url);
    
    try {
      // Simple URL validation
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('Invalid URL protocol');
      }
      
      // Fetch the actual content
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 10000 // 10 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      
      // Extract text content from HTML
      const textContent = this.extractTextFromHTML(html);
      const title = this.extractTitle(html);
      
      // Limit content length
      const maxLength = options.maxContentLength || 3000;
      const truncatedContent = textContent.length > maxLength 
        ? textContent.substring(0, maxLength) + '...'
        : textContent;
      
      console.log(`✅ [PRODUCTION] Successfully extracted ${truncatedContent.length} characters from ${url}`);
      
      return {
        url: url,
        content: truncatedContent,
        title: title || `Content from ${urlObj.hostname}`,
        summary: this.generateSummary(truncatedContent),
        metadata: {
          extractedAt: new Date().toISOString(),
          source: 'real_extraction',
          originalLength: textContent.length,
          truncated: textContent.length > maxLength
        }
      };
    } catch (error) {
      console.error('Error in URL context service:', error);
      
      // Fallback to basic information
      const urlObj = new URL(url);
      return {
        url: url,
        content: `Unable to extract content from ${url}. Error: ${error.message}. This appears to be a ${urlObj.hostname} page.`,
        title: `${urlObj.hostname} - Content Unavailable`,
        summary: 'Content extraction failed',
        metadata: {
          extractedAt: new Date().toISOString(),
          source: 'fallback',
          error: error.message
        }
      };
    }
  },
  
  extractTextFromHTML(html) {
    // Remove script and style elements
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    // Remove HTML tags
    text = text.replace(/<[^>]*>/g, ' ');
    
    // Decode HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  },
  
  extractTitle(html) {
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : null;
  },
  
  generateSummary(content) {
    if (!content || content.length < 100) return content;
    
    // Take first 200 characters and try to end at a sentence
    let summary = content.substring(0, 200);
    const lastSentence = summary.lastIndexOf('.');
    if (lastSentence > 50) {
      summary = summary.substring(0, lastSentence + 1);
    }
    return summary + (content.length > 200 ? '...' : '');
  }
};

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
  strict: (req, res, next) => {
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

// Available tools for the model
const tools = [
  {
    name: 'url_context_tool',
    description: 'Extracts and analyzes content from URLs to provide additional context',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The URL to extract content from'
        },
        analysis_type: {
          type: 'string',
          enum: ['summary', 'detailed', 'technical'],
          description: 'Type of analysis to perform on the content'
        }
      },
      required: ['url']
    }
  },
  {
    name: 'nuxchain_search',
    description: 'Searches for specific information in the Nuxchain knowledge base',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query in the knowledge base'
        },
        category: {
          type: 'string',
          enum: ['staking', 'nfts', 'airdrops', 'tokenization', 'general'],
          description: 'Specific category to search'
        }
      },
      required: ['query']
    }
  }
];

// Function to execute tools
async function executeTool(toolName, parameters) {
  try {
    switch (toolName) {
      case 'url_context_tool':
        return await executeUrlContextTool(parameters);
      case 'nuxchain_search':
        return await executeNuxchainSearch(parameters);
      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  } catch (error) {
    console.error(`Error executing tool ${toolName}:`, error);
    return { error: `Error executing ${toolName}: ${error.message}` };
  }
}

// Implementation of URL context tool
async function executeUrlContextTool(parameters) {
  const { url, analysis_type = 'summary' } = parameters;
  
  try {
    console.log(`🔍 [PRODUCTION] Processing URL: ${url}`);
    
    const result = await urlContextService.fetchUrlContext(url, {
      analysis_type,
      maxContentLength: 3000
    });
    
    console.log(`✅ [PRODUCTION] URL successfully processed: ${result.content?.length || 0} characters`);
    
    return {
      success: true,
      url: result.url,
      content: result.content,
      analysis_type,
      content_length: result.content?.length || 0,
      extracted_at: result.metadata?.extractedAt || new Date().toISOString(),
      title: result.title,
      summary: result.summary
    };
    
  } catch (error) {
    console.error(`❌ [PRODUCTION] Error in url_context_tool for ${url}:`, error.message);
    
    return {
      error: `Error processing URL: ${error.message}`,
      url,
      error_type: error.name || 'UnknownError'
    };
  }
}

// Implementation of Nuxchain search
async function executeNuxchainSearch(parameters) {
  const { query, category } = parameters;
  
  try {
    console.log(`🔍 [PRODUCTION] Searching Nuxchain knowledge base: ${query} (category: ${category || 'all'})`);
    
    // Use direct search for more detailed results
    const searchResults = searchKnowledgeBase(query, 5);
    
    if (searchResults && searchResults.length > 0) {
      console.log(`✅ [PRODUCTION] Found ${searchResults.length} results in knowledge base`);
      
      return {
        query,
        category,
        results: searchResults.map((item, index) => ({
          content: item.content,
          metadata: item.metadata,
          score: Math.max(0.9 - (index * 0.1), 0.3), // Decreasing score
          source: 'nuxchain_knowledge_base',
          type: item.metadata?.type || 'general',
          topic: item.metadata?.topic || 'unknown'
        })),
        found: searchResults.length,
        method: 'comprehensive_knowledge_base_search'
      };
    } else {
      // Fallback to general context
      const fallbackResult = getRelevantContext(query);
      console.log('⚠️ [PRODUCTION] No specific search results, using general context');
      
      return {
        query,
        category,
        results: [{
          content: fallbackResult,
          score: 0.5,
          source: 'nuxchain_knowledge_base_fallback',
          type: 'general',
          topic: 'fallback'
        }],
        found: 1,
        method: 'fallback_context_search'
      };
    }
  } catch (error) {
    console.error(`❌ [PRODUCTION] Error in nuxchain_search:`, error.message);
    return { error: `Search error: ${error.message}` };
  }
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
async function streamWithToolsHandler(req, res) {
  console.log('🚀 [PRODUCTION] Stream with tools handler started');
  
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      return res.status(200).json({});
    }

    // Apply rate limiting
    await rateLimiter.strict(req, res);

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

    console.log('🤖 [PRODUCTION] Initializing Gemini AI with function calling');
    
    // Initialize Gemini
    const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

    // Context retrieval logic
    let relevantContext = '';
    const cacheKey = finalMessage.trim().toLowerCase();

    if (finalMessage.length >= 15) {
      // Try cache first
      const cached = getCachedContext(cacheKey);
      if (cached) {
        relevantContext = cached;
      } else {
        try {
          const directSearchResults = getRelevantContext(finalMessage);
          if (directSearchResults) {
            relevantContext = directSearchResults;
          }
        } catch (error) {
          console.error('Error retrieving context:', error.message);
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

AVAILABLE TOOLS:
- url_context_tool: Extract and analyze content from URLs
- nuxchain_search: Search the Nuxchain knowledge base for specific information

INSTRUCTIONS:
- Always respond in English
- Use the available tools when they can provide better or more specific information
- Use information from the context when relevant
- If you don't have specific information about something related to Nuxchain, use the nuxchain_search tool
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
    const MAX_EXECUTION_TIME = 25000; // 25 seconds for function calling

    const timeoutDetector = setInterval(() => {
      if (Date.now() - requestStartTime > MAX_EXECUTION_TIME && !res.writableEnded) {
        if (!res.destroyed) {
          res.write('\n⚠️ Execution time limit approaching.\n');
        }
        clearInterval(timeoutDetector);
      }
    }, 1000);

    try {
      // Generate content stream with function calling
      const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: contents,
        tools: [{ functionDeclarations: tools }]
      });

      // Process and stream the response
      let accumulatedText = '';
      let streamStarted = false;

      for await (const chunk of response) {
        if (res.destroyed || res.writableEnded) break;

        try {
          // Check for function calls
          const functionCalls = chunk.functionCalls;
          if (functionCalls && functionCalls.length > 0) {
            console.log('🔧 [PRODUCTION] Processing function calls:', functionCalls.length);
            
            for (const functionCall of functionCalls) {
              const { name, args } = functionCall;
              console.log(`🔧 [PRODUCTION] Executing function: ${name}`);
              
              const toolResult = await executeTool(name, args);
              
              // Stream the tool result
              const toolMessage = `\n🔧 Using ${name}...\n`;
              res.write(toolMessage);
              
              if (toolResult.error) {
                res.write(`❌ Error: ${toolResult.error}\n\n`);
              } else {
                res.write(`✅ Tool executed successfully\n\n`);
              }
            }
          }

          console.log('=== CHUNK DEBUG (WITH TOOLS) ===');
          console.log('Chunk type:', typeof chunk);
          console.log('Chunk keys:', Object.keys(chunk));
          console.log('Full chunk:', JSON.stringify(chunk, null, 2));
          console.log('chunk.text type:', typeof chunk.text);
          console.log('chunk.text value:', chunk.text);
          console.log('chunk.text():', typeof chunk.text === 'function' ? chunk.text() : 'not a function');
          console.log('chunk.functionCalls:', chunk.functionCalls);
          console.log('================================');
          
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
    console.error('Unexpected error in stream with tools handler:', error);
    if (!res.writableEnded) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

// Apply error handling middleware and export the handler
export default withErrorHandling(streamWithToolsHandler);