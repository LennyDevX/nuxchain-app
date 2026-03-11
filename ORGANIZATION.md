# 📁 NuxChain Project Organization

Clean, maintainable directory structure for a full-stack Web3 application.

---

## Root Files (Config & Entry)

| File | Purpose | Status |
|------|---------|--------|
| `package.json` | Dependencies & scripts | ✅ Essential |
| `package-lock.json` | Lock file for reproducible builds | ✅ Essential |
| `tsconfig.json` | TypeScript root config | ✅ Essential |
| `tsconfig.app.json` | Frontend TypeScript config | ✅ Essential |
| `tsconfig.api.json` | Backend TypeScript config | ✅ Essential |
| `tsconfig.node.json` | Build tools TypeScript config | ✅ Essential |
| `vite.config.ts` | Frontend build configuration | ✅ Essential |
| `index.html` | Frontend entry point | ✅ Essential |
| `postcss.config.js` | PostCSS plugins (Tailwind) | ✅ Essential |
| `tailwind.config.js` | Tailwind CSS configuration | ✅ Essential |
| `eslint.config.js` | Code linting rules | ✅ Essential |
| `README.md` | Project documentation | ✅ Essential |
| `.env.example` | Environment template (no secrets) | ✅ Essential |
| `.gitignore` | Git ignore patterns | ✅ Essential |

### Configuration Files (Optional)

| File | Purpose | Status |
|------|---------|--------|
| `firebase.json` | Firebase CLI config | ⚙️ Optional |
| `firestore.rules` | Firestore security rules | ⚙️ Optional |
| `firestore.indexes.json` | Firestore indexes | ⚙️ Optional |
| `vercel.json` | Vercel deployment config | ⚙️ Optional |
| `lighthouserc.cjs` | Lighthouse audit config | ⚙️ Optional |
| `.npmrc` | NPM configuration | ⚙️ Optional |

### Scripts & Generated Files (Local Only, Don't Commit)

| File | Purpose | Status |
|------|---------|--------|
| `generate-burn-wallet.js` | Solana wallet generator | 📝 Utility |

---

## Source Directories

### Frontend (`src/`)

```
src/
├── main.tsx                    # React entry point
├── App.tsx                     # Root component
├── vite-env.d.ts              # Vite type definitions
├── wagmi.ts                   # Wagmi Web3 config
├── sw.ts                      # Service Worker
│
├── pages/                     # Page components (lazy-loaded via router)
│   ├── Home.tsx
│   ├── Staking.tsx
│   ├── NFTs.tsx
│   ├── Marketplace.tsx
│   └── [20+ more pages]
│
├── components/                # Reusable UI components (organized by feature)
│   ├── ui/                    # Generic UI elements (Button, Modal, etc.)
│   ├── ai/                    # AI Chat related
│   ├── airdrop/              # Airdrop feature
│   ├── chat/                 # Chat UI
│   ├── marketplace/          # Marketplace feature
│   ├── nfts/                 # NFT display
│   ├── staking/              # Staking feature
│   ├── tokenization/         # Token creation
│   ├── web3/                 # Web3 utilities
│   └── [more features]
│
├── hooks/                     # Custom React hooks
│   ├── useWeb3/
│   ├── cache/
│   ├── performance/
│   └── [organized by domain]
│
├── context/                   # React Context providers
├── utils/                     # Utility functions
│   ├── cache/                # Client-side caching (ImageCache, RPCCache, etc.)
│   ├── mobile/               # Mobile optimization
│   ├── performance/          # Performance utilities
│   └── scripts/              # **⚠️ NO SECRETS HERE** (firebase keys removed)
│
├── lib/                       # Third-party integrations
│   ├── apollo-client.ts      # GraphQL client
│   └── [other libraries]
│
├── config/                    # App constants & configuration
├── data/                      # Static data files (JSON, constants)
├── security/                  # Security utilities
├── styles/                    # Global CSS/Tailwind
├── types/                     # TypeScript types & interfaces
├── ui/                        # Shadcn UI components
├── wallets/                   # Wallet integrations
├── abi/                       # Smart contract ABIs
│
└── router/                    # React Router configuration
    └── routes.tsx            # Route definitions (lazy-loaded chunks)
```

