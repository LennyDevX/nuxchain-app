# 🛠️ Tech Stack Guide

**Last Updated:** November 2025  
**Status:** ✅ Current - Beta 7.0  
**Audience:** New developers and contributors

---

## 📖 Table of Contents

1. [Stack Overview](#stack-overview)
2. [Frontend](#frontend)
3. [Backend](#backend)
4. [Web3](#web3)
5. [AI & Embeddings](#ai--embeddings)
6. [Testing & Tools](#testing--tools)
7. [Usage Examples](#usage-examples)

---

## 🎯 Stack Overview

Nuxchain is a **modern dApp** built with cutting-edge Web3 and AI technologies. The project uses a modern and performant stack.

```
┌─────────────────────────────────────────────┐
│           FRONTEND (React 19)               │
│  ├─ UI: TailwindCSS 4.0 + Framer Motion   │
│  ├─ State: React Query 5.90 + Zustand     │
│  ├─ Routing: React Router 7                │
│  └─ Build: Vite 7.2                        │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│           WEB3 LAYER                        │
│  ├─ Wagmi + Viem 2.38                      │
│  ├─ WalletConnect                          │
│  ├─ Polygon (POL) Smart Contracts          │
│  └─ The Graph (Subgraph)                   │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│           BACKEND (Serverless)              │
│  ├─ Express 5 (Vercel Functions)           │
│  ├─ Google Gemini API 2.5 Flash Lite       │
│  ├─ Sentence Transformers (Embeddings)     │
│  └─ GraphQL (Apollo Client)                │
└─────────────────────────────────────────────┘
```

---

## 🎨 Frontend

### React 19

**Main UI framework.**

```tsx
// Example: Component with React 19
import { useState, useEffect } from 'react';

export function NFTCard({ nft }) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="card-base hover:scale-105 transition-transform">
      <img src={nft.image} alt={nft.name} />
      <h3 className="text-xl font-bold">{nft.name}</h3>
      <p className="text-gray-400">{nft.description}</p>
      <button onClick={() => setIsLiked(!isLiked)}>
        {isLiked ? '❤️' : '🤍'} Like
      </button>
    </div>
  );
}
```

**Key features:**
- Component-based architecture
- Hooks for state management (useState, useEffect, useContext)
- Suspense for lazy loading components
- Server Components (for future improvements)

---

### Vite 7.1

**Ultra-fast build tool with HMR.**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'wagmi-vendor': ['wagmi', 'viem']
        }
      }
    }
  },
  server: {
    port: 5173
  }
});
```

**Why Vite:**
- ⚡ Instant HMR (Hot Module Replacement)
- 🚀 Optimized build with Rollup
- 📦 Automatic code splitting
- 🔧 Dev server with live reload

---

### TailwindCSS 4.0

**Utility-first CSS framework.**

```tsx
// Example: Card with TailwindCSS
export function Card({ children }) {
  return (
    <div className="
      bg-gradient-to-br from-gray-800 to-gray-900
      border border-purple-500/20
      rounded-xl p-6
      hover:border-purple-500/50
      hover:shadow-purple-glow
      transition-all duration-300
    ">
      {children}
    </div>
  );
}
```

**Advantages:**
- Responsive design with breakpoints (`sm:`, `md:`, `lg:`, `xl:`)
- Hover states with `hover:`
- Dark mode with `dark:`
- Customization via `tailwind.config.js`

**Configuration:**
```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: '#8b5cf6',
        secondary: '#6366f1'
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite'
      }
    }
  }
}
```

---

### Framer Motion

**Declarative animation library.**

```tsx
import { motion } from 'framer-motion';

export function AnimatedCard({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.div>
  );
}
```

**Use cases:**
- Entry/exit animations
- Hover and tap effects
- Scroll-triggered animations
- Page transitions
- Loading skeletons

**Performance:**
- GPU-accelerated (transform, opacity)
- 60fps guaranteed
- Respects `prefers-reduced-motion`

---

### React Query 5.90

**State management for server state.**

```tsx
import { useQuery } from '@tanstack/react-query';

