/**
 * ✅ React 19 + React Query Best Practices
 * Optimized marketplace data fetching with advanced caching
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import { isAddress, formatEther, type Abi, type PublicClient } from 'viem';
import MarketplaceABI from '../../abi/Marketplace.json';
import { fetchTokenMetadata, ipfsToHttp, DEFAULT_IMAGE } from '../../utils/ipfs/ipfsUtils';
import type { NFTMetadata } from '../../types/nft';
import { useMemo, useCallback } from 'react';

const CONTRACT_ADDRESS = import.meta.env.VITE_MARKETPLACE_ADDRESS;

export interface MarketplaceNFT {
  tokenId: string;
  name: string;
  description: string;
  image: string;
  price: string;
  priceInEth: number;
  seller: string;
  owner: string;
  isForSale: boolean;
  listedTimestamp: number;
  category: string;
  tokenURI?: string | null;
  attributes?: Array<{ trait_type: string; value: string }>;
  metadata?: NFTMetadata | null;
}

export interface MarketplaceStats {
  totalListedNFTs: number;
  floorPrice: number;
  totalMarketValue: number;
  averagePrice: number;
}

// ✅ Query Keys Factory Pattern (React Query Best Practice)
export const marketplaceKeys = {
  all: ['marketplace'] as const,
  lists: () => [...marketplaceKeys.all, 'list'] as const,
  list: (filters: string) => [...marketplaceKeys.lists(), filters] as const,
  details: () => [...marketplaceKeys.all, 'detail'] as const,
  detail: (id: string) => [...marketplaceKeys.details(), id] as const,
};

// ✅ React 19 Best Practice: Proper typing for fetch functions
async function fetchMarketplaceNFTs(publicClient: PublicClient): Promise<MarketplaceNFT[]> {
  if (!publicClient || !CONTRACT_ADDRESS || !isAddress(CONTRACT_ADDRESS)) {
    throw new Error('Invalid contract configuration');
  }

  const listedNFTs: MarketplaceNFT[] = [];
  const MAX_TOKEN_ID = 100;
  const batchSize = 5;
  const batchDelay = 300;

  type ListedToken = [bigint, string, string, bigint, boolean, bigint, string];

  for (let i = 1; i <= MAX_TOKEN_ID; i += batchSize) {
    const batch = Array.from({ length: Math.min(batchSize, MAX_TOKEN_ID - i + 1) }, (_, idx) => i + idx);
    
    const batchPromises = batch.map(async (tokenId) => {
      try {
        // ✅ Use publicClient.readContract instead of contract.read
        const listedToken = await publicClient.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: MarketplaceABI.abi as Abi,
          functionName: 'getListedToken',
          args: [BigInt(tokenId)]
        }) as ListedToken;
        
        if (!listedToken[4]) return null; // Not for sale
        
        let metadata: NFTMetadata | null = null;
        let tokenURI: string | null = null;
        
        try {
          // ✅ Use publicClient.readContract
          tokenURI = await publicClient.readContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: MarketplaceABI.abi as Abi,
            functionName: 'tokenURI',
            args: [BigInt(tokenId)]
          }) as string;
          if (tokenURI) {
            const httpUrl = ipfsToHttp(tokenURI);
            const fetchedMetadata = await Promise.race([
              fetchTokenMetadata(httpUrl),
              new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
            ]);
            if (fetchedMetadata) metadata = fetchedMetadata;
          }
        } catch {
          // Metadata fetch failed, continue with defaults
        }
        
        const priceInWei = listedToken[3];
        const priceInEth = Number(formatEther(priceInWei));
        
        return {
          tokenId: tokenId.toString(),
          name: metadata?.name || `NFT #${tokenId}`,
          description: metadata?.description || 'No description available',
          image: metadata?.image ? ipfsToHttp(metadata.image) : DEFAULT_IMAGE,
          price: priceInWei.toString(),
          priceInEth,
          seller: listedToken[1],
          owner: listedToken[2],
          isForSale: true,
          listedTimestamp: Number(listedToken[5]),
          category: listedToken[6],
          tokenURI,
          metadata,
          attributes: metadata?.attributes || []
        } as MarketplaceNFT;
        
      } catch {
        return null;
      }
    });
    
    const batchResults = await Promise.allSettled(batchPromises);
    const validNFTs = batchResults
      .filter((result): result is PromiseFulfilledResult<MarketplaceNFT> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);
    
    listedNFTs.push(...validNFTs);
    
    if (i + batchSize <= MAX_TOKEN_ID) {
      await new Promise(resolve => setTimeout(resolve, batchDelay));
    }
  }
  
  return listedNFTs;
}

export function useMarketplace() {
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();

  // ✅ React Query with optimized caching
  const {
    data: nfts = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: marketplaceKeys.lists(),
    queryFn: () => fetchMarketplaceNFTs(publicClient),
    enabled: !!publicClient && !!CONTRACT_ADDRESS,
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
    gcTime: 30 * 60 * 1000, // 30 minutes - cache retention (formerly cacheTime)
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Use cache on mount if available
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // ✅ Calculate stats with useMemo
  const stats = useMemo((): MarketplaceStats => {
    if (nfts.length === 0) {
      return {
        totalListedNFTs: 0,
        floorPrice: 0,
        totalMarketValue: 0,
        averagePrice: 0
      };
    }

    const prices = nfts.map(nft => nft.priceInEth).filter(price => price > 0);
    const totalMarketValue = prices.reduce((sum, price) => sum + price, 0);

    return {
      totalListedNFTs: nfts.length,
      floorPrice: prices.length > 0 ? Math.min(...prices) : 0,
      totalMarketValue,
      averagePrice: prices.length > 0 ? totalMarketValue / prices.length : 0
    };
  }, [nfts]);

  // ✅ Prefetch individual NFT details
  const prefetchNFT = useCallback((tokenId: string) => {
    const nft = nfts.find(n => n.tokenId === tokenId);
    if (nft) {
      queryClient.setQueryData(marketplaceKeys.detail(tokenId), nft);
    }
  }, [nfts, queryClient]);

  // ✅ Invalidate and refetch
  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: marketplaceKeys.lists() });
    refetch();
  }, [queryClient, refetch]);

  return {
    nfts,
    stats,
    loading,
    error: error ? (error as Error).message : null,
    refreshData,
    prefetchNFT
  };
}
