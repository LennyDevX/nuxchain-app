import { useEffect, useState, useCallback } from 'react';
import { apolloClient } from '../../lib/apollo-client';
import { GET_SUBGRAPH_STATUS } from '../../lib/graphql/queries';

export interface SubgraphStatus {
  blockNumber: number;
  blockHash: string;
  timestamp: number;
  hasIndexingErrors: boolean;
  isSyncing: boolean;
  blockAge: number; // in milliseconds
  timeAgo: string;
  isUpToDate: boolean; // within 1 minute
  isRecentlyUpdated: boolean; // within 5 minutes
}

interface UseSubgraphStatusReturn {
  status: SubgraphStatus | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener el estado de sincronización del subgraph
 * Polling cada 30 segundos
 */
export function useSubgraphStatus(): UseSubgraphStatusReturn {
  const [status, setStatus] = useState<SubgraphStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setError(null);
      
      const { data, errors } = await apolloClient.query<{ _meta: { block: { number: number; hash: string; timestamp: number; }; deployment: string; hasIndexingErrors: boolean; } }>({
        query: GET_SUBGRAPH_STATUS,
        fetchPolicy: 'cache-first', // Use cache first to reduce network requests
      });

      if (errors && errors.length > 0) {
        throw new Error(`GraphQL errors: ${errors.map(e => e.message).join(', ')}`);
      }

      if (!data?._meta) {
        throw new Error('No subgraph meta data returned');
      }

      const meta = data._meta;
      const now = Date.now();
      const blockTimestamp = meta.block.timestamp * 1000;
      const blockAge = now - blockTimestamp;
      const minutesAgo = Math.floor(blockAge / 60000);
      const hoursAgo = Math.floor(minutesAgo / 60);
      const daysAgo = Math.floor(hoursAgo / 24);

      const timeAgo = daysAgo > 0
        ? `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`
        : hoursAgo > 0
        ? `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`
        : minutesAgo > 0
        ? `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`
        : 'Just now';

      setStatus({
        blockNumber: meta.block.number,
        blockHash: meta.block.hash,
        timestamp: meta.block.timestamp,
        hasIndexingErrors: meta.hasIndexingErrors,
        isSyncing: true,
        blockAge,
        timeAgo,
        isUpToDate: blockAge < 60000, // 1 minute
        isRecentlyUpdated: blockAge < 300000, // 5 minutes
      });
    } catch (err) {
      console.error('❌ [useSubgraphStatus] Error fetching status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subgraph status');
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60000); // Poll every 60 seconds (optimized for 429)

    return () => clearInterval(interval);
  }, [fetchStatus]);

  return {
    status,
    isLoading,
    error,
    refetch: fetchStatus,
  };
}
