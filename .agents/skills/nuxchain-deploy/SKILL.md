---
name: nuxchain-deploy
description: Deploy the NuxChain app to Vercel or prepare a production build. Use when user says "deploy", "push to production", "build", "vercel deploy", "publish", "go live", "sync env vars", or "pre-deploy checklist". Covers build process, env var sync, Firestore rules, and lighthouse audit.
license: MIT
metadata:
  author: nuxchain
  version: '1.0.0'
---

# NuxChain Deploy Skill

Complete checklist and commands for deploying NuxChain to Vercel.

## Pre-Deploy Checklist

- [ ] All TypeScript errors resolved (`npm run build` passes locally)
- [ ] No `console.error` left from debugging
- [ ] New API endpoints registered in `vercel.json`
- [ ] New env vars added to Vercel dashboard AND `.env.example`
- [ ] Firestore rules updated if new collections added
- [ ] `vite.config.ts` proxy changes do NOT affect production (proxy is dev-only)
- [ ] ABIs in sync with deployed contracts (`src/abi/`)

## Build Commands

```powershell
# Clean build artifacts
node scripts/maintenance/CleanCacheDist.js

# Type check only
npx tsc --noEmit

# Full production build
npm run build

# Preview production build locally
npm run preview
```

## Environment Variables Sync

```powershell
# Sync local .env to Vercel (uses sync-vercel-env.ps1)
./sync-vercel-env.ps1

# Or manually via Vercel CLI
vercel env pull .env.local          # Pull from Vercel → local
vercel env add MY_NEW_VAR           # Add new var to Vercel
```

**Required env vars for production (check `.env.example` for full list):**
```
# Frontend (VITE_ prefix = exposed to browser)
VITE_FIREBASE_API_KEY
VITE_FIREBASE_PROJECT_ID
VITE_WALLETCONNECT_PROJECT_ID

# Backend only (NO VITE_ prefix = server-side only)
UNISWAP_API_KEY
GEMINI_API_KEY
FIREBASE_SERVICE_ACCOUNT_KEY
KV_REST_API_URL
KV_REST_API_TOKEN
```

## Vercel Deployment

```powershell
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment logs
vercel logs <deployment-url>
```

## vercel.json Key Sections

Every new API endpoint needs entries in `vercel.json`:

```json
{
  "functions": {
    "api/new-namespace/action.ts": {
      "maxDuration": 10,
      "memory": 512
    }
  },
  "headers": [
    {
      "source": "/api/new-namespace/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=30, s-maxage=30" }
      ]
    }
  ]
}
```

## Firestore Rules Deploy

```powershell
# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy rules + indexes
firebase deploy --only firestore

# Full Firebase deploy (hosting + rules)
firebase deploy
```

## ABI Sync (after contract updates)

```powershell
# Update ABIs from exported files
node scripts/update-abis-from-export.cjs

# Verify installation
node scripts/setup/verify-installation.cjs
```

## Lighthouse Audit (post-deploy)

```powershell
# Run lighthouse audit
./lighthouse-audit.ps1

# Or via npm
npm run lighthouse
```

**Target scores:**
- Performance: > 85
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

## Local Dev Server Commands

```powershell
# Start everything (Vite + API server + Gemini server)
npm run dev:full

# Frontend only
npm run dev

# Market/API server only (port 3003)
npm run dev:market

# Gemini AI server only (port 3002)
npm run dev:gemini
```

## Common Deploy Issues

### Build fails with TypeScript errors
```powershell
npx tsc --noEmit 2>&1 | head -50
```

### API endpoint returns 404 on Vercel
- Check `vercel.json` has the function registered
- Verify file path matches exactly (case-sensitive on Linux)

### Environment variable not found
- Check it's in Vercel dashboard (Settings → Environment Variables)
- Verify it's set for the correct environment (Production/Preview/Development)
- Backend vars must NOT have `VITE_` prefix

### Firestore permission denied
- Check `firestore.rules` allows the operation
- Deploy rules: `firebase deploy --only firestore:rules`

## Post-Deploy Verification

```powershell
# Check health endpoint
curl https://www.nuxchain.com/api/health/status

# Check market prices
curl https://www.nuxchain.com/api/market/prices

# Check uniswap prices
curl https://www.nuxchain.com/api/uniswap/prices
```
