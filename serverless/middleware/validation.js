/**
 * Sistema de Validación Uniforme para Serverless - NuxChain App
 * Validación consistente de inputs y parámetros
 */

/**
 * Esquemas de validación comunes
 */
export const validationSchemas = {
  url: {
    type: 'string',
    pattern: '^https?:\\/\\/.+',
    minLength: 10,
    maxLength: 2048
  },
  
  text: {
    type: 'string',
    minLength: 1,
    maxLength: 10000
  },
  
  shortText: {
    type: 'string',
    minLength: 1,
    maxLength: 500
  },
  
  email: {
    type: 'string',
    pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
  },
  
  apiKey: {
    type: 'string',
    minLength: 10,
    maxLength: 100
  },
  
  positiveInteger: {
    type: 'integer',
    minimum: 1
  },
  
  boolean: {
    type: 'boolean'
  }
};

/**
 * Validar un valor contra un esquema
 * @param {any} value - Valor a validar
 * @param {Object} schema - Esquema de validación
 * @param {string} fieldName - Nombre del campo para errores
 * @returns {Object} Resultado de validación
 */
export const validateField = (value, schema, fieldName = 'field') => {
  const errors = [];

  // Verificar tipo
  if (schema.type) {
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (actualType !== schema.type) {
      errors.push(`${fieldName} debe ser de tipo ${schema.type}`);
      return { valid: false, errors };
    }
  }

  // Validaciones para strings
  if (schema.type === 'string' && typeof value === 'string') {
    if (schema.minLength && value.length < schema.minLength) {
      errors.push(`${fieldName} debe tener al menos ${schema.minLength} caracteres`);
    }
    
    if (schema.maxLength && value.length > schema.maxLength) {
      errors.push(`${fieldName} debe tener máximo ${schema.maxLength} caracteres`);
    }
    
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      errors.push(`${fieldName} tiene un formato inválido`);
    }
  }

  // Validaciones para números
  if (schema.type === 'integer' || schema.type === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push(`${fieldName} debe ser mayor o igual a ${schema.minimum}`);
    }
    
    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push(`${fieldName} debe ser menor o igual a ${schema.maximum}`);
    }
  }

  // Validaciones para arrays
  if (schema.type === 'array' && Array.isArray(value)) {
    if (schema.minItems && value.length < schema.minItems) {
      errors.push(`${fieldName} debe tener al menos ${schema.minItems} elementos`);
    }
    
    if (schema.maxItems && value.length > schema.maxItems) {
      errors.push(`${fieldName} debe tener máximo ${schema.maxItems} elementos`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validar un objeto completo contra un esquema
 * @param {Object} data - Datos a validar
 * @param {Object} schema - Esquema de validación
 * @returns {Object} Resultado de validación
 */
export const validateObject = (data, schema) => {
  const errors = [];
  const validatedData = {};

  // Verificar campos requeridos
  if (schema.required) {
    for (const field of schema.required) {
      if (!(field in data) || data[field] === undefined || data[field] === null) {
        errors.push(`El campo '${field}' es requerido`);
      }
    }
  }

  // Validar cada campo
  if (schema.properties) {
    for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
      if (fieldName in data) {
        const fieldResult = validateField(data[fieldName], fieldSchema, fieldName);
        
        if (!fieldResult.valid) {
          errors.push(...fieldResult.errors);
        } else {
          validatedData[fieldName] = data[fieldName];
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    data: validatedData
  };
};

/**
 * Middleware de validación para requests
 * @param {Object} schema - Esquema de validación
 * @param {string} source - Fuente de datos ('body', 'query', 'params')
 * @returns {Function} Middleware function
 */
export const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      let data;
      
      switch (source) {
        case 'body':
          data = req.body;
          break;
        case 'query':
          data = req.query;
          break;
        case 'params':
          data = req.params;
          break;
        default:
          data = req.body;
      }

      const result = validateObject(data, schema);
      
      if (!result.valid) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: result.errors,
          timestamp: new Date().toISOString()
        });
      }

      // Agregar datos validados al request
      req.validated = req.validated || {};
      req.validated[source] = result.data;
      
      next();
    } catch (error) {
      console.error('Error en validación:', error);
      return res.status(500).json({
        error: 'Error interno en validación',
        timestamp: new Date().toISOString()
      });
    }
  };
};

/**
 * Esquemas predefinidos para endpoints comunes
 */
export const commonSchemas = {
  scrapeUrl: {
    type: 'object',
    required: ['url'],
    properties: {
      url: validationSchemas.url,
      options: {
        type: 'object',
        properties: {
          timeout: validationSchemas.positiveInteger,
          waitFor: validationSchemas.shortText,
          extractImages: validationSchemas.boolean
        }
      }
    }
  },
  
  geminiRequest: {
    type: 'object',
    required: ['prompt'],
    properties: {
      prompt: validationSchemas.text,
      model: validationSchemas.shortText,
      temperature: {
        type: 'number',
        minimum: 0,
        maximum: 2
      },
      maxTokens: validationSchemas.positiveInteger
    }
  },
  
  chatMessage: {
    type: 'object',
    required: ['message'],
    properties: {
      message: validationSchemas.text,
      conversationId: validationSchemas.shortText,
      useTools: validationSchemas.boolean,
      stream: validationSchemas.boolean
    }
  },
  
  embeddingSearch: {
    type: 'object',
    required: ['query'],
    properties: {
      query: validationSchemas.text,
      limit: validationSchemas.positiveInteger,
      threshold: {
        type: 'number',
        minimum: 0,
        maximum: 1
      }
    }
  }
};

export default {
  validationSchemas,
  validateField,
  validateObject,
  validateRequest,
  commonSchemas
};