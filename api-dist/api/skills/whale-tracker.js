import { GoogleGenAI } from '@google/genai';
import { checkSkillAccess, skillsRateLimit } from '../_middlewares/subscription-auth.js';
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
export default async function handler(req, res) {
    if (req.method === 'OPTIONS')
        return res.status(200).end();
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Method not allowed' });
    const wallet = req.headers['x-wallet-address'];
    const sub = await checkSkillAccess(req, res, 'whale-tracker');
    if (!sub)
        return;
    const ok = await skillsRateLimit(req, res, wallet, sub.tier);
    if (!ok)
        return;
    const { walletAddress, chain = 'polygon', transactions = [], tokenSymbol, portfolioSnapshot, } = req.body;
    if (!walletAddress) {
        return res.status(400).json({ error: 'Provide walletAddress.' });
    }
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
        const response = await client.models.generateContent({
            model: 'gemini-3.1-flash-lite-preview',
            contents: prompt,
            config: { temperature: 0.3, maxOutputTokens: 1500 },
        });
        const text = response.text || '';
        let parsed;
        try {
            parsed = JSON.parse(text);
        }
        catch {
            parsed = { raw: text };
        }
        return res.status(200).json({ success: true, result: parsed, skill: 'whale-tracker' });
    }
    catch (err) {
        console.error('[skills/whale-tracker]', err);
        return res.status(500).json({ error: 'AI generation failed' });
    }
}
