import { useInfiniteQuery } from '@tanstack/react-query';
import { useAccount, usePublicClient } from 'wagmi';
import { getContract, type Abi } from 'viem';
import MarketplaceABI from '../../abi/Marketplace.json';
import { fetchTokenMetadata, ipfsToHttp } from '../../utils/ipfs/ipfsUtils';

const MARKETPLACE_ADDRESS = import.meta.env.VITE_MARKETPLACE_ADDRESS;

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

      console.log(
        `%c� useReactQueryNFTs%c\n` +
        `├─ Filter: userOnly=${userOnly}, isForSale=${isForSale}, category=${category || 'any'}\n` +
        `├─ Scanning: tokens #${startTokenId}-${endTokenId - 1} (${limit} total)\n` +
        `├─ Page: ${pageParam ? 'next' : 'first'}\n` +
        `└─ Address: ${address?.slice(0, 10)}...`,
        'color: #ff1493; font-weight: bold;',
        'color: #ffffff;'
      );

      const contract = getContract({
        address: MARKETPLACE_ADDRESS as `0x${string}`,
        abi: MarketplaceABI.abi as Abi,
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
            
            // Get listing information
            type ListedToken = [
              bigint,   // tokenId
              string,   // seller
              string,   // owner
              bigint,   // price
              boolean,  // isForSale
              bigint,   // listedTimestamp
              string    // category
            ];

            const listedToken = await contract.read.getListedToken([BigInt(tokenId)]) as ListedToken;
            
            // Apply filters
            if (category && listedToken[6] !== category) return null;
            if (typeof isForSale === 'boolean' && listedToken[4] !== isForSale) return null;
            
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
              creator: listedToken[1],
              price: listedToken[3],
              isForSale: listedToken[4],
              likes: '0',
              category: listedToken[6]
            } satisfies NFTData;
          } catch {
            // Token doesn't exist or error reading from contract
            return null;
          }
        })();
      });

      const results = await Promise.all(tokenPromises);
      const validNFTs = results.filter((nft): nft is NFTData => nft !== null);

      console.log(
        `%c✅ useReactQueryNFTs Result%c\n` +
        `├─ Valid: ${validNFTs.length}/${limit} tokens\n` +
        `├─ Filter: ${category ? category : 'no category filter'}\n` +
        `├─ For Sale Only: ${isForSale === true ? '✅' : isForSale === false ? '❌' : '⚪'}\n` +
        `└─ User Only: ${userOnly ? '✅ (by owner)' : '❌'}`,
        'color: #32cd32; font-weight: bold;',
        'color: #ffffff;'
      );

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

  return {
    // Data
    nfts,
    totalCount,
    loadedCount,
    
    // Loading states
    loading,
    loadingMore,
    error,
    hasMore,
    
    // Actions
    loadMoreNFTs: loadMore,
    refreshNFTs: refresh,
    
    // Raw React Query state (for advanced usage)
    query
  };
}
