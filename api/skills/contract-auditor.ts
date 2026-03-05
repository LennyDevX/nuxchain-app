/**
 * POST /api/skills/contract-auditor
 * Detects common EVM smart contract vulnerabilities from ABI or Solidity source.
 * Body: { abi?: object[], sourceCode?: string, contractName?: string, chain?: string }
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
  const sub = await checkSkillAccess(req, res, 'contract-auditor');
  if (!sub) return;
  const ok = await skillsRateLimit(req, res, wallet, sub.tier);
  if (!ok) return;

  const { abi, sourceCode, contractName = 'Unknown', chain = 'polygon' } = req.body;

  if (!abi && !sourceCode) {
    return res.status(400).json({ error: 'Provide abi array or sourceCode string.' });
  }

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
  "positives": ["Good practice found 1", "Good practice 2"],
  "gasOptimizations": ["Optimization 1", "Optimization 2"],
  "summary": "Executive summary paragraph",
  "recommendations": ["Top recommendation 1", "Top recommendation 2"],
  "auditNote": "This is an AI-assisted preliminary audit. Professional security review recommended before mainnet deployment."
}

Return ONLY the JSON object, no markdown fences.`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: prompt,
      config: { temperature: 0.1, maxOutputTokens: 3000 },
    });

    const text = response.text || '';
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }

    return res.status(200).json({ success: true, result: parsed, skill: 'contract-auditor' });
  } catch (err) {
    console.error('[skills/contract-auditor]', err);
    return res.status(500).json({ error: 'AI generation failed' });
  }
}
