/**
 * POST /api/skills/risk-analysis
 * On-chain risk score for a token or liquidity pool.
 * Body: { tokenAddress: string, chain?: string, tokenSymbol?: string }
 */
import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { checkSkillAccess, skillsRateLimit } from '../_middlewares/subscription-auth.js';

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export default async function handler(req: Request, res: Response) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const wallet = req.headers['x-wallet-address'] as string;
  const sub = await checkSkillAccess(req, res, 'risk-analysis');
  if (!sub) return;
  const ok = await skillsRateLimit(req, res, wallet, sub.tier);
  if (!ok) return;

  const { tokenAddress, chain = 'polygon', tokenSymbol, poolAddress, additionalContext } = req.body;

  if (!tokenAddress && !poolAddress) {
    return res.status(400).json({ error: 'Provide tokenAddress or poolAddress.' });
  }

  const prompt = `You are a DeFi risk analyst specialized in on-chain security and token analysis.

Perform a comprehensive risk analysis for:
- Token/Pool Address: ${tokenAddress || poolAddress}
- Symbol: ${tokenSymbol || 'Unknown'}
- Chain: ${chain}
- Additional context: ${additionalContext || 'None'}

Provide a detailed risk report in JSON format:
{
  "overallRiskScore": 75,  // 0-100, higher = more risky
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

Base your analysis on general DeFi risk frameworks, tokenomics analysis, and on-chain metrics.
Return ONLY the JSON object, no markdown fences.`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: prompt,
      config: { temperature: 0.2, maxOutputTokens: 2000 },
    });

    const text = response.text || '';
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }

    return res.status(200).json({ success: true, result: parsed, skill: 'risk-analysis' });
  } catch (err) {
    console.error('[skills/risk-analysis]', err);
    return res.status(500).json({ error: 'AI generation failed' });
  }
}
