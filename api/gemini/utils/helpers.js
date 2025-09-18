/**
 * Utilidades Centralizadas - API Gemini Optimizada
 * Funciones auxiliares reutilizables para toda la API
 */

import crypto from 'crypto';

// === UTILIDADES DE VALIDACIÓN ===

/**
 * Valida si un string es JSON válido
 */
export function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida una URL
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida un email
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida que un valor esté en un rango
 */
export function isInRange(value, min, max) {
  return typeof value === 'number' && value >= min && value <= max;
}

/**
 * Valida que un array no esté vacío y tenga un tamaño máximo
 */
export function isValidArray(arr, minLength = 1, maxLength = Infinity) {
  return Array.isArray(arr) && arr.length >= minLength && arr.length <= maxLength;
}

// === UTILIDADES DE FORMATEO ===

/**
 * Formatea bytes a formato legible
 */
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Formatea duración en milisegundos a formato legible
 */
export function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

/**
 * Formatea fecha a ISO string con timezone
 */
export function formatTimestamp(date = new Date()) {
  return date.toISOString();
}

/**
 * Trunca texto a una longitud específica
 */
export function truncateText(text, maxLength = 100, suffix = '...') {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

// === UTILIDADES DE HASH Y CRYPTO ===

/**
 * Genera un hash SHA256 de un string
 */
export function generateHash(input, algorithm = 'sha256') {
  return crypto.createHash(algorithm).update(input).digest('hex');
}

/**
 * Genera un ID único
 */
export function generateId(prefix = '', length = 8) {
  const randomPart = crypto.randomBytes(length).toString('hex').substring(0, length);
  return prefix ? `${prefix}_${randomPart}` : randomPart;
}

/**
 * Genera una clave de caché basada en múltiples factores
 */
export function generateCacheKey(data, factors = []) {
  const relevantData = {};
  
  for (const factor of factors) {
    if (factor in data) {
      relevantData[factor] = data[factor];
    }
  }
  
  const dataString = JSON.stringify(relevantData, Object.keys(relevantData).sort());
  return generateHash(dataString).substring(0, 16);
}

// === UTILIDADES DE TIEMPO ===

/**
 * Crea una promesa que se resuelve después de un delay
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Ejecuta una función con timeout
 */
export function withTimeout(promise, timeoutMs, errorMessage = 'Operation timeout') {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
}

/**
 * Retry con backoff exponencial
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delayMs = baseDelay * Math.pow(2, attempt);
      await delay(delayMs);
    }
  }
  
  throw lastError;
}

// === UTILIDADES DE OBJETOS ===

/**
 * Deep clone de un objeto
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

/**
 * Merge profundo de objetos
 */
export function deepMerge(target, source) {
  const result = deepClone(target);
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  
  return result;
}

/**
 * Obtiene un valor anidado de un objeto usando dot notation
 */
export function getNestedValue(obj, path, defaultValue = undefined) {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined || !(key in current)) {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current;
}

/**
 * Establece un valor anidado en un objeto usando dot notation
 */
export function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
  return obj;
}

// === UTILIDADES DE ARRAYS ===

/**
 * Agrupa elementos de un array por una clave
 */
export function groupBy(array, keyFn) {
  return array.reduce((groups, item) => {
    const key = typeof keyFn === 'function' ? keyFn(item) : item[keyFn];
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
}

/**
 * Elimina duplicados de un array
 */
export function unique(array, keyFn = null) {
  if (!keyFn) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Divide un array en chunks de tamaño específico
 */
export function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// === UTILIDADES DE STRINGS ===

/**
 * Convierte string a camelCase
 */
export function toCamelCase(str) {
  return str.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '');
}

/**
 * Convierte string a snake_case
 */
export function toSnakeCase(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '');
}

/**
 * Capitaliza la primera letra
 */
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Sanitiza un string para uso seguro
 */
export function sanitizeString(str) {
  return str
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
    .trim();
}

// === UTILIDADES DE MÉTRICAS ===

/**
 * Calcula estadísticas básicas de un array de números
 */
export function calculateStats(numbers) {
  if (numbers.length === 0) {
    return { min: 0, max: 0, avg: 0, sum: 0, count: 0 };
  }
  
  const sum = numbers.reduce((a, b) => a + b, 0);
  const sorted = [...numbers].sort((a, b) => a - b);
  
  return {
    min: Math.min(...numbers),
    max: Math.max(...numbers),
    avg: sum / numbers.length,
    median: sorted[Math.floor(sorted.length / 2)],
    sum,
    count: numbers.length
  };
}

/**
 * Calcula percentiles
 */
export function calculatePercentile(numbers, percentile) {
  const sorted = [...numbers].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  
  if (Math.floor(index) === index) {
    return sorted[index];
  }
  
  const lower = sorted[Math.floor(index)];
  const upper = sorted[Math.ceil(index)];
  return lower + (upper - lower) * (index - Math.floor(index));
}

// === UTILIDADES DE ERROR HANDLING ===

/**
 * Crea un error con información adicional
 */
export function createError(message, code = 'UNKNOWN_ERROR', statusCode = 500, details = {}) {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  error.details = details;
  error.timestamp = new Date().toISOString();
  return error;
}

/**
 * Maneja errores de forma consistente
 */
export function handleError(error, context = {}) {
  const errorInfo = {
    message: error.message,
    code: error.code || 'UNKNOWN_ERROR',
    statusCode: error.statusCode || 500,
    timestamp: new Date().toISOString(),
    context
  };
  
  console.error('Error handled:', errorInfo);
  return errorInfo;
}

// === EXPORTACIÓN POR DEFECTO ===

export default {
  // Validación
  isValidJSON,
  isValidUrl,
  isValidEmail,
  isInRange,
  isValidArray,
  
  // Formateo
  formatBytes,
  formatDuration,
  formatTimestamp,
  truncateText,
  
  // Crypto
  generateHash,
  generateId,
  generateCacheKey,
  
  // Tiempo
  delay,
  withTimeout,
  retryWithBackoff,
  
  // Objetos
  deepClone,
  deepMerge,
  getNestedValue,
  setNestedValue,
  
  // Arrays
  groupBy,
  unique,
  chunk,
  
  // Strings
  toCamelCase,
  toSnakeCase,
  capitalize,
  sanitizeString,
  
  // Métricas
  calculateStats,
  calculatePercentile,
  
  // Error handling
  createError,
  handleError
};