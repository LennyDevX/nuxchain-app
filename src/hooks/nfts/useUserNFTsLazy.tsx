import { useState, useEffect, useCallback, useRef } from 'react';
import { usePublicClient, useAccount } from 'wagmi';
import { getContract, isAddress, type Abi } from 'viem';
import MarketplaceABI from '../../abi/Marketplace.json';
import { nftCollectionCache } from '../../utils/cache/NFTCollectionCache';
import { fetchTokenMetadata, ipfsToHttp } from '../../utils/ipfs/ipfsUtils';
import { imageCache } from '../../utils/cache/ImageCache';

interface NFTData {
  tokenId: string;
  uniqueId: string;
  tokenURI: string | null;
  contract: `0x${string}`;
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  owner: string;
  creator: string;
  price: bigint;
  isForSale: boolean;
  likes: string;
  category: string;
}

interface UseUserNFTsLazyReturn {
  nfts: NFTData[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  refreshNFTs: () => void;
  loadMoreNFTs: () => Promise<void>;
  cacheStatus: string | null;
  totalCount: number;
  loadedCount: number;
}

const CONTRACT_ADDRESS = import.meta.env.VITE_MARKETPLACE_ADDRESS;
const cleanedAddress = CONTRACT_ADDRESS ? CONTRACT_ADDRESS.trim() : '';
const isValidAddress = isAddress(cleanedAddress);
const MARKETPLACE_ADDRESS = isValidAddress ? cleanedAddress : "0x58B588d29335a050732f82E6A8551d0725981518";
const DEFAULT_IMAGE = "/LogoNuvos.webp";
const BATCH_SIZE = 10; // Load 10 NFTs per batch
const INITIAL_LOAD_SIZE = 20; // Load first 20 NFTs immediately

export default function useUserNFTsLazy(userAddress?: string): UseUserNFTsLazyReturn {
  const { address: connectedAddress } = useAccount();
  const publicClient = usePublicClient();
  const address = userAddress || connectedAddress;
  
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [allTokenIds, setAllTokenIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cacheStatus, setCacheStatus] = useState<string | null>(null);
  
  const fetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);
  const loadedCountRef = useRef(0);

  // Reset state on address change
  useEffect(() => {
    if (address) {
      setNfts([]);
      setAllTokenIds([]);
      setError(null);
      setHasMore(true);
      fetchingRef.current = false;
      loadedCountRef.current = 0;
      console.log("Address changed, resetting NFT state for:", address);
    }
  }, [address]);

