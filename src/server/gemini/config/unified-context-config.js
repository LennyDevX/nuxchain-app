/**
 * Configuración Unificada de Contexto - NuxChain App
 * 
 * Este archivo centraliza todas las configuraciones relacionadas con el manejo
 * de contexto, reemplazando las configuraciones distribuidas en múltiples archivos.
 */

// === CONFIGURACIÓN PRINCIPAL DE CONTEXTO ===
export const UNIFIED_CONTEXT_CONFIG = {
  // Límites de contexto
  limits: {
    MAX_MESSAGES: 50,              // Máximo de mensajes en conversación activa
    MAX_TOKENS: 30000,             // Máximo de tokens totales
    MAX_CHARACTERS: 120000,        // Máximo de caracteres (aumentado de 12000)
    CONTEXT_WINDOW: 10000,         // Ventana de contexto para el modelo
    SUMMARY_THRESHOLD: 8000,       // Umbral para generar resúmenes
    TRUNCATION_CHUNK: 2000,        // Tamaño de chunks para truncamiento inteligente
    MAX_DOCUMENTS: 10,             // Máximo de documentos en contexto
    CACHE_TTL: 24 * 60 * 60 * 1000 // TTL del cache (24 horas)
  },

  // Umbrales de decisión
  thresholds: {
    MIN_MESSAGES_FOR_SUMMARY: 3,   // Mínimo de mensajes para generar resumen
    MIN_TOKENS_FOR_CACHE: 4000,    // Mínimo de tokens para usar caché
    IMPORTANCE_SCORE_CUTOFF: 0.3,  // Puntuación mínima de importancia
    TOPIC_SHIFT_THRESHOLD: 0.65,   // Umbral para detectar cambio de tema
    RELEVANCE_THRESHOLD: 0.4,      // Umbral de relevancia para mensajes
    SEMANTIC_THRESHOLD: 0.85,      // Umbral de similitud semántica
    SUMMARY_TRIGGER: 25,           // Crear resumen después de N mensajes
    COHERENCE_THRESHOLD: 0.7,      // Umbral de coherencia contextual
    EFFECTIVENESS_THRESHOLD: 0.6   // Umbral de efectividad del contexto
  },

  // Configuración de caché
  cache: {
    TTL: 60 * 60 * 1000,           // 1 hora en milisegundos
    MAX_SIZE: 100,                 // Máximo de entradas en caché
    CLEANUP_INTERVAL: 30 * 60 * 1000, // 30 minutos
    SCORE_DECAY: 0.95,             // Factor de decaimiento de puntuación
    MIN_SCORE: 0.1,                // Puntuación mínima para mantener en caché
    COMPRESSION_ENABLED: true,     // Habilitar compresión de cache
    SMART_EVICTION: true           // Evicción inteligente basada en uso
  },

  // Configuración de modelos
  models: {
    CONTEXT_MODEL: 'gemini-2.5-flash-lite',
    SUMMARY_MODEL: 'gemini-2.5-flash-lite',
  EMBEDDING_MODEL: 'text-embedding-004',
  FALLBACK_MODEL: 'gemini-2.5-flash-lite',
    MAX_RETRIES: 3,
    TIMEOUT: 30000,
    RETRY_DELAY: 1000              // Delay entre reintentos
  },

  // Optimizaciones de memoria
  memory: {
    COMPRESSION_RATIO: 0.7,        // Ratio de compresión para resúmenes
    SEMANTIC_PRESERVATION: 0.8,    // Preservación semántica mínima
    KEYWORD_EXTRACTION: true,      // Extraer palabras clave
    ENTITY_RECOGNITION: true,      // Reconocer entidades importantes
    GARBAGE_COLLECTION: true,      // Limpieza automática de memoria
    MAX_MEMORY_USAGE: 500 * 1024 * 1024 // 500MB límite de memoria
  },

  // Configuración de streaming
  streaming: {
    CHUNK_SIZE: 1024,              // Tamaño de chunks para streaming
    BUFFER_SIZE: 4096,             // Tamaño del buffer
    MAX_STREAMING_TIME: 120000,    // 2 minutos máximo
    HEARTBEAT_INTERVAL: 5000,      // Intervalo de heartbeat
    SEMANTIC_CHUNKING: true,       // Chunking semántico habilitado
    CONTEXTUAL_PAUSES: true,       // Pausas contextuales
    VARIABLE_SPEED: true           // Velocidad variable
  },

  // Niveles de persistencia
  persistence: {
    WORKING: 5 * 60 * 1000,             // 5 minutos
    SHORT_TERM: 60 * 60 * 1000,         // 1 hora  
    LONG_TERM: 7 * 24 * 60 * 60 * 1000, // 7 días
    PERMANENT: null,                     // Persistente
    USER_CONTEXT: 30 * 24 * 60 * 60 * 1000 // 30 días para contexto de usuario
  },

  // Configuración de métricas avanzadas
  metrics: {
    ENABLED: true,
    TRACK_COHERENCE: true,         // Rastrear coherencia contextual
    TRACK_RELEVANCE: true,         // Rastrear relevancia de respuestas
    TRACK_SATISFACTION: true,      // Rastrear satisfacción del usuario
    TRACK_EFFECTIVENESS: true,     // Rastrear efectividad del contexto
    SAMPLING_RATE: 0.1,           // 10% de muestreo para métricas pesadas
    RETENTION_DAYS: 30,           // Retener métricas por 30 días
    EXPORT_INTERVAL: 24 * 60 * 60 * 1000, // Exportar métricas cada 24h
    ALERT_THRESHOLDS: {
      LOW_COHERENCE: 0.5,
      LOW_RELEVANCE: 0.4,
      LOW_SATISFACTION: 0.6,
      HIGH_ERROR_RATE: 0.1
    }
  },

  // Configuración de fallback robusto
  fallback: {
    ENABLED: true,
    LEVELS: {
      LEVEL_1: 'context_optimization',  // Optimizar contexto existente
      LEVEL_2: 'context_compression',   // Comprimir contexto
      LEVEL_3: 'context_summarization', // Resumir contexto
      LEVEL_4: 'basic_context',         // Contexto básico
      LEVEL_5: 'no_context'            // Sin contexto (último recurso)
    },
    RETRY_STRATEGIES: {
      EXPONENTIAL_BACKOFF: true,
      MAX_RETRIES: 5,
      BASE_DELAY: 1000,
      MAX_DELAY: 30000
    },
    DEGRADATION_THRESHOLDS: {
      ERROR_RATE: 0.3,              // 30% de errores para degradar
      RESPONSE_TIME: 10000,         // 10s para degradar
      MEMORY_USAGE: 0.8             // 80% de memoria para degradar
    }
  },

  // Mensajes del sistema mejorados
  systemInstructions: {
    CONTEXT_PRESERVATION: `Eres un asistente especializado en Nuxchain. Mantén el contexto de la conversación y referencias anteriores.
Cuando respondas:
1. Reconoce el tema principal de la conversación
2. Conecta con información previamente discutida
3. Proporciona respuestas coherentes y contextualmente relevantes
4. Si el usuario cambia de tema, indícalo suavemente
5. Mantén un hilo conductor en conversaciones largas
6. Adapta tu estilo según el contexto del usuario`,

    SUMMARY_GENERATION: `Genera un resumen conciso que preserve:
1. Los temas principales discutidos
2. Las decisiones o conclusiones importantes
3. Las acciones pendientes o próximos pasos
4. Información técnica crítica
5. Preferencias del usuario identificadas
6. Contexto emocional de la conversación`,

    FALLBACK_INSTRUCTIONS: `En caso de problemas con el contexto:
1. Mantén la coherencia básica de la conversación
2. Solicita clarificación si es necesario
3. Usa el contexto disponible de manera eficiente
4. Informa sutilmente sobre limitaciones temporales
5. Prioriza la experiencia del usuario`,

    ERROR_RECOVERY: `Si hay errores en el procesamiento:
1. Continúa la conversación sin interrupciones
2. Usa contexto alternativo disponible
3. Solicita información adicional si es crítica
4. Mantén un tono profesional y útil
5. Registra el problema para mejoras futuras`
  },

  // Configuración de análisis de efectividad
  effectiveness: {
    METRICS: {
      CONTEXT_UTILIZATION: 'percentage_of_context_used',
      RESPONSE_RELEVANCE: 'relevance_to_previous_messages',
      TOPIC_COHERENCE: 'consistency_across_conversation',
      USER_SATISFACTION: 'implicit_satisfaction_signals',
      CONVERSATION_FLOW: 'natural_conversation_progression'
    },
    ANALYSIS_INTERVALS: {
      REAL_TIME: 0,                 // Análisis en tiempo real
      PERIODIC: 5 * 60 * 1000,      // Cada 5 minutos
      SESSION_END: 'on_session_end', // Al finalizar sesión
      DAILY: 24 * 60 * 60 * 1000    // Análisis diario
    },
    IMPROVEMENT_TRIGGERS: {
      LOW_EFFECTIVENESS: 0.5,
      CONTEXT_OVERLOAD: 0.9,
      FREQUENT_ERRORS: 0.2
    }
  }
};

