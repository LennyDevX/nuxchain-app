/**
 * Servicio de Análisis de Efectividad del Contexto
 * 
 * Proporciona métricas avanzadas para evaluar qué tan efectivo es
 * el manejo de contexto en conversaciones largas.
 */

import { UNIFIED_CONTEXT_CONFIG, UnifiedContextUtils } from '../config/unified-context-config.js';
import embeddingsService from './embeddings-service.js';

class ContextEffectivenessService {
  constructor() {
    this.metrics = new Map();
    this.sessionMetrics = new Map();
    this.globalMetrics = {
      totalSessions: 0,
      averageCoherence: 0,
      averageRelevance: 0,
      averageSatisfaction: 0,
      averageEffectiveness: 0,
      errorRate: 0,
      lastUpdated: new Date().toISOString()
    };
    this.metricsHistory = [];
    
    // Inicializar análisis periódico
    this.startPeriodicAnalysis();
  }

  /**
   * Analiza la efectividad del contexto en tiempo real
   */
  async analyzeContextEffectiveness(sessionId, messages, response, contextMetadata = {}) {
    try {
      const analysis = {
        sessionId,
        timestamp: new Date().toISOString(),
        coherence: await this.analyzeCoherence(messages, response),
        relevance: await this.analyzeRelevance(messages, response),
        satisfaction: this.analyzeSatisfaction(messages, response),
        contextUtilization: this.analyzeContextUtilization(messages, contextMetadata),
        conversationFlow: this.analyzeConversationFlow(messages),
        topicConsistency: await this.analyzeTopicConsistency(messages),
        responseQuality: this.analyzeResponseQuality(response, messages),
        errorIndicators: this.detectErrorIndicators(messages, response)
      };

      // Calcular efectividad general
      analysis.overallEffectiveness = this.calculateOverallEffectiveness(analysis);

      // Almacenar métricas
      this.storeMetrics(sessionId, analysis);

      // Actualizar métricas globales
      this.updateGlobalMetrics(analysis);

      // Generar recomendaciones si es necesario
      analysis.recommendations = this.generateRecommendations(analysis);

      return analysis;

    } catch (error) {
      console.error('Error analizando efectividad del contexto:', error);
      return this.getBasicAnalysis(sessionId, messages, response);
    }
  }

  /**
   * Analiza la coherencia contextual
   */
  async analyzeCoherence(messages, response) {
    if (messages.length < 2) return 1.0;

    try {
      // Obtener embeddings de los últimos mensajes
      const recentMessages = messages.slice(-3);
      const messageTexts = recentMessages.map(msg => 
        msg.parts?.[0]?.text || msg.content || ''
      );
      
      const responseText = response.parts?.[0]?.text || response.content || response;
      
      // Calcular similitud semántica entre mensajes consecutivos
      let coherenceScores = [];
      
      for (let i = 1; i < messageTexts.length; i++) {
        const similarity = await this.calculateSemanticSimilarity(
          messageTexts[i-1], 
          messageTexts[i]
        );
        coherenceScores.push(similarity);
      }
      
      // Calcular coherencia entre último mensaje y respuesta
      if (messageTexts.length > 0) {
        const responseCoherence = await this.calculateSemanticSimilarity(
          messageTexts[messageTexts.length - 1],
          responseText
        );
        coherenceScores.push(responseCoherence);
      }
      
      // Promedio de coherencia
      const averageCoherence = coherenceScores.length > 0 
        ? coherenceScores.reduce((sum, score) => sum + score, 0) / coherenceScores.length
        : 0.5;
      
      return Math.max(0, Math.min(1, averageCoherence));
      
    } catch (error) {
      console.warn('Error calculando coherencia:', error);
      return 0.5; // Valor neutral en caso de error
    }
  }

  /**
   * Analiza la relevancia de la respuesta
   */
  async analyzeRelevance(messages, response) {
    if (messages.length === 0) return 0.5;

    try {
      const lastUserMessage = messages
        .slice()
        .reverse()
        .find(msg => msg.role === 'user');
      
      if (!lastUserMessage) return 0.5;
      
      const userText = lastUserMessage.parts?.[0]?.text || lastUserMessage.content || '';
      const responseText = response.parts?.[0]?.text || response.content || response;
      
      // Calcular relevancia semántica
      const semanticRelevance = await this.calculateSemanticSimilarity(userText, responseText);
      
      // Analizar relevancia por palabras clave
      const keywordRelevance = this.calculateKeywordRelevance(userText, responseText);
      
      // Analizar relevancia contextual (menciones de temas previos)
      const contextualRelevance = this.calculateContextualRelevance(messages, responseText);
      
      // Combinar métricas de relevancia
      const overallRelevance = (
        semanticRelevance * 0.5 +
        keywordRelevance * 0.3 +
        contextualRelevance * 0.2
      );
      
      return Math.max(0, Math.min(1, overallRelevance));
      
    } catch (error) {
      console.warn('Error calculando relevancia:', error);
      return 0.5;
    }
  }

