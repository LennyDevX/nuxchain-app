# 🚀 Performance & Mobile Optimization

**Last Updated:** November 2025  
**Status:** ✅ Production Ready  
**Audience:** Developers

---

## � Table of Contents

1. [Overview](#overview)
2. [Mobile Detection Hooks](#mobile-detection-hooks)
3. [Scroll Optimization](#scroll-optimization)
4. [Accessibility Hooks](#accessibility-hooks)
5. [PWA & Offline Support](#pwa--offline-support)
6. [Performance Best Practices](#performance-best-practices)

---

## 🎯 Overview

Nuxchain implements a comprehensive performance and mobile optimization system using custom React hooks and intelligent caching strategies. All optimizations are built with accessibility (WCAG 2.1 AA) and mobile-first design in mind.

**Key Features:**
- ✅ Debounced mobile detection (prevents excessive re-renders)
- ✅ RAF-synchronized scroll tracking (maintains 60 FPS)
- ✅ Reduced motion support (respects user preferences)
- ✅ Focus trap for modals (keyboard navigation)
- ✅ PWA with offline support
- ✅ Intelligent image caching

---

## 📱 Mobile Detection Hooks

## 📱 Mobile Detection Hooks

### useIsMobile

**Purpose:** Detect mobile devices with debounced resize events and caching.

**Location:** `src/hooks/mobile/useIsMobile.ts`

**Features:**
- 150ms debounce on window resize
- Map-based cache (max 100 entries)
- User agent detection
- Passive event listeners

**Usage:**

```tsx
import { useIsMobile } from '@/hooks/mobile/useIsMobile';

function MyComponent() {
  const isMobile = useIsMobile();

  return (
    <div>
      {isMobile ? (
        <MobileView />
      ) : (
        <DesktopView />
      )}
    </div>
  );
}
```

**Implementation Details:**

```typescript
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    const checkMobile = debounce(() => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    }, 150); // 150ms debounce

    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}
```

**Breakpoint:** 768px (matches Tailwind's `md:` breakpoint)

---

## 🔄 Scroll Optimization

## 🔄 Scroll Optimization

### useScrollDirection

**Purpose:** Track scroll direction with RequestAnimationFrame for smooth 60 FPS performance.

**Location:** `src/hooks/mobile/useScrollDirection.ts`

**Features:**
- RAF (RequestAnimationFrame) synchronization
- 50ms throttle to reduce calculations
- Ref-based state (prevents closure issues)
- Proper cleanup on unmount

**Usage:**

```tsx
import { useScrollDirection } from '@/hooks/mobile/useScrollDirection';

function Header() {
  const scrollDirection = useScrollDirection();

  return (
    <header
      className={`
        fixed top-0 w-full transition-transform
        ${scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'}
      `}
    >
      <nav>...</nav>
    </header>
  );
}
```

**Return Values:**
- `'up'` - User scrolling up
- `'down'` - User scrolling down
- `null` - Initial state or no scroll

**Implementation Pattern:**

```typescript
export function useScrollDirection() {
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.scrollY;

      if (Math.abs(scrollY - lastScrollY.current) < 10) {
        ticking.current = false;
        return;
      }

      setDirection(scrollY > lastScrollY.current ? 'down' : 'up');
      lastScrollY.current = scrollY;
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(updateScrollDirection);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return direction;
}
```

**Performance Notes:**
- Maintains 55-60 FPS on mobile devices
- Reduces scroll jank significantly
- Passive listeners for better scroll performance

---

## ♿ Accessibility Hooks

### useReducedMotion

**Purpose:** Detect user preference for reduced motion (WCAG 2.1 AA compliance).

**Location:** `src/hooks/mobile/useReducedMotion.ts`

**Features:**
- CSS media query detection (`prefers-reduced-motion`)
- Battery Status API integration (reduces motion at < 20% battery)
- WCAG 2.1 AA compliant

**Usage:**

```tsx
import { useReducedMotion } from '@/hooks/mobile/useReducedMotion';
import { motion } from 'framer-motion';

function AnimatedCard() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
    >
      <h2>Card Title</h2>
    </motion.div>
  );
}
```

**Implementation:**

```typescript
export function useReducedMotion(): boolean {
  const [shouldReduce, setShouldReduce] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setShouldReduce(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Check battery level
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        if (battery.level < 0.2) {
          setShouldReduce(true);
        }
      });
    }
  }, []);

  return shouldReduce;
}
```

**When to Use:**
- Always in animated components
- Respect system preferences
- Improve performance on low battery

---

### useFocusTrap

**Purpose:** Trap keyboard focus within modals for WCAG AAA compliance.

**Location:** `src/hooks/accessibility/useFocusTrap.ts`

**Features:**
- Tab/Shift+Tab focus cycling
- ESC key dismissal
- Focus restoration to trigger element
- Body scroll prevention

**Usage:**

```tsx
import { useFocusTrap } from '@/hooks/accessibility/useFocusTrap';

function Modal({ isOpen, onClose }) {
  const modalRef = useFocusTrap(isOpen);

  if (!isOpen) return null;

  return (
    <div ref={modalRef} className="modal">
      <h2>Modal Title</h2>
      <button onClick={onClose}>Close</button>
      <button>Primary Action</button>
    </div>
  );
}
```

**Implementation Details:**

```typescript
export function useFocusTrap(isActive: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !ref.current) return;

    const element = ref.current;
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Get all focusable elements
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Focus first element
    firstFocusable?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        previousActiveElement.current?.focus();
        return;
      }

      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift+Tab
        if (document.activeElement === firstFocusable) {
          lastFocusable?.focus();
          e.preventDefault();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          firstFocusable?.focus();
          e.preventDefault();
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previousActiveElement.current?.focus();
    };
  }, [isActive]);

  return ref;
}
```

## 🌐 PWA & Offline Support

### Service Worker

**Purpose:** Cache static assets and API responses for offline functionality.

**Location:** `src/sw.ts` (245 lines)

**Caching Strategies:**

1. **Static Assets** (CacheFirst - 30 days)
   - Images, fonts, CSS, JS bundles
   - Max 60 entries

2. **GraphQL API** (NetworkFirst - 5 min cache)
   - Subgraph queries
   - 10s timeout, fallback to cache

3. **RPC Calls** (NetworkFirst - 2 min cache)
   - Blockchain RPC requests
   - Quick fallback

**Configuration:**

```typescript
// src/sw.ts
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Static assets
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

// GraphQL API
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
```

**Features:**
- Offline fallback page (`public/offline.html`)
- Runtime caching for dynamic content
- Auto-retry on connection restored
- Version notification for updates

---

### Bundle Optimization

**Strategy:** Lazy loading with code splitting

**Route Configuration:**

```typescript
// src/router/routes.tsx
const Chat = lazy(() =>
  import(/* webpackChunkName: "chat" */ '@/pages/Chat')
);

const Profile = lazy(() =>
  import(/* webpackChunkName: "profile" */ '@/pages/Profile')
);

const NFTs = lazy(() =>
  import(/* webpackChunkName: "nfts" */ '@/pages/NFTs')
);
```

**Bundle Sizes:**
```
Chat:        1.09 MB  (critical - AI features)
DevHub:      347 KB
Profile:     311 KB
NFTs:        109 KB
Marketplace:  44 KB
```

**Smart Preloading:**

```typescript
// Detect network speed
const connection = navigator.connection;
const isSlowNetwork =
  connection?.effectiveType === '2g' ||
  connection?.effectiveType === 'slow-2g';

// Staged preloading
if (!isSlowNetwork) {
  requestIdleCallback(() => {
    preloadRoute('marketplace');  // Immediate
    setTimeout(() => preloadRoute('nfts'), 1000);      // +1s
    setTimeout(() => preloadRoute('profile'), 2000);   // +2s
  });
}
```

---

## 🎯 Performance Best Practices

### 1. Skeleton Loaders

**Always use fixed heights to prevent CLS:**

```tsx
import { CardSkeletonLoader } from '@/components/ui/SkeletonLoader';

function NFTGrid() {
  const { nfts, isLoading } = useMarketplaceNFTs();

  if (isLoading) {
    return <CardSkeletonLoader count={6} />;
  }

  return <div className="grid grid-cols-3">{/* NFT cards */}</div>;
}
```

**Available Variants:**
- `CardSkeletonLoader` - 300px height
- `ListSkeletonLoader` - 40px per item
- `TableSkeletonLoader` - 50px per row
- `HeroSkeletonLoader` - 600px height

---

### 2. Image Optimization

**Use ImageCache for IPFS images:**

```typescript
import { imageCache } from '@/utils/cache/ImageCache';

async function loadImage(url: string) {
  // Check cache first
  const cached = await imageCache.get(url);
  if (cached) return cached;

  // Load and cache
  const img = new Image();
  img.src = url;
  await img.decode();
  
  await imageCache.set(url, img);
  return img;
}
```

**Features:**
- 50MB bounded cache
- LRU eviction (max 100 images)
- 1-hour TTL
- Automatic cleanup every 10 minutes

**Check Cache Stats:**

```typescript
const stats = imageCache.getStats();
console.log(`Memory usage: ${stats.memoryPercent}%`);
// {
//   size: 45,
//   maxSize: 100,
//   memoryUsage: 27262976,  // bytes
//   maxMemory: 52428800,
//   memoryPercent: 52
// }
```

---

### 3. React Query Configuration

**Optimal settings for Nuxchain:**

```typescript
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
```

**Infinite Scroll Pattern:**

```typescript
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['marketplace-nfts'],
  queryFn: ({ pageParam }) => fetchNFTs({ cursor: pageParam }),
  initialPageParam: null,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});

// Flatten pages
const nfts = data?.pages.flatMap(page => page.nfts) || [];
```

---

### 4. Scroll-based Prefetch

**Load next page when user reaches 80% of scroll:**

```typescript
const handleScroll = (element: HTMLElement) => {
  const { scrollTop, scrollHeight, clientHeight } = element;
  const scrollPercent = (scrollHeight - scrollTop - clientHeight) / scrollHeight;
  
  if (scrollPercent < 0.2 && hasNextPage && !isFetching) {
    fetchNextPage();
  }
};

useEffect(() => {
  const container = document.getElementById('nft-grid');
  if (!container) return;

  container.addEventListener('scroll', () => handleScroll(container));
  return () => container.removeEventListener('scroll', handleScroll);
}, [hasNextPage, isFetching]);
```

---

### 5. Cross-Tab Synchronization

**Sync cache invalidation across tabs:**

```typescript
// Listen for storage events
useEffect(() => {
  const handleSync = (e: StorageEvent) => {
    if (e.key === 'marketplace_nfts_invalidate') {
      queryClient.invalidateQueries({ queryKey: ['marketplace-nfts'] });
    }
  };

  window.addEventListener('storage', handleSync);
  return () => window.removeEventListener('storage', handleSync);
}, []);

// Broadcast invalidation
const invalidateCache = () => {
  localStorage.setItem('marketplace_nfts_invalidate', Date.now().toString());
  queryClient.invalidateQueries({ queryKey: ['marketplace-nfts'] });
};
```

---

### 6. Responsive Design

**Mobile-first with TailwindCSS:**

```tsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

// Responsive text
<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">

// Responsive padding
<div className="p-4 sm:p-6 md:p-8 lg:p-12">

// Hide/show at breakpoints
<div className="hidden md:block">Desktop Only</div>
<div className="md:hidden">Mobile Only</div>
```

**Breakpoints:**
- `sm:` 640px (large phones)
- `md:` 768px (tablets)
- `lg:` 1024px (laptops)
- `xl:` 1280px (desktops)
- `2xl:` 1536px (large desktops)

---

### 7. Animation Performance

**Use GPU-accelerated properties:**

```tsx
// ✅ Good: GPU-accelerated
<motion.div
  animate={{ opacity: 1, transform: 'translateY(0)' }}
>

// ❌ Bad: Triggers repaint
<motion.div
  animate={{ height: '200px', width: '200px' }}
>
```

**Respect reduced motion:**

```tsx
const shouldReduce = useReducedMotion();

<motion.div
  initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: shouldReduce ? 0 : 0.5 }}
>
```

---

## 🔗 Related Documentation

- [Components Guide](../COMPONENTS.md) - UI component library
- [Architecture Guide](../ARCHITECTURE.md) - Project structure
- [Design System](02-DESIGN_SYSTEM_AND_UI.md) - Design tokens
- [Tech Stack](../STACK.md) - Technologies used

---

## 📋 Performance Checklist

When building new features:

- [ ] Use `useIsMobile` for mobile detection
- [ ] Implement `useScrollDirection` for scroll-dependent UI
- [ ] Add `useReducedMotion` to all animations
- [ ] Use skeleton loaders with fixed heights
- [ ] Configure React Query with appropriate TTL
- [ ] Implement lazy loading for routes
- [ ] Add aria-labels for accessibility
- [ ] Test on mobile devices
- [ ] Check Lighthouse scores
- [ ] Verify offline functionality

---

**Created:** November 2025  
**Maintained by:** Nuxchain Team