// === UTILIDADES DE CONFIGURACIÓN ===
export class UnifiedContextUtils {
  /**
   * Valida si los mensajes requieren procesamiento de contexto
   */
  static shouldProcessContext(messages) {
    if (!Array.isArray(messages)) return false;
    return messages.length >= UNIFIED_CONTEXT_CONFIG.thresholds.MIN_MESSAGES_FOR_SUMMARY;
  }

  /**
   * Determina si se debe usar caché
   */
  static shouldUseCache(messages, tokens) {
    return messages.length >= 4 || tokens > UNIFIED_CONTEXT_CONFIG.thresholds.MIN_TOKENS_FOR_CACHE;
  }

  /**
   * Calcula puntuación de importancia de un mensaje
   */
  static calculateImportance(message, conversationContext = {}) {
    let score = 0.5; // Puntuación base
    
    // Factor de rol (usuario tiene más peso)
    if (message.role === 'user') score += 0.2;
    
    // Factor de longitud
    const content = message.parts?.[0]?.text || message.content || '';
    const length = content.length;
    if (length < 10) score -= 0.1;
    if (length > 500) score += 0.1;
    
    // Factor de palabras clave técnicas
    const technicalWords = ['error', 'configuración', 'código', 'función', 'implementación', 'nuxchain', 'nft', 'staking'];
    const contentLower = content.toLowerCase();
    technicalWords.forEach(word => {
      if (contentLower.includes(word)) score += 0.05;
    });
    
    // Factor de preguntas
    if (contentLower.includes('?')) score += 0.1;
    
    // Factor de contexto previo
    if (conversationContext.keyTopics) {
      conversationContext.keyTopics.forEach(topic => {
        if (contentLower.includes(topic.toLowerCase())) {
          score += 0.1;
        }
      });
    }
    
    return Math.min(1.0, Math.max(0.0, score));
  }

