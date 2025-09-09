import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { nftCollectionCache } from '../../utils/cache/NFTCollectionCache';
import useMarketplace from '../nfts/useMarketplace';

interface PrefetchOptions {
  enabled?: boolean;
  delay?: number;
}

export function usePrefetch(options: PrefetchOptions = {}) {
  const {
    enabled = true,
    delay = 1000 // 1 second delay before prefetching
  } = options;

  const location = useLocation();
  const { fetchMarketplaceData } = useMarketplace();

  // Prefetch marketplace data
  const prefetchMarketplace = useCallback(async () => {
    try {
      // Only prefetch if not already cached
      if (!nftCollectionCache.has('marketplace')) {
        await nftCollectionCache.prefetch(
          'marketplace',
          async () => {
            // This would need to be adapted to return NFT[] format
            // For now, we'll use the existing fetchMarketplaceData
            await fetchMarketplaceData();
            return [];
          },
          { isMarketplace: true, tags: ['marketplace', 'prefetch'] }
        );
      }
    } catch (error) {
      console.warn('Failed to prefetch marketplace data:', error);
    }
  }, [fetchMarketplaceData]);

  // Prefetch based on current route and user behavior
  const prefetchByRoute = useCallback(async (currentPath: string) => {
    if (!enabled) return;

    // If user is on home page, prefetch marketplace
    if (currentPath === '/' || currentPath === '/home') {
      setTimeout(prefetchMarketplace, delay);
    }

    // If user is viewing a specific NFT, prefetch marketplace for related items
    if (currentPath.startsWith('/nft/')) {
      setTimeout(prefetchMarketplace, delay);
    }

    // If user is on profile, they might go to marketplace next
    if (currentPath.startsWith('/profile')) {
      setTimeout(prefetchMarketplace, delay * 2); // Longer delay
    }
  }, [enabled, delay, prefetchMarketplace]);

  // Prefetch on hover for navigation links
  const prefetchOnHover = useCallback((targetRoute: string) => {
    if (!enabled) return;

    if (targetRoute.includes('marketplace')) {
      prefetchMarketplace();
    }
  }, [enabled, prefetchMarketplace]);

  // Prefetch on mouse enter for buttons/links
  const createPrefetchHandler = useCallback((route: string) => {
    return () => prefetchOnHover(route);
  }, [prefetchOnHover]);

  // Auto-prefetch based on route changes
  useEffect(() => {
    prefetchByRoute(location.pathname);
  }, [location.pathname, prefetchByRoute]);

  // Preload critical routes on app initialization
  useEffect(() => {
    if (!enabled) return;

    const preloadTimer = setTimeout(() => {
      // Preload marketplace data if user stays on the app for more than 3 seconds
      prefetchMarketplace();
    }, 3000);

    return () => clearTimeout(preloadTimer);
  }, [enabled, prefetchMarketplace]);

  return {
    prefetchMarketplace,
    prefetchOnHover,
    createPrefetchHandler,
    prefetchByRoute
  };
}

// Hook for navigation components to add prefetch behavior
export function useNavigationPrefetch() {
  const { createPrefetchHandler } = usePrefetch();

  return {
    onMarketplaceHover: createPrefetchHandler('/marketplace'),
    onProfileHover: createPrefetchHandler('/profile'),
    onCollectionsHover: createPrefetchHandler('/collections'),
    onCreateHover: createPrefetchHandler('/create')
  };
}

export default usePrefetch;