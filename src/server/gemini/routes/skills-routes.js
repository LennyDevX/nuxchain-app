/**
 * 🧠 AI Skills Routes — Local Dev Server
 * =======================================
 * Mirrors all 9 production skill endpoints from api/skills/*.ts
 * No subscription tier gating in local dev — all skills freely accessible.
 *
 * Routes:
 *   POST /api/skills/risk-analysis
 *   POST /api/skills/nft-listing
 *   POST /api/skills/market-alpha
 *   POST /api/skills/content-moderation
 *   POST /api/skills/contract-auditor
 *   POST /api/skills/whale-tracker
 *   POST /api/skills/portfolio-analyzer
 *   POST /api/skills/token-research
 *   POST /api/skills/liquidity-advisor
 *
 * @module skills-routes
 */

import express from 'express';
import { GoogleGenAI } from '@google/genai';
import env from '../config/environment.js';

const router = express.Router();
const client = new GoogleGenAI({ apiKey: env.geminiApiKey });

const SKILL_MODEL = 'gemini-2.5-flash-lite-preview-06-17';
const SKILL_MODEL_FALLBACK = 'gemini-2.0-flash-lite';

/**
 * Helper: call Gemini and parse JSON response
 */
async function runSkillPrompt(prompt, maxOutputTokens = 2000, temperature = 0.3) {
  const response = await client.models.generateContent({
    model: SKILL_MODEL,
    contents: prompt,
    config: { temperature, maxOutputTokens },
  });
  const text = response.text || '';
  // Strip markdown fences if present
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  try { return JSON.parse(cleaned); } catch { return { raw: text }; }
}

// ─── 1. Risk Analysis ────────────────────────────────────────────────────────
router.post('/risk-analysis', async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { tokenAddress, chain = 'polygon', tokenSymbol, poolAddress, additionalContext } = req.body;
  if (!tokenAddress && !poolAddress)
    return res.status(400).json({ error: 'Provide tokenAddress or poolAddress.' });

  const prompt = `You are a DeFi risk analyst specialized in on-chain security and token analysis.

Perform a comprehensive risk analysis for:
- Token/Pool Address: ${tokenAddress || poolAddress}
- Symbol: ${tokenSymbol || 'Unknown'}
- Chain: ${chain}
- Additional context: ${additionalContext || 'None'}

Provide a detailed risk report in JSON format:
{
  "overallRiskScore": 75,
  "riskLevel": "Low | Medium | High | Critical",
  "summary": "One paragraph executive summary",
  "riskFactors": [
    {
      "category": "Liquidity | Contract | Team | Tokenomics | Market | Regulatory",
      "severity": "Low | Medium | High | Critical",
      "description": "Specific risk description",
      "mitigation": "How to mitigate this risk"
    }
  ],
  "positiveFactors": ["factor1", "factor2"],
  "recommendations": ["action1", "action2", "action3"],
  "investorProfile": "Only for: Sophisticated DeFi users | General crypto audience | Not recommended",
  "disclaimer": "Standard financial disclaimer"
}

Return ONLY the JSON object, no markdown fences.`;

  try {
    const result = await runSkillPrompt(prompt, 2000, 0.2);
    return res.status(200).json({ success: true, result, skill: 'risk-analysis' });
  } catch (err) {
    console.error('[skills/risk-analysis]', err);
    return res.status(500).json({ error: 'AI generation failed' });
  }
});