### Backend API (`api/`)

```
api/
├── _index.ts                 # API index/registration
│
├── _config/                  # Global configuration
│   └── system-instruction.ts # Gemini AI system prompt
│
├── _middlewares/             # Express middleware (reusable)
│   ├── error-handler.ts
│   ├── rate-limiter.ts
│   ├── request-deduplicator.ts
│   ├── serverless-security.ts
│   ├── wallet-auth.ts
│   ├── subscription-auth.ts
│   └── edge-rate-limit.ts
│
├── _services/                # Business logic & external integrations
│   ├── kv-cache-service.ts   # Redis caching (Upstash)
│   ├── firebase-admin.ts     # Firestore admin SDK
│   ├── blockchain-service.ts # RPC interactions
│   ├── embeddings-cache-service.ts # Gemini embeddings
│   ├── analytics-service.ts  # Tracking & metrics
│   ├── audit-logger.ts       # Security logging
│   └── [10+ more services]
│
├── _examples/                # Example endpoints
│   └── with-rate-limit.ts    # Rate limiting example
│
├── chat/                      # AI Chat endpoints
│   └── stream.ts             # Streaming chat responses
│
├── health/                    # System health checks
├── market/                    # Market data (prices, stats)
├── price/                     # Token price feeds
├── uniswap/                   # Uniswap integration
├── ipfs/                      # NFT metadata upload
├── launchpad/                 # Token launchpad
├── subscriptions/             # Subscription management
├── skills/                    # AI skills (specialized assistants)
├── airdrop/                   # Airdrop distribution
├── init-cache/               # Cache initialization (run once)
├── types/                     # API TypeScript types
└── test/                      # API testing utilities
```

### GraphQL Subgraph (`subgraph/`)

```
subgraph/
├── package.json              # Subgraph dependencies
├── schema.graphql           # GraphQL schema for indexed events
├── subgraph.yaml            # Subgraph manifest
│
├── src/                     # Subgraph mappings
│   └── mappings.ts          # Event handlers
│
├── abis/                    # Smart contract ABIs
├── build/                   # Generated artifacts (excluded from git)
└── generated/               # TypeScript generated types
```

---

## Documentation (`doc/`)

```
doc/
├── ARCHITECTURE.md          # System design & flows
├── README.md               # Navigation guide
├── frontend/               # Frontend-specific docs
├── backend/                # Backend/API docs
├── infrastructure/         # Deployment & DevOps
├── security/               # Security policies
├── setup/                  # Developer setup guide
└── features/               # Feature specifications
```

---

## Scripts (`scripts/`)

Utility scripts for maintenance, deployment, and analysis:

```
scripts/
├── check-duplicates.ps1       # Analyze npm duplicates
├── check-sa-fields.cjs        # Firebase credentials validation
├── compact-sa.cjs             # Compress service account
├── fix-firebase-sa-v2.ps1     # Firebase SA recovery
├── push-firebase-sa-dev.ps1   # Sync dev credentials
├── push-new-sa-all-envs.ps1   # Sync all environments
├── sync-solana-rpc.ps1        # Solana RPC sync
├── sync-vercel-env.ps1        # Sync Vercel variables
├── lighthouse-audit.ps1       # Run performance audit
├── verify-sa-key.cjs          # Service account verification
│
├── maintenance/               # Operational scripts
├── setup/                     # Initial setup
├── analysis/                  # Data analysis utilities
└── reports/                   # Generated reports (excluded from git)
```

---

## Public Assets (`public/`)

```
public/
├── manifest.json            # PWA manifest
├── offline.html            # Offline fallback
├── robots.txt              # SEO
├── assets/                 # Images, icons, SVG
│   ├── AvatarsNFTs/
│   ├── NFTs/
│   └── [collections]
│
├── docs/                   # Public documentation
└── [other static files]
```

---

## Build Outputs (Git-Ignored, Local Only)

