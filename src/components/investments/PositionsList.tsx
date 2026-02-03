/**
 * Positions List Component
 * Muestra la lista de posiciones activas en trading
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import type { InvestmentPosition } from '../../hooks/useInvestments';

interface PositionsListProps {
  positions: InvestmentPosition[];
}

const PositionsList = memo(({ positions }: PositionsListProps) => {
  if (positions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-500/20 p-6"
      >
        <div className="text-center py-8">
          <span className="text-4xl mb-4 block">📭</span>
          <p className="text-gray-400">No hay posiciones activas</p>
        </div>
      </motion.div>
    );
  }

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return price.toFixed(4);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-500/20 p-6"
    >
      <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
        <span className="text-2xl">💼</span>
        Posiciones Activas
        <span className="ml-auto text-sm font-normal text-gray-400">
          {positions.length} {positions.length === 1 ? 'posición' : 'posiciones'}
        </span>
      </h3>

      <div className="space-y-4">
        {positions.map((position, index) => {
          const isProfitable = position.unrealizedPnL >= 0;
          
          return (
            <motion.div
              key={`${position.symbol}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-purple-500/30 transition-colors"
            >
              {/* Position Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {position.side === 'LONG' ? '🟢' : '🔴'}
                  </span>
                  <div>
                    <span className="font-bold text-white text-lg">
                      {position.symbol}
                    </span>
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                      position.side === 'LONG' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {position.side}
                    </span>
                    <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-400">
                      {position.leverage}x
                    </span>
                  </div>
                </div>
                
                {/* PnL */}
                <div className={`text-right ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                  <div className="font-bold">
                    {isProfitable ? '+' : ''}{position.unrealizedPnL.toFixed(2)} USDT
                  </div>
                  <div className="text-sm opacity-80">
                    {isProfitable ? '+' : ''}{position.pnlPercentage.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Position Details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div className="bg-slate-900/50 rounded-lg p-2">
                  <span className="text-gray-400 text-xs block">Entrada</span>
                  <span className="text-white font-medium">${formatPrice(position.entryPrice)}</span>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-2">
                  <span className="text-gray-400 text-xs block">Mark Price</span>
                  <span className="text-white font-medium">${formatPrice(position.markPrice)}</span>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-2 col-span-2 md:col-span-1">
                  <span className="text-gray-400 text-xs block">Tamaño</span>
                  <span className="text-white font-medium">
                    {position.size > 0 ? position.size.toFixed(4) : '***'}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
});

PositionsList.displayName = 'PositionsList';

export default PositionsList;
