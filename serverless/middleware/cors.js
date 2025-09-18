/**
 * Middleware CORS Centralizado para Serverless - NuxChain App
 * Elimina duplicación y centraliza la configuración CORS
 */

import { getCorsConfig } from '../../src/security/cors-policies.js';

/**
 * Middleware CORS unificado para todas las funciones serverless
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const corsMiddleware = (req, res, next) => {
  const environment = process.env.NODE_ENV || 'development';
  const corsConfig = getCorsConfig(environment);
  
  const origin = req.headers.origin;
  
  // Verificar si el origen está permitido
  if (corsConfig.origin === true || 
      (Array.isArray(corsConfig.origin) && corsConfig.origin.includes(origin)) ||
      (typeof corsConfig.origin === 'function' && corsConfig.origin(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  
  // Configurar headers CORS
  res.setHeader('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
  res.setHeader('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
  res.setHeader('Access-Control-Expose-Headers', corsConfig.exposedHeaders.join(', '));
  
  if (corsConfig.credentials) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    res.status(corsConfig.optionsSuccessStatus || 200).end();
    return;
  }
  
  next();
};

/**
 * Wrapper para aplicar CORS a cualquier handler
 * @param {Function} handler - Handler function
 * @returns {Function} Handler with CORS applied
 */
export const withCors = (handler) => {
  return async (req, res) => {
    return new Promise((resolve, reject) => {
      corsMiddleware(req, res, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(handler(req, res));
        }
      });
    });
  };
};

export default {
  corsMiddleware,
  withCors
};