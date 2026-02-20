import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { formatEther } from 'viem';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';
import { usePOLPrice } from '../../hooks/coingecko/usePOLPriceContext';
import { CardSkeletonLoader } from '../ui/SkeletonLoader';

interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

interface NFTData {
  tokenId: string;
  price: bigint;
  isForSale: boolean;
  attributes?: NFTAttribute[];
}

interface NFTStatsProps {
  nfts: NFTData[];
  loading?: boolean;
}

// Helper: Check if NFT has skill attributes
function hasSkill(nft: NFTData): boolean {
  return (nft.attributes || []).some(attr =>
    attr.trait_type.toLowerCase() === 'skill' ||
    attr.trait_type.toLowerCase() === 'skilltype'
  );
}

export default memo(function NFTStats({ nfts, loading = false }: NFTStatsProps) {
  const isMobile = useIsMobile();
  const { convertPOLToUSD, polPrice } = usePOLPrice();
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate total estimated value in POL
  const totalEstimatedValuePOL = nfts.reduce((total, nft) => {
    if (nft.isForSale && nft.price) {
      return total + Number(formatEther(nft.price));
    }
    return total;
  }, 0);

  // Calculate listed for sale count
  const listedForSaleCount = nfts.filter(nft => nft.isForSale).length;

  // Calculate total NFTs count
  const totalNFTsCount = nfts.length;

  // Calculate skill NFTs vs standard NFTs
  const skillNFTsCount = nfts.filter(nft => hasSkill(nft)).length;
  const standardNFTsCount = totalNFTsCount - skillNFTsCount;

  // Format values
  const formattedTotalValuePOL = totalEstimatedValuePOL < 0.001 ? '<0.001' : totalEstimatedValuePOL.toFixed(3);
  const formattedTotalValueUSD = polPrice ? convertPOLToUSD(totalEstimatedValuePOL) : 'Loading...';
  const formattedListedCount = listedForSaleCount.toLocaleString();
  const formattedTotalCount = totalNFTsCount.toLocaleString();

  if (loading) {
    return (
      <div className={`grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-5'}`}>
        <CardSkeletonLoader count={5} showImage={false} />
      </div>
    );
  }

  // ✅ MOBILE: Versión compacta con dropdown integrado
  if (isMobile) {
    return (
      <div className="space-y-2">
        {/* Stats card con dropdown integrado */}
        <motion.div
          className="card-stats px-4 py-3 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0 }}
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Left side: Portfolio Value Info */}
          <div className="flex-1 pr-4">
            <p className="jersey-15-regular text-sm lg:text-base text-white/60 mb-1.5">Portfolio Value</p>
            <div className="space-y-0.5">
              <p className="jersey-20-regular font-bold text-white text-xl lg:text-2xl">
                {totalEstimatedValuePOL > 0 ? `${formattedTotalValuePOL} POL` : '0 POL'}
              </p>
              <p className="jersey-20-regular text-sm lg:text-base text-white/50 font-medium">
                {totalEstimatedValuePOL > 0 ? formattedTotalValueUSD : '$0.00'}
              </p>
            </div>
          </div>

          {/* Right side: Dropdown arrow */}
          <div className="flex items-center justify-center">
            <motion.div
              className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-2.5 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
            >
              <motion.svg
                className="w-5 h-5 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </motion.svg>
            </motion.div>
          </div>
        </motion.div>

        {/* Dropdown expandido - Animado */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-2">
              {/* Listed for Sale */}
              <motion.div
                className="card-stats px-3 py-3 hover:bg-white/5 transition-all duration-300"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.05, type: 'spring' }}
                whileHover={{ scale: 1.03 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="jersey-15-regular font-semibold text-white text-sm lg:text-base">Listed for Sale</h3>
                  <motion.div
                    className="bg-blue-500/20 rounded-lg flex items-center justify-center w-6 h-6"
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.3)' }}
                  >
                    <svg className="text-blue-400 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </motion.div>
                </div>
                <p className="jersey-20-regular font-bold text-white text-xl lg:text-2xl">{formattedListedCount}</p>
                <p className="jersey-20-regular text-white/60 text-sm lg:text-base">Out of {formattedTotalCount}</p>
              </motion.div>

              {/* Skill NFTs */}
              <motion.div
                className="card-stats px-3 py-3 hover:bg-white/5 transition-all duration-300"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1, type: 'spring' }}
                whileHover={{ scale: 1.03 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="jersey-15-regular font-semibold text-white text-sm lg:text-base">Skill NFTs</h3>
                  <motion.div
                    className="bg-amber-500/20 rounded-lg flex items-center justify-center w-6 h-6"
                    whileHover={{ backgroundColor: 'rgba(217, 119, 6, 0.3)' }}
                  >
                    <svg className="text-amber-400 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </motion.div>
                </div>
                <p className="jersey-20-regular font-bold text-white text-xl lg:text-2xl">{skillNFTsCount}</p>
                <p className="jersey-20-regular text-white/60 text-sm lg:text-base">With special abilities</p>
              </motion.div>

              {/* Standard NFTs */}
              <motion.div
                className="card-stats px-3 py-3 hover:bg-white/5 transition-all duration-300"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.15, type: 'spring' }}
                whileHover={{ scale: 1.03 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="jersey-15-regular font-semibold text-white text-sm lg:text-base">Standard NFTs</h3>
                  <motion.div
                    className="bg-slate-500/20 rounded-lg flex items-center justify-center w-6 h-6"
                    whileHover={{ backgroundColor: 'rgba(100, 116, 139, 0.3)' }}
                  >
                    <svg className="text-slate-400 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </motion.div>
                </div>
                <p className="jersey-20-regular font-bold text-white text-xl lg:text-2xl">{standardNFTsCount}</p>
                <p className="jersey-20-regular text-white/60 text-sm lg:text-base">Regular NFTs</p>
              </motion.div>

              {/* Total Collection */}
              <motion.div
                className="card-stats px-3 py-3 hover:bg-white/5 transition-all duration-300"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2, type: 'spring' }}
                whileHover={{ scale: 1.03 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="jersey-15-regular font-semibold text-white text-sm lg:text-base">Total Collection</h3>
                  <motion.div
                    className="bg-purple-500/20 rounded-lg flex items-center justify-center w-6 h-6"
                    whileHover={{ backgroundColor: 'rgba(168, 85, 247, 0.3)' }}
                  >
                    <svg className="text-purple-400 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </motion.div>
                </div>
                <p className="jersey-20-regular font-bold text-white text-2xl lg:text-3xl">{formattedTotalCount}</p>
                <p className="jersey-20-regular text-white/60 text-sm lg:text-base">NFTs in collection</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  // ✅ DESKTOP: Versión original en grid 5 columnas
  return (
    <div className="grid grid-cols-5 gap-2">
      {/* Total Portfolio Value */}
      <motion.div
        className="card-stats min-w-0 px-2 py-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0 }}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="jersey-15-regular font-semibold text-white text-xs md:text-xl">Total Portfolio Value</h3>
          <div className="bg-green-500/20 rounded-lg flex items-center justify-center w-7 h-7">
            <svg className="text-green-400 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>
        <div className="space-y-1">
          <p className="jersey-20-regular font-bold text-white text-base md:text-xl">
            {totalEstimatedValuePOL > 0 ? `${formattedTotalValuePOL} POL` : '0 POL'}
          </p>
          <p className="jersey-20-regular text-white/50 text-[11px] md:text-2xl">
            {totalEstimatedValuePOL > 0 ? formattedTotalValueUSD : '$0.00'}
          </p>
          <p className="jersey-20-regular text-white/60 text-[11px] md:text-xl">
            From {formattedListedCount} listed
          </p>
        </div>
      </motion.div>

      {/* Listed for Sale */}
      <motion.div
        className="card-stats min-w-0 px-2 py-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="jersey-15-regular font-semibold text-white text-xs md:text-xl">Listed for Sale</h3>
          <div className="bg-blue-500/20 rounded-lg flex items-center justify-center w-7 h-7">
            <svg className="text-blue-400 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>
        <div className="space-y-1">
          <p className="jersey-20-regular font-bold text-white text-base md:text-2xl">{formattedListedCount}</p>
          <p className="jersey-20-regular text-white/60 text-[11px] md:text-xl">
            Out of {formattedTotalCount}
          </p>
        </div>
      </motion.div>

      {/* Skill NFTs */}
      <motion.div
        className="card-stats min-w-0 px-2 py-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="jersey-15-regular font-semibold text-white text-xs md:text-2xl">Skill NFTs</h3>
          <div className="bg-amber-500/20 rounded-lg flex items-center justify-center w-7 h-7">
            <svg className="text-amber-400 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <div className="space-y-1">
          <p className="jersey-20-regular font-bold text-white text-base md:text-2xl">{skillNFTsCount}</p>
          <p className="jersey-20-regular text-white/60 text-[11px] md:text-xl">
            With special abilities
          </p>
        </div>
      </motion.div>

      {/* Standard NFTs */}
      <motion.div
        className="card-stats min-w-0 px-2 py-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="jersey-15-regular font-semibold text-white text-xs md:text-2xl">Standard NFTs</h3>
          <div className="bg-slate-500/20 rounded-lg flex items-center justify-center w-7 h-7">
            <svg className="text-slate-400 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div className="space-y-1">
          <p className="jersey-20-regular font-bold text-white text-base md:text-2xl">{standardNFTsCount}</p>
          <p className="jersey-20-regular text-white/60 text-[11px] md:text-xl">
            Regular NFTs
          </p>
        </div>
      </motion.div>

      {/* Total Collection */}
      <motion.div
        className="card-stats min-w-0 px-2 py-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="jersey-15-regular font-semibold text-white text-base md:text-2xl">Total Collection</h3>
          <div className="bg-purple-500/20 rounded-lg flex items-center justify-center w-8 h-8">
            <svg className="text-purple-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>
        <div className="space-y-1">
          <p className="jersey-20-regular font-bold text-white text-2xl md:text-3xl">{formattedTotalCount}</p>
          <p className="jersey-20-regular text-white/60 text-xs md:text-xl">
            NFTs in collection
          </p>
        </div>
      </motion.div>
    </div>
  );
});
