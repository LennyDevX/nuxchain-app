/**
 * StakingPoolChart - Donut chart showing stake distribution by lockup period
 * Displays: Flexible, 30d, 90d, 180d, 365d staking distribution
 */

import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { motion } from 'framer-motion';
import { formatEther } from 'viem';
import useDepositManagement from '../../hooks/staking/useDepositManagement';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const LOCKUP_COLORS = {
  flexible: '#10b981', // emerald-500
  locked30: '#3b82f6', // blue-500
  locked90: '#6366f1', // indigo-500
  locked180: '#8b5cf6', // violet-500
  locked365: '#f97316', // orange-500
};

const LOCKUP_LABELS = {
  flexible: 'Flexible',
  locked30: '30 Days',
  locked90: '90 Days',
  locked180: '180 Days',
  locked365: '365 Days',
};

export function StakingPoolChart() {
  const { depositsByType, isLoading } = useDepositManagement();

  const chartData = useMemo(() => {
    if (!depositsByType) {
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

    const data = [
      parseFloat(formatEther(depositsByType.flexible.totalAmountRaw)),
      parseFloat(formatEther(depositsByType.locked30.totalAmountRaw)),
      parseFloat(formatEther(depositsByType.locked90.totalAmountRaw)),
      parseFloat(formatEther(depositsByType.locked180.totalAmountRaw)),
      parseFloat(formatEther(depositsByType.locked365.totalAmountRaw)),
    ];

    const labels = [
      LOCKUP_LABELS.flexible,
      LOCKUP_LABELS.locked30,
      LOCKUP_LABELS.locked90,
      LOCKUP_LABELS.locked180,
      LOCKUP_LABELS.locked365,
    ];

    const colors = [
      LOCKUP_COLORS.flexible,
      LOCKUP_COLORS.locked30,
      LOCKUP_COLORS.locked90,
      LOCKUP_COLORS.locked180,
      LOCKUP_COLORS.locked365,
    ];

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
  }, [depositsByType]);

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
            return `${label}: ${value.toFixed(2)} POL (${percentage}%)`;
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

  const totalStaked = useMemo(() => {
    if (!depositsByType) return '0';
    const total = [
      depositsByType.flexible,
      depositsByType.locked30,
      depositsByType.locked90,
      depositsByType.locked180,
      depositsByType.locked365,
    ].reduce((sum, type) => sum + parseFloat(formatEther(type.totalAmountRaw)), 0);
    return total.toFixed(2);
  }, [depositsByType]);

  const totalDeposits = useMemo(() => {
    if (!depositsByType) return 0;
    return [
      depositsByType.flexible,
      depositsByType.locked30,
      depositsByType.locked90,
      depositsByType.locked180,
      depositsByType.locked365,
    ].reduce((sum, type) => sum + type.count, 0);
  }, [depositsByType]);

  if (isLoading) {
    return (
      <motion.div 
        className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6">
          <h3 className="jersey-15-regular text-2xl lg:text-4xl font-bold text-white mb-1">Staking Pool</h3>
          <p className="jersey-20-regular text-base lg:text-lg text-white/60">Distribution by lockup period</p>
        </div>
        <div className="flex flex-col items-center justify-center h-[280px]">
          <div className="w-20 h-20 rounded-full border-4 border-white/10 border-t-emerald-500 animate-spin" />
          <p className="jersey-20-regular text-white/60 text-base lg:text-lg mt-4">Loading staking data...</p>
        </div>
      </motion.div>
    );
  }

  // All deposits are zero (e.g. after emergency withdrawal) — show empty state
  const isPoolEmpty = depositsByType != null && [
    depositsByType.flexible.totalAmountRaw,
    depositsByType.locked30.totalAmountRaw,
    depositsByType.locked90.totalAmountRaw,
    depositsByType.locked180.totalAmountRaw,
    depositsByType.locked365.totalAmountRaw,
  ].every(v => v === 0n);

  // No deposits yet — show empty state instead of infinite spinner
  if (!depositsByType || isPoolEmpty) {
    return (
      <motion.div 
        className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6">
          <h3 className="jersey-15-regular text-2xl lg:text-4xl font-bold text-white mb-1">Staking Pool</h3>
          <p className="jersey-20-regular text-base lg:text-lg text-white/60">Distribution by lockup period</p>
        </div>
        <div className="flex flex-col items-center justify-center h-[280px] gap-3">
          <div className="w-24 h-24 rounded-full border-4 border-dashed border-white/20 flex items-center justify-center">
            <span className="text-3xl">📊</span>
          </div>
          <p className="jersey-15-regular text-white/70 text-lg lg:text-xl font-semibold">No deposits yet</p>
          <p className="jersey-20-regular text-white/40 text-sm lg:text-base text-center max-w-[220px]">
            Stake POL to see your distribution chart
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <div>
            <p className="jersey-20-regular text-sm lg:text-base text-white/60 mb-1">Total Deposits</p>
            <p className="jersey-20-regular text-2xl lg:text-3xl font-semibold text-white">0</p>
          </div>
          <div>
            <p className="jersey-20-regular text-sm lg:text-base text-white/60 mb-1">Total Staked</p>
            <p className="jersey-20-regular text-2xl lg:text-3xl font-semibold text-emerald-400">0.00 POL</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="jersey-15-regular text-2xl lg:text-4xl font-bold text-white mb-1">Staking Pool</h3>
        <p className="jersey-20-regular text-base lg:text-lg text-white/60">Distribution by lockup period</p>
      </div>

      {/* Chart */}
      <div className="mb-6 h-[280px] flex items-center justify-center">
        <Doughnut data={chartData} options={chartOptions} />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
        <div>
          <p className="jersey-20-regular text-sm lg:text-base text-white/60 mb-1">Total Deposits</p>
          <p className="jersey-20-regular text-2xl lg:text-3xl font-semibold text-white">{totalDeposits}</p>
        </div>
        <div>
          <p className="jersey-20-regular text-sm lg:text-base text-white/60 mb-1">Total Staked</p>
          <p className="jersey-20-regular text-2xl lg:text-3xl font-semibold text-emerald-400">{totalStaked} POL</p>
        </div>
      </div>
    </motion.div>
  );
}

export default StakingPoolChart;