// ─── 2. NFT Listing Optimizer ─────────────────────────────────────────────────
router.post('/nft-listing', async (req, res) => {
  const { ipfsHash, nftAddress, collectionName, chain = 'polygon', additionalInfo } = req.body;
  if (!ipfsHash && !nftAddress)
    return res.status(400).json({ error: 'Provide ipfsHash or nftAddress.' });

  const prompt = `You are an expert NFT copywriter and SEO specialist for Web3 projects.

Generate a complete NFT listing package for the following NFT:
- Collection: ${collectionName || 'Unknown Collection'}
- Chain: ${chain}
- IPFS Hash: ${ipfsHash || 'N/A'}
- Contract/Address: ${nftAddress || 'N/A'}
- Additional info: ${additionalInfo || 'None'}

Provide the following in JSON format:
{
  "title": "Catchy NFT title (max 60 chars)",
  "seoDescription": "SEO-optimized description (150-160 chars for meta)",
  "longDescription": "Full listing description (200-400 words, compelling, Web3-native language)",
  "traits": [{"trait_type": "...", "value": "..."}, ...],
  "tags": ["tag1", "tag2", ...],
  "copywritingAngles": ["hook1", "hook2", "hook3"],
  "estimatedRarity": "Common | Uncommon | Rare | Epic | Legendary",
  "marketingHeadline": "Twitter/Discord announcement headline"
}

Return ONLY the JSON object, no markdown fences.`;

  try {
    const result = await runSkillPrompt(prompt, 1500, 0.7);
    return res.status(200).json({ success: true, result, skill: 'nft-listing' });
  } catch (err) {
    console.error('[skills/nft-listing]', err);
    return res.status(500).json({ error: 'AI generation failed' });
  }
});

// ─── 3. Market Alpha ──────────────────────────────────────────────────────────
router.post('/market-alpha', async (req, res) => {
  const { poolAddress, tokenA, tokenB, chain = 'polygon', tvl, volume24h, fee, additionalData } = req.body;

  const prompt = `You are a DeFi market analyst providing actionable alpha insights for liquidity providers and traders.

Analyze the following market data:
- Pool/Pair: ${tokenA || '?'} / ${tokenB || '?'}
- Pool Address: ${poolAddress || 'N/A'}
- Chain: ${chain}
- TVL: ${tvl ? `$${tvl}` : 'Unknown'}
- 24h Volume: ${volume24h ? `$${volume24h}` : 'Unknown'}
- Fee Tier: ${fee || 'Unknown'}
- Additional data: ${additionalData || 'None'}

Generate market intelligence in JSON:
{
  "headline": "Compelling one-line market insight",
  "marketCondition": "Bullish | Bearish | Neutral | Volatile | Accumulation",
  "liquidityHealth": "Healthy | Thin | Deep | Fragmented",
  "keyInsights": ["Insight 1...", "Insight 2...", "Insight 3..."],
  "opportunities": [
    {
      "type": "LP | Trade | Arbitrage | Yield",
      "description": "Specific opportunity",
      "timeframe": "Short-term (hours) | Medium-term (days) | Long-term (weeks)",
      "riskReward": "Low | Medium | High"
    }
  ],
  "risks": ["Risk 1", "Risk 2"],
  "priceOutlook": "Narrative price outlook paragraph",
  "actionItems": ["Action 1", "Action 2"],
  "confidence": "Low | Medium | High"
}

Return ONLY the JSON object, no markdown fences.`;

  try {
    const result = await runSkillPrompt(prompt, 1800, 0.4);
    return res.status(200).json({ success: true, result, skill: 'market-alpha' });
  } catch (err) {
    console.error('[skills/market-alpha]', err);
    return res.status(500).json({ error: 'AI generation failed' });
  }
});

// ─── 4. Content Moderation ────────────────────────────────────────────────────
router.post('/content-moderation', async (req, res) => {
  const { content, context = 'Web3/DeFi platform', platform = 'NuxChain' } = req.body;
  if (!content || typeof content !== 'string')
    return res.status(400).json({ error: 'Provide content string.' });
  if (content.length > 5000)
    return res.status(400).json({ error: 'Content too long. Max 5000 chars.' });

  const prompt = `You are a content moderation AI specialized in Web3, DeFi, and crypto communities.

Analyze the following content submitted on "${platform}" (${context}):

---
${content}
---

Classify and analyze in JSON:
{
  "verdict": "ok | spam | scam | harmful | suspicious",
  "confidence": 0.95,
  "category": "Safe | Spam | Phishing | Scam | HateSpeech | Misinformation | Inappropriate | Suspicious",
  "severity": "None | Low | Medium | High | Critical",
  "reasoning": "Detailed explanation of the classification",
  "flags": ["flag1", "flag2"],
  "redFlags": ["specific problematic elements found"],
  "action": "allow | review | flag | reject | ban",
  "editedContent": "Cleaned version if minor issues, null if major violation",
  "isWeb3Scam": true,
  "scamType": "Rug pull | Honeypot | Phishing | Fake airdrop | Impersonation | None"
}

Return ONLY the JSON object, no markdown fences.`;

  try {
    const result = await runSkillPrompt(prompt, 800, 0.1);
    return res.status(200).json({ success: true, result, skill: 'content-moderation' });
  } catch (err) {
    console.error('[skills/content-moderation]', err);
    return res.status(500).json({ error: 'AI generation failed' });
  }
});

