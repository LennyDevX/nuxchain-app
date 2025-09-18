import winston from 'winston';

// Métricas simples
let totalRequests = 0;
let totalErrors = 0;
let totalTokens = 0;
let tokenCount = 0;

// Configuración del logger de Winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'combined.log' })
  ],
});

export const getMetrics = () => ({
  totalRequests,
  totalErrors,
  totalTokens
});

export function incrementTokenCount(count) {
  tokenCount += count;
}

export function getTokenCount() {
  return tokenCount;
}

export const incrementErrorCount = () => {
  totalErrors++;
};

export const logError = (message, error, context = {}) => {
  logger.error(message, { error: error.message, stack: error.stack, ...context });
};

export const logInfo = (message, context = {}) => {
  logger.info(message, { ...context });
};

export default function requestLogger(req, res, next) {
  totalRequests++;
  const start = Date.now();
  const { method, url, ip } = req;
  
  logInfo(`Request received: ${method} ${url}`, { method, url, ip });
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logInfo(`Request completed: ${method} ${url}`, { method, url, ip, statusCode: res.statusCode, duration });
  });
  
  next();
}
