import ai from '../config/ai-config.js';
import env from '../config/environment.js';
import tokenCountingService from './token-counting-service.js';

/**
 * 🚀 Enhanced Context Caching Service for Gemini API
 * 
 * Features (Updated Dec 2024):
 * - Explicit caching with Gemini API (90% token cost savings)
 * - Implicit caching support (automatic for Gemini 2.5)
 * - Token counting integration for smart caching decisions
 * - System instruction + KB context caching
 * - TTL management and automatic cleanup
 * 
 * Based on: https://ai.google.dev/gemini-api/docs/caching
 */

class ContextCacheService {
  constructor() {
    this.cacheStore = new Map();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      created: 0,
      errors: 0,
      tokensSaved: 0,          // NEW: Track tokens saved
      costSavings: 0           // NEW: Track cost savings in USD
    };
    this.contextCaches = new Map(); // Store de context caches activos
    this.systemInstructionCache = null; // NEW: Dedicated cache for system instruction
    this.knowledgeBaseCache = null;     // NEW: Dedicated cache for KB context
    this.sessionLanguages = new Map(); // NEW: Store detected language per session
    this.maxCacheAge = 60 * 60 * 1000; // 1 hora
    this.maxCacheSize = 100; // Máximo número de caches
    this.minTokensForCache = 1024; // Minimum tokens for Gemini 2.5 Flash caching
    
    console.log('✅ Enhanced Context Cache Service initialized');
  }

  /**
   * Genera un hash único para el contexto
   */
  generateContextHash(messages, model) {
    const contextString = JSON.stringify({
      messages: messages.slice(0, -1), // Excluir último mensaje
      model
    });
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < contextString.length; i++) {
      const char = contextString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 🆕 Create cache for system instruction + KB context (EXPLICIT CACHING)
   * This is the recommended way to cache static content for cost savings
   * 
   * @param {string} systemInstruction - System instruction text
   * @param {string} knowledgeContext - Knowledge base context
   * @param {string} model - Model name (must use explicit version like gemini-3.1-flash-lite)
   * @param {number} ttlSeconds - Cache TTL in seconds (default 5 minutes)
   * @returns {Promise<Object|null>} Cache info or null if failed
   */
  async createSystemCache(systemInstruction, knowledgeContext = '', model = 'gemini-3.1-flash-lite', ttlSeconds = 300) {
    try {
      if (!env.geminiApiKey) {
        throw new Error('API key no configurada');
      }

      // Combine system instruction and KB context
      const combinedContent = knowledgeContext 
        ? `${systemInstruction}\n\n--- Knowledge Base Context ---\n${knowledgeContext}`
        : systemInstruction;

      // Check if content meets minimum token threshold
      const cacheCheck = tokenCountingService.isCacheWorthy(combinedContent, model);
      
      if (!cacheCheck.isWorthy) {
        console.log(`⚠️ Content too small for caching: ${cacheCheck.reason}`);
        return null;
      }

      console.log(`🔄 Creating system cache: ${cacheCheck.estimatedTokens} estimated tokens`);

      // Create explicit cache using Gemini API
      // Note: Must use explicit version suffix like "gemini-3.1-flash-lite"
      const cacheResponse = await ai.caches.create({
        model: `models/${model}`,
        config: {
          displayName: 'nuxchain-system-instruction',
          systemInstruction: combinedContent,
          contents: [], // System instruction only, no content parts
          ttl: `${ttlSeconds}s`
        }
      });

      const cacheInfo = {
        cacheName: cacheResponse.name,
        model,
        createdAt: Date.now(),
        ttlSeconds,
        expiresAt: Date.now() + (ttlSeconds * 1000),
        estimatedTokens: cacheCheck.estimatedTokens,
        type: 'system_instruction'
      };

      this.systemInstructionCache = cacheInfo;
      this.cacheStats.created++;

      console.log(`✅ System cache created: ${cacheResponse.name} (TTL: ${ttlSeconds}s)`);
      
      // 🆕 Log con chat logger
      if (typeof chatLogger !== 'undefined' && chatLogger.logCacheOperation) {
        chatLogger.logCacheOperation('CREATE', {
          cacheName: cacheResponse.name,
          type: 'system_instruction',
          ttl: ttlSeconds,
          estimatedTokens: cacheCheck.estimatedTokens
        });
      }
      
      return cacheInfo;

    } catch (error) {
      console.error('❌ Error creating system cache:', error.message);
      this.cacheStats.errors++;
      return null;
    }
  }

  /**
   * 🆕 Get or create system instruction cache
   * Returns existing cache if valid, creates new one otherwise
   */
  async getOrCreateSystemCache(systemInstruction, knowledgeContext = '', model = 'gemini-3.1-flash-lite') {
    // Check if existing cache is still valid
    if (this.systemInstructionCache) {
      if (Date.now() < this.systemInstructionCache.expiresAt) {
        this.cacheStats.hits++;
        console.log(`🚀 Using existing system cache: ${this.systemInstructionCache.cacheName}`);
        
        // 🆕 Log cache hit con chat logger
        if (typeof chatLogger !== 'undefined' && chatLogger.logCacheOperation) {
          chatLogger.logCacheOperation('HIT', {
            cacheName: this.systemInstructionCache.cacheName,
            type: this.systemInstructionCache.type,
            estimatedTokens: this.systemInstructionCache.estimatedTokens
          });
        }
        
        return this.systemInstructionCache;
      } else {
        // Cache expired, clean up
        try {
          await ai.caches.delete(this.systemInstructionCache.cacheName);
        } catch (e) {
          console.warn('Failed to delete expired cache:', e.message);
        }
        this.systemInstructionCache = null;
      }
    }

    this.cacheStats.misses++;
    return await this.createSystemCache(systemInstruction, knowledgeContext, model);
  }

  /**
   * Crea un context cache en Gemini API (for conversation history)
   */
  async createContextCache(messages, model = 'gemini-3.1-flash-lite', ttlSeconds = 3600) {
    try {
      if (!env.geminiApiKey) {
        throw new Error('API key no configurada');
      }

      // Validar que los mensajes son suficientes para cachear
      if (!Array.isArray(messages) || messages.length < 2) {
        return null;
      }

      // Preparar contenido para el cache (excluir último mensaje)
      const cacheContent = messages.slice(0, -1);
      
      // Check token count before caching
      const contentText = cacheContent.map(m => m.parts?.[0]?.text || '').join('\n');
      const cacheCheck = tokenCountingService.isCacheWorthy(contentText, model);
      
      if (!cacheCheck.isWorthy) {
        console.log(`⚠️ Conversation too small for caching: ${cacheCheck.reason}`);
        return null;
      }

      // Crear context cache usando la API de Gemini
      const cacheResponse = await ai.caches.create({
        model: `models/${model}`,
        config: {
          displayName: 'nuxchain-conversation',
          contents: cacheContent,
          ttl: `${ttlSeconds}s`
        }
      });

      const contextHash = this.generateContextHash(messages, model);
      
      // Almacenar información del cache
      const cacheInfo = {
        cacheName: cacheResponse.name,
        contextHash,
        model,
        createdAt: Date.now(),
        ttlSeconds,
        messageCount: cacheContent.length,
        expiresAt: Date.now() + (ttlSeconds * 1000),
        estimatedTokens: cacheCheck.estimatedTokens,
        type: 'conversation'
      };

      this.contextCaches.set(contextHash, cacheInfo);
      this.cacheStats.created++;

      console.log(`✅ Context cache creado: ${cacheResponse.name}`);
      return cacheInfo;

    } catch (error) {
      console.error('Error creando context cache:', error);
      this.cacheStats.errors++;
      return null;
    }
  }

  /**
   * Obtiene un context cache existente
   */
  async getContextCache(messages, model) {
    const contextHash = this.generateContextHash(messages, model);
    const cacheInfo = this.contextCaches.get(contextHash);

    if (!cacheInfo) {
      this.cacheStats.misses++;
      return null;
    }

    // Verificar si el cache ha expirado
    if (Date.now() > cacheInfo.expiresAt) {
      this.contextCaches.delete(contextHash);
      this.cacheStats.misses++;
      return null;
    }

    this.cacheStats.hits++;
    return cacheInfo;
  }

  /**
   * Usa un context cache para generar contenido
   */
  async generateWithCache(messages, model, params = {}) {
    try {
      // Intentar obtener cache existente
      let cacheInfo = await this.getContextCache(messages, model);
      
      // Si no existe cache, crear uno nuevo
      if (!cacheInfo && messages.length >= 3) {
        cacheInfo = await this.createContextCache(messages, model);
      }

      const lastMessage = messages[messages.length - 1];

      if (cacheInfo) {
        // Usar el context cache
        console.log(`🚀 Usando context cache: ${cacheInfo.cacheName}`);
        
        const response = await ai.models.generateContent({
          model,
          contents: [lastMessage], // Solo el último mensaje
          cachedContent: cacheInfo.cacheName,
          generationConfig: {
            temperature: params.temperature || 0.8,
            topK: params.topK || 40,
            topP: params.topP || 0.95,
            maxOutputTokens: params.maxOutputTokens || 2048,
          }
        });

        return {
          response,
          usedCache: true,
          cacheInfo
        };
      } else {
        // Fallback a generación normal
        console.log('📝 Generando sin cache (fallback)');
        
        const response = await ai.models.generateContent({
          model,
          contents: messages,
          generationConfig: {
            temperature: params.temperature || 0.7,
            topK: params.topK || 40,
            topP: params.topP || 0.95,
            maxOutputTokens: params.maxOutputTokens || 2048,
          }
        });

        return {
          response,
          usedCache: false,
          cacheInfo: null
        };
      }

    } catch (error) {
      console.error('Error en generateWithCache:', error);
      throw error;
    }
  }

  /**
   * 🆕 Generate content with system cache (RECOMMENDED)
   * Uses cached system instruction for cost savings
   */
  async generateWithSystemCache(message, systemInstruction, knowledgeContext = '', model = 'gemini-3.1-flash-lite', params = {}) {
    try {
      // Get or create system cache
      const systemCache = await this.getOrCreateSystemCache(systemInstruction, knowledgeContext, model);
      
      if (systemCache) {
        console.log(`🚀 Generating with system cache: ${systemCache.cacheName}`);
        
        // Track tokens saved
        const tokensSaved = systemCache.estimatedTokens || 0;
        this.cacheStats.tokensSaved += tokensSaved;
        this.cacheStats.costSavings += (tokensSaved / 1000000) * 0.075 * 0.75; // 75% savings
        
        // 🆕 Log tokens saved con chat logger
        if (typeof chatLogger !== 'undefined' && chatLogger.logCacheOperation) {
          chatLogger.logCacheOperation('HIT', {
            cacheName: systemCache.cacheName,
            type: systemCache.type,
            tokensSaved: tokensSaved
          });
        }
        
        const response = await ai.models.generateContentStream({
          model,
          contents: message,
          config: {
            cachedContent: systemCache.cacheName,
            temperature: params.temperature || 0.3,
            topK: params.topK || 20,
            topP: params.topP || 0.85,
            maxOutputTokens: params.maxOutputTokens || 1024,
          }
        });

        return {
          stream: response,
          usedCache: true,
          cacheInfo: systemCache,
          tokensSaved
        };
      } else {
        // Fallback: generate without cache
        console.log('📝 Generating without system cache (content too small or cache unavailable)');
        
        const fullSystemInstruction = knowledgeContext 
          ? `${systemInstruction}\n\n--- Knowledge Base Context ---\n${knowledgeContext}`
          : systemInstruction;
        
        const response = await ai.models.generateContentStream({
          model,
          contents: message,
          config: {
            systemInstruction: fullSystemInstruction,
            temperature: params.temperature || 0.3,
            topK: params.topK || 20,
            topP: params.topP || 0.85,
            maxOutputTokens: params.maxOutputTokens || 1024,
          }
        });

        return {
          stream: response,
          usedCache: false,
          cacheInfo: null,
          tokensSaved: 0
        };
      }

    } catch (error) {
      console.error('Error in generateWithSystemCache:', error);
      throw error;
    }
  }

  /**
   * Limpia caches expirados
   */
  async cleanupExpiredCaches() {
    const now = Date.now();
    const expiredCaches = [];

    // Check conversation caches
    for (const [hash, cacheInfo] of this.contextCaches.entries()) {
      if (now > cacheInfo.expiresAt) {
        expiredCaches.push(hash);
      }
    }

    for (const hash of expiredCaches) {
      const cacheInfo = this.contextCaches.get(hash);
      try {
        // Intentar eliminar el cache de la API
        await ai.caches.delete(cacheInfo.cacheName);
        console.log(`🗑️ Cache eliminado: ${cacheInfo.cacheName}`);
      } catch (error) {
        console.warn(`Error eliminando cache ${cacheInfo.cacheName}:`, error.message);
      }
      this.contextCaches.delete(hash);
    }

    // Check system instruction cache
    if (this.systemInstructionCache && now > this.systemInstructionCache.expiresAt) {
      try {
        await ai.caches.delete(this.systemInstructionCache.cacheName);
        console.log(`🗑️ System cache eliminado: ${this.systemInstructionCache.cacheName}`);
      } catch (error) {
        console.warn('Error eliminando system cache:', error.message);
      }
      this.systemInstructionCache = null;
    }

    return expiredCaches.length;
  }

  /**
   * Obtiene estadísticas del cache
   */
  getStats() {
    const hitRate = this.cacheStats.hits + this.cacheStats.misses > 0 
      ? (this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) * 100).toFixed(2)
      : 0;

    return {
      ...this.cacheStats,
      hitRate: `${hitRate}%`,
      activeCaches: this.contextCaches.size,
      hasSystemCache: !!this.systemInstructionCache,
      systemCacheExpiry: this.systemInstructionCache 
        ? new Date(this.systemInstructionCache.expiresAt).toISOString() 
        : null,
      estimatedSavings: `$${this.cacheStats.costSavings.toFixed(4)} saved`,
      tokensSaved: this.cacheStats.tokensSaved
    };
  }

  /**
   * Limpia todos los caches
   */
  async clearAllCaches() {
    const deletedCount = this.contextCaches.size;
    
    for (const [hash, cacheInfo] of this.contextCaches.entries()) {
      try {
        await ai.caches.delete(cacheInfo.cacheName);
      } catch (error) {
        console.warn(`Error eliminando cache ${cacheInfo.cacheName}:`, error.message);
      }
    }

    // Clear system cache
    if (this.systemInstructionCache) {
      try {
        await ai.caches.delete(this.systemInstructionCache.cacheName);
      } catch (error) {
        console.warn('Error eliminando system cache:', error.message);
      }
      this.systemInstructionCache = null;
    }

    this.contextCaches.clear();
    this.cacheStats = { hits: 0, misses: 0, created: 0, errors: 0, tokensSaved: 0, costSavings: 0 };
    
    return deletedCount;
  }

  /**
   * Optimiza automáticamente el uso de cache
   */
  shouldCreateCache(messages) {
    // Solo crear cache para conversaciones con suficiente contexto
    if (messages.length < 4) return false;
    
    // Calcular el tamaño total del contexto
    const totalLength = messages.reduce((sum, msg) => {
      return sum + (msg.parts?.[0]?.text?.length || 0);
    }, 0);

    // Use token counting service for accurate decision
    // Minimum 1024 tokens for Gemini 2.5 Flash
    const estimatedTokens = totalLength * 0.25;
    return estimatedTokens >= this.minTokensForCache;
  }

  /**
   * 🆕 Get list of active caches from Gemini API
   */
  async listActiveCaches() {
    try {
      const caches = [];
      for await (const cache of ai.caches.list()) {
        caches.push({
          name: cache.name,
          model: cache.model,
          displayName: cache.displayName,
          createTime: cache.createTime,
          expireTime: cache.expireTime,
          usageMetadata: cache.usageMetadata
        });
      }
      return caches;
    } catch (error) {
      console.error('Error listing caches:', error.message);
      return [];
    }
  }

  /**
   * 🌐 Store detected language for a session
   * @param {string} sessionId - Session identifier
   * @param {Object} languageDetection - Language detection result
   */
  setSessionLanguage(sessionId, languageDetection) {
    if (!sessionId || !languageDetection) return;
    
    this.sessionLanguages.set(sessionId, {
      ...languageDetection,
      timestamp: Date.now()
    });
    
    // Cleanup old sessions (> 1 hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [id, data] of this.sessionLanguages.entries()) {
      if (data.timestamp < oneHourAgo) {
        this.sessionLanguages.delete(id);
      }
    }
  }

  /**
   * 🌐 Get stored language for a session
   * @param {string} sessionId - Session identifier
   * @returns {Object|null} Language detection result or null
   */
  getSessionLanguage(sessionId) {
    if (!sessionId) return null;
    
    const stored = this.sessionLanguages.get(sessionId);
    if (!stored) return null;
    
    // Check if expired (> 1 hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    if (stored.timestamp < oneHourAgo) {
      this.sessionLanguages.delete(sessionId);
      return null;
    }
    
    return stored;
  }

  /**
   * 🌐 Clear session language
   * @param {string} sessionId - Session identifier
   */
  clearSessionLanguage(sessionId) {
    if (sessionId) {
      this.sessionLanguages.delete(sessionId);
    }
  }

  /**
   * 🌐 Get session language statistics
   * @returns {Object} Statistics about stored sessions
   */
  getLanguageStats() {
    const stats = {
      totalSessions: this.sessionLanguages.size,
      languages: { es: 0, en: 0, unknown: 0 }
    };
    
    for (const [_, data] of this.sessionLanguages.entries()) {
      const lang = data.language || 'unknown';
      stats.languages[lang] = (stats.languages[lang] || 0) + 1;
    }
    
    return stats;
  }
}

// Instancia singleton
const contextCacheService = new ContextCacheService();

// Limpieza automática cada 30 minutos
setInterval(() => {
  contextCacheService.cleanupExpiredCaches()
    .then(count => {
      if (count > 0) {
        console.log(`🧹 Limpieza automática: ${count} caches eliminados`);
      }
    })
    .catch(console.error);
}, 30 * 60 * 1000);

export default contextCacheService;