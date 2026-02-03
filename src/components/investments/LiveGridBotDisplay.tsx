/**
 * Live Grid Bot Display Component
 * Real-time Grid Bot visualization with CoinGecko data
 * Optimized for mobile & desktop with smooth animations
 */

import { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GridBotPnLChart from './GridBotPnLChart';
import { useLiveGridBot } from '../../hooks/useLiveGridBot';
import type { GridBotConfig } from './grid-bot-calculator';
import { formatUSDT, formatPercent } from './grid-bot-calculator';

interface LiveGridBotDisplayProps {
  config: GridBotConfig;
}

const LiveGridBotDisplay = memo(({ config }: LiveGridBotDisplayProps) => {
  const { metrics, currentPrice, isLoading, error, lastUpdate } = useLiveGridBot(config);
  const [duration, setDuration] = useState({ days: 0, hours: 0, minutes: 0 });
  const [showOrders, setShowOrders] = useState(false);

  // Calcular duración de manera segura fuera del render
  useEffect(() => {
    const updateDuration = () => {
      const diff = Date.now() - config.createdAt.getTime();
      setDuration({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor(diff / (1000 * 60 * 60)) % 24,
        minutes: Math.floor(diff / (1000 * 60)) % 60
      });
    };

    updateDuration();
    const intervalId = setInterval(updateDuration, 60000); // Actualizar cada minuto
    
    return () => clearInterval(intervalId);
  }, [config.createdAt]);

  if (isLoading && !metrics) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <span className="ml-4 text-gray-400">Loading Grid Bot data...</span>
        </div>
      </motion.div>
    );
  }

  if (error || !metrics) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-br from-red-900/20 to-slate-900/60 backdrop-blur-xl rounded-2xl border border-red-500/20 p-8"
      >
        <div className="text-center py-8">
          <span className="text-4xl mb-4 block">⚠️</span>
          <p className="text-red-400">Unable to load Grid Bot data</p>
          <p className="text-gray-500 text-sm mt-2">{error}</p>
        </div>
      </motion.div>
    );
  }



  const profitColor = metrics.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400';
  const matchedColor = metrics.matchedProfit >= 0 ? 'text-emerald-400' : 'text-red-400';
  const unmatchedColor = metrics.unmatchedPnL >= 0 ? 'text-emerald-400' : 'text-red-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {config.symbol.toUpperCase()}
              <span className="text-purple-400 text-xs lg:text-sm bg-purple-400/10 px-2 py-1 rounded border border-purple-500/30">
                Futures Grid
              </span>
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs lg:text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Active
              </span>
              <span className="opacity-50">•</span>
              <span>Neutral {config.leverage}x</span>
              <span className="opacity-50">•</span>
              <span>{metrics.totalMatchedTrades} Trades</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs lg:text-sm text-gray-500 mb-1">Duration</div>
            <div className="text-lg lg:text-xl font-mono text-white">
              {duration.days}d {duration.hours}h {duration.minutes}m
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Metrics */}
        <div className="space-y-6">
          {/* Total Profit */}
          <div>
            <h3 className="text-gray-400 text-sm font-medium mb-2">Total Profit</h3>
            <div className={`text-3xl font-bold ${profitColor}`}>
              {formatUSDT(metrics.totalProfit)} ({formatPercent(metrics.totalProfitPercent)})
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-gray-400 text-xs mb-1">Invested Margin</div>
              <div className="text-white font-mono text-lg">{formatUSDT(config.initialInvestment)}</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-gray-400 text-xs mb-1">Matched Profit</div>
              <div className={`font-mono text-lg ${matchedColor}`}>
                {formatUSDT(metrics.matchedProfit)} ({formatPercent(metrics.matchedProfitPercent)})
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-gray-400 text-xs mb-1">Unmatched PNL</div>
              <div className={`font-mono text-lg ${unmatchedColor}`}>
                {formatUSDT(metrics.unmatchedPnL)} ({formatPercent(metrics.unmatchedPnLPercent)})
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-gray-400 text-xs mb-1">Funding Fee</div>
              <div className="text-red-400 font-mono text-lg">
                {formatUSDT(metrics.fundingFee)} ({formatPercent((metrics.fundingFee / config.initialInvestment) * 100)})
              </div>
            </div>
          </div>

          {/* Annualized Yield */}
          <div className="bg-gradient-to-r from-emerald-900/20 to-blue-900/20 rounded-lg p-4 border border-emerald-500/20">
            <div className="text-gray-400 text-xs mb-1">Annualized Yield</div>
            <div className="text-emerald-400 text-2xl font-bold">{formatPercent(metrics.annualizedYield)}</div>
          </div>

          {/* Current Price */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-xs mb-1">Last Price</div>
            <div className="text-white text-xl font-mono">{formatUSDT(currentPrice || 0)}</div>
            <div className="text-xs text-gray-500 mt-1">
              Última actualización: {lastUpdate?.toLocaleTimeString() || 'N/A'}
            </div>
          </div>

          {/* Grid Info */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-gray-400">Compra({metrics.buyOrders.length})</span>
              </div>
              <div>
                <span className="text-gray-400">Venta({metrics.sellOrders.length})</span>
              </div>
            </div>
            <div className="text-gray-400">
              {formatUSDT(config.initialInvestment * config.leverage / config.totalGrids)} por orden
            </div>
          </div>
        </div>

        {/* Right Column - PnL Chart */}
        <div>
          <GridBotPnLChart pnlHistory={metrics.pnlHistory} height={400} />
        </div>
      </div>

      {/* Grid Orders Table */}
      <div className="px-6 pb-6">
        <button
          onClick={() => setShowOrders(!showOrders)}
          className="w-full flex items-center justify-between px-6 py-4 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors border border-slate-700/30"
        >
          <h3 className="text-gray-300 font-semibold text-lg">
            Grid Orders ({metrics.buyOrders.length} Buy • {metrics.sellOrders.length} Sell)
          </h3>
          <motion.span
            animate={{ rotate: showOrders ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-gray-400"
          >
            ▼
          </motion.span>
        </button>

        <AnimatePresence>
          {showOrders && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mt-4"
            >
              <div className="bg-slate-800/30 rounded-lg overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                  {/* Buy Orders */}
                  <div>
                    <h4 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                      Buy Orders ({metrics.buyOrders.length})
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                      {metrics.buyOrders.slice(0, 10).map((order) => (
                        <div key={order.id} className="flex justify-between items-center text-sm bg-slate-900/50 p-2 rounded hover:bg-slate-900/70 transition-colors">
                          <span className="text-gray-400">#{order.id}</span>
                          <span className="text-white font-mono">{formatUSDT(order.price)}</span>
                          <span className={order.percentFromCurrent < 0 ? 'text-emerald-400' : 'text-gray-500'}>
                            {formatPercent(order.percentFromCurrent)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sell Orders */}
                  <div>
                    <h4 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                      Sell Orders ({metrics.sellOrders.length})
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                      {metrics.sellOrders.slice(0, 10).map((order) => (
                        <div key={order.id} className="flex justify-between items-center text-sm bg-slate-900/50 p-2 rounded hover:bg-slate-900/70 transition-colors">
                          <span className="text-gray-400">#{order.id}</span>
                          <span className="text-white font-mono">{formatUSDT(order.price)}</span>
                          <span className={order.percentFromCurrent > 0 ? 'text-red-400' : 'text-gray-500'}>
                            {formatPercent(order.percentFromCurrent)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

LiveGridBotDisplay.displayName = 'LiveGridBotDisplay';

export default LiveGridBotDisplay;
