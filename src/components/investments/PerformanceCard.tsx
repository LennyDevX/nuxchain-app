/**
 * Investment Performance Card Component
 * Muestra las métricas principales de rendimiento
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import type { InvestmentPerformance } from '../../hooks/useInvestments';

interface PerformanceCardProps {
  performance: InvestmentPerformance;
  lastUpdate: string;
}

const PerformanceCard = memo(({ performance, lastUpdate }: PerformanceCardProps) => {
  const isProfitable = performance.totalPnL >= 0;

  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    }
    if (absValue >= 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    }
    return value.toFixed(2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-purple-900/40 to-slate-900/60 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6 shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Rendimiento General
        </h3>
        <span className="text-xs text-gray-400">
          Actualizado: {formatDate(lastUpdate)}
        </span>
      </div>

      {/* Main PnL Display */}
      <div className="text-center mb-8">
        <div className={`flex items-center justify-center gap-2 ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
          <span className="text-3xl">{isProfitable ? '📈' : '📉'}</span>
          <span className="text-4xl font-bold">
            {isProfitable ? '+' : ''}{formatCurrency(performance.totalPnL)} USDT
          </span>
        </div>
        <div className={`mt-2 text-lg ${isProfitable ? 'text-green-400/80' : 'text-red-400/80'}`}>
          {isProfitable ? '+' : ''}{performance.pnlPercentage.toFixed(2)}%
        </div>
        <p className="text-gray-400 text-sm mt-1">
          Ganancia/Pérdida No Realizada
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-blue-400 mb-2">
            <span className="text-xl">💰</span>
            <span className="text-sm font-medium">Posiciones</span>
          </div>
          <span className="text-2xl font-bold text-white">
            {performance.activePositions}
          </span>
          <p className="text-xs text-gray-400 mt-1">Activas</p>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-amber-400 mb-2">
            <span className="text-xl">🤖</span>
            <span className="text-sm font-medium">Grid Bots</span>
          </div>
          <span className="text-2xl font-bold text-white">
            {performance.activeGridBots}
          </span>
          <p className="text-xs text-gray-400 mt-1">Ejecutándose</p>
        </div>
      </div>

      {/* Trust Badge */}
      <div className="mt-6 pt-4 border-t border-purple-500/20">
        <div className="flex items-center justify-center gap-2 text-gray-300">
          <span className="text-lg">✅</span>
          <span className="text-sm">
            Datos sincronizados con bot de futuros
          </span>
        </div>
      </div>
    </motion.div>
  );
});

PerformanceCard.displayName = 'PerformanceCard';

export default PerformanceCard;
