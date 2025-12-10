/**
 * Market Overview Component - Unified
 * Funciona en local y producción con el mismo código
 * ✨ Top Gainers | ❌ Top Losers | 💎 Trending Coins
 */

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../../hooks/mobile/useReducedMotion';
import { useMarketOverview, type CoinData } from '../../hooks/useMarketData';

const MarketOverview = memo(() => {
  const { data, loading, error, refetch } = useMarketOverview(6);
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 lg:py-20">
        <div className="relative">
          <div className="w-16 h-16 lg:w-20 lg:h-20 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-16 h-16 lg:w-20 lg:h-20 border-4 border-pink-500/20 border-b-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        <p className="mt-6 text-gray-400 text-sm lg:text-base animate-pulse">Loading market data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12 lg:py-16 rounded-2xl lg:rounded-3xl border border-red-500/20 bg-black/40 backdrop-blur-xl p-6 lg:p-8">
        <span className="text-5xl lg:text-6xl mb-4 block">⚠️</span>
        <p className="text-red-400 text-lg lg:text-xl font-medium">Unable to load market data</p>
        <p className="text-gray-500 text-sm lg:text-base mt-2">{error || 'Unknown error'}</p>
        <button
          onClick={() => refetch()}
          className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const { gainers, losers, trending } = data;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6"
    >
      {/* Top Gainers */}
      <motion.div
        variants={cardVariants}
        className="relative overflow-hidden rounded-xl lg:rounded-2xl bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-500/20 backdrop-blur-xl p-5 lg:p-6"
      >
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <h3 className="text-lg lg:text-xl font-bold text-white flex items-center gap-2">
            <span className="text-xl lg:text-2xl">🟢</span>
            Top Gainers
          </h3>
          <span className="text-xs text-emerald-400 font-mono">24h</span>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {gainers.map((coin, index) => (
              <CoinRow key={coin.id} coin={coin} type="gainer" delay={index * 0.05} />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Top Losers */}
      <motion.div
        variants={cardVariants}
        className="relative overflow-hidden rounded-xl lg:rounded-2xl bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/20 backdrop-blur-xl p-5 lg:p-6"
      >
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <h3 className="text-lg lg:text-xl font-bold text-white flex items-center gap-2">
            <span className="text-xl lg:text-2xl">🔴</span>
            Top Losers
          </h3>
          <span className="text-xs text-red-400 font-mono">24h</span>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {losers.map((coin, index) => (
              <CoinRow key={coin.id} coin={coin} type="loser" delay={index * 0.05} />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Trending */}
      <motion.div
        variants={cardVariants}
        className="relative overflow-hidden rounded-xl lg:rounded-2xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/20 backdrop-blur-xl p-5 lg:p-6"
      >
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <h3 className="text-lg lg:text-xl font-bold text-white flex items-center gap-2">
            <span className="text-xl lg:text-2xl">💎</span>
            Trending
          </h3>
          <span className="text-xs text-purple-400 font-mono">Volume</span>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {trending.map((coin, index) => (
              <CoinRow key={coin.id} coin={coin} type="trending" delay={index * 0.05} />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
});

// Coin Row Component
interface CoinRowProps {
  coin: CoinData;
  type: 'gainer' | 'loser' | 'trending';
  delay?: number;
}

const CoinRow = memo(({ coin, type, delay = 0 }: CoinRowProps) => {
  const isProfitable = coin.price_change_percentage_24h >= 0;
  const changeColor = isProfitable ? 'text-emerald-400' : 'text-red-400';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ delay, duration: 0.3 }}
      className="group bg-black/20 hover:bg-black/40 rounded-lg p-3 flex items-center gap-3 transition-all duration-300 cursor-pointer border border-transparent hover:border-purple-500/30"
    >
      {/* Coin Image */}
      <img
        src={coin.image}
        alt={coin.name}
        className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-slate-700"
        loading="lazy"
      />

      {/* Coin Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-white text-sm lg:text-base truncate">{coin.symbol.toUpperCase()}</p>
          <p className="text-gray-500 text-xs truncate">{coin.name}</p>
        </div>
        <p className="text-gray-400 text-xs lg:text-sm font-mono">
          ${coin.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
        </p>
      </div>

      {/* Change */}
      <div className="text-right">
        <p className={`font-bold text-sm lg:text-base ${changeColor} flex items-center gap-1`}>
          {isProfitable ? '▲' : '▼'} {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
        </p>
        {type === 'trending' && (
          <p className="text-gray-500 text-xs">
            ${(coin.total_volume / 1000000).toFixed(1)}M
          </p>
        )}
      </div>
    </motion.div>
  );
});

CoinRow.displayName = 'CoinRow';
MarketOverview.displayName = 'MarketOverview';

export default MarketOverview;
