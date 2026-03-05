/**
 * POST /api/skills/market-alpha
 * Narrative market insights for a pool or token pair.
 * Body: { poolAddress?: string, tokenA?: string, tokenB?: string, chain?: string }
 */
import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { checkSkillAccess, skillsRateLimit } from '../_middlewares/subscription-auth.js';

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export default async function handler(req: Request, res: Response) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const wallet = req.headers['x-wallet-address'] as string;
  const sub = await checkSkillAccess(req, res, 'market-alpha');
  if (!sub) return;
  const ok = await skillsRateLimit(req, res, wallet, sub.tier);
  if (!ok) return;

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
  "keyInsights": [
    "Insight 1 with specific actionable detail",
    "Insight 2...",
    "Insight 3..."
  ],
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
    const response = await client.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: prompt,
      config: { temperature: 0.4, maxOutputTokens: 1800 },
    });

    const text = response.text || '';
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }

    return res.status(200).json({ success: true, result: parsed, skill: 'market-alpha' });
  } catch (err) {
    console.error('[skills/market-alpha]', err);
    return res.status(500).json({ error: 'AI generation failed' });
  }
}
