import { memo } from 'react';
import { formatEther } from 'viem';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';
import usePOLPrice from '../../hooks/coingecko/usePOLPrice';

interface NFTData {
  tokenId: string;
  price: bigint;
  isForSale: boolean;
}

interface NFTStatsProps {
  nfts: NFTData[];
  loading?: boolean;
}

function StatCardSkeleton() {
  return (
    <div className="card-stats">
        <div className="flex items-center justify-between mb-2">
          <div className="w-6 h-6 bg-white/10 rounded"></div>
          <div className="w-12 h-3 bg-white/10 rounded"></div>
        </div>
        <div className="w-20 h-6 bg-white/10 rounded mb-1"></div>
        <div className="w-16 h-3 bg-white/10 rounded"></div>
      </div>
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

  // Format values
  const formattedTotalValuePOL = totalEstimatedValuePOL < 0.001 ? '<0.001' : totalEstimatedValuePOL.toFixed(3);
  const formattedTotalValueUSD = polPrice ? convertPOLToUSD(totalEstimatedValuePOL) : 'Loading...';
  const formattedListedCount = listedForSaleCount.toLocaleString();
  const formattedTotalCount = totalNFTsCount.toLocaleString();
  if (loading) {
    return (
      <div className={`grid gap-3 ${isMobile ? 'grid-cols-2 grid-rows-2' : 'grid-cols-3'}`}>
        <StatCardSkeleton />
        <StatCardSkeleton />
        <div className={isMobile ? 'col-span-2' : ''}>
          <StatCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className={`grid gap-3 ${isMobile ? 'grid-cols-2 grid-rows-2' : 'grid-cols-3'}`}>
      {/* Total Portfolio Value */}
      <div className="card-stats">
        <div className={`flex items-center justify-between ${isMobile ? 'mb-3' : 'mb-2'}`}>
          <h3 className={`font-semibold text-white ${isMobile ? 'text-sm' : 'text-base'}`}>Total Portfolio Value</h3>
          <div className={`bg-green-500/20 rounded-lg flex items-center justify-center ${isMobile ? 'w-8 h-8' : 'w-8 h-8'}`}>
            <svg className={`text-green-400 ${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>
        <div className={`space-y-1 ${isMobile ? '' : 'space-y-1'}`}>
          <p className={`font-bold text-white ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {totalEstimatedValuePOL > 0 ? `${formattedTotalValuePOL} POL` : '0 POL'}
          </p>
          <p className={`text-white/50 ${isMobile ? 'text-xs' : 'text-xs'}`}>
            {totalEstimatedValuePOL > 0 ? formattedTotalValueUSD : '$0.00'}
          </p>
          <p className={`text-white/60 ${isMobile ? 'text-xs' : 'text-xs'}`}>
            From {formattedListedCount} listed NFTs
          </p>
        </div>
      </div>

      {/* Listed for Sale */}
      <div className="card-stats">
        <div className={`flex items-center justify-between ${isMobile ? 'mb-3' : 'mb-2'}`}>
          <h3 className={`font-semibold text-white ${isMobile ? 'text-sm' : 'text-base'}`}>Listed for Sale</h3>
          <div className={`bg-blue-500/20 rounded-lg flex items-center justify-center ${isMobile ? 'w-8 h-8' : 'w-8 h-8'}`}>
            <svg className={`text-blue-400 ${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>
        <div className={`space-y-1 ${isMobile ? 'space-y-1' : 'space-y-1'}`}>
          <p className={`font-bold text-white ${isMobile ? 'text-xl' : 'text-2xl'}`}>{formattedListedCount}</p>
          <p className={`text-white/60 ${isMobile ? 'text-xs' : 'text-xs'}`}>
            Out of {formattedTotalCount} total NFTs
          </p>
        </div>
      </div>

      {/* Total NFTs - Third card spanning full width on mobile */}
      <div className={`card-stats ${isMobile ? 'col-span-2' : ''}`}>
  <div className={`flex items-center justify-between ${isMobile ? 'mb-3' : 'mb-2'}`}>
          <h3 className={`font-semibold text-white ${isMobile ? 'text-sm' : 'text-base'}`}>Total Collection</h3>
          <div className={`bg-purple-500/20 rounded-lg flex items-center justify-center ${isMobile ? 'w-8 h-8' : 'w-8 h-8'}`}>
            <svg className={`text-purple-400 ${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>
        <div className={`space-y-1 ${isMobile ? 'space-y-1' : 'space-y-1'}`}>
          <p className={`font-bold text-white ${isMobile ? 'text-xl' : 'text-2xl'}`}>{formattedTotalCount}</p>
          <p className={`text-white/60 ${isMobile ? 'text-xs' : 'text-xs'}`}>
            NFTs in your collection
          </p>
        </div>
      </div>
    </div>
  );
});
