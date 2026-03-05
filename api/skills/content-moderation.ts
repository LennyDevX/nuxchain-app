/**
 * POST /api/skills/content-moderation
 * Classifies content as ok/spam/scam/harmful with reasoning.
 * Body: { content: string, context?: string, platform?: string }
 * Premium only — also available as B2B API for external projects.
 */
import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { checkSkillAccess, skillsRateLimit } from '../_middlewares/subscription-auth.js';

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export default async function handler(req: Request, res: Response) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const wallet = req.headers['x-wallet-address'] as string;
  const sub = await checkSkillAccess(req, res, 'content-moderation');
  if (!sub) return;
  const ok = await skillsRateLimit(req, res, wallet, sub.tier);
  if (!ok) return;

  const { content, context = 'Web3/DeFi platform', platform = 'NuxChain' } = req.body;

  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'Provide content string.' });
  }
  if (content.length > 5000) {
    return res.status(400).json({ error: 'Content too long. Max 5000 chars.' });
  }

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
    const response = await client.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: prompt,
      config: { temperature: 0.1, maxOutputTokens: 800 },
    });

    const text = response.text || '';
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }

    return res.status(200).json({ success: true, result: parsed, skill: 'content-moderation' });
  } catch (err) {
    console.error('[skills/content-moderation]', err);
    return res.status(500).json({ error: 'AI generation failed' });
  }
}
