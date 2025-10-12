import { useEffect, useCallback, useRef } from 'react';
import NFTCard from './NFTCard';
import { useImagePreloader } from '../../hooks/cache/useImageCache';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

import LoadingSpinner from '../../ui/LoadingSpinner';

interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

interface NFTData {
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

interface InfiniteScrollNFTGridProps {
  nfts: NFTData[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  onListNFT: (tokenId: string) => void;
  onCreateNFT: () => void;
  onLoadMore: () => void;
  totalCount?: number;
  loadedCount?: number;
}

export default function InfiniteScrollNFTGrid({
  nfts,
  loading,
  loadingMore,
  error,
  hasMore,
  onListNFT,
  onCreateNFT,
  onLoadMore,
  totalCount = 0,
  loadedCount = 0
}: InfiniteScrollNFTGridProps) {
  const isMobile = useIsMobile();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Preload images for better UX
  const imageUrls = nfts.map(nft => nft.image).filter(Boolean);
  const { preloadedCount, isPreloading } = useImagePreloader(imageUrls);

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries;
    if (target.isIntersecting && hasMore && !loadingMore && !loading) {
      onLoadMore();
    }
  }, [hasMore, loadingMore, loading, onLoadMore]);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: '200px' // Start loading 200px before the element is visible for smoother experience
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner 
          size="lg" 
          text="Loading your NFT collection..." 
          className="mb-4"
        />
        {isPreloading && (
          <div className="text-center mt-4 text-xs text-white/40">
            Preloading images: {preloadedCount}/{imageUrls.length}
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Error Loading NFTs</h3>
        <p className="text-white/60 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (nfts.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">You don't have any NFTs yet</h3>
        <p className="text-white/60 mb-6">Create your first NFT and start your collection</p>
        <button 
          onClick={onCreateNFT}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200"
        >
          Create my first NFT
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between text-sm text-white/60 bg-white/5 rounded-lg p-3">
          <span>Showing {loadedCount} of {totalCount} NFTs</span>
          <div className="flex items-center space-x-2">
            <div className="w-32 bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(loadedCount / totalCount) * 100}%` }}
              ></div>
            </div>
            <span>{Math.round((loadedCount / totalCount) * 100)}%</span>
          </div>
        </div>
      )}

      {/* NFT Grid */}
      <div className={`grid gap-4 ${
        isMobile 
          ? 'grid-cols-2' // 2x2 grid for mobile
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      }`}>
        {nfts.map((nft) => (
          <NFTCard
            key={nft.uniqueId || nft.tokenId}
            nft={nft}
            onListNFT={onListNFT}
            isMobile={isMobile}
          />
        ))}
      </div>

      {/* Load More Trigger */}
      {hasMore && (
        <div 
          ref={loadMoreRef}
          className="flex items-center justify-center py-8"
        >
          {loadingMore ? (
            <LoadingSpinner 
              size="md" 
              text="Loading more NFTs..." 
            />
          ) : (
            <button
              onClick={onLoadMore}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 backdrop-blur-sm"
            >
              Load More NFTs
            </button>
          )}
        </div>
      )}

      {/* End of collection indicator */}
      {!hasMore && nfts.length > 0 && (
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-2 text-white/60 bg-white/5 rounded-full px-4 py-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>You've reached the end of your collection</span>
          </div>
        </div>
      )}
    </div>
  );
}