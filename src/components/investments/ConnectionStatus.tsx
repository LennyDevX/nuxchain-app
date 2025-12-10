/**
 * Connection Status Component
 * Muestra el estado de las conexiones (WebSocket y API)
 * Útil para debugging y transparencia con el usuario
 */

import { memo } from 'react';
import { motion } from 'framer-motion';

interface ConnectionStatusProps {
  isWebSocketConnected: boolean;
  dataSource: 'websocket' | 'binance' | 'coingecko' | 'fallback';
  lastUpdate: Date | null;
  compact?: boolean;
}

const ConnectionStatus = memo(({ 
  isWebSocketConnected, 
  dataSource, 
  lastUpdate,
  compact = false 
}: ConnectionStatusProps) => {
  
  const getSourceInfo = () => {
    switch (dataSource) {
      case 'websocket':
        return {
          label: 'WebSocket Live',
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/30',
          icon: '⚡'
        };
      case 'binance':
        return {
          label: 'Binance API',
          color: 'text-amber-400',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/30',
          icon: '🔄'
        };
      case 'coingecko':
        return {
          label: 'CoinGecko API',
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
          icon: '📡'
        };
      default:
        return {
          label: 'Simulation Mode',
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/30',
          icon: '🔧'
        };
    }
  };

  const sourceInfo = getSourceInfo();

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md ${sourceInfo.bgColor} ${sourceInfo.color}`}>
          <span className={isWebSocketConnected ? 'animate-pulse' : ''}>{sourceInfo.icon}</span>
          <span className="font-medium">{sourceInfo.label}</span>
        </div>
        {lastUpdate && (
          <span className="text-xs text-gray-500">
            {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center justify-between px-4 py-3 rounded-lg border ${sourceInfo.borderColor} ${sourceInfo.bgColor} backdrop-blur-sm`}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className={`text-lg ${isWebSocketConnected ? 'animate-pulse' : ''}`}>
            {sourceInfo.icon}
          </span>
          <div>
            <div className={`text-sm font-medium ${sourceInfo.color}`}>
              {sourceInfo.label}
            </div>
            <div className="text-xs text-gray-500">
              {isWebSocketConnected ? 'Real-time updates' : 'Polling updates'}
            </div>
          </div>
        </div>
      </div>

      {lastUpdate && (
        <div className="text-right">
          <div className="text-xs text-gray-500">Last update</div>
          <div className="text-xs text-gray-400 font-mono">
            {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      )}
    </motion.div>
  );
});

ConnectionStatus.displayName = 'ConnectionStatus';

export default ConnectionStatus;
