import { memo, useCallback, useState } from 'react';
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

function NFTCard({ nft, onListNFT }: NFTCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const { imageUrl, error: imageError } = useImageCache(nft.image);
  const { convertPOLToUSD } = usePOLPrice();
  
  const handleListNFT = useCallback(() => {
    onListNFT(nft.tokenId);
  }, [onListNFT, nft.tokenId]);

  const handleFlip = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  }, [isFlipped]);

  // Touch handlers for mobile swipe-to-flip
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
    
    // Swipe left to flip, swipe right to unflip
    if (isLeftSwipe && !isFlipped) {
      setIsFlipped(true);
    } else if (isRightSwipe && isFlipped) {
      setIsFlipped(false);
    }
  }, [touchStart, touchEnd, isFlipped]);

  // Format price for display with POL and USD
  const pricePOL = nft.price ? Number(formatEther(nft.price)) : 0;
  const priceUSD = convertPOLToUSD(pricePOL);
  const formattedPricePOL = pricePOL > 0 ? `${formatPolValue(pricePOL)} POL` : null;
  const formattedPriceUSD = pricePOL > 0 && priceUSD ? `${priceUSD}` : null;

  // Format attribute value with special handling for wallets and dates
  const formatAttributeValue = (traitType: string, value: string | number): string => {
    const lowerTraitType = traitType.toLowerCase();
    const valueStr = String(value);
    
    // Truncate wallet addresses
    if (lowerTraitType.includes('creator') || lowerTraitType.includes('wallet') || lowerTraitType.includes('address')) {
      if (valueStr.startsWith('0x') && valueStr.length === 42) {
        return `${valueStr.slice(0, 6)}...${valueStr.slice(-4)}`;
      }
    }
    
    // Format dates
    if (lowerTraitType.includes('created') || lowerTraitType.includes('date') || lowerTraitType.includes('time')) {
      // Try to parse as timestamp or date string
      const date = new Date(isNaN(Number(valueStr)) ? valueStr : Number(valueStr) * 1000);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    }
    
    return valueStr;
  };

  return (
    <div 
      className="group relative w-full cursor-pointer"
      onClick={handleFlip}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ perspective: '1500px', aspectRatio: '3/4' }}
    >
      <div 
        className="relative w-full h-full transition-all duration-700"
        style={{ 
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* FRONT SIDE - Image Prominent Design */}
        <div 
          className="absolute w-full h-full"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Main Card Container */}
          <div className="h-full w-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-white/10 shadow-2xl transition-all duration-300 group-hover:border-purple-500/50 group-hover:shadow-purple-500/25 flex flex-col">
            
            {/* Large Hero Image */}
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
                    alt={nft.name || `NFT #${nft.tokenId}`}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />
                  {/* Gradient Overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60"></div>
                </>
              )}

              {/* Floating Badges - Top */}
              <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex items-start justify-between z-10">
                {/* Token ID Badge */}
                <div className="backdrop-blur-xl bg-black/80 border border-white/20 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 shadow-lg">
                  <span className="text-[10px] sm:text-xs font-bold text-white">#{nft.tokenId}</span>
                </div>
                
                {/* For Sale Badge - Only if listed */}
                {nft.isForSale && (
                  <div className="backdrop-blur-xl bg-gradient-to-r from-emerald-500 to-green-500 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 shadow-lg animate-pulse">
                    <span className="text-[10px] sm:text-xs font-bold text-white flex items-center gap-0.5 sm:gap-1">
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                      LISTED
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Info Overlay - On Image */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-10">
                {/* Price or CTA - Different layout based on listing status */}
                {nft.isForSale && nft.price ? (
                  <div className="backdrop-blur-xl bg-black/60 border border-white/20 rounded-xl p-2 sm:p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] sm:text-xs text-gray-300 mb-0.5 sm:mb-1">Current Price</p>
                        <p className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 truncate">
                          {formattedPricePOL}
                        </p>
                        {formattedPriceUSD && (
                          <p className="text-[10px] sm:text-xs text-emerald-400 font-medium truncate">≈ {formattedPriceUSD}</p>
                        )}
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleFlip(e); }}
                        className="backdrop-blur-xl bg-purple-600/80 hover:bg-purple-500 active:bg-purple-700 border border-purple-400/50 rounded-lg px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation whitespace-nowrap"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleListNFT(); }}
                    className="w-full backdrop-blur-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 active:from-purple-700 active:to-blue-700 border border-purple-400/50 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    List for Sale
                  </button>
                )}
              </div>

              {/* View Details Hint - Top Right Corner when not listed */}
              {!nft.isForSale && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleFlip(e); }}
                  className="absolute top-2 sm:top-3 right-2 sm:right-3 backdrop-blur-xl bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 rounded-full p-1.5 sm:p-2 transition-all duration-200 hover:scale-110 active:scale-95 z-10 touch-manipulation"
                  title="View Details"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Compact Info Bar at Bottom */}
            <div className="px-3 sm:px-4 py-2 sm:py-3 bg-black/40 backdrop-blur-sm border-t border-white/10">
              <div className="flex items-center justify-between text-[10px] sm:text-xs">
                <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400 min-w-0 flex-1">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-mono truncate">{nft.owner?.slice(0, 4)}...{nft.owner?.slice(-3)}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleFlip(e); }}
                  className="text-purple-400 hover:text-purple-300 active:text-purple-500 font-medium flex items-center gap-0.5 sm:gap-1 transition-colors touch-manipulation whitespace-nowrap"
                >
                  <span className="hidden sm:inline">View More</span>
                  <span className="sm:hidden">More</span>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* BACK SIDE - Detailed Info with Beautiful Layout */}
        <div 
          className="absolute w-full h-full top-0 left-0 rounded-2xl"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/40 via-gray-900 to-black border border-purple-500/30 shadow-2xl h-full w-full flex flex-col">
            {/* Decorative Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '32px 32px'
              }}></div>
            </div>

            {/* Fixed Header */}
            <div className="relative p-3 sm:p-4 border-b border-white/10 bg-black/20 backdrop-blur-sm flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg flex-shrink-0">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-bold text-white truncate">NFT Details</h3>
                    <p className="text-[9px] sm:text-[10px] text-purple-300">#{nft.tokenId}</p>
                  </div>
                </div>
                <button 
                  onClick={handleFlip}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 touch-manipulation flex-shrink-0 ml-2"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="relative flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                {/* NFT Title & Description Card - Compact */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-2.5 sm:p-3">
                  <h4 className="text-xs sm:text-sm font-bold text-white mb-1 line-clamp-1">
                    {nft.name || `NFT #${nft.tokenId}`}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-gray-300 leading-snug line-clamp-2">
                    {nft.description || 'No description available for this NFT.'}
                  </p>
                </div>

                {/* Price Info (if listed) - Compact */}
                {nft.isForSale && nft.price && (
                  <div className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 border border-emerald-500/40 rounded-lg p-2.5 sm:p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 mb-1">
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                        <span className="text-[10px] sm:text-xs text-emerald-300 font-semibold">Price</span>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-base sm:text-lg font-bold text-white truncate">
                        {formattedPricePOL}
                      </p>
                      {formattedPriceUSD && (
                        <p className="text-[10px] sm:text-xs text-emerald-400 font-medium truncate">
                          ≈ {formattedPriceUSD}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Owner Info Cards - More Compact */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gradient-to-br from-purple-600/20 to-purple-600/5 border border-purple-500/30 rounded-lg p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="text-[9px] sm:text-[10px] text-purple-300 font-semibold">Creator</span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-white font-mono bg-purple-600/20 px-1.5 py-0.5 rounded truncate">
                      {nft.creator?.slice(0, 5)}...{nft.creator?.slice(-3)}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-600/20 to-blue-600/5 border border-blue-500/30 rounded-lg p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-[9px] sm:text-[10px] text-blue-300 font-semibold">Owner</span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-white font-mono bg-blue-600/20 px-1.5 py-0.5 rounded truncate">
                      {nft.owner?.slice(0, 5)}...{nft.owner?.slice(-3)}
                    </p>
                  </div>
                </div>

                {/* Attributes Section - Optimized Grid */}
                {nft.attributes && nft.attributes.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <h5 className="text-[10px] sm:text-xs font-bold text-white">Attributes</h5>
                      <span className="ml-auto text-[9px] sm:text-[10px] text-purple-400 bg-purple-600/20 px-1.5 py-0.5 rounded-full flex-shrink-0">
                        {nft.attributes.length}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
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
                                : 'bg-gradient-to-br from-white/10 to-white/5 border-white/20'
                            } border rounded-md p-1.5 sm:p-2 transition-all duration-200 hover:scale-105 active:scale-95 hover:border-purple-400/50 touch-manipulation`}
                          >
                            <p className="text-[9px] sm:text-[10px] text-gray-400 mb-0.5 truncate">{attr.trait_type}</p>
                            <p className={`text-[10px] sm:text-xs font-bold text-white truncate ${isSpecialAttr ? 'font-mono text-purple-300' : ''}`}>
                              {formattedValue}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fixed Footer Button */}
            <div className="relative p-3 sm:p-4 border-t border-white/10 bg-black/20 backdrop-blur-sm flex-shrink-0">
              <button
                onClick={handleFlip}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 active:from-purple-700 active:to-pink-700 border border-purple-400/50 rounded-lg px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-white font-semibold transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-1.5 touch-manipulation"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                Back to NFT
              </button>
            </div>
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
    prevProps.nft.description === nextProps.nft.description &&
    prevProps.nft.attributes === nextProps.nft.attributes &&
    prevProps.onListNFT === nextProps.onListNFT &&
    prevProps.isMobile === nextProps.isMobile
  );
});