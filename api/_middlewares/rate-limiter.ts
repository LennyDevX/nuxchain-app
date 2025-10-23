import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Simple in-memory rate limiter para Vercel
 * Nota: En entornos de producción con múltiples instancias, se recomienda usar un almacenamiento compartido
 * como Redis o una base de datos externa para sincronizar los límites.
 */

interface RateLimiterOptions {
  maxRequests?: number;
  windowMs?: number;
  message?: string;
}

interface RateLimitMiddleware {
  (req: VercelRequest, res: VercelResponse, next: () => void): Promise<void>;
}

class RateLimiter {
  private requests: Map<string, number[]>;
  private readonly EXPIRE_TIME: number;

  constructor() {
    // Almacén en memoria para rastrear solicitudes por IP
    this.requests = new Map();
    // Tiempo de caducidad de las solicitudes en milisegundos
    this.EXPIRE_TIME = 60000; // 1 minuto
  }

  /**
   * Obtiene el identificador único para el cliente
   * @param req - La solicitud HTTP
   * @returns Identificador único (IP + User-Agent hasheado)
   */
  getClientIdentifier(req: VercelRequest): string {
    // Obtener IP del cliente
    const forwardedFor = req.headers['x-forwarded-for'];
    const ip = (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor) || 
               (req.socket?.remoteAddress) || 
               'unknown';
    
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
   * @param options - Opciones de configuración
   * @returns Middleware de Express
   */
  createMiddleware(options: RateLimiterOptions = {}): RateLimitMiddleware {
    const maxRequests = options.maxRequests || 30; // 30 solicitudes por defecto
    const windowMs = options.windowMs || 60000; // 1 minuto por defecto
    const message = options.message || 'Has excedido el límite de solicitudes. Por favor, intenta de nuevo más tarde.';
    
    return async (req: VercelRequest, res: VercelResponse, next: () => void): Promise<void> => {
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
          
          res.status(429).json({
            error: message,
            retryAfter: timeUntilReset,
            details: `Has realizado ${maxRequests} solicitudes en los últimos ${Math.floor(windowMs / 1000)} segundos.`
          });
          return;
        }
        
        // Agregar la solicitud actual
        clientRequests.push(now);
        this.requests.set(clientId, clientRequests);
        
        // Calcular cuántas solicitudes restantes tiene el cliente
        const remainingRequests = maxRequests - clientRequests.length;
        const resetTime = Math.ceil((windowMs - (now - clientRequests[0])) / 1000);
        
        // Agregar encabezados de rate limiting
        res.setHeader('X-RateLimit-Limit', maxRequests.toString());
        res.setHeader('X-RateLimit-Remaining', remainingRequests.toString());
        res.setHeader('X-RateLimit-Reset', resetTime.toString());
        
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
  cleanupExpiredRequests(): void {
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
export const custom = (options: RateLimiterOptions): RateLimitMiddleware => 
  rateLimiterInstance.createMiddleware(options);

// Instancia del rate limiter para uso avanzado
export const instance = rateLimiterInstance;

export default {
  strict,
  normal,
  soft,
  custom,
  instance
};
