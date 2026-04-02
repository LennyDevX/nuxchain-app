import { useInfiniteQuery } from '@tanstack/react-query';
import { useAccount, usePublicClient } from 'wagmi';
import { getContract, type Abi } from 'viem';
import { useEffect, useCallback, useRef, useState } from 'react';
import { GameifiedMarketplaceCoreV1ABI as GameifiedMarketplaceCoreABI } from '../../lib/export/abis/legacy';
import { fetchTokenMetadata, ipfsToHttp } from '../../utils/ipfs/ipfsUtils';
import { nftLogger } from '../../utils/log/nftLogger';

// Nueva arquitectura: usar Proxy address
const MARKETPLACE_ADDRESS = import.meta.env.VITE_GAMEIFIED_MARKETPLACE_PROXY;

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
  price: bigint; // Changed to bigint to match component expectations
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

// Internal interface for API response (before transformation)
// Interface removed - now reading directly from contract instead of API

interface UseMarketplaceNFTsOptions {
  limit?: number;
  category?: string;
  isForSale?: boolean;
  enabled?: boolean;
  userOnly?: boolean; // Filter by connected user's NFTs
}

/**
 * ✅ React Query Hook for Marketplace NFTs
 * 
 * Features:
 * - Automatic caching & revalidation
 * - Cursor-based pagination
 * - Prefetch on scroll
 * - Automatic retry on failure
 * - Memory management (gcTime)
 * - DevTools integration
 * 
 * Replaces: useUserNFTsLazy (40+ lines of manual state → 5 lines)
 */
