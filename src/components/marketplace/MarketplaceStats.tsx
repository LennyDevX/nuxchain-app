import React, { useMemo } from 'react';
import type { MarketplaceStats } from '../../types/marketplace';
import usePOLPrice from '../../hooks/coingecko/usePOLPrice';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

interface MarketplaceStatsProps {
  stats: MarketplaceStats;
  loading?: boolean;
  className?: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  loading?: boolean;
}

function StatCard({ title, value, subtitle, icon, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="card-stats">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 bg-white/10 rounded"></div>
            <div className="w-12 h-3 bg-white/10 rounded"></div>
          </div>
          <div className="w-20 h-6 bg-white/10 rounded mb-1"></div>
          <div className="w-16 h-3 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-stats">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/60 text-xs font-medium truncate">{title}</span>
        <span className="text-lg">{icon}</span>
      </div>
      
      <div className="mb-1">
        <h3 className="text-xl font-bold text-white truncate">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h3>
      </div>
      
      {subtitle && (
        <div className="text-white/40 text-xs truncate">
          {subtitle}
        </div>
      )}
    </div>
  );
}

export default function MarketplaceStats({ stats, loading = false, className = '' }: MarketplaceStatsProps) {
  const { convertPOLToUSD, polPrice } = usePOLPrice();
  const isMobile = useIsMobile();
  
  const formatPolValue = useMemo(() => {
    return (value: number) => {
      if (value === 0) return '0';
      if (value < 0.001) return '<0.001';
      if (value < 1) return value.toFixed(3);
      if (value < 10) return value.toFixed(2);
      return value.toFixed(1);
    };
  }, []);

  const formattedStats = useMemo(() => {
    return {
      floorPrice: formatPolValue(stats.floorPrice),
      totalMarketValue: formatPolValue(stats.totalMarketValue),
      averagePrice: formatPolValue(stats.averagePrice),
      floorPriceUSD: polPrice ? convertPOLToUSD(stats.floorPrice) : 'Loading USD...',
      totalMarketValueUSD: polPrice ? convertPOLToUSD(stats.totalMarketValue) : 'Loading USD...',
      averagePriceUSD: polPrice ? convertPOLToUSD(stats.averagePrice) : 'Loading USD...'
    };
  }, [stats.floorPrice, stats.totalMarketValue, stats.averagePrice, polPrice, convertPOLToUSD, formatPolValue]);

  return (
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'} ${className}`}>
      {/* Listed NFTs */}
      <StatCard
        title="Listed NFTs"
        value={stats.totalListedNFTs}
        subtitle="Available for purchase"
        icon="📋"
        loading={loading}
      />

      {/* Floor Price */}
      <StatCard
        title="Floor Price"
        value={`${formattedStats.floorPrice} POL`}
        subtitle={formattedStats.floorPriceUSD}
        icon="💎"
        loading={loading}
      />

      {/* Total Volume */}
      <StatCard
        title="Total Volume"
        value={`${formattedStats.totalMarketValue} POL`}
        subtitle={formattedStats.totalMarketValueUSD}
        icon="📈"
        loading={loading}
      />

      {/* Avg Price */}
      <StatCard
        title="Avg Price"
        value={`${formattedStats.averagePrice} POL`}
        subtitle={formattedStats.averagePriceUSD}
        icon="💰"
        loading={loading}
      />
    </div>
  );
}