---
name: subscription-system
description: Extend the NuxChain subscription and skills tier system. Use when user says "add a new skill", "gate behind subscription", "subscription tier", "new skill ID", "paywall", "pro feature", "premium feature", "subscription price", "SkillId", or "checkSkillAccess". Covers adding skill IDs, tier gates, UI components, and new skill endpoints.
license: MIT
metadata:
  author: nuxchain
  version: '1.0.0'
---

# NuxChain Subscription System Skill

Add skill gates, new SkillIds, and tier-aware UI components.

## File Map

```
src/constants/subscription.ts       ← Tiers, prices, SkillId union, SKILLS record
src/context/SubscriptionContext.tsx  ← Provider: tier, dailyUsed, trackUsage
api/_middlewares/subscription-auth.ts ← checkSkillAccess(), skillsRateLimit()
api/subscriptions/
  status.ts                         ← GET tier + dailyUsed for wallet
  purchase.ts                       ← POST purchase (SOL/NUX/stripe)
  cancel.ts                         ← POST cancel
```

## Current Tiers

```typescript
type SubscriptionTier = 'free' | 'pro' | 'premium';

// Prices (src/constants/subscription.ts)
const SUBSCRIPTION_PRICES = {
  pro:     { usd: 10,  nux: 10_000, sol: 0.048 },
  premium: { usd: 25,  nux: 25_000, sol: 0.12  },
};
const FREE_DAILY_LIMIT = 10;  // requests/day (Pro/Premium = unlimited, -1)
```

## Current SkillId Union

```typescript
type SkillId =
  | 'nft-listing'
  | 'risk-analysis'
  | 'market-alpha'
  | 'content-moderation'
  | 'contract-auditor'
  | 'whale-tracker'
  | 'portfolio-analyzer'
  | 'token-research'
  | 'liquidity-advisor';
```

## Adding a New Skill — Full Checklist

### 1 — Add SkillId to `src/constants/subscription.ts`

```typescript
// Add to SkillId union:
type SkillId =
  | ... existing ...
  | 'my-new-skill';     // ← add here

// Add to SKILLS record:
const SKILLS: Record<SkillId, SkillDefinition> = {
  ...existing,
  'my-new-skill': {
    id: 'my-new-skill',
    name: 'My New Skill',
    description: 'What the skill does',
    requiredTier: 'pro',    // 'pro' | 'premium'
    icon: '🔍',
  },
};
```

### 2 — Create `api/skills/my-new-skill.ts`

```typescript
import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { checkSkillAccess, skillsRateLimit } from '../_middlewares/subscription-auth.js';

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export default async function handler(req: Request, res: Response) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const wallet = req.headers['x-wallet-address'] as string;
  const sub = await checkSkillAccess(req, res, 'my-new-skill');
  if (!sub) return;  // 401/402/403 already sent
  const ok = await skillsRateLimit(req, res, wallet, sub.tier);
  if (!ok) return;   // 429 already sent

  const { input } = req.body;
  // ... Gemini processing
  res.status(200).json({ success: true, data: result });
}
```

### 3 — Register in `vercel.json`

```json
"api/skills/my-new-skill.ts": {
  "maxDuration": 30,
  "memory": 1024
}
```

### 4 — Add to skill UI (optional — `src/pages/Skills.tsx`)

```tsx
// Skills page reads from SKILLS record automatically IF added there
```

## SubscriptionContext — Frontend Usage

```tsx
import { useSubscription } from '../../context/SubscriptionContext'

const {
  tier,              // 'free' | 'pro' | 'premium'
  isPaid,            // tier !== 'free'
  dailyUsed,         // number of requests used today (free tier)
  dailyLimit,        // FREE_DAILY_LIMIT or -1
  trackUsage,        // call after each request: trackUsage()
  isSkillAccess,     // (skillId: SkillId) => boolean
} = useSubscription()

// Gate UI behind tier:
if (!isSkillAccess('my-new-skill')) {
  return <UpgradePrompt requiredTier="pro" />
}
```

## Tier-Gate UI Pattern

```tsx
// Inline gate with upsell
{isPaid ? (
  <button onClick={runSkill}>Run Skill</button>
) : (
  <div className="border border-purple-500/30 rounded-xl p-4 bg-black/20">
    <p className="jersey-20-regular text-white/70 text-sm">
      🔒 Available on Pro plan
    </p>
    <button
      onClick={() => navigate('/subscriptions')}
      className="mt-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg jersey-20-regular text-sm"
    >
      Upgrade to Pro
    </button>
  </div>
)}
```

## checkSkillAccess Return Value

```typescript
interface SubscriptionStatus {
  tier: SubscriptionTier;
  isActive: boolean;
  dailyLimit: number;   // -1 = unlimited
  wallet: string;
}
// Returns null and sends 4xx response if access denied
// Returns SubscriptionStatus if access granted
```
