import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePublicClient } from 'wagmi';
import { getContract, isAddress, formatEther, type Abi } from 'viem';
import MarketplaceABI from '../../abi/Marketplace.json';
import { fetchTokenMetadata, ipfsToHttp } from '../../utils/ipfsUtils';
import { nftCollectionCache } from '../../utils/cache/NFTCollectionCache';

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
  attributes?: any[];
  metadata?: any;
  uniqueId?: string;
  contract?: `0x${string}`;
  creator?: string;
  likes?: string;
}

export interface MarketplaceStats {
  totalListedNFTs: number;
  floorPrice: number;
  totalMarketValue: number;
  totalVolume: number;
  averagePrice: number;
}

export interface UseMarketplaceReturn {
  nfts: MarketplaceNFT[];
  filteredNFTs: MarketplaceNFT[];
  stats: MarketplaceStats;
  loading: boolean;
  error: string | null;
  refreshData: () => void;
  fetchMarketplaceData: () => void;
  filterByCategory: (category: string) => void;
  filterByPriceRange: (min: number, max: number) => void;
  searchByName: (query: string) => void;
  sortBy: (field: 'price' | 'name' | 'date') => void;
  currentFilters: {
    category: string;
    priceRange: { min: number; max: number };
    searchQuery: string;
    sortBy: string;
  };
}

