import { memo, useCallback, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useImageCache } from '../../hooks/cache/useImageCache';
import { formatEther } from 'viem';
import { formatPolValue } from '../../utils/formats/format';
import usePOLPrice from '../../hooks/coingecko/usePOLPrice';
import { generateImageSrcSet, IMAGE_SIZES } from '../../utils/images/imageOptimization';

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

interface NFTCardMobileProps {
  nft: NFTData;
  onListNFT: (tokenId: string) => void;
}

function NFTCardMobile({ nft, onListNFT }: NFTCardMobileProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const { imageUrl, error: imageError } = useImageCache(nft.image);
  const { convertPOLToUSD } = usePOLPrice();
  
  const handleListNFT = useCallback(() => {
    onListNFT(nft.tokenId);
  }, [onListNFT, nft.tokenId]);

  const handleFlip = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation();
    setIsFlipped(!isFlipped);
    setCurrentSlide(0); // Reset carousel when flipping
  }, [isFlipped]);

  // Scroll to slide helper
  const scrollToSlide = useCallback((slideIndex: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollWidth = container.scrollWidth / 3;
      container.scrollTo({
        left: slideIndex * scrollWidth,
        behavior: 'smooth'
      });
    }
  }, []);

  const goToSlide = useCallback((slideIndex: number) => {
    setCurrentSlide(slideIndex);
    scrollToSlide(slideIndex);
  }, [scrollToSlide]);

  // Touch handlers for carousel swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    const maxSlides = 3;
    let newSlide = currentSlide;

    if (isLeftSwipe && currentSlide < maxSlides - 1) {
      newSlide = currentSlide + 1;
    } else if (isRightSwipe && currentSlide > 0) {
      newSlide = currentSlide - 1;
    }

    if (newSlide !== currentSlide) {
      setCurrentSlide(newSlide);
      scrollToSlide(newSlide);
    }
  }, [touchStart, touchEnd, currentSlide, scrollToSlide]);

  // Format price
  const pricePOL = nft.price ? Number(formatEther(nft.price)) : 0;
  const priceUSD = convertPOLToUSD(pricePOL);
  const formattedPricePOL = pricePOL > 0 ? `${formatPolValue(pricePOL)} POL` : null;
  const formattedPriceUSD = pricePOL > 0 && priceUSD ? `${priceUSD}` : null;

  // Format attribute value
  const formatAttributeValue = (traitType: string, value: string | number): string => {
    const lowerTraitType = traitType.toLowerCase();
    const valueStr = String(value);
    
    if (lowerTraitType.includes('creator') || lowerTraitType.includes('wallet') || lowerTraitType.includes('address')) {
      if (valueStr.startsWith('0x') && valueStr.length === 42) {
        return `${valueStr.slice(0, 6)}...${valueStr.slice(-4)}`;
      }
    }
    
    if (lowerTraitType.includes('created') || lowerTraitType.includes('date') || lowerTraitType.includes('time')) {
      const date = new Date(isNaN(Number(valueStr)) ? valueStr : Number(valueStr) * 1000);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    }
    
    return valueStr;
  };

  return (
    <motion.div 
      className="group relative w-full cursor-pointer"
      onClick={handleFlip}
      style={{ perspective: '1500px', aspectRatio: '3/5' }}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 300, damping: 25 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
    >
      <div 
        className="relative w-full h-full transition-all duration-700"
        style={{ 
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* FRONT SIDE - Image Only */}
        <div 
          className="absolute w-full h-full"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="h-full w-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-white/10 shadow-2xl transition-all duration-300 group-hover:border-purple-500/50 group-hover:shadow-purple-500/25 flex flex-col">
            {/* Hero Image - Full */}
            <div className="relative flex-1 overflow-hidden">
              {imageError || !imageUrl ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                  <svg className="w-24 h-24 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              ) : (
                <>
                  <img
                    src={imageUrl}
                    srcSet={generateImageSrcSet(imageUrl)}
                    alt={nft.name || `NFT #${nft.tokenId}`}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                    sizes={IMAGE_SIZES.nft.mobile}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-40"></div>
                </>
              )}

              {/* Floating Badges - Top */}
              <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
                <div className="backdrop-blur-xl bg-black/80 border border-white/20 rounded-full px-3 py-1.5 shadow-lg">
                  <span className="text-xs font-bold text-white">#{nft.tokenId}</span>
                </div>
                
                {nft.isForSale && (
                  <div className="backdrop-blur-xl bg-gradient-to-r from-emerald-500 to-green-500 rounded-full px-3 py-1.5 shadow-lg animate-pulse">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                      LISTED
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Text Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 z-10 bg-gradient-to-t from-black via-black/60 to-transparent">
                <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
                  {nft.name || `NFT #${nft.tokenId}`}
                </h3>
                <p className="text-xs text-gray-300 line-clamp-2">
                  {nft.description || 'Toca para ver detalles'}
                </p>
              </div>

              {/* Flip Hint */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-12 h-12 text-white/60 animate-bounce mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <p className="text-[10px] text-white/60 mt-2 font-medium">Toca para voltear</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BACK SIDE - Carousel with 3 Info Slides */}
        <div 
          className="absolute w-full h-full top-0 left-0 rounded-2xl"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/40 via-gray-900 to-black border border-purple-500/30 shadow-2xl h-full w-full flex flex-col">
            {/* Fixed Header */}
            <div className="relative p-3 border-b border-white/10 bg-black/20 backdrop-blur-sm flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-white truncate">NFT Details</h3>
                    <p className="text-[9px] text-purple-300">#{nft.tokenId}</p>
                  </div>
                </div>
                <button 
                  onClick={handleFlip}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 touch-manipulation flex-shrink-0"
                >
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Carousel Container - Each slide takes 100% width */}
            <div
              ref={scrollContainerRef}
              className="flex-1 flex overflow-x-hidden snap-x snap-mandatory scroll-smooth"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* SLIDE 1 - Main Description & Price */}
              <div className="min-w-full h-full snap-start overflow-y-auto custom-scrollbar flex flex-col">
                <div className="p-4 space-y-4 flex flex-col flex-1">
                  {/* Title Section */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{nft.name || `NFT #${nft.tokenId}`}</h3>
                    <p className="text-xs text-purple-300/70 font-mono">ID: {nft.tokenId}</p>
                  </div>

                  {/* Description */}
                  {nft.description && (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex-1">
                      <h4 className="text-xs font-semibold text-gray-400 mb-2">About</h4>
                      <p className="text-sm text-white leading-relaxed">
                        {nft.description}
                      </p>
                    </div>
                  )}

                  {/* Price - Prominent Display */}
                  {nft.isForSale && nft.price && (
                    <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-600/10 border border-emerald-500/40 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-semibold text-emerald-300">Current Price</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-3xl font-bold text-white">{formattedPricePOL}</p>
                        {formattedPriceUSD && (
                          <p className="text-base text-emerald-400 font-medium">≈ {formattedPriceUSD}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CTA Button for Unlisted */}
                  {!nft.isForSale && (
                    <motion.button 
                      onClick={(e) => { e.stopPropagation(); handleListNFT(); }}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 active:from-purple-700 active:to-blue-700 border border-purple-400/50 rounded-lg px-4 py-3 text-base font-bold text-white flex items-center justify-center gap-2 touch-manipulation"
                      whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)' }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      List for Sale
                    </motion.button>
                  )}
                </div>
              </div>

              {/* SLIDE 2 - Addresses & Identities */}
              <div className="min-w-full h-full snap-start overflow-y-auto custom-scrollbar flex flex-col">
                <div className="p-4 space-y-4 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-white">Details</h3>

                  {/* Creator Card */}
                  <div className="bg-gradient-to-br from-purple-600/20 to-purple-600/5 border border-purple-500/40 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <p className="text-sm font-semibold text-purple-300">Creator</p>
                    </div>
                    <p className="text-sm text-white font-mono bg-purple-600/30 px-3 py-2 rounded break-all">
                      {nft.creator}
                    </p>
                  </div>

                  {/* Owner Card */}
                  <div className="bg-gradient-to-br from-blue-600/20 to-blue-600/5 border border-blue-500/40 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <p className="text-sm font-semibold text-blue-300">Owner</p>
                    </div>
                    <p className="text-sm text-white font-mono bg-blue-600/30 px-3 py-2 rounded break-all">
                      {nft.owner}
                    </p>
                  </div>

                  {/* Contract Address */}
                  <div className="bg-gradient-to-br from-indigo-600/20 to-indigo-600/5 border border-indigo-500/40 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <p className="text-sm font-semibold text-indigo-300">Contract</p>
                    </div>
                    <p className="text-xs text-white font-mono bg-indigo-600/30 px-3 py-2 rounded break-all">
                      {nft.contract}
                    </p>
                  </div>
                </div>
              </div>

              {/* SLIDE 3 - Attributes Full Display */}
              <div className="min-w-full h-full snap-start overflow-y-auto custom-scrollbar flex flex-col">
                <div className="p-4 space-y-4 flex flex-col flex-1">
                  {nft.attributes && nft.attributes.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <h3 className="text-lg font-bold text-white">Attributes</h3>
                        </div>
                        <span className="text-sm text-purple-300 bg-purple-600/30 px-3 py-1 rounded-full font-medium">
                          {nft.attributes.length}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {nft.attributes.map((attr: NFTAttribute, index: number) => {
                          const isSpecialAttr = attr.trait_type.toLowerCase().includes('creator') || 
                                               attr.trait_type.toLowerCase().includes('created');
                          const formattedValue = formatAttributeValue(attr.trait_type, attr.value);
                          
                          return (
                            <div 
                              key={index} 
                              className={`${
                                isSpecialAttr 
                                  ? 'bg-gradient-to-br from-purple-600/30 to-pink-600/20 border-purple-400/50' 
                                  : 'bg-white/5 border-white/10'
                              } border rounded-lg p-3 transition-all duration-200 hover:border-purple-400/50 hover:bg-white/10 touch-manipulation`}
                            >
                              <p className="text-[10px] text-gray-400 mb-1.5 font-medium">{attr.trait_type}</p>
                              <p className={`text-sm font-bold break-words ${isSpecialAttr ? 'text-purple-300 font-mono' : 'text-white'}`}>
                                {formattedValue}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <svg className="w-12 h-12 text-white/30 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <p className="text-base text-white/60 font-medium">No attributes available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Carousel Indicators - Fixed Bottom */}
            <div className="relative p-3 border-t border-white/10 bg-black/20 backdrop-blur-sm flex-shrink-0 flex items-center justify-center gap-2">
              <motion.button
                onClick={(e) => { e.stopPropagation(); goToSlide(0); }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === 0 ? 'bg-purple-500 w-6' : 'bg-white/40 w-2'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300 }}
              />
              <motion.button
                onClick={(e) => { e.stopPropagation(); goToSlide(1); }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === 1 ? 'bg-purple-500 w-6' : 'bg-white/40 w-2'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300 }}
              />
              <motion.button
                onClick={(e) => { e.stopPropagation(); goToSlide(2); }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === 2 ? 'bg-purple-500 w-6' : 'bg-white/40 w-2'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300 }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default memo(NFTCardMobile, (prevProps, nextProps) => {
  return (
    prevProps.nft.uniqueId === nextProps.nft.uniqueId &&
    prevProps.nft.isForSale === nextProps.nft.isForSale &&
    prevProps.nft.price === nextProps.nft.price &&
    prevProps.nft.image === nextProps.nft.image &&
    prevProps.nft.name === nextProps.nft.name &&
    prevProps.nft.description === nextProps.nft.description &&
    prevProps.nft.attributes === nextProps.nft.attributes &&
    prevProps.onListNFT === nextProps.onListNFT
  );
});