---
name: vercel-api-endpoint
description: Create a new Vercel serverless API endpoint for NuxChain. Use when user says "create an API", "new endpoint", "add a route to /api/", "serverless function", or needs a backend handler. Enforces the project's pattern: TypeScript, withSecurity wrapper, kvCache, rate limiting, CORS, wallet-auth, subscription-auth, error handling, and vercel.json registration.

license: MIT
metadata:
  author: nuxchain
  version: '2.0.0'
---

# NuxChain Vercel API Endpoint Skill

Create serverless Vercel endpoints following the exact NuxChain backend patterns.

## File Structure

```
api/
  <namespace>/
    <action>.ts          ← e.g. api/market/prices.ts
  _middlewares/
    serverless-security.ts  ← withSecurity() — ALWAYS wrap handler
    wallet-auth.ts          ← verifyWalletSignature()
    subscription-auth.ts    ← checkSkillAccess(), skillsRateLimit()
  _services/
    kv-cache-service.ts    ← kvCache.get/set
    firebase-admin.ts      ← getDb() for Firestore access
```

## ⚠️ MANDATORY: Register in vercel.json

```json
// vercel.json — functions block
"api/your-namespace/action.ts": {
  "maxDuration": 10,
  "memory": 256
}
// memory options: 256 (simple), 512 (data fetch), 1024 (AI/IPFS)
// maxDuration: 10 (fast), 20 (transactions), 30 (AI/uploads), 60 (streaming)
```

## Template A — Public read-only endpoint

```typescript
// api/market/my-data.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withSecurity } from '../_middlewares/serverless-security.js';
import { kvCache } from '../_services/kv-cache-service.js';

const CACHE_TTL = 30; // seconds

async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const cacheKey = 'my-data-key';
  const cached = await kvCache.get<MyDataType>(cacheKey, {
    namespace: 'my-namespace', ttl: CACHE_TTL,
  });

  if (cached) {
    res.setHeader('X-Cache', 'HIT');
    res.status(200).json({ success: true, data: cached, cached: true });
    return;
  }

  const data = await fetchMyData();
  await kvCache.set(cacheKey, data, { namespace: 'my-namespace', ttl: CACHE_TTL });

  res.setHeader('X-Cache', 'MISS');
  res.status(200).json({ success: true, data, cached: false, timestamp: Date.now() });
}

export default withSecurity(handler);
```

## Template B — Wallet-authenticated endpoint (POST)

```typescript
// api/user/profile.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withSecurity } from '../_middlewares/serverless-security.js';
import { verifyWalletSignature } from '../_middlewares/wallet-auth.js';
import { getDb } from '../_services/firebase-admin.js';
import type { WalletAuth } from '../types/index.js';

async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const walletAuth = req.body?.walletAuth as WalletAuth | undefined;
  if (!walletAuth) {
    res.status(401).json({ error: 'WALLET_AUTH_REQUIRED' });
    return;
  }

  const result = verifyWalletSignature(walletAuth);
  if (!result.valid) {
    res.status(401).json({ error: result.error });
    return;
  }

  const wallet = result.wallet!.toLowerCase();
  const db = getDb();
  // ... Firestore operations
  res.status(200).json({ success: true });
}

export default withSecurity(handler);
```

## Template C — Skills endpoint (subscription-gated)

```typescript
// api/skills/my-skill.ts
import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { checkSkillAccess, skillsRateLimit } from '../_middlewares/subscription-auth.js';

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export default async function handler(req: Request, res: Response) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const wallet = req.headers['x-wallet-address'] as string;
  const sub = await checkSkillAccess(req, res, 'my-skill-id'); // SkillId from constants
  if (!sub) return;  // checkSkillAccess already sent 401/402/403
  const ok = await skillsRateLimit(req, res, wallet, sub.tier);
  if (!ok) return;

  // ... skill logic with Gemini
  res.status(200).json({ success: true, data: result });
}
```

## withSecurity() — What it does

- Validates `Origin` / `Referer` against ALLOWED_ORIGINS (`nuxchain.com`, `nuxchain.vercel.app`, `localhost:5173`, etc.)
- Blocks suspicious patterns (SQL injection, XSS, path traversal)
- Sets CORS headers dynamically
- Input size validation
- Rate-limits by IP (in-memory for serverless)

## New Skill ID — Checklist

When creating a **new skills endpoint**:
- [ ] Add `SkillId` to `src/constants/subscription.ts` union type
- [ ] Add `SkillDefinition` to `SKILLS` record in same file
- [ ] Add endpoint to `vercel.json` functions block
- [ ] Test locally: `npm run dev` → POST `http://localhost:3002/api/skills/my-skill`


## File Location

```
api/
  <namespace>/
    <action>.ts     ← New endpoint file
```

Examples: `api/market/prices.ts`, `api/uniswap/prices.ts`, `api/price/pol.ts`

## Standard Endpoint Template

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kvCache } from '../_services/kv-cache-service';

const CACHE_TTL = 30; // seconds

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
    return;
  }

  // Only allow GET
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const cacheKey = 'my-endpoint-key';

    // Try cache first
    const cached = await kvCache.get<MyDataType>(cacheKey, {
      namespace: 'my-namespace',
      ttl: CACHE_TTL,
    });

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', `public, max-age=${CACHE_TTL}, s-maxage=${CACHE_TTL}`);
      res.status(200).json({ success: true, data: cached, cached: true });
      return;
    }

    // Fetch fresh data
    const data = await fetchMyData();

    // Store in cache
    await kvCache.set(cacheKey, data, {
      namespace: 'my-namespace',
      ttl: CACHE_TTL,
    });

    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', `public, max-age=${CACHE_TTL}, s-maxage=${CACHE_TTL}`);
    res.status(200).json({ success: true, data, cached: false, timestamp: Date.now() });

  } catch (error) {
    console.error('[MyEndpoint] Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
    });
  }
}
```

## kvCache Service Usage

Located at `api/_services/kv-cache-service.ts`. Import as:

```typescript
import { kvCache } from '../_services/kv-cache-service';

// Get
const data = await kvCache.get<T>(key, { namespace: 'ns', ttl: 30 });

// Set
await kvCache.set(key, value, { namespace: 'ns', ttl: 30 });

// Get or fetch (atomic)
const data = await kvCache.getOrFetch(key, async () => fetchData(), { namespace: 'ns', ttl: 30 });
```

## Rate Limiting

Use the existing middleware for heavy endpoints:

```typescript
import { rateLimiter } from '../_middlewares/rate-limiter';

// At top of handler:
const limited = await rateLimiter(req, res, { max: 60, window: 60 }); // 60 req/min
if (limited) return;
```

## Environment Variables

Access secrets safely — never expose in frontend:

```typescript
const API_KEY = process.env.MY_API_KEY; // Set in Vercel dashboard + .env.local
if (!API_KEY) {
  console.warn('[MyEndpoint] API key not configured, using fallback');
}
```

## vercel.json Registration (REQUIRED)

After creating the file, **always** add it to `vercel.json` under `"functions"`:

```json
{
  "functions": {
    "api/my-namespace/my-action.ts": {
      "maxDuration": 10,
      "memory": 512
    }
  },
  "headers": [
    {
      "source": "/api/my-namespace/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=30, s-maxage=30, stale-while-revalidate=60" }
      ]
    }
  ]
}
```

**maxDuration guidelines:**
- Simple proxy / cache lookup: `10`
- External API with retries: `15`
- AI / streaming: `60`

**memory guidelines:**
- Simple: `256`
- With data processing: `512`
- AI / embeddings: `2048`

## vite.config.ts Proxy (Local Dev)

Add a proxy entry so local dev hits port 3003 (api-server.js):

```typescript
// In vite.config.ts server.proxy:
'/api/my-namespace': {
  target: 'http://localhost:3003',
  changeOrigin: true
},
```

## api-server.js Registration (Local Dev)

Add the endpoint to `src/server/api-server.js` so it works locally:

```javascript
app.get('/api/my-namespace/my-action', async (req, res) => {
  try {
    // Simplified local version using CoinGecko or mock data
    const cached = getCached('my-key');
    if (cached) return res.json(cached);

    const data = await fetchData();
    setCached('my-key', data);
    res.json({ success: true, data, timestamp: Date.now() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Checklist for Every New Endpoint

- [ ] File created at `api/<namespace>/<action>.ts`
- [ ] Handles OPTIONS (CORS preflight)
- [ ] Validates HTTP method
- [ ] Uses `kvCache` for caching
- [ ] Has try/catch with proper error response
- [ ] Registered in `vercel.json` under `functions` and `headers`
- [ ] Proxy added in `vite.config.ts`
- [ ] Local handler added in `src/server/api-server.js`
- [ ] Environment variable added to `.env.example` if needed
