/**
 * POST /api/skills/nft-listing
 * Generates SEO description, traits, and copywriting for an NFT.
 * Body: { ipfsHash?: string, nftAddress?: string, collectionName?: string, chain?: string }
 */
import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { checkSkillAccess, skillsRateLimit } from '../_middlewares/subscription-auth.js';

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export default async function handler(req: Request, res: Response) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const wallet = req.headers['x-wallet-address'] as string;
  const sub = await checkSkillAccess(req, res, 'nft-listing');
  if (!sub) return;
  const ok = await skillsRateLimit(req, res, wallet, sub.tier);
  if (!ok) return;

  const { ipfsHash, nftAddress, collectionName, chain = 'polygon', additionalInfo } = req.body;

  if (!ipfsHash && !nftAddress) {
    return res.status(400).json({ error: 'Provide ipfsHash or nftAddress.' });
  }

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
    const response = await client.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: prompt,
      config: { temperature: 0.7, maxOutputTokens: 1500 },
    });

    const text = response.text || '';
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }

    return res.status(200).json({ success: true, result: parsed, skill: 'nft-listing' });
  } catch (err) {
    console.error('[skills/nft-listing]', err);
    return res.status(500).json({ error: 'AI generation failed' });
  }
}