export default function useMarketplace(): UseMarketplaceReturn {
  const [nfts, setNfts] = useState<MarketplaceNFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState({
    category: 'all',
    priceRange: { min: 0, max: Infinity },
    searchQuery: '',
    sortBy: 'date'
  });

  const publicClient = usePublicClient();

  // Cache marketplace data with improved strategy
  const cacheMarketplaceData = useCallback((nfts: MarketplaceNFT[]) => {
    nftCollectionCache.set('marketplace', nfts, {
      isMarketplace: true,
      tags: ['marketplace', 'nft-list']
    });
  }, []);

  // Get cached marketplace data
  const getCachedMarketplaceData = useCallback((): MarketplaceNFT[] | null => {
    const cached = nftCollectionCache.get('marketplace');
    if (!cached) return null;
    
    // Type guard to ensure we have MarketplaceNFT objects
    return cached.filter((nft): nft is MarketplaceNFT => 
      'priceInEth' in nft && 'isForSale' in nft && 'category' in nft
    );
  }, []);

  // Invalidate marketplace cache when needed
  const invalidateMarketplaceCache = useCallback(() => {
    nftCollectionCache.invalidateMarketplaceData();
  }, []);

  const fetchMarketplaceData = useCallback(async () => {
    if (!publicClient || !CONTRACT_ADDRESS || !isAddress(CONTRACT_ADDRESS)) {
      setError('Invalid contract configuration');
      return;
    }

    // Try to get cached data first
    const cachedData = getCachedMarketplaceData();
    if (cachedData && cachedData.length > 0) {
      setNfts(cachedData);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const contract = getContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: MarketplaceABI.abi as Abi,
        client: publicClient
      });

      // Get total supply to know how many tokens exist
      let totalSupply: bigint;
      try {
        totalSupply = await contract.read.totalSupply() as bigint;
      } catch {
        // If totalSupply doesn't exist, we'll try to get tokens by checking a range
        totalSupply = 1000n; // Fallback to check first 1000 tokens
      }

      const listedNFTs: MarketplaceNFT[] = [];
      const batchSize = 50; // Process in batches to avoid overwhelming the RPC
      
      for (let i = 1; i <= Number(totalSupply); i += batchSize) {
        const batch = [];
        const endIndex = Math.min(i + batchSize - 1, Number(totalSupply));
        
        for (let tokenId = i; tokenId <= endIndex; tokenId++) {
          batch.push(tokenId);
        }

        // Process batch in parallel
        const batchPromises = batch.map(async (tokenId) => {
          try {
            // Check if token exists and get listed token info
            const listedToken = await contract.read.getListedToken([BigInt(tokenId)]) as any[];
            
            if (!listedToken || !listedToken[4]) { // isForSale is at index 4
              return null;
            }

            // Get token URI and metadata
            let tokenURI: string;
            let metadata: any = {};
            
            try {
              tokenURI = await contract.read.tokenURI([BigInt(tokenId)]) as string;
              if (tokenURI) {
                const httpUrl = ipfsToHttp(tokenURI);
                metadata = await fetchTokenMetadata(httpUrl);
              }
            } catch (metadataError) {
              console.warn(`Failed to fetch metadata for token ${tokenId}:`, metadataError);
            }

            const priceInWei = listedToken[3] as bigint;
            const priceInEth = Number(formatEther(priceInWei));

            return {
              tokenId: tokenId.toString(),
              name: metadata.name || `NFT #${tokenId}`,
              description: metadata.description || 'No description available',
              image: metadata.image ? ipfsToHttp(metadata.image) : '/placeholder-nft.png',
              price: priceInWei.toString(),
              priceInEth,
              seller: listedToken[1] as string,
              owner: listedToken[2] as string,
              isForSale: listedToken[4] as boolean,
              listedTimestamp: Number(listedToken[5] as bigint),
              category: listedToken[6] as string,
              metadata
            } as MarketplaceNFT;
          } catch (tokenError) {
            // Token doesn't exist or other error, skip it
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
      }

      setNfts(listedNFTs);
      // Cache the fetched data
      cacheMarketplaceData(listedNFTs);
    } catch (err) {
      console.error('Error fetching marketplace data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch marketplace data');
    } finally {
      setLoading(false);
    }
  }, [publicClient, getCachedMarketplaceData, cacheMarketplaceData]);

  // Calculate marketplace statistics
  const stats = useMemo((): MarketplaceStats => {
    if (nfts.length === 0) {
      return {
        totalListedNFTs: 0,
        floorPrice: 0,
        totalMarketValue: 0,
        totalVolume: 0,
        averagePrice: 0
      };
    }

    const prices = nfts.map(nft => nft.priceInEth).filter(price => price > 0);
    const totalMarketValue = prices.reduce((sum, price) => sum + price, 0);
    const floorPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const averagePrice = prices.length > 0 ? totalMarketValue / prices.length : 0;

    return {
      totalListedNFTs: nfts.length,
      floorPrice,
      totalMarketValue,
      totalVolume: totalMarketValue, // For now, using total market value as volume
      averagePrice
    };
  }, [nfts]);

  // Filter and sort NFTs based on current filters
  const filteredNFTs = useMemo(() => {
    let filtered = [...nfts];

    // Filter by category
    if (currentFilters.category !== 'all') {
      filtered = filtered.filter(nft => 
        nft.category.toLowerCase() === currentFilters.category.toLowerCase()
      );
    }

    // Filter by price range
    filtered = filtered.filter(nft => 
      nft.priceInEth >= currentFilters.priceRange.min && 
      nft.priceInEth <= currentFilters.priceRange.max
    );

    // Filter by search query
    if (currentFilters.searchQuery) {
      const query = currentFilters.searchQuery.toLowerCase();
      filtered = filtered.filter(nft => 
        nft.name.toLowerCase().includes(query) ||
        nft.description.toLowerCase().includes(query) ||
        nft.tokenId.includes(query)
      );
    }

    // Sort
    switch (currentFilters.sortBy) {
      case 'price':
        filtered.sort((a, b) => a.priceInEth - b.priceInEth);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'date':
      default:
        filtered.sort((a, b) => b.listedTimestamp - a.listedTimestamp);
        break;
    }

    return filtered;
  }, [nfts, currentFilters]);

  // Filter functions
  const filterByCategory = useCallback((category: string) => {
    setCurrentFilters(prev => ({ ...prev, category }));
  }, []);

  const filterByPriceRange = useCallback((min: number, max: number) => {
    setCurrentFilters(prev => ({ ...prev, priceRange: { min, max } }));
  }, []);

  const searchByName = useCallback((query: string) => {
    setCurrentFilters(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const sortBy = useCallback((field: 'price' | 'name' | 'date') => {
    setCurrentFilters(prev => ({ ...prev, sortBy: field }));
  }, []);

  const refreshData = useCallback(() => {
    // Invalidate cache before refreshing
    invalidateMarketplaceCache();
    fetchMarketplaceData();
  }, [fetchMarketplaceData, invalidateMarketplaceCache]);

  // Initial data fetch
  useEffect(() => {
    fetchMarketplaceData();
  }, [fetchMarketplaceData]);

  return {
    nfts,
    filteredNFTs,
    stats,
    loading,
    error,
    refreshData,
    fetchMarketplaceData,
    filterByCategory,
    filterByPriceRange,
    searchByName,
    sortBy,
    currentFilters
  };
}