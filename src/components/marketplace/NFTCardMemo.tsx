import React, { memo, useCallback } from 'react';
import type { MarketplaceNFT } from '../../hooks/nfts/useMarketplace';
import usePOLPrice from '../../hooks/coingecko/usePOLPrice';
import { useImageCache } from '../../hooks/cache/useImageCache';

interface NFTCardProps {
  nft: MarketplaceNFT;
  index: number;
  onBuy: (nft: MarketplaceNFT) => void;
}

const NFTCardMemo: React.FC<NFTCardProps> = memo(({ nft, index, onBuy }) => {
  const { convertPOLToUSD, polPrice } = usePOLPrice();
  const { imageUrl, isLoading: imageLoading, error: imageError } = useImageCache(nft.image);

  const handleBuyClick = useCallback(() => {
    onBuy(nft);
  }, [nft, onBuy]);

  return (
    <div className="group card-interactive overflow-hidden">
      <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center relative overflow-hidden">
        {imageLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          </div>
        ) : imageError || !imageUrl ? (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl opacity-50">🖼️</span>
            {imageError && (
              <div className="absolute bottom-2 left-2 right-2 text-xs text-red-400 bg-black/50 rounded px-2 py-1 text-center">
                Failed to load
              </div>
            )}
          </div>
        ) : (
          <img 
            src={imageUrl} 
            alt={nft.name || `NFT #${nft.tokenId || index + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white mb-1 truncate">{nft.name || `NFT #${nft.tokenId || index + 1}`}</h3>
        <p className="text-sm text-white/60 mb-3">{nft.category || 'Art'}</p>
        <div className="flex justify-between items-center">
          <div className="min-w-0 flex-1 mr-3">
            <div className="text-lg font-bold text-white truncate">
              {nft.priceInEth ? (nft.priceInEth < 0.01 ? nft.priceInEth.toFixed(6) : nft.priceInEth.toFixed(2)) : '0.10'} POL
            </div>
            <div className="text-xs text-white/40 truncate">
              {polPrice ? `≈ ${convertPOLToUSD(nft.priceInEth || 0.1)}` : '≈ Loading...'}
            </div>
          </div>
          <button 
            onClick={handleBuyClick}
            className="px-3 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 flex-shrink-0"
          >
            Buy
          </button>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return (
    prevProps.nft.tokenId === nextProps.nft.tokenId &&
    prevProps.nft.priceInEth === nextProps.nft.priceInEth &&
    prevProps.nft.name === nextProps.nft.name &&
    prevProps.nft.image === nextProps.nft.image &&
    prevProps.nft.category === nextProps.nft.category &&
    prevProps.index === nextProps.index
  );
});

NFTCardMemo.displayName = 'NFTCardMemo';

export default NFTCardMemo;