/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { parseAbiItem, formatEther } from 'viem';

const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS as `0x${string}`;
const MARKETPLACE_CONTRACT_ADDRESS = import.meta.env.VITE_GAMEIFIED_MARKETPLACE_ADDRESS as `0x${string}`;

// Tipos de actividad
export type ActivityType = 
  | 'STAKING_DEPOSIT'
  | 'STAKING_WITHDRAW'
  | 'STAKING_COMPOUND'
  | 'NFT_MINT'
  | 'NFT_LIST'
  | 'NFT_PURCHASE'
  | 'NFT_SALE'
  | 'NFT_UNLIST'
  | 'OFFER_MADE'
  | 'OFFER_ACCEPTED'
  | 'OFFER_REJECTED'
  | 'SKILL_PURCHASED';

export interface Activity {
  id: string;
  type: ActivityType;
  timestamp: number;
  txHash: string;
  details: {
    amount?: string;
    tokenId?: string;
    price?: string;
    lockupDuration?: number;
    category?: string;
    buyer?: string;
    seller?: string;
    offerId?: string;
  };
  description: string;
  icon: string;
  color: string;
}

interface UseRecentActivitiesReturn {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
  refreshActivities: () => Promise<void>;
}

/**
 * Hook para obtener actividades recientes del usuario
 * Incluye eventos de staking, NFTs, marketplace, etc.
 */
