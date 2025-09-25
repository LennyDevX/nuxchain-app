import { GoogleGenAI } from '@google/genai';
import env from './environment.js';

// Configuración para la API de Gemini
const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });

// Fix: Use gemini-2.5-flash-lite as confirmed by user
export const DEFAULT_MODEL = 'gemini-2.5-flash-lite'; // Use working model as default

// Available models with compatibility info - Valid Gemini models
export const AVAILABLE_MODELS = {
  'gemini-2.5-flash-lite': {
    name: 'gemini-2.5-flash-lite',
    isStable: true,
    supportsStreaming: true,
    maxTokens: 8192,
    isPreview: false,
    isDefault: true,
    temperatureRange: [0, 1]
  },
};

// Function to validate and get model info
export function getModelInfo(modelName) {
  return AVAILABLE_MODELS[modelName] || null;
}

// Function to get safe model name (fallback to working model)
export function getSafeModel(requestedModel) {
  const modelInfo = getModelInfo(requestedModel);
  
  let modelName;
  // If model exists and is stable, use it
  if (modelInfo && modelInfo.isStable) {
    modelName = requestedModel;
  }
  // If it's a preview model, warn but allow
  else if (modelInfo && modelInfo.isPreview) {
    console.warn(`Using preview model: ${requestedModel}. This may be unstable.`);
    modelName = requestedModel;
  }
  // Fallback to default working model
  else {
    console.warn(`Model ${requestedModel} not found or unstable. Falling back to ${DEFAULT_MODEL}`);
    modelName = DEFAULT_MODEL;
  }
  
  // Return the model name for use with ai.models.generateContent()
  return modelName;
}

export const defaultFunctionDeclaration = {
  name: 'controlLight',
  description: 'Set the brightness and color temperature of a room light.',
  parameters: {
    type: 'object',
    properties: {
      brightness: {
        type: 'number',
        description: 'Light level from 0 to 100. Zero is off and 100 is full brightness.'
      },
      colorTemperature: {
        type: 'string',
        description: 'Color temperature: daylight, cool, or warm.'
      }
    },
    required: ['brightness', 'colorTemperature']
  }
};

// URL Context tool declaration
export const urlContextFunctionDeclaration = {
  name: 'urlContext',
  description: 'Fetch and analyze content from a URL to provide context for the conversation.',
  parameters: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'The URL to fetch content from. Must be a valid HTTP or HTTPS URL.'
      },
      includeImages: {
        type: 'boolean',
        description: 'Whether to include images from the URL in the analysis. Default is false.'
      }
    },
    required: ['url']
  }
};



// Combined function declarations for tools
export const allFunctionDeclarations = [
  defaultFunctionDeclaration,
  urlContextFunctionDeclaration
];

export default ai;
