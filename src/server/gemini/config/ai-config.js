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

// ============================================================================
// BLOCKCHAIN FUNCTION DECLARATIONS
// ============================================================================

export const getPolPriceFunctionDeclaration = {
  name: 'get_pol_price',
  description: `Get the current POL (Polygon/MATIC) token price and market data.
Use when user asks about POL price, market cap, volume, or 24h change.
Returns: price in USD, 24h change percentage, market cap, volume.`,
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
};

export const getStakingInfoFunctionDeclaration = {
  name: 'get_staking_info',
  description: `Get Nuxchain smart staking contract statistics.
Use when user asks about staking APY, total staked, participants, or rewards.
Returns: total staked amount, APY (125%), participant count, rewards paid.`,
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
};

export const getNftListingsFunctionDeclaration = {
  name: 'get_nft_listings',
  description: `Get NFT marketplace listings from Nuxchain Skills marketplace.
Use when user asks about NFTs for sale, floor price, or marketplace activity.
Returns: active listings with prices, floor price, total volume.`,
  parameters: {
    type: 'object',
    properties: {
      limit: {
        type: 'integer',
        description: 'Max listings to return (1-50). Default: 10',
      },
      sort_by: {
        type: 'string',
        enum: ['price', 'recent'],
        description: 'Sort by price or recent. Default: recent',
      },
    },
    required: [],
  },
};

export const checkWalletBalanceFunctionDeclaration = {
  name: 'check_wallet_balance',
  description: `Check POL balance and staking info for a wallet address.
ONLY use when user explicitly provides a wallet address (0x...).
Do NOT ask for wallet addresses - respect privacy.
Returns: POL balance, USD value, staked amount, pending rewards.`,
  parameters: {
    type: 'object',
    properties: {
      address: {
        type: 'string',
        description: 'Ethereum/Polygon wallet address (must start with 0x)',
      },
    },
    required: ['address'],
  },
};

export const estimateStakingRewardFunctionDeclaration = {
  name: 'estimate_staking_reward',
  description: `Calculate estimated staking rewards for amount and duration.
Use when user asks "how much would I earn staking X POL for Y days?"
Considers base APY (125%) and lock bonus (+25% for locked).
Returns: estimated reward in POL and USD, effective APY, lock bonus.`,
  parameters: {
    type: 'object',
    properties: {
      amount: {
        type: 'number',
        description: 'Amount of POL to stake (must be > 0)',
      },
      duration_days: {
        type: 'integer',
        description: 'Number of days to stake (1-365)',
      },
      is_locked: {
        type: 'boolean',
        description: 'Use locked staking (+25% bonus). Default: false',
      },
    },
    required: ['amount', 'duration_days'],
  },
};

// Combined blockchain function declarations
export const blockchainFunctionDeclarations = [
  getPolPriceFunctionDeclaration,
  getStakingInfoFunctionDeclaration,
  getNftListingsFunctionDeclaration,
  checkWalletBalanceFunctionDeclaration,
  estimateStakingRewardFunctionDeclaration,
];

// All function names for tool config
export const blockchainFunctionNames = [
  'get_pol_price',
  'get_staking_info',
  'get_nft_listings',
  'check_wallet_balance',
  'estimate_staking_reward',
];

// Combined all function declarations (for backwards compatibility)
export const allFunctionDeclarations = blockchainFunctionDeclarations;

export default ai;
