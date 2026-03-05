/**
 * NuxBee AI Subscription Configuration
 * Central source of truth for tiers, skills, pricing, and limits.
 *
 * Free    → 10 requests/day, Gemini 3.1 Flash Lite
 * Pro     → Unlimited chat, 3 core skills, Model selection (Gemini 3 Pro or Gemini 3 Flash) → $10/mo (SOL or NUX)
 * Premium → Unlimited chat, ALL skills, Model selection (Gemini 3 Pro or Gemini 3 Flash) → $25/mo (SOL or NUX)
 */
export const FREE_DAILY_LIMIT = 10; // requests per day for free users
export const SUBSCRIPTION_PRICES = {
    pro: {
        usd: 10,
        nux: 10_000, // fixed NUX (post-TGE)
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
export const SKILLS = {
    'nft-listing': {
        id: 'nft-listing',
        label: 'NFT Listing Service',
        description: 'Genera descripción SEO, traits y copywriting para NFTs desde IPFS o wallet',
        icon: '🖼️',
        addonPriceUSD: 0,
        addonPriceNUX: 0,
        includedIn: ['pro', 'premium'],
    },
    'risk-analysis': {
        id: 'risk-analysis',
        label: 'Risk Analysis Reports',
        description: 'Score de riesgo on-chain semanal para pools y tokens con análisis multi-factor',
        icon: '🔍',
        addonPriceUSD: 0,
        addonPriceNUX: 0,
        includedIn: ['pro', 'premium'],
    },
    'market-alpha': {
        id: 'market-alpha',
        label: 'Market Alpha',
        description: 'Insights narrativos de mercado, pools y liquidez con contexto de subgraph',
        icon: '📈',
        addonPriceUSD: 0,
        addonPriceNUX: 0,
        includedIn: ['pro', 'premium'],
    },
    'content-moderation': {
        id: 'content-moderation',
        label: 'Content Moderation API',
        description: 'Clasifica contenido como spam/scam/ok con reasoning detallado — API para proyectos externos',
        icon: '🛡️',
        addonPriceUSD: 0,
        addonPriceNUX: 0,
        includedIn: ['premium'],
    },
    'contract-auditor': {
        id: 'contract-auditor',
        label: 'Smart Contract Auditor',
        description: 'Detecta vulnerabilidades comunes en ABIs y bytecode de contratos EVM',
        icon: '🔐',
        addonPriceUSD: 0,
        addonPriceNUX: 0,
        includedIn: ['premium'],
    },
    'whale-tracker': {
        id: 'whale-tracker',
        label: 'Whale Tracker Insights',
        description: 'Interpreta movimientos de wallets grandes en lenguaje natural con alertas',
        icon: '🐋',
        addonPriceUSD: 0,
        addonPriceNUX: 0,
        includedIn: ['premium'],
    },
    'portfolio-analyzer': {
        id: 'portfolio-analyzer',
        label: 'Portfolio Analyzer',
        description: 'Analiza el portfolio del usuario (tokens, NFTs, posiciones LP) y sugiere acciones',
        icon: '💼',
        addonPriceUSD: 0,
        addonPriceNUX: 0,
        includedIn: ['premium'],
    },
    'token-research': {
        id: 'token-research',
        label: 'Token Deep Research',
        description: 'Research profundo de cualquier token: tokenomics, team, on-chain risks, y comparativas',
        icon: '🔬',
        addonPriceUSD: 0,
        addonPriceNUX: 0,
        includedIn: ['premium'],
    },
    'liquidity-advisor': {
        id: 'liquidity-advisor',
        label: 'Liquidity Advisor',
        description: 'Sugiere rangos óptimos de LP en Uniswap v3/v4 basado en volatilidad histórica',
        icon: '💧',
        addonPriceUSD: 0,
        addonPriceNUX: 0,
        includedIn: ['premium'],
    },
};
// ── Skills included per tier ─────────────────────────────────────────────────
export const TIER_SKILLS = {
    free: [],
    pro: ['nft-listing', 'risk-analysis', 'market-alpha'],
    premium: Object.keys(SKILLS),
};
// ── Firestore collection names ───────────────────────────────────────────────
export const SUBSCRIPTION_COLLECTION = 'subscriptions';
export const CHAT_USAGE_COLLECTION = 'chatUsage';
export const GEMINI_MODELS = {
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
