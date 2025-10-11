import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePublicClient } from 'wagmi';
import { getContract, isAddress, formatEther, type Abi } from 'viem';
import MarketplaceABI from '../../abi/Marketplace.json';
import { fetchTokenMetadata, ipfsToHttp, DEFAULT_IMAGE } from '../../utils/ipfs/ipfsUtils';
import type { NFTMetadata } from '../../types/nft';
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
  attributes?: Array<{ trait_type: string; value: string }>;
  metadata?: NFTMetadata | null;
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

// Persistent cache in localStorage
const MARKETPLACE_CACHE_KEY = 'marketplace_nfts_cache';
const MARKETPLACE_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const RATE_LIMIT_BACKOFF_KEY = 'marketplace_rate_limit_backoff';
const RATE_LIMIT_BACKOFF_DURATION = 10 * 60 * 1000; // 10 minutes

interface CachedMarketplaceData {
  nfts: MarketplaceNFT[];
  timestamp: number;
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

  // Check if we're in rate limit backoff
  const isInRateLimitBackoff = useCallback((): boolean => {
    try {
      const backoffUntil = localStorage.getItem(RATE_LIMIT_BACKOFF_KEY);
      if (backoffUntil) {
        const backoffTime = parseInt(backoffUntil, 10);
        if (Date.now() < backoffTime) {
          console.log('⏳ Rate limit backoff active, using cached data');
          return true;
        } else {
          localStorage.removeItem(RATE_LIMIT_BACKOFF_KEY);
        }
      }
    } catch (err) {
      console.error('Error checking rate limit backoff:', err);
    }
    return false;
  }, []);

  // Set rate limit backoff
  const setRateLimitBackoff = useCallback(() => {
    try {
      const backoffUntil = Date.now() + RATE_LIMIT_BACKOFF_DURATION;
      localStorage.setItem(RATE_LIMIT_BACKOFF_KEY, backoffUntil.toString());
      console.warn('⚠️ Rate limit detected - backing off for 10 minutes');
    } catch (err) {
      console.error('Error setting rate limit backoff:', err);
    }
  }, []);

  // Cache marketplace data with improved strategy
  const cacheMarketplaceData = useCallback((nfts: MarketplaceNFT[]) => {
    // Cache in memory
    nftCollectionCache.set('marketplace', nfts, {
      isMarketplace: true,
      tags: ['marketplace', 'nft-list']
    });
    
    // Cache in localStorage for persistence
    try {
      const cacheData: CachedMarketplaceData = {
        nfts,
        timestamp: Date.now()
      };
      localStorage.setItem(MARKETPLACE_CACHE_KEY, JSON.stringify(cacheData));
      console.log('✅ Marketplace data cached successfully');
    } catch (err) {
      console.error('Error caching marketplace data:', err);
    }
  }, []);