export function useRecentActivities(maxActivities: number = 20): UseRecentActivitiesReturn {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para convertir duración de segundos a texto legible
  const formatLockupDuration = (seconds: number): string => {
    const days = Math.floor(seconds / (24 * 3600));
    if (days === 0) return 'Flexible';
    if (days === 30) return '30 Days';
    if (days === 90) return '90 Days';
    if (days === 180) return '180 Days';
    if (days === 365) return '365 Days';
    return `${days} Days`;
  };

  // Función para obtener eventos de staking
  const getStakingEvents = useCallback(async (): Promise<Activity[]> => {
    if (!publicClient || !address || !STAKING_CONTRACT_ADDRESS) return [];

    try {
      console.log('🔍 [Staking] Starting fetch...');
      console.log('📍 Contract:', STAKING_CONTRACT_ADDRESS);
      console.log('👤 User:', address);
      
      const currentBlock = await publicClient.getBlockNumber();
      console.log('📦 Current block:', currentBlock.toString());
      
      // Alchemy Free Tier: 500 CU/s limit (5000 CU per 10-second window)
      // eth_getLogs ≈ 75 CU per request
      // Safe rate: ~2.5 requests/second = 187 CU/s (very conservative)
      const BLOCKS_TO_FETCH = 50000;  // ~28 hours on Polygon (to capture deposit at block 77171365)
      const CHUNK_SIZE = 10;
      const DELAY_BETWEEN_CHUNKS = 400; // 400ms = 2.5 req/s (safer for large ranges)
      const fromBlock = currentBlock - BigInt(BLOCKS_TO_FETCH);
      
      console.log('📊 Block range:', fromBlock.toString(), 'to', currentBlock.toString());
      console.log('📏 Total blocks:', BLOCKS_TO_FETCH);

      // Helper to add delay between requests
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      // Exponential backoff retry logic
      const fetchWithRetry = async (fetchFn: () => Promise<any>, maxRetries = 3): Promise<any> => {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            return await fetchFn();
          } catch (err: any) {
            // If 429 error, use exponential backoff
            if (err?.status === 429 && attempt < maxRetries - 1) {
              const backoffTime = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 8000);
              console.warn(`Rate limited (429), retrying in ${backoffTime}ms... (attempt ${attempt + 1}/${maxRetries})`);
              await delay(backoffTime);
              continue;
            }
            throw err;
          }
        }
      };

      // Helper to fetch logs in small chunks with rate limiting
      const fetchLogsInChunks = async (eventConfig: any) => {
        const allLogs: any[] = [];
        
        for (let offset = 0; offset < BLOCKS_TO_FETCH; offset += CHUNK_SIZE) {
          const chunkFrom = fromBlock + BigInt(offset);
          const chunkTo = fromBlock + BigInt(Math.min(offset + CHUNK_SIZE - 1, BLOCKS_TO_FETCH - 1));
          
          try {
            const logs = await fetchWithRetry(() => publicClient.getLogs({
              ...eventConfig,
              fromBlock: chunkFrom,
              toBlock: chunkTo,
            }));
            allLogs.push(...logs);
            
            // Add delay between chunks to respect CU/s limit
            if (offset + CHUNK_SIZE < BLOCKS_TO_FETCH) {
              await delay(DELAY_BETWEEN_CHUNKS);
            }
          } catch (err) {
            console.warn(`Skipping chunk [${chunkFrom}, ${chunkTo}]:`, err);
          }
        }
        
        return allLogs;
      };

      // Evento: DepositMade
      const depositEvents = await fetchLogsInChunks({
        address: STAKING_CONTRACT_ADDRESS,
        event: parseAbiItem('event DepositMade(address indexed user, uint256 amount, uint64 lockupDuration, uint256 indexed timestamp)'),
        args: { user: address },
      });
      console.log('💰 Deposit events found:', depositEvents.length);

      // Evento: WithdrawalMade
      const withdrawEvents = await fetchLogsInChunks({
        address: STAKING_CONTRACT_ADDRESS,
        event: parseAbiItem('event WithdrawalMade(address indexed user, uint256 amount, uint256 indexed timestamp)'),
        args: { user: address },
      });
      console.log('💸 Withdrawal events found:', withdrawEvents.length);

      // Evento: RewardsCompounded
      const compoundEvents = await fetchLogsInChunks({
        address: STAKING_CONTRACT_ADDRESS,
        event: parseAbiItem('event RewardsCompounded(address indexed user, uint256 amount)'),
        args: { user: address },
      });
      console.log('🔄 Compound events found:', compoundEvents.length);

      const stakingActivities: Activity[] = [];

      // Procesar deposits
      for (const log of depositEvents) {
        const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
        const { args } = log as any;
        if (!args) continue;
        
        stakingActivities.push({
          id: `deposit-${log.transactionHash}-${log.logIndex}`,
          type: 'STAKING_DEPOSIT',
          timestamp: Number(block.timestamp),
          txHash: log.transactionHash,
          details: {
            amount: formatEther(args.amount),
            lockupDuration: Number(args.lockupDuration),
          },
          description: `Staked ${formatEther(args.amount)} POL (${formatLockupDuration(Number(args.lockupDuration))})`,
          icon: '💰',
          color: 'from-green-500 to-emerald-600',
        });
      }

      // Procesar withdrawals
      for (const log of withdrawEvents) {
        const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
        const { args } = log as any;
        
        stakingActivities.push({
          id: `withdraw-${log.transactionHash}-${log.logIndex}`,
          type: 'STAKING_WITHDRAW',
          timestamp: Number(block.timestamp),
          txHash: log.transactionHash,
          details: {
            amount: formatEther(args.amount),
          },
          description: `Withdrew ${formatEther(args.amount)} POL`,
          icon: '💸',
          color: 'from-blue-500 to-indigo-600',
        });
      }

      // Procesar compounds
      for (const log of compoundEvents) {
        const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
        const { args } = log as any;
        
        stakingActivities.push({
          id: `compound-${log.transactionHash}-${log.logIndex}`,
          type: 'STAKING_COMPOUND',
          timestamp: Number(block.timestamp),
          txHash: log.transactionHash,
          details: {
            amount: formatEther(args.amount),
          },
          description: `Compounded ${formatEther(args.amount)} POL rewards`,
          icon: '🔄',
          color: 'from-purple-500 to-violet-600',
        });
      }

      console.log('✅ [Staking] Total activities processed:', stakingActivities.length);
      if (stakingActivities.length > 0) {
        console.log('📋 Sample activity:', stakingActivities[0]);
      }
      
      return stakingActivities;
    } catch (err) {
      console.error('❌ [Staking] Error fetching staking events:', err);
      return [];
    }
  }, [publicClient, address]);

  // Función para obtener eventos de NFT/Marketplace
  const getMarketplaceEvents = useCallback(async (): Promise<Activity[]> => {
    if (!publicClient || !address || !MARKETPLACE_CONTRACT_ADDRESS) return [];

    try {
      const currentBlock = await publicClient.getBlockNumber();
      
      // Alchemy Free Tier: 500 CU/s limit
      const BLOCKS_TO_FETCH = 50000;  // ~28 hours on Polygon
      const CHUNK_SIZE = 10;
      const DELAY_BETWEEN_CHUNKS = 400; // 400ms = 2.5 req/s
      const fromBlock = currentBlock - BigInt(BLOCKS_TO_FETCH);

      // Helper to add delay between requests
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      // Exponential backoff retry logic
      const fetchWithRetry = async (fetchFn: () => Promise<any>, maxRetries = 3): Promise<any> => {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            return await fetchFn();
          } catch (err: any) {
            // If 429 error, use exponential backoff
            if (err?.status === 429 && attempt < maxRetries - 1) {
              const backoffTime = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 8000);
              console.warn(`Rate limited (429), retrying in ${backoffTime}ms... (attempt ${attempt + 1}/${maxRetries})`);
              await delay(backoffTime);
              continue;
            }
            throw err;
          }
        }
      };

      // Helper to fetch logs in small chunks with rate limiting
      const fetchLogsInChunks = async (eventConfig: any) => {
        const allLogs: any[] = [];
        
        for (let offset = 0; offset < BLOCKS_TO_FETCH; offset += CHUNK_SIZE) {
          const chunkFrom = fromBlock + BigInt(offset);
          const chunkTo = fromBlock + BigInt(Math.min(offset + CHUNK_SIZE - 1, BLOCKS_TO_FETCH - 1));
          
          try {
            const logs = await fetchWithRetry(() => publicClient.getLogs({
              ...eventConfig,
              fromBlock: chunkFrom,
              toBlock: chunkTo,
            }));
            allLogs.push(...logs);
            
            // Add delay between chunks to respect CU/s limit
            if (offset + CHUNK_SIZE < BLOCKS_TO_FETCH) {
              await delay(DELAY_BETWEEN_CHUNKS);
            }
          } catch (err) {
            console.warn(`Skipping marketplace chunk [${chunkFrom}, ${chunkTo}]:`, err);
          }
        }
        
        return allLogs;
      };

      // Evento: TokenMinted
      const mintEvents = await fetchLogsInChunks({
        address: MARKETPLACE_CONTRACT_ADDRESS,
        event: parseAbiItem('event TokenMinted(uint256 indexed tokenId, address indexed creator, string tokenURI, string category)'),
        args: { creator: address },
      });

      // Evento: TokenListed
      const listEvents = await fetchLogsInChunks({
        address: MARKETPLACE_CONTRACT_ADDRESS,
        event: parseAbiItem('event TokenListed(uint256 indexed tokenId, address indexed seller, uint256 price, string category)'),
        args: { seller: address },
      });

      // Evento: TokenSold (como vendedor)
      const soldEvents = await fetchLogsInChunks({
        address: MARKETPLACE_CONTRACT_ADDRESS,
        event: parseAbiItem('event TokenSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price)'),
        args: { seller: address },
      });

      // Evento: TokenSold (como comprador)
      const boughtEvents = await fetchLogsInChunks({
        address: MARKETPLACE_CONTRACT_ADDRESS,
        event: parseAbiItem('event TokenSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price)'),
        args: { buyer: address },
      });

      // Evento: TokenUnlisted
      const unlistEvents = await fetchLogsInChunks({
        address: MARKETPLACE_CONTRACT_ADDRESS,
        event: parseAbiItem('event TokenUnlisted(uint256 indexed tokenId)'),
      });

      // Evento: OfferCreated
      const offerEvents = await fetchLogsInChunks({
        address: MARKETPLACE_CONTRACT_ADDRESS,
        event: parseAbiItem('event OfferCreated(uint256 indexed offerId, uint256 indexed tokenId, address indexed buyer, uint256 amount, uint256 expiresAt)'),
        args: { buyer: address },
      });

      // Evento: OfferAccepted
      const offerAcceptedEvents = await fetchLogsInChunks({
        address: MARKETPLACE_CONTRACT_ADDRESS,
        event: parseAbiItem('event OfferAccepted(uint256 indexed offerId, uint256 indexed tokenId, address seller, address buyer, uint256 amount)'),
      });

      const marketplaceActivities: Activity[] = [];

      // Procesar mints
      for (const log of mintEvents) {
        const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
        const { args } = log as any;
        
        marketplaceActivities.push({
          id: `mint-${log.transactionHash}-${log.logIndex}`,
          type: 'NFT_MINT',
          timestamp: Number(block.timestamp),
          txHash: log.transactionHash,
          details: {
            tokenId: args.tokenId.toString(),
            category: args.category,
          },
          description: `Minted NFT #${args.tokenId} (${args.category})`,
          icon: '🎨',
          color: 'from-pink-500 to-rose-600',
        });
      }

      // Procesar listings
      for (const log of listEvents) {
        const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
        const { args } = log as any;
        
        marketplaceActivities.push({
          id: `list-${log.transactionHash}-${log.logIndex}`,
          type: 'NFT_LIST',
          timestamp: Number(block.timestamp),
          txHash: log.transactionHash,
          details: {
            tokenId: args.tokenId.toString(),
            price: formatEther(args.price),
            category: args.category,
          },
          description: `Listed NFT #${args.tokenId} for ${formatEther(args.price)} POL`,
          icon: '🏷️',
          color: 'from-yellow-500 to-orange-600',
        });
      }

      // Procesar ventas
      for (const log of soldEvents) {
        const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
        const { args } = log as any;
        
        marketplaceActivities.push({
          id: `sale-${log.transactionHash}-${log.logIndex}`,
          type: 'NFT_SALE',
          timestamp: Number(block.timestamp),
          txHash: log.transactionHash,
          details: {
            tokenId: args.tokenId.toString(),
            price: formatEther(args.price),
            buyer: args.buyer,
          },
          description: `Sold NFT #${args.tokenId} for ${formatEther(args.price)} POL`,
          icon: '✅',
          color: 'from-green-500 to-teal-600',
        });
      }

      // Procesar compras
      for (const log of boughtEvents) {
        const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
        const { args } = log as any;
        
        marketplaceActivities.push({
          id: `purchase-${log.transactionHash}-${log.logIndex}`,
          type: 'NFT_PURCHASE',
          timestamp: Number(block.timestamp),
          txHash: log.transactionHash,
          details: {
            tokenId: args.tokenId.toString(),
            price: formatEther(args.price),
            seller: args.seller,
          },
          description: `Purchased NFT #${args.tokenId} for ${formatEther(args.price)} POL`,
          icon: '🛒',
          color: 'from-blue-500 to-cyan-600',
        });
      }

      // Procesar unlists (filtrar por seller usando transaction receipt)
      for (const log of unlistEvents) {
        try {
          const tx = await publicClient.getTransaction({ hash: log.transactionHash });
          if (tx.from.toLowerCase() === address.toLowerCase()) {
            const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
            const { args } = log as any;
            
            marketplaceActivities.push({
              id: `unlist-${log.transactionHash}-${log.logIndex}`,
              type: 'NFT_UNLIST',
              timestamp: Number(block.timestamp),
              txHash: log.transactionHash,
              details: {
                tokenId: args.tokenId.toString(),
              },
              description: `Unlisted NFT #${args.tokenId}`,
              icon: '❌',
              color: 'from-gray-500 to-slate-600',
            });
          }
        } catch {
          // Ignorar errores de transacciones individuales
        }
      }

      // Procesar ofertas creadas
      for (const log of offerEvents) {
        const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
        const { args } = log as any;
        
        marketplaceActivities.push({
          id: `offer-${log.transactionHash}-${log.logIndex}`,
          type: 'OFFER_MADE',
          timestamp: Number(block.timestamp),
          txHash: log.transactionHash,
          details: {
            tokenId: args.tokenId.toString(),
            price: formatEther(args.amount),
            offerId: args.offerId.toString(),
          },
          description: `Made offer of ${formatEther(args.amount)} POL on NFT #${args.tokenId}`,
          icon: '📨',
          color: 'from-indigo-500 to-purple-600',
        });
      }

      // Procesar ofertas aceptadas
      for (const log of offerAcceptedEvents) {
        const { args } = log as any;
        
        // Si soy el comprador
        if (args.buyer.toLowerCase() === address.toLowerCase()) {
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
          
          marketplaceActivities.push({
            id: `offer-accepted-buyer-${log.transactionHash}-${log.logIndex}`,
            type: 'OFFER_ACCEPTED',
            timestamp: Number(block.timestamp),
            txHash: log.transactionHash,
            details: {
              tokenId: args.tokenId.toString(),
              price: formatEther(args.amount),
              offerId: args.offerId.toString(),
              seller: args.seller,
            },
            description: `Your offer of ${formatEther(args.amount)} POL on NFT #${args.tokenId} was accepted`,
            icon: '🎉',
            color: 'from-green-500 to-emerald-600',
          });
        }
        
        // Si soy el vendedor
        if (args.seller.toLowerCase() === address.toLowerCase()) {
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
          
          marketplaceActivities.push({
            id: `offer-accepted-seller-${log.transactionHash}-${log.logIndex}`,
            type: 'OFFER_ACCEPTED',
            timestamp: Number(block.timestamp),
            txHash: log.transactionHash,
            details: {
              tokenId: args.tokenId.toString(),
              price: formatEther(args.amount),
              offerId: args.offerId.toString(),
              buyer: args.buyer,
            },
            description: `Accepted offer of ${formatEther(args.amount)} POL for NFT #${args.tokenId}`,
            icon: '🤝',
            color: 'from-teal-500 to-cyan-600',
          });
        }
      }

      return marketplaceActivities;
    } catch (err) {
      console.error('Error fetching marketplace events:', err);
      return [];
    }
  }, [publicClient, address]);

  // Función principal para obtener todas las actividades
  const fetchActivities = useCallback(async () => {
    if (!address) {
      setActivities([]);
      return;
    }

    console.log('🚀 [Main] Starting activity fetch for address:', address);
    setIsLoading(true);
    setError(null);

    try {
      // Obtener actividades secuencialmente para evitar rate limiting (429)
      // Alchemy Free Tier: 500 CU/s (5000 CU per 10-second window)
      const stakingActs = await getStakingEvents();
      console.log('📊 [Main] Staking activities:', stakingActs.length);
      
      // Larger delay between different event groups to stay under CU/s limit
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const marketplaceActs = await getMarketplaceEvents();
      console.log('🎨 [Main] Marketplace activities:', marketplaceActs.length);

      // Combinar y ordenar por timestamp (más reciente primero)
      const allActivities = [...stakingActs, ...marketplaceActs]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, maxActivities);

      console.log('✅ [Main] Total activities after combining:', allActivities.length);
      console.log('📋 [Main] Activities:', allActivities);
      
      setActivities(allActivities);
    } catch (err) {
      console.error('❌ [Main] Error fetching activities:', err);
      setError('Failed to load activities');
    } finally {
      setIsLoading(false);
    }
  }, [address, getStakingEvents, getMarketplaceEvents, maxActivities]);

  // Cargar actividades al montar el componente o cuando cambie la dirección
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    isLoading,
    error,
    refreshActivities: fetchActivities,
  };
}
