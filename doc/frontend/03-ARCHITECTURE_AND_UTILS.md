# 🏗️ Architecture & Utilities

> **Comprehensive guide to Nuxchain's architectural utilities, logging systems, caching strategies, and helper functions.**

**Last Updated:** January 2025  
**Status:** ✅ Production Ready  
**Version:** 1.0

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Logging System](#logging-system)
3. [Caching Utilities](#caching-utilities)
4. [API Utilities](#api-utilities)
5. [Service Worker](#service-worker)
6. [Asset Management](#asset-management)
7. [Utility Functions](#utility-functions)
8. [Development Tools](#development-tools)
9. [Best Practices](#best-practices)

---

## Overview

This document covers the architectural utilities that power Nuxchain's infrastructure: centralized logging for debugging, multi-layer caching for performance, API utilities for reliable requests, and helper functions for common operations.

**Key Features:**
- **Centralized Logging:** Deduplication, development-only, bounded memory
- **LRU Caching:** TTL-based, max-size enforcement, multiple strategies
- **API Utilities:** Retry logic, timeout control, exponential backoff
- **Service Worker:** Multi-strategy caching (CacheFirst, NetworkFirst)
- **Helper Functions:** Formatting, validation, error handling

---

## Logging System

### Overview

The centralized logging system prevents console spam and provides structured debugging. All logs are deduplicated, timestamped, and development-only.

**File:** `src/utils/logger.ts`

### Logger Implementation

```typescript
interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: Record<string, any>;
  hash?: string;  // For deduplication
}

class NFTLogger {
  private logs: Map<string, LogEntry> = new Map();
  private maxEntries: number = 50;
  private isDev: boolean = process.env.NODE_ENV === 'development';

  // Deduplication: Only logs unique messages
  log(message: string, context?: Record<string, any>): void
  warn(message: string, context?: Record<string, any>): void
  error(message: string, context?: Record<string, any>): void
  
  // Debugging utilities
  getAll(): LogEntry[]
  clear(): void
  export(): string
}

export const nftLogger = new NFTLogger();
```

### Key Features

- **Deduplication:** Hash-based, prevents duplicate messages
- **Bounded Memory:** Max 50 entries, automatic cleanup
- **Development Only:** Disabled in production (zero overhead)
- **Timestamping:** ISO timestamps for all entries
- **Context Storage:** Additional data for debugging
- **Export/Import:** JSON format for debugging sessions

### Usage Examples

```typescript
import { nftLogger } from '@/utils/logger';

// ✅ CORRECT: Inside useEffect
useEffect(() => {
  nftLogger.info('NFTs loaded', { count: nfts.length });
}, [nfts]);

// ✅ CORRECT: Conditional logging with deduplication
if (!loading && nfts.length > 0) {
  nftLogger.info('Initial NFT load complete');  // Only logs once
}

// ✅ CORRECT: Error logging with context
try {
  await fetchNFTs();
} catch (error) {
  nftLogger.error('Failed to fetch NFTs', {
    error: error.message,
    url: apiUrl
  });
}

// ❌ WRONG: console.log outside useEffect (causes spam)
if (!loading && nfts.length > 0) {
  console.log('NFTs loaded');  // Logs on EVERY render!
}
```

### Component Integration

```typescript
import { nftLogger } from '@/utils/logger';

export function NFTs() {
  const { nfts, loading } = useMarketplaceNFTs();

  useEffect(() => {
    nftLogger.info('NFT page mounted', {
      nftCount: nfts.length,
      loading
    });

    return () => {
      nftLogger.info('NFT page unmounted');
    };
  }, []);

  if (loading) {
    nftLogger.debug('Fetching NFTs...');
    return <SkeletonLoader count={6} />;
  }

  return <NFTGrid nfts={nfts} />;
}
```

### Log Levels

| Level | Usage | Example |
|-------|-------|---------|
| **debug** | Development debugging | `logger.debug('State changed', { state })` |
| **info** | General information | `logger.info('Component mounted')` |
| **warn** | Warnings (non-critical) | `logger.warn('Deprecated API used')` |
| **error** | Errors and exceptions | `logger.error('Failed to load', { error })` |

---

## Caching Utilities

### Overview

Nuxchain uses multiple caching layers for optimal performance: in-memory caches (LRU), React Query caches, and Service Worker caches.

**File:** `src/utils/cache.ts`

### Cache Implementation

```typescript
interface CacheConfig {
  maxSize: number;      // Max entries
  ttl: number;          // Time to live (ms)
  strategy: 'LRU' | 'FIFO';
}

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  accessCount: number;
}

class CacheManager<T> {
  private cache: Map<string, CacheEntry<T>>;
  private config: CacheConfig;
  private accessOrder: string[];  // For LRU tracking

  set(key: string, value: T): void
  get(key: string): T | null
  has(key: string): boolean
  delete(key: string): void
  clear(): void
  size(): number
  keys(): string[]
  
  private enforceMaxSize(): void
  private isExpired(entry: CacheEntry<T>): boolean
  private evictOldest(): void
}
```

### Usage Examples

```typescript
import { CacheManager } from '@/utils/cache';

// NFT cache (5-minute TTL, max 100 entries)
const nftCache = new CacheManager({
  maxSize: 100,
  ttl: 5 * 60 * 1000,  // 5 minutes
  strategy: 'LRU'
});

// Set cache entry
nftCache.set('nft-123', nftData);

// Get cached entry
const cachedNFT = nftCache.get('nft-123');
if (cachedNFT) {
  console.log('Cache hit!', cachedNFT);
} else {
  console.log('Cache miss - fetching...');
  const nft = await fetchNFT('123');
  nftCache.set('nft-123', nft);
}

// Check cache without retrieving
if (nftCache.has('nft-123')) {
  console.log('NFT is cached');
}

// Clear specific entry
nftCache.delete('nft-123');

// Clear entire cache
nftCache.clear();
```

### Cache Types

**1. In-Memory Cache** (CacheManager)
- **Usage:** NFT data, API responses, computed values
- **TTL:** 5 minutes typical
- **Max Size:** 50-100 entries
- **Strategy:** LRU (Least Recently Used)

**2. React Query Cache**
- **Usage:** Server state (NFTs, marketplace data)
- **Stale Time:** 5 minutes
- **GC Time:** 30 minutes
- **Automatic invalidation:** On mutation

**3. Service Worker Cache**
- **Usage:** Static assets, API responses, images
- **TTL:** 30 days (images), 5 minutes (API)
- **Strategy:** CacheFirst (assets), NetworkFirst (API)

### Multi-Layer Caching Example

```typescript
// Fetch with multi-layer caching
async function fetchNFTWithCache(tokenId: string) {
  // Layer 1: In-memory cache (fastest)
  const memCached = nftCache.get(tokenId);
  if (memCached) return memCached;

  // Layer 2: React Query cache
  const { data: queryCached } = useQuery({
    queryKey: ['nft', tokenId],
    staleTime: 5 * 60 * 1000
  });
  if (queryCached) {
    nftCache.set(tokenId, queryCached);  // Populate mem cache
    return queryCached;
  }

  // Layer 3: Network (Service Worker cache used automatically)
  const nft = await fetch(`/api/nfts/${tokenId}`).then(r => r.json());
  
  // Populate all cache layers
  nftCache.set(tokenId, nft);
  return nft;
}
```

---

## API Utilities

### Overview

Robust API utilities with automatic retry, timeout control, and exponential backoff for reliable network requests.

**File:** `src/utils/api.ts`

### Fetch with Retry

```typescript
interface RequestConfig {
  timeout?: number;        // Request timeout (ms)
  retry?: number;          // Max retry attempts
  cache?: boolean;         // Use cache
  cacheDuration?: number;  // Cache TTL (ms)
  backoff?: boolean;       // Exponential backoff
}

async function fetchWithRetry(
  url: string,
  config: RequestConfig = {}
): Promise<Response> {
  const {
    timeout = 10000,
    retry = 3,
    cache = true,
    cacheDuration = 5 * 60 * 1000,
    backoff = true
  } = config;
  
  // Cache lookup
  if (cache) {
    const cached = apiCache.get(url);
    if (cached && !isExpired(cached)) {
      return cached.response;
    }
  }
  
  // Retry logic with backoff
  for (let attempt = 0; attempt < retry; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        if (cache) {
          apiCache.set(url, {
            response,
            timestamp: Date.now(),
            ttl: cacheDuration
          });
        }
        return response;
      }
      
      // Non-retriable status codes
      if (response.status === 404 || response.status === 401) {
        throw new Error(`HTTP ${response.status}`);
      }
      
    } catch (error) {
      if (attempt === retry - 1) throw error;
      
      // Exponential backoff: 100ms, 200ms, 400ms...
      if (backoff) {
        const delay = 100 * Math.pow(2, attempt);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  
  throw new Error('Max retries exceeded');
}
```

### Usage Examples

```typescript
import { fetchWithRetry } from '@/utils/api';

// Basic usage (default config)
const response = await fetchWithRetry('/api/nfts');
const nfts = await response.json();

// Custom timeout and retry
const response = await fetchWithRetry('/api/nfts', {
  timeout: 5000,   // 5 second timeout
  retry: 5,        // 5 retry attempts
  backoff: true    // Exponential backoff
});

// No caching for real-time data
const response = await fetchWithRetry('/api/live-prices', {
  cache: false
});

// POST request with retry
const response = await fetchWithRetry('/api/create-nft', {
  method: 'POST',
  body: JSON.stringify(nftData),
  headers: { 'Content-Type': 'application/json' },
  retry: 2  // Limited retries for mutations
});
```

### Error Handling

```typescript
try {
  const response = await fetchWithRetry('/api/nfts');
  const data = await response.json();
  return data;
} catch (error) {
  if (error.name === 'AbortError') {
    console.error('Request timeout');
  } else if (error.message === 'Max retries exceeded') {
    console.error('Network unstable, retries exhausted');
  } else {
    console.error('Unknown error:', error);
  }
  
  // Fallback to cached data
  const cached = apiCache.get('/api/nfts');
  return cached?.response;
}
```

---

## Service Worker

### Overview

The Service Worker provides offline support and multi-strategy caching for different resource types.

**File:** `src/sw.ts` (245 lines)

### Caching Strategies

**1. CacheFirst (Static Assets)**

Used for images, fonts, and static files that rarely change.

```typescript
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Image caching (30 days, max 60 entries)
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-v1',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Font caching (1 year, max 30 entries)
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'fonts-v1',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
      }),
    ],
  })
);
```

**2. NetworkFirst (API Responses)**

Used for API endpoints where fresh data is preferred but cache fallback is available.

```typescript
import { NetworkFirst } from 'workbox-strategies';

// GraphQL API (5-minute cache, 10-second timeout)
registerRoute(
  ({ url }) => url.pathname === '/api/graphql',
  new NetworkFirst({
    cacheName: 'graphql-v1',
    networkTimeoutSeconds: 10,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
    ],
  })
);

// RPC Calls (2-minute cache)
registerRoute(
  ({ url }) => url.hostname === 'polygon-rpc.com',
  new NetworkFirst({
    cacheName: 'rpc-v1',
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 2 * 60, // 2 minutes
      }),
    ],
  })
);
```

**3. StaleWhileRevalidate (Dynamic Content)**

Used for content that updates frequently but can show stale data while fetching fresh data.

```typescript
import { StaleWhileRevalidate } from 'workbox-strategies';

// NFT Metadata
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/nfts/'),
  new StaleWhileRevalidate({
    cacheName: 'nft-metadata-v1',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 10 * 60, // 10 minutes
      }),
    ],
  })
);
```

### Offline Support

```typescript
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { NetworkOnly } from 'workbox-strategies';

// Offline fallback page
setCatchHandler(({ event }) => {
  if (event.request.destination === 'document') {
    return caches.match('/offline.html');
  }
  
  return Response.error();
});

// Precache critical assets
import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute([
  { url: '/offline.html', revision: '1' },
  { url: '/LogoNuxchain.svg', revision: '1' },
  { url: '/manifest.json', revision: '1' }
]);
```

### Cache Management

```typescript
// Clear old caches on activation
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [
    'images-v1',
    'fonts-v1',
    'graphql-v1',
    'rpc-v1',
    'nft-metadata-v1'
  ];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

---

## Asset Management

### Public Folder Structure

The `public/` directory contains static assets served directly without processing.

```
public/
├── manifest.json              # PWA manifest configuration
├── offline.html               # Offline fallback page
├── init-react.js              # React initialization script
├── LogoNuxchain.svg           # Main logo (PWA icon)
├── Nuxchain-logo.jpg          # Logo fallback (JPG)
├── Airdrops.webp              # Feature showcase image
├── NeoHumanNFT.webp           # NFT showcase image
└── tokenization.webp          # Tokenization showcase image
```

### Asset Categories

**Essential Assets (Required for PWA):**
- `manifest.json` - PWA configuration, theme colors, icons
- `offline.html` - Offline fallback experience
- `init-react.js` - React initialization and error boundary
- `LogoNuxchain.svg` - Main logo (scalable vector)
- `Nuxchain-logo.jpg` - Logo fallback for older browsers

**Feature Images:**
- `Airdrops.webp` - Airdrops feature showcase
- `NeoHumanNFT.webp` - NFT collection showcase
- `tokenization.webp` - Tokenization feature showcase

### Image Format Guidelines

| Format | Usage | Pros | Cons |
|--------|-------|------|------|
| **WebP** | Modern images | 30% smaller, great quality | Not universal (IE11) |
| **JPG** | Photos, fallback | Universal support | Larger than WebP |
| **PNG** | Transparency needed | Lossless, transparent | Larger file size |
| **SVG** | Logos, icons | Scalable, tiny size | No raster images |

### Responsive Images Example

```tsx
// Using <picture> for format fallback
<picture>
  <source srcSet="/Airdrops.webp" type="image/webp" />
  <img 
    src="/Airdrops.jpg" 
    alt="Airdrops feature" 
    loading="lazy"
  />
</picture>

// Using srcSet for responsive sizes
<img 
  srcSet="
    /NeoHumanNFT-small.webp 400w,
    /NeoHumanNFT-medium.webp 800w,
    /NeoHumanNFT-large.webp 1200w
  "
  sizes="(max-width: 768px) 400px, (max-width: 1024px) 800px, 1200px"
  src="/NeoHumanNFT.webp"
  alt="Neo Human NFT"
  loading="lazy"
/>
```

### Asset Optimization Tips

- **Use WebP** for all new images (30% smaller than JPG)
- **Provide fallbacks** using `<picture>` for older browsers
- **Lazy load** images below the fold (`loading="lazy"`)
- **Use SVG** for logos and icons (scalable, tiny size)
- **Compress images** before adding to public folder
- **Use CDN** for frequently accessed assets (optional)

---

## Utility Functions

### Overview

Nuxchain provides utility functions for common operations: formatting, validation, error handling, and data transformation.

### File Structure

```
src/utils/
├── logger.ts            # Centralized logging system
├── cache.ts             # LRU cache implementation
├── api.ts               # API utilities with retry
├── format.ts            # Text/number formatting
├── validation.ts        # Form & data validation
└── error-handler.ts     # Error handling utilities
```

### Format Utilities

**File:** `src/utils/format.ts`

```typescript
// Number formatting
export function formatNumber(num: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
}

// Currency formatting
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}

// Ethereum address formatting
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Token amount formatting
export function formatTokenAmount(amount: bigint, decimals = 18): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const remainder = amount % divisor;
  
  if (remainder === 0n) return whole.toString();
  
  const decimal = remainder.toString().padStart(decimals, '0');
  return `${whole}.${decimal.slice(0, 4)}`;
}

// Date formatting
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date));
}

// Relative time formatting
export function formatRelativeTime(date: Date | string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  
  if (diff < minute) return 'just now';
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  return `${Math.floor(diff / day)}d ago`;
}
```

### Validation Utilities

**File:** `src/utils/validation.ts`

```typescript
// Email validation
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Ethereum address validation
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// URL validation
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Token amount validation
export function isValidTokenAmount(amount: string): boolean {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && /^\d+(\.\d{1,18})?$/.test(amount);
}

// File size validation
export function isValidFileSize(file: File, maxSizeMB = 5): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}

// File type validation
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}
```

### Error Handler Utilities

**File:** `src/utils/error-handler.ts`

```typescript
export interface AppError {
  message: string;
  code?: string;
  details?: any;
  timestamp: number;
}

// Parse Web3 errors
export function parseWeb3Error(error: any): AppError {
  // User rejected transaction
  if (error.code === 4001 || error.message.includes('User denied')) {
    return {
      message: 'Transaction cancelled by user',
      code: 'USER_REJECTED',
      timestamp: Date.now()
    };
  }
  
  // Insufficient funds
  if (error.message.includes('insufficient funds')) {
    return {
      message: 'Insufficient balance for transaction',
      code: 'INSUFFICIENT_FUNDS',
      timestamp: Date.now()
    };
  }
  
  // Network error
  if (error.message.includes('network') || error.code === 'NETWORK_ERROR') {
    return {
      message: 'Network connection error',
      code: 'NETWORK_ERROR',
      timestamp: Date.now()
    };
  }
  
  // Generic error
  return {
    message: error.message || 'Unknown error occurred',
    code: 'UNKNOWN_ERROR',
    details: error,
    timestamp: Date.now()
  };
}

// Parse API errors
export function parseApiError(error: any): AppError {
  if (error.response) {
    return {
      message: error.response.data.message || 'API request failed',
      code: `HTTP_${error.response.status}`,
      details: error.response.data,
      timestamp: Date.now()
    };
  }
  
  if (error.request) {
    return {
      message: 'No response from server',
      code: 'NO_RESPONSE',
      timestamp: Date.now()
    };
  }
  
  return {
    message: error.message || 'Unknown API error',
    code: 'UNKNOWN_ERROR',
    timestamp: Date.now()
  };
}

// Display user-friendly error
export function getUserFriendlyError(error: AppError): string {
  const errorMessages: Record<string, string> = {
    'USER_REJECTED': '❌ You cancelled the transaction',
    'INSUFFICIENT_FUNDS': '💰 Not enough funds in your wallet',
    'NETWORK_ERROR': '🌐 Network connection problem',
    'HTTP_404': '🔍 Resource not found',
    'HTTP_500': '⚠️ Server error, please try again'
  };
  
  return errorMessages[error.code || ''] || `❌ ${error.message}`;
}
```

### Usage Examples

```typescript
import { formatAddress, formatTokenAmount } from '@/utils/format';
import { isValidAddress } from '@/utils/validation';
import { parseWeb3Error, getUserFriendlyError } from '@/utils/error-handler';

// Formatting
const shortAddress = formatAddress('0x1234567890abcdef1234567890abcdef12345678');
// "0x1234...5678"

const tokenAmount = formatTokenAmount(BigInt('1500000000000000000'), 18);
// "1.5000"

// Validation
if (!isValidAddress(userAddress)) {
  alert('Invalid Ethereum address');
}

// Error handling
try {
  await contract.transfer(to, amount);
} catch (error) {
  const appError = parseWeb3Error(error);
  const message = getUserFriendlyError(appError);
  toast.error(message);
}
```

---

## Development Tools

### Logger Inspector

Use the logger inspector in the browser console to view, export, and manage logs.

```typescript
// Import logger in console
import { nftLogger } from '@/utils/logger';

// View all logs
const logs = nftLogger.getAll();
console.table(logs);

// Export logs to JSON
const json = nftLogger.export();
console.save(json, 'logs.json');  // Save to file

// Clear logs
nftLogger.clear();

// Check log count
console.log('Total logs:', nftLogger.size());
```

### Cache Inspector

Inspect cache state and manage entries from the browser console.

```typescript
import { nftCache } from '@/utils/cache';

// Check cache status
console.log('Cache Size:', nftCache.size());
console.log('Max Size:', nftCache.maxSize);

// View all cached keys
const keys = nftCache.keys();
console.table(keys);

// Get specific entry
const entry = nftCache.get('nft-123');
console.log('Cached NFT:', entry);

// Check if key exists
console.log('Has nft-123:', nftCache.has('nft-123'));

// Clear specific entry
nftCache.delete('nft-123');

// Clear entire cache
nftCache.clear();
```

### Performance Profiling

Use the Performance API to measure operation timing.

```typescript
// Mark performance points
performance.mark('nft-load-start');

// ... perform operation (e.g., load NFTs) ...

performance.mark('nft-load-end');

// Measure time between marks
performance.measure('nft-load', 'nft-load-start', 'nft-load-end');

// View all measurements
const measures = performance.getEntriesByType('measure');
console.table(measures);

// View specific measurement
const nftLoad = performance.getEntriesByName('nft-load')[0];
console.log(`NFT Load Time: ${nftLoad.duration}ms`);

// Clear marks and measures
performance.clearMarks();
performance.clearMeasures();
```

### React DevTools Profiler

Use React DevTools Profiler to identify rendering performance issues.

```tsx
import { Profiler } from 'react';

function onRenderCallback(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) {
  console.log(`${id} ${phase} took ${actualDuration}ms`);
}

// Wrap component with Profiler
<Profiler id="NFTGrid" onRender={onRenderCallback}>
  <NFTGrid nfts={nfts} />
</Profiler>
```

---

## Best Practices

### Logging Guidelines

```typescript
// ✅ DO: Log inside useEffect
useEffect(() => {
  logger.info('Component mounted');
}, []);

// ✅ DO: Use appropriate log levels
logger.error('Failed to load', { error });
logger.warn('Deprecated API used');
logger.info('Operation complete');
logger.debug('Debug information', { data });

// ✅ DO: Include context for errors
logger.error('Failed to fetch NFT', {
  tokenId: '123',
  error: error.message,
  url: apiUrl
});

// ❌ DON'T: Log on every render (outside useEffect)
if (data) console.log(data);  // Spam!

// ❌ DON'T: Use console.log in production
console.log('Debug info');  // Always use logger instead
```

### Caching Guidelines

```typescript
// ✅ DO: Set appropriate TTL for data freshness
const nftCache = new CacheManager({
  ttl: 5 * 60 * 1000  // 5 minutes for NFT data
});

const priceCache = new CacheManager({
  ttl: 30 * 1000  // 30 seconds for real-time prices
});

// ✅ DO: Bound cache size to prevent memory leaks
const cache = new CacheManager({ maxSize: 100 });

// ✅ DO: Use LRU strategy for frequently accessed data
const cache = new CacheManager({ strategy: 'LRU' });

// ❌ DON'T: Cache without TTL or max size
const cache = new Map();  // Memory leak risk!

// ❌ DON'T: Cache sensitive data
cache.set('private-key', key);  // Security risk!
```

### API Request Guidelines

```typescript
// ✅ DO: Use retry for transient failures
const data = await fetchWithRetry('/api/nfts', {
  retry: 3,
  backoff: true
});

// ✅ DO: Set timeout for slow requests
const data = await fetchWithRetry('/api/nfts', {
  timeout: 5000  // 5 seconds
});

// ✅ DO: Handle errors gracefully
try {
  const data = await fetchWithRetry('/api/nfts');
} catch (error) {
  const appError = parseApiError(error);
  toast.error(getUserFriendlyError(appError));
}

// ❌ DON'T: Retry on client errors (4xx)
// fetchWithRetry handles this automatically

// ❌ DON'T: Use retry for mutations without idempotency
await fetchWithRetry('/api/create-nft', {
  retry: 3  // May create duplicates!
});
```

### Asset Management Guidelines

```typescript
// ✅ DO: Use WebP for modern browsers
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="description" />
</picture>

// ✅ DO: Lazy load images below the fold
<img src="image.webp" alt="description" loading="lazy" />

// ✅ DO: Use SVG for logos and icons
<img src="logo.svg" alt="Logo" />

// ✅ DO: Provide alt text for accessibility
<img src="nft.webp" alt="Neo Human NFT #123" />

// ❌ DON'T: Use multiple PNG sizes when SVG works
// Use SVG with 'any' size instead

// ❌ DON'T: Forget to compress images
// Always compress before adding to public/
```

---

## File Reference

### Core Utilities

```
src/utils/
├── logger.ts            # Centralized logging with deduplication
├── cache.ts             # LRU cache with TTL and max size
├── api.ts               # Fetch with retry and timeout
├── format.ts            # Number, date, address formatting
├── validation.ts        # Email, address, URL validation
└── error-handler.ts     # Web3 and API error parsing
```

### Mobile & Performance Hooks

```
src/hooks/
├── mobile/
│   ├── useIsMobile.ts         # Mobile detection (debounced)
│   ├── useScrollDirection.ts  # Scroll tracking (RAF)
│   └── useReducedMotion.ts    # Accessibility motion
├── accessibility/
│   └── useFocusTrap.ts        # Keyboard navigation
└── performance/
    └── useImageCache.ts       # Image caching hook
```

### Backend Services

```
api/_services/
├── analytics-service.js          # Analytics tracking
├── context-cache-service.js      # Context caching
├── embeddings-service.ts         # Sentence embeddings
├── knowledge-base.js             # RAG knowledge base
├── markdown-formatter.js         # Markdown processing
├── query-classifier.js           # Query classification
├── semantic-streaming-service.js # Streaming responses
├── url-context-service.js        # URL scraping context
└── web-scraper.js                # Web scraping utility
```

---

## 📚 Related Documentation

- **[STACK.md](../STACK.md)** - Complete technology stack guide
- **[COMPONENTS.md](../COMPONENTS.md)** - UI component library reference
- **[ARCHITECTURE.md](../ARCHITECTURE.md)** - Project structure and patterns
- **[01-PERFORMANCE_AND_MOBILE_OPTIMIZATION.md](01-PERFORMANCE_AND_MOBILE_OPTIMIZATION.md)** - Performance hooks
- **[02-DESIGN_SYSTEM_AND_UI.md](02-DESIGN_SYSTEM_AND_UI.md)** - Design system and UI patterns

---

## 🎯 Quick Reference

### When to Use Each Utility

- **Logger:** Debugging, error tracking, development monitoring
- **Cache:** NFT data, API responses, computed values
- **API Utilities:** Network requests, retry logic, timeout control
- **Format Utilities:** Display values, addresses, dates, currency
- **Validation:** Form inputs, user data, file uploads
- **Error Handler:** User-friendly error messages, error tracking

### Common Patterns

```typescript
// Fetch → Cache → Display pattern
const cachedNFT = nftCache.get(tokenId);
if (cachedNFT) return cachedNFT;

const nft = await fetchWithRetry(`/api/nfts/${tokenId}`);
nftCache.set(tokenId, nft);
return nft;

// Validate → Format → Display pattern
if (!isValidAddress(address)) {
  throw new Error('Invalid address');
}
const formatted = formatAddress(address);
return <span>{formatted}</span>;

// Try → Catch → Log → Display pattern
try {
  await contract.transfer(to, amount);
  toast.success('Transfer successful!');
} catch (error) {
  const appError = parseWeb3Error(error);
  logger.error('Transfer failed', appError);
  toast.error(getUserFriendlyError(appError));
}
```

---

**Created:** November 1, 2025  
**Last Updated:** January 2025  
**Maintained by:** Nuxchain Team
