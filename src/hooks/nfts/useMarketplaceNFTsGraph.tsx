import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { useCallback, useEffect, useState } from 'react';
import { apolloClient } from '../../lib/apollo-client';
import { gql } from '@apollo/client';
import { nftLogger } from '../../utils/log/nftLogger';
import { createPublicClient, http } from 'viem';
import { polygon } from 'viem/chains';
import { contractReadQueue } from '../../utils/queue/RequestQueue';
import { fetchTokenMetadata } from '../../utils/ipfs/ipfsUtils';

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

// ✅ Query del subgraph - Activities with NFT_MINT type (para usuario específico)
const QUERY_USER_NFTS = gql`
  query QueryUserNFTs(
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

// ✅ Query simple sin filtro de usuario (fallback si QUERY_USER_NFTS falla)
const QUERY_ALL_NFTS = gql`
  query QueryAllNFTs(
    $first: Int!
    $skip: Int!
  ) {
    activities(
      where: { type: "NFT_MINT" }
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
const QUERY_NFTs_FOR_SALE = gql`
  query QueryNFTsForSale(
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
const QUERY_USER_NFTs_FOR_SALE = gql`
  query QueryUserNFTsForSale(
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

// NOTE: QUERY_USER_NFTs_BOUGHT not currently used, kept for reference
// const QUERY_USER_NFTs_BOUGHT = gql`
//   query QueryUserNFTsBought(
//     $user: Bytes!
//     $first: Int!
//     $skip: Int!
//   ) {
//     activities(
//       where: { buyer: $user, type: "NFT_SALE" }
//       first: $first
//       skip: $skip
//       orderBy: timestamp
//       orderDirection: desc
//     ) {
//       id
//       tokenId
//       timestamp
//       transactionHash
//       blockNumber
//       buyer
//       category
//       amount
//     }
//   }
// `;

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

// 📝 ABI para isListed - Returns whether NFT is listed (bool)
const IS_LISTED_ABI = [{
  inputs: [{ name: '', type: 'uint256' }],
  name: 'isListed',
  outputs: [{ name: '', type: 'bool' }],
  stateMutability: 'view',
  type: 'function'
}] as const;

// 📝 ABI para listedPrice - Returns price of NFT (0 if not listed)
const LISTED_PRICE_ABI = [{
  inputs: [{ name: '', type: 'uint256' }],
  name: 'listedPrice',
  outputs: [{ name: '', type: 'uint256' }],
  stateMutability: 'view',
  type: 'function'
}] as const;

// 📝 ABI para ownerOf - Returns current owner of the NFT
const OWNER_OF_ABI = [{
  inputs: [{ name: 'tokenId', type: 'uint256' }],
  name: 'ownerOf',
  outputs: [{ name: '', type: 'address' }],
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
  const queryClient = useQueryClient();
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
    staleTime: 30 * 60 * 1000, // ⚡ INCREASED from 5min to 30min - avoid excessive refetches
    gcTime: 60 * 60 * 1000, // 1 hour cache
    refetchOnWindowFocus: false, 
    refetchOnMount: false,
    retry: 1, // ⚡ REDUCED from 2 to 1 - fail faster on rate limits
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // ⚡ Exponential backoff: 1s, 2s, 4s...
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
          // Show user's NFTs - Query NFT_MINT, NFT_LIST to get user's created/listed NFTs
          // ⚠️ NOTE: QUERY_USER_NFTs_BOUGHT is NOT reliable because subgraph doesn't save buyer field
          // We'll use on-chain ownerOf verification later to include purchased NFTs
          
          try {
            // Query 1: User's created NFTs
            let mintResult;
            try {
              mintResult = await apolloClient.query({
                query: QUERY_USER_NFTS,
                variables: {
                  user: address.toLowerCase(),
                  first: limit,
                  skip: skip
                },
                fetchPolicy: 'cache-first'
              });
            } catch (fallbackError) {
              console.warn('⚠️ QUERY_USER_NFTS failed, trying simple query...', fallbackError);
              // Fallback to simple query without user filter
              mintResult = await apolloClient.query({
                query: QUERY_ALL_NFTS,
                variables: {
                  first: limit,
                  skip: skip
                },
                fetchPolicy: 'cache-first'
              });
            }
            
            const allMintActivities = mintResult.data?.activities || [];
            
            // Filter by user if needed (especially when using simple query as fallback)
            const mintActivities = allMintActivities.filter((activity: { user?: string }) => 
              activity.user?.toLowerCase() === address.toLowerCase()
            );
            
            // Query 2: User's listed NFTs
            const saleResult = await apolloClient.query({
              query: QUERY_USER_NFTs_FOR_SALE,
              variables: {
                user: address.toLowerCase(),
                first: limit,
                skip: skip
              },
              fetchPolicy: 'cache-first'
            });
            
            const saleActivities = saleResult.data?.activities || [];
            
            // Query 3: Check ALL NFTs to find purchased ones (via on-chain ownerOf)
            // ✅ Only check on the first page to minimize rate limits
            let purchasedActivities = [];
            if (skip === 0) {
              const allNFTsResult = await apolloClient.query({
                query: QUERY_ALL_NFTS,
                variables: {
                  first: 10, // ⚡ REDUCED from 50 to 10 to avoid 429 rate limits
                  skip: 0
                },
                fetchPolicy: 'cache-first'
              });
              
              const allNFTs = allNFTsResult.data?.activities || [];
              console.log(`🔍 Checking ownership of ${allNFTs.length} NFTs to find purchases...`);
              
              // ⚡ OPTIMIZED: Batch check ownership with delay to avoid RPC rate limits
              for (let i = 0; i < allNFTs.length; i++) {
                const nft = allNFTs[i];
                try {
                  const PROXY_ADDRESS = import.meta.env.VITE_GAMEIFIED_MARKETPLACE_PROXY as `0x${string}`;
                  const currentOwner = await publicClient.readContract({
                    address: PROXY_ADDRESS,
                    abi: OWNER_OF_ABI,
                    functionName: 'ownerOf',
                    args: [BigInt(nft.tokenId)]
                  });
                  
                  // If current user owns this NFT but didn't create it, it's a purchased NFT
                  if (currentOwner.toLowerCase() === address.toLowerCase() && 
                      nft.user?.toLowerCase() !== address.toLowerCase()) {
                    purchasedActivities.push(nft);
                  }
                  
                  // ⚡ Add delay every 3 RPC calls to avoid rate limiting
                  if ((i + 1) % 3 === 0 && i < allNFTs.length - 1) {
                    await new Promise(r => setTimeout(r, 500)); // 500ms delay every 3 calls
                  }
                } catch {
                  // Skip NFTs that cause errors
                }
              }
              console.log(`✅ Found ${purchasedActivities.length} purchased NFTs via ownerOf verification`);
            }
            
            // Combine all three queries - deduplicate by tokenId
            const tokenIdSet = new Set<string>();
            nftSource = [];
            
            // Add mints first (created NFTs)
            for (const activity of mintActivities) {
              tokenIdSet.add(activity.tokenId);
              nftSource.push(activity);
            }
            
            // Add sales (NFTs listed by user)
            for (const activity of saleActivities) {
              if (!tokenIdSet.has(activity.tokenId)) {
                nftSource.push(activity);
                tokenIdSet.add(activity.tokenId);
              }
            }
            
            // Add bought NFTs (NFTs purchased by user)
            for (const activity of purchasedActivities) {
              if (!tokenIdSet.has(activity.tokenId)) {
                nftSource.push(activity);
                tokenIdSet.add(activity.tokenId);
              }
            }
            
            console.log(`✅ Total user NFTs combined: ${nftSource.length} (created: ${mintActivities.length}, listed: ${saleActivities.length}, purchased: ${purchasedActivities.length})`);
            
          } catch (userQueryError) {
            console.error('❌ User NFTs query FAILED:', {
              message: userQueryError instanceof Error ? userQueryError.message : String(userQueryError),
              fullError: userQueryError
            });
            throw userQueryError;
          }
          
        } else if (isForSale) {
          // Show only NFTs that are listed for sale (NFT_LIST activities)
          
          try {
            const result = await apolloClient.query({
              query: QUERY_NFTs_FOR_SALE,
              variables: {
                first: limit,
                skip: skip
              },
              fetchPolicy: 'cache-first'
            });
            nftSource = result.data?.activities || [];
          } catch (activitiesError) {
            console.error('❌ FOR_SALE query FAILED:', {
              message: activitiesError instanceof Error ? activitiesError.message : String(activitiesError),
              fullError: activitiesError
            });
            throw activitiesError;
          }
          
        } else {
          // Show all NFTs (all NFT_MINT activities)
          
          try {
            const result = await apolloClient.query({
              query: QUERY_ALL_NFTS,
              variables: {
                first: limit,
                skip: skip
              },
              fetchPolicy: 'cache-first'
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
        
        // 🔍 No additional filtering needed - Activities already filters by type and optionally by user

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
        // Sequential processing using request queue to prevent Pinata 429 rate limiting
        const itemsPromises: Array<Promise<NFTData>> = [];
        
        for (const item of nftSource) {
          const promise = contractReadQueue.add(async () => {
            const creatorId = item.user;
            const PROXY_ADDRESS = import.meta.env.VITE_GAMEIFIED_MARKETPLACE_PROXY as `0x${string}`;
            
            // 🔍 DEBUG: Log Activities item (only in development)
            if (process.env.NODE_ENV === 'development') {
              console.debug(`🔍 Token #${item.tokenId}:`, { amount: item.amount });
            }
          
            // ✅ CRITICAL: Always read price from contract for accurate listing status
            // Don't rely on subgraph amount which may have indexing delay
            let nftPrice = 0n;
            try {
              nftPrice = await publicClient.readContract({
                address: PROXY_ADDRESS,
                abi: LISTED_PRICE_ABI,
                functionName: 'listedPrice',
                args: [BigInt(item.tokenId)]
              });
              
              if (process.env.NODE_ENV === 'development') {
                console.debug(`💰 Token #${item.tokenId} price from contract:`, nftPrice.toString(), `(${Number(nftPrice) / 1e18} POL)`);
              }
            } catch (err) {
              console.warn(`⚠️ Could not fetch price for token ${item.tokenId}:`, err);
              // Fallback to subgraph amount if contract read fails
              if (item.amount) {
                try {
                  nftPrice = BigInt(item.amount);
                } catch {
                  nftPrice = 0n;
                }
              }
            }
            
            // 🖼️ Fetch metadata from tokenURI if available
          let metadata = {
            name: `NFT #${item.tokenId}`,
            description: item.category ? `${item.category} NFT` : 'Digital Collectible',
            image: `https://api.dicebear.com/7.x/shapes/svg?seed=${item.tokenId}`, // Placeholder image
            attributes: [] as NFTAttribute[]
          };

            // ✅ ALWAYS fetch tokenURI from contract (Activities doesn't have it)
            let tokenURI: string | null = null;
            try {
              if (process.env.NODE_ENV === 'development') {
                console.debug(`🔗 Fetching tokenURI for token ${item.tokenId}...`);
              }
              const PROXY_ADDRESS = import.meta.env.VITE_GAMEIFIED_MARKETPLACE_PROXY as `0x${string}`;
              const uri = await publicClient.readContract({
                address: PROXY_ADDRESS,
                abi: TOKEN_URI_ABI,
                functionName: 'tokenURI',
                args: [BigInt(item.tokenId)]
              });
              if (uri && uri !== '0x' && uri.length > 0) {
                tokenURI = uri;
                if (process.env.NODE_ENV === 'development') {
                  console.debug(`📝 ✅ Fetched tokenURI for token ${item.tokenId}`);
                }
              }
            } catch (err) {
              const errorMsg = err instanceof Error ? err.message : String(err);
              console.warn(`⚠️ Could not fetch tokenURI for token ${item.tokenId}: ${errorMsg}`);
            }

            // Load real metadata if tokenURI available - USE CACHED FUNCTION
            if (tokenURI && tokenURI.length > 0) {
              try {
                const cachedMetadata = await fetchTokenMetadata(tokenURI);
                if (cachedMetadata) {
                  metadata = {
                    name: cachedMetadata.name || metadata.name,
                    description: cachedMetadata.description || metadata.description,
                    image: cachedMetadata.image ? cachedMetadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/') : metadata.image,
                    attributes: cachedMetadata.attributes || []
                  };
                  if (process.env.NODE_ENV === 'development') {
                    console.debug(`✅ Loaded metadata for NFT #${item.tokenId}`);
                  }
                }
              } catch (err) {
                const errorMsg = err instanceof Error ? err.message : String(err);
                console.warn(`⚠️ Metadata fetch failed for token ${item.tokenId}: ${errorMsg}`);
              }
            }

            // ✅ CRITICAL: Verify current owner when userOnly=true
            // This allows us to detect if the NFT was sold (owner !== creator)
            let currentOwner = creatorId;
            if (userOnly && address) {
              try {
                const PROXY_ADDRESS = import.meta.env.VITE_GAMEIFIED_MARKETPLACE_PROXY as `0x${string}`;
                currentOwner = await publicClient.readContract({
                  address: PROXY_ADDRESS,
                  abi: OWNER_OF_ABI,
                  functionName: 'ownerOf',
                  args: [BigInt(item.tokenId)]
                });
                
                if (process.env.NODE_ENV === 'development') {
                  const wasSold = currentOwner.toLowerCase() !== creatorId.toLowerCase();
                  console.debug(`NFT #${item.tokenId} - Creator: ${creatorId.slice(0, 10)}..., Owner: ${currentOwner.slice(0, 10)}... ${wasSold ? '(SOLD)' : '(OWNED)'}`);
                }
              } catch {
                console.warn(`⚠️ Could not fetch owner for token ${item.tokenId}`);
              }
            }

            return {
            tokenId: item.tokenId.toString(),
            uniqueId: `nft-activity-${item.id}`,
            tokenURI: tokenURI || null,
            contract: import.meta.env.VITE_GAMEIFIED_MARKETPLACE_PROXY as `0x${string}`,
            name: metadata.name,
            description: metadata.description,
            image: metadata.image,
            attributes: metadata.attributes,
            owner: currentOwner, // ✅ Actual owner from contract
            creator: creatorId, // ✅ Original creator from subgraph
            price: nftPrice,
            isForSale: nftPrice > 0n,
            likes: '0',
            category: item.category || 'coleccionables'
          } satisfies NFTData;
          });
          
          itemsPromises.push(promise);
        }

        // Process sequentially using request queue to prevent rate limiting
        const items: NFTData[] = [];
        for (const itemsPromise of itemsPromises) {
          const item = await itemsPromise;
          items.push(item);
        }
        
        // ✅ DEDUPLICATE by tokenId - CRITICAL: Keep ONLY the most recent listing event
        // If same NFT was listed multiple times, keep the latest one (highest timestamp)
        const uniqueNFTs = new Map<string, { nft: NFTData; timestamp: number }>();
        for (const item of items) {
          // Get timestamp from subgraph event (Activities query includes timestamp)
          const timestamp = nftSource.find((s: { tokenId: string }) => s.tokenId === item.tokenId)?.timestamp || 0;
          const existing = uniqueNFTs.get(item.tokenId);
          
          if (!existing || timestamp > existing.timestamp) {
            // Keep the most recent event (latest timestamp)
            uniqueNFTs.set(item.tokenId, { nft: item, timestamp });
          }
        }
        const deduplicatedItems = Array.from(uniqueNFTs.values()).map(entry => entry.nft);
        
        if (items.length !== deduplicatedItems.length) {
          console.log(`🔄 [Deduplication] Removed ${items.length - deduplicatedItems.length} duplicate NFTs (kept most recent listing)`);
        }
        
        // ✅ CRITICAL FIX: Always verify contract state for accurate isForSale and price
        // For marketplace (isForSale=true): Filter out NFTs not for sale
        // For collection (userOnly=true): Update isForSale and price from on-chain data
        let filteredItems = deduplicatedItems;
        
        if (isForSale) {
          // Marketplace view: Only show NFTs that are actually for sale
          console.log(`🔍 [Marketplace] Verifying ${items.length} NFTs are actually for sale on-chain...`);
          
          const verifiedItems: NFTData[] = [];
          for (const nft of items) {
            try {
              const PROXY_ADDRESS = import.meta.env.VITE_GAMEIFIED_MARKETPLACE_PROXY as `0x${string}`;
              
              // ✅ CRITICAL: First verify current owner
              const currentOwner = await publicClient.readContract({
                address: PROXY_ADDRESS,
                abi: OWNER_OF_ABI,
                functionName: 'ownerOf',
                args: [BigInt(nft.tokenId)]
              }) as string;
              
              // ✅ IMPORTANT: Only show NFT if current owner matches the creator/seller from subgraph
              // This prevents showing NFTs that were sold to someone else
              if (currentOwner.toLowerCase() !== nft.owner.toLowerCase()) {
                console.debug(`❌ NFT #${nft.tokenId} owner changed (old: ${nft.owner}, current: ${currentOwner}) - was sold, skipping`);
                continue;
              }
              
              // Read isListed status
              const isListedOnChain = await publicClient.readContract({
                address: PROXY_ADDRESS,
                abi: IS_LISTED_ABI,
                functionName: 'isListed',
                args: [BigInt(nft.tokenId)]
              }) as boolean;
              
              if (!isListedOnChain) {
                // NFT is NOT currently for sale - skip it
                console.debug(`❌ NFT #${nft.tokenId} is NOT for sale on-chain (was likely purchased or unlisted)`);
                continue;
              }
              
              // Read the listing price on-chain
              const priceOnChain = await publicClient.readContract({
                address: PROXY_ADDRESS,
                abi: LISTED_PRICE_ABI,
                functionName: 'listedPrice',
                args: [BigInt(nft.tokenId)]
              }) as bigint;
              
              if (priceOnChain > 0n) {
                // Update price and owner from on-chain values to be accurate
                nft.price = priceOnChain;
                nft.isForSale = true;
                nft.owner = currentOwner; // Update to current owner
                verifiedItems.push(nft);
                
                console.debug(`✅ NFT #${nft.tokenId} verified FOR SALE on-chain by ${currentOwner.slice(0, 6)}... at ${Number(priceOnChain) / 1e18} POL`);
              } else {
                // Price is 0 - skip it
                console.debug(`❌ NFT #${nft.tokenId} has 0 price on-chain - skipping`);
              }
            } catch (err) {
              const errorMsg = err instanceof Error ? err.message : String(err);
              console.warn(`⚠️ Could not verify NFT #${nft.tokenId} on-chain: ${errorMsg}. Skipping it.`);
              // Skip if we can't verify (better than showing stale data)
            }
          }
          
          console.log(`✅ [Marketplace] Verified: ${verifiedItems.length}/${deduplicatedItems.length} NFTs are actually for sale`);
          console.log(`📊 [Marketplace] Listed NFTs:`, verifiedItems.map(nft => ({
            tokenId: nft.tokenId,
            price: `${Number(nft.price) / 1e18} POL`,
            isForSale: nft.isForSale
          })));
          filteredItems = verifiedItems;
          
        } else if (userOnly) {
          // Collection view: Update all NFTs with on-chain isForSale and price data
          console.log(`🔍 [Collection] Updating ${deduplicatedItems.length} NFTs with on-chain listing status...`);
          console.log(`📊 [Collection] Before on-chain verification:`, deduplicatedItems.map(nft => ({
            tokenId: nft.tokenId,
            price: nft.price.toString(),
            isForSale: nft.isForSale,
            creator: nft.creator
          })));
          
          // ✅ FILTER: Only keep NFTs that user currently owns
          const ownedNFTs: NFTData[] = [];
          
          for (const nft of deduplicatedItems) {
            try {
              const PROXY_ADDRESS = import.meta.env.VITE_GAMEIFIED_MARKETPLACE_PROXY as `0x${string}`;
              
              // ✅ CRITICAL: First check current owner to detect if NFT was sold
              const currentOwner = await publicClient.readContract({
                address: PROXY_ADDRESS,
                abi: OWNER_OF_ABI,
                functionName: 'ownerOf',
                args: [BigInt(nft.tokenId)]
              }) as string;
              
              // ✅ IMPORTANT: Only include NFTs that the connected user currently owns
              // Check against address (connected wallet), not creator
              if (!address || currentOwner.toLowerCase() !== address.toLowerCase()) {
                console.log(`❌ NFT #${nft.tokenId} NOT owned by user anymore (current owner: ${currentOwner.slice(0, 6)}) - FILTERING OUT`);
                continue; // Skip this NFT - user doesn't own it anymore
              }
              
              console.log(`✅ NFT #${nft.tokenId} is owned by user ${address.slice(0, 6)}`);
              
              // Read isListed status
              const isListedOnChain = await publicClient.readContract({
                address: PROXY_ADDRESS,
                abi: IS_LISTED_ABI,
                functionName: 'isListed',
                args: [BigInt(nft.tokenId)]
              }) as boolean;
              
              // Read the listing price on-chain
              const priceOnChain = await publicClient.readContract({
                address: PROXY_ADDRESS,
                abi: LISTED_PRICE_ABI,
                functionName: 'listedPrice',
                args: [BigInt(nft.tokenId)]
              }) as bigint;
              
              console.log(`🔍 NFT #${nft.tokenId} - On-chain data: owner=${currentOwner.slice(0, 6)}, isListed=${isListedOnChain}, price=${priceOnChain.toString()} wei`);
              
              // Update with on-chain data
              nft.isForSale = isListedOnChain && priceOnChain > 0n;
              nft.price = priceOnChain > 0n ? priceOnChain : 0n;
              nft.owner = currentOwner;
              
              // Add to owned NFTs list
              ownedNFTs.push(nft);
              
              console.log(`✅ NFT #${nft.tokenId} added to collection: isForSale=${nft.isForSale}, price=${(Number(nft.price) / 1e18).toFixed(4)} POL`);
              
              const status = nft.isForSale ? `LISTED at ${(Number(nft.price) / 1e18).toFixed(4)} POL` : 'UNLISTED';
              console.debug(`✅ NFT #${nft.tokenId} final status: ${status}`);
            } catch (err) {
              const errorMsg = err instanceof Error ? err.message : String(err);
              console.warn(`⚠️ Could not verify NFT #${nft.tokenId} on-chain: ${errorMsg}. Skipping it.`);
              // Skip NFTs that cause errors
            }
          }
          
          console.log(`📊 [Collection] After filtering: ${ownedNFTs.length}/${deduplicatedItems.length} NFTs owned by user`);
          console.log(`📊 [Collection] Final NFTs:`, ownedNFTs.map(nft => ({
            tokenId: nft.tokenId,
            price: `${Number(nft.price) / 1e18} POL`,
            isForSale: nft.isForSale,
            owner: nft.owner.slice(0, 8) + '...',
            creator: nft.creator.slice(0, 8) + '...'
          })));
          filteredItems = ownedNFTs;
        }
        
        // 🐛 Debug: Log final items with images (development only)
        if (process.env.NODE_ENV === 'development' && filteredItems.length > 0) {
          console.debug(`✅ Loaded ${filteredItems.length} NFT items with metadata`);
        }

        nftLogger.logFetchResult({
          hook: 'useMarketplaceNFTsGraph',
          valid: filteredItems.length,
          total: limit,
          category,
          isForSale,
          userOnly
        });

        const hasMore = filteredItems.length === limit;
        const nextCursor = hasMore ? skip + limit : null;

        return {
          items: filteredItems,
          nextCursor: nextCursor ? nextCursor.toString() : null,
          hasMore,
          total: filteredItems.length
        };
      } catch (error) {
        // ✅ Handle 429 Specifically
        const isRateLimit = error instanceof Error && error.message.includes('429');
        if (isRateLimit) {
          console.warn('⚠️ [useMarketplaceNFTsGraph] Rate limited (429) by The Graph. Adding delay before retry...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        console.error('❌ Error fetching NFTs from subgraph:', error);
        throw error;
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore || !lastPage.nextCursor) return undefined;
      return parseInt(lastPage.nextCursor, 10);
    },
    enabled: enabled && (!userOnly || !!address)
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
      // Removed manual refetch to avoid 429 loops
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
  // 📱 CROSS-TAB SYNC + SAME-TAB SYNC
  // ========================================
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'marketplace_nfts_invalidate') {
        console.log('🔄 [useMarketplaceNFTsGraph] Storage event received, invalidating cache and refetching...');
        // Cancel ongoing queries and invalidate cache
        queryClient.cancelQueries({ queryKey: ['marketplace-nfts-graph'] }).then(() => {
          query.refetch().catch(() => {
            // Silent fail
          });
        }).catch(() => {
          // Silent fail
        });
      }
    };

    const handleCustomRefresh = () => {
      console.log('🔄 [useMarketplaceNFTsGraph] Received custom refresh event, invalidating cache and refetching...');
      // Cancel ongoing queries and invalidate cache
      queryClient.cancelQueries({ queryKey: ['marketplace-nfts-graph'] }).then(() => {
        query.refetch().catch(() => {
          // Silent fail
        });
      }).catch(() => {
        // Silent fail
      });
    };

    // Cross-tab sync (fires in other tabs)
    window.addEventListener('storage', handleStorageChange);
    // Same-tab sync (fires in current tab)
    window.addEventListener('nft-listing-changed', handleCustomRefresh);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('nft-listing-changed', handleCustomRefresh);
    };
  }, [query, queryClient]);

  const refreshWithSync = useCallback(async () => {
    console.log('🔄 [useMarketplaceNFTsGraph] Starting refresh with sync...');
    // Cancel ongoing queries and invalidate cache to force fresh fetch
    await queryClient.cancelQueries({ queryKey: ['marketplace-nfts-graph'] });
    console.log('✅ [useMarketplaceNFTsGraph] Query cache invalidated');
    await refresh();
    console.log('✅ [useMarketplaceNFTsGraph] Query refetched with fresh data');
    localStorage.setItem('marketplace_nfts_invalidate', Date.now().toString());
    console.log('✅ [useMarketplaceNFTsGraph] LocalStorage sync event sent');
    // Dispatch custom event for same-tab sync
    window.dispatchEvent(new CustomEvent('nft-listing-changed'));
    console.log('✅ [useMarketplaceNFTsGraph] Custom event dispatched');
  }, [refresh, queryClient]);

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
