/**
 * NuxBee AI Subscription Configuration
 * Central source of truth for tiers, skills, pricing, and limits.
 *
 * Free    → 10 requests/day, Gemini 3.1 Flash Lite
 * Pro     → Unlimited chat, 3 core skills, Model selection (Gemini 3 Pro or Gemini 3 Flash) → $10/mo (SOL or NUX)
 * Premium → Unlimited chat, ALL skills, Model selection (Gemini 3 Pro or Gemini 3 Flash) → $25/mo (SOL or NUX)
 */

// ── Subscription tiers ──────────────────────────────────────────────────────
export type SubscriptionTier = 'free' | 'pro' | 'premium';
export type PaymentToken = 'SOL' | 'NUX';

export const FREE_DAILY_LIMIT = 10; // requests per day for free users

export const SUBSCRIPTION_PRICES: Record<
  Exclude<SubscriptionTier, 'free'>,
  { usd: number; nux: number; minSol: number; label: string }
> = {
  pro: {
    usd: 10,
    nux: 10_000,   // fixed NUX (post-TGE)
    minSol: 0.048, // ~$10 @ ~$208/SOL  — update if price drifts significantly
    label: '⚡ Pro',
  },
  premium: {
    usd: 25,
    nux: 25_000,
    minSol: 0.120,
    label: '💎 Premium',
  },
};

// ── Skill identifiers ────────────────────────────────────────────────────────
export type SkillId =
  | 'nft-listing'
  | 'risk-analysis'
  | 'market-alpha'
  | 'content-moderation'
  | 'contract-auditor'
  | 'whale-tracker'
  | 'portfolio-analyzer'
  | 'token-research'
  | 'liquidity-advisor';

export interface SkillDefinition {
  id: SkillId;
  label: string;
  description: string;
  icon: string;
  addonPriceUSD: number;   // monthly price if bought individually
  addonPriceNUX: number;
  includedIn: SubscriptionTier[]; // tiers that include this skill
}

export const SKILLS: Record<SkillId, SkillDefinition> = {
  'nft-listing': {
    id: 'nft-listing',
    label: 'NFT Listing Service',
    description: 'Generates SEO descriptions, traits, and copywriting for NFTs from IPFS or wallet',
    icon: '🖼️',
    addonPriceUSD: 0,
    addonPriceNUX: 0,
    includedIn: ['pro', 'premium'],
  },
  'risk-analysis': {
    id: 'risk-analysis',
    label: 'Risk Analysis Reports',
    description: 'Weekly on-chain risk scores for pools and tokens with multi-factor analysis',
    icon: '🔍',
    addonPriceUSD: 0,
    addonPriceNUX: 0,
    includedIn: ['pro', 'premium'],
  },
  'market-alpha': {
    id: 'market-alpha',
    label: 'Market Alpha',
    description: 'Narrative market insights for pools and liquidity using subgraph context',
    icon: '📈',
    addonPriceUSD: 0,
    addonPriceNUX: 0,
    includedIn: ['pro', 'premium'],
  },
  'content-moderation': {
    id: 'content-moderation',
    label: 'Content Moderation API',
    description: 'Classifies content as spam/scam/ok with detailed reasoning — API for external projects',
    icon: '🛡️',
    addonPriceUSD: 0,
    addonPriceNUX: 0,
    includedIn: ['premium'],
  },
  'contract-auditor': {
    id: 'contract-auditor',
    label: 'Smart Contract Auditor',
    description: 'Detects common vulnerabilities in EVM contract ABIs and bytecode',
    icon: '🔐',
    addonPriceUSD: 0,
    addonPriceNUX: 0,
    includedIn: ['premium'],
  },
  'whale-tracker': {
    id: 'whale-tracker',
    label: 'Whale Tracker Insights',
    description: 'Interprets large wallet movements in natural language with alerts',
    icon: '🐋',
    addonPriceUSD: 0,
    addonPriceNUX: 0,
    includedIn: ['premium'],
  },
  'portfolio-analyzer': {
    id: 'portfolio-analyzer',
    label: 'Portfolio Analyzer',
    description: 'Analyzes user portfolio (tokens, NFTs, LP positions) and suggests actions',
    icon: '💼',
    addonPriceUSD: 0,
    addonPriceNUX: 0,
    includedIn: ['premium'],
  },
  'token-research': {
    id: 'token-research',
    label: 'Token Deep Research',
    description: 'Deep research on any token: tokenomics, team, on-chain risks, and comparisons',
    icon: '🔬',
    addonPriceUSD: 0,
    addonPriceNUX: 0,
    includedIn: ['premium'],
  },
  'liquidity-advisor': {
    id: 'liquidity-advisor',
    label: 'Liquidity Advisor',
    description: 'Suggests optimal LP ranges on Uniswap v3/v4 based on historical volatility',
    icon: '💧',
    addonPriceUSD: 0,
    addonPriceNUX: 0,
    includedIn: ['premium'],
  },
};

// ── Skills included per tier ─────────────────────────────────────────────────
export const TIER_SKILLS: Record<SubscriptionTier, SkillId[]> = {
  free: [],
  pro: ['nft-listing', 'risk-analysis', 'market-alpha'],
  premium: Object.keys(SKILLS) as SkillId[],
};

// ── Firestore collection names ───────────────────────────────────────────────
export const SUBSCRIPTION_COLLECTION = 'subscriptions';
export const CHAT_USAGE_COLLECTION = 'chatUsage';

// ── AI Models ────────────────────────────────────────────────────────────────
export type GeminiModel = 'gemini-3.1-flash-lite' | 'gemini-pro' | 'gemini-flash';

export interface ModelDefinition {
  id: GeminiModel;
  label: string;
  description: string;
  availableIn: SubscriptionTier[];
  isDefault: boolean;
}

export const GEMINI_MODELS: Record<GeminiModel, ModelDefinition> = {
  'gemini-3.1-flash-lite': {
    id: 'gemini-3.1-flash-lite',
    label: 'Gemini 3.1 Flash Lite',
    description: 'Balanced speed & intelligence',
    availableIn: ['free', 'pro', 'premium'],
    isDefault: true,
  },
  'gemini-pro': {
    id: 'gemini-pro',
    label: 'Gemini 3 Pro',
    description: 'Most powerful model - best for complex analysis',
    availableIn: ['pro', 'premium'],
    isDefault: false,
  },
  'gemini-flash': {
    id: 'gemini-flash',
    label: 'Gemini 3 Flash',
    description: 'Fast and capable - great for quick insights',
    availableIn: ['pro', 'premium'],
    isDefault: false,
  },
};

// ── Tier metadata for UI ─────────────────────────────────────────────────────
export const TIER_META = {
  free: {
    color: 'gray',
    badge: '🆓 Free',
    chatLimit: `${FREE_DAILY_LIMIT} mensajes/día`,
    skillsLabel: 'Sin skills',
    modelLabel: 'Gemini 3.1 Flash Lite',
  },
  pro: {
    color: 'yellow',
    badge: '⚡ Pro',
    chatLimit: 'Chat ilimitado',
    skillsLabel: '3 Skills incluidas',
    modelLabel: 'Selecciona modelo (Pro o Flash)',
  },
  premium: {
    color: 'purple',
    badge: '💎 Premium',
    chatLimit: 'Chat ilimitado',
    skillsLabel: 'Todas las Skills',
    modelLabel: 'Selecciona modelo (Pro o Flash)',
  },
};