  // Check cache and load initial data
  const loadInitialNFTs = useCallback(async () => {
    if (!address || !publicClient || fetchingRef.current) return;

    try {
      setLoading(true);
      setError(null);
      fetchingRef.current = true;

      // Check cache first
      const cachedData = nftCollectionCache.get(`user_${address}_${MARKETPLACE_ADDRESS}`);
      if (cachedData && cachedData.length > 0) {
        console.log("Using cached user NFTs data");
        const initialBatch = cachedData.slice(0, INITIAL_LOAD_SIZE);
        setNfts(initialBatch.map(nft => ({
          tokenId: nft.tokenId,
          uniqueId: `${MARKETPLACE_ADDRESS}-${nft.tokenId}`,
          tokenURI: nft.tokenURI || null,
          contract: MARKETPLACE_ADDRESS as `0x${string}`,
          name: nft.name,
          description: nft.description,
          image: nft.image,
          attributes: nft.attributes || [],
          owner: nft.owner,
          creator: nft.creator || '', // Ensure creator is never undefined
          price: BigInt((nft.price ?? '0').toString()), // Convert to BigInt to match NFTData type, default to 0 if null
          isForSale: nft.isForSale || false, // Ensure isForSale is never undefined
          likes: nft.likes || '0',
          category: nft.category || 'Art'
        })));
        setAllTokenIds(cachedData.map((nft: any) => nft.tokenId));
        loadedCountRef.current = initialBatch.length;
        setHasMore(cachedData.length > INITIAL_LOAD_SIZE);
        setCacheStatus('cached data');
        setLoading(false);
        fetchingRef.current = false;
        
        // Preload images for visible NFTs
        const imageUrls = initialBatch
          .map((nft: any) => nft.image)
          .filter(Boolean);
        imageCache.preloadBatch(imageUrls, 3);
        
        return;
      }

      // Fetch from blockchain
      const contract = getContract({
        address: MARKETPLACE_ADDRESS as `0x${string}`,
        abi: MarketplaceABI.abi as Abi,
        client: publicClient,
      });

      // Get all token IDs for this user by iterating until we find no more tokens
      const allUserTokenIds: string[] = [];
      let tokenId = 1;
      let consecutiveNotFound = 0;
      const maxConsecutiveNotFound = 10; // Stop after 10 consecutive tokens not found
      
      while (consecutiveNotFound < maxConsecutiveNotFound) {
        try {
          const owner = await contract.read.ownerOf([BigInt(tokenId)]) as string;
          if (owner.toLowerCase() === address.toLowerCase()) {
            allUserTokenIds.push(tokenId.toString());
          }
          consecutiveNotFound = 0; // Reset counter if token exists
        } catch (err) {
          // Token might not exist or be burned
          consecutiveNotFound++;
        }
        tokenId++;
      }

      setAllTokenIds(allUserTokenIds);
      
      if (allUserTokenIds.length === 0) {
        setNfts([]);
        setHasMore(false);
        setLoading(false);
        fetchingRef.current = false;
        return;
      }

      // Load initial batch
      const initialTokenIds = allUserTokenIds.slice(0, INITIAL_LOAD_SIZE);
      const initialNFTs = await loadNFTBatch(contract, initialTokenIds);
      
      setNfts(initialNFTs);
      loadedCountRef.current = initialNFTs.length;
      setHasMore(allUserTokenIds.length > INITIAL_LOAD_SIZE);
      setCacheStatus('fresh data');
      
      // Cache all NFTs for future use
      const allNFTs = await loadNFTBatch(contract, allUserTokenIds);
      nftCollectionCache.set(`user_${address}_${MARKETPLACE_ADDRESS}`, allNFTs.map(nft => ({
        ...nft,
        price: nft.price.toString(), // Convert BigInt price to string
        priceInEth: 0, // Default value since not available
        seller: nft.owner, // Use owner as seller
        listedTimestamp: Date.now(), // Current timestamp as default
      })));
      
      // Preload images for visible NFTs
      const imageUrls = initialNFTs
        .map(nft => nft.image)
        .filter(Boolean);
      imageCache.preloadBatch(imageUrls, 3);
      
    } catch (err: any) {
      console.error("Error loading initial NFTs:", err);
      setError("Error loading NFTs");
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [address, publicClient]);

  // Load more NFTs (lazy loading)
  const loadMoreNFTs = useCallback(async () => {
    if (!hasMore || loadingMore || !allTokenIds.length) return;

    try {
      setLoadingMore(true);
      
      // Check if we have cached data
      const cachedData = nftCollectionCache.get(`user_${address}_${MARKETPLACE_ADDRESS}`);
      if (cachedData && cachedData.length > loadedCountRef.current) {
        const nextBatch = cachedData.slice(
          loadedCountRef.current, 
          loadedCountRef.current + BATCH_SIZE
        );
        
        setNfts(prev => [...prev, ...nextBatch.map(nft => ({
          tokenId: nft.tokenId,
          uniqueId: `${MARKETPLACE_ADDRESS}-${nft.tokenId}`,
          tokenURI: nft.tokenURI || null,
          contract: MARKETPLACE_ADDRESS as `0x${string}`,
          name: nft.name,
          description: nft.description,
          image: nft.image,
          attributes: nft.attributes || [],
          owner: nft.owner,
          creator: nft.creator || '',
          price: BigInt((nft.price ?? '0').toString()),
          isForSale: nft.isForSale || false,
          likes: nft.likes || '0',
          category: nft.category || 'Art'
        }))]);
        loadedCountRef.current += nextBatch.length;
        setHasMore(loadedCountRef.current < cachedData.length);
        
        // Preload images for new batch
        const imageUrls = nextBatch
          .map((nft: any) => nft.image)
          .filter(Boolean);
        imageCache.preloadBatch(imageUrls, 3);
        
        setLoadingMore(false);
        return;
      }

      // If no cache, we shouldn't reach here as initial load should cache everything
      setHasMore(false);
      
    } catch (err) {
      console.error("Error loading more NFTs:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, allTokenIds, address]);

  // Helper function to load a batch of NFTs
  const loadNFTBatch = async (contract: any, tokenIds: string[]): Promise<NFTData[]> => {
    const results: NFTData[] = [];
    
    for (const tokenId of tokenIds) {
      try {
        const [tokenURI, owner, listedTokenData] = await Promise.all([
          contract.read.tokenURI([BigInt(tokenId)]) as Promise<string>,
          contract.read.ownerOf([BigInt(tokenId)]) as Promise<string>,
          contract.read.getListedToken([BigInt(tokenId)]) as Promise<[bigint, string, string, bigint, boolean, bigint, string]>,
        ]);
        
        // Use owner as creator since getCreator function doesn't exist in ABI
        const creator = owner;
        
        // Extract price and isForSale from getListedToken response
         // getListedToken returns: [tokenId, seller, owner, price, isForSale, likes, category]
         const price = listedTokenData[3];
         const isForSale = listedTokenData[4];
         const likes = listedTokenData[5].toString();
         const category = listedTokenData[6];

        let metadata: { name: string; description: string; image: string; attributes: Array<{trait_type: string; value: string}> } = { name: '', description: '', image: '', attributes: [] };
        if (tokenURI) {
          try {
            const fetchedMetadata = await fetchTokenMetadata(tokenURI);
            if (fetchedMetadata) {
              metadata = {
                name: fetchedMetadata.name || '',
                description: fetchedMetadata.description || '',
                image: fetchedMetadata.image || '',
                attributes: Array.isArray(fetchedMetadata.attributes) ? (fetchedMetadata.attributes as Array<{trait_type: string; value: string | number}>).map(attr => ({
                  trait_type: String(attr.trait_type || ''),
                  value: String(attr.value || '')
                })) : []
              };
            }
          } catch (metaErr) {
            console.warn(`Failed to fetch metadata for token ${tokenId}:`, metaErr);
          }
        }

        const processedImage = metadata.image ? ipfsToHttp(metadata.image) : DEFAULT_IMAGE;

        results.push({
          tokenId,
          uniqueId: `${MARKETPLACE_ADDRESS}-${tokenId}`,
          tokenURI,
          contract: MARKETPLACE_ADDRESS as `0x${string}`,
          name: metadata.name || `NFT #${tokenId}`,
          description: metadata.description || '',
          image: processedImage,
          attributes: metadata.attributes || [],
          owner,
          creator,
          price,
          isForSale,
          likes,
          category
        });
      } catch (err) {
        console.error(`Error loading NFT ${tokenId}:`, err);
      }
    }
    
    return results;
  };

  // Refresh function
  const refreshNFTs = useCallback(() => {
    const now = Date.now();
    if (now - lastFetchTimeRef.current > 1000) {
      nftCollectionCache.delete(`user_${address}_${MARKETPLACE_ADDRESS}`);
      setCacheStatus(null);
      setNfts([]);
      setAllTokenIds([]);
      setHasMore(true);
      fetchingRef.current = false;
      loadedCountRef.current = 0;
      lastFetchTimeRef.current = now;
      console.log("Cache cleared, forcing NFT refresh");
    }
  }, [address]);

  // Load initial NFTs on mount
  useEffect(() => {
    if (address && publicClient) {
      loadInitialNFTs();
    }
  }, [address, publicClient, loadInitialNFTs]);

  return { 
    nfts, 
    loading, 
    loadingMore,
    error, 
    hasMore,
    refreshNFTs, 
    loadMoreNFTs,
    cacheStatus,
    totalCount: allTokenIds.length,
    loadedCount: loadedCountRef.current
  };
}