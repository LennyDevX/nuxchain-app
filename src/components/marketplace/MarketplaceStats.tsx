import React, { useMemo, useState, memo } from 'react';
import { motion } from 'framer-motion';
import type { MarketplaceStats } from '../../types/marketplace';
import { usePOLPrice } from '../../hooks/coingecko/usePOLPriceContext';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';
import { SkeletonLoader } from '../ui/SkeletonLoader';

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
      <motion.div 
        className="card-stats p-4 space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 30 }}
      >
        <SkeletonLoader width="w-12" height="h-4" rounded="sm" />
        <SkeletonLoader width="w-2/3" height="h-6" rounded="sm" />
        <SkeletonLoader width="w-1/2" height="h-3" rounded="sm" />
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="card-stats group hover:bg-white/8 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 30 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02, y: -4 }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-white/60 text-xs font-medium truncate uppercase tracking-wide">{title}</span>
        <span className="text-xl group-hover:scale-110 transition-transform duration-300">{icon}</span>
      </div>
      
      <div className="mb-2">
        <h3 className="text-2xl font-bold text-white truncate bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h3>
      </div>
      
      {subtitle && (
        <div className="text-white/50 text-sm truncate font-medium">
          {subtitle}
        </div>
      )}
    </motion.div>
  );
}

function MarketplaceStatsComponent({ stats, loading = false, className = '' }: MarketplaceStatsProps) {
  const { convertPOLToUSD, polPrice } = usePOLPrice();
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);
  
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
    const floorPriceUSD = polPrice ? convertPOLToUSD(stats.floorPrice) : '$0.00';
    const totalMarketValueUSD = polPrice ? convertPOLToUSD(stats.totalMarketValue) : '$0.00';
    const averagePriceUSD = polPrice ? convertPOLToUSD(stats.averagePrice) : '$0.00';
    
    return {
      floorPrice: formatPolValue(stats.floorPrice),
      totalMarketValue: formatPolValue(stats.totalMarketValue),
      averagePrice: formatPolValue(stats.averagePrice),
      floorPriceUSD,
      totalMarketValueUSD,
      averagePriceUSD
    };
  }, [stats.floorPrice, stats.totalMarketValue, stats.averagePrice, polPrice, convertPOLToUSD, formatPolValue]);

  // Desktop: Grid 4 columns
  if (!isMobile) {
    return (
      <motion.div 
        className={`grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 30 }}
      >
        <StatCard
          title="Listed NFTs"
          value={stats.totalListedNFTs}
          subtitle="Available for purchase"
          icon="📋"
          loading={loading}
        />
        <StatCard
          title="Floor Price"
          value={`${formattedStats.floorPrice} POL`}
          subtitle={formattedStats.floorPriceUSD}
          icon="💎"
          loading={loading}
        />
        <StatCard
          title="Total Volume"
          value={`${formattedStats.totalMarketValue} POL`}
          subtitle={formattedStats.totalMarketValueUSD}
          icon="📈"
          loading={loading}
        />
        <StatCard
          title="Avg Price"
          value={`${formattedStats.averagePrice} POL`}
          subtitle={formattedStats.averagePriceUSD}
          icon="💰"
          loading={loading}
        />
      </motion.div>
    );
  }

  // Mobile: Dropdown integrated button
  return (
    <motion.div
      className={`space-y-2 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Main card with integrated dropdown button */}
      <motion.div 
        className="card-stats px-4 py-3 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all duration-300"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Left side: Floor Price info */}
        <div className="flex-1 pr-4">
          <p className="text-xs text-white/60 mb-1.5">Floor Price</p>
          <p className="font-bold text-white text-base">
            {loading ? '...' : `${formattedStats.floorPrice} POL`}
          </p>
          <p className="text-xs text-white/50 font-medium">
            {loading ? '...' : formattedStats.floorPriceUSD}
          </p>
        </div>

        {/* Right side: Integrated dropdown button */}
        <motion.div
          className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-2.5 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-300"
          whileHover={{ scale: 1.1 }}
        >
          <motion.svg 
            className="w-5 h-5 text-purple-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </motion.svg>
        </motion.div>
      </motion.div>

      {/* Expanded grid: 2x2 layout */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 30 }}
          className="overflow-hidden"
        >
          <div className="grid grid-cols-2 gap-2">
            {/* Listed NFTs */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.05, type: 'spring', stiffness: 300 }}
            >
              <StatCard
                title="Listed NFTs"
                value={stats.totalListedNFTs}
                subtitle="Available"
                icon="📋"
                loading={loading}
              />
            </motion.div>

            {/* Floor Price (already shown, but included for grid) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1, type: 'spring', stiffness: 300 }}
            >
              <StatCard
                title="Floor Price"
                value={`${formattedStats.floorPrice} POL`}
                subtitle={formattedStats.floorPriceUSD}
                icon="💎"
                loading={loading}
              />
            </motion.div>

            {/* Total Volume */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.15, type: 'spring', stiffness: 300 }}
            >
              <StatCard
                title="Total Volume"
                value={`${formattedStats.totalMarketValue} POL`}
                subtitle={formattedStats.totalMarketValueUSD}
                icon="📈"
                loading={loading}
              />
            </motion.div>

            {/* Avg Price */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2, type: 'spring', stiffness: 300 }}
            >
              <StatCard
                title="Avg Price"
                value={`${formattedStats.averagePrice} POL`}
                subtitle={formattedStats.averagePriceUSD}
                icon="💰"
                loading={loading}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default memo(MarketplaceStatsComponent);