// ─── 5. Contract Auditor ─────────────────────────────────────────────────────
router.post('/contract-auditor', async (req, res) => {
  const { abi, sourceCode, contractName = 'Unknown', chain = 'polygon' } = req.body;
  if (!abi && !sourceCode)
    return res.status(400).json({ error: 'Provide abi array or sourceCode string.' });

  const contractData = sourceCode
    ? `Solidity Source Code:\n${sourceCode.substring(0, 8000)}`
    : `ABI:\n${JSON.stringify(abi, null, 2).substring(0, 6000)}`;

  const prompt = `You are a senior smart contract security auditor with expertise in EVM/Solidity vulnerabilities.

Audit the following contract "${contractName}" on ${chain}:

${contractData}

Produce a security audit report in JSON:
{
  "contractName": "${contractName}",
  "overallRisk": "Low | Medium | High | Critical",
  "securityScore": 85,
  "vulnerabilities": [
    {
      "id": "V001",
      "name": "Vulnerability name",
      "severity": "Informational | Low | Medium | High | Critical",
      "category": "Reentrancy | AccessControl | IntegerOverflow | FrontRunning | OracleManipulation | CentralizationRisk | Other",
      "description": "Detailed description",
      "location": "Function/line if identifiable",
      "impact": "What could an attacker do",
      "recommendation": "How to fix it",
      "cweId": "CWE-XXX if applicable"
    }
  ],
  "positives": ["Good practice found 1"],
  "gasOptimizations": ["Optimization 1"],
  "summary": "Executive summary paragraph",
  "recommendations": ["Top recommendation 1", "Top recommendation 2"],
  "auditNote": "This is an AI-assisted preliminary audit. Professional security review recommended before mainnet deployment."
}

Return ONLY the JSON object, no markdown fences.`;

  try {
    const result = await runSkillPrompt(prompt, 3000, 0.1);
    return res.status(200).json({ success: true, result, skill: 'contract-auditor' });
  } catch (err) {
    console.error('[skills/contract-auditor]', err);
    return res.status(500).json({ error: 'AI generation failed' });
  }
});

// ─── 6. Whale Tracker ────────────────────────────────────────────────────────
router.post('/whale-tracker', async (req, res) => {
  const { walletAddress, chain = 'polygon', transactions = [], tokenSymbol, portfolioSnapshot } = req.body;
  if (!walletAddress)
    return res.status(400).json({ error: 'Provide walletAddress.' });

  const txContext = transactions.length > 0
    ? `Recent transactions: ${JSON.stringify(transactions.slice(0, 20), null, 2).substring(0, 3000)}`
    : 'No transaction data provided — analyze from address alone.';

  const portfolioContext = portfolioSnapshot
    ? `Portfolio snapshot: ${JSON.stringify(portfolioSnapshot).substring(0, 1000)}`
    : '';

  const prompt = `You are a crypto whale analyst specializing in on-chain behavior analysis.

Analyze whale wallet activity:
- Address: ${walletAddress}
- Chain: ${chain}
- Token Focus: ${tokenSymbol || 'All tokens'}
${txContext}
${portfolioContext}

Produce whale analysis in JSON:
{
  "walletProfile": "Known Whale | Smart Money | VC Wallet | Protocol Treasury | New Whale | Retail",
  "activityLevel": "Very Active | Active | Moderate | Dormant",
  "sentiment": "Strongly Bullish | Bullish | Neutral | Bearish | Strongly Bearish",
  "recentSignals": [
    {
      "signal": "Signal description",
      "type": "Accumulation | Distribution | Rotation | DeFi | NFT | Unknown",
      "significance": "Low | Medium | High",
      "timeframe": "When this signal occurred"
    }
  ],
  "narrative": "Full narrative paragraph interpretating the wallet's recent behavior",
  "watchItems": ["Thing to watch 1", "Thing to watch 2"],
  "copyTradeViability": "High | Medium | Low | Not recommended",
  "copyTradeReason": "Why or why not to copy trade this wallet",
  "alerts": ["Alert 1 if any unusual activity"]
}

Return ONLY the JSON object, no markdown fences.`;

  try {
    const result = await runSkillPrompt(prompt, 1500, 0.3);
    return res.status(200).json({ success: true, result, skill: 'whale-tracker' });
  } catch (err) {
    console.error('[skills/whale-tracker]', err);
    return res.status(500).json({ error: 'AI generation failed' });
  }
});

