/**
 * Context Middleware - Integración del Unified Context Manager
 * 
 * Este middleware integra el nuevo sistema de gestión unificada de contexto
 * con el API existente, proporcionando mejoras inmediatas en la coherencia
 * de conversaciones largas.
 */

import unifiedContextManager from '../services/unified-context-manager.js';
import { UNIFIED_CONTEXT_CONFIG } from '../config/unified-context-config.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware principal de contexto
 * Procesa y optimiza el contexto antes de enviarlo al servicio de Gemini
 */
export async function contextMiddleware(req, res, next) {
  try {
    // Generar IDs de sesión y usuario si no existen
    const sessionId = req.headers['x-session-id'] || req.body.sessionId || uuidv4();
    const userId = req.headers['x-user-id'] || req.body.userId || null;
    
    // Almacenar IDs para uso posterior
    req.context = {
      sessionId,
      userId,
      originalMessages: req.body.messages || [],
      processedAt: new Date().toISOString()
    };
    
    // Si hay mensajes, procesarlos con el context manager
    if (req.body.messages && Array.isArray(req.body.messages) && req.body.messages.length > 0) {
      
      console.log(`🎯 Context Middleware: Procesando ${req.body.messages.length} mensajes para sesión ${sessionId}`);
      
      // Procesar contexto con el unified manager
      const contextResult = await unifiedContextManager.manageConversation(
        sessionId,
        req.body.messages,
        userId,
        {
          model: req.body.model || 'gemini-2.5-flash-lite',
          temperature: req.body.temperature || 0.8,
          maxTokens: req.body.maxTokens || 1000,
          stream: req.body.stream || false
        }
      );
      
      // Actualizar el body con mensajes optimizados
      req.body.messages = contextResult.optimizedMessages;
      req.body._contextMetadata = {
        ...contextResult.metadata,
        topicShift: contextResult.topicShift,
        conversationContext: contextResult.conversationContext
      };
      
      // Log de optimización
      console.log(`✅ Context Middleware: Optimización completada`);
      console.log(`   - Mensajes originales: ${req.context.originalMessages.length}`);
      console.log(`   - Mensajes optimizados: ${req.body.messages.length}`);
      console.log(`   - Cambio de tema detectado: ${contextResult.topicShift}`);
      
      // Si hubo cambio de tema, agregar nota al usuario
      if (contextResult.topicShift) {
        req.body._contextMetadata.topicShiftNotification = {
          type: 'topic_shift',
          message: 'He notado que has cambiado de tema. ¿Te gustaría que continuemos con el nuevo tema o prefieres retomar la conversación anterior?',
          timestamp: new Date().toISOString()
        };
      }
    }
    
    // Agregar headers de respuesta con información de contexto
    res.setHeader('X-Session-ID', sessionId);
    res.setHeader('X-Context-Processed', 'true');
    
    next();
    
  } catch (error) {
    console.error('❌ Error en contextMiddleware:', error);
    
    // No bloquear la petición si hay error, solo loggear
    req.body._contextError = error.message;
    
    // Agregar header de error para debugging
    res.setHeader('X-Context-Error', error.message);
    
    next();
  }
}

/**
 * Middleware para enriquecer respuestas con contexto adicional
 */
export function contextEnrichmentMiddleware(req, res, next) {
  const originalJson = res.json;
  
  res.json = function(data) {
    try {
      // Agregar información de contexto a la respuesta si existe
      if (req.context && req.body._contextMetadata) {
        data._context = {
          sessionId: req.context.sessionId,
          processedAt: req.context.processedAt,
          metadata: req.body._contextMetadata,
          optimization: {
            originalCount: req.context.originalMessages.length,
            optimizedCount: req.body.messages?.length || 0,
            reductionRate: ((req.context.originalMessages.length - (req.body.messages?.length || 0)) / req.context.originalMessages.length * 100).toFixed(1) + '%'
          }
        };
        
        // Si hubo cambio de tema, agregar notificación
        if (req.body._contextMetadata.topicShiftNotification) {
          data._context.topicShift = req.body._contextMetadata.topicShiftNotification;
        }
        
        // Agregar sugerencias de contexto si es apropiado
        if (req.body.messages && req.body.messages.length > 10) {
          data._context.suggestions = generateContextSuggestions(req.body._contextMetadata);
        }
      }
      
      // Si hubo error en procesamiento, agregar nota
      if (req.body._contextError) {
        data._contextWarning = {
          type: 'context_processing_error',
          message: 'Hubo un problema procesando el contexto, pero tu mensaje fue procesado normalmente.',
          error: req.body._contextError
        };
      }
      
    } catch (error) {
      console.error('Error enriqueciendo respuesta:', error);
    }
    
    // Llamar al método original
    return originalJson.call(this, data);
  };
  
  next();
}

