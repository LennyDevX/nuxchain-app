/*
 * WebSocket Security - NuxChain App
 * Specific protection for WebSocket connections
 */

import { getCorsConfig } from './cors-policies.js';
import environmentConfig from './environment-config.js';
import { WebSocketServer } from 'ws';

/**
 * WebSocket origin validation
 */
export const validateWebSocketOrigin = (origin) => {
  const corsConfig = getCorsConfig();
  
  if (!origin) {
    return environmentConfig.isDevelopment; // Allow in development without origin
  }
  
  // Check if origin is in allowed list
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
 * WebSocket rate limiting
 */
class WebSocketRateLimit {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000; // 1 minute
    this.maxConnections = options.maxConnections || 10;
    this.maxMessages = options.maxMessages || 100;
    this.connections = new Map();
    this.messages = new Map();
    
    // Clean up old data every minute
    setInterval(() => this.cleanup(), this.windowMs);
  }
  
  checkConnection(ip) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.connections.has(ip)) {
      this.connections.set(ip, []);
    }
    
    const ipConnections = this.connections.get(ip);
    
    // Filter connections within time window
    const recentConnections = ipConnections.filter(time => time > windowStart);
    
    if (recentConnections.length >= this.maxConnections) {
      return false;
    }
    
    // Add new connection
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
    
    // Filter messages within time window
    const recentMessages = ipMessages.filter(time => time > windowStart);
    
    if (recentMessages.length >= this.maxMessages) {
      return false;
    }
    
    // Add new message
    recentMessages.push(now);
    this.messages.set(ip, recentMessages);
    
    return true;
  }
  
  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Clean up old connections
    for (const [ip, connections] of this.connections.entries()) {
      const recentConnections = connections.filter(time => time > windowStart);
      if (recentConnections.length === 0) {
        this.connections.delete(ip);
      } else {
        this.connections.set(ip, recentConnections);
      }
    }
    
    // Clean up old messages
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

// Global rate limiting instance
const wsRateLimit = new WebSocketRateLimit({
  windowMs: 60000, // 1 minute
  maxConnections: environmentConfig.isProduction ? 5 : 20,
  maxMessages: environmentConfig.isProduction ? 50 : 200
});

/**
 * WebSocket authentication validation
 */
export const validateWebSocketAuth = (req) => {
  // Check API key in query params or headers
  const apiKey = req.url?.includes('apiKey=') 
    ? new URL(req.url, 'http://localhost').searchParams.get('apiKey')
    : req.headers['x-api-key'];
    
  const validApiKey = environmentConfig.serverApiKey;
  
  // In development, allow connections without API key
  if (environmentConfig.isDevelopment && !apiKey) {
    return true;
  }
  
  return apiKey === validApiKey;
};

/**
 * WebSocket security middleware
 */
export const webSocketSecurityMiddleware = (ws, req) => {
  const clientIP = req.socket.remoteAddress || req.connection.remoteAddress;
  const origin = req.headers.origin;
  
  console.log(`New WebSocket connection from IP: ${clientIP}, Origin: ${origin}`);
  
  // Validate origin
  if (!validateWebSocketOrigin(origin)) {
    console.warn(`WebSocket origin not allowed: ${origin}`);
    ws.close(1008, 'Origin not allowed');
    return false;
  }
  
  // Validate authentication
  if (!validateWebSocketAuth(req)) {
    console.warn(`WebSocket authentication failed from IP: ${clientIP}`);
    ws.close(1008, 'Authentication required');
    return false;
  }
  
  // Check connection rate limiting
  if (!wsRateLimit.checkConnection(clientIP)) {
    console.warn(`WebSocket connection rate limit exceeded from IP: ${clientIP}`);
    ws.close(1008, 'Too many connections');
    return false;
  }
  
  // Configure message rate limiting
  ws.on('message', (message) => {
    if (!wsRateLimit.checkMessage(clientIP)) {
      console.warn(`WebSocket message rate limit exceeded from IP: ${clientIP}`);
      ws.close(1008, 'Too many messages');
      return;
    }
    
    // Validate message size
    if (message.length > 1024 * 1024) { // 1MB maximum
      console.warn(`Message too large from IP: ${clientIP}`);
      ws.close(1009, 'Message too large');
      return;
    }
    
    // Validate message format
    try {
      let parsedMessage;
      if (typeof message === 'string') {
        parsedMessage = JSON.parse(message);
      } else {
        parsedMessage = JSON.parse(message.toString());
      }
      
      // Validate basic structure
      if (!parsedMessage.type || typeof parsedMessage.type !== 'string') {
        ws.close(1003, 'Invalid message format');
        return;
      }
      
      // Validate allowed message types
      const allowedTypes = ['chat', 'ping', 'pong', 'subscribe', 'unsubscribe'];
      if (!allowedTypes.includes(parsedMessage.type)) {
        ws.close(1003, 'Message type not allowed');
        return;
      }
    
    } catch (error) {
      console.warn(`Invalid JSON message from IP: ${clientIP}`);
      ws.close(1003, 'Invalid JSON format');
      return;
    }
  });
  
  // Configure connection timeout
  const connectionTimeout = setTimeout(() => {
    if (ws.readyState === ws.OPEN) {
      console.warn(`WebSocket connection timeout for IP: ${clientIP}`);
      ws.close(1000, 'Connection timeout');
    }
  }, environmentConfig.isProduction ? 300000 : 600000); // 5 min prod, 10 min dev
  
  // Clean up timeout when connection closes
  ws.on('close', () => {
    clearTimeout(connectionTimeout);
  });
  
  // Configure ping/pong to keep connection alive
  const pingInterval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.ping();
    } else {
      clearInterval(pingInterval);
    }
  }, 30000); // Ping every 30 seconds
  
  ws.on('pong', () => {
    // Reset timeout on pong
    clearTimeout(connectionTimeout);
  });
  
  ws.on('close', () => {
    clearInterval(pingInterval);
    console.log(`WebSocket connection closed for IP: ${clientIP}`);
  });
  
  return true;
};

/**
 * Secure WebSocket Server configuration
 */
export const setupSecureWebSocketServer = (server, options = {}) => {
  const wss = new WebSocketServer({
    server,
    verifyClient: (info) => {
      const { origin, req } = info;
      const clientIP = req.socket.remoteAddress;
      
      // Security validations before establishing connection
      if (!validateWebSocketOrigin(origin)) {
        console.warn(`WebSocket connection rejected - Origin: ${origin}, IP: ${clientIP}`);
        return false;
      }
      
      if (!validateWebSocketAuth(req)) {
        console.warn(`WebSocket connection rejected - Auth failed, IP: ${clientIP}`);
        return false;
      }
      
      if (!wsRateLimit.checkConnection(clientIP)) {
        console.warn(`WebSocket connection rejected - Rate limit, IP: ${clientIP}`);
        return false;
      }
      
      return true;
    },
    ...options
  });
  
  wss.on('connection', (ws, req) => {
    webSocketSecurityMiddleware(ws, req);
  });
  
  console.log('✅ Secure WebSocket Server configured');
  return wss;
};

/**
 * WebSocket monitoring utilities
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