// ─── 7. Portfolio Analyzer ────────────────────────────────────────────────────
router.post('/portfolio-analyzer', async (req, res) => {
  const { walletAddress, chain = 'polygon', holdings = [], totalValueUSD, stakingPositions = [] } = req.body;
  if (!walletAddress)
    return res.status(400).json({ error: 'Provide walletAddress.' });

  const holdingsContext = holdings.length > 0
    ? JSON.stringify(holdings.slice(0, 30), null, 2).substring(0, 3000)
    : 'No holdings data provided.';

  const stakingContext = stakingPositions.length > 0
    ? JSON.stringify(stakingPositions, null, 2).substring(0, 1000)
    : 'No staking data provided.';

  const prompt = `You are a DeFi portfolio strategist and financial analyst for crypto-native investors.

Analyze this portfolio:
- Wallet: ${walletAddress}
- Chain: ${chain}
- Total Value: ${totalValueUSD ? `$${totalValueUSD}` : 'Unknown'}
- Holdings: ${holdingsContext}
- Staking positions: ${stakingContext}

Produce portfolio analysis in JSON:
{
  "portfolioGrade": "A | B | C | D | F",
  "diversificationScore": 75,
  "riskProfile": "Conservative | Balanced | Aggressive | Very Aggressive",
  "totalExposure": {
    "stablecoins": "30%",
    "blueChip": "40%",
    "midCap": "20%",
    "smallCap": "10%"
  },
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "actionItems": [
    {
      "priority": "High | Medium | Low",
      "action": "Specific action to take",
      "reason": "Why this is recommended",
      "impact": "Expected impact on portfolio"
    }
  ],
  "yieldOpportunities": [
    {
      "protocol": "Protocol name",
      "asset": "Asset",
      "estimatedAPY": "X%",
      "risk": "Low | Medium | High"
    }
  ],
  "narrative": "Full portfolio summary paragraph",
  "disclaimer": "Not financial advice. DYOR."
}

Return ONLY the JSON object, no markdown fences.`;

  try {
    const result = await runSkillPrompt(prompt, 2000, 0.3);
    return res.status(200).json({ success: true, result, skill: 'portfolio-analyzer' });
  } catch (err) {
    console.error('[skills/portfolio-analyzer]', err);
    return res.status(500).json({ error: 'AI generation failed' });
  }
});

