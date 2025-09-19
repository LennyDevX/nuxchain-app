/**
 * Servicio de Fallback Robusto para Context Manager
 * 
 * Proporciona múltiples niveles de recuperación cuando el sistema
 * principal de manejo de contexto falla o presenta problemas.
 */

import { UNIFIED_CONTEXT_CONFIG, UnifiedContextUtils } from '../config/unified-context-config.js';
import contextEffectivenessService from './context-effectiveness-service.js';

class ContextFallbackService {
  constructor() {
    this.fallbackLevels = {
      LEVEL_1: 'basic_optimization',
      LEVEL_2: 'emergency_summary',
      LEVEL_3: 'minimal_context',
      LEVEL_4: 'stateless_mode'
    };
    
    this.currentFallbackLevel = null;
    this.fallbackHistory = [];
    this.recoveryAttempts = new Map();
    this.circuitBreaker = {
      isOpen: false,
      failures: 0,
      lastFailure: null,
      resetTimeout: null
    };
    
    this.emergencyCache = new Map();
    this.fallbackMetrics = {
      totalFallbacks: 0,
      levelUsage: {},
      recoverySuccess: 0,
      recoveryFailures: 0
    };
    
    // Inicializar niveles de fallback
    this.initializeFallbackLevels();
  }

  /**
   * Punto de entrada principal para manejo de contexto con fallback
   */
  async handleContextWithFallback(messages, options = {}) {
    const sessionId = options.sessionId || 'default';
    const startTime = Date.now();
    
    try {
      // Verificar circuit breaker
      if (this.circuitBreaker.isOpen) {
        return await this.executeEmergencyFallback(messages, options);
      }
      
      // Intentar procesamiento normal
      const result = await this.attemptNormalProcessing(messages, options);
      
      // Si hay un fallback activo y el procesamiento fue exitoso, intentar recuperación
      if (this.currentFallbackLevel && result.success) {
        await this.attemptRecovery(sessionId);
      }
      
      return result;
      
    } catch (error) {
      console.error('Error en procesamiento de contexto:', error);
      
      // Registrar falla
      this.recordFailure(error, sessionId);
      
      // Ejecutar fallback apropiado
      return await this.executeFallback(messages, options, error);
    } finally {
      // Registrar métricas
      this.recordMetrics(sessionId, Date.now() - startTime);
    }
  }