  /**
   * Analiza la satisfacción implícita del usuario
   */
  analyzeSatisfaction(messages, response) {
    let satisfactionScore = 0.5; // Base neutral
    
    if (messages.length === 0) return satisfactionScore;
    
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find(msg => msg.role === 'user');
    
    if (!lastUserMessage) return satisfactionScore;
    
    const userText = (lastUserMessage.parts?.[0]?.text || lastUserMessage.content || '').toLowerCase();
    const responseText = (response.parts?.[0]?.text || response.content || response).toLowerCase();
    
    // Indicadores positivos en el mensaje del usuario
    const positiveIndicators = ['gracias', 'perfecto', 'excelente', 'bien', 'correcto', 'sí', 'ok'];
    const negativeIndicators = ['no', 'error', 'mal', 'incorrecto', 'problema', 'falla', 'no funciona'];
    
    positiveIndicators.forEach(indicator => {
      if (userText.includes(indicator)) satisfactionScore += 0.1;
    });
    
    negativeIndicators.forEach(indicator => {
      if (userText.includes(indicator)) satisfactionScore -= 0.1;
    });
    
    // Analizar longitud y completitud de la respuesta
    if (responseText.length > 100) satisfactionScore += 0.05;
    if (responseText.length > 500) satisfactionScore += 0.05;
    
    // Analizar si la respuesta incluye ejemplos o código
    if (responseText.includes('```') || responseText.includes('ejemplo')) {
      satisfactionScore += 0.1;
    }
    
    // Analizar si hay preguntas de seguimiento (indica engagement)
    if (userText.includes('?') && responseText.includes('?')) {
      satisfactionScore += 0.05;
    }
    
    return Math.max(0, Math.min(1, satisfactionScore));
  }

  /**
   * Analiza la utilización del contexto
   */
  analyzeContextUtilization(messages, contextMetadata) {
    if (!contextMetadata || messages.length === 0) return 0.5;
    
    let utilizationScore = 0;
    
    // Porcentaje de mensajes utilizados
    const originalCount = contextMetadata.originalMessageCount || messages.length;
    const optimizedCount = messages.length;
    const utilizationRatio = optimizedCount / originalCount;
    utilizationScore += utilizationRatio * 0.4;
    
    // Uso de resúmenes
    if (contextMetadata.summaryUsed) utilizationScore += 0.2;
    
    // Detección de cambio de tema
    if (contextMetadata.topicShift) utilizationScore += 0.1;
    
    // Uso de cache
    if (contextMetadata.cacheUsed) utilizationScore += 0.1;
    
    // Optimización aplicada
    if (contextMetadata.optimizationApplied) utilizationScore += 0.2;
    
    return Math.max(0, Math.min(1, utilizationScore));
  }

  /**
   * Analiza el flujo de conversación
   */
  analyzeConversationFlow(messages) {
    if (messages.length < 3) return 1.0;
    
    let flowScore = 0.5;
    
    // Analizar alternancia entre usuario y asistente
    let properAlternation = 0;
    for (let i = 1; i < messages.length; i++) {
      if (messages[i].role !== messages[i-1].role) {
        properAlternation++;
      }
    }
    
    const alternationRatio = properAlternation / (messages.length - 1);
    flowScore += alternationRatio * 0.3;
    
    // Analizar longitud promedio de mensajes
    const avgLength = messages.reduce((sum, msg) => {
      const text = msg.parts?.[0]?.text || msg.content || '';
      return sum + text.length;
    }, 0) / messages.length;
    
    // Penalizar mensajes muy cortos o muy largos
    if (avgLength > 50 && avgLength < 1000) {
      flowScore += 0.2;
    }
    
    return Math.max(0, Math.min(1, flowScore));
  }

