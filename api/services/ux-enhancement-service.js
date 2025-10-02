/**
 * API UX Enhancement Service
 * Optimized for production streaming
 * Provides lightweight utilities for enhancing user experience
 */

class APIUXEnhancementService {
  constructor() {
    // Simplified storage for active sessions
    this.activeSessions = new Map();
    
    // Minimal typing states required for production
    this.typingStates = {
      THINKING: 'thinking',
      TYPING: 'typing',
      STREAMING: 'streaming',
      COMPLETE: 'complete'
    };
  }

  /**
   * Creates a minimal typing indicator
   */
  createTypingIndicator(sessionId, options = {}) {
    const {
      type = this.typingStates.THINKING,
      customMessage = null
    } = options;

    // Store minimal session data (English only)
    const sessionData = {
      id: sessionId,
      type,
      startTime: Date.now(),
      customMessage,
      isActive: true
    };

    this.activeSessions.set(sessionId, sessionData);
    return this.generateTypingIndicatorData(sessionData);
  }

  /**
   * Updates typing indicator state
   */
  updateTypingIndicator(sessionId, newState, options = {}) {
    const sessionData = this.activeSessions.get(sessionId);
    if (!sessionData) return null;

    sessionData.type = newState;
    sessionData.lastUpdate = Date.now();
    
    if (options.customMessage) {
      sessionData.customMessage = options.customMessage;
    }

    return this.generateTypingIndicatorData(sessionData);
  }

  /**
   * Generates formatted typing indicator data
   */
  generateTypingIndicatorData(sessionData) {
    // English-only messages for user experience
    const messages = {
      [this.typingStates.THINKING]: {
        text: sessionData.customMessage || 'Thinking...',
        dots: '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
      },
      [this.typingStates.TYPING]: {
        text: sessionData.customMessage || 'Writing response...',
        dots: '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
      },
      [this.typingStates.STREAMING]: {
        text: sessionData.customMessage || 'Streaming...',
        dots: '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
      }
    };

    // Get message data for the current state
    const messageData = messages[sessionData.type] || messages[this.typingStates.THINKING];
    
    // Simple dot animation without frame tracking
    const dots = messageData.dots;
    const frameIndex = Math.floor((Date.now() - sessionData.startTime) / 100) % dots.length;
    const currentDot = dots[frameIndex];

    return {
      sessionId: sessionData.id,
      type: 'typing_indicator',
      state: sessionData.type,
      message: messageData.text,
      animatedDot: currentDot,
      timestamp: Date.now(),
      isActive: sessionData.isActive
    };
  }

  /**
   * Cleans up resources for a session
   */
  cleanupSession(sessionId) {
    this.activeSessions.delete(sessionId);
  }

  /**
   * Simple response formatting
   */
  formatResponse(sessionId, data, status = 'success') {
    return {
      sessionId,
      status,
      data,
      timestamp: Date.now(),
      metadata: {
        uxEnhanced: true,
        processingTime: Date.now() - (this.activeSessions.get(sessionId)?.startTime || Date.now())
      }
    };
  }

  /**
   * Health check for the service
   */
  getHealth() {
    return {
      status: 'healthy',
      activeSessions: this.activeSessions.size,
      memoryUsage: process.memoryUsage().rss / 1024 / 1024 + ' MB'
    };
  }

  /**
   * NUEVO: Prioritar contextos según intención
   */
  prioritizeContext({ embeddings, urls, userIntent, conversationHistory }) {
    const contexts = [];
    
    // Prioridad 1: URLs si es búsqueda específica
    if (urls && userIntent.type === 'search') {
      contexts.push(urls);
    }
    
    // Prioridad 2: Embeddings (siempre relevante)
    if (embeddings) {
      contexts.push(embeddings);
    }
    
    // Prioridad 3: URLs en otros casos
    if (urls && userIntent.type !== 'search') {
      contexts.push(urls);
    }
    
    // Combinar con límite de tokens
    const combined = contexts.filter(Boolean).join('\n\n');
    
    // Truncar si es muy largo (max 3000 chars)
    if (combined.length > 3000) {
      return combined.substring(0, 3000) + '...';
    }
    
    return combined || 'Nuxchain es una plataforma descentralizada integral.';
  }
  
  /**
   * NUEVO: Construir system prompt optimizado
   */
  buildSystemPrompt({ context, intent, conversationLength }) {
    const basePrompt = `Eres Nuvim AI 1.0, el asistente inteligente oficial de Nuxchain.

CONTEXTO RELEVANTE:
${context}

INSTRUCCIONES:`;
    
    // Ajustar instrucciones según intención
    const instructions = [];
    
    if (intent.type === 'technical') {
      instructions.push('- Proporciona respuestas técnicas y detalladas');
      instructions.push('- Incluye ejemplos de código cuando sea apropiado');
    } else if (intent.type === 'help') {
      instructions.push('- Sé claro y paso a paso en las explicaciones');
      instructions.push('- Ofrece alternativas y ejemplos prácticos');
    } else if (intent.type === 'casual') {
      instructions.push('- Mantén un tono amigable y conversacional');
      instructions.push('- Usa emojis ocasionalmente');
    }
    
    // Instrucciones comunes
    instructions.push('- Responde en el mismo idioma del usuario');
    instructions.push('- Usa la información del contexto cuando sea relevante');
    instructions.push('- Sé conciso pero completo');
    
    // Si es conversación larga, recordar ser consistente
    if (conversationLength > 5) {
      instructions.push('- Mantén coherencia con las respuestas anteriores');
    }
    
    return `${basePrompt}\n${instructions.join('\n')}`;
  }
  
  /**
   * NUEVO: Optimizar configuración según intención
   */
  optimizeGenerationConfig(userIntent) {
    const baseConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    };
    
    // Ajustar según tipo de consulta
    if (userIntent.type === 'technical') {
      return {
        ...baseConfig,
        temperature: 0.5, // Más preciso
        maxOutputTokens: 3000 // Más espacio para detalles
      };
    }
    
    if (userIntent.type === 'creative') {
      return {
        ...baseConfig,
        temperature: 0.9, // Más creativo
        topP: 0.98
      };
    }
    
    return baseConfig;
  }
  
  /**
   * NUEVO: Mejorar chunks individuales
   */
  enhanceChunk(chunk, { intent, isFirstChunk, totalLength }) {
    let enhanced = chunk;
    
    // Primer chunk: agregar indicador de inicio si es apropiado
    if (isFirstChunk && intent.type === 'casual') {
      // Ya viene el saludo del modelo, no duplicar
    }
    
    // Asegurar formato adecuado de código
    if (chunk.includes('```')) {
      // Ya viene bien formateado del semantic streaming
    }
    
    return enhanced;
  }
}

// Export a singleton instance
module.exports = new APIUXEnhancementService();