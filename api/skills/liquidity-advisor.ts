/**
 * POST /api/skills/liquidity-advisor
 * Suggests optimal LP ranges for Uniswap v3/v4 based on volatility.
 * Body: { tokenA: string, tokenB: string, feeTier?: number, chain?: string, currentPrice?: number }
 * Premium only.
 */
import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { checkSkillAccess, skillsRateLimit } from '../_middlewares/subscription-auth.js';

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export default async function handler(req: Request, res: Response) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const wallet = req.headers['x-wallet-address'] as string;
  const sub = await checkSkillAccess(req, res, 'liquidity-advisor');
  if (!sub) return;
  const ok = await skillsRateLimit(req, res, wallet, sub.tier);
  if (!ok) return;

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

  if (!tokenA || !tokenB) {
    return res.status(400).json({ error: 'Provide tokenA and tokenB.' });
  }

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
  "suggestedRanges": [
    {
      "label": "Conservative",
      "lowerBound": "price or % below current",
      "upperBound": "price or % above current",
      "capitalEfficiency": "High | Medium | Low",
      "impermanentLossRisk": "High | Medium | Low",
      "estimatedAPR": "X-Y%",
      "rebalanceFrequency": "Daily | Weekly | Monthly | Rarely"
    },
    {
      "label": "Balanced",
      ...
    },
    {
      "label": "Aggressive",
      ...
    }
  ],
  "impermanentLossWarning": "Specific IL warning for this pair",
  "compoundingStrategy": "How to compound rewards",
  "exitConditions": ["When to exit the position 1", "Condition 2"],
  "hedgingTips": ["Tip 1", "Tip 2"],
  "narrative": "Full strategy explanation paragraph",
  "disclaimer": "Not financial advice. LP positions carry risks including impermanent loss."
}

Return ONLY the JSON object, no markdown fences.`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: prompt,
      config: { temperature: 0.3, maxOutputTokens: 2000 },
    });

    const text = response.text || '';
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }

    return res.status(200).json({ success: true, result: parsed, skill: 'liquidity-advisor' });
  } catch (err) {
    console.error('[skills/liquidity-advisor]', err);
    return res.status(500).json({ error: 'AI generation failed' });
  }
}
