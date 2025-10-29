import React, { memo, useCallback } from 'react';
import type { MarketplaceNFT } from '../../types/marketplace';
import usePOLPrice from '../../hooks/coingecko/usePOLPrice';
import { useImageCache } from '../../hooks/cache/useImageCache';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

interface NFTCardProps {
  nft: MarketplaceNFT;
  index: number;
  onBuy: (nft: MarketplaceNFT) => void;
}

const NFTCardMemo: React.FC<NFTCardProps> = memo(({ nft, index, onBuy }) => {
  const { convertPOLToUSD, polPrice } = usePOLPrice();
  const { imageUrl, isLoading: imageLoading, error: imageError } = useImageCache(nft.image);
  const isMobile = useIsMobile();

  const handleBuyClick = useCallback(() => {
    onBuy(nft);
  }, [nft, onBuy]);

  return (
    <div className="group card-interactive overflow-hidden h-full">
      {/* Imagen optimizada para móvil */}
      <div className={`${isMobile ? 'aspect-square' : 'aspect-[4/3]'} bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center relative overflow-hidden`}>
        {imageLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className={`animate-spin rounded-full border-b-2 border-purple-400 ${isMobile ? 'h-6 w-6' : 'h-10 w-10'}`}></div>
          </div>
        ) : imageError || !imageUrl ? (
          <div className="w-full h-full flex items-center justify-center">
            <span className={`opacity-50 ${isMobile ? 'text-4xl' : 'text-8xl'}`}>🖼️</span>
            {imageError && (
              <div className={`absolute bottom-2 left-2 right-2 text-red-400 bg-black/50 rounded px-2 py-1 text-center ${isMobile ? 'text-xs' : 'text-xs'}`}>
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
            decoding="async"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badge de categoría en la imagen */}
        <div className={`absolute ${isMobile ? 'top-2 left-2' : 'top-3 left-3'}`}>
          <span className={`bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full border border-white/20 ${isMobile ? 'text-xs' : 'text-xs'}`}>
            {nft.category || 'Art'}
          </span>
        </div>
        
        {/* Token ID en la esquina superior derecha */}
        <div className={`absolute ${isMobile ? 'top-2 right-2' : 'top-3 right-3'}`}>
          <span className={`bg-black/70 backdrop-blur-sm text-white/80 px-2 py-1 rounded-full border border-white/20 ${isMobile ? 'text-xs' : 'text-xs'}`}>
            #{nft.tokenId || index + 1}
          </span>
        </div>
      </div>
      
      {/* Contenido optimizado para móvil */}
      <div className={`${isMobile ? 'p-3 space-y-3' : 'p-5 space-y-4'}`}>
        {/* Título y descripción */}
        <div>
          <h3 className={`font-bold text-white mb-2 line-clamp-2 leading-tight ${isMobile ? 'text-sm' : 'text-lg'}`}>
            {nft.name || `NFT #${nft.tokenId || index + 1}`}
          </h3>
          {nft.description && !isMobile && (
            <p className="text-sm text-white/60 line-clamp-2 leading-relaxed">
              {nft.description}
            </p>
          )}
        </div>
        
        {/* Información del vendedor - Solo en desktop */}
        {!isMobile && (
          <div className="flex items-center space-x-2 text-xs text-white/50">
            <span>Seller:</span>
            <span className="font-mono bg-white/10 px-2 py-1 rounded border border-white/20">
              {nft.seller ? `${nft.seller.slice(0, 6)}...${nft.seller.slice(-4)}` : 'Unknown'}
            </span>
          </div>
        )}
        
        {/* Precio y botón de compra - Layout optimizado para móvil */}
        {isMobile ? (
          <div className="space-y-3">
            {/* Precio centrado en móvil */}
            <div className="text-center">
              <p className="text-xs text-white/60 mb-1">Price</p>
              <div className="text-lg font-bold text-white">
                {nft.priceInEth ? (nft.priceInEth < 0.01 ? nft.priceInEth.toFixed(6) : nft.priceInEth.toFixed(2)) : '0.10'} POL
              </div>
              <div className="text-xs text-white/40">
                {polPrice ? `≈ ${convertPOLToUSD(nft.priceInEth || 0.1)}` : '≈ Loading...'}
              </div>
            </div>
            {/* Botón de compra ancho y centrado */}
            <button 
              onClick={handleBuyClick}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 text-sm"
            >
              Buy Now
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-end">
            <div className="min-w-0 flex-1 mr-4">
              <p className="text-xs text-white/60 mb-1">Price</p>
              <div className="text-xl font-bold text-white">
                {nft.priceInEth ? (nft.priceInEth < 0.01 ? nft.priceInEth.toFixed(6) : nft.priceInEth.toFixed(2)) : '0.10'} POL
              </div>
              <div className="text-sm text-white/40">
                {polPrice ? `≈ ${convertPOLToUSD(nft.priceInEth || 0.1)}` : '≈ Loading...'}
              </div>
            </div>
            <button 
              onClick={handleBuyClick}
              className="px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 flex-shrink-0"
            >
              Buy Now
            </button>
          </div>
        )}
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