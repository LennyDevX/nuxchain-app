// Configuración mejorada para el manejo de contexto en conversaciones largas
export const CONTEXT_CONFIG = {
  // Límites de contexto
  limits: {
    MAX_MESSAGES: 50,              // Máximo de mensajes en conversación activa
    MAX_TOKENS: 30000,             // Máximo de tokens totales
    MAX_CHARACTERS: 120000,        // Máximo de caracteres
    CONTEXT_WINDOW: 10000,         // Ventana de contexto para el modelo
    SUMMARY_THRESHOLD: 8000,       // Umbral para generar resúmenes
    TRUNCATION_CHUNK: 2000         // Tamaño de chunks para truncamiento inteligente
  },

  // Umbrales de decisión
  thresholds: {
    MIN_MESSAGES_FOR_SUMMARY: 3,   // Mínimo de mensajes para generar resumen
    MIN_TOKENS_FOR_CACHE: 4000,    // Mínimo de tokens para usar caché
    IMPORTANCE_SCORE_CUTOFF: 0.3,  // Puntuación mínima de importancia
    TOPIC_SHIFT_THRESHOLD: 0.6,   // Umbral para detectar cambio de tema
    RELEVANCE_THRESHOLD: 0.4       // Umbral de relevancia para mensajes
  },

  // Configuración de caché
  cache: {
    TTL: 60 * 60 * 1000,           // 1 hora en milisegundos
    MAX_SIZE: 100,                 // Máximo de entradas en caché
    CLEANUP_INTERVAL: 30 * 60 * 1000, // 30 minutos
    SCORE_DECAY: 0.95,             // Factor de decaimiento de puntuación
    MIN_SCORE: 0.1                 // Puntuación mínima para mantener en caché
  },

  // Configuración de modelos
  models: {
    CONTEXT_MODEL: 'gemini-2.5-flash-lite',
  SUMMARY_MODEL: 'gemini-2.5-flash-lite',
    EMBEDDING_MODEL: 'text-embedding-004',
    MAX_RETRIES: 3,
    TIMEOUT: 30000
  },

  // Optimizaciones de memoria
  memory: {
    COMPRESSION_RATIO: 0.7,        // Ratio de compresión para resúmenes
    SEMANTIC_PRESERVATION: 0.8,    // Preservación semántica mínima
    KEYWORD_EXTRACTION: true,      // Extraer palabras clave
    ENTITY_RECOGNITION: true      // Reconocer entidades importantes
  },

  // Configuración de streaming
  streaming: {
    CHUNK_SIZE: 1024,              // Tamaño de chunks para streaming
    BUFFER_SIZE: 4096,              // Tamaño del buffer
    MAX_STREAMING_TIME: 120000,   // 2 minutos máximo
    HEARTBEAT_INTERVAL: 5000      // Intervalo de heartbeat
  },

  // Mensajes del sistema mejorados
  systemInstructions: {
    CONTEXT_PRESERVATION: `Eres un asistente especializado en Nuxchain. Mantén el contexto de la conversación y referencias anteriores.
Cuando respondas:
1. Reconoce el tema principal de la conversación
2. Conecta con información previamente discutida
3. Proporciona respuestas coherentes y contextualmente relevantes
4. Si el usuario cambia de tema, indícalo suavemente
5. Mantén un hilo conductor en conversaciones largas`,

    SUMMARY_GENERATION: `Genera un resumen conciso que preserve:
1. Los temas principales discutidos
2. Las decisiones o conclusiones importantes
3. Las acciones pendientes o próximos pasos
4. Información técnica crítica
5. Preferencias o configuraciones del usuario

El resumen debe ser útil para continuar la conversación posteriormente.`,

    TOPIC_DETECTION: `Analiza el contenido y determina:
1. Si hay un cambio significativo de tema
2. La intención del usuario (pregunta, acción, información)
3. Entidades importantes mencionadas
4. El nivel de urgencia o importancia
5. Relación con temas anteriores`
  }
};

// Funciones auxiliares para la configuración
export const ContextUtils = {
  // Calcular el tamaño del contexto en tokens (estimación)
  estimateTokens(text) {
    return Math.ceil(text.length / 4);
  },

  // Determinar si se necesita resumen
  shouldSummarize(messages, currentTokens) {
    const messageCount = messages.length;
    const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    
    return messageCount >= CONTEXT_CONFIG.thresholds.MIN_MESSAGES_FOR_SUMMARY &&
           (currentTokens > CONTEXT_CONFIG.limits.SUMMARY_THRESHOLD || 
            totalChars > CONTEXT_CONFIG.limits.MAX_CHARACTERS * 0.8);
  },

  // Determinar si se debe usar caché
  shouldUseCache(messages, tokens) {
    return messages.length >= 4 || tokens > CONTEXT_CONFIG.thresholds.MIN_TOKENS_FOR_CACHE;
  },

  // Calcular puntuación de importancia de un mensaje
  calculateImportance(message, conversationContext) {
    let score = 0.5; // Puntuación base
    
    // Factor de rol (usuario tiene más peso)
    if (message.role === 'user') score += 0.2;
    
    // Factor de longitud (mensajes muy cortos o muy largos)
    const length = message.content.length;
    if (length < 10) score -= 0.1;
    if (length > 500) score += 0.1;
    
    // Factor de palabras clave técnicas
    const technicalWords = ['error', 'configuración', 'código', 'función', 'implementación'];
    const contentLower = message.content.toLowerCase();
    technicalWords.forEach(word => {
      if (contentLower.includes(word)) score += 0.05;
    });
    
    // Factor de preguntas
    if (contentLower.includes('?')) score += 0.1;
    
    return Math.min(1.0, Math.max(0.0, score));
  },

  // Detectar cambio de tema
  detectTopicShift(currentMessage, previousMessages) {
    if (previousMessages.length === 0) return false;
    
    const currentContent = currentMessage.content.toLowerCase();
    const previousContent = previousMessages.slice(-3).map(m => m.content.toLowerCase()).join(' ');
    
    // Análisis simple de similitud (puede mejorarse con embeddings)
    const commonWords = currentContent.split(' ').filter(word => 
      word.length > 3 && previousContent.includes(word)
    );
    
    const similarity = commonWords.length / Math.max(1, currentContent.split(' ').length);
    return similarity < CONTEXT_CONFIG.thresholds.TOPIC_SHIFT_THRESHOLD;
  }
};

export default CONTEXT_CONFIG;