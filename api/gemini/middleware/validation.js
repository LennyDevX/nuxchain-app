/**
 * Middleware de Validación Centralizado - API Gemini Optimizada
 * Proporciona validación reutilizable y consistente para todos los endpoints
 */

// === ESQUEMAS DE VALIDACIÓN ===

export const schemas = {
  // Esquema para requests de chat
  chatRequest: {
    type: 'object',
    required: ['messages'],
    properties: {
      messages: {
        type: 'array',
        minItems: 1,
        maxItems: 50,
        items: {
          type: 'object',
          required: ['role', 'content'],
          properties: {
            role: { 
              type: 'string', 
              enum: ['user', 'assistant', 'system'] 
            },
            content: { 
              type: 'string', 
              minLength: 1, 
              maxLength: 10000 
            }
          }
        }
      },
      model: { 
        type: 'string', 
        default: 'gemini-2.5-flash-lite',
      enum: ['gemini-2.5-flash-lite']
      },
      stream: { 
        type: 'boolean', 
        default: false 
      },
      temperature: { 
        type: 'number', 
        minimum: 0, 
        maximum: 2, 
        default: 0.7 
      },
      maxTokens: { 
        type: 'number', 
        minimum: 1, 
        maximum: 8192, 
        default: 2048 
      },
      enabledTools: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['search', 'calculator', 'urlContext', 'webScraper']
        },
        default: []
      }
    }
  },

  // Esquema para function calling
  toolsRequest: {
    type: 'object',
    required: ['prompt', 'tools'],
    properties: {
      prompt: { 
        type: 'string', 
        minLength: 1, 
        maxLength: 5000 
      },
      tools: {
        type: 'array',
        minItems: 1,
        items: { 
          type: 'string', 
          enum: ['search', 'calculator', 'urlContext', 'webScraper'] 
        }
      },
      model: { 
        type: 'string', 
        default: 'gemini-2.5-flash-lite' 
      },
      temperature: { 
        type: 'number', 
        minimum: 0, 
        maximum: 2, 
        default: 0.7 
      }
    }
  },

  // Esquema para análisis de texto
  analysisRequest: {
    type: 'object',
    required: ['text', 'analysisType'],
    properties: {
      text: { 
        type: 'string', 
        minLength: 1, 
        maxLength: 20000 
      },
      analysisType: {
        type: 'string',
        enum: ['sentiment', 'summary', 'keywords', 'translation', 'classification']
      },
      targetLanguage: { 
        type: 'string', 
        default: 'es' 
      },
      model: { 
        type: 'string', 
        default: 'gemini-2.5-flash-lite' 
      }
    }
  },

  // Esquema para batch processing
  batchRequest: {
    type: 'object',
    required: ['requests'],
    properties: {
      requests: {
        type: 'array',
        minItems: 1,
        maxItems: 10,
        items: {
          type: 'object',
          required: ['id', 'prompt'],
          properties: {
            id: { type: 'string' },
            prompt: { type: 'string', minLength: 1, maxLength: 5000 },
            model: { type: 'string', default: 'gemini-2.5-flash-lite' }
          }
        }
      },
      priority: {
        type: 'string',
        enum: ['low', 'normal', 'high'],
        default: 'normal'
      }
    }
  }
};

// === FUNCIONES DE VALIDACIÓN ===

/**
 * Valida un objeto contra un esquema específico
 */
function validateSchema(data, schema) {
  const errors = [];
  
  // Validar propiedades requeridas
  if (schema.required) {
    for (const field of schema.required) {
      if (!(field in data)) {
        errors.push(`Campo requerido faltante: ${field}`);
      }
    }
  }
  
  // Validar propiedades
  if (schema.properties) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (key in data) {
        const value = data[key];
        const propErrors = validateProperty(value, propSchema, key);
        errors.push(...propErrors);
      }
    }
  }
  
  return errors;
}

/**
 * Valida una propiedad individual
 */