export function useMarketplaceNFTs() {
  return useQuery({
    queryKey: ['marketplace-nfts'],
    queryFn: async () => {
      const res = await fetch('/api/nfts');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,      // 5 minutes
    gcTime: 30 * 60 * 1000,        // 30 minutes
    retry: 2,                       // 2 retries
  });
}

// Usage in component
function Marketplace() {
  const { data: nfts, isLoading } = useMarketplaceNFTs();

  if (isLoading) return <SkeletonLoader />;
  return <NFTGrid nfts={nfts} />;
}
```

**Features:**
- Automatic caching with TTL
- Background refetch
- Intelligent prefetching
- Offline support
- DevTools integration

---

## ⚙️ Backend

### Express 5 (Serverless)

**Backend API on Vercel Functions.**

```typescript
// api/chat/stream.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { message } = req.body;

  // Validation
  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }

  // Streaming response
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

  const stream = await model.generateContentStream(message);

  for await (const chunk of stream.stream) {
    res.write(chunk.text());
  }

  res.end();
}
```

**Main endpoints:**
- `POST /api/chat/stream` - AI Chat with Gemini
- `GET /api/health/status` - Health check
- `POST /api/health/embeddings` - Embeddings test

---

### Google Gemini API 2.5

**Conversational AI for Nuxbee (chat assistant).**

```typescript
// Model configuration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash-lite',
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 1024,
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    }
  ]
});

// Streaming with context
const systemInstruction = `You are Nuxbee, Nuxchain's AI assistant...`;
const response = await model.generateContentStream([
  { role: 'system', content: systemInstruction },
  { role: 'user', content: userMessage }
]);
```

**See more:** [CHAT_GEMINI_API.md](backend/CHAT_GEMINI_API.md)

---

## 🌐 Web3

### Wagmi + Viem 2.38

**React hooks for Web3 interactions.**

```tsx
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { polygon } from 'wagmi/chains';

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });

  if (isConnected) {
    return (
      <div>
        <p>Connected: {address}</p>
        <p>Balance: {balance?.formatted} {balance?.symbol}</p>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    );
  }

  return (
    <div>
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector, chainId: polygon.id })}
        >
          Connect {connector.name}
        </button>
      ))}
    </div>
  );
}
```

**Configuration:**
```typescript
// src/wagmi.ts
import { createConfig, http } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

export const config = createConfig({
  chains: [polygon],
  connectors: [
    injected(),
    walletConnect({ projectId: 'YOUR_PROJECT_ID' })
  ],
  transports: {
    [polygon.id]: http()
  }
});
```

---

### Smart Contracts

**Contract interaction using hooks.**

```tsx
import { useReadContract, useWriteContract } from 'wagmi';
import StakingABI from '@/abi/EnhancedSmartStaking.json';

export function useStaking() {
  // Read contract
  const { data: stakedAmount } = useReadContract({
    address: '0x...',
    abi: StakingABI.abi,
    functionName: 'getStakedAmount',
    args: [userAddress]
  });

  // Write contract
  const { writeContract, isPending } = useWriteContract();

  const stake = async (amount: bigint) => {
    await writeContract({
      address: '0x...',
      abi: StakingABI.abi,
      functionName: 'stake',
      args: [amount]
    });
  };

  return { stakedAmount, stake, isPending };
}
```

**Available ABIs:**
- `EnhancedSmartStaking.json` - Staking with skills
- `GameifiedMarketplace.json` - Marketplace with gamification
- `AirdropFactory.json` - Automated airdrops

---

### The Graph (Subgraph)

**Blockchain event indexing.**

```graphql
# Example: Query to get stakes
query GetUserStakes($user: Bytes!) {
  stakes(where: { user: $user }) {
    id
    amount
    timestamp
    duration
    apy
  }
}
```

```tsx
// Hook for GraphQL queries
import { useQuery } from '@apollo/client';

export function useUserStakes(address: string) {
  const { data } = useQuery(GET_USER_STAKES, {
    variables: { user: address }
  });

  return data?.stakes || [];
}
```

**See more:** [SUBGRAPH_SYSTEM.md](backend/SUBGRAPH_SYSTEM.md)

---

## 🤖 AI & Embeddings

### Sentence Transformers

**Vector embeddings for semantic search.**

```typescript
// Generate embedding
import { generateEmbedding } from '@/api/_services/embeddings-service';