  /**
   * Determina el nivel de fallback apropiado
   */
  static determineFallbackLevel(error, metrics = {}) {
    const { fallback } = UNIFIED_CONTEXT_CONFIG;
    
    if (metrics.errorRate > fallback.DEGRADATION_THRESHOLDS.ERROR_RATE) {
      return fallback.LEVELS.LEVEL_4; // Contexto básico
    }
    
    if (metrics.responseTime > fallback.DEGRADATION_THRESHOLDS.RESPONSE_TIME) {
      return fallback.LEVELS.LEVEL_2; // Compresión
    }
    
    if (metrics.memoryUsage > fallback.DEGRADATION_THRESHOLDS.MEMORY_USAGE) {
      return fallback.LEVELS.LEVEL_3; // Resumen
    }
    
    return fallback.LEVELS.LEVEL_1; // Optimización
  }

  /**
   * Obtiene configuración específica por entorno
   */
  static getEnvironmentConfig(environment = 'development') {
    const baseConfig = { ...UNIFIED_CONTEXT_CONFIG };
    
    if (environment === 'production') {
      // Configuración optimizada para producción
      baseConfig.limits.MAX_MESSAGES = 40;
      baseConfig.cache.TTL = 2 * 60 * 60 * 1000; // 2 horas
      baseConfig.metrics.SAMPLING_RATE = 0.05; // 5% en producción
    } else if (environment === 'development') {
      // Configuración para desarrollo
      baseConfig.metrics.SAMPLING_RATE = 1.0; // 100% en desarrollo
      baseConfig.fallback.RETRY_STRATEGIES.MAX_RETRIES = 2;
    }
    
    return baseConfig;
  }

  /**
   * Valida la configuración
   */
  static validateConfig(config = UNIFIED_CONTEXT_CONFIG) {
    const errors = [];
    
    if (config.limits.MAX_MESSAGES < 1) {
      errors.push('MAX_MESSAGES debe ser mayor a 0');
    }
    
    if (config.thresholds.SEMANTIC_THRESHOLD < 0 || config.thresholds.SEMANTIC_THRESHOLD > 1) {
      errors.push('SEMANTIC_THRESHOLD debe estar entre 0 y 1');
    }
    
    if (config.cache.TTL < 1000) {
      errors.push('Cache TTL debe ser al menos 1 segundo');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// === EXPORTACIONES ===
export default UNIFIED_CONTEXT_CONFIG;

// Mantener compatibilidad con nombres anteriores
export const CONTEXT_CONFIG = UNIFIED_CONTEXT_CONFIG;
export const ContextUtils = UnifiedContextUtils;

// Configuración específica para diferentes servicios
export const CACHE_CONFIG = UNIFIED_CONTEXT_CONFIG.cache;
export const STREAMING_CONFIG = UNIFIED_CONTEXT_CONFIG.streaming;
export const METRICS_CONFIG = UNIFIED_CONTEXT_CONFIG.metrics;
export const FALLBACK_CONFIG = UNIFIED_CONTEXT_CONFIG.fallback;