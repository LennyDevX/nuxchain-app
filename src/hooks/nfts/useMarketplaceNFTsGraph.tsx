import { useInfiniteQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { useCallback, useEffect, useState } from 'react';
import { apolloClient } from '../../lib/apollo-client';
import { gql } from '@apollo/client';
import { nftLogger } from '../../utils/log/nftLogger';
import { createPublicClient, http } from 'viem';
import { polygon } from 'viem/chains';

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

interface UseMarketplaceNFTsOptions {
  limit?: number;
  category?: string;
  isForSale?: boolean;
  enabled?: boolean;
  userOnly?: boolean;
}

// ✅ Query del subgraph - Activities with NFT_MINT type
// NOTA: Esta es la query que funciona en todas las versiones del subgraph
const GET_MARKETPLACE_NFTS_FALLBACK = gql`
  query GetMarketplaceNFTsFallback(
    $user: Bytes!
    $first: Int!
    $skip: Int!
  ) {
    activities(
      where: { user: $user, type: "NFT_MINT" }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      tokenId
      timestamp
      transactionHash
      blockNumber
      user
      category
    }
  }
`;

// ✅ Query para NFTs listados en venta
const GET_MARKETPLACE_NFTS_FOR_SALE = gql`
  query GetMarketplaceNFTsForSale(
    $first: Int!
    $skip: Int!
  ) {
    activities(
      where: { type: "NFT_LIST" }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      tokenId
      timestamp
      transactionHash
      blockNumber
      user
      category
      amount
    }
  }
`;

// ✅ Query para NFTs listados en venta del usuario específico
const GET_USER_NFTS_FOR_SALE = gql`
  query GetUserNFTsForSale(
    $user: Bytes!
    $first: Int!
    $skip: Int!
  ) {
    activities(
      where: { user: $user, type: "NFT_LIST" }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      tokenId
      timestamp
      transactionHash
      blockNumber
      user
      category
      amount
    }
  }
`;

// 🔗 Viem client para leer del contrato (Polygon Mainnet, no testnet)
const publicClient = createPublicClient({
  chain: polygon,
  transport: http()
});

// 📝 ABI mínimo para tokenURI
const TOKEN_URI_ABI = [{
  inputs: [{ name: 'tokenId', type: 'uint256' }],
  name: 'tokenURI',
  outputs: [{ name: '', type: 'string' }],
  stateMutability: 'view',
  type: 'function'
}] as const;

/**
 * ✅ FIXED: React Query Hook para Marketplace NFTs usando SUBGRAPH
 * 
 * Corregido:
 * - Ahora usa The Graph subgraph en lugar de consultas directas al contrato
 * - Los NFTs recién minteados aparecerán automáticamente después del indexing
 * - Mejor rendimiento y sincronización en tiempo real
 * - Compatibilidad con eventos del subgraph
 */
export function useMarketplaceNFTsGraph(options: UseMarketplaceNFTsOptions = {}) {
  const {
    limit = 24,
    category,
    isForSale,
    enabled = true,
    userOnly = false
  } = options;

  const { address } = useAccount();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineCachedData, setOfflineCachedData] = useState<NFTData[] | null>(null);

  const query = useInfiniteQuery<
    NFTPage,
    Error,
    { pages: NFTPage[]; pageParams: (number)[] },
    [string, Record<string, unknown>],
    number
  >({
    queryKey: ['marketplace-nfts-graph', {
      limit,
      category,
      isForSale,
      userAddress: userOnly ? address : undefined
    }],
    queryFn: async ({ pageParam = 0 }) => {
      const skip = pageParam;

      nftLogger.logFetchStart({
        hook: 'useMarketplaceNFTsGraph',
        userOnly,
        isForSale,
        category,
        startToken: 0,
        endToken: limit,
        address
      });

      try {
        // ✅ Use Activities query directly (nftMints not available in current subgraph version)
        let nftSource = [];
        
        // Choose query based on what we're filtering for
        if (userOnly && address) {
          // Show user's NFTs - Query BOTH NFT_MINT and NFT_LIST to show all user's NFTs (created AND listed)
          console.log('📊 Querying user NFTs (mints + listings) for:', address);
          
          try {
            // Query 1: User's created NFTs
            const mintResult = await apolloClient.query({
              query: GET_MARKETPLACE_NFTS_FALLBACK,
              variables: {
                user: address.toLowerCase(),
                first: limit,
                skip: skip
              },
              fetchPolicy: 'network-only'
            });
            
            const mintActivities = mintResult.data?.activities || [];
            console.log(`✅ Found ${mintActivities.length} user-created NFTs (NFT_MINT)`);
            
            // Query 2: User's listed NFTs
            const saleResult = await apolloClient.query({
              query: GET_USER_NFTS_FOR_SALE,
              variables: {
                user: address.toLowerCase(),
                first: limit,
                skip: skip
              },
              fetchPolicy: 'network-only'
            });
            
            const saleActivities = saleResult.data?.activities || [];
            console.log(`✅ Found ${saleActivities.length} user-listed NFTs (NFT_LIST)`);
            
            // Combine both queries - deduplicate by tokenId
            const tokenIdSet = new Set<string>();
            nftSource = [];
            
            // Add mints first
            for (const activity of mintActivities) {
              tokenIdSet.add(activity.tokenId);
              nftSource.push(activity);
            }
            
            // Add sales (for updated price info)
            for (const activity of saleActivities) {
              if (!tokenIdSet.has(activity.tokenId)) {
                nftSource.push(activity);
              } else {
                // Replace mint info with sale info to get the latest price
                const existingIndex = nftSource.findIndex(a => a.tokenId === activity.tokenId);
                if (existingIndex >= 0) {
                  nftSource[existingIndex] = activity;
                }
              }
            }
            
            console.log(`📊 Combined result: ${nftSource.length} unique user NFTs`);
            
          } catch (userQueryError) {
            console.error('❌ User NFTs query FAILED:', {
              message: userQueryError instanceof Error ? userQueryError.message : String(userQueryError),
              fullError: userQueryError
            });
            throw userQueryError;
          }
          
        } else if (isForSale) {
          // Show only NFTs that are listed for sale (NFT_LIST activities)
          console.log('📊 Querying NFT_LIST activities (marketplace for sale)');
          
          try {
            const result = await apolloClient.query({
              query: GET_MARKETPLACE_NFTS_FOR_SALE,
              variables: {
                first: limit,
                skip: skip
              },
              fetchPolicy: 'network-only'
            });
            nftSource = result.data?.activities || [];
            console.log(`✅ Found ${nftSource.length} listed NFTs (NFT_LIST)`);
          } catch (activitiesError) {
            console.error('❌ FOR_SALE query FAILED:', {
              message: activitiesError instanceof Error ? activitiesError.message : String(activitiesError),
              fullError: activitiesError
            });
            throw activitiesError;
          }
          
        } else {
          // Show all NFTs (all NFT_MINT activities)
          console.log('📊 Querying all NFT_MINT activities (all NFTs)');
          
          try {
            const result = await apolloClient.query({
              query: GET_MARKETPLACE_NFTS_FALLBACK,
              variables: {
                user: '0x0000000000000000000000000000000000000000', // dummy value
                first: limit,
                skip: skip
              },
              fetchPolicy: 'network-only'
            });
            nftSource = result.data?.activities || [];
            console.log(`✅ Found ${nftSource.length} all NFTs (NFT_MINT)`);
          } catch (activitiesError) {
            console.error('❌ ALL NFTs query FAILED:', {
              message: activitiesError instanceof Error ? activitiesError.message : String(activitiesError),
              fullError: activitiesError
            });
            throw activitiesError;
          }
        }
        
        console.log('📊 Activities query result:', {
          activitiesCount: nftSource.length,
          userFiltered: userOnly ? address : 'all',
          skip,
          limit
        });
        
        // 🔍 No additional filtering needed - Activities already filters by type and optionally by user
        
        console.log(`✅ Activities NFT_MINT found:`, nftSource.length, {
          creatorAddress: userOnly ? address : 'all',
          skip,
          limit,
          timestamp: new Date().toISOString()
        });

        if (!nftSource || nftSource.length === 0) {
          console.warn('ℹ️ No NFT mints found. Possible reasons:', {
            justMinted: 'NFT was just minted, wait ~30 seconds for indexing',
            wrongStartBlock: `NFTs minted before block ${78897900} won't appear`,
            noEventsEmitted: 'Verify TokenCreated event was emitted on contract',
            filteringByCreator: userOnly && address ? `Filtering by creator: ${address}` : 'Showing all NFTs'
          });
          
          return {
            items: [],
            nextCursor: null,
            hasMore: false,
            total: 0
          };
        }

        // ✅ Transform to NFTData format (Activities format)
        const itemsPromises = nftSource.map(async (item: { id: string; tokenId: string; user: string; timestamp: string; transactionHash: string; blockNumber: string; category?: string; amount?: string }) => {
          const creatorId = item.user;
          let nftPrice = 0n;
          
          // 🔍 DEBUG: Log Activities item
          console.log(`🔍 Token #${item.tokenId} from Activities:`, {
            id: item.id,
            user: item.user,
            category: item.category,
            amount: item.amount,
            isForSale: !!item.amount
          });
          
          // If amount exists (NFT_LIST event), use it as price
          if (item.amount) {
            try {
              nftPrice = BigInt(item.amount);
              console.log(`💰 NFT #${item.tokenId} listed at price:`, nftPrice.toString());
            } catch {
              nftPrice = 0n;
            }
          }
          
          // �🖼️ Fetch metadata from tokenURI if available
          let metadata = {
            name: `NFT #${item.tokenId}`,
            description: item.category ? `${item.category} NFT` : 'Digital Collectible',
            image: `https://api.dicebear.com/7.x/shapes/svg?seed=${item.tokenId}`, // Placeholder image
            attributes: [] as NFTAttribute[]
          };

          // ✅ ALWAYS fetch tokenURI from contract (Activities doesn't have it)
          let tokenURI: string | null = null;
          try {
            console.log(`🔗 Fetching tokenURI from contract for token ${item.tokenId}...`);
            const uri = await publicClient.readContract({
              address: '0xa3Fe859A35126D50257D175e355C7181Bcd1E19b' as `0x${string}`,
              abi: TOKEN_URI_ABI,
              functionName: 'tokenURI',
              args: [BigInt(item.tokenId)]
            });
            console.log(`📊 Contract read response for token ${item.tokenId}:`, { uri, type: typeof uri, length: uri?.length });
            if (uri && uri !== '0x' && uri.length > 0) {
              tokenURI = uri;
              console.log(`📝 ✅ Fetched tokenURI for token ${item.tokenId}:`, tokenURI);
            } else {
              console.info(`ℹ️ Contract returned empty/invalid URI for token ${item.tokenId}, will use placeholder`);
            }
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            console.info(`ℹ️ Could not fetch tokenURI from contract for token ${item.tokenId}. Error: ${errorMsg}`);
          }

          // Load real metadata if tokenURI available
          if (tokenURI && tokenURI.length > 0) {
            try {
              const httpURI = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
              console.log(`🔍 Fetching metadata from: ${httpURI}`);
              const response = await fetch(httpURI, { signal: AbortSignal.timeout(5000) });
              if (response.ok) {
                const json = await response.json();
                metadata = {
                  name: json.name || metadata.name,
                  description: json.description || metadata.description,
                  image: json.image ? json.image.replace('ipfs://', 'https://ipfs.io/ipfs/') : metadata.image,
                  attributes: json.attributes || []
                };
                console.log(`✅ Loaded metadata for NFT #${item.tokenId}:`, metadata.name);
              }
            } catch {
              console.warn(`⚠️ Using placeholder for token ${item.tokenId} - metadata fetch failed`);
            }
          }
          
          return {
            tokenId: item.tokenId.toString(),
            uniqueId: `nft-activity-${item.id}`,
            tokenURI: tokenURI || null,
            contract: '0xa3Fe859A35126D50257D175e355C7181Bcd1E19b' as `0x${string}`,
            name: metadata.name,
            description: metadata.description,
            image: metadata.image,
            attributes: metadata.attributes,
            owner: creatorId,
            creator: creatorId,
            price: nftPrice,
            isForSale: nftPrice > 0n,
            likes: '0',
            category: item.category || 'coleccionables'
          } satisfies NFTData;
        });

        const items = await Promise.all(itemsPromises);
        
        // 🐛 Debug: Log final items with images
        console.log('🖼️ Final NFT items:', items.map(nft => ({ 
          tokenId: nft.tokenId, 
          name: nft.name,
          image: nft.image,
          hasImage: !!nft.image,
          imageLength: nft.image?.length 
        })));

        nftLogger.logFetchResult({
          hook: 'useMarketplaceNFTsGraph',
          valid: items.length,
          total: limit,
          category,
          isForSale,
          userOnly
        });

        const hasMore = items.length === limit;
        const nextCursor = hasMore ? skip + limit : null;

        return {
          items,
          nextCursor: nextCursor ? nextCursor.toString() : null,
          hasMore,
          total: items.length
        };
        } catch (error) {
        console.error('❌ Error fetching NFTs from subgraph v0.11:', error);
        throw error;
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore || !lastPage.nextCursor) return undefined;
      return parseInt(lastPage.nextCursor, 10);
    },
    enabled: enabled && (!userOnly || !!address),
    refetchInterval: 30 * 1000, // ✅ Refetch every 30 seconds to catch when v0.0.6 becomes active
    staleTime: 1 * 60 * 1000, // 1 minute - more frequent updates since data comes from subgraph
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
  });

  // Flatten all pages
  const nfts = (query.data?.pages ?? []).flatMap((page) => page.items);
  const totalCount = query.data?.pages?.[0]?.total ?? 0;
  const loadedCount = nfts.length;
  const hasMore = query.hasNextPage ?? false;

  const loading = query.isLoading;
  const loadingMore = query.isFetchingNextPage;
  const error = query.error?.message ?? null;

  const loadMore = query.fetchNextPage;
  const refresh = query.refetch;

  // ========================================
  // 🚀 PREFETCHING ON SCROLL
  // ========================================
  const handleScroll = useCallback((element: HTMLElement) => {
    if (!query.hasNextPage || query.isFetchingNextPage) return;

    const scrollPercent =
      (element.scrollHeight - element.scrollTop) / element.scrollHeight;

    if (scrollPercent < 0.2) {
      query.fetchNextPage().catch(() => {
        // Silent fail
      });
    }
  }, [query]);

  // ========================================
  // 🟢 OFFLINE DETECTION & CACHED DATA
  // ========================================
  useEffect(() => {
    if (nfts.length > 0 && nfts.length !== offlineCachedData?.length) {
      setOfflineCachedData(nfts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nfts.length]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      query.refetch().catch(() => {
        // Silent fail
      });
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    Promise.resolve().then(() => {
      setIsOnline(navigator.onLine);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [query]);

  // ========================================
  // 📱 CROSS-TAB SYNC
  // ========================================
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'marketplace_nfts_invalidate') {
        query.refetch().catch(() => {
          // Silent fail
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, [query]);

  const refreshWithSync = useCallback(async () => {
    await refresh();
    localStorage.setItem('marketplace_nfts_invalidate', Date.now().toString());
  }, [refresh]);

  return {
    nfts: isOnline ? nfts : (offlineCachedData || nfts),
    totalCount,
    loadedCount,
    loading,
    loadingMore,
    error,
    hasMore,
    isOnline,
    offlineCachedData,
    loadMoreNFTs: loadMore,
    refreshNFTs: refreshWithSync,
    onScroll: handleScroll,
    query
  };
}
