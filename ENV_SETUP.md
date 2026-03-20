# 🔐 Environment Variables Setup Guide

Complete reference for NuxChain environment configuration.

---

## Quick Reference: Copy `.env.example` → `.env`

```bash
cp .env.example .env.local
# Then fill in YOUR actual values (don't commit this file!)
```

---

## Variable Categories & Requirements

### 1️⃣ **Critical (Must Have)**

| Variable | Purpose | Type | Default |
|----------|---------|------|---------|
| `NODE_ENV` | App behavior | enum | `development` |
| `VITE_CHAIN_ID` | Blockchain network | number | `137` (Polygon) |
| `VITE_FIREBASE_PROJECT_ID` | Database | string | **Required** |
| `VITE_API_BASE_URL` | Backend endpoint | URL | `http://localhost:3002` |

### 2️⃣ **Essential (Needed for Features)**

**Firebase** — Database & Auth
- `VITE_FIREBASE_*` (API Key, Project ID, Storage, etc.)
- `FIREBASE_SERVICE_ACCOUNT` ⚠️ **BACKEND ONLY**

**Blockchain** — Smart Contracts & RPC
- `VITE_RPC_URL` or `VITE_ALCHEMY` — for blockchain reads
- All `VITE_STAKING_ADDRESS`, `VITE_MARKETPLACE_*` — contract addresses
- `VITE_DEPLOYER_ADDRESS` — for contract verification

**APIs** — External Services
- `GEMINI_API_KEY` — for AI chat
- `UNISWAP_API_KEY` — for token swaps
- `GOOGLE_SEARCH_API_KEY` — for web search

**Storage** — IPFS
- `PINATA_JWT` ⚠️ **BACKEND ONLY**
- `VITE_PINATA_GATEWAY` — URL for file access

### 3️⃣ **Optional (Nice to Have)**

| Category | Variables | If Missing |
|----------|-----------|-----------|
| hCaptcha | `VITE_HCAPTCHA_SITE_KEY`, `HCAPTCHA_SECRET_KEY` | No bot protection |
| Turnstile | `VITE_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Same as above |
| Solana | `SOLANA_RPC_*`, `VITE_NUX_MINT_ADDRESS` | NFT features disabled |
| Redis | `REDIS_URL` | Caching slower |
| Etherscan/Polygonscan | `VITE_ETHERSCAN_API_KEY` | Contract verification disabled |

---

## 🚨 Security Rules

### ✅ **DO:**
- Keep `.env` / `.env.local` in `.gitignore` (never commit real values)
- Use `.env.example` as a template with placeholder values
- Store secrets in Vercel: **Settings → Environment Variables**
- Rotate secrets regularly

### ❌ **DON'T:**
- Commit `.env` files with real credentials
- Use `VITE_` prefix for backend-only secrets (exposed to frontend)
- Hardcode sensitive values in code
- Share `.env` files in messages/PRs

### Variables by Visibility

**Frontend-Safe** (starts with `VITE_`):
- Contract addresses
- Firebase API keys (public key, not private key)
- Chain configuration
- UI settings

**Backend-Only** (NO `VITE_` prefix):
- `FIREBASE_SERVICE_ACCOUNT` — contains private keys
- `GEMINI_API_KEY` — sensitive AI provider
- `PINATA_JWT` — upload permissions
- `HCAPTCHA_SECRET_KEY` — secret token
- `TURNSTILE_SECRET_KEY` — secret token
- API keys for any backend service

---

## 📋 Step-by-Step Setup

### Local Development

1. **Copy template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Get Firebase credentials:**
   - Go to: https://console.firebase.google.com/
   - Select your project → Settings → Service Accounts
   - Generate new private key → Copy JSON as `FIREBASE_SERVICE_ACCOUNT`

3. **Get Gemini API key:**
   - Go to: https://ai.google.dev/
   - Create an API key → Copy to `GEMINI_API_KEY`

4. **Get Alchemy RPC (optional, for better rate limits):**
   - Go to: https://www.alchemy.com/
   - Create app → Copy API key to `VITE_ALCHEMY`

5. **Get Pinata credentials:**
   - Go to: https://app.pinata.cloud/
   - Create API key → Copy JWT to `PINATA_JWT`

6. **Start dev server:**
   ```bash
   npm run dev
   ```

### Production (Vercel)

1. **Add to Vercel Secrets:**
   ```bash
   vercel env add FIREBASE_SERVICE_ACCOUNT
   vercel env add GEMINI_API_KEY
   vercel env add PINATA_JWT
   # ... etc for all backend-only vars
   ```

2. **Or use script:**
   ```bash
   npm run sync-vercel-env.ps1
   ```

3. **Deploy:**
   ```bash
   git push origin main  # Vercel auto-deploys
   ```

---

## 🔍 Variable Details by Category

### Environment & Deployment
```env
# Controls app behavior
NODE_ENV=development                    # development | production
VITE_NODE_ENV=development              # Same for frontend
PORT=3002                              # Dev server port (ignored on Vercel)
```

### Firebase (Database & Auth)
```env
VITE_FIREBASE_PROJECT_ID=nuxchain1
VITE_FIREBASE_AUTH_DOMAIN=nuxchain1.firebaseapp.com
VITE_FIREBASE_API_KEY=AIza...          # Public key (safe for frontend)
VITE_FIREBASE_STORAGE_BUCKET=nuxchain1.firebasestorage.app

