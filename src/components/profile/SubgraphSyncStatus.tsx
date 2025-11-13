import { useState, useCallback } from 'react';
import { useSubgraphStatus } from '../../hooks/subgraph/useSubgraphStatus';

interface SubgraphSyncStatusProps {
  className?: string;
  showDetails?: boolean;
}

export function SubgraphSyncStatus({ className = '', showDetails = false }: SubgraphSyncStatusProps) {
  const { status, isLoading, error, refetch } = useSubgraphStatus();
  const [showPopup, setShowPopup] = useState(false);

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 text-xs animate-pulse ${className}`}>
        <div className="w-2 h-2 rounded-full bg-blue-400" />
        <span className="text-gray-400">Checking sync...</span>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div 
        className={`flex items-center gap-2 text-xs cursor-pointer hover:text-red-300 transition-colors ${className}`}
        onClick={handleRefresh}
        title="Click to retry"
      >
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-red-400">Subgraph unavailable</span>
        <span className="text-red-400/60 text-[10px]">Click to retry</span>
      </div>
    );
  }

  const statusColor = status.hasIndexingErrors
    ? 'bg-red-500'
    : status.isUpToDate
    ? 'bg-green-500'
    : status.isRecentlyUpdated
    ? 'bg-yellow-500'
    : 'bg-orange-500';

  const statusText = status.hasIndexingErrors
    ? 'Indexing errors'
    : status.isUpToDate
    ? 'Live'
    : status.isRecentlyUpdated
    ? 'Syncing'
    : 'Behind';

  const statusColor2 = status.hasIndexingErrors
    ? 'text-red-400'
    : status.isUpToDate
    ? 'text-green-400'
    : status.isRecentlyUpdated
    ? 'text-yellow-400'
    : 'text-orange-400';

  const shouldAnimate = !status.isUpToDate;

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-2 text-xs cursor-pointer ${className}`}
        onClick={() => setShowPopup(!showPopup)}
        title="Click for details"
      >
        {/* Status indicator */}
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full ${statusColor} ${shouldAnimate ? 'animate-pulse' : ''}`}
          />
          <span className={statusColor2}>
            {statusText}
          </span>
        </div>

        {/* Separator */}
        <span className="text-gray-500">•</span>

        {/* Block info */}
        <span className="text-gray-400">
          Block {status.blockNumber.toLocaleString()}
        </span>

        {/* Time ago */}
        <span className="text-gray-500">•</span>
        <span className="text-gray-400">{status.timeAgo}</span>
      </div>

      {/* Detailed popup */}
      {showPopup && (
        <div className="absolute top-full mt-2 right-0 z-50 bg-gray-900 border border-gray-700 rounded-lg p-4 w-64 shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-gray-700">
              <h3 className="font-semibold text-white text-sm">Subgraph Status</h3>
              <button
                onClick={() => setShowPopup(false)}
                className="text-gray-400 hover:text-white text-lg leading-none"
              >
                ×
              </button>
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${statusColor} ${shouldAnimate ? 'animate-pulse' : ''}`}
              />
              <div>
                <p className={`text-sm font-semibold ${statusColor2}`}>
                  {statusText}
                </p>
                {status.hasIndexingErrors && (
                  <p className="text-xs text-red-300 mt-1">
                    The subgraph has indexing errors. Data may be incomplete.
                  </p>
                )}
              </div>
            </div>

            {/* Block info */}
            <div className="space-y-1 text-xs">
              <p className="text-gray-400">
                <span className="text-gray-500">Block:</span>{' '}
                <span className="text-white font-mono">{status.blockNumber.toLocaleString()}</span>
              </p>
              <p className="text-gray-400">
                <span className="text-gray-500">Updated:</span>{' '}
                <span className="text-white">{status.timeAgo}</span>
              </p>
              {showDetails && (
                <>
                  <p className="text-gray-400">
                    <span className="text-gray-500">Hash:</span>{' '}
                    <span className="text-white font-mono text-[10px] break-all">{status.blockHash.slice(0, 20)}...</span>
                  </p>
                  <p className="text-gray-400">
                    <span className="text-gray-500">Age:</span>{' '}
                    <span className="text-white">{Math.floor(status.blockAge / 1000)}s</span>
                  </p>
                </>
              )}
            </div>

            {/* Info messages */}
            {!status.isUpToDate && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2">
                <p className="text-xs text-yellow-400">
                  ⚠️ Subgraph is catching up. New activities may take a moment to appear.
                </p>
              </div>
            )}

            {status.isRecentlyUpdated && !status.isUpToDate && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2">
                <p className="text-xs text-blue-400">
                  💡 Try refreshing if your recent activities aren't showing yet.
                </p>
              </div>
            )}

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              className="w-full mt-3 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-xs font-semibold text-white transition-colors"
            >
              Refresh Activities
            </button>
          </div>
        </div>
      )}

      {/* Close popup on click outside */}
      {showPopup && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}