| Directory | Purpose | Lifetime |
|-----------|---------|----------|
| `dist/` | Frontend build output | Build artifact |
| `api-dist/` | Backend compiled API | Build artifact |
| `.lighthouseci/` | Lighthouse reports | CI artifact |
| `node_modules/` | Dependencies | Package manager |
| `test-results/` | Test output | CI artifact |

**All of these are in `.gitignore` and will be regenerated on deploy.**

---

## Special Directories (Configuration)

| Directory | Purpose | Git Status |
|-----------|---------|-----------|
| `.github/` | GitHub Actions workflows | ✅ Tracked |
| `.agents/` | Custom agent skills & history | ✅ Tracked |
| `.git/` | Git repository metadata | System |
| `.vscode/` | VS Code settings (extensions only, no personal) | ✅ Tracked |
| `keys/` | Local wallet files | ❌ Ignored |

---

### Removed / Cleaned Up

The following were removed or cleaned from tracking:

- ✅ **`.claude/`** — Local Claude editor cache (moved to `.agents/`)
- ✅ **`.windsurf/`** — Local Windsurf editor cache (moved to `.agents/`)
- ✅ **`.unlighthouse/`** — Lighthouse UI cache (local only)
- ✅ **`generate-burn-wallet.cjs`** — Duplicate (kept `.js`)
- ✅ **`api-dist/`** — Build artifact (regenerated on deploy)
- ✅ **`test-results/`** — CI artifact (regenerated on test runs)
- ✅ **Firebase keys in `src/utils/scripts/`** — Credentials removed (use Vercel env)

---

## Environment & Secrets

### `.env` / `.env.vercel` (NOT in git)

Store credentials here locally and sync to Vercel:

```bash
# Example (never commit actual values)
VITE_SUBGRAPH_URL=https://api.studio.thegraph.com/query/...
VITE_ALCHEMY_API_KEY=alchemy_...
ADMIN_SECRET_KEY=secret-key-here
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...
```

**Sync to Vercel:**

```bash
npm run sync-vercel-env.ps1  # From scripts/
```

---

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Start dev server (SPA + API mock)
npm run dev

# Or full stack with Gemini server
npm run dev:full
```

### Build & Deploy

```bash
# Build frontend
npm run build

# Run Lighthouse audit (local)
npm run lighthouse:local

# Build API (TypeScript → JavaScript)
npm run build:api-local

# Deploy to Vercel (via git push)
git push origin main
```

### Version Control

```bash
# Check what will be committed
git status

# View ignored files
git ls-files --others --ignored --exclude-standard

# Verify no secrets leaked
git log --all -S "PRIVATE_KEY" --name-only
```

---

## Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run build` | Build frontend (Vite) |
| `npm run dev` | Start dev server |
| `npm run lint` | Lint code (ESLint) |
| `npm run lighthouse:local` | Run Lighthouse audit locally |
| `npm run subgraph:deploy` | Deploy subgraph to The Graph |
| `npm test` | Run test suite |

---

## Size Budget & Performance

Frontend JavaScript budget: **900KB** (Lighthouse)
Image budget: **400KB**
Font budget: **150KB**

### Monitor

```bash
npm run build:verbose   # See bundle composition
npm run build:size      # Check gzip sizes
```

---

## Security Checklist

- [ ] No `.env` files in git
- [ ] No Firebase keys in `src/utils/scripts/`
- [ ] No private wallet keys in repository
- [ ] All secrets in Vercel environment variables
- [ ] Firebase Firestore rules enforced server-side
- [ ] Rate limiting on all public endpoints
- [ ] CORS headers configured in `vercel.json`

---

## Next Steps

1. **Install dependencies**: `npm install`
2. **Set up environment**: Copy `.env.example` → `.env.local`, fill with your keys
3. **Sync Vercel secrets**: `npm run sync-vercel-env.ps1`
4. **Start developing**: `npm run dev`
5. **Run audits**: `npm run lighthouse:local`

---

Generated: March 2026
Last Updated: After Performance Optimization Phase 1