  /**
   * Intenta procesamiento normal del contexto
   */
  async attemptNormalProcessing(messages, options) {
    const timeout = UNIFIED_CONTEXT_CONFIG.fallback.PROCESSING_TIMEOUT;
    
    return await Promise.race([
      this.processContextNormally(messages, options),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout en procesamiento')), timeout)
      )
    ]);
  }

  /**
   * Procesamiento normal del contexto
   */
  async processContextNormally(messages, options) {
    // Aquí iría la lógica normal del context manager
    // Por ahora simulamos el procesamiento
    
    // Validar entrada
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Mensajes inválidos');
    }
    
    // Simular procesamiento que puede fallar
    if (Math.random() < 0.1) { // 10% de probabilidad de falla para testing
      throw new Error('Falla simulada en procesamiento');
    }
    
    return {
      success: true,
      messages: messages,
      metadata: {
        processed: true,
        optimized: true,
        fallbackUsed: false
      }
    };
  }

  /**
   * Ejecuta el fallback apropiado según el nivel de error
   */
  async executeFallback(messages, options, error) {
    const fallbackLevel = this.determineFallbackLevel(error, options);
    
    console.warn(`🔄 Ejecutando fallback nivel ${fallbackLevel}:`, error.message);
    
    this.currentFallbackLevel = fallbackLevel;
    this.fallbackMetrics.totalFallbacks++;
    this.fallbackMetrics.levelUsage[fallbackLevel] = (this.fallbackMetrics.levelUsage[fallbackLevel] || 0) + 1;
    
    // Registrar en historial
    this.fallbackHistory.push({
      timestamp: new Date().toISOString(),
      level: fallbackLevel,
      error: error.message,
      sessionId: options.sessionId
    });
    
    switch (fallbackLevel) {
      case this.fallbackLevels.LEVEL_1:
        return await this.executeLevel1Fallback(messages, options);
      case this.fallbackLevels.LEVEL_2:
        return await this.executeLevel2Fallback(messages, options);
      case this.fallbackLevels.LEVEL_3:
        return await this.executeLevel3Fallback(messages, options);
      case this.fallbackLevels.LEVEL_4:
        return await this.executeLevel4Fallback(messages, options);
      default:
        return await this.executeEmergencyFallback(messages, options);
    }
  }

  /**
   * Determina el nivel de fallback apropiado
   */
  determineFallbackLevel(error, options) {
    const errorType = this.classifyError(error);
    const sessionId = options.sessionId || 'default';
    const attempts = this.recoveryAttempts.get(sessionId) || 0;
    
    // Escalamiento basado en intentos previos
    if (attempts >= 3) return this.fallbackLevels.LEVEL_4;
    if (attempts >= 2) return this.fallbackLevels.LEVEL_3;
    
    // Escalamiento basado en tipo de error
    switch (errorType) {
      case 'timeout':
      case 'performance':
        return this.fallbackLevels.LEVEL_1;
      case 'memory':
      case 'optimization':
        return this.fallbackLevels.LEVEL_2;
      case 'critical':
      case 'system':
        return this.fallbackLevels.LEVEL_3;
      default:
        return this.fallbackLevels.LEVEL_1;
    }
  }

  /**
   * Clasifica el tipo de error
   */
  classifyError(error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('timeout') || message.includes('tiempo')) {
      return 'timeout';
    }
    if (message.includes('memory') || message.includes('memoria')) {
      return 'memory';
    }
    if (message.includes('optimization') || message.includes('optimización')) {
      return 'optimization';
    }
    if (message.includes('critical') || message.includes('crítico')) {
      return 'critical';
    }
    if (message.includes('system') || message.includes('sistema')) {
      return 'system';
    }
    
    return 'general';
  }

  /**
   * Fallback Nivel 1: Optimización Básica
   */
  async executeLevel1Fallback(messages, options) {
    try {
      console.log('📝 Fallback Nivel 1: Optimización básica');
      
      // Aplicar optimización simple
      const optimizedMessages = await this.basicOptimization(messages);
      
      return {
        success: true,
        messages: optimizedMessages,
        metadata: {
          fallbackLevel: this.fallbackLevels.LEVEL_1,
          fallbackUsed: true,
          optimizationApplied: true,
          originalCount: messages.length,
          optimizedCount: optimizedMessages.length
        }
      };
      
    } catch (error) {
      console.error('Error en fallback nivel 1:', error);
      return await this.executeLevel2Fallback(messages, options);
    }
  }

  /**
   * Fallback Nivel 2: Resumen de Emergencia
   */
  async executeLevel2Fallback(messages, options) {
    try {
      console.log('📋 Fallback Nivel 2: Resumen de emergencia');
      
      // Crear resumen de emergencia
      const summary = await this.createEmergencySummary(messages);
      const recentMessages = messages.slice(-3); // Últimos 3 mensajes
      
      const fallbackMessages = [
        {
          role: 'system',
          parts: [{ text: `Resumen de conversación: ${summary}` }]
        },
        ...recentMessages
      ];
      
      return {
        success: true,
        messages: fallbackMessages,
        metadata: {
          fallbackLevel: this.fallbackLevels.LEVEL_2,
          fallbackUsed: true,
          summaryCreated: true,
          summaryLength: summary.length,
          originalCount: messages.length,
          fallbackCount: fallbackMessages.length
        }
      };
      
    } catch (error) {
      console.error('Error en fallback nivel 2:', error);
      return await this.executeLevel3Fallback(messages, options);
    }
  }

  /**
   * Fallback Nivel 3: Contexto Mínimo
   */
  async executeLevel3Fallback(messages, options) {
    try {
      console.log('⚡ Fallback Nivel 3: Contexto mínimo');
      
      // Usar solo el último mensaje del usuario
      const lastUserMessage = messages
        .slice()
        .reverse()
        .find(msg => msg.role === 'user');
      
      if (!lastUserMessage) {
        return await this.executeLevel4Fallback(messages, options);
      }
      
      const minimalMessages = [
        {
          role: 'system',
          parts: [{ text: 'Contexto limitado - respondiendo solo al último mensaje.' }]
        },
        lastUserMessage
      ];
      
      return {
        success: true,
        messages: minimalMessages,
        metadata: {
          fallbackLevel: this.fallbackLevels.LEVEL_3,
          fallbackUsed: true,
          minimalContext: true,
          originalCount: messages.length,
          fallbackCount: minimalMessages.length
        }
      };
      
    } catch (error) {
      console.error('Error en fallback nivel 3:', error);
      return await this.executeLevel4Fallback(messages, options);
    }
  }

  /**
   * Fallback Nivel 4: Modo Sin Estado
   */
  async executeLevel4Fallback(messages, options) {
    try {
      console.log('🚨 Fallback Nivel 4: Modo sin estado');
      
      // Activar circuit breaker
      this.activateCircuitBreaker();
      
      // Respuesta genérica sin contexto
      const statelessMessages = [
        {
          role: 'system',
          parts: [{ 
            text: 'Sistema en modo de recuperación. Funcionalidad limitada temporalmente.' 
          }]
        },
        {
          role: 'user',
          parts: [{ text: 'Solicitud de usuario' }]
        }
      ];
      
      return {
        success: true,
        messages: statelessMessages,
        metadata: {
          fallbackLevel: this.fallbackLevels.LEVEL_4,
          fallbackUsed: true,
          statelessMode: true,
          circuitBreakerActivated: true,
          originalCount: messages.length,
          fallbackCount: statelessMessages.length
        }
      };
      
    } catch (error) {
      console.error('Error en fallback nivel 4:', error);
      return await this.executeEmergencyFallback(messages, options);
    }
  }

  /**
   * Fallback de Emergencia Absoluta
   */
  async executeEmergencyFallback(messages, options) {
    console.log('🆘 Fallback de emergencia absoluta');
    
    return {
      success: false,
      messages: [
        {
          role: 'system',
          parts: [{ 
            text: 'Sistema temporalmente no disponible. Por favor, intente más tarde.' 
          }]
        }
      ],
      metadata: {
        fallbackLevel: 'emergency',
        fallbackUsed: true,
        emergencyMode: true,
        error: 'Sistema en modo de emergencia'
      }
    };
  }

  /**
   * Optimización básica de mensajes
   */
  async basicOptimization(messages) {
    if (messages.length <= UNIFIED_CONTEXT_CONFIG.limits.MAX_MESSAGES) {
      return messages;
    }
    
    // Mantener mensajes del sistema
    const systemMessages = messages.filter(msg => msg.role === 'system');
    const otherMessages = messages.filter(msg => msg.role !== 'system');
    
    // Mantener los últimos N mensajes
    const keepCount = Math.floor(UNIFIED_CONTEXT_CONFIG.limits.MAX_MESSAGES * 0.7);
    const recentMessages = otherMessages.slice(-keepCount);
    
    return [...systemMessages, ...recentMessages];
  }

  /**
   * Crea un resumen de emergencia
   */
  async createEmergencySummary(messages) {
    try {
      // Extraer puntos clave de la conversación
      const userMessages = messages.filter(msg => msg.role === 'user');
      const topics = [];
      
      userMessages.forEach(msg => {
        const text = msg.parts?.[0]?.text || msg.content || '';
        if (text.length > 20) {
          // Extraer palabras clave simples
          const keywords = text
            .toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 4)
            .slice(0, 3);
          topics.push(...keywords);
        }
      });
      
      const uniqueTopics = [...new Set(topics)].slice(0, 5);
      
      return uniqueTopics.length > 0 
        ? `Temas principales: ${uniqueTopics.join(', ')}`
        : 'Conversación general';
        
    } catch (error) {
      return 'Resumen no disponible';
    }
  }

  /**
   * Registra una falla del sistema
   */
  recordFailure(error, sessionId) {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailure = Date.now();
    
    // Incrementar intentos de recuperación para la sesión
    const attempts = this.recoveryAttempts.get(sessionId) || 0;
    this.recoveryAttempts.set(sessionId, attempts + 1);
    
    // Activar circuit breaker si hay muchas fallas
    if (this.circuitBreaker.failures >= UNIFIED_CONTEXT_CONFIG.fallback.CIRCUIT_BREAKER_THRESHOLD) {
      this.activateCircuitBreaker();
    }
  }

  /**
   * Activa el circuit breaker
   */
  activateCircuitBreaker() {
    if (this.circuitBreaker.isOpen) return;
    
    console.warn('🔴 Circuit breaker activado - sistema en modo de protección');
    
    this.circuitBreaker.isOpen = true;
    
    // Programar reset automático
    const resetTime = UNIFIED_CONTEXT_CONFIG.fallback.CIRCUIT_BREAKER_RESET_TIME;
    this.circuitBreaker.resetTimeout = setTimeout(() => {
      this.resetCircuitBreaker();
    }, resetTime);
  }

  /**
   * Resetea el circuit breaker
   */
  resetCircuitBreaker() {
    console.log('🟢 Circuit breaker reseteado - intentando recuperación');
    
    this.circuitBreaker.isOpen = false;
    this.circuitBreaker.failures = 0;
    this.circuitBreaker.lastFailure = null;
    
    if (this.circuitBreaker.resetTimeout) {
      clearTimeout(this.circuitBreaker.resetTimeout);
      this.circuitBreaker.resetTimeout = null;
    }
  }

  /**
   * Intenta recuperación del sistema
   */
  async attemptRecovery(sessionId) {
    try {
      console.log('🔄 Intentando recuperación del sistema...');
      
      // Verificar si el sistema principal está funcionando
      const testResult = await this.testSystemHealth();
      
      if (testResult.healthy) {
        console.log('✅ Sistema recuperado exitosamente');
        
        // Limpiar estado de fallback
        this.currentFallbackLevel = null;
        this.recoveryAttempts.delete(sessionId);
        this.fallbackMetrics.recoverySuccess++;
        
        // Resetear circuit breaker si está activo
        if (this.circuitBreaker.isOpen) {
          this.resetCircuitBreaker();
        }
        
        return true;
      } else {
        this.fallbackMetrics.recoveryFailures++;
        return false;
      }
      
    } catch (error) {
      console.error('Error en intento de recuperación:', error);
      this.fallbackMetrics.recoveryFailures++;
      return false;
    }
  }

  /**
   * Prueba la salud del sistema
   */
  async testSystemHealth() {
    try {
      // Simular prueba de salud del sistema
      const testMessages = [
        { role: 'user', parts: [{ text: 'test' }] }
      ];
      
      await this.processContextNormally(testMessages, { test: true });
      
      return { healthy: true };
      
    } catch (error) {
      return { 
        healthy: false, 
        error: error.message 
      };
    }
  }

  /**
   * Registra métricas de rendimiento
   */
  recordMetrics(sessionId, processingTime) {
    // Registrar métricas básicas
    const metrics = {
      sessionId,
      processingTime,
      fallbackLevel: this.currentFallbackLevel,
      timestamp: new Date().toISOString()
    };
    
    // Enviar a servicio de efectividad si está disponible
    if (contextEffectivenessService && typeof contextEffectivenessService.recordFallbackMetrics === 'function') {
      contextEffectivenessService.recordFallbackMetrics(metrics);
    }
  }

  /**
   * Obtiene estadísticas de fallback
   */
  getFallbackStats() {
    return {
      currentLevel: this.currentFallbackLevel,
      circuitBreaker: {
        isOpen: this.circuitBreaker.isOpen,
        failures: this.circuitBreaker.failures,
        lastFailure: this.circuitBreaker.lastFailure
      },
      metrics: this.fallbackMetrics,
      activeSessions: this.recoveryAttempts.size,
      recentFallbacks: this.fallbackHistory.slice(-10)
    };
  }

  /**
   * Fuerza un reset del sistema de fallback
   */
  forceReset() {
    console.log('🔄 Forzando reset del sistema de fallback');
    
    this.currentFallbackLevel = null;
    this.recoveryAttempts.clear();
    this.resetCircuitBreaker();
    this.emergencyCache.clear();
    
    return {
      success: true,
      message: 'Sistema de fallback reseteado'
    };
  }

  /**
   * Inicializa los niveles de fallback
   */
  initializeFallbackLevels() {
    // Inicializar contadores de uso
    Object.values(this.fallbackLevels).forEach(level => {
      this.fallbackMetrics.levelUsage[level] = 0;
    });
  }

  /**
   * Limpia recursos y datos antiguos
   */
  cleanup() {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 horas
    
    // Limpiar historial antiguo
    this.fallbackHistory = this.fallbackHistory.filter(entry => {
      return new Date(entry.timestamp).getTime() > cutoffTime;
    });
    
    // Limpiar intentos de recuperación antiguos
    for (const [sessionId, attempts] of this.recoveryAttempts.entries()) {
      if (attempts === 0) {
        this.recoveryAttempts.delete(sessionId);
      }
    }
    
    // Limpiar cache de emergencia
    this.emergencyCache.clear();
  }
}

// Crear instancia singleton
const contextFallbackService = new ContextFallbackService();

// Limpiar recursos periódicamente
setInterval(() => {
  contextFallbackService.cleanup();
}, 60 * 60 * 1000); // Cada hora

export default contextFallbackService;