import { memo } from 'react';
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

  return (
    <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-5 gap-2'}`}>
      {/* Total Portfolio Value */}
      <motion.div 
        className="card-stats min-w-0 px-3 py-3 md:px-2 md:py-2"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0 }}
        viewport={{ once: true }}
        style={!isMobile ? {minWidth: 0, padding: '12px 10px'} : {}}
      >
        <div className={`flex items-center justify-between ${isMobile ? 'mb-3' : 'mb-1'}`}>
          <h3 className={`font-semibold text-white ${isMobile ? 'text-sm' : 'text-xs md:text-sm'}`}>Total Portfolio Value</h3>
          <div className={`bg-green-500/20 rounded-lg flex items-center justify-center ${isMobile ? 'w-8 h-8' : 'w-7 h-7'}`}>
            <svg className={`text-green-400 ${isMobile ? 'w-4 h-4' : 'w-3.5 h-3.5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>
        <div className={`space-y-1`}>
          <p className={`font-bold text-white ${isMobile ? 'text-lg' : 'text-base md:text-lg'}`}>
            {totalEstimatedValuePOL > 0 ? `${formattedTotalValuePOL} POL` : '0 POL'}
          </p>
          <p className={`text-white/50 ${isMobile ? 'text-xs' : 'text-[11px] md:text-xs'}`}>
            {totalEstimatedValuePOL > 0 ? formattedTotalValueUSD : '$0.00'}
          </p>
          <p className={`text-white/60 ${isMobile ? 'text-xs' : 'text-[11px] md:text-xs'}`}>
            From {formattedListedCount} listed
          </p>
        </div>
      </motion.div>

      {/* Listed for Sale */}
      <motion.div 
        className="card-stats min-w-0 px-3 py-3 md:px-2 md:py-2"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        viewport={{ once: true }}
        style={!isMobile ? {minWidth: 0, padding: '12px 10px'} : {}}
      >
        <div className={`flex items-center justify-between ${isMobile ? 'mb-3' : 'mb-1'}`}>
          <h3 className={`font-semibold text-white ${isMobile ? 'text-sm' : 'text-xs md:text-sm'}`}>Listed for Sale</h3>
          <div className={`bg-blue-500/20 rounded-lg flex items-center justify-center ${isMobile ? 'w-8 h-8' : 'w-7 h-7'}`}>
            <svg className={`text-blue-400 ${isMobile ? 'w-4 h-4' : 'w-3.5 h-3.5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>
        <div className={`space-y-1`}>
          <p className={`font-bold text-white ${isMobile ? 'text-lg' : 'text-base md:text-lg'}`}>{formattedListedCount}</p>
          <p className={`text-white/60 ${isMobile ? 'text-xs' : 'text-[11px] md:text-xs'}`}>
            Out of {formattedTotalCount}
          </p>
        </div>
      </motion.div>

      {/* Skill NFTs - NEW CARD */}
      <motion.div 
        className="card-stats min-w-0 px-3 py-3 md:px-2 md:py-2"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        viewport={{ once: true }}
        style={!isMobile ? {minWidth: 0, padding: '12px 10px'} : {}}
      >
        <div className={`flex items-center justify-between ${isMobile ? 'mb-3' : 'mb-1'}`}>
          <h3 className={`font-semibold text-white ${isMobile ? 'text-sm' : 'text-xs md:text-sm'}`}>Skill NFTs</h3>
          <div className={`bg-amber-500/20 rounded-lg flex items-center justify-center ${isMobile ? 'w-8 h-8' : 'w-7 h-7'}`}>
            <svg className={`text-amber-400 ${isMobile ? 'w-4 h-4' : 'w-3.5 h-3.5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <div className={`space-y-1`}>
          <p className={`font-bold text-white ${isMobile ? 'text-lg' : 'text-base md:text-lg'}`}>{skillNFTsCount}</p>
          <p className={`text-white/60 ${isMobile ? 'text-xs' : 'text-[11px] md:text-xs'}`}>
            With special abilities
          </p>
        </div>
      </motion.div>

      {/* Standard NFTs */}
      <motion.div className="card-stats min-w-0 px-3 py-3 md:px-2 md:py-2" style={!isMobile ? {minWidth: 0, padding: '12px 10px'} : {}} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} viewport={{ once: true }}>
        <div className={`flex items-center justify-between ${isMobile ? 'mb-3' : 'mb-1'}`}>
          <h3 className={`font-semibold text-white ${isMobile ? 'text-sm' : 'text-xs md:text-sm'}`}>Standard NFTs</h3>
          <div className={`bg-slate-500/20 rounded-lg flex items-center justify-center ${isMobile ? 'w-8 h-8' : 'w-7 h-7'}`}>
            <svg className={`text-slate-400 ${isMobile ? 'w-4 h-4' : 'w-3.5 h-3.5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div className={`space-y-1`}>
          <p className={`font-bold text-white ${isMobile ? 'text-lg' : 'text-base md:text-lg'}`}>{standardNFTsCount}</p>
          <p className={`text-white/60 ${isMobile ? 'text-xs' : 'text-[11px] md:text-xs'}`}>
            Regular NFTs
          </p>
        </div>
      </motion.div>

      {/* Total Collection - on mobile spans if needed */}
      <motion.div className={`card-stats ${isMobile ? 'col-span-2' : ''} min-w-0 px-3 py-3 md:px-2 md:py-2`} style={!isMobile ? {minWidth: 0, padding: '12px 10px'} : {}} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} viewport={{ once: true }}>
        <div className={`flex items-center justify-between ${isMobile ? 'mb-3' : 'mb-2'}`}>
          <h3 className={`font-semibold text-white ${isMobile ? 'text-sm' : 'text-base'}`}>Total Collection</h3>
          <div className={`bg-purple-500/20 rounded-lg flex items-center justify-center ${isMobile ? 'w-8 h-8' : 'w-8 h-8'}`}>
            <svg className={`text-purple-400 ${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>
        <div className={`space-y-1 ${isMobile ? 'space-y-1' : 'space-y-1'}`}>
          <p className={`font-bold text-white ${isMobile ? 'text-lg' : 'text-2xl'}`}>{formattedTotalCount}</p>
          <p className={`text-white/60 ${isMobile ? 'text-xs' : 'text-xs'}`}>
            NFTs in collection
          </p>
        </div>
      </motion.div>
    </div>
  );
});
