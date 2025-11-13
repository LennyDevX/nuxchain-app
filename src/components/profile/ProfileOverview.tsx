import React, { useEffect, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { useMarketplaceNFTsGraph } from '../../hooks/nfts/useMarketplaceNFTsGraph';
import { useRecentActivities } from '../../hooks/activity/useRecentActivitiesGraph';
import ActivityItem from './ActivityItem';
import { SubgraphSyncStatus } from './SubgraphSyncStatus';
import SubgraphSyncWarning from './SubgraphSyncWarning';
import { apolloClient } from '../../lib/apollo-client';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';
import { useTapFeedback } from '../../hooks/mobile/useTapFeedback';

const ProfileOverview: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { nfts, refreshNFTs } = useMarketplaceNFTsGraph({
    userOnly: true,
    enabled: isConnected && !!address
  });
  const { activities, isLoading: activitiesLoading, refreshActivities } = useRecentActivities(10);
  const [isClearing, setIsClearing] = useState(false);
  
  // ✅ Haptic feedback
  const triggerHaptic = useTapFeedback();
  
  const { data: balance } = useBalance({
    address: address,
  });

  const isMobile = useIsMobile();

  useEffect(() => {
    if (isConnected && address) {
      refreshNFTs();
      refreshActivities();
    }
  }, [isConnected, address, refreshNFTs, refreshActivities]);

  // Clear Apollo cache and force refresh
  const handleClearCacheAndRefresh = async () => {
    setIsClearing(true);
    try {
      console.log('🧹 [Apollo] Clearing cache...');
      await apolloClient.clearStore(); // Clear all cached data
      console.log('✅ [Apollo] Cache cleared');
      await refreshActivities(); // Fetch fresh data from v0.0.2
      console.log('✅ [Apollo] Data refreshed from The Graph v0.0.2');
    } catch (err) {
      console.error('❌ [Apollo] Error clearing cache:', err);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className={`space-y-${isMobile ? '4' : '6'}`}>
      <header>
        <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gradient`}>
          Profile Overview
        </h1>
        <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400 mt-2`}>Resumen de tu cuenta y actividad en Nuxchain</p>
      </header>

      <section className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
        {/* Wallet Status Card */}
        <div className="card-stats">
          <div className={`flex items-center space-x-3 ${isMobile ? 'mb-2' : 'mb-3'}`}>
            <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg bg-purple-600/20 flex items-center justify-center`}>
              <svg className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-purple-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-gray-400`}>Wallet Status</h3>
              <p className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-white`}>
                {isConnected ? 'Connected' : 'Not Connected'}
              </p>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="card-stats">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400">Balance</h3>
              <p className="text-lg font-bold text-white">
                {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '0.0000 POL'}
              </p>
            </div>
          </div>
        </div>

        {/* NFTs Card */}
        <div className="card-stats">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-pink-600/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400">NFTs Owned</h3>
              <p className="text-lg font-bold text-white">{nfts.length}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Activity Section */}
      <section className="card-content">
        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'} mb-4`}>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold`}>Recent Activity</h2>
              {activitiesLoading && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-400">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                  Syncing
                </span>
              )}
            </div>
            <SubgraphSyncStatus className="text-xs" />
          </div>
          <div className={`flex ${isMobile ? 'w-full' : ''} items-center gap-2`}>
            <button
              onClick={() => {
                triggerHaptic('medium'); // ✅ Haptic feedback
                handleClearCacheAndRefresh();
              }}
              disabled={isClearing || activitiesLoading}
              aria-label={isClearing ? 'Clearing cache...' : 'Clear Apollo cache and refresh data'}
              aria-busy={isClearing}
              aria-disabled={isClearing || activitiesLoading}
              className={`${isMobile ? 'flex-1 px-3 py-2 text-xs' : 'px-3 py-1 text-sm'} bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 transition-transform`}
            >
              <svg 
                className={`w-4 h-4 ${isClearing ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                />
              </svg>
              {!isMobile && 'Clear Cache'}
            </button>
            <button
              onClick={() => {
                triggerHaptic('light'); // ✅ Haptic feedback
                refreshActivities();
              }}
              disabled={activitiesLoading}
              aria-label={activitiesLoading ? 'Refreshing activities...' : 'Refresh recent activities'}
              aria-busy={activitiesLoading}
              aria-disabled={activitiesLoading}
              className={`${isMobile ? 'flex-1 px-3 py-2 text-xs' : 'px-3 py-1 text-sm'} bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 transition-transform`}
            >
              <svg 
                className={`w-4 h-4 ${activitiesLoading ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          {/* Subgraph Sync Warning */}
          <SubgraphSyncWarning show={activitiesLoading || activities.length === 0} />

          {activitiesLoading && activities.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-4"></div>
                <p className="text-gray-400 text-sm">Loading your activities...</p>
                <p className="text-gray-500 text-xs mt-2">Syncing from The Graph subgraph...</p>
              </div>
            </div>
          ) : !isConnected ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm">Connect your wallet to see your activity</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-500/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm mb-2">No recent activity found</p>
              <p className="text-gray-500 text-xs mb-4">
                Start staking, trading NFTs, or making offers to see your activity here
              </p>
              {!activitiesLoading && (
                <p className="text-gray-600 text-xs">
                  💡 Tip: If you just made a deposit, the activity will appear once the subgraph finishes indexing (1-2 minutes).
                </p>
              )}
            </div>
          ) : (
            <>
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
              
              {activities.length >= 10 && (
                <div className="text-center pt-4">
                  <p className="text-gray-500 text-xs">
                    Showing last 10 activities
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProfileOverview;