export function useMarketplaceNFTs(options: UseMarketplaceNFTsOptions = {}) {
  const { 
    limit = 24, 
    category, 
    isForSale,
    enabled = true,
    userOnly = false
  } = options;

  const { address } = useAccount();
  const publicClient = usePublicClient();

  // ========================================
  // 📊 OFFLINE STATE
  // ========================================
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // ✅ FIXED: Usar state con useMemo para evitar setState loop
  const [offlineCachedData, setOfflineCachedData] = useState<NFTData[] | null>(null);
  const cachedNfts = useRef<NFTData[]>([]);

  const query = useInfiniteQuery<
    NFTPage, 
    Error, 
    { pages: NFTPage[]; pageParams: (string | null)[] },
    [string, Record<string, unknown>],
    string | null
  >({
    queryKey: ['marketplace-nfts', { 
      limit, 
      category, 
      isForSale,
      userAddress: userOnly ? address : undefined 
    }],
    queryFn: async ({ pageParam }) => {
      if (!publicClient) {
        throw new Error('Public client not available');
      }

      const offset = pageParam ? parseInt(Buffer.from(pageParam, 'base64').toString(), 10) : 0;
      const startTokenId = offset + 1;
      const endTokenId = startTokenId + limit;

      nftLogger.logFetchStart({
        hook: 'useReactQueryNFTs',
        userOnly,
        isForSale,
        category,
        startToken: startTokenId,
        endToken: endTokenId,
        address
      });

      const contract = getContract({
        address: MARKETPLACE_ADDRESS as `0x${string}`,
        abi: GameifiedMarketplaceCoreABI.abi as Abi,
        client: publicClient
      });

      // Scan tokens in parallel
      const tokenPromises = Array.from({ length: limit }, (_, i) => {
        const tokenId = startTokenId + i;
        return (async () => {
          try {
            // First check if token exists and get owner
            const owner = await contract.read.ownerOf([BigInt(tokenId)]) as string;
            
            // If userOnly filter, check ownership first
            if (userOnly && address && owner.toLowerCase() !== address.toLowerCase()) {
              return null;
            }
            
            // Check if token is listed (use isListed mapping and listedPrice mapping)
            let isForSale = false;
            let price = 0n;
            let category = 'coleccionables';
            
            try {
              // Read isListed mapping
              isForSale = await contract.read.isListed([BigInt(tokenId)]) as boolean;
              
              if (isForSale) {
                // Read listed price
                price = await contract.read.listedPrice([BigInt(tokenId)]) as bigint;
              }
              
              // Try to read category from nftMetadata (check if it exists)
              try {
                const metadata = await contract.read.nftMetadata([BigInt(tokenId)]) as [string, string, string, bigint, bigint];
                category = metadata[2] || 'coleccionables';
              } catch {
                category = 'coleccionables';
              }
            } catch {
              // If we can't read listing info, continue anyway
              // NFT still exists and user owns it
            }
            
            // Apply filters
            if (category && category !== 'coleccionables' && category.toLowerCase() !== category.toLowerCase()) return null;
            if (typeof isForSale === 'boolean' && isForSale === false && !userOnly) return null;
            
            // For user's NFTs, show all tokens (even if not for sale)
            // For marketplace view, only show tokens that are for sale

            // Fetch metadata
            let name = `NFT #${tokenId}`;
            let description = '';
            let image = '';
            let attributes: NFTAttribute[] = [];
            let tokenURI: string | null = null;

            try {
              tokenURI = await contract.read.tokenURI([BigInt(tokenId)]) as string;
              if (tokenURI) {
                const httpUrl = ipfsToHttp(tokenURI);
                const metadata = await Promise.race([
                  fetchTokenMetadata(httpUrl),
                  new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
                ]);
                if (metadata) {
                  name = metadata.name || name;
                  description = metadata.description || '';
                  image = metadata.image ? ipfsToHttp(metadata.image) : '';
                  attributes = metadata.attributes?.map(attr => ({
                    trait_type: attr.trait_type,
                    value: attr.value
                  })) || [];
                }
              }
            } catch {
              console.warn(`Failed to fetch metadata for token ${tokenId}`);
            }

            return {
              tokenId: tokenId.toString(),
              uniqueId: `${MARKETPLACE_ADDRESS}-${tokenId}`,
              tokenURI,
              contract: MARKETPLACE_ADDRESS as `0x${string}`,
              name,
              description,
              image,
              attributes,
              owner, // Use the actual owner from ownerOf
              creator: owner, // Use owner as creator for now (would need metadata storage)
              price: price,
              isForSale: isForSale,
              likes: '0',
              category: category
            } satisfies NFTData;
          } catch {
            // Token doesn't exist or error reading from contract
            return null;
          }
        })();
      });

      const results = await Promise.all(tokenPromises);
      const validNFTs = results.filter((nft): nft is NFTData => nft !== null);

      nftLogger.logFetchResult({
        hook: 'useReactQueryNFTs',
        valid: validNFTs.length,
        total: limit,
        category,
        isForSale,
        userOnly
      });

      const nextCursor = validNFTs.length === limit 
        ? Buffer.from((offset + limit).toString()).toString('base64')
        : null;

      return {
        items: validNFTs,
        nextCursor,
        hasMore: validNFTs.length === limit,
        total: validNFTs.length
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : null,
    enabled: enabled && (!userOnly || !!address), // Disable if userOnly but no address
    staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh
    gcTime: 30 * 60 * 1000, // 30 minutes - cache cleanup time
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchOnWindowFocus: false, // Disable refetch on tab focus
    refetchOnMount: false, // Use cached data on remount
  });

  // Flatten all pages into single array
  const nfts = (query.data?.pages ?? []).flatMap((page) => page.items);

  // Get metrics
  const totalCount = query.data?.pages?.[0]?.total ?? 0;
  const loadedCount = nfts.length;
  const hasMore = query.hasNextPage ?? false;

  // Loading states
  const loading = query.isLoading;
  const loadingMore = query.isFetchingNextPage;
  const error = query.error?.message ?? null;

  // Actions
  const loadMore = query.fetchNextPage;
  const refresh = query.refetch;

  // ========================================
  // 🚀 FEATURE 1: PREFETCHING ON SCROLL
  // ========================================
  const handleScroll = useCallback((element: HTMLElement) => {
    if (!query.hasNextPage || query.isFetchingNextPage) return;

    const scrollPercent = 
      (element.scrollHeight - element.scrollTop) / element.scrollHeight;

    // Prefetch when user scrolls to 20% from bottom
    if (scrollPercent < 0.2) {
      query.fetchNextPage().catch(() => {
        // Silent fail on prefetch
      });
    }
  }, [query]);

  // ========================================
  // 🟢 FEATURE 2: OFFLINE DETECTION & CACHED DATA
  // ========================================
  // ✅ FIXED: Actualizar cache con state pero solo cuando cambia length (evita loop)
  useEffect(() => {
    if (nfts.length > 0 && nfts.length !== offlineCachedData?.length) {
      cachedNfts.current = nfts;
      setOfflineCachedData(nfts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nfts.length]); // Solo depende de length para evitar loop infinito

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Refetch cuando vuelve la conexión
      query.refetch().catch(() => {
        // Silent fail
      });
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial online status asynchronously
    Promise.resolve().then(() => {
      setIsOnline(navigator.onLine);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [query]);

  // ========================================
  // 📱 FEATURE 3: CROSS-TAB SYNC
  // ========================================
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'marketplace_nfts_invalidate') {
        // Otra pestaña invalidó el cache
        query.refetch().catch(() => {
          // Silent fail
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, [query]);

  // Notificar a otras pestañas cuando se refresca
  const refreshWithSync = useCallback(async () => {
    await refresh();
    // Notificar a otras pestañas
    localStorage.setItem('marketplace_nfts_invalidate', Date.now().toString());
  }, [refresh]);

  return {
    // Data
    nfts: isOnline ? nfts : (offlineCachedData || nfts),
    totalCount,
    loadedCount,
    
    // Loading states
    loading,
    loadingMore,
    error,
    hasMore,
    
    // Network states
    isOnline,
    offlineCachedData,
    
    // Actions
    loadMoreNFTs: loadMore,
    refreshNFTs: refreshWithSync,
    onScroll: handleScroll,  // ✅ Usar en componente con: onScroll={(e) => onScroll(e.currentTarget)}
    
    // Raw React Query state (for advanced usage)
    query
  };
}