  /**
   * Analiza la consistencia de temas
   */
  async analyzeTopicConsistency(messages) {
    if (messages.length < 3) return 1.0;
    
    try {
      // Extraer temas principales de cada mensaje
      const topics = [];
      for (const message of messages) {
        const text = message.parts?.[0]?.text || message.content || '';
        if (text.length > 20) {
          const messagTopics = await this.extractTopics(text);
          topics.push(messagTopics);
        }
      }
      
      if (topics.length < 2) return 1.0;
      
      // Calcular consistencia entre temas
      let consistencyScores = [];
      for (let i = 1; i < topics.length; i++) {
        const overlap = this.calculateTopicOverlap(topics[i-1], topics[i]);
        consistencyScores.push(overlap);
      }
      
      const avgConsistency = consistencyScores.reduce((sum, score) => sum + score, 0) / consistencyScores.length;
      return Math.max(0, Math.min(1, avgConsistency));
      
    } catch (error) {
      console.warn('Error analizando consistencia de temas:', error);
      return 0.7; // Valor por defecto optimista
    }
  }

  /**
   * Analiza la calidad de la respuesta
   */
  analyzeResponseQuality(response, messages) {
    const responseText = response.parts?.[0]?.text || response.content || response;
    let qualityScore = 0.5;
    
    // Longitud apropiada
    if (responseText.length > 50) qualityScore += 0.1;
    if (responseText.length > 200) qualityScore += 0.1;
    
    // Estructura (párrafos, listas, etc.)
    if (responseText.includes('\n') || responseText.includes('•') || responseText.includes('-')) {
      qualityScore += 0.1;
    }
    
    // Código o ejemplos
    if (responseText.includes('```') || responseText.includes('ejemplo')) {
      qualityScore += 0.1;
    }
    
    // Referencias a conversación previa
    const contextWords = ['anterior', 'mencionaste', 'como dijiste', 'siguiendo', 'continuando'];
    contextWords.forEach(word => {
      if (responseText.toLowerCase().includes(word)) {
        qualityScore += 0.05;
      }
    });
    
    return Math.max(0, Math.min(1, qualityScore));
  }

  /**
   * Detecta indicadores de error
   */
  detectErrorIndicators(messages, response) {
    const indicators = {
      contextLoss: false,
      repetition: false,
      irrelevance: false,
      incompleteness: false,
      errorMentioned: false
    };
    
    const responseText = (response.parts?.[0]?.text || response.content || response).toLowerCase();
    
    // Detectar pérdida de contexto
    if (responseText.includes('no recuerdo') || responseText.includes('no tengo información')) {
      indicators.contextLoss = true;
    }
    
    // Detectar repetición
    if (messages.length > 1) {
      const prevResponse = messages[messages.length - 2];
      if (prevResponse && prevResponse.role === 'model') {
        const prevText = (prevResponse.parts?.[0]?.text || prevResponse.content || '').toLowerCase();
        const similarity = this.calculateTextSimilarity(responseText, prevText);
        if (similarity > 0.8) {
          indicators.repetition = true;
        }
      }
    }
    
    // Detectar mención de errores
    if (responseText.includes('error') || responseText.includes('problema')) {
      indicators.errorMentioned = true;
    }
    
    // Detectar respuesta incompleta
    if (responseText.length < 20 || responseText.endsWith('...')) {
      indicators.incompleteness = true;
    }
    
    return indicators;
  }

  /**
   * Calcula la efectividad general
   */
  calculateOverallEffectiveness(analysis) {
    const weights = {
      coherence: 0.25,
      relevance: 0.25,
      satisfaction: 0.20,
      contextUtilization: 0.15,
      conversationFlow: 0.10,
      topicConsistency: 0.05
    };
    
    let effectiveness = 0;
    Object.keys(weights).forEach(metric => {
      if (analysis[metric] !== undefined) {
        effectiveness += analysis[metric] * weights[metric];
      }
    });
    
    // Penalizar por indicadores de error
    const errorPenalty = Object.values(analysis.errorIndicators || {}).filter(Boolean).length * 0.1;
    effectiveness = Math.max(0, effectiveness - errorPenalty);
    
    return Math.max(0, Math.min(1, effectiveness));
  }

