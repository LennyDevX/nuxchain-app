/**
 * Router Centralizado para Serverless - NuxChain App
 * Manejo consistente de rutas y middleware
 */

import { corsMiddleware } from './cors.js';
import { withSecurity } from '../../src/security/serverless-security.js';

/**
 * Clase Router para manejar rutas de manera consistente
 */
export class ServerlessRouter {
  constructor() {
    this.routes = new Map();
    this.middlewares = [];
  }

  /**
   * Agregar middleware global
   * @param {Function} middleware - Middleware function
   */
  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * Registrar una ruta
   * @param {string} method - HTTP method
   * @param {string} path - Route path
   * @param {Function} handler - Route handler
   * @param {Array} middlewares - Route-specific middlewares
   */
  route(method, path, handler, middlewares = []) {
    const key = `${method.toUpperCase()}:${path}`;
    this.routes.set(key, {
      handler,
      middlewares: [...this.middlewares, ...middlewares]
    });
    return this;
  }

  /**
   * Shorthand methods for common HTTP verbs
   */
  get(path, handler, middlewares = []) {
    return this.route('GET', path, handler, middlewares);
  }

  post(path, handler, middlewares = []) {
    return this.route('POST', path, handler, middlewares);
  }

  put(path, handler, middlewares = []) {
    return this.route('PUT', path, handler, middlewares);
  }

  delete(path, handler, middlewares = []) {
    return this.route('DELETE', path, handler, middlewares);
  }

  /**
   * Ejecutar middleware chain
   * @param {Array} middlewares - Array of middleware functions
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} finalHandler - Final handler to execute
   */
  async executeMiddlewares(middlewares, req, res, finalHandler) {
    let index = 0;

    const next = async (error) => {
      if (error) {
        throw error;
      }

      if (index >= middlewares.length) {
        return await finalHandler(req, res);
      }

      const middleware = middlewares[index++];
      
      if (middleware.length === 4) {
        // Error middleware
        return middleware(error, req, res, next);
      } else {
        // Regular middleware
        return middleware(req, res, next);
      }
    };

    return await next();
  }

  /**
   * Manejar request
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async handle(req, res) {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const path = url.pathname;
      const method = req.method.toUpperCase();
      const key = `${method}:${path}`;

      const route = this.routes.get(key);
      
      if (!route) {
        return res.status(404).json({
          error: 'Ruta no encontrada',
          message: `${method} ${path} no está disponible`,
          timestamp: new Date().toISOString()
        });
      }

      // Ejecutar middlewares y handler
      return await this.executeMiddlewares(
        route.middlewares,
        req,
        res,
        route.handler
      );

    } catch (error) {
      console.error('Error en router:', error);
      
      if (!res.headersSent) {
        return res.status(500).json({
          error: 'Error interno del servidor',
          message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno',
          timestamp: new Date().toISOString()
        });
      }
    }
  }
}

/**
 * Factory function para crear un router con configuración por defecto
 * @param {Object} options - Router options
 * @returns {ServerlessRouter} Configured router instance
 */
export const createRouter = (options = {}) => {
  const router = new ServerlessRouter();
  
  // Middlewares por defecto
  if (options.cors !== false) {
    router.use(corsMiddleware);
  }
  
  if (options.security !== false) {
    router.use((req, res, next) => {
      const securityHandler = withSecurity((req, res) => next());
      return securityHandler(req, res);
    });
  }

  return router;
};

/**
 * Helper para crear un handler serverless con router
 * @param {Function} setupRoutes - Function to setup routes
 * @param {Object} options - Router options
 * @returns {Function} Serverless handler
 */
export const createServerlessHandler = (setupRoutes, options = {}) => {
  const router = createRouter(options);
  setupRoutes(router);
  
  return async (req, res) => {
    return await router.handle(req, res);
  };
};

export default {
  ServerlessRouter,
  createRouter,
  createServerlessHandler
};