const query = "What is the staking APY?";
const embedding = await generateEmbedding(query);
// Output: Float32Array of 1536 dimensions

// Search similar documents
const results = await searchKnowledgeBase(embedding, {
  topK: 3,
  threshold: 0.15
});
```

**Flow:**
1. User asks a question
2. Query is converted to embedding (1536D vector)
3. Similarity search in knowledge base
4. Top-3 most relevant documents
5. Context is passed to Gemini

---

## 🧪 Testing & Tools

### TypeScript 5.7

**Type safety across the project.**

```typescript
// Types for NFT
interface NFT {
  id: string;
  name: string;
  image: string;
  price: bigint;
  owner: `0x${string}`;
  skills?: Skill[];
}

interface Skill {
  id: number;
  name: string;
  emoji: string;
  effect: string;
}

// Usage with type inference
const nft: NFT = {
  id: '1',
  name: 'Cool NFT',
  image: 'ipfs://...',
  price: 100n,
  owner: '0x123...'
};
```

---

### ESLint + Prettier

**Automatic linting and formatting.**

```javascript
// eslint.config.js
export default {
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/no-unused-vars': 'error'
  }
};
```

---

## 💡 Usage Examples

### Create a new NFT component

```tsx
// src/components/nfts/MyNFTCard.tsx
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';

interface Props {
  nft: NFT;
  onBuy: (id: string) => void;
}

export function MyNFTCard({ nft, onBuy }: Props) {
  const { address } = useAccount();
  const isOwner = nft.owner === address;

  return (
    <motion.div
      className="card-base"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <img src={nft.image} alt={nft.name} className="rounded-lg" />
      <h3 className="text-xl font-bold mt-4">{nft.name}</h3>
      <p className="text-gray-400">{nft.description}</p>
      
      {!isOwner && (
        <button
          onClick={() => onBuy(nft.id)}
          className="btn-primary mt-4"
        >
          Buy for {nft.price.toString()} POL
        </button>
      )}
    </motion.div>
  );
}
```

---

### Create a custom hook

```tsx
// src/hooks/useNFTPurchase.tsx
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import MarketplaceABI from '@/abi/GameifiedMarketplace.json';

export function useNFTPurchase() {
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  const buyNFT = async (tokenId: bigint, price: bigint) => {
    await writeContract({
      address: '0x...',
      abi: MarketplaceABI.abi,
      functionName: 'buyNFT',
      args: [tokenId],
      value: price
    });
  };

  return { buyNFT, isLoading, isSuccess };
}

// Usage
function NFTCard() {
  const { buyNFT, isLoading } = useNFTPurchase();

  return (
    <button
      onClick={() => buyNFT(1n, 100n)}
      disabled={isLoading}
    >
      {isLoading ? 'Buying...' : 'Buy NFT'}
    </button>
  );
}
```

---

### Add a new page

```tsx
// 1. Create component in src/pages/
// src/pages/MyPage.tsx
export function MyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold">My New Page</h1>
    </div>
  );
}

// 2. Add route in router
// src/router/routes.tsx
import { lazy } from 'react';

const MyPage = lazy(() => import('@/pages/MyPage'));

export const routes = [
  // ... other routes
  {
    path: '/my-page',
    element: <MyPage />
  }
];
```

---

## 🔗 Additional Resources

### Official documentation:
- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [TailwindCSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [Wagmi](https://wagmi.sh)
- [React Query](https://tanstack.com/query)

### Internal documentation:
- [Components Guide](COMPONENTS.md) - Available components
- [Architecture Guide](ARCHITECTURE.md) - Project structure
- [Contributing Guide](CONTRIBUTING.md) - How to contribute
- [Performance Guide](frontend/01-PERFORMANCE_AND_MOBILE_OPTIMIZATION.md)
- [Design System](frontend/02-DESIGN_SYSTEM_AND_UI.md)

---

**Created:** November 2025  
**Maintained by:** Nuxchain Team