  /**
   * Genera recomendaciones basadas en el análisis
   */
  generateRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.coherence < UNIFIED_CONTEXT_CONFIG.thresholds.COHERENCE_THRESHOLD) {
      recommendations.push({
        type: 'coherence',
        priority: 'high',
        message: 'Mejorar coherencia contextual - considerar resúmenes más frecuentes',
        action: 'increase_summary_frequency'
      });
    }
    
    if (analysis.relevance < UNIFIED_CONTEXT_CONFIG.thresholds.RELEVANCE_THRESHOLD) {
      recommendations.push({
        type: 'relevance',
        priority: 'high',
        message: 'Mejorar relevancia de respuestas - optimizar selección de contexto',
        action: 'optimize_context_selection'
      });
    }
    
    if (analysis.contextUtilization < 0.5) {
      recommendations.push({
        type: 'utilization',
        priority: 'medium',
        message: 'Baja utilización de contexto - revisar algoritmo de optimización',
        action: 'review_optimization_algorithm'
      });
    }
    
    if (analysis.errorIndicators.contextLoss) {
      recommendations.push({
        type: 'context_loss',
        priority: 'critical',
        message: 'Pérdida de contexto detectada - activar fallback robusto',
        action: 'activate_fallback'
      });
    }
    
    return recommendations;
  }

  /**
   * Almacena métricas de sesión
   */
  storeMetrics(sessionId, analysis) {
    if (!this.sessionMetrics.has(sessionId)) {
      this.sessionMetrics.set(sessionId, []);
    }
    
    this.sessionMetrics.get(sessionId).push(analysis);
    
    // Mantener solo las últimas 100 métricas por sesión
    const sessionData = this.sessionMetrics.get(sessionId);
    if (sessionData.length > 100) {
      this.sessionMetrics.set(sessionId, sessionData.slice(-100));
    }
  }

  /**
   * Actualiza métricas globales
   */
  updateGlobalMetrics(analysis) {
    this.globalMetrics.totalSessions++;
    
    // Actualizar promedios usando media móvil
    const alpha = 0.1; // Factor de suavizado
    this.globalMetrics.averageCoherence = 
      (1 - alpha) * this.globalMetrics.averageCoherence + alpha * analysis.coherence;
    this.globalMetrics.averageRelevance = 
      (1 - alpha) * this.globalMetrics.averageRelevance + alpha * analysis.relevance;
    this.globalMetrics.averageSatisfaction = 
      (1 - alpha) * this.globalMetrics.averageSatisfaction + alpha * analysis.satisfaction;
    this.globalMetrics.averageEffectiveness = 
      (1 - alpha) * this.globalMetrics.averageEffectiveness + alpha * analysis.overallEffectiveness;
    
    this.globalMetrics.lastUpdated = new Date().toISOString();
    
    // Almacenar en historial
    this.metricsHistory.push({
      timestamp: new Date().toISOString(),
      ...analysis
    });
    
    // Mantener solo las últimas 1000 entradas
    if (this.metricsHistory.length > 1000) {
      this.metricsHistory = this.metricsHistory.slice(-1000);
    }
  }

  /**
   * Obtiene estadísticas de efectividad
   */
  getEffectivenessStats(sessionId = null) {
    if (sessionId && this.sessionMetrics.has(sessionId)) {
      const sessionData = this.sessionMetrics.get(sessionId);
      return {
        sessionId,
        totalAnalyses: sessionData.length,
        averageEffectiveness: sessionData.reduce((sum, a) => sum + a.overallEffectiveness, 0) / sessionData.length,
        latestAnalysis: sessionData[sessionData.length - 1],
        trend: this.calculateTrend(sessionData)
      };
    }
    
    return {
      global: this.globalMetrics,
      activeSessions: this.sessionMetrics.size,
      totalAnalyses: this.metricsHistory.length,
      recentTrend: this.calculateRecentTrend()
    };
  }

  /**
   * Calcula tendencia de efectividad
   */
  calculateTrend(data) {
    if (data.length < 2) return 'stable';
    
    const recent = data.slice(-5);
    const older = data.slice(-10, -5);
    
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, a) => sum + a.overallEffectiveness, 0) / recent.length;
    const olderAvg = older.reduce((sum, a) => sum + a.overallEffectiveness, 0) / older.length;
    
    const diff = recentAvg - olderAvg;
    
    if (diff > 0.1) return 'improving';
    if (diff < -0.1) return 'declining';
    return 'stable';
  }

  /**
   * Calcula tendencia reciente global
   */
  calculateRecentTrend() {
    const recentData = this.metricsHistory.slice(-20);
    return this.calculateTrend(recentData);
  }

  /**
   * Inicia análisis periódico
   */
  startPeriodicAnalysis() {
    const interval = UNIFIED_CONTEXT_CONFIG.effectiveness.ANALYSIS_INTERVALS.PERIODIC;
    
    setInterval(() => {
      this.performPeriodicAnalysis();
    }, interval);
  }

  /**
   * Realiza análisis periódico
   */
  performPeriodicAnalysis() {
    try {
      // Limpiar métricas antiguas
      this.cleanupOldMetrics();
      
      // Generar alertas si es necesario
      this.checkAlertThresholds();
      
      // Exportar métricas si es necesario
      this.exportMetricsIfNeeded();
      
    } catch (error) {
      console.error('Error en análisis periódico:', error);
    }
  }

  /**
   * Limpia métricas antiguas
   */
  cleanupOldMetrics() {
    const retentionTime = UNIFIED_CONTEXT_CONFIG.metrics.RETENTION_DAYS * 24 * 60 * 60 * 1000;
    const cutoffTime = Date.now() - retentionTime;
    
    // Limpiar historial
    this.metricsHistory = this.metricsHistory.filter(metric => {
      return new Date(metric.timestamp).getTime() > cutoffTime;
    });
    
    // Limpiar sesiones inactivas
    for (const [sessionId, data] of this.sessionMetrics.entries()) {
      const lastActivity = new Date(data[data.length - 1]?.timestamp || 0).getTime();
      if (lastActivity < cutoffTime) {
        this.sessionMetrics.delete(sessionId);
      }
    }
  }

  /**
   * Verifica umbrales de alerta
   */
  checkAlertThresholds() {
    const thresholds = UNIFIED_CONTEXT_CONFIG.metrics.ALERT_THRESHOLDS;
    const alerts = [];
    
    if (this.globalMetrics.averageCoherence < thresholds.LOW_COHERENCE) {
      alerts.push({
        type: 'low_coherence',
        severity: 'warning',
        message: `Coherencia promedio baja: ${this.globalMetrics.averageCoherence.toFixed(2)}`
      });
    }
    
    if (this.globalMetrics.averageRelevance < thresholds.LOW_RELEVANCE) {
      alerts.push({
        type: 'low_relevance',
        severity: 'warning',
        message: `Relevancia promedio baja: ${this.globalMetrics.averageRelevance.toFixed(2)}`
      });
    }
    
    if (alerts.length > 0) {
      console.warn('🚨 Alertas de efectividad del contexto:', alerts);
    }
  }

  /**
   * Exporta métricas si es necesario
   */
  exportMetricsIfNeeded() {
    // Implementar exportación de métricas según necesidades
    // Por ejemplo, enviar a sistema de monitoreo externo
  }

  // === MÉTODOS AUXILIARES ===

  async calculateSemanticSimilarity(text1, text2) {
    try {
      // Usar servicio de embeddings si está disponible
      if (embeddingsService && typeof embeddingsService.calculateSimilarity === 'function') {
        return await embeddingsService.calculateSimilarity(text1, text2);
      }
      
      // Fallback a similitud básica
      return this.calculateTextSimilarity(text1, text2);
    } catch (error) {
      return this.calculateTextSimilarity(text1, text2);
    }
  }

  calculateTextSimilarity(text1, text2) {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return union.length > 0 ? intersection.length / union.length : 0;
  }

  calculateKeywordRelevance(userText, responseText) {
    const userWords = userText.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    const responseWords = responseText.toLowerCase().split(/\s+/);
    
    const matches = userWords.filter(word => responseWords.includes(word));
    return userWords.length > 0 ? matches.length / userWords.length : 0;
  }

  calculateContextualRelevance(messages, responseText) {
    if (messages.length < 2) return 0.5;
    
    // Extraer temas de mensajes anteriores
    const contextTopics = [];
    messages.slice(0, -1).forEach(msg => {
      const text = msg.parts?.[0]?.text || msg.content || '';
      const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 4);
      contextTopics.push(...words);
    });
    
    const uniqueTopics = [...new Set(contextTopics)];
    const responseWords = responseText.toLowerCase().split(/\s+/);
    
    const topicMentions = uniqueTopics.filter(topic => responseWords.includes(topic));
    return uniqueTopics.length > 0 ? topicMentions.length / uniqueTopics.length : 0.5;
  }

  async extractTopics(text) {
    // Implementación básica de extracción de temas
    const words = text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 4)
      .filter(word => !['este', 'esta', 'esto', 'para', 'como', 'cuando', 'donde'].includes(word));
    
    return [...new Set(words)].slice(0, 5); // Top 5 temas únicos
  }

  calculateTopicOverlap(topics1, topics2) {
    const intersection = topics1.filter(topic => topics2.includes(topic));
    const union = [...new Set([...topics1, ...topics2])];
    
    return union.length > 0 ? intersection.length / union.length : 0;
  }

  getBasicAnalysis(sessionId, messages, response) {
    return {
      sessionId,
      timestamp: new Date().toISOString(),
      coherence: 0.5,
      relevance: 0.5,
      satisfaction: 0.5,
      contextUtilization: 0.5,
      conversationFlow: 0.5,
      topicConsistency: 0.5,
      responseQuality: 0.5,
      overallEffectiveness: 0.5,
      errorIndicators: {},
      recommendations: [],
      error: 'Análisis básico debido a error en procesamiento'
    };
  }
}

// Crear instancia singleton
const contextEffectivenessService = new ContextEffectivenessService();

export default contextEffectivenessService;