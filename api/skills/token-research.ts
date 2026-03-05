/**
 * POST /api/skills/token-research
 * Deep research report on any token: tokenomics, risks, comparatives.
 * Body: { tokenAddress: string, chain?: string, tokenSymbol?: string, tokenName?: string }
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
  const sub = await checkSkillAccess(req, res, 'token-research');
  if (!sub) return;
  const ok = await skillsRateLimit(req, res, wallet, sub.tier);
  if (!ok) return;

  const { tokenAddress, chain = 'polygon', tokenSymbol, tokenName, additionalContext } = req.body;

  if (!tokenAddress && !tokenSymbol) {
    return res.status(400).json({ error: 'Provide tokenAddress or tokenSymbol.' });
  }

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
    const response = await client.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: prompt,
      config: { temperature: 0.3, maxOutputTokens: 2500 },
    });

    const text = response.text || '';
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }

    return res.status(200).json({ success: true, result: parsed, skill: 'token-research' });
  } catch (err) {
    console.error('[skills/token-research]', err);
    return res.status(500).json({ error: 'AI generation failed' });
  }
}