// ─── 8. Token Research ────────────────────────────────────────────────────────
router.post('/token-research', async (req, res) => {
  const { tokenAddress, chain = 'polygon', tokenSymbol, tokenName, additionalContext } = req.body;
  if (!tokenAddress && !tokenSymbol)
    return res.status(400).json({ error: 'Provide tokenAddress or tokenSymbol.' });

  const prompt = `You are a senior crypto research analyst producing institutional-grade token research reports.

Research the following token:
- Address: ${tokenAddress || 'Unknown'}
- Symbol: ${tokenSymbol || 'Unknown'}
- Name: ${tokenName || 'Unknown'}
- Chain: ${chain}
- Context: ${additionalContext || 'None'}

Produce a comprehensive research report in JSON:
{
  "tokenName": "${tokenName || tokenSymbol || 'Unknown'}",
  "symbol": "${tokenSymbol || '?'}",
  "researchGrade": "A | B | C | D | F",
  "investmentThesis": "Paragraph describing the bull case",
  "bearCase": "Paragraph describing the risks",
  "tokenomics": {
    "supplyModel": "Deflationary | Inflationary | Fixed | Elastic",
    "distributionFairness": "Excellent | Good | Fair | Poor | Very Poor",
    "vestingRisks": "High | Medium | Low",
    "utilityStrength": "Strong | Moderate | Weak | None",
    "notes": "Key tokenomics observations"
  },
  "fundamentals": {
    "technologyScore": 70,
    "teamScore": 60,
    "communityScore": 80,
    "adoptionScore": 65,
    "overallFundamentalsScore": 69
  },
  "riskFactors": [
    {
      "risk": "Risk description",
      "severity": "Low | Medium | High | Critical",
      "probability": "Low | Medium | High"
    }
  ],
  "catalysts": ["Upcoming catalyst 1", "Catalyst 2"],
  "comparables": ["Similar token 1", "Similar token 2"],
  "verdict": "Strong Buy | Buy | Hold | Avoid | Strong Avoid",
  "priceOutlook": "Short to medium term price thesis",
  "disclaimer": "Not financial advice. Research only."
}

Return ONLY the JSON object, no markdown fences.`;

  try {
    const result = await runSkillPrompt(prompt, 2500, 0.3);
    return res.status(200).json({ success: true, result, skill: 'token-research' });
  } catch (err) {
    console.error('[skills/token-research]', err);
    return res.status(500).json({ error: 'AI generation failed' });
  }
});

// ─── 9. Liquidity Advisor ─────────────────────────────────────────────────────
router.post('/liquidity-advisor', async (req, res) => {
  const {
    tokenA,
    tokenB,
    feeTier = 3000,
    chain = 'polygon',
    currentPrice,
    investmentAmount,
    riskTolerance = 'medium',
    additionalContext,
  } = req.body;

  if (!tokenA || !tokenB)
    return res.status(400).json({ error: 'Provide tokenA and tokenB.' });

  const prompt = `You are an expert Uniswap v3/v4 liquidity strategist specialized in concentrated liquidity positions.

Advise on the optimal LP position for:
- Pair: ${tokenA} / ${tokenB}
- Fee Tier: ${feeTier} (${feeTier / 10000}%)
- Chain: ${chain}
- Current Price: ${currentPrice || 'Unknown'}
- Investment Amount: ${investmentAmount ? `$${investmentAmount}` : 'Unknown'}
- Risk Tolerance: ${riskTolerance}
- Additional context: ${additionalContext || 'None'}

Generate LP strategy in JSON:
{
  "pairProfile": "Stable-Stable | Stable-Volatile | Volatile-Volatile | Correlated",
  "recommendedFeeTier": 3000,
  "priceRangeStrategy": "Narrow | Moderate | Wide | Full Range",
  "strategyType": "Concentrated | Balanced | Wide Range",
  "impermanentLossRisk": "High | Medium | Low",
  "expectedFeeAPR": "X",
  "optimalRange": {
    "lower": 1.05,
    "upper": 1.15,
    "width": "±5% around current price"
  },
  "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
  "risks": ["Risk 1", "Risk 2"],
  "suggestedRanges": [
    {
      "label": "Conservative",
      "lowerBound": "price or % below current",
      "upperBound": "price or % above current",
      "capitalEfficiency": "High | Medium | Low",
      "impermanentLossRisk": "High | Medium | Low",
      "estimatedAPR": "X-Y%",
      "rebalanceFrequency": "Daily | Weekly | Monthly | Rarely"
    }
  ],
  "impermanentLossWarning": "Specific IL warning for this pair",
  "narrative": "Full strategy explanation paragraph",
  "disclaimer": "Not financial advice. LP positions carry risks including impermanent loss."
}

Return ONLY the JSON object, no markdown fences.`;

  try {
    const result = await runSkillPrompt(prompt, 2000, 0.3);
    return res.status(200).json({ success: true, result, skill: 'liquidity-advisor' });
  } catch (err) {
    console.error('[skills/liquidity-advisor]', err);
    return res.status(500).json({ error: 'AI generation failed' });
  }
});

export default router;