# ⚠️ Backend only
FIREBASE_SERVICE_ACCOUNT="{\"type\":\"service_account\",...}"
```

### Blockchain (Polygon)
```env
VITE_CHAIN_ID=137                      # 137 = Polygon, 80001 = Mumbai
VITE_RPC_URL=https://polygon-rpc.com/
VITE_ALCHEMY=SkJXCcWzsabifZ1ZiCzoe    # Alternative RPC (faster)
```

### Smart Contracts (Sample)
```env
# Staking
VITE_STAKING_CORE_ADDRESS=0x2cda88046543be25a3EC4eA2d86dBe975Fda0028
VITE_STAKING_REWARDS_ADDRESS=0xEa481FB987d95F8a58730bBd89a91ef733f8C128

# Marketplace
VITE_MARKETPLACE_PROXY_ADDRESS=0xc8Af452F3842805Bc79bfFBBbDB9b130f222d9BC

# Airdrop Factory
VITE_AIRDROP_FACTORY_ADDRESS=0x60deA80B9c3f8C0beeDbD18BbdA04f4BD5662183
```

### API Endpoints
```env
# Local Dev
VITE_API_BASE_URL=http://localhost:3002
VITE_SERVER_URL=http://localhost:3002/server

# Production (Vercel) — use relative paths
VITE_PROD_API_BASE_URL=/api
VITE_PROD_SERVER_URL=/server
```

### External APIs (Backend Only)
```env
GEMINI_API_KEY=your_key              # Google AI
UNISWAP_API_KEY=your_key             # Swap quotes
GOOGLE_SEARCH_API_KEY=your_key       # Web search
VITE_ETHERSCAN_API_KEY=your_key      # Contract verification (Etherscan V2, works for Polygon)
```

### Storage (IPFS via Pinata)
```env
VITE_PINATA=your_pinata_key          # Public key
PINATA_JWT=your_jwt_token            # ⚠️ Backend only
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud
```

### Security & Auth
```env
ADMIN_PASSWORD=nuxchain97A!           # Admin endpoint protection
SERVER_API_KEY=nuxchain987654321      # Server-to-server auth
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000  # CORS
```

### Bot Protection
```env
VITE_HCAPTCHA_SITE_KEY=10000...      # hCaptcha frontend key
HCAPTCHA_SECRET_KEY=0x000...          # ⚠️ Backend only

VITE_TURNSTILE_SITE_KEY=0x4AA...      # Cloudflare frontend key
TURNSTILE_SECRET_KEY=0x4AA...         # ⚠️ Backend only
```

### Solana (NFT Minting)
```env
VITE_SOLANA_RPC_QUICKNODE=https://solana-mainnet.g.alchemy.com/v2/...
VITE_NUX_MINT_ADDRESS=AV9fNPXeLhyqGangnEdBkL355mqDbAi3gWU4AfzDcPZK
```

---

## 🎯 Quick Copy-Paste for Local Dev

```bash
# 1. Copy template
cp .env.example .env.local

# 2. Edit file and fill in THESE minimum vars:
# - VITE_FIREBASE_PROJECT_ID
# - VITE_FIREBASE_API_KEY
# - FIREBASE_SERVICE_ACCOUNT (entire JSON)
# - GEMINI_API_KEY
# - PINATA_JWT

# 3. Start dev
npm run dev

# 4. If features not working:
# - Check .env.local exists
# - Verify variables match Firebase console
# - Check API endpoints in browser DevTools (Network tab)
```

---

## 🚀 Deployment Checklist

- [ ] Copy `.env.example` as reference
- [ ] Fill all `VITE_` variables (frontend safe)
- [ ] Add backend-only vars to Vercel Secrets
- [ ] Test locally: `npm run dev`
- [ ] Deploy to Vercel: `git push origin main`
- [ ] Monitor Vercel logs for missing env var errors
- [ ] Test production: `https://nuxchain.com/...`

---

## 📞 Troubleshooting

### "FIREBASE_PROJECT_ID is missing"
→ Check `.env.local` exists and has value for `VITE_FIREBASE_PROJECT_ID`

### "Not authenticated with Firestore"
→ `FIREBASE_SERVICE_ACCOUNT` invalid or missing in Vercel

### "API timeout"
→ `VITE_API_BASE_URL` wrong or API server not running

### "Images not loading"
→ `VITE_PINATA_GATEWAY` missing or `PINATA_JWT` expired

### "hCaptcha not appearing"
→ `VITE_HCAPTCHA_SITE_KEY` wrong or missing

---

## 📚 Useful Links

| Service | URL | What For |
|---------|-----|----------|
| Firebase Console | https://console.firebase.google.com/ | Manage database & auth |
| Gemini API | https://ai.google.dev/ | AI chat credentials |
| Alchemy | https://www.alchemy.com/ | RPC endpoint (faster than polygon-rpc.com) |
| Pinata | https://app.pinata.cloud/ | IPFS file hosting credentials |
| Vercel Secrets | https://vercel.com/docs/projects/environment-variables | Store backend secrets safely |
| PolygonScan | https://polygonscan.com/ | Verify & explore contracts |
| Google Cloud | https://console.cloud.google.com/ | Custom search API |

---

Generated: March 2026
Last Updated: After Organization Update
