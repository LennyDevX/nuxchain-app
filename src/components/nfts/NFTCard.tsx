import  { memo, useCallback } from 'react';
import { useImageCache } from '../../hooks/cache/useImageCache';

interface NFTData {
  tokenId: string;
  uniqueId: string;
  tokenURI: string | null;
  contract: `0x${string}`;
  name: string;
  description: string;
  image: string;
  attributes: any[];
  owner: string;
  creator: string;
  price: bigint;
  isForSale: boolean;
  likes: string;
  category: string;
}

interface NFTCardProps {
  nft: NFTData;
  onListNFT: (tokenId: string) => void;
}

function NFTCard({ nft, onListNFT }: NFTCardProps) {
  const { imageUrl, isLoading: imageLoading, error: imageError } = useImageCache(nft.image);
  
  const handleListNFT = useCallback(() => {
    onListNFT(nft.tokenId);
  }, [onListNFT, nft.tokenId]);
  return (
    <div className="card-interactive overflow-hidden group">
      <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-blue-500/20 relative overflow-hidden">
        {imageLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          </div>
        ) : imageError || !imageUrl ? (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {imageError && (
              <div className="absolute bottom-2 left-2 right-2 text-xs text-red-400 bg-black/50 rounded px-2 py-1 text-center">
                Failed to load
              </div>
            )}
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={nft.name || `NFT #${nft.tokenId}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
        )}
        <div className="absolute top-3 right-3">
          <span className="bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
            #{nft.tokenId}
          </span>
        </div>
        {nft.isForSale && (
          <div className="absolute top-3 left-3">
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg border border-green-400/30 animate-pulse">
              🏷️ LISTED
            </span>
          </div>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1 truncate">
            {nft.name || `NFT #${nft.tokenId}`}
          </h3>
          <p className="text-sm text-white/60 line-clamp-2">
            {nft.description || 'No description available'}
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs text-white/60">
              <span className="bg-white/10 px-2 py-1 rounded-md">ID: {nft.tokenId}</span>
            </div>
            {nft.isForSale && nft.price && (
              <div className="text-right">
                <p className="text-xs text-white/60 mb-1">Listed Price</p>
                <p className="text-sm font-bold text-green-400">
                  {(Number(nft.price) / 1e18) >= 1 
                    ? (Number(nft.price) / 1e18).toFixed(2)
                    : (Number(nft.price) / 1e18).toFixed(6)
                  } POL
                </p>
              </div>
            )}
          </div>
          <div className="text-xs text-white/50">
            <p>Owner: {nft.owner?.slice(0, 6)}...{nft.owner?.slice(-4)}</p>
          </div>
        </div>
        
        {/* Attributes */}
        {nft.attributes && nft.attributes.length > 0 && (
          <div>
            <p className="text-xs text-white/60 mb-2">Attributes:</p>
            <div className="flex flex-wrap gap-1">
              {nft.attributes.slice(0, 3).map((attr: any, index: number) => (
                <span key={index} className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 text-white/90 text-xs px-2 py-1 rounded-md">
                  <span className="text-white/60">{attr.trait_type}:</span> <span className="font-medium">{attr.value}</span>
                </span>
              ))}
              {nft.attributes.length > 3 && (
                <span className="bg-white/10 text-white/60 text-xs px-2 py-1 rounded-md">
                  +{nft.attributes.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          {nft.isForSale ? (
            <div className="w-full bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/50 text-green-300 py-2.5 px-4 rounded-lg text-sm font-medium text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 animate-pulse"></div>
              <span className="relative z-10">🏪 ACTIVE LISTING</span>
            </div>
          ) : (
            <button 
              onClick={handleListNFT}
              className="w-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/50 text-blue-300 hover:from-blue-500/40 hover:to-cyan-500/40 hover:border-blue-300 hover:text-blue-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25 py-2.5 px-4 rounded-lg text-sm font-medium text-center transition-all duration-300 transform"
            >
              🚀 Sell NFT
            </button>
          )}
          <div className="w-full bg-purple-600/20 border border-purple-600/50 text-purple-300 py-2 px-4 rounded-lg text-xs font-medium text-center">
            👤 You are the Creator
          </div>
        </div>
      </div>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(NFTCard, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.nft.uniqueId === nextProps.nft.uniqueId &&
    prevProps.nft.isForSale === nextProps.nft.isForSale &&
    prevProps.nft.price === nextProps.nft.price &&
    prevProps.nft.image === nextProps.nft.image &&
    prevProps.nft.name === nextProps.nft.name &&
    prevProps.onListNFT === nextProps.onListNFT
  );
});