import { memo } from 'react';
import { formatEther } from 'viem';
import { formatCurrency } from '../../utils/format';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

interface NFTData {
  tokenId: string;
  price: bigint;
  isForSale: boolean;
}

interface NFTStatsProps {
  nfts: NFTData[];
}

export default memo(function NFTStats({ nfts }: NFTStatsProps) {
  const isMobile = useIsMobile();

  // Calculate total estimated value
  const totalEstimatedValue = nfts.reduce((total, nft) => {
    if (nft.isForSale && nft.price) {
      return total + Number(formatEther(nft.price));
    }
    return total;
  }, 0);

  // Calculate listed for sale count
  const listedForSaleCount = nfts.filter(nft => nft.isForSale).length;
  
  // Calculate total NFTs count
  const totalNFTsCount = nfts.length;

  // Format values
  const formattedTotalValue = formatCurrency(totalEstimatedValue);
  const formattedListedCount = listedForSaleCount.toLocaleString();
  const formattedTotalCount = totalNFTsCount.toLocaleString();
  return (
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-2 grid-rows-2' : 'grid-cols-3'}`}>
      {/* Total Portfolio Value */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/10">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className={`font-semibold text-white ${isMobile ? 'text-sm' : 'text-lg'}`}>Total Portfolio Value</h3>
          <div className={`bg-green-500/20 rounded-lg flex items-center justify-center ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}`}>
            <svg className={`text-green-400 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>
        <div className="space-y-1 md:space-y-2">
          <p className={`font-bold text-white ${isMobile ? 'text-xl' : 'text-3xl'}`}>
            {totalEstimatedValue > 0 ? formattedTotalValue : '$0.00'}
          </p>
          <p className={`text-white/60 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            From {formattedListedCount} listed NFTs
          </p>
        </div>
      </div>

      {/* Listed for Sale */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/10">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className={`font-semibold text-white ${isMobile ? 'text-sm' : 'text-lg'}`}>Listed for Sale</h3>
          <div className={`bg-blue-500/20 rounded-lg flex items-center justify-center ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}`}>
            <svg className={`text-blue-400 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>
        <div className="space-y-1 md:space-y-2">
          <p className={`font-bold text-white ${isMobile ? 'text-xl' : 'text-3xl'}`}>{formattedListedCount}</p>
          <p className={`text-white/60 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            Out of {formattedTotalCount} total NFTs
          </p>
        </div>
      </div>

      {/* Total NFTs - Third card spanning full width on mobile */}
      <div className={`bg-white/5 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/10 ${isMobile ? 'col-span-2' : ''}`}>
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className={`font-semibold text-white ${isMobile ? 'text-sm' : 'text-lg'}`}>Total Collection</h3>
          <div className={`bg-purple-500/20 rounded-lg flex items-center justify-center ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}`}>
            <svg className={`text-purple-400 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>
        <div className="space-y-1 md:space-y-2">
          <p className={`font-bold text-white ${isMobile ? 'text-xl' : 'text-3xl'}`}>{formattedTotalCount}</p>
          <p className={`text-white/60 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            NFTs in your collection
          </p>
        </div>
      </div>
    </div>
  );
});
