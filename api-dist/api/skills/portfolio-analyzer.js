import { GoogleGenAI } from '@google/genai';
import { checkSkillAccess, skillsRateLimit } from '../_middlewares/subscription-auth.js';
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
export default async function handler(req, res) {
    if (req.method === 'OPTIONS')
        return res.status(200).end();
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Method not allowed' });
    const wallet = req.headers['x-wallet-address'];
    const sub = await checkSkillAccess(req, res, 'portfolio-analyzer');
    if (!sub)
        return;
    const ok = await skillsRateLimit(req, res, wallet, sub.tier);
    if (!ok)
        return;
    const { walletAddress, chain = 'polygon', holdings = [], totalValueUSD, stakingPositions = [] } = req.body;
    if (!walletAddress) {
        return res.status(400).json({ error: 'Provide walletAddress.' });
    }
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
        const response = await client.models.generateContent({
            model: 'gemini-3.1-flash-lite-preview',
            contents: prompt,
            config: { temperature: 0.3, maxOutputTokens: 2000 },
        });
        const text = response.text || '';
        let parsed;
        try {
            parsed = JSON.parse(text);
        }
        catch {
            parsed = { raw: text };
        }
        return res.status(200).json({ success: true, result: parsed, skill: 'portfolio-analyzer' });
    }
    catch (err) {
        console.error('[skills/portfolio-analyzer]', err);
        return res.status(500).json({ error: 'AI generation failed' });
    }
}
