---
name: env-secrets-management
description: Manage environment variables and secrets for NuxChain. Use when user says "add env var", "sync to Vercel", "VITE_ prefix", "environment variable", "secret key", "rotate service account", "Firebase SA", "push to Vercel", "sync env", "missing key", or "ENV_SETUP". Covers naming conventions, which vars go where, sync scripts, and SA rotation.
license: MIT
metadata:
  author: nuxchain
  version: '1.0.0'
---

# NuxChain Environment & Secrets Management Skill

Add, sync, and rotate environment variables and secrets.

## Files to Know

```
ENV_SETUP.md                     ← Full reference (read this first for new setup)
.env.local                       ← Local dev secrets (NEVER commit)
.env.example                     ← Public template (commit this)
scripts/sync-vercel-env.ps1      ← Push .env.local to Vercel
scripts/push-firebase-sa-dev.ps1 ← Push Firebase SA to vercel dev
scripts/push-new-sa-all-envs.ps1 ← Push Firebase SA to ALL Vercel envs
vercel.json                      ← env refs (references $VARNAME, not values)
```

## Naming Rules

| Prefix | Exposed to | Use for |
|--------|-----------|---------|
| `VITE_` | Frontend (browser) | Public config only |
| None | Server only | API keys, secrets, SA keys |

```bash
# ✅ Safe in frontend code:
VITE_WALLETCONNECT_PROJECT_ID=...
VITE_POLYGON_RPC_URL=...
VITE_CONTRACT_ADDRESS=...

# ✅ Server-only (api/ code, never import from src/):
GEMINI_API_KEY=...
FIREBASE_SERVICE_ACCOUNT=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
SOLANA_RPC_URL=...
VERCEL_BLOB_READ_WRITE_TOKEN=...
```

## Required Variables by Service

### Frontend (VITE_)
```
VITE_WALLETCONNECT_PROJECT_ID
VITE_POLYGON_RPC_URL
VITE_STAKING_CONTRACT_ADDRESS
VITE_NFT_CONTRACT_ADDRESS
VITE_ALCHEMY_API_KEY
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

### Backend (api/)
```
GEMINI_API_KEY                  ← Google Gemini API
FIREBASE_SERVICE_ACCOUNT        ← JSON string, base64 or escaped
KV_REST_API_URL                 ← Vercel KV
KV_REST_API_TOKEN               ← Vercel KV
SOLANA_RPC_URL                  ← Helius or public RPC
VERCEL_BLOB_READ_WRITE_TOKEN    ← Image uploads
PINATA_JWT                      ← IPFS via api/ipfs/upload.ts
PINATA_GATEWAY_URL              ← IPFS gateway
COINGECKO_API_KEY               ← Price data (optional, rate-limited without)
MORALIS_API_KEY                 ← Blockchain data (wallet balances, NFTs)
```

## Sync to Vercel

```powershell
# Push all vars from .env.local to Vercel (all environments):
./scripts/sync-vercel-env.ps1

# Push Firebase SA specifically to dev environment:
./scripts/push-firebase-sa-dev.ps1

# Push Firebase SA to ALL environments (prod + preview + dev):
./scripts/push-new-sa-all-envs.ps1
```

## Adding a New Environment Variable

### Step 1 — Add to `.env.local`
```bash
MY_NEW_SECRET=the-actual-value
```

### Step 2 — Add to `.env.example` (no value)
```bash
MY_NEW_SECRET=
```

### Step 3 — Sync to Vercel
```powershell
./scripts/sync-vercel-env.ps1
```

### Step 4 — Use in code
```typescript
// In api/ files:
const key = process.env.MY_NEW_SECRET!;

// In src/ files (only if VITE_ prefixed):
const key = import.meta.env.VITE_MY_NEW_CONFIG;
```

## Firebase Service Account Rotation

```powershell
# 1. Download new SA JSON from Firebase Console → Project Settings → Service Accounts
# 2. Replace or compact the JSON:
node scripts/compact-sa.cjs ./new-sa.json

# 3. Push to Vercel:
./scripts/push-new-sa-all-envs.ps1

# 4. Verify the new SA works:
node scripts/verify-sa-key.cjs

# 5. Test Firestore connection:
node scripts/test-firestore-live.mjs
```

## Verify SA Format

```powershell
node scripts/check-sa-fields.cjs    # Check required fields present
node scripts/verify-sa-key.cjs      # Verify can authenticate
```

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `process.env.X is undefined` in api/ | Var not in Vercel env — run sync-vercel-env.ps1 |
| `import.meta.env.VITE_X is undefined` | Missing VITE_ prefix or not in .env.local |
| Firebase Admin auth error | SA JSON malformed — run compact-sa.cjs + verify |
| KV connection refused | KV_REST_API_URL / KV_REST_API_TOKEN outdated |
| Gemini 401 errors | GEMINI_API_KEY expired or not synced |
