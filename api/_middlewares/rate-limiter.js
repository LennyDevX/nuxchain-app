// Middleware de rate limiting para Vercel API

/**
 * Simple in-memory rate limiter para Vercel
 * Nota: En entornos de producción con múltiples instancias, se recomienda usar un almacenamiento compartido
 * como Redis o una base de datos externa para sincronizar los límites.
 */

class RateLimiter {
  constructor() {
    // Almacén en memoria para rastrear solicitudes por IP
    this.requests = new Map();
    // Tiempo de caducidad de las solicitudes en milisegundos
    this.EXPIRE_TIME = 60000; // 1 minuto
  }

  /**
   * Obtiene el identificador único para el cliente
   * @param {Request} req - La solicitud HTTP
   * @returns {string} - Identificador único (IP + User-Agent hasheado)
   */
  getClientIdentifier(req) {
    // Obtener IP del cliente
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    // Obtener User-Agent para mayor granularidad
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Crear un hash básico para combinar IP y User-Agent
    // En producción, considerar usar una función hash más segura
    const combined = `${ip}:${userAgent}`;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a entero de 32 bits
    }
    
    return Math.abs(hash).toString();
  }

  /**
   * Crea el middleware de rate limiting
   * @param {Object} options - Opciones de configuración
   * @param {number} options.maxRequests - Número máximo de solicitudes permitidas
   * @param {string} options.windowMs - Ventana de tiempo en milisegundos
   * @param {string} options.message - Mensaje de error personalizado
   * @returns {Function} - Middleware de Express
   */
  createMiddleware(options = {}) {
    const maxRequests = options.maxRequests || 30; // 30 solicitudes por defecto
    const windowMs = options.windowMs || 60000; // 1 minuto por defecto
    const message = options.message || 'Has excedido el límite de solicitudes. Por favor, intenta de nuevo más tarde.';
    
    return async (req, res, next) => {
      try {
        const clientId = this.getClientIdentifier(req);
        const now = Date.now();
        
        // Limpiar solicitudes expiradas
        this.cleanupExpiredRequests();
        
        // Obtener solicitudes existentes para este cliente
        let clientRequests = this.requests.get(clientId) || [];
        
        // Filtrar solicitudes dentro de la ventana de tiempo
        clientRequests = clientRequests.filter(timestamp => now - timestamp < windowMs);
        
        // Verificar si se ha excedido el límite
        if (clientRequests.length >= maxRequests) {
          const timeUntilReset = Math.ceil((windowMs - (now - clientRequests[0])) / 1000);
          
          return res.status(429).json({
            error: message,
            retryAfter: timeUntilReset,
            details: `Has realizado ${maxRequests} solicitudes en los últimos ${Math.floor(windowMs / 1000)} segundos.`
          });
        }
        
        // Agregar la solicitud actual
        clientRequests.push(now);
        this.requests.set(clientId, clientRequests);
        
        // Calcular cuántas solicitudes restantes tiene el cliente
        const remainingRequests = maxRequests - clientRequests.length;
        const resetTime = Math.ceil((windowMs - (now - clientRequests[0])) / 1000);
        
        // Agregar encabezados de rate limiting
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', remainingRequests);
        res.setHeader('X-RateLimit-Reset', resetTime);
        
        // Continuar con la solicitud
        next();
      } catch (error) {
        // En caso de error, continuar con la solicitud para no bloquear el servicio
        console.error('Error en rate limiter:', error);
        next();
      }
    };
  }

  /**
   * Limpia las solicitudes expiradas para liberar memoria
   */
  cleanupExpiredRequests() {
    const now = Date.now();
    
    for (const [clientId, timestamps] of this.requests.entries()) {
      const filteredTimestamps = timestamps.filter(timestamp => now - timestamp < this.EXPIRE_TIME);
      
      if (filteredTimestamps.length === 0) {
        this.requests.delete(clientId);
      } else {
        this.requests.set(clientId, filteredTimestamps);
      }
    }
  }
}

// Crear una instancia global del rate limiter
const rateLimiterInstance = new RateLimiter();

// Exportar funciones utilitarias para diferentes casos de uso
// Rate limiter estricto para endpoints intensivos
export const strict = rateLimiterInstance.createMiddleware({
  maxRequests: 15,
  windowMs: 60000,
  message: 'Has excedido el límite de solicitudes para este endpoint. Por favor, espera un minuto y vuelve a intentarlo.'
});

// Rate limiter normal para endpoints comunes
export const normal = rateLimiterInstance.createMiddleware({
  maxRequests: 30,
  windowMs: 60000,
  message: 'Has excedido el límite de solicitudes. Por favor, espera un minuto y vuelve a intentarlo.'
});

// Rate limiter suave para endpoints públicos
export const soft = rateLimiterInstance.createMiddleware({
  maxRequests: 60,
  windowMs: 60000,
  message: 'Has excedido el límite de solicitudes. Por favor, espera un minuto y vuelve a intentarlo.'
});

// Middleware personalizado
export const custom = (options) => rateLimiterInstance.createMiddleware(options);

// Instancia del rate limiter para uso avanzado
export const instance = rateLimiterInstance;

export default {
  strict,
  normal,
  soft,
  custom,
  instance
};