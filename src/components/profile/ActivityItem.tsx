import React from 'react';
import type { Activity } from '../../hooks/activity/useRecentActivities';

interface ActivityItemProps {
  activity: Activity;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  const truncateAddress = (addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const openTxExplorer = () => {
    const explorerUrl = `https://polygonscan.com/tx/${activity.txHash}`;
    window.open(explorerUrl, '_blank');
  };

  return (
    <div 
      className="group p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all cursor-pointer"
      onClick={openTxExplorer}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br ${activity.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
          {activity.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-white font-medium group-hover:text-purple-400 transition-colors">
                {activity.description}
              </p>
              
              {/* Details */}
              <div className="flex flex-wrap gap-2 mt-2">
                {activity.details.tokenId && (
                  <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded text-purple-400 text-xs font-medium">
                    NFT #{activity.details.tokenId}
                  </span>
                )}
                
                {activity.details.category && (
                  <span className="px-2 py-1 bg-pink-500/10 border border-pink-500/30 rounded text-pink-400 text-xs font-medium">
                    {activity.details.category}
                  </span>
                )}
                
                {activity.details.lockupDuration !== undefined && (
                  <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400 text-xs font-medium">
                    {activity.details.lockupDuration === 0 
                      ? 'Flexible' 
                      : `${Math.floor(activity.details.lockupDuration / 86400)} days`}
                  </span>
                )}
                
                {(activity.details.buyer || activity.details.seller) && (
                  <span className="px-2 py-1 bg-gray-500/10 border border-gray-500/30 rounded text-gray-400 text-xs font-mono">
                    {activity.details.buyer && truncateAddress(activity.details.buyer)}
                    {activity.details.seller && truncateAddress(activity.details.seller)}
                  </span>
                )}
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex-shrink-0 text-right">
              <span className="text-xs text-gray-400">
                {formatDate(activity.timestamp)}
              </span>
            </div>
          </div>

          {/* Transaction Hash */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-gray-500 font-mono">
              Tx: {activity.txHash.slice(0, 10)}...{activity.txHash.slice(-8)}
            </span>
            <svg 
              className="w-3 h-3 text-gray-500 group-hover:text-purple-400 transition-colors" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;
