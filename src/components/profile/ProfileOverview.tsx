import React, { useEffect, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import { useMarketplaceNFTsGraph } from '../../hooks/nfts/useMarketplaceNFTsGraph';
import { useRecentActivities } from '../../hooks/activity/useRecentActivitiesGraph';
import ActivityItem from './ActivityItem';
import { SubgraphSyncStatus } from './SubgraphSyncStatus';
import SubgraphSyncWarning from './SubgraphSyncWarning';
import { apolloClient, clearSubgraphCache } from '../../lib/apollo-client';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';
import { useTapFeedback } from '../../hooks/mobile/useTapFeedback';
import { useTransactionWatcher } from '../../hooks/subgraph/useTransactionWatcher';

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
  
  // ✅ NEW: Auto-refresh activities after any blockchain transaction
  // 🔥 OPTIMIZATION: Removed clearCache to prevent unnecessary refetches
  useTransactionWatcher(async () => {
    await Promise.all([refreshActivities(), refreshNFTs()]);
  }, {
    clearCache: false, // Trust Apollo cache, only refresh specific queries
    delay: 3000, // Wait 3 seconds for subgraph to index
  });
  
  const { data: balance } = useBalance({
    address: address,
  });

  const isMobile = useIsMobile();

  // Removed auto-refetch on mount to prevent 429 errors
  // The hooks already fetch data when address/isConnected change
  /*
  useEffect(() => {
    if (isConnected && address) {
      refreshNFTs();
      refreshActivities();
    }
  }, [isConnected, address, refreshNFTs, refreshActivities]);
  */

  // Clear Apollo cache and force refresh
  const handleClearCacheAndRefresh = async () => {
    setIsClearing(true);
    triggerHaptic(); // Haptic feedback
    try {
      console.log('🧹 [Apollo] Clearing cache...');
      await clearSubgraphCache(); // Use new centralized cache clearing function
      await Promise.all([
        refreshActivities(), // Fetch fresh data from The Graph v0.38
        refreshNFTs(), // Also refresh NFTs
      ]);
      console.log('✅ [Apollo] Data refreshed from The Graph v0.38');
    } catch (err) {
      console.error('❌ [Apollo] Error clearing cache:', err);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className={`space-y-${isMobile ? '4' : '6'}`}>
      <header>
        <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent`}>
          Profile Overview
        </h1>
        <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400 mt-2`}>Complete overview of your account activity on Nuxchain</p>
      </header>

      {/* Stats Cards */}
      <section className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'}`}>
        {/* Wallet Status Card */}
        <div className={`card-unified ${isMobile ? 'p-3' : 'p-5'} bg-gradient-to-br from-purple-500/10 to-purple-600/5 hover:scale-105 transition-transform`}>
          <div className={`flex items-center ${isMobile ? 'gap-2 mb-2' : 'gap-3 mb-3'}`}>
            <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-xl bg-purple-500/20 flex items-center justify-center`}>
              <svg className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-purple-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-gray-400 truncate`}>Wallet</h3>
              <p className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold ${isConnected ? 'text-green-400' : 'text-gray-400'} truncate`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>
          {isConnected && (
            <div className="flex items-center gap-1 text-xs text-green-400 mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Active</span>
            </div>
          )}
        </div>

        {/* Balance Card */}
        <div className={`card-unified ${isMobile ? 'p-3' : 'p-5'} bg-gradient-to-br from-green-500/10 to-green-600/5 hover:scale-105 transition-transform`}>
          <div className={`flex items-center ${isMobile ? 'gap-2 mb-2' : 'gap-3 mb-3'}`}>
            <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-xl bg-green-500/20 flex items-center justify-center`}>
              <svg className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-green-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-gray-400 truncate`}>Balance</h3>
              <p className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold text-white truncate`}>
                {balance ? `${parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(isMobile ? 2 : 4)} ${balance.symbol}` : '0.0000 POL'}
              </p>
            </div>
          </div>
        </div>

        {/* NFTs Card */}
        <div className={`card-unified ${isMobile ? 'p-3' : 'p-5'} bg-gradient-to-br from-pink-500/10 to-pink-600/5 hover:scale-105 transition-transform`}>
          <div className={`flex items-center ${isMobile ? 'gap-2 mb-2' : 'gap-3 mb-3'}`}>
            <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-xl bg-pink-500/20 flex items-center justify-center`}>
              <svg className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-pink-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-gray-400 truncate`}>NFTs</h3>
              <p className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold text-white`}>{nfts.length}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">in your collection</p>
        </div>

        {/* Activity Status Card */}
        <div className={`card-unified ${isMobile ? 'p-3' : 'p-5'} bg-gradient-to-br from-blue-500/10 to-blue-600/5 hover:scale-105 transition-transform`}>
          <div className={`flex items-center ${isMobile ? 'gap-2 mb-2' : 'gap-3 mb-3'}`}>
            <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-xl bg-blue-500/20 flex items-center justify-center`}>
              <svg className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-blue-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-gray-400 truncate`}>Activity</h3>
              <p className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold text-white`}>{activities.length}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">recent actions</p>
        </div>
      </section>

      {/* Activity Section */}
      <section className="card-unified p-6">
        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'} mb-6`}>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white`}>Recent Activity</h2>
                {activitiesLoading && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-400">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                    Syncing
                  </span>
                )}
              </div>
            </div>
            <SubgraphSyncStatus className="text-xs ml-13" />
          </div>
          <div className={`flex ${isMobile ? 'w-full' : ''} items-center gap-2`}>
            <button
              onClick={() => {
                triggerHaptic('medium');
                handleClearCacheAndRefresh();
              }}
              disabled={isClearing || activitiesLoading}
              aria-label={isClearing ? 'Clearing cache...' : 'Clear Apollo cache and refresh data'}
              className={`${isMobile ? 'flex-1 px-3 py-2 text-xs' : 'px-4 py-2 text-sm'} bg-gradient-to-r from-orange-500/10 to-red-500/10 hover:from-orange-500/20 hover:to-red-500/20 border border-orange-500/30 hover:border-orange-500/50 rounded-xl text-orange-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 hover:scale-105`}
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
              {!isMobile && (isClearing ? 'Clearing...' : 'Clear Cache')}
            </button>
            <button
              onClick={() => {
                triggerHaptic('light');
                refreshActivities();
              }}
              disabled={activitiesLoading}
              aria-label={activitiesLoading ? 'Refreshing activities...' : 'Refresh recent activities'}
              className={`${isMobile ? 'flex-1 px-3 py-2 text-xs' : 'px-4 py-2 text-sm'} bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-500/30 hover:border-purple-500/50 rounded-xl text-purple-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 hover:scale-105`}
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
              {!isMobile && 'Refresh'}
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          {/* Subgraph Sync Warning */}
          <SubgraphSyncWarning show={activitiesLoading || activities.length === 0} />

          {activitiesLoading && activities.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
                </div>
                <p className="text-gray-300 font-medium mb-2">Loading your activities...</p>
                <p className="text-gray-500 text-sm">Syncing from The Graph subgraph...</p>
              </div>
            </div>
          ) : !isConnected ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-gray-300 font-medium mb-2">Connect Your Wallet</p>
              <p className="text-gray-500 text-sm">Connect your wallet to see your activity history</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Activity Yet</h3>
              <p className="text-gray-400 text-sm mb-4 max-w-sm mx-auto">
                Start staking, trading NFTs, or making offers to see your activity here
              </p>
              {!activitiesLoading && (
                <div className="space-y-2 text-center">
                  <p className="text-gray-600 text-xs max-w-md mx-auto">
                    💡 If you just made a transaction, the activity will appear once the subgraph finishes indexing (1-2 minutes).
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <a href="/staking" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-medium text-sm transition-all hover:scale-105">
                      Start Staking
                    </a>
                    <a href="/marketplace" className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-xl font-medium text-sm transition-all hover:scale-105">
                      Browse NFTs
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
              
              {activities.length >= 10 && (
                <div className="text-center pt-6 border-t border-white/10">
                  <p className="text-gray-500 text-sm mb-3">
                    Showing last 10 activities
                  </p>
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      refreshActivities();
                    }}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-xl text-gray-300 hover:text-white text-sm transition-all hover:scale-105"
                  >
                    Refresh Activities
                  </button>
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
