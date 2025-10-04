import { memo, useCallback } from 'react';
import { useImageCache } from '../../hooks/cache/useImageCache';
import { formatEther } from 'viem';

import { formatPolValue } from '../../utils/formats/format';
import usePOLPrice from '../../hooks/coingecko/usePOLPrice';

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

interface NFTCardProps {
  nft: NFTData;
  onListNFT: (tokenId: string) => void;
  isMobile?: boolean;
}

function NFTCard({ nft, onListNFT, isMobile = false }: NFTCardProps) {
  const { imageUrl, isLoading: imageLoading, error: imageError } = useImageCache(nft.image);
  const { convertPOLToUSD } = usePOLPrice();
  
  const handleListNFT = useCallback(() => {
    onListNFT(nft.tokenId);
  }, [onListNFT, nft.tokenId]);

  // Format price for display with POL and USD
  const pricePOL = nft.price ? Number(formatEther(nft.price)) : 0;
  const priceUSD = convertPOLToUSD(pricePOL);
    const formattedPricePOL = pricePOL > 0 ? `${formatPolValue(pricePOL)} POL` : null;
  const formattedPriceUSD = pricePOL > 0 && priceUSD ? `${priceUSD}` : null;
  return (
    <div className={`card-interactive overflow-hidden group ${isMobile ? 'text-sm' : ''}`}>
      {/* NFT Image with improved spacing */}
      <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-blue-500/20 relative overflow-hidden">
        {imageLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className={`animate-spin rounded-full border-b-2 border-purple-400 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`}></div>
          </div>
        ) : imageError || !imageUrl ? (
          <div className="w-full h-full flex items-center justify-center">
            <svg className={`text-white/40 ${isMobile ? 'w-12 h-12' : 'w-16 h-16'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {imageError && (
              <div className={`absolute bottom-2 left-2 right-2 text-red-400 bg-black/50 rounded px-2 py-1 text-center ${isMobile ? 'text-xs' : 'text-xs'}`}>
                Failed to load
              </div>
            )}
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={nft.name || `NFT #${nft.tokenId}`}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
        )}
        {/* Token ID Badge */}
        <div className={`absolute ${isMobile ? 'top-2 right-2' : 'top-3 right-3'}`}>
          <span className={`bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full font-bold border border-white/20 ${isMobile ? 'text-xs' : 'text-xs'}`}>
            #{nft.tokenId}
          </span>
        </div>
        {/* For Sale Badge */}
        {nft.isForSale && (
          <div className={`absolute ${isMobile ? 'top-2 left-2' : 'top-3 left-3'}`}>
            <span className={`bg-gradient-to-r from-green-500 to-emerald-500 backdrop-blur-sm text-white px-3 py-1.5 rounded-full font-semibold shadow-lg border border-green-400/30 ${
              isMobile ? 'text-xs' : 'text-xs'
            } animate-pulse`}>
              🏷️ {isMobile ? 'SALE' : 'LISTED'}
            </span>
          </div>
        )}
      </div>
      
      {/* Card Content with improved spacing */}
      <div className={`${isMobile ? 'p-3 space-y-2' : 'p-5 space-y-4'}`}>
        {/* Title and Description */}
        <div>
          <h3 className={`font-bold text-white mb-1 truncate group-hover:text-purple-400 transition-colors ${isMobile ? 'text-base' : 'text-xl'}`}>
            {nft.name || `NFT #${nft.tokenId}`}
          </h3>
          {!isMobile && (
            <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
              {nft.description || 'No description available'}
            </p>
          )}
        </div>
        
        {/* Price Section - Improved design */}
        {nft.isForSale && nft.price && (
          <div className={`bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg ${isMobile ? 'p-2' : 'p-4'}`}>
            <p className={`text-gray-400 mb-1 ${isMobile ? 'text-xs' : 'text-xs'}`}>Current Price</p>
            <div className="flex items-baseline gap-2">
              <span className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                {formattedPricePOL}
              </span>
            </div>
            {formattedPriceUSD && (
              <p className={`font-medium text-green-400 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                ≈ {formattedPriceUSD}
              </p>
            )}
          </div>
        )}
        
        {/* Attributes - Better spacing */}
        {!isMobile && nft.attributes && nft.attributes.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 font-semibold">Attributes</p>
            <div className="flex flex-wrap gap-2">
              {nft.attributes.slice(0, 3).map((attr: NFTAttribute, index: number) => (
                <span key={index} className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 text-white/90 text-xs px-3 py-1.5 rounded-lg">
                  <span className="text-gray-400">{attr.trait_type}:</span> <span className="font-semibold ml-1">{attr.value}</span>
                </span>
              ))}
              {nft.attributes.length > 3 && (
                <span className="bg-white/10 text-gray-400 text-xs px-3 py-1.5 rounded-lg font-medium">
                  +{nft.attributes.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Owner Info - Better design */}
        {!isMobile && (
          <div className="flex items-center justify-between py-2 border-t border-white/5">
            <span className="text-xs text-gray-500">Owner</span>
            <span className="text-xs text-white font-mono bg-white/5 px-2 py-1 rounded">
              {nft.owner?.slice(0, 6)}...{nft.owner?.slice(-4)}
            </span>
          </div>
        )}
        
        {/* Action Buttons - Improved spacing */}
        <div className={`${isMobile ? 'space-y-1 pt-1' : 'space-y-2 pt-2'}`}>
          {nft.isForSale ? (
            <div className={`w-full bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/50 text-green-300 rounded-lg font-medium text-center relative overflow-hidden ${
              isMobile ? 'py-2 px-2 text-xs' : 'py-3 px-4 text-sm'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 animate-pulse"></div>
              <span className="relative z-10">{isMobile ? '🏪 LISTED' : '🏪 ACTIVE LISTING'}</span>
            </div>
          ) : (
            <button 
              onClick={handleListNFT}
              className={`w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg font-medium text-center transition-all duration-300 ${
                isMobile 
                  ? 'py-2 px-2 text-xs' 
                  : 'py-3 px-4 text-sm hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25 transform'
              }`}
            >
              {isMobile ? '🚀 Sell' : '🚀 List for Sale'}
            </button>
          )}
          {!isMobile && (
            <div className="w-full bg-purple-600/20 border border-purple-600/50 text-purple-300 py-2 px-4 rounded-lg text-xs font-medium text-center">
              👤 You are the Creator
            </div>
          )}
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
    prevProps.onListNFT === nextProps.onListNFT &&
    prevProps.isMobile === nextProps.isMobile
  );
});