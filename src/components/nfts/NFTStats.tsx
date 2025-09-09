interface NFTData {
  tokenId: string;
  price: bigint;
  isForSale: boolean;
}

interface NFTStatsProps {
  totalNFTs: number;
  forSaleCount: number;
  loading: boolean;
  nfts: NFTData[];
}

export default function NFTStats({ totalNFTs, forSaleCount, loading, nfts }: NFTStatsProps) {
  // Calculate total estimated value from all NFTs
  const totalEstimatedValue = nfts.reduce((total, nft) => {
    if (nft.isForSale && nft.price) {
      return total + (Number(nft.price) / 1e18);
    }
    return total;
  }, 0);

  const formatValue = (value: number) => {
    if (value === 0) return '0';
    return value >= 1 ? value.toFixed(2) : value.toFixed(6);
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="card-stats">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-xs font-medium truncate">Total NFTs</span>
          <span className="text-lg">📋</span>
        </div>
        <div className="mb-1">
          <h3 className="text-xl font-bold text-white truncate">
            {loading ? '...' : totalNFTs}
          </h3>
        </div>
        <div className="text-white/40 text-xs truncate">
          Owned by you
        </div>
      </div>

      <div className="card-stats">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-xs font-medium truncate">Estimated Value</span>
          <span className="text-lg">💰</span>
        </div>
        <div className="mb-1">
          <h3 className="text-xl font-bold text-white truncate">
            {loading ? '...' : `${formatValue(totalEstimatedValue)} POL`}
          </h3>
        </div>
        <div className="text-white/40 text-xs truncate">
          Total portfolio value
        </div>
      </div>

      <div className="card-stats">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-xs font-medium truncate">Listed for Sale</span>
          <span className="text-lg">🏪</span>
        </div>
        <div className="mb-1">
          <h3 className="text-xl font-bold text-white truncate">
            {loading ? '...' : forSaleCount}
          </h3>
        </div>
        <div className="text-white/40 text-xs truncate">
          Currently on market
        </div>
      </div>
    </div>
  );
}