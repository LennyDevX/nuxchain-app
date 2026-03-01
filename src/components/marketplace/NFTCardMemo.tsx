import React, { memo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import type { MarketplaceNFT } from '../../types/marketplace';
import { usePOLPrice } from '../../hooks/coingecko/usePOLPriceContext';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';
import { useTapFeedback } from '../../hooks/mobile/useTapFeedback';
import { generateImageSrcSet, IMAGE_SIZES } from '../../utils/images/imageOptimization';
import { ResponsiveImage } from '../ui/ResponsiveImage';
import { NFTDetailsModal } from './NFTDetailsModal';

interface NFTCardProps {
  nft: MarketplaceNFT;
  index: number;
  onBuy: (nft: MarketplaceNFT) => void;
}

const NFTCardMemo: React.FC<NFTCardProps> = memo(({ nft, index, onBuy }) => {
  const { convertPOLToUSD, polPrice } = usePOLPrice();
  const isMobile = useIsMobile();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const triggerHaptic = useTapFeedback();

  const handleBuyClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('medium');
    onBuy(nft);
  }, [nft, onBuy, triggerHaptic]);

  const handleDetailsClick = useCallback(() => {
    triggerHaptic('light');
    setShowDetailsModal(true);
  }, [triggerHaptic]);

  const handleCloseModal = useCallback(() => {
    setShowDetailsModal(false);
  }, []);

  return (
    <>
      <motion.div
        className="group card-interactive overflow-hidden h-full flex flex-col rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-white/10 shadow-2xl hover:border-purple-500/50 hover:shadow-purple-500/25 transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 30 }}
        whileHover={{ y: -4 }}
      >
        {/* Image Section */}
        <div className="relative overflow-hidden flex-1">
          <ResponsiveImage
            src={nft.image}
            alt={nft.name || `NFT #${nft.tokenId || index + 1}`}
            mobileSize="w-full aspect-square"
            tabletSize="md:w-full md:aspect-[4/3]"
            desktopSize="lg:w-full lg:aspect-[4/3]"
            className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 w-full h-full"
            objectFit="cover"
            srcSet={generateImageSrcSet(nft.image)}
            sizes={IMAGE_SIZES.nft.mobile}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badge de categoría */}
          <div className={`absolute ${isMobile ? 'top-2 left-2' : 'top-3 left-3'}`}>
            <span className={`bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full border border-white/20 jersey-20-regular text-xs`}>
              {nft.category || 'Art'}
            </span>
          </div>

          {/* Token ID */}
          <div className={`absolute ${isMobile ? 'top-2 right-2' : 'top-3 right-3'}`}>
            <span className={`bg-black/70 backdrop-blur-sm text-white/80 px-2 py-1 rounded-full border border-white/20 jersey-20-regular text-xs`}>
              #{nft.tokenId || index + 1}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className={`${isMobile ? 'p-3 space-y-3' : 'p-5 space-y-4'}`}>
          {/* Title and Description */}
          <div>
            <h3 className={`jersey-15-regular text-white mb-2 line-clamp-2 leading-tight ${isMobile ? 'text-base' : 'text-lg md:text-xl'}`}>
              {nft.name || `NFT #${nft.tokenId || index + 1}`}
            </h3>
            {nft.description && !isMobile && (
              <p className="jersey-20-regular text-sm md:text-base text-white/60 line-clamp-2 leading-relaxed">
                {nft.description}
              </p>
            )}
          </div>

          {/* Seller Info */}
          {!isMobile && (
            <div className="flex items-center space-x-2 text-xs text-white/50">
              <span className="jersey-20-regular">Seller:</span>
              <span className="jersey-20-regular font-mono bg-white/10 px-2 py-1 rounded border border-white/20">
                {nft.seller ? `${nft.seller.slice(0, 6)}...${nft.seller.slice(-4)}` : 'Unknown'}
              </span>
            </div>
          )}

          {/* Price and Actions */}
          {isMobile ? (
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="text-center">
                <p className="jersey-20-regular text-xs text-white/60 mb-1">Price</p>
                <div className="jersey-15-regular text-lg md:text-xl text-white">
                  {nft.priceInEth ? (nft.priceInEth < 0.01 ? nft.priceInEth.toFixed(6) : nft.priceInEth.toFixed(2)) : '0.10'} POL
                </div>
                <div className="jersey-20-regular text-xs text-white/40">
                  {polPrice ? `≈ ${convertPOLToUSD(nft.priceInEth || 0.1)}` : '≈ Loading...'}
                </div>
              </div>
              <div className="flex gap-2">
                <motion.button
                  onClick={handleDetailsClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg jersey-20-regular text-sm md:text-base transition-all duration-200"
                >
                  Details
                </motion.button>
                <motion.button
                  onClick={handleBuyClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg jersey-20-regular text-sm md:text-base hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 active:scale-95"
                >
                  Buy
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-white/10 space-y-3">
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                  <p className="jersey-20-regular text-xs text-white/60 mb-1">Price</p>
                  <div className="jersey-15-regular text-xl md:text-2xl text-white">
                    {nft.priceInEth ? (nft.priceInEth < 0.01 ? nft.priceInEth.toFixed(6) : nft.priceInEth.toFixed(2)) : '0.10'} POL
                  </div>
                  <div className="jersey-20-regular text-sm text-white/40">
                    {polPrice ? `≈ ${convertPOLToUSD(nft.priceInEth || 0.1)}` : '≈ Loading...'}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <motion.button
                  onClick={handleDetailsClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg jersey-20-regular text-sm md:text-base transition-all duration-200"
                >
                  Details
                </motion.button>
                <motion.button
                  onClick={handleBuyClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg jersey-20-regular text-sm md:text-base hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 active:scale-95"
                >
                  Buy Now
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Details Modal */}
      <NFTDetailsModal 
        nft={nft}
        isOpen={showDetailsModal}
        onClose={handleCloseModal}
        onBuy={onBuy}
      />
    </>
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