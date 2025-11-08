import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useMarketplaceNFTs, type NFTData } from '../../hooks/nfts/useReactQueryNFTs';
import { ipfsToHttp } from '../../utils/ipfs/ipfsUtils';
import LoadingSpinner from '../../ui/LoadingSpinner';
import usePOLPrice from '../../hooks/coingecko/usePOLPrice';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';
import '../../styles/animations.css';

const ProfileNFTs: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { nfts, loading, error, refreshNFTs, totalCount } = useMarketplaceNFTs({
    userOnly: true,
    enabled: isConnected && !!address
  });
  const { convertPOLToUSD } = usePOLPrice();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cachedNfts, setCachedNfts] = useState<NFTData[]>([]);
  const isMobile = useIsMobile();
  const prevNftsRef = useRef<NFTData[]>([]);

  // Cache NFTs to prevent flash during refresh - FIXED: Use ref to track previous value
  useEffect(() => {
    if (nfts && nfts.length > 0) {
      // Only update if NFTs actually changed (check by length and first tokenId)
      const nftsChanged = 
        prevNftsRef.current.length !== nfts.length ||
        (nfts[0] && prevNftsRef.current[0]?.tokenId !== nfts[0].tokenId);
      
      if (nftsChanged) {
        setCachedNfts(nfts);
        prevNftsRef.current = nfts;
      }
    }
  }, [nfts]);

  // Format POL price without unnecessary decimals
  const formatPOLPrice = (priceInWei: bigint): string => {
    const polAmount = Number(priceInWei) / 1e18;
    // Remove trailing zeros
    if (polAmount === 0) return '0';
    if (polAmount >= 1) {
      return polAmount.toFixed(1).replace(/\.0$/, '');
    }
    return polAmount.toFixed(4).replace(/\.?0+$/, '');
  };

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      refreshNFTs();
      // Short delay for animation visibility only - refreshNFTs now handles reloading
      await new Promise((res) => setTimeout(res, 500));
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, refreshNFTs]);

  // Determine which NFTs to display
  const displayNfts = isRefreshing && cachedNfts.length > 0 ? cachedNfts : nfts;
  const shouldShowNfts = displayNfts.length > 0;
  const shouldShowEmpty = !isRefreshing && !loading && nfts.length === 0 && !error;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">
            My NFTs
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Colección de NFTs en tu wallet {totalCount > 0 && `(${totalCount})`}
          </p>
        </div>
        {isConnected && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <span className={isRefreshing ? 'animate-spin inline-block' : ''}>🔄</span>
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        )}
      </header>

      {!isConnected ? (
        <div className="card-content text-center py-16">
          <p className="text-gray-400">Connect your wallet to view your NFTs</p>
        </div>
      ) : loading && nfts.length === 0 && !isRefreshing ? (
        <div className="card-content text-center py-16">
          <LoadingSpinner />
          <p className="text-gray-400 mt-4">Loading your NFTs...</p>
        </div>
      ) : error ? (
        <div className="card-content text-center py-16">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button onClick={handleRefresh} className="btn-primary">
            Try Again
          </button>
        </div>
      ) : shouldShowNfts ? (
        <section className={`grid gap-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {displayNfts.map((nft) => (
            <div key={nft.uniqueId} className={`card-interactive group overflow-hidden ${isMobile ? 'text-xs' : ''}`}>
              {/* NFT Image */}
              <div className={`aspect-square rounded-t-lg overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20 relative ${isMobile ? '' : ''}`}>
                <img
                  src={ipfsToHttp(nft.image)}
                  alt={nft.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = '/LogoNuvos.webp';
                  }}
                />
                {/* Token ID Badge */}
                <div className={`absolute ${isMobile ? 'top-2 right-2' : 'top-3 right-3'}`}>
                  <span className={`bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full font-bold border border-white/20 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                    #{nft.tokenId}
                  </span>
                </div>
                {/* For Sale Badge */}
                {nft.isForSale && (
                  <div className={`absolute ${isMobile ? 'top-2 left-2' : 'top-3 left-3'}`}>
                    <span className={`bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full font-bold shadow-lg border border-green-400/30 animate-pulse ${isMobile ? 'text-xs' : 'text-xs'}`}>
                      {isMobile ? '🏷️' : '🏷️ LISTED'}
                    </span>
                  </div>
                )}
              </div>

              {/* NFT Info */}
              <div className={isMobile ? 'p-3 space-y-2' : 'p-5 space-y-4'}>
                {/* Title */}
                <div>
                  <h3 className={`font-bold text-white truncate group-hover:text-purple-400 transition-colors ${isMobile ? 'text-sm mb-1' : 'text-xl mb-2'}`}>
                    {nft.name}
                  </h3>
                  {!isMobile && (
                    <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                      {nft.description || 'No description available'}
                    </p>
                  )}
                </div>

                {/* Price Section */}
                {nft.isForSale && (
                  <div className={`bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg ${isMobile ? 'p-2' : 'p-4'}`}>
                    <p className={`text-gray-400 ${isMobile ? 'text-xs mb-1' : 'text-xs mb-2'}`}>Price</p>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-baseline gap-1">
                        <span className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 ${isMobile ? 'text-base' : 'text-2xl'}`}>
                          {formatPOLPrice(nft.price)}
                        </span>
                        <span className={`font-semibold text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>POL</span>
                      </div>
                      <div className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        ≈ {convertPOLToUSD(Number(nft.price) / 1e18)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className={isMobile ? 'pt-1' : 'pt-2'}>
                  {nft.isForSale ? (
                    <div className={`w-full bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/50 text-green-300 rounded-lg font-medium text-center ${isMobile ? 'py-2 text-xs' : 'py-3 text-sm'}`}>
                      {isMobile ? '🏪 ACTIVE' : '🏪 ACTIVE LISTING'}
                    </div>
                  ) : (
                    <a
                      href="/marketplace"
                      className={`block w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg font-medium text-center transition-all ${isMobile ? 'py-2 text-xs' : 'py-3 text-sm hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25'}`}
                    >
                      {isMobile ? '🚀 List' : '🚀 List for Sale'}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </section>
      ) : shouldShowEmpty ? (
        <div className="card-content text-center py-16">
          <div className="w-20 h-20 mx-auto rounded-full bg-pink-600/20 flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No NFTs Found</h3>
          <p className="text-gray-400 mb-6">You don't have any NFTs yet. Start your collection!</p>
          <a href="/marketplace" className="btn-primary inline-block">
            Browse Marketplace
          </a>
        </div>
      ) : (
        <div className="card-content text-center py-16">
          <LoadingSpinner />
          <p className="text-gray-400 mt-4">Loading your NFTs...</p>
        </div>
      )}
    </div>
  );
};

export default ProfileNFTs;