function validateProperty(value, schema, fieldName) {
  const errors = [];
  
  // Validar tipo
  if (schema.type) {
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (actualType !== schema.type) {
      errors.push(`${fieldName}: esperado ${schema.type}, recibido ${actualType}`);
      return errors; // No continuar si el tipo es incorrecto
    }
  }
  
  // Validar enum
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${fieldName}: debe ser uno de [${schema.enum.join(', ')}]`);
  }
  
  // Validar string
  if (schema.type === 'string') {
    if (schema.minLength && value.length < schema.minLength) {
      errors.push(`${fieldName}: mínimo ${schema.minLength} caracteres`);
    }
    if (schema.maxLength && value.length > schema.maxLength) {
      errors.push(`${fieldName}: máximo ${schema.maxLength} caracteres`);
    }
  }
  
  // Validar number
  if (schema.type === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push(`${fieldName}: mínimo ${schema.minimum}`);
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push(`${fieldName}: máximo ${schema.maximum}`);
    }
  }
  
  // Validar array
  if (schema.type === 'array') {
    if (schema.minItems && value.length < schema.minItems) {
      errors.push(`${fieldName}: mínimo ${schema.minItems} elementos`);
    }
    if (schema.maxItems && value.length > schema.maxItems) {
      errors.push(`${fieldName}: máximo ${schema.maxItems} elementos`);
    }
    
    // Validar elementos del array
    if (schema.items) {
      value.forEach((item, index) => {
        const itemErrors = validateProperty(item, schema.items, `${fieldName}[${index}]`);
        errors.push(...itemErrors);
      });
    }
  }
  
  // Validar object
  if (schema.type === 'object' && schema.properties) {
    const objectErrors = validateSchema(value, schema);
    errors.push(...objectErrors.map(err => `${fieldName}.${err}`));
  }
  
  return errors;
}

/**
 * Aplica valores por defecto a un objeto basado en el esquema
 */
function applyDefaults(data, schema) {
  const result = { ...data };
  
  if (schema.properties) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (!(key in result) && 'default' in propSchema) {
        result[key] = propSchema.default;
      }
    }
  }
  
  return result;
}

/**
 * Sanitiza los datos de entrada
 */
function sanitizeData(data) {
  if (typeof data === 'string') {
    return data.trim().replace(/[<>]/g, ''); // Remover caracteres peligrosos
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeData(value);
    }
    return sanitized;
  }
  
  return data;
}

// === MIDDLEWARE PRINCIPAL ===

/**
 * Middleware de validación que se puede usar en cualquier endpoint
 */
export function validateRequest(schemaName) {
  return (req, res, next) => {
    try {
      const schema = schemas[schemaName];
      if (!schema) {
        return res.status(500).json({
          error: 'Esquema de validación no encontrado',
          schemaName
        });
      }
      
      // Sanitizar datos
      const sanitizedBody = sanitizeData(req.body || {});
      
      // Aplicar valores por defecto
      const dataWithDefaults = applyDefaults(sanitizedBody, schema);
      
      // Validar esquema
      const errors = validateSchema(dataWithDefaults, schema);
      
      if (errors.length > 0) {
        return res.status(400).json({
          error: 'Errores de validación',
          details: errors,
          received: sanitizedBody,
          schema: schemaName
        });
      }
      
      // Agregar datos validados al request
      req.validatedBody = dataWithDefaults;
      req.originalBody = req.body;
      
      next();
    } catch (error) {
      console.error('Error en validación:', error);
      res.status(500).json({
        error: 'Error interno de validación',
        message: error.message
      });
    }
  };
}

/**
 * Middleware de validación personalizada
 */
export function validateCustom(validatorFn) {
  return (req, res, next) => {
    try {
      const result = validatorFn(req.body);
      
      if (result.isValid) {
        req.validatedBody = result.data;
        next();
      } else {
        res.status(400).json({
          error: 'Validación personalizada falló',
          details: result.errors
        });
      }
    } catch (error) {
      console.error('Error en validación personalizada:', error);
      res.status(500).json({
        error: 'Error interno de validación',
        message: error.message
      });
    }
  };
}

// === UTILIDADES DE VALIDACIÓN ===

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
 * Valida que un string sea JSON válido
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
 * Exportaciones por defecto
 */
export default {
  schemas,
  validateRequest,
  validateCustom,
  isValidUrl,
  isValidEmail,
  isValidJSON
};