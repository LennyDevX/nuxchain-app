import React, { memo, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MarketplaceNFT } from '../../types/marketplace';
import { usePOLPrice } from '../../hooks/coingecko/usePOLPriceContext';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';
import { useTapFeedback } from '../../hooks/mobile/useTapFeedback';
import { generateImageSrcSet, IMAGE_SIZES } from '../../utils/images/imageOptimization';
import { ResponsiveImage } from '../ui/ResponsiveImage';
import { CopyIcon, CheckIcon, XIcon, RepeatIcon } from '../ui/CustomIcons';

interface NFTCardProps {
  nft: MarketplaceNFT;
  index: number;
  onBuy: (nft: MarketplaceNFT) => void;
}

const NFTCardMemo: React.FC<NFTCardProps> = memo(({ nft, index, onBuy }) => {
  const { convertPOLToUSD, polPrice } = usePOLPrice();
  const isMobile = useIsMobile();
  const [isFlipped, setIsFlipped] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // ✅ Haptic feedback
  const triggerHaptic = useTapFeedback();

  const handleBuyClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip when clicking buy
    triggerHaptic('medium'); // ✅ Haptic feedback when clicking buy
    onBuy(nft);
  }, [nft, onBuy, triggerHaptic]);

  const handleFlip = useCallback(() => {
    triggerHaptic('light');
    setIsFlipped(!isFlipped);
  }, [isFlipped, triggerHaptic]);

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(label);
      triggerHaptic('light');
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [triggerHaptic]);

  const formatAddress = (address: string | undefined) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <motion.div
      className="group card-interactive overflow-hidden h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 30 }}
      whileHover={{ y: -4 }}
      style={{ 
        perspective: '1000px',
      }}
    >
      {/* Contenedor 3D con rotación */}
      <motion.div
        className="relative w-full h-full flex flex-col"
        style={{ 
          transformStyle: 'preserve-3d'
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* FRONT SIDE - Siempre presente en el DOM */}
        <div
          className="w-full h-full flex flex-col cursor-pointer relative"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
          onClick={handleFlip}
        >
          {/* Flip indicator */}
          <motion.div 
            className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-sm rounded-full p-2 border border-white/20"
            whileHover={{ scale: 1.1 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <RepeatIcon className="w-4 h-4 text-white/80" />
          </motion.div>

          {/* Imagen optimizada con ResponsiveImage */}
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

          {/* Hint to flip */}
          <div className="absolute bottom-2 left-0 right-0 text-center">
            <p className="text-xs text-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Click to see details
            </p>
          </div>
        </div>

        {/* BACK SIDE - Siempre presente en el DOM, rotado 180deg */}
        <div
          className="absolute inset-0 w-full h-full flex flex-col"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 border border-white/10 rounded-lg overflow-hidden flex flex-col">
            {/* Header with close button */}
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm border-b border-white/10 p-4 flex justify-between items-start flex-shrink-0">
              <div className="flex-1 min-w-0 pr-4">
                <h3 className={`font-bold text-white mb-1 line-clamp-1 ${isMobile ? 'text-sm' : 'text-lg'}`}>
                  {nft.name || `NFT #${nft.tokenId || index + 1}`}
                </h3>
                <p className="text-xs text-white/60">Token #{nft.tokenId || index + 1}</p>
              </div>
              <motion.button
                onClick={handleFlip}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="flex-shrink-0 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <XIcon className="w-4 h-4 text-white" />
              </motion.button>
            </div>

            {/* Scrollable content */}
            <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-3 space-y-3' : 'p-5 space-y-5'}`}>
              
              {/* About Section */}
              {nft.description && (
                <div>
                  <h4 className="text-sm font-semibold text-white/80 mb-2 flex items-center">
                    <span className="w-1 h-4 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full mr-2"></span>
                    About
                  </h4>
                  <p className="text-sm text-white/70 leading-relaxed">
                    {nft.description}
                  </p>
                </div>
              )}

              {/* Details Section */}
              <div>
                <h4 className="text-sm font-semibold text-white/80 mb-3 flex items-center">
                  <span className="w-1 h-4 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full mr-2"></span>
                  Details
                </h4>
                <div className="space-y-2">
                  {/* Creator */}
                  {nft.creator && (
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-purple-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-purple-300 mb-1">Creator</p>
                          <p className="text-sm text-white font-mono truncate">
                            {formatAddress(nft.creator)}
                          </p>
                        </div>
                        <motion.button
                          onClick={() => copyToClipboard(nft.creator!, 'creator')}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="ml-2 p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors flex-shrink-0"
                        >
                          {copiedAddress === 'creator' ? (
                            <CheckIcon className="w-4 h-4 text-green-400" />
                          ) : (
                            <CopyIcon className="w-4 h-4 text-purple-300" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                  )}

                  {/* Owner */}
                  {nft.owner && (
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-blue-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-blue-300 mb-1">Owner</p>
                          <p className="text-sm text-white font-mono truncate">
                            {formatAddress(nft.owner)}
                          </p>
                        </div>
                        <motion.button
                          onClick={() => copyToClipboard(nft.owner, 'owner')}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="ml-2 p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors flex-shrink-0"
                        >
                          {copiedAddress === 'owner' ? (
                            <CheckIcon className="w-4 h-4 text-green-400" />
                          ) : (
                            <CopyIcon className="w-4 h-4 text-blue-300" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                  )}

                  {/* Contract */}
                  {nft.contract && (
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-indigo-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-indigo-300 mb-1">Contract</p>
                          <p className="text-sm text-white font-mono truncate">
                            {formatAddress(nft.contract)}
                          </p>
                        </div>
                        <motion.button
                          onClick={() => copyToClipboard(nft.contract!, 'contract')}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="ml-2 p-2 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg transition-colors flex-shrink-0"
                        >
                          {copiedAddress === 'contract' ? (
                            <CheckIcon className="w-4 h-4 text-green-400" />
                          ) : (
                            <CopyIcon className="w-4 h-4 text-indigo-300" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                  )}

                  {/* Listed Date */}
                  {nft.listedTimestamp && (
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                      <p className="text-xs text-white/60 mb-1">Listed On</p>
                      <p className="text-sm text-white">
                        {formatDate(nft.listedTimestamp)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Attributes Section */}
              {nft.attributes && nft.attributes.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white/80 mb-3 flex items-center">
                    <span className="w-1 h-4 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full mr-2"></span>
                    Attributes
                  </h4>
                  <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
                    {nft.attributes.map((attr, idx) => {
                      const isSpecial = ['creator', 'created', 'skill', 'rarity'].includes(attr.trait_type.toLowerCase());
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`bg-white/5 backdrop-blur-sm rounded-lg p-3 border ${
                            isSpecial 
                              ? 'border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10' 
                              : 'border-white/10'
                          }`}
                        >
                          <p className={`text-xs mb-1 ${isSpecial ? 'text-purple-300' : 'text-white/60'}`}>
                            {attr.trait_type}
                          </p>
                          <p className={`text-sm font-semibold truncate ${isSpecial ? 'text-white' : 'text-white/90'}`}>
                            {attr.value}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Price Info on Back */}
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20">
                <p className="text-xs text-white/60 mb-2">Current Price</p>
                <div className="text-2xl font-bold text-white mb-1">
                  {nft.priceInEth ? (nft.priceInEth < 0.01 ? nft.priceInEth.toFixed(6) : nft.priceInEth.toFixed(2)) : '0.10'} POL
                </div>
                <div className="text-sm text-white/60">
                  {polPrice ? `≈ ${convertPOLToUSD(nft.priceInEth || 0.1)}` : '≈ Loading...'}
                </div>
                
                {/* Buy button on back side */}
                <motion.button
                  onClick={handleBuyClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
                >
                  Buy Now
                </motion.button>
              </div>
            </div>

            {/* Footer hint */}
            <div className="bg-white/5 backdrop-blur-sm border-t border-white/10 p-2 text-center flex-shrink-0">
              <p className="text-xs text-white/40 flex items-center justify-center gap-1">
                Click <XIcon className="w-3 h-3" /> or card to flip back
              </p>
            </div>
          </div>
        </div>
      </motion.div>
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