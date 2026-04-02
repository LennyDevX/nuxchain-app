/**
 * Dynamic Skills Router
 * Consolidates all skill endpoints into a single Serverless Function
 * 
 * Routes:
 * POST /api/skills/nft-listing
 * POST /api/skills/risk-analysis
 * POST /api/skills/market-alpha
 * POST /api/skills/content-moderation
 * POST /api/skills/contract-auditor
 * POST /api/skills/whale-tracker
 * POST /api/skills/portfolio-analyzer
 * POST /api/skills/token-research
 * POST /api/skills/liquidity-advisor
 */

import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { checkSkillAccess, skillsRateLimit } from '../_middlewares/subscription-auth.js';
import { SKILLS, type SkillId } from '../../src/constants/subscription.js';

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SKILL_PROMPTS: Record<SkillId, (body: any) => string> = {
  'nft-listing': (body) => `You are an expert NFT copywriter and SEO specialist for Web3 projects.

Generate a complete NFT listing package for:
- Collection: ${body.collectionName || 'Unknown Collection'}
- Chain: ${body.chain || 'polygon'}
- IPFS Hash: ${body.ipfsHash || 'N/A'}
- Contract: ${body.nftAddress || 'N/A'}

Provide JSON: { title, seoDescription, longDescription, traits, tags, copywritingAngles, estimatedRarity, marketingHeadline }
Return ONLY JSON, no markdown.`,

  'risk-analysis': (body) => `You are a DeFi risk analyst.

Analyze:
- Address: ${body.tokenAddress || body.poolAddress}
- Symbol: ${body.tokenSymbol || 'Unknown'}
- Chain: ${body.chain || 'polygon'}

Return JSON: { overallRiskScore, riskLevel, summary, riskFactors, positiveFactors, recommendations, investorProfile, disclaimer }
Return ONLY JSON, no markdown.`,

  'market-alpha': (body) => `You are a crypto market analyst finding alpha opportunities.

Analyze for: ${body.focus || 'emerging opportunities'}
Context: ${body.context || 'general market'}

Return JSON with market insights, opportunities, risks, and recommendations.
Return ONLY JSON, no markdown.`,

  'content-moderation': (body) => `You are a content moderation expert for Web3/crypto communities.

Evaluate: "${body.content || ''}"
Context: ${body.context || 'general'}

Return JSON: { score (0-100), category, isSafe, reason, recommendation }
Return ONLY JSON, no markdown.`,

  'contract-auditor': (body) => `You are a smart contract security auditor.

Review contract:
- Address: ${body.contractAddress}
- Code excerpt: ${body.codeExcerpt || 'Not provided'}
- Chain: ${body.chain || 'polygon'}

Return JSON: { securityScore, risks, warnings, suggestions }
Return ONLY JSON, no markdown.`,

  'whale-tracker': (body) => `You are a blockchain analyst tracking large transactions.

Analyze whale activity for: ${body.asset || 'general market'}
Wallet: ${body.walletAddress || 'not specified'}

Return JSON: { activityLevel, transactionPatterns, implications, alerts }
Return ONLY JSON, no markdown.`,

  'portfolio-analyzer': (body) => `You are a crypto portfolio analyst.

Analyze portfolio: ${body.portfolioDescription || 'user portfolio'}
Risk tolerance: ${body.riskTolerance || 'moderate'}

Return JSON: { diversification, riskMetrics, optimization, recommendations }
Return ONLY JSON, no markdown.`,

  'token-research': (body) => `You are a token researcher providing fundamental analysis.

Research token: ${body.tokenSymbol || 'unknown'}
Address: ${body.tokenAddress}
Chain: ${body.chain || 'polygon'}

Return JSON: { fundamentals, narrative, risks, opportunities, rating }
Return ONLY JSON, no markdown.`,

  'liquidity-advisor': (body) => `You are a liquidity provision advisor.

Advise on LP: ${body.tokenPair || 'unknown pair'}
Chain: ${body.chain || 'polygon'}
Capital: ${body.capitalAmount || 'unspecified'}

Return JSON: { poolRecommendation, riskAssessment, strategyAdvice, recommendations }
Return ONLY JSON, no markdown.`,
};

export default async function handler(req: Request, res: Response) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const skillIdParam = req.query.skillId;

  if (typeof skillIdParam !== 'string' || !(skillIdParam in SKILLS)) {
    return res.status(400).json({ error: `Unknown skill: ${String(skillIdParam)}` });
  }

  const skillId = skillIdParam as SkillId;

  const wallet = req.headers['x-wallet-address'] as string;
  const sub = await checkSkillAccess(req, res, skillId);
  if (!sub) return;
  
  const ok = await skillsRateLimit(req, res, wallet, sub.tier);
  if (!ok) return;

  try {
    const prompt = SKILL_PROMPTS[skillId](req.body);
    
    const response = await client.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: prompt,
      config: { temperature: 0.7, maxOutputTokens: 2000 },
    });

    const text = response.text || '';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { raw: text };
    }

    return res.status(200).json({ success: true, result: parsed, skill: skillId });
  } catch (err) {
    console.error(`[skills/${skillId}]`, err);
    return res.status(500).json({ error: `AI generation failed for skill: ${skillId}` });
  }
}
