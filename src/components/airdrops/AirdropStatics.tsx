import React, { useMemo } from 'react';
import { useAirdrops } from '../../hooks/airdrops/index.tsx';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, trend, trendValue, loading }) => {
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

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-white/60';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <span className="text-xs">↗</span>;
      case 'down':
        return <span className="text-xs">↘</span>;
      default:
        return null;
    }
  };

  return (
    <div className="card-stats">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/60 text-xs font-medium truncate">{title}</span>
        <div className="flex items-center space-x-1">
          <span className="text-lg">{icon}</span>
          {trend && trendValue && (
            <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-xs font-medium">{trendValue}</span>
            </div>
          )}
        </div>
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
};

const AirdropStatics: React.FC = React.memo(() => {
  const { airdrops, globalStats, loading, error } = useAirdrops();

  // Memoize stats calculation to prevent unnecessary recalculations
  const stats = useMemo(() => ({
    totalAirdrops: globalStats.totalAirdrops,
    uniqueUsers: globalStats.totalRegisteredUsers,
    totalPOLDistributed: globalStats.totalClaimedUsers * 100, // Assuming 100 POL per user
  }), [globalStats]);

  // Memoize stats data to prevent unnecessary re-renders
  const statsData = useMemo(() => [
    {
      title: 'Active Airdrops',
      value: stats.totalAirdrops,
      subtitle: 'Currently running',
      icon: '🎯',
      trend: 'neutral' as const
    },
    {
      title: 'Unique Users',
      value: stats.uniqueUsers,
      subtitle: 'Total registered',
      icon: '👥',
      trend: 'up' as const,
      trendValue: '+12%'
    },
    {
      title: 'POL Distributed',
      value: `${stats.totalPOLDistributed.toLocaleString()} POL`,
      subtitle: 'Total claimed rewards',
      icon: '💰',
      trend: 'up' as const,
      trendValue: '+8%'
    }
  ], [stats]);

  if (error) {
    const errorMessage = typeof error === 'string' ? error : error?.message || 'Unknown error occurred';
    const isContractNotConfigured = errorMessage.includes('0x0000000000000000000000000000000000000000');
    
    return (
      <div className="text-center py-8">
        <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4">
          <p className="text-yellow-400 font-medium mb-2">
            {isContractNotConfigured ? '⚠️ Airdrop Factory Not Configured' : '❌ Error Loading Statistics'}
          </p>
          <p className="text-yellow-300 text-sm">
            {isContractNotConfigured 
              ? 'The airdrop factory contract address is not configured. Please contact the administrator to set up the contract address.'
              : `Error: ${errorMessage}`
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          icon={stat.icon}
          trend={stat.trend}
          trendValue={stat.trendValue}
          loading={loading}
        />
      ))}
    </div>
  );
});

export default AirdropStatics;