  // Get cached marketplace data (checks both memory and localStorage)
  const getCachedMarketplaceData = useCallback((): MarketplaceNFT[] | null => {
    // First try memory cache
    const memCached = nftCollectionCache.get('marketplace');
    if (memCached && memCached.length > 0) {
      console.log('📦 Using memory cached marketplace data');
      return memCached.filter((nft): nft is MarketplaceNFT => 
        'priceInEth' in nft && 'isForSale' in nft && 'category' in nft
      );
    }
    
    // Then try localStorage
    try {
      const cached = localStorage.getItem(MARKETPLACE_CACHE_KEY);
      if (cached) {
        const data: CachedMarketplaceData = JSON.parse(cached);
        const age = Date.now() - data.timestamp;
        
        if (age < MARKETPLACE_CACHE_DURATION) {
          console.log(`📦 Using localStorage cached marketplace data (${Math.floor(age / 1000)}s old)`);
          // Restore to memory cache
          nftCollectionCache.set('marketplace', data.nfts, {
            isMarketplace: true,
            tags: ['marketplace', 'nft-list']
          });
          return data.nfts;
        } else {
          console.log('🗑️ Cache expired, will fetch fresh data');
          localStorage.removeItem(MARKETPLACE_CACHE_KEY);
        }
      }
    } catch (err) {
      console.error('Error reading cached marketplace data:', err);
    }
    
    return null;
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

    // Check if we're in rate limit backoff period
    if (isInRateLimitBackoff()) {
      const cachedData = getCachedMarketplaceData();
      if (cachedData && cachedData.length > 0) {
        setNfts(cachedData);
        setError('Using cached data due to rate limiting');
        return;
      } else {
        setError('Rate limit active and no cached data available. Please wait 10 minutes.');
        return;
      }
    }

    // Try to get cached data first
    const cachedData = getCachedMarketplaceData();
    if (cachedData && cachedData.length > 0) {
      console.log('📦 Using cached marketplace data');
      setNfts(cachedData);
      setLoading(false);
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

      console.log('🚀 Starting FAST marketplace scan (direct token check)...');
      
      // NUEVA ESTRATEGIA: Escanear tokens directamente como en /nfts
      // Esto es MUCHO más rápido que escanear eventos
      const listedNFTs: MarketplaceNFT[] = [];
      const MAX_TOKEN_ID = 100; // Escanear hasta token 100
      let rateLimitDetected = false;
      
      // Define the expected structure
      type ListedToken = [
        bigint,   // tokenId
        string,   // seller
        string,   // owner
        bigint,   // price
        boolean,  // isForSale
        bigint,   // listedTimestamp
        string    // category
      ];
      
      console.log(`🔍 Checking tokens 1-${MAX_TOKEN_ID} for active listings...`);
      
      // Procesar en lotes pequeños
      const batchSize = 5;
      const batchDelay = 300; // 300ms entre batches
      
      for (let i = 1; i <= MAX_TOKEN_ID; i += batchSize) {
        if (rateLimitDetected) {
          console.warn('⚠️ Rate limit detected, stopping scan');
          break;
        }
        
        const batch = Array.from({ length: Math.min(batchSize, MAX_TOKEN_ID - i + 1) }, (_, idx) => i + idx);
        
        const batchPromises = batch.map(async (tokenId) => {
          try {
            // Primero verificar si el token existe y está listado
            const listedToken = await contract.read.getListedToken([BigInt(tokenId)]) as ListedToken;
            
            // Solo continuar si está a la venta
            if (!listedToken[4]) {
              return null;
            }
            
            // Token está listado! Ahora obtener metadata
            let metadata: NFTMetadata | null = null;
            let tokenURI: string | null = null;
            
            try {
              tokenURI = await contract.read.tokenURI([BigInt(tokenId)]) as string;
              if (tokenURI) {
                const httpUrl = ipfsToHttp(tokenURI);
                // Timeout más corto para metadata
                const fetchedMetadata = await Promise.race([
                  fetchTokenMetadata(httpUrl),
                  new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
                ]);
                if (fetchedMetadata) {
                  metadata = fetchedMetadata;
                }
              }
            } catch {
              console.warn(`Failed to fetch metadata for token ${tokenId}`);
            }
            
            const priceInWei = listedToken[3];
            const priceInEth = Number(formatEther(priceInWei));
            
            const defaultName = metadata?.name || `NFT #${tokenId}`;
            const defaultDescription = metadata?.description || 'No description available';
            const defaultImage = metadata?.image ? ipfsToHttp(metadata.image) : DEFAULT_IMAGE;
            
            return {
              tokenId: tokenId.toString(),
              name: defaultName,
              description: defaultDescription,
              image: defaultImage,
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
            
          } catch (error) {
            // Check for rate limit
            if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
              console.error('⚠️ Rate limit detected');
              rateLimitDetected = true;
              setRateLimitBackoff();
              return null;
            }
            
            // Token doesn't exist or not listed - this is normal
            const errorMessage = error instanceof Error ? error.message : '';
            if (!errorMessage.includes('TokenDoesNotExist') && !errorMessage.includes('execution reverted')) {
              console.warn(`Error checking token ${tokenId}:`, errorMessage);
            }
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
        
        // Log progress
        if (validNFTs.length > 0) {
          console.log(`✅ Found ${validNFTs.length} listed NFTs in tokens ${i}-${i + batchSize - 1}`);
        }
        
        // Delay entre batches
        if (i + batchSize <= MAX_TOKEN_ID) {
          await new Promise(resolve => setTimeout(resolve, batchDelay));
        }
      }
      
      console.log(`🎉 Marketplace scan complete: Found ${listedNFTs.length} listed NFTs`);
      
      if (rateLimitDetected && listedNFTs.length === 0) {
        setError('Rate limit reached. Please wait a few minutes.');
        setLoading(false);
        return;
      }
      
      if (listedNFTs.length === 0) {
        console.log('ℹ️ No NFTs currently listed for sale');
        setError('No NFTs currently listed in the marketplace');
      }
      
      // Cache the results
      cacheMarketplaceData(listedNFTs);
      setNfts(listedNFTs);
      setLoading(false);
      
    } catch (err) {
      console.error('Error fetching marketplace data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch marketplace data');
      setLoading(false);
    }
  }, [publicClient, getCachedMarketplaceData, cacheMarketplaceData, isInRateLimitBackoff, setRateLimitBackoff]);

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