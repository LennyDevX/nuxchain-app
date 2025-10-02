/**
 * Middleware de Manejo de Errores Consistente
 * Aplica un manejo uniforme de errores para todos los endpoints de la API
 */

// Logger simplificado para Vercel
function logError(context, error, metadata = {}) {
  // En Vercel, los logs se gestionan automáticamente
  console.error(`${context}:`, error.message);
  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', error.stack);
    console.error('Metadata:', metadata);
  }
}

// Contador simplificado de errores
let errorCount = 0;
function incrementErrorCount() {
  errorCount++;
  if (errorCount % 100 === 0) {
    console.warn(`⚠️  Se han registrado ${errorCount} errores recientemente`);
  }
}

// Clase base para errores personalizados
class ApiError extends Error {
  constructor(message, statusCode, errorType, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// Middleware de manejo de errores para Vercel
function errorHandler(error, res) {
  incrementErrorCount();
  
  // Normalizar error
  let normalizedError = error;
  if (!(error instanceof ApiError)) {
    // Determinar tipo de error
    let statusCode = 500;
    let errorType = 'Internal Server Error';
    
    // Errores de validación
    if (error.name === 'ValidationError') {
      statusCode = 400;
      errorType = 'Validation Error';
    }
    // Error de sintaxis JSON
    else if (error instanceof SyntaxError && 'body' in error) {
      statusCode = 400;
      errorType = 'Invalid JSON Syntax';
    }
    // Errores específicos de Gemini
    else if (error.message?.includes('quota')) {
      statusCode = 429;
      errorType = 'Quota Exceeded';
    }
    else if (error.message?.includes('safety')) {
      statusCode = 400;
      errorType = 'Content Safety';
    }
    else if (error.message?.includes('API key')) {
      statusCode = 500;
      errorType = 'Configuration Error';
    }
    else if (error.message?.includes('Timeout')) {
      statusCode = 504;
      errorType = 'Timeout Error';
    }
    else if (error.message?.includes('Rate limit')) {
      statusCode = 429;
      errorType = 'Rate Limit Exceeded';
    }
    
    normalizedError = new ApiError(
      error.message || 'Something went wrong',
      statusCode,
      errorType,
      process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}
    );
  }
  
  // Loguear error
  logError(
    `API Error [${normalizedError.errorType}]`,
    normalizedError,
    { statusCode: normalizedError.statusCode }
  );
  
  // Preparar respuesta
  const errorResponse = {
    error: normalizedError.errorType,
    message: normalizedError.message,
    timestamp: normalizedError.timestamp,
    ...normalizedError.details
  };
  
  // Agregar encabezados de seguridad
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'X-Error-Type': normalizedError.errorType,
    'X-Request-ID': Math.random().toString(36).substr(2, 10)
  };
  
  // Aplicar headers
  Object.entries(headers).forEach(([key, value]) => {
    if (!res.headersSent) {
      res.setHeader(key, value);
    }
  });
  
  // Enviar respuesta de error
  if (!res.headersSent) {
    res.status(normalizedError.statusCode).json(errorResponse);
  }
}

// Wrapper para endpoints de Vercel
function withErrorHandling(handler) {
  return async (req, res) => {
    try {
      // Manejar preflight CORS
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }
      
      // Ejecutar handler principal
      await handler(req, res);
    } catch (error) {
      // Manejar error
      errorHandler(error, res);
    }
  };
}

export { ApiError, errorHandler, withErrorHandling };

export default errorHandler;