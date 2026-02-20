/**
 * TreasuryPoolChart - Donut chart showing treasury fund distribution
 * Displays: Reserve, Development, Marketing, Operations allocation
 */

import { useMemo, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { motion } from 'framer-motion';
import useTreasuryStats from '../../hooks/treasury/useTreasuryStats';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const ALLOCATION_COLORS: Record<string, string> = {
  'Rewards Pool': '#10b981',    // emerald-500
  'Staking': '#8b5cf6',          // violet-500
  'Marketplace': '#3b82f6',      // blue-500
  'Development': '#f97316',      // orange-500
  'Collaborators': '#ec4899',    // pink-500
};

export function TreasuryPoolChart() {
  const { allocations, reserve, stats, isLoading } = useTreasuryStats();

  // Debug log treasury data
  useEffect(() => {
    if (allocations || reserve || stats) {
      console.log('[TreasuryPoolChart] Treasury Data:', {
        allocations,
        reserve,
        stats,
        isLoading,
      });
    }
  }, [allocations, reserve, stats, isLoading]);

  const chartData = useMemo(() => {
    if (!allocations || !allocations.items || allocations.items.length === 0) {
      return {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 2,
        }],
      };
    }

    const labels = allocations.items.map(item => item.name);
    const data = allocations.items.map(item => item.percentage);
    const colors = allocations.items.map(item => ALLOCATION_COLORS[item.name] || '#6b7280');

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.map(color => `${color}80`), // 50% opacity
        borderColor: colors,
        borderWidth: 2,
        hoverBackgroundColor: colors,
        hoverBorderWidth: 3,
      }],
    };
  }, [allocations]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#ffffff',
          padding: 16,
          font: {
            size: 13,
            family: 'Inter, system-ui, sans-serif',
            weight: 500 as const,
          },
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 12,
          boxHeight: 12,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context: { label?: string; parsed: number; dataset: { data: number[] } }) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${label}: ${value} allocation (${percentage}%)`;
          }
        }
      },
    },
    cutout: '65%',
    animation: {
      animateRotate: true,
      animateScale: true,
    },
  }), []);

  if (isLoading) {
    return (
      <motion.div 
        className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex flex-col items-center justify-center h-[320px]">
          <div className="w-48 h-48 rounded-full border-4 border-white/10 border-t-violet-500 animate-spin" />
          <p className="jersey-20-regular text-white/60 text-sm lg:text-base mt-4">Loading treasury data...</p>
        </div>
      </motion.div>
    );
  }

  if (!allocations || !allocations.items || allocations.items.length === 0) {
    return (
      <motion.div 
        className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex flex-col items-center justify-center h-[320px]">
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <p className="jersey-15-regular text-white/80 text-base lg:text-lg font-semibold mb-2">Treasury Not Deployed</p>
          <p className="jersey-20-regular text-white/60 text-sm lg:text-base text-center max-w-xs">
            The Treasury Manager contract is not configured or deployed on this network.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="jersey-15-regular text-xl lg:text-3xl font-bold text-white mb-1">Treasury Pool</h3>
        <p className="jersey-20-regular text-sm lg:text-base text-white/60">Fund allocation distribution</p>
      </div>

      {/* Chart */}
      <div className="mb-6 h-[280px] flex items-center justify-center">
        <Doughnut data={chartData} options={chartOptions} />
      </div>

      {/* Summary */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="jersey-20-regular text-sm lg:text-base text-white/60 mb-1">Treasury Balance</p>
            <p className="jersey-20-regular text-2xl lg:text-3xl font-bold text-white">
              {stats?.currentBalance || '0.00'} POL
            </p>
          </div>
          <div className="text-right">
            <p className="jersey-20-regular text-xs lg:text-sm text-white/40">
              {stats?.autoDistEnabled ? 'Auto-distribution enabled' : 'Manual distribution'}
            </p>
            <p className="jersey-20-regular text-xs lg:text-sm text-white/40 mt-1">
              Weekly cycle (7 days)
            </p>
          </div>
        </div>
      </div>

      {/* Allocation breakdown */}
      {allocations && allocations.items && allocations.items.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
          {allocations.items.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="jersey-20-regular text-sm lg:text-base">{item.emoji}</span>
                <span className="jersey-20-regular text-sm lg:text-base text-white/80">{item.name}</span>
              </div>
              <span className="jersey-20-regular text-sm lg:text-base font-medium text-white">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default TreasuryPoolChart;
