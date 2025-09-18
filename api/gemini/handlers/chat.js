/**
 * Handler de Chat Optimizado - API Gemini
 * Maneja operaciones de chat con arquitectura modular
 */

import { generateContent, functionCalling } from '../../../src/server/controllers/gemini-controller.js';
import streamingController from '../../../src/server/controllers/streaming-controller.js';

// === CONFIGURACIÓN DEL HANDLER ===

const chatConfig = {
  defaultModel: 'gemini-2.5-flash',
  maxTokens: 2048,
  temperature: 0.7,
  supportedMethods: ['GET', 'POST', 'OPTIONS'],
  enableStreaming: true,
  enableTools: true,
  timeout: 30000 // 30 segundos
};

// === FUNCIONES AUXILIARES ===

/**
 * Valida la configuración del chat
 */
function validateChatConfig(body) {
  const errors = [];
  
  if (body.temperature && (body.temperature < 0 || body.temperature > 2)) {
    errors.push('Temperature debe estar entre 0 y 2');
  }
  
  if (body.maxTokens && (body.maxTokens < 1 || body.maxTokens > 8192)) {
    errors.push('maxTokens debe estar entre 1 y 8192');
  }
  
  if (body.model && !['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-pro', 'gemini-1.5-pro'].includes(body.model)) {
    errors.push('Modelo no soportado');
  }
  
  return errors;
}

/**
 * Prepara los parámetros del chat
 */
function prepareChatParams(body) {
  return {
    model: body.model || chatConfig.defaultModel,
    temperature: body.temperature || chatConfig.temperature,
    maxTokens: body.maxTokens || chatConfig.maxTokens,
    messages: body.messages || [],
    stream: body.stream || false,
    useTools: body.useTools || false,
    enabledTools: body.enabledTools || [],
    systemPrompt: body.systemPrompt || null
  };
}

/**
 * Maneja timeouts de requests
 */
function withTimeout(promise, timeoutMs = chatConfig.timeout) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
}

// === HANDLERS ESPECÍFICOS ===

/**
 * Handler para chat normal (sin streaming)
 */
async function handleNormalChat(req, res) {
  try {
    const params = prepareChatParams(req.validatedBody);
    
    // Agregar métricas de inicio
    const startTime = Date.now();
    req.metrics = { startTime, type: 'normal_chat' };
    
    // Ejecutar con timeout
    const result = await withTimeout(generateContent(req, res));
    
    // Agregar métricas de finalización
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Si la respuesta ya fue enviada por generateContent, no hacer nada más
    if (res.headersSent) {
      return;
    }
    
    return res.json({
      ...result,
      metadata: {
        model: params.model,
        responseTime,
        cached: req.fromCache || false,
        requestId: req.requestId
      }
    });
    
  } catch (error) {
    console.error('Error en chat normal:', error);
    
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message,
        requestId: req.requestId
      });
    }
  }
}

/**
 * Handler para chat con streaming
 */
async function handleStreamingChat(req, res) {
  try {
    const params = prepareChatParams(req.validatedBody);
    
    // Configurar headers para streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Agregar métricas de inicio
    const startTime = Date.now();
    req.metrics = { startTime, type: 'streaming_chat' };
    
    // Ejecutar streaming con timeout
    await withTimeout(streamingController(req, res));
    
  } catch (error) {
    console.error('Error en streaming chat:', error);
    
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Error en streaming',
        message: error.message,
        requestId: req.requestId
      });
    } else {
      // Enviar error a través del stream
      res.write(`data: ${JSON.stringify({
        error: 'Error en streaming',
        message: error.message
      })}\n\n`);
      res.end();
    }
  }
}

/**
 * Handler para function calling
 */
async function handleFunctionCalling(req, res) {
  try {
    const params = prepareChatParams(req.validatedBody);
    
    // Validar que se especificaron herramientas
    if (!params.enabledTools || params.enabledTools.length === 0) {
      return res.status(400).json({
        error: 'Herramientas requeridas',
        message: 'Especifica al menos una herramienta en enabledTools',
        availableTools: ['search', 'calculator', 'urlContext', 'webScraper']
      });
    }
    
    // Agregar métricas de inicio
    const startTime = Date.now();
    req.metrics = { startTime, type: 'function_calling' };
    
    // Ejecutar function calling con timeout
    const result = await withTimeout(functionCalling(req, res));
    
    // Si la respuesta ya fue enviada, no hacer nada más
    if (res.headersSent) {
      return;
    }
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    return res.json({
      ...result,
      metadata: {
        model: params.model,
        responseTime,
        toolsUsed: params.enabledTools,
        requestId: req.requestId
      }
    });
    
  } catch (error) {
    console.error('Error en function calling:', error);
    
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Error en function calling',
        message: error.message,
        requestId: req.requestId
      });
    }
  }
}

/**
 * Handler para requests GET (información del servicio)
 */
async function handleGetInfo(req, res) {
  return res.json({
    service: 'Gemini Chat API',
    version: '2.0.0',
    capabilities: {
      streaming: chatConfig.enableStreaming,
      functionCalling: chatConfig.enableTools,
      models: ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-pro', 'gemini-1.5-pro']
    },
    limits: {
      maxTokens: 8192,
      timeout: chatConfig.timeout,
      maxMessages: 50
    },
    endpoints: {
      chat: 'POST /api/gemini/chat',
      stream: 'POST /api/gemini/chat (with stream: true)',
      tools: 'POST /api/gemini/chat (with useTools: true)'
    }
  });
}

// === HANDLER PRINCIPAL ===

/**
 * Handler principal del chat
 */
export async function chatHandler(req, res) {
  try {
    const { method } = req;
    
    // Verificar método permitido
    if (!chatConfig.supportedMethods.includes(method)) {
      return res.status(405).json({
        error: 'Método no permitido',
        allowedMethods: chatConfig.supportedMethods
      });
    }
    
    // Manejar diferentes métodos
    switch (method) {
      case 'GET':
        return await handleGetInfo(req, res);
        
      case 'POST':
        // Validar configuración adicional
        const configErrors = validateChatConfig(req.validatedBody || req.body);
        if (configErrors.length > 0) {
          return res.status(400).json({
            error: 'Configuración inválida',
            details: configErrors
          });
        }
        
        const { stream, useTools } = req.validatedBody || req.body;
        
        // Enrutar según el tipo de operación
        if (stream) {
          return await handleStreamingChat(req, res);
        } else if (useTools) {
          return await handleFunctionCalling(req, res);
        } else {
          return await handleNormalChat(req, res);
        }
        
      case 'OPTIONS':
        return res.status(200).end();
        
      default:
        return res.status(405).json({
          error: 'Método no soportado',
          method
        });
    }
    
  } catch (error) {
    console.error('Error en chatHandler:', error);
    
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message,
        requestId: req.requestId || 'unknown'
      });
    }
  }
}

// === UTILIDADES EXPORTADAS ===

export const chatUtils = {
  validateChatConfig,
  prepareChatParams,
  withTimeout
};

export const chatMetrics = {
  getConfig: () => chatConfig,
  updateConfig: (newConfig) => Object.assign(chatConfig, newConfig)
};

// === EXPORTACIÓN POR DEFECTO ===

export default chatHandler;