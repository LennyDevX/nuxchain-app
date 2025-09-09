import React from 'react';
import useMarketplace from '../../hooks/nfts/useMarketplace';
import MarketplaceStats from './MarketplaceStats';

interface MarketplaceStatsModuleProps {
  className?: string;
}

const MarketplaceStatsModule: React.FC<MarketplaceStatsModuleProps> = ({ className }) => {
  const { stats, loading, error } = useMarketplace();

  if (error) {
    return (
      <div className={`bg-red-500/10 border border-red-500/20 rounded-xl p-4 ${className}`}>
        <div className="text-red-400 text-sm">
          Error loading marketplace stats: {error}
        </div>
      </div>
    );
  }

  return (
    <MarketplaceStats 
      stats={stats} 
      loading={loading} 
      className={className}
    />
  );
};

export default MarketplaceStatsModule;