import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

export interface NFTData {
  tokenId: string;
  uniqueId: string;
  tokenURI: string | null;
  contract: `0x${string}`;
  name: string;
  description: string;
  image: string;
  attributes: NFTAttribute[];
  owner: string;
  creator: string;
  price: bigint;
  isForSale: boolean;
  likes: string;
  category: string;
}

export interface NFTPage {
  items: NFTData[];
  nextCursor: string | null;
  hasMore: boolean;
  total: number;
}

interface UseInfiniteNFTsOptions {
  limit?: number;
  filters?: Record<string, string | number | boolean>;
  enabled?: boolean;
}

/**
 * Hook para fetchear NFTs con cursor-based pagination usando React Query
 * - Cachea automáticamente
 * - Revalidación automática
 * - Prefetch nativo
 * - Manejo de errores centralizado
 */
export function useInfiniteNFTs(options: UseInfiniteNFTsOptions = {}) {
  const { limit = 24, filters = {}, enabled = true } = options;

  const query = useInfiniteQuery<NFTPage, Error, { pages: NFTPage[]; pageParams: (null | string)[] }, (string | object)[], null | string>({
    queryKey: ['nfts', { limit, ...filters }],
    queryFn: async ({ pageParam = null }) => {
      const params = new URLSearchParams({
        limit: limit.toString(),
      });

      // Add cursor if provided
      if (pageParam) {
        params.append('cursor', pageParam);
      }

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        params.append(key, String(value));
      });

      // Get API key from environment if available (for development)
      const apiKey = import.meta.env.VITE_API_KEY;

      const response = await fetch(`/api/nfts?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'X-API-Key': apiKey })
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch NFTs: ${response.statusText}`);
      }

      const data: NFTPage = await response.json();
      return data;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Flatten all pages into single array
  const nfts = (query.data?.pages ?? []).flatMap((page) => page.items);

  // Get total count from first page
  const totalCount = query.data?.pages?.[0]?.total ?? 0;

  // Get next cursor from last page
  const pages = query.data?.pages ?? [];
  const nextCursor = pages.length > 0 ? pages[pages.length - 1].nextCursor : null;

  // Prefetch next page
  const prefetch = useCallback(
    async (cursor: string) => {
      if (!cursor) return;
      
      try {
        const params = new URLSearchParams({
          limit: limit.toString(),
          cursor,
        });

        Object.entries(filters).forEach(([key, value]) => {
          params.append(key, String(value));
        });

        await fetch(`/api/nfts?${params.toString()}`);
      } catch (error) {
        console.warn('Prefetch failed:', error);
        // Silently fail - not critical for UX
      }
    },
    [limit, filters]
  );

  return {
    ...query,
    nfts,
    totalCount,
    nextCursor,
    prefetch,
  };
}
