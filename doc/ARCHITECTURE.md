# 🏗️ Architecture Guide

**Last Updated:** November 2025  
**Status:** ✅ Current - Beta 7.0  
**Audience:** Developers

---

## 📖 Table of Contents

1. [Project Structure](#project-structure)
2. [Routing System](#routing-system)
3. [State Management](#state-management)
4. [Hooks System](#hooks-system)
5. [API Integration](#api-integration)
6. [Caching Strategy](#caching-strategy)
7. [Code Organization](#code-organization)

---

## 📁 Project Structure

```
nuxchain-app/
├── api/                          # Backend (Vercel Serverless)
│   ├── _config/
│   │   └── system-instruction.js # AI system prompts
│   ├── _middlewares/
│   │   ├── error-handler.ts     # Global error handling
│   │   ├── rate-limiter.ts      # Rate limiting
│   │   └── serverless-security.ts
│   ├── _services/
│   │   ├── analytics-service.js
│   │   ├── context-cache-service.js
│   │   ├── embeddings-service.ts
│   │   ├── knowledge-base.js
│   │   ├── markdown-formatter.js
│   │   ├── query-classifier.js
│   │   ├── semantic-streaming-service.js
│   │   ├── url-context-service.js
│   │   └── web-scraper.js
│   ├── chat/
│   │   └── stream.ts            # Chat streaming endpoint
│   ├── health/
│   │   ├── embeddings.js
│   │   └── status.ts
│   └── types/
│       └── index.ts             # TypeScript types for API
│
├── src/                          # Frontend
│   ├── abi/                     # Smart contract ABIs
│   │   ├── Airdrop.json
│   │   ├── EnhancedSmartStaking.json
│   │   ├── GameifiedMarketplace.json
│   │   └── ...
│   │
│   ├── components/              # React components
│   │   ├── airdrops/           # Airdrop components
│   │   ├── chat/               # Chat UI
│   │   ├── forms/              # Form components
│   │   ├── home/               # Home page sections
│   │   ├── marketplace/        # Marketplace UI
│   │   ├── nfts/               # NFT display
│   │   ├── profile/            # User profile
│   │   ├── staking/            # Staking UI
│   │   ├── tokenization/       # NFT creation
│   │   ├── ui/                 # Reusable UI components
│   │   └── web3/               # Web3 components
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── accessibility/      # Accessibility hooks
│   │   ├── activity/           # Activity tracking
│   │   ├── airdrops/           # Airdrop hooks
│   │   ├── analytics/          # Analytics hooks
│   │   ├── cache/              # Cache management
│   │   ├── chat/               # Chat hooks
│   │   ├── marketplace/        # Marketplace hooks
│   │   ├── mobile/             # Mobile-specific hooks
│   │   ├── nfts/               # NFT hooks
│   │   ├── performance/        # Performance hooks
│   │   ├── rewards/            # Rewards hooks
│   │   ├── staking/            # Staking hooks
│   │   └── sync/               # Cross-tab sync
│   │
│   ├── lib/                     # Libraries & utilities
│   │   ├── apollo-client.ts    # GraphQL client
│   │   └── graphql/            # GraphQL queries
│   │
│   ├── pages/                   # Page components
│   │   ├── Airdrops.tsx
│   │   ├── Blog.tsx
│   │   ├── Chat.tsx
│   │   ├── Home.tsx
│   │   ├── Marketplace.tsx
│   │   ├── NFTs.tsx
│   │   ├── Profile.tsx
│   │   ├── Staking.tsx
│   │   └── Tokenization.tsx
│   │
│   ├── router/                  # Routing configuration
│   │   └── routes.tsx          # Route definitions
│   │
│   ├── styles/                  # Global styles
│   │   ├── animations.css      # CSS animations
│   │   ├── components.css      # Component styles
│   │   ├── index.css           # Main stylesheet
│   │   ├── responsive-grid.css # Grid utilities
│   │   └── spacing.css         # Spacing system
│   │
│   ├── types/                   # TypeScript types
│   │   └── index.ts            # Global type definitions
│   │
│   ├── utils/                   # Utility functions
│   │   ├── cache/              # Cache utilities
│   │   ├── format.ts           # Formatters
│   │   └── logger.ts           # Logging utility
│   │
│   ├── App.tsx                  # Main App component
│   ├── main.tsx                # Entry point
│   ├── sw.ts                   # Service worker
│   └── wagmi.ts                # Wagmi configuration
│
├── subgraph/                    # The Graph subgraph
│   ├── schema.graphql          # GraphQL schema
│   ├── subgraph.yaml           # Subgraph manifest
│   └── src/                    # Mapping functions
│
├── doc/                         # Documentation
│   ├── backend/
│   ├── frontend/
│   ├── ARCHITECTURE.md         # This file
│   ├── COMPONENTS.md           # Components guide
│   ├── STACK.md                # Tech stack
│   └── ...
│
├── public/                      # Static assets
│   ├── manifest.json           # PWA manifest
│   ├── offline.html            # Offline fallback
│   └── ...
│
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite configuration
└── tailwind.config.js          # Tailwind configuration
```

---

## 🛣️ Routing System

### Router Configuration

**Location:** `src/router/routes.tsx`

**Pattern:** Lazy loading with code splitting

```typescript
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';

// Lazy load pages
const Home = lazy(() => import('@/pages/Home'));
const Marketplace = lazy(() => import('@/pages/Marketplace'));
const NFTs = lazy(() => import('@/pages/NFTs'));
const Profile = lazy(() => import('@/pages/Profile'));
const Staking = lazy(() => import('@/pages/Staking'));
const Chat = lazy(() => import('@/pages/Chat'));

// Route definitions
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<SkeletonLoader />}>
            <Home />
          </Suspense>
        )
      },
      {
        path: 'marketplace',
        element: (
          <Suspense fallback={<CardSkeletonLoader count={6} />}>
            <Marketplace />
          </Suspense>
        )
      },
      {
        path: 'nfts',
        element: (
          <Suspense fallback={<CardSkeletonLoader count={6} />}>
            <NFTs />
          </Suspense>
        )
      },
      {
        path: 'profile/:address',
        element: (
          <Suspense fallback={<SkeletonLoader />}>
            <Profile />
          </Suspense>
        )
      },
      {
        path: 'staking',
        element: (
          <Suspense fallback={<SkeletonLoader />}>
            <Staking />
          </Suspense>
        )
      },
      {
        path: 'chat',
        element: (
          <Suspense fallback={<SkeletonLoader />}>
            <Chat />
          </Suspense>
        )
      }
    ]
  }
]);
```

### Smart Prefetching

**Location:** `src/hooks/performance/usePrefetch.tsx`

**Strategy:** Prefetch routes based on user navigation patterns

```typescript
export function usePrefetch() {
  const queryClient = useQueryClient();

  // Prefetch marketplace data when on home page
  useEffect(() => {
    const timer = setTimeout(() => {
      queryClient.prefetchInfiniteQuery({
        queryKey: ['marketplace-nfts'],
        initialPageParam: null,
      });
    }, 1000); // 1s delay

    return () => clearTimeout(timer);
  }, []);

  // Prefetch profile data when hovering over user links
  const prefetchProfile = (address: string) => {
    queryClient.prefetchQuery({
      queryKey: ['user-profile', address],
      queryFn: () => fetchUserProfile(address),
    });
  };

  return { prefetchProfile };
}
```

---

## 🗂️ State Management

### React Query for Server State

**Pattern:** All server data managed with React Query

```typescript
// src/hooks/nfts/useReactQueryNFTs.tsx
import { useInfiniteQuery } from '@tanstack/react-query';

export function useMarketplaceNFTs(options = {}) {
  const {
    limit = 24,
    category,
    isForSale
  } = options;

  const query = useInfiniteQuery({
    queryKey: ['marketplace-nfts', { category, isForSale }],
    queryFn: ({ pageParam }) => fetchNFTs({
      limit,
      cursor: pageParam,
      category,
      isForSale
    }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 5 * 60 * 1000,      // 5 minutes
    gcTime: 30 * 60 * 1000,        // 30 minutes (garbage collection)
    retry: 2,
  });

  // Flatten pages into single array
  const nfts = query.data?.pages.flatMap(page => page.nfts) || [];

  return {
    nfts,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  };
}
```

**Benefits:**
- Automatic caching with TTL
- Background refetch
- Optimistic updates
- Infinite scroll support
- Offline support

---

### Zustand for UI State

**Pattern:** Global UI state (modals, toasts, theme)

```typescript
// src/stores/useUIStore.ts
import { create } from 'zustand';

interface UIStore {
  isModalOpen: boolean;
  modalContent: React.ReactNode | null;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
  
  toasts: Toast[];
  addToast: (toast: Toast) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isModalOpen: false,
  modalContent: null,
  openModal: (content) => set({ isModalOpen: true, modalContent: content }),
  closeModal: () => set({ isModalOpen: false, modalContent: null }),
  
  toasts: [],
  addToast: (toast) => set((state) => ({ 
    toasts: [...state.toasts, toast] 
  })),
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  })),
}));
```

**Usage:**

```typescript
function MyComponent() {
  const { openModal, closeModal } = useUIStore();

  const handleClick = () => {
    openModal(
      <div>
        <h2>Modal Title</h2>
        <button onClick={closeModal}>Close</button>
      </div>
    );
  };

  return <button onClick={handleClick}>Open Modal</button>;
}
```

---

## 🎣 Hooks System

### Hook Categories

1. **Accessibility Hooks**
   - `useFocusTrap` - Trap focus within modals
   - `useReducedMotion` - Detect reduced motion preference

2. **Mobile Hooks**
   - `useIsMobile` - Detect mobile devices
   - `useScrollDirection` - Track scroll direction
   - `useOrientation` - Detect device orientation

3. **Web3 Hooks**
   - `useStaking` - Staking contract interactions
   - `useMarketplace` - Marketplace contract interactions
   - `useNFTPurchase` - NFT purchase flow
   - `useAirdrop` - Airdrop claims

4. **Performance Hooks**
   - `usePrefetch` - Prefetch routes/data
   - `useIntersectionObserver` - Lazy load components
   - `useDebounce` - Debounce values

5. **Cache Hooks**
   - `useImageCache` - Image caching
   - `useCacheStats` - Cache statistics

### Example: Custom Hook Pattern

```typescript
// src/hooks/nfts/useNFTPurchase.tsx
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import MarketplaceABI from '@/abi/GameifiedMarketplace.json';

export function useNFTPurchase() {
  const queryClient = useQueryClient();
  const { writeContract, data: hash, error } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  const buyNFT = async (tokenId: bigint, price: bigint) => {
    try {
      await writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: MarketplaceABI.abi,
        functionName: 'buyNFT',
        args: [tokenId],
        value: price
      });
    } catch (err) {
      console.error('Purchase failed:', err);
      throw err;
    }
  };

  // Invalidate cache on successful purchase
  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: ['marketplace-nfts'] });
      queryClient.invalidateQueries({ queryKey: ['user-nfts'] });
    }
  }, [isSuccess, queryClient]);

  return {
    buyNFT,
    isLoading,
    isSuccess,
    error,
    hash
  };
}
```

---

## 🔌 API Integration

### Backend Endpoints

**Base URL:** `https://nuxchain.vercel.app/api` (production)

#### Chat API

```typescript
// POST /api/chat/stream
const response = await fetch('/api/chat/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'What is Nuxchain?',
    messages: [  // Optional: conversation history
      { role: 'user', content: 'Previous message' },
      { role: 'assistant', content: 'Previous response' }
    ]
  })
});

// Stream response
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  console.log(chunk); // Display in UI
}
```

#### Health Endpoints

```typescript
// GET /api/health/status
const status = await fetch('/api/health/status').then(r => r.json());
// { status: 'ok', timestamp: 1234567890 }

// POST /api/health/embeddings
const embeddingTest = await fetch('/api/health/embeddings', {
  method: 'POST',
  body: JSON.stringify({ text: 'test' })
});
```

---

### GraphQL Integration (The Graph)

**Client:** Apollo Client  
**Location:** `src/lib/apollo-client.ts`

```typescript
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

export const apolloClient = new ApolloClient({
  uri: 'https://api.studio.thegraph.com/query/YOUR_SUBGRAPH',
  cache: new InMemoryCache(),
});

// Query example
const GET_USER_STAKES = gql`
  query GetUserStakes($user: Bytes!) {
    stakes(
      where: { user: $user }
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      amount
      timestamp
      duration
      apy
      skills {
        id
        name
        effect
      }
    }
  }
`;

// Usage in hook
export function useUserStakes(address: string) {
  const { data, loading } = useQuery(GET_USER_STAKES, {
    variables: { user: address },
    skip: !address
  });

  return {
    stakes: data?.stakes || [],
    isLoading: loading
  };
}
```

---

## 💾 Caching Strategy

### Multi-Layer Cache System

```
┌─────────────────────────────────────┐
│     LAYER 1: React Query            │
│  - Server state cache (5-30 min)   │
│  - Automatic invalidation           │
│  - Background refetch               │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│     LAYER 2: Image Cache            │
│  - 50MB bounded cache               │
│  - LRU eviction (max 100 images)    │
│  - 1-hour TTL                       │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│     LAYER 3: Service Worker         │
│  - Static assets (30 days)          │
│  - API responses (2-5 min)          │
│  - Offline fallback                 │
└─────────────────────────────────────┘
```

### React Query Configuration

**Location:** `src/main.tsx`

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 30 * 60 * 1000,        // 30 minutes
      retry: 2,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
```

### Image Cache

**Location:** `src/utils/cache/ImageCache.ts`

```typescript
class ImageCache {
  private cache = new Map<string, CacheEntry>();
  private maxMemoryBytes = 52428800; // 50MB
  private currentMemoryUsage = 0;
  private ttlMs = 60 * 60 * 1000; // 1 hour

  async get(url: string): Promise<HTMLImageElement | null> {
    const entry = this.cache.get(url);
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.delete(url);
      return null;
    }
    
    return entry.image;
  }

  async set(url: string, image: HTMLImageElement): Promise<void> {
    const size = image.width * image.height * 4; // Estimate bytes
    
    // Enforce memory limits
    while (
      this.currentMemoryUsage + size > this.maxMemoryBytes &&
      this.cache.size > 0
    ) {
      this.evictLRU(); // Remove least recently used
    }
    
    this.cache.set(url, {
      image,
      timestamp: Date.now(),
      size
    });
    
    this.currentMemoryUsage += size;
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: 100,
      memoryUsage: this.currentMemoryUsage,
      maxMemory: this.maxMemoryBytes,
      memoryPercent: (this.currentMemoryUsage / this.maxMemoryBytes) * 100
    };
  }
}

export const imageCache = new ImageCache();
```

### Cross-Tab Synchronization

**Pattern:** localStorage events for cache invalidation

```typescript
// src/hooks/nfts/useReactQueryNFTs.tsx
useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'marketplace_nfts_invalidate') {
      queryClient.invalidateQueries({ queryKey: ['marketplace-nfts'] });
    }
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, [queryClient]);

// Trigger sync from another tab
const syncCache = () => {
  localStorage.setItem('marketplace_nfts_invalidate', Date.now().toString());
};
```

---

## 📝 Code Organization

### File Naming Conventions

```
Components:     PascalCase      NFTCard.tsx
Hooks:          camelCase       useMarketplace.tsx
Utils:          camelCase       formatPrice.ts
Types:          PascalCase      NFT.ts
Constants:      UPPER_SNAKE     STAKING_CONSTANTS.ts
CSS:            kebab-case      responsive-grid.css
```

### Import Order

```typescript
// 1. External dependencies
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

// 2. Internal absolute imports (@/)
import { useMarketplaceNFTs } from '@/hooks/nfts/useReactQueryNFTs';
import { NFTCard } from '@/components/nfts/NFTCard';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';

// 3. Types
import type { NFT } from '@/types';

// 4. Relative imports
import './styles.css';
```

### Component Structure

```typescript
// 1. Imports
import { useState } from 'react';
import { motion } from 'framer-motion';

// 2. Types
interface Props {
  title: string;
  onSubmit: () => void;
}

// 3. Constants
const ANIMATION_DURATION = 0.3;

// 4. Component
export function MyComponent({ title, onSubmit }: Props) {
  // 5. State
  const [isOpen, setIsOpen] = useState(false);

  // 6. Hooks
  const { data } = useQuery({ ... });

  // 7. Effects
  useEffect(() => {
    // ...
  }, []);

  // 8. Handlers
  const handleClick = () => {
    setIsOpen(true);
  };

  // 9. Render
  return (
    <motion.div>
      <h1>{title}</h1>
      <button onClick={handleClick}>Click</button>
    </motion.div>
  );
}
```

---

## 🔗 Related Documentation

- [Tech Stack Guide](STACK.md) - Technologies and setup
- [Components Guide](COMPONENTS.md) - UI components
- [Performance Guide](frontend/01-PERFORMANCE_AND_MOBILE_OPTIMIZATION.md)
- [Design System](frontend/02-DESIGN_SYSTEM_AND_UI.md)
- [Contributing Guide](CONTRIBUTING.md) - Development workflow

---

**Created:** November 2025  
**Maintained by:** Nuxchain Team
