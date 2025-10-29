import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Middleware de Manejo de Errores Consistente
 * Aplica un manejo uniforme de errores para todos los endpoints de la API
 */

// Logger simplificado para Vercel
function logError(context: string, error: Error, metadata: Record<string, unknown> = {}): void {
  // En Vercel, los logs se gestionan automáticamente
  console.error(`${context}:`, error.message);
  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', error.stack);
    console.error('Metadata:', metadata);
  }
}

// Contador simplificado de errores
let errorCount = 0;
function incrementErrorCount(): void {
  errorCount++;
  if (errorCount % 100 === 0) {
    console.warn(`⚠️  Se han registrado ${errorCount} errores recientemente`);
  }
}

// Clase base para errores personalizados
export class ApiError extends Error {
  statusCode: number;
  errorType: string;
  details: Record<string, unknown>;
  timestamp: string;

  constructor(
    message: string, 
    statusCode: number, 
    errorType: string, 
    details: Record<string, unknown> = {}
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.details = details;
    this.timestamp = new Date().toISOString();
    
    // Mantener el stack trace correcto
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

interface ErrorResponse {
  error: string;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

interface ErrorHeaders {
  'Content-Type': string;
  'Cache-Control': string;
  'X-Error-Type': string;
  'X-Request-ID': string;
}

// Middleware de manejo de errores para Vercel
export function errorHandler(error: Error | ApiError, res: VercelResponse): void {
  incrementErrorCount();
  
  // Normalizar error
  let normalizedError: ApiError;
  
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
  } else {
    normalizedError = error;
  }
  
  // Loguear error
  logError(
    `API Error [${normalizedError.errorType}]`,
    normalizedError,
    { statusCode: normalizedError.statusCode }
  );
  
  // Preparar respuesta
  const errorResponse: ErrorResponse = {
    error: normalizedError.errorType,
    message: normalizedError.message,
    timestamp: normalizedError.timestamp,
    ...normalizedError.details
  };
  
  // Agregar encabezados de seguridad
  const headers: ErrorHeaders = {
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

// Handler type para endpoints de Vercel
type VercelHandler = (req: VercelRequest, res: VercelResponse) => Promise<void> | void;

// Wrapper para endpoints de Vercel
export function withErrorHandling(handler: VercelHandler): VercelHandler {
  return async (req: VercelRequest, res: VercelResponse): Promise<void> => {
    try {
      // Manejar preflight CORS
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }
      
      // Ejecutar handler principal
      await handler(req, res);
    } catch (error) {
      // Manejar error
      errorHandler(error as Error, res);
    }
  };
}

export default errorHandler;
