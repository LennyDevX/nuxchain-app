/**
 * Seguridad para WebSocket - NuxChain App
 * Protección específica para conexiones WebSocket
 */

import { getCorsConfig } from './cors-policies.js';
import environmentConfig from './environment-config.js';

/**
 * Validación de origen para WebSocket
 */
export const validateWebSocketOrigin = (origin) => {
  const corsConfig = getCorsConfig();
  
  if (!origin) {
    return environmentConfig.isDevelopment; // Permitir en desarrollo sin origin
  }
  
  // Verificar si el origen está en la lista permitida
  if (corsConfig.origin === true) return true;
  if (corsConfig.origin === false) return false;
  
  if (Array.isArray(corsConfig.origin)) {
    return corsConfig.origin.includes(origin);
  }
  
  if (typeof corsConfig.origin === 'string') {
    return corsConfig.origin === origin;
  }
  
  if (typeof corsConfig.origin === 'function') {
    return corsConfig.origin(origin);
  }
  
  return false;
};

/**
 * Rate limiting para WebSocket
 */
class WebSocketRateLimit {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000; // 1 minuto
    this.maxConnections = options.maxConnections || 10;
    this.maxMessages = options.maxMessages || 100;
    this.connections = new Map();
    this.messages = new Map();
    
    // Limpiar datos antiguos cada minuto
    setInterval(() => this.cleanup(), this.windowMs);
  }
  
  checkConnection(ip) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.connections.has(ip)) {
      this.connections.set(ip, []);
    }
    
    const ipConnections = this.connections.get(ip);
    
    // Filtrar conexiones dentro de la ventana de tiempo
    const recentConnections = ipConnections.filter(time => time > windowStart);
    
    if (recentConnections.length >= this.maxConnections) {
      return false;
    }
    
    // Agregar nueva conexión
    recentConnections.push(now);
    this.connections.set(ip, recentConnections);
    
    return true;
  }
  
  checkMessage(ip) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.messages.has(ip)) {
      this.messages.set(ip, []);
    }
    
    const ipMessages = this.messages.get(ip);
    
    // Filtrar mensajes dentro de la ventana de tiempo
    const recentMessages = ipMessages.filter(time => time > windowStart);
    
    if (recentMessages.length >= this.maxMessages) {
      return false;
    }
    
    // Agregar nuevo mensaje
    recentMessages.push(now);
    this.messages.set(ip, recentMessages);
    
    return true;
  }
  
  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Limpiar conexiones antiguas
    for (const [ip, connections] of this.connections.entries()) {
      const recentConnections = connections.filter(time => time > windowStart);
      if (recentConnections.length === 0) {
        this.connections.delete(ip);
      } else {
        this.connections.set(ip, recentConnections);
      }
    }
    
    // Limpiar mensajes antiguos
    for (const [ip, messages] of this.messages.entries()) {
      const recentMessages = messages.filter(time => time > windowStart);
      if (recentMessages.length === 0) {
        this.messages.delete(ip);
      } else {
        this.messages.set(ip, recentMessages);
      }
    }
  }
}

// Instancia global de rate limiting
const wsRateLimit = new WebSocketRateLimit({
  windowMs: 60000, // 1 minuto
  maxConnections: environmentConfig.isProduction ? 5 : 20,
  maxMessages: environmentConfig.isProduction ? 50 : 200
});

/**
 * Validación de autenticación WebSocket
 */
export const validateWebSocketAuth = (req) => {
  // Verificar API key en query params o headers
  const apiKey = req.url?.includes('apiKey=') 
    ? new URL(req.url, 'http://localhost').searchParams.get('apiKey')
    : req.headers['x-api-key'];
    
  const validApiKey = environmentConfig.serverApiKey;
  
  // En desarrollo, permitir conexiones sin API key
  if (environmentConfig.isDevelopment && !apiKey) {
    return true;
  }
  
  return apiKey === validApiKey;
};

/**
 * Middleware de seguridad para WebSocket
 */