/**
 * Middleware para manejar continuidad de sesiones
 */
export async function sessionContinuityMiddleware(req, res, next) {
  try {
    const sessionId = req.headers['x-session-id'] || req.body.sessionId;
    
    if (sessionId) {
      // Verificar si existe contexto previo para esta sesión
      const contextStats = await unifiedContextManager.getStats();
      const hasPreviousContext = contextStats.activeConversations > 0;
      
      if (hasPreviousContext) {
        // Agregar información de continuidad
        req.body._sessionContinuity = {
          sessionId,
          hasPreviousContext: true,
          contextAge: await getSessionContextAge(sessionId),
          suggestions: [
            '¿Te gustaría continuar donde lo dejamos?',
            '¿Hay algo más sobre lo que estábamos discutiendo?',
            '¿Prefieres empezar una nueva conversación?'
          ]
        };
      }
    }
    
    next();
    
  } catch (error) {
    console.error('Error en sessionContinuityMiddleware:', error);
    next(); // No bloquear la petición
  }
}

/**
 * Función auxiliar para generar sugerencias de contexto
 */
function generateContextSuggestions(metadata) {
  const suggestions = [];
  
  if (metadata.messageCount > 20) {
    suggestions.push('Esta conversación es bastante larga. ¿Te gustaría que resuma lo más importante?');
  }
  
  if (metadata.topicShift) {
    suggestions.push('He notado un cambio de tema. ¿Te gustaría que organice la información por temas?');
  }
  
  if (metadata.contextSize > 8000) {
    suggestions.push('El contexto es extenso. ¿Prefieres que me enfoque en los puntos más recientes?');
  }
  
  return suggestions;
}

/**
 * Función auxiliar para obtener la edad del contexto de sesión
 */
async function getSessionContextAge(sessionId) {
  // Esta función se puede expandir para obtener información real del contexto
  return 'recent'; // Placeholder
}

/**
 * Middleware para debugging y monitoreo de contexto
 */
export function contextDebugMiddleware(req, res, next) {
  const startTime = Date.now();
  
  // Log de entrada
  console.log(`🔍 Context Debug: ${req.method} ${req.url}`);
  console.log(`   Session ID: ${req.headers['x-session-id'] || 'new'}`);
  console.log(`   Messages: ${req.body.messages?.length || 0}`);
  
  // Interceptar respuesta para loggear tiempo de procesamiento
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`   Response time: ${duration}ms`);
    console.log(`   Status: ${res.statusCode}`);
    
    if (req.context) {
      console.log(`   Context processed: ${res.getHeader('X-Context-Processed') === 'true'}`);
    }
  });
  
  next();
}

/**
 * Handler para obtener estadísticas de contexto
 */
export async function getContextStatsHandler(req, res) {
  try {
    const stats = await unifiedContextManager.getStats();
    
    res.json({
      success: true,
      stats,
      config: UNIFIED_CONTEXT_CONFIG,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error obteniendo estadísticas de contexto:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas',
      message: error.message
    });
  }
}

/**
 * Handler para limpiar contexto manualmente
 */
export async function clearContextHandler(req, res) {
  try {
    const { sessionId, userId } = req.body;
    
    if (!sessionId && !userId) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere sessionId o userId'
      });
    }
    
    let result;
    if (sessionId) {
      // Limpiar contexto específico de sesión
      result = await unifiedContextManager.clearSessionContext(sessionId);
    } else {
      // Limpiar todo el contexto
      result = await unifiedContextManager.clearAllContexts();
    }
    
    res.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error limpiando contexto:', error);
    res.status(500).json({
      success: false,
      error: 'Error limpiando contexto',
      message: error.message
    });
  }
}

// Exportar todos los middlewares
export default {
  contextMiddleware,
  contextEnrichmentMiddleware,
  sessionContinuityMiddleware,
  contextDebugMiddleware,
  getContextStatsHandler,
  clearContextHandler
};