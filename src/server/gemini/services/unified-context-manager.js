/**
 * Unified Context Manager - Gestión Unificada de Contexto de Conversaciones
 * 
 * Este servicio unifica el manejo de contexto a través de todas las capas
 * del sistema, proporcionando persistencia inteligente y coherencia en
 * conversaciones largas.
 */

import contextCacheService from './context-cache-service.js';
import embeddingsService from './embeddings-service.js';
import { generateContent } from '../controllers/gemini-controller.js';
import { UNIFIED_CONTEXT_CONFIG } from '../config/unified-context-config.js';

// Usar configuración centralizada
const CONTEXT_CONFIG = UNIFIED_CONTEXT_CONFIG;

class UnifiedContextManager {
  constructor() {
    this.conversationStore = new Map();
    this.userContextStore = new Map();
    this.topicHistory = new Map();
    this.semanticEmbeddings = new Map();
    this.conversationSummaries = new Map();
    
    // Inicializar limpieza automática
    this.startCleanupInterval();
  }

  /**
   * Gestiona el contexto completo de una conversación
   */
  async manageConversation(sessionId, messages, userId = null, options = {}) {
    try {
      // Obtener o crear contexto de conversación
      let conversationContext = await this.getConversationContext(sessionId);
      
      // Detectar cambio de tema
      const topicShift = await this.detectTopicShift(messages, conversationContext);
      
      // Si hay cambio de tema, crear nuevo contexto pero mantener referencias
      if (topicShift) {
        conversationContext = await this.handleTopicShift(sessionId, conversationContext, messages);
      }
      
      // Optimizar mensajes para el modelo
      const optimizedMessages = await this.optimizeMessagesForModel(messages, conversationContext);
      
      // Generar resumen semántico si es necesario
      if (messages.length >= CONTEXT_CONFIG.thresholds.SUMMARY_THRESHOLD) {
        await this.updateSemanticSummary(sessionId, messages);
      }
      
      // Actualizar contexto de usuario si está disponible
      if (userId) {
        await this.updateUserContext(userId, messages, conversationContext);
      }
      
      // Guardar contexto actualizado
      await this.saveConversationContext(sessionId, conversationContext);
      
      return {
        optimizedMessages,
        conversationContext,
        topicShift,
        metadata: {
          messageCount: messages.length,
          contextSize: this.calculateContextSize(messages),
          lastUpdate: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('Error en manageConversation:', error);
      // Fallback a mensajes originales
      return {
        optimizedMessages: messages,
        conversationContext: {},
        topicShift: false,
        error: error.message
      };
    }
  }

  /**
   * Detecta si el usuario ha cambiado de tema
   */
  async detectTopicShift(currentMessages, conversationContext) {
    if (!currentMessages || currentMessages.length === 0) return false;
    
    const lastMessage = currentMessages[currentMessages.length - 1];
    const lastMessageText = lastMessage.parts?.[0]?.text || lastMessage.content || '';
    
    if (!lastMessageText || conversationContext.recentTopics?.length === 0) {
      return false;
    }
    
    try {
      // Obtener embedding del mensaje actual
      const currentEmbedding = await embeddingsService.generateEmbedding(lastMessageText);
      
      // Calcular similitud con temas recientes
      const similarities = [];
      for (const topic of conversationContext.recentTopics.slice(-3)) {
        const topicEmbedding = await embeddingsService.generateEmbedding(topic);
        const similarity = this.calculateCosineSimilarity(currentEmbedding, topicEmbedding);
        similarities.push(similarity);
      }
      
      const avgSimilarity = similarities.reduce((a, b) => a + b, 0) / similarities.length;
      
      return avgSimilarity < CONTEXT_CONFIG.thresholds.TOPIC_SHIFT_THRESHOLD;
      
    } catch (error) {
      console.warn('Error detectando cambio de tema:', error);
      return false;
    }
  }

  /**
   * Optimiza mensajes para el modelo manteniendo coherencia
   */
  async optimizeMessagesForModel(messages, conversationContext) {
    if (!Array.isArray(messages) || messages.length === 0) {
      return messages;
    }
    
    // Si hay menos mensajes que el límite, devolver con optimización básica
    if (messages.length <= CONTEXT_CONFIG.limits.MAX_MESSAGES) {
      return this.applyBasicOptimization(messages, conversationContext);
    }
    
    // Optimización avanzada para conversaciones largas
    return this.applyAdvancedOptimization(messages, conversationContext);
  }

  /**
   * Optimización básica para conversaciones cortas/medias
   */
  applyBasicOptimization(messages, conversationContext) {
    // Mantener mensajes iniciales para contexto base
    const contextMessages = messages.slice(0, 2);
    
    // Puntuar importancia de mensajes recientes
    const recentMessages = messages.slice(2).map((msg, index) => {
      let importance = 0;
      
      // Recencia (mensajes más recientes tienen más peso)
      importance += (index + 1) / (messages.length - 2) * 3;
      
      // Mensajes del usuario son más importantes
      if (msg.role === 'user') importance += 2;
      
      // Mensajes con preguntas
      const text = msg.parts?.[0]?.text || msg.content || '';
      if (text.includes('?')) importance += 1.5;
      
      // Mensajes con código o datos técnicos
      if (text.match(/```|{|}|\[|\]/)) importance += 1;
      
      // Mensajes que mencionan temas del contexto
      if (conversationContext.keyTopics) {
        conversationContext.keyTopics.forEach(topic => {
          if (text.toLowerCase().includes(topic.toLowerCase())) {
            importance += 0.5;
          }
        });
      }
      
      return { ...msg, importance };
    });
    
    // Seleccionar mensajes mejor puntuados
    const selectedMessages = recentMessages
      .sort((a, b) => b.importance - a.importance)
      .slice(0, CONTEXT_CONFIG.limits.MAX_MESSAGES - 4)
      .sort((a, b) => a.index - b.index) // Reordenar cronológicamente
      .map(({ importance, ...msg }) => msg);
    
    // Crear resumen de mensajes omitidos
    const omittedCount = messages.length - contextMessages.length - selectedMessages.length - 1;
    let summaryMessage = null;
    
    if (omittedCount > 0) {
      const summary = this.generateSmartSummary(messages, contextMessages.length, omittedCount);
      summaryMessage = {
        role: 'model',
        parts: [{ text: summary }]
      };
    }
    
    // Construir resultado final
    const result = [...contextMessages];
    if (summaryMessage) result.push(summaryMessage);
    result.push(...selectedMessages);
    
    // Asegurar que el último mensaje esté incluido
    if (!result.some(msg => msg === messages[messages.length - 1])) {
      result.push(messages[messages.length - 1]);
    }
    
    return result;
  }

  /**
   * Optimización avanzada con análisis semántico
   */
  async applyAdvancedOptimization(messages, conversationContext) {
    // Primero aplicar optimización básica
    let optimized = this.applyBasicOptimization(messages, conversationContext);
    
    // Si aún hay demasiados mensajes, usar análisis semántico
    if (optimized.length > CONTEXT_CONFIG.limits.MAX_MESSAGES) {
      optimized = await this.semanticOptimization(optimized, conversationContext);
    }
    
    return optimized;
  }

  /**
   * Genera un resumen inteligente de los mensajes omitidos
   */
  generateSmartSummary(allMessages, startIndex, omittedCount) {
    const omittedMessages = allMessages.slice(startIndex, startIndex + omittedCount);
    
    // Extraer temas principales de los mensajes omitidos
    const topics = new Set();
    const keyPoints = [];
    
    omittedMessages.forEach(msg => {
      const text = msg.parts?.[0]?.text || msg.content || '';
      
      // Buscar temas (palabras clave en mayúsculas o menciones específicas)
      const topicMatches = text.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g);
      if (topicMatches) {
        topicMatches.forEach(topic => topics.add(topic));
      }
      
      // Buscar puntos clave (oraciones con información importante)
      if (text.length > 50 && (text.includes('importante') || text.includes('clave') || 
          text.includes('principal') || text.includes('necesito'))) {
        keyPoints.push(text.substring(0, 100) + (text.length > 100 ? '...' : ''));
      }
    });
    
    const topicList = Array.from(topics).slice(0, 3);
    const keyPointsList = keyPoints.slice(0, 2);
    
    let summary = `[Contexto: ${omittedCount} mensajes anteriores`;
    
    if (topicList.length > 0) {
      summary += ` sobre: ${topicList.join(', ')}`;
    }
    
    if (keyPointsList.length > 0) {
      summary += ` | Puntos clave: ${keyPointsList.join(' | ')}`;
    }
    
    summary += ']';
    
    return summary;
  }

  /**
   * Actualiza el resumen semántico de la conversación
   */
  async updateSemanticSummary(sessionId, messages) {
    try {
      const recentMessages = messages.slice(-10); // Últimos 10 mensajes
      const conversationText = recentMessages
        .map(msg => msg.parts?.[0]?.text || msg.content || '')
        .join('\n');
      
      // Generar resumen usando el modelo
      const summaryPrompt = `Analiza esta conversación y extrae:
1. Los 3 temas principales discutidos
2. Los puntos clave o decisiones importantes
3. Cualquier preferencia o información específica del usuario

Conversación:
${conversationText}

Responde en formato JSON con: {"topics": [...], "keyPoints": [...], "userInfo": {...}}`;
      
      const summaryResponse = await generateContent({
        contents: [{ role: 'user', parts: [{ text: summaryPrompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 500 }
      });
      
      const summaryData = JSON.parse(summaryResponse.text());
      
      this.conversationSummaries.set(sessionId, {
        ...summaryData,
        lastUpdate: new Date().toISOString(),
        messageCount: messages.length
      });
      
    } catch (error) {
      console.warn('Error actualizando resumen semántico:', error);
    }
  }

  /**
   * Gestiona el contexto del usuario a largo plazo
   */
  async updateUserContext(userId, messages, conversationContext) {
    if (!this.userContextStore.has(userId)) {
      this.userContextStore.set(userId, {
        preferences: {},
        expertiseLevel: 'unknown',
        communicationStyle: 'neutral',
        topicsOfInterest: [],
        conversationHistory: [],
        lastUpdate: new Date().toISOString()
      });
    }
    
    const userContext = this.userContextStore.get(userId);
    
    // Actualizar historial de conversaciones
    userContext.conversationHistory.push({
      sessionId: conversationContext.sessionId,
      timestamp: new Date().toISOString(),
      topics: conversationContext.keyTopics || [],
      summary: conversationContext.summary || ''
    });
    
    // Mantener solo últimas 10 conversaciones
    if (userContext.conversationHistory.length > 10) {
      userContext.conversationHistory = userContext.conversationHistory.slice(-10);
    }
    
    // Actualizar nivel de expertise basado en conversación
    await this.updateExpertiseLevel(userId, messages);
    
    userContext.lastUpdate = new Date().toISOString();
  }

  /**
   * Actualiza el nivel de expertise del usuario
   */
  async updateExpertiseLevel(userId, messages) {
    const userContext = this.userContextStore.get(userId);
    if (!userContext) return;
    
    const recentMessages = messages.slice(-5);
    const technicalIndicators = recentMessages.filter(msg => {
      const text = msg.parts?.[0]?.text || msg.content || '';
      return text.match(/\b(?:API|JSON|database|algorithm|framework)\b/i);
    }).length;
    
    if (technicalIndicators >= 3) {
      userContext.expertiseLevel = 'advanced';
    } else if (technicalIndicators >= 1) {
      userContext.expertiseLevel = 'intermediate';
    } else {
      userContext.expertiseLevel = 'beginner';
    }
  }

  /**
   * Obtiene contexto de conversación
   */
  async getConversationContext(sessionId) {
    if (!this.conversationStore.has(sessionId)) {
      this.conversationStore.set(sessionId, {
        sessionId,
        createdAt: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
        messageCount: 0,
        keyTopics: [],
        recentTopics: [],
        summary: '',
        topicShifts: 0,
        userInteractions: []
      });
    }
    
    return this.conversationStore.get(sessionId);
  }

  /**
   * Guarda contexto de conversación
   */
  async saveConversationContext(sessionId, context) {
    context.lastUpdate = new Date().toISOString();
    this.conversationStore.set(sessionId, context);
    
    // También actualizar caché si existe
    try {
      await contextCacheService.createContextCache(
        context.messages || [],
        'gemini-3.1-flash-lite',
        86400 // 24 horas
      );
    } catch (error) {
      console.warn('Error guardando en context cache:', error);
    }
  }

  /**
   * Maneja el cambio de tema en la conversación
   */
  async handleTopicShift(sessionId, conversationContext, messages) {
    conversationContext.topicShifts++;
    
    // Guardar resumen del tema anterior
    if (conversationContext.recentTopics.length > 0) {
      conversationContext.pastTopics = conversationContext.pastTopics || [];
      conversationContext.pastTopics.push({
        topics: [...conversationContext.recentTopics],
        endedAt: new Date().toISOString(),
        messageCount: conversationContext.messageCount
      });
    }
    
    // Limpiar temas recientes para nuevo tema
    conversationContext.recentTopics = [];
    
    return conversationContext;
  }

  /**
   * Calcula similitud coseno entre dos embeddings
   */
  calculateCosineSimilarity(embeddingA, embeddingB) {
    if (!embeddingA || !embeddingB || embeddingA.length !== embeddingB.length) {
      return 0;
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < embeddingA.length; i++) {
      dotProduct += embeddingA[i] * embeddingB[i];
      normA += embeddingA[i] * embeddingA[i];
      normB += embeddingB[i] * embeddingB[i];
    }
    
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (normA * normB);
  }

  /**
   * Calcula el tamaño total del contexto en caracteres
   */
  calculateContextSize(messages) {
    return messages.reduce((total, msg) => {
      const text = msg.parts?.[0]?.text || msg.content || '';
      return total + text.length;
    }, 0);
  }

  /**
   * Limpieza automática de contextos expirados
   */
  startCleanupInterval() {
    setInterval(async () => {
      const now = Date.now();
      let cleanedCount = 0;
      
      // Limpiar conversaciones antiguas (más de 7 días sin actividad)
      for (const [sessionId, context] of this.conversationStore.entries()) {
        const lastUpdate = new Date(context.lastUpdate).getTime();
        if (now - lastUpdate > CONTEXT_CONFIG.persistence.LONG_TERM) {
          this.conversationStore.delete(sessionId);
          this.conversationSummaries.delete(sessionId);
          cleanedCount++;
        }
      }
      
      // Limpiar contextos de usuario inactivos (más de 30 días)
      for (const [userId, context] of this.userContextStore.entries()) {
        const lastUpdate = new Date(context.lastUpdate).getTime();
        if (now - lastUpdate > 30 * 24 * 60 * 60 * 1000) {
          this.userContextStore.delete(userId);
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
        console.log(`🧹 Context Manager: Limpiados ${cleanedCount} contextos expirados`);
      }
    }, 60 * 60 * 1000); // Ejecutar cada hora
  }

  /**
   * Obtiene estadísticas del gestor de contexto
   */
  getStats() {
    const cacheStats = contextCacheService.getStats();
    
    return {
      activeConversations: this.conversationStore.size,
      activeUsers: this.userContextStore.size,
      conversationSummaries: this.conversationSummaries.size,
      cacheStats,
      config: CONTEXT_CONFIG,
      memoryUsage: {
        conversations: this.estimateMemoryUsage(this.conversationStore),
        users: this.estimateMemoryUsage(this.userContextStore),
        summaries: this.estimateMemoryUsage(this.conversationSummaries)
      }
    };
  }

  /**
   * Estima el uso de memoria de un Map
   */
  estimateMemoryUsage(map) {
    const entries = Array.from(map.entries());
    const estimatedBytes = entries.reduce((total, [key, value]) => {
      return total + JSON.stringify(key).length + JSON.stringify(value).length;
    }, 0);
    
    return {
      entries: entries.length,
      estimatedBytes,
      estimatedMB: (estimatedBytes / (1024 * 1024)).toFixed(2)
    };
  }

  /**
   * Limpia todos los contextos (uso con precaución)
   */
  async clearAllContexts() {
    const stats = this.getStats();
    
    this.conversationStore.clear();
    this.userContextStore.clear();
    this.conversationSummaries.clear();
    this.semanticEmbeddings.clear();
    
    // También limpiar caché de contexto
    await contextCacheService.clearAllCaches();
    
    return {
      message: 'Todos los contextos han sido limpiados',
      previousStats: stats
    };
  }
}

// Exportar instancia singleton
const unifiedContextManager = new UnifiedContextManager();

export default unifiedContextManager;