export const webSocketSecurityMiddleware = (ws, req) => {
  const clientIP = req.socket.remoteAddress || req.connection.remoteAddress;
  const origin = req.headers.origin;
  
  console.log(`Nueva conexión WebSocket desde IP: ${clientIP}, Origin: ${origin}`);
  
  // Validar origen
  if (!validateWebSocketOrigin(origin)) {
    console.warn(`Origen no permitido para WebSocket: ${origin}`);
    ws.close(1008, 'Origen no permitido');
    return false;
  }
  
  // Validar autenticación
  if (!validateWebSocketAuth(req)) {
    console.warn(`Autenticación fallida para WebSocket desde IP: ${clientIP}`);
    ws.close(1008, 'Autenticación requerida');
    return false;
  }
  
  // Verificar rate limiting de conexiones
  if (!wsRateLimit.checkConnection(clientIP)) {
    console.warn(`Rate limit excedido para conexiones WebSocket desde IP: ${clientIP}`);
    ws.close(1008, 'Demasiadas conexiones');
    return false;
  }
  
  // Configurar rate limiting de mensajes
  ws.on('message', (message) => {
    if (!wsRateLimit.checkMessage(clientIP)) {
      console.warn(`Rate limit excedido para mensajes WebSocket desde IP: ${clientIP}`);
      ws.close(1008, 'Demasiados mensajes');
      return;
    }
    
    // Validar tamaño del mensaje
    if (message.length > 1024 * 1024) { // 1MB máximo
      console.warn(`Mensaje demasiado grande desde IP: ${clientIP}`);
      ws.close(1009, 'Mensaje demasiado grande');
      return;
    }
    
    // Validar formato del mensaje
    try {
      const parsedMessage = JSON.parse(message);
      
      // Validar estructura básica
      if (!parsedMessage.type || typeof parsedMessage.type !== 'string') {
        ws.close(1003, 'Formato de mensaje inválido');
        return;
      }
      
      // Validar tipos de mensaje permitidos
      const allowedTypes = ['chat', 'ping', 'pong', 'subscribe', 'unsubscribe'];
      if (!allowedTypes.includes(parsedMessage.type)) {
        ws.close(1003, 'Tipo de mensaje no permitido');
        return;
      }
      
    } catch (error) {
      console.warn(`Mensaje JSON inválido desde IP: ${clientIP}`);
      ws.close(1003, 'Formato JSON inválido');
      return;
    }
  });
  
  // Configurar timeout de conexión
  const connectionTimeout = setTimeout(() => {
    if (ws.readyState === ws.OPEN) {
      console.warn(`Timeout de conexión WebSocket para IP: ${clientIP}`);
      ws.close(1000, 'Timeout de conexión');
    }
  }, environmentConfig.isProduction ? 300000 : 600000); // 5 min prod, 10 min dev
  
  // Limpiar timeout cuando se cierre la conexión
  ws.on('close', () => {
    clearTimeout(connectionTimeout);
  });
  
  // Configurar ping/pong para mantener conexión viva
  const pingInterval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.ping();
    } else {
      clearInterval(pingInterval);
    }
  }, 30000); // Ping cada 30 segundos
  
  ws.on('pong', () => {
    // Resetear timeout en pong
    clearTimeout(connectionTimeout);
  });
  
  ws.on('close', () => {
    clearInterval(pingInterval);
    console.log(`Conexión WebSocket cerrada para IP: ${clientIP}`);
  });
  
  return true;
};

/**
 * Configuración de WebSocket Server con seguridad
 */
export const setupSecureWebSocketServer = (server, options = {}) => {
  const WebSocket = require('ws');
  
  const wss = new WebSocket.Server({
    server,
    verifyClient: (info) => {
      const { origin, req } = info;
      const clientIP = req.socket.remoteAddress;
      
      // Validaciones de seguridad antes de establecer la conexión
      if (!validateWebSocketOrigin(origin)) {
        console.warn(`Conexión WebSocket rechazada - Origen: ${origin}, IP: ${clientIP}`);
        return false;
      }
      
      if (!validateWebSocketAuth(req)) {
        console.warn(`Conexión WebSocket rechazada - Auth fallida, IP: ${clientIP}`);
        return false;
      }
      
      if (!wsRateLimit.checkConnection(clientIP)) {
        console.warn(`Conexión WebSocket rechazada - Rate limit, IP: ${clientIP}`);
        return false;
      }
      
      return true;
    },
    ...options
  });
  
  wss.on('connection', (ws, req) => {
    webSocketSecurityMiddleware(ws, req);
  });
  
  console.log('✅ WebSocket Server seguro configurado');
  return wss;
};

/**
 * Utilidades de monitoreo WebSocket
 */
export const getWebSocketStats = () => {
  return {
    activeConnections: wsRateLimit.connections.size,
    totalMessages: Array.from(wsRateLimit.messages.values())
      .reduce((total, messages) => total + messages.length, 0),
    rateLimitConfig: {
      windowMs: wsRateLimit.windowMs,
      maxConnections: wsRateLimit.maxConnections,
      maxMessages: wsRateLimit.maxMessages
    }
  };
};

export default {
  validateWebSocketOrigin,
  validateWebSocketAuth,
  webSocketSecurityMiddleware,
  setupSecureWebSocketServer,
  getWebSocketStats,
  WebSocketRateLimit
};