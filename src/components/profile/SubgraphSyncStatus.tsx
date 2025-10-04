import { useEffect, useState } from 'react';
import { apolloClient } from '../../lib/apollo-client';
import { GET_SUBGRAPH_STATUS } from '../../lib/graphql/queries';
import type { GraphQLSubgraphMeta } from '../../lib/graphql/types';

interface SubgraphSyncStatusProps {
  className?: string;
}

export function SubgraphSyncStatus({ className = '' }: SubgraphSyncStatusProps) {
  const [syncStatus, setSyncStatus] = useState<{
    blockNumber: number;
    timestamp: number;
    isSyncing: boolean;
    hasErrors: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data } = await apolloClient.query<GraphQLSubgraphMeta>({
          query: GET_SUBGRAPH_STATUS,
          fetchPolicy: 'network-only',
        });

        if (data?._meta) {
          setSyncStatus({
            blockNumber: data._meta.block.number,
            timestamp: data._meta.block.timestamp,
            isSyncing: true, // If query succeeds, subgraph is syncing
            hasErrors: data._meta.hasIndexingErrors,
          });
        }
      } catch (error) {
        console.error('Failed to fetch subgraph status:', error);
        setSyncStatus(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, []);

  if (isLoading || !syncStatus) {
    return null;
  }

  const blockAge = Date.now() - syncStatus.timestamp * 1000;
  const minutesAgo = Math.floor(blockAge / 60000);
  const hoursAgo = Math.floor(minutesAgo / 60);

  const timeAgoText = hoursAgo > 0 
    ? `${hoursAgo}h ago` 
    : minutesAgo > 0 
    ? `${minutesAgo}m ago` 
    : 'Just now';

  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      {/* Status indicator */}
      <div className="flex items-center gap-1.5">
        <div
          className={`w-2 h-2 rounded-full ${
            syncStatus.hasErrors
              ? 'bg-red-400 animate-pulse'
              : blockAge < 60000
              ? 'bg-green-400 animate-pulse'
              : 'bg-yellow-400'
          }`}
        />
        <span className="text-gray-400">
          {syncStatus.hasErrors
            ? 'Indexing errors'
            : blockAge < 60000
            ? 'Live'
            : 'Syncing'}
        </span>
      </div>

      {/* Block info */}
      <span className="text-gray-500">•</span>
      <span className="text-gray-400">
        Block {syncStatus.blockNumber.toLocaleString()}
      </span>

      {/* Time ago */}
      <span className="text-gray-500">•</span>
      <span className="text-gray-400">{timeAgoText}</span>
    </div>
  );
}
