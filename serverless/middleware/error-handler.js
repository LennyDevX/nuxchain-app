/**
 * Manejo de Errores Estandarizado para Serverless - NuxChain App
 * Sistema unificado de manejo y logging de errores
 */

/**
 * Tipos de errores personalizados
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Acceso denegado') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Demasiadas solicitudes') {
    super(message, 429, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

export class ExternalServiceError extends AppError {
  constructor(service, message = 'Error en servicio externo') {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR', { service });
    this.name = 'ExternalServiceError';
  }
}

/**
 * Logger de errores
 */
export const errorLogger = {
  log: (error, context = {}) => {
    const logData = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        code: error.code || 'UNKNOWN',
        statusCode: error.statusCode || 500,
        stack: error.stack
      },
      context,
      environment: process.env.NODE_ENV || 'development'
    };

    if (error.statusCode >= 500) {
      console.error('🚨 Error crítico:', JSON.stringify(logData, null, 2));
    } else if (error.statusCode >= 400) {
      console.warn('⚠️ Error de cliente:', JSON.stringify(logData, null, 2));
    } else {
      console.log('ℹ️ Error informativo:', JSON.stringify(logData, null, 2));
    }
  }
};

/**
 * Formatear respuesta de error
 * @param {Error} error - Error object
 * @param {Object} req - Request object
 * @returns {Object} Formatted error response
 */
export const formatErrorResponse = (error, req = {}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isOperational = error.isOperational || false;
  
  const baseResponse = {
    error: true,
    message: error.message || 'Error interno del servidor',
    code: error.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    requestId: req.headers?.[`x-request-id`] || `req_${Date.now()}`
  };

  // Agregar detalles adicionales en desarrollo o errores operacionales
  if (isDevelopment || isOperational) {
    if (error.details) {
      baseResponse.details = error.details;
    }
    
    if (isDevelopment && error.stack) {
      baseResponse.stack = error.stack;
    }
  }

  // Información de ayuda para errores comunes
  if (error.statusCode === 400) {
    baseResponse.help = 'Verifica que los datos enviados sean correctos y estén en el formato esperado';
  } else if (error.statusCode === 401) {
    baseResponse.help = 'Asegúrate de incluir un token de autenticación válido';
  } else if (error.statusCode === 403) {
    baseResponse.help = 'No tienes permisos suficientes para realizar esta acción';
  } else if (error.statusCode === 404) {
    baseResponse.help = 'Verifica que la URL y el método HTTP sean correctos';
  } else if (error.statusCode === 429) {
    baseResponse.help = 'Has excedido el límite de solicitudes. Intenta de nuevo más tarde';
    baseResponse.retryAfter = '60 segundos';
  }

  return baseResponse;
};

/**
 * Middleware de manejo de errores
 * @param {Error} error - Error object
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
export const errorHandler = (error, req, res, next) => {
  // Log del error
  errorLogger.log(error, {
    url: req.url,
    method: req.method,
    headers: req.headers,
    body: req.body,
    query: req.query,
    userAgent: req.headers['user-agent']
  });

  // Determinar status code
  const statusCode = error.statusCode || 500;
  
  // Formatear respuesta
  const errorResponse = formatErrorResponse(error, req);
  
  // Enviar respuesta si no se ha enviado ya
  if (!res.headersSent) {
    res.status(statusCode).json(errorResponse);
  }
};

/**
 * Wrapper para manejar errores async
 * @param {Function} fn - Async function
 * @returns {Function} Wrapped function
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware para manejar rutas no encontradas
 */
export const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Ruta ${req.method} ${req.url} no encontrada`);
  next(error);
};

/**
 * Wrapper para handlers serverless con manejo de errores
 * @param {Function} handler - Handler function
 * @returns {Function} Wrapped handler
 */
export const withErrorHandling = (handler) => {
  return async (req, res) => {
    try {
      return await handler(req, res);
    } catch (error) {
      errorHandler(error, req, res, () => {});
    }
  };
};

/**
 * Validar y normalizar errores
 * @param {any} error - Error to normalize
 * @returns {AppError} Normalized error
 */
export const normalizeError = (error) => {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AppError(error.message, 500, 'INTERNAL_ERROR');
  }
  
  if (typeof error === 'string') {
    return new AppError(error, 500, 'INTERNAL_ERROR');
  }
  
  return new AppError('Error desconocido', 500, 'UNKNOWN_ERROR');
};

export default {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  ExternalServiceError,
  errorLogger,
  formatErrorResponse,
  errorHandler,
  asyncHandler,
  notFoundHandler,
  withErrorHandling,
  normalizeError
};