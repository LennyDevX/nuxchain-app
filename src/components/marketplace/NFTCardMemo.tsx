import React, { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { MarketplaceNFT } from '../../types/marketplace';
import { usePOLPrice } from '../../hooks/coingecko/usePOLPriceContext';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';
import { useTapFeedback } from '../../hooks/mobile/useTapFeedback';
import { generateImageSrcSet, IMAGE_SIZES } from '../../utils/images/imageOptimization';
import { ResponsiveImage } from '../ui/ResponsiveImage';

interface NFTCardProps {
  nft: MarketplaceNFT;
  index: number;
  onBuy: (nft: MarketplaceNFT) => void;
}

const NFTCardMemo: React.FC<NFTCardProps> = memo(({ nft, index, onBuy }) => {
  const { convertPOLToUSD, polPrice } = usePOLPrice();
  const isMobile = useIsMobile();

  // ✅ Haptic feedback
  const triggerHaptic = useTapFeedback();

  const handleBuyClick = useCallback(() => {
    triggerHaptic('medium'); // ✅ Haptic feedback when clicking buy
    onBuy(nft);
  }, [nft, onBuy, triggerHaptic]);

  return (
    <motion.div
      className="group card-interactive overflow-hidden h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 30 }}
      whileHover={{ y: -4 }}
    >
      {/* Imagen optimizada con ResponsiveImage */}
      <div className={`relative overflow-hidden`}>
        <ResponsiveImage
          src={nft.image}
          alt={nft.name || `NFT #${nft.tokenId || index + 1}`}
          mobileSize={`w-full ${isMobile ? 'aspect-square' : 'aspect-[4/3]'}`}
          tabletSize={`md:w-full md:${isMobile ? 'aspect-square' : 'aspect-[4/3]'}`}
          desktopSize={`lg:w-full lg:${isMobile ? 'aspect-square' : 'aspect-[4/3]'}`}
          className="bg-gradient-to-br from-purple-500/20 to-blue-500/20"
          objectFit="cover"
          srcSet={generateImageSrcSet(nft.image)}
          sizes={IMAGE_SIZES.nft.mobile}
        />
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
            <motion.button
              onClick={handleBuyClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 text-sm active:scale-95 transition-transform"
            >
              Buy Now
            </motion.button>
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
            <motion.button
              onClick={handleBuyClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 flex-shrink-0 active:scale-95 transition-transform"
            >
              Buy Now
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
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