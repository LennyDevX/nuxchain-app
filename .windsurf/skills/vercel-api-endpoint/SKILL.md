---
name: vercel-api-endpoint
description: Create a new Vercel serverless API endpoint for NuxChain. Use when user says "create an API", "new endpoint", "add a route to /api/", "serverless function", or needs a backend handler. Enforces the project's pattern: TypeScript, kvCache, rate limiting, CORS, error handling, and vercel.json registration.
allowed-tools: Read, Write, Edit, Glob, Grep
model: claude-sonnet-4-5
license: MIT
metadata:
  author: nuxchain
  version: '1.0.0'
---

See full skill at: .agents/skills/vercel-api-endpoint/SKILL.md

# Vercel API Endpoint — Quick Reference

## File Location
`api/<namespace>/<action>.ts`

## Checklist (every new endpoint)
- [ ] File at `api/<namespace>/<action>.ts`
- [ ] Handles OPTIONS (CORS preflight)
- [ ] Uses `kvCache` from `../_services/kv-cache-service`
- [ ] try/catch with proper error response
- [ ] Registered in `vercel.json` under `"functions"` and `"headers"`
- [ ] Proxy added in `vite.config.ts` → port 3003
- [ ] Local handler added in `src/server/api-server.js`

## Template
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kvCache } from '../_services/kv-cache-service';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'GET') { res.status(405).json({ error: 'Method not allowed' }); return; }
  try {
    const cached = await kvCache.get('key', { namespace: 'ns', ttl: 30 });
    if (cached) return res.json({ success: true, data: cached, cached: true });
    const data = await fetchData();
    await kvCache.set('key', data, { namespace: 'ns', ttl: 30 });
    res.json({ success: true, data, cached: false, timestamp: Date.now() });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown' });
  